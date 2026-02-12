// ========================================
// GLOBAL STATE & CONFIGURATION
// ========================================

let currentZoom = 1;
let currentMindMapData = null;
let focusedNode = null;

// Backend API endpoint (configure this to your backend URL)
const BACKEND_API = 'http://localhost:3000/api';

// ========================================
// THEME SYSTEM
// ========================================

function initTheme() {
    const savedTheme = localStorage.getItem('studymapper-theme') || 'dark-neon';
    applyTheme(savedTheme);
}

function toggleThemeDropdown() {
    const dropdown = document.getElementById('themeDropdown');
    dropdown.classList.toggle('active');
    document.addEventListener('click', closeThemeDropdownOutside);
}

function closeThemeDropdownOutside(e) {
    const dropdown = document.getElementById('themeDropdown');
    const themeBtn = e.target.closest('.theme-selector-wrapper');
    
    if (!themeBtn && dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeThemeDropdownOutside);
    }
}

function changeTheme(themeName) {
    applyTheme(themeName);
    localStorage.setItem('studymapper-theme', themeName);
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === themeName) {
            option.classList.add('active');
        }
    });
    
    document.getElementById('themeDropdown').classList.remove('active');
}

function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === themeName) {
            option.classList.add('active');
        }
    });
}

// ========================================
// FILE UPLOAD SYSTEM
// ========================================

function initFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragging');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragging');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragging');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    const uploadStatus = document.getElementById('uploadStatus');
    const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
        uploadStatus.textContent = '❌ Invalid file type';
        uploadStatus.style.color = 'var(--accent-secondary)';
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        uploadStatus.textContent = '❌ File too large (max 10MB)';
        uploadStatus.style.color = 'var(--accent-secondary)';
        return;
    }
    
    uploadStatus.textContent = `📤 Uploading ${file.name}...`;
    uploadStatus.style.color = 'var(--accent-primary)';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contextType', document.getElementById('contextType').value);
        
        console.log('🚀 Uploading to backend...');
        
        const response = await fetch(`${BACKEND_API}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        console.log('✅ Backend response:', data);
        
        uploadStatus.textContent = `✅ ${file.name} uploaded successfully!`;
        uploadStatus.style.color = 'var(--accent-primary)';
        
        setTimeout(() => {
            generateMindMapFromBackend(data);
        }, 500);
        
    } catch (error) {
        console.error('Upload error:', error);
        uploadStatus.textContent = '❌ Upload failed - using demo mode';
        uploadStatus.style.color = 'var(--accent-secondary)';
        
        setTimeout(() => {
            generateMindMap();
        }, 1500);
    }
}

// ========================================
// MIND MAP GENERATION
// ========================================

async function generateMindMap() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const userInput = document.getElementById('userInput').value.trim();
    const contextType = document.getElementById('contextType').value;
    const generateBtn = document.getElementById('generateBtn');
    const canvas = document.getElementById('mindmapCanvas');

    if (!userInput) {
        alert('Please paste your notes or upload a file first!');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-text">Creating...</span><span class="btn-icon">⏳</span>';
    canvas.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Creating mind map...</div></div>';

    try {
        let mindmapData;

        if (!apiKey) {
            mindmapData = generateDemoMindMap(userInput, contextType);
        } else {
            const prompt = `Create a mind map for: "${userInput}". Return JSON with centralIdea and branches array.`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const responseText = data.content.find(item => item.type === 'text')?.text || '';
            
            let jsonText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
            }
            
            mindmapData = JSON.parse(jsonText);
        }

        if (!mindmapData.centralIdea || !Array.isArray(mindmapData.branches)) {
            throw new Error('Invalid mind map structure');
        }

        currentMindMapData = mindmapData;
        renderMindMap(mindmapData);
        
    } catch (error) {
        console.error('Generation error:', error);
        canvas.innerHTML = `
            <div class="placeholder">
                <div style="color: #ec4899; font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <div class="placeholder-text">${error.message}</div>
            </div>`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-text">Generate My Mind Map</span><span class="btn-icon">🚀</span>';
    }
}

async function generateMindMapFromBackend(backendData) {
    console.log('📥 Backend data received:', backendData);
    
    const canvas = document.getElementById('mindmapCanvas');
    const generateBtn = document.getElementById('generateBtn');
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-text">Processing...</span><span class="btn-icon">⏳</span>';
    canvas.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Creating mind map...</div></div>';
    
    try {
        if (!backendData || !backendData.centralIdea) {
            throw new Error('Invalid backend data - missing centralIdea');
        }
        
        if (!Array.isArray(backendData.branches) || backendData.branches.length === 0) {
            throw new Error('Invalid backend data - no branches');
        }
        
        console.log('✅ Data valid, rendering...');
        currentMindMapData = backendData;
        renderMindMap(backendData);
        console.log('✅ Render complete!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        canvas.innerHTML = `
            <div class="placeholder">
                <div style="color: #ec4899; font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <div class="placeholder-text">Error: ${error.message}</div>
                <div class="placeholder-subtext">Check console for details</div>
            </div>`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-text">Generate My Mind Map</span><span class="btn-icon">🚀</span>';
    }
}

function generateDemoMindMap(userInput, contextType) {
    const words = userInput.split(/[\s,]+/).filter(w => w.length > 3);
    const mainTopic = words.length > 0 ? words.slice(0, 3).join(' ') : 'Study Topic';
    
    const templates = {
        personal: {
            branches: [
                { 
                    title: 'Key Ideas',
                    explanation: 'Main concepts',
                    keyPoints: ['Point 1', 'Point 2', 'Point 3'],
                    example: 'Example',
                    subBranches: ['Detail A', 'Detail B']
                },
                { 
                    title: 'Important Facts',
                    explanation: 'Key information',
                    keyPoints: ['Fact 1', 'Fact 2'],
                    example: 'Example',
                    subBranches: ['Sub 1', 'Sub 2']
                }
            ]
        }
    };

    return {
        centralIdea: mainTopic,
        branches: templates[contextType]?.branches || templates.personal.branches
    };
}

// ========================================
// MIND MAP RENDERING
// ========================================

function renderMindMap(data) {
    console.log('🎨 Rendering mind map...', data);
    
    const canvas = document.getElementById('mindmapCanvas');
    canvas.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.appendChild(svg);

    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;

    console.log(`Canvas size: ${canvas.offsetWidth} x ${canvas.offsetHeight}`);

    // Central node
    const central = createNode({
        text: data.centralIdea,
        x: centerX - 50,
        y: centerY - 50,
        className: 'node node-center animate-in',
        zIndex: 10,
        data: {
            explanation: `Central topic: ${data.centralIdea}`,
            keyPoints: ['Main focus'],
            example: 'Starting point'
        }
    });
    canvas.appendChild(central);

    const branches = data.branches;
    const numBranches = branches.length;
    const radius = 180;

    branches.forEach((branch, index) => {
        setTimeout(() => {
            const angle = (index * 360 / numBranches) * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            drawConnection(svg, centerX, centerY, x, y);

            const branchNode = createNode({
                text: branch.title,
                x: x - 42.5,
                y: y - 42.5,
                className: `node node-branch node-branch-${index % 6} animate-in`,
                zIndex: 5,
                animationDelay: (index * 0.05) + 's',
                data: {
                    explanation: branch.explanation || `About ${branch.title}`,
                    keyPoints: branch.keyPoints || ['Key point'],
                    example: branch.example || 'Example'
                }
            });
            canvas.appendChild(branchNode);

            // Sub-branches
            if (branch.subBranches && branch.subBranches.length > 0) {
                const subRadius = 90;
                const numSubs = branch.subBranches.length;

                branch.subBranches.forEach((sub, subIndex) => {
                    setTimeout(() => {
                        const subAngle = angle + ((subIndex - (numSubs - 1) / 2) * 0.4);
                        const subX = x + subRadius * Math.cos(subAngle);
                        const subY = y + subRadius * Math.sin(subAngle);

                        drawConnection(svg, x, y, subX, subY);

                        const subText = typeof sub === 'string' ? sub : sub.title;
                        const subData = typeof sub === 'string' ? {
                            explanation: `Detail about ${sub}`,
                            keyPoints: ['Supporting detail'],
                            example: 'Example'
                        } : {
                            explanation: sub.explanation || `About ${sub.title}`,
                            keyPoints: sub.keyPoints || ['Detail'],
                            example: sub.example || 'Example'
                        };

                        const subNode = createNode({
                            text: subText,
                            x: subX - 35,
                            y: subY - 35,
                            className: `node node-sub node-branch-${index % 6} animate-in`,
                            zIndex: 3,
                            animationDelay: ((index * 0.05) + (subIndex * 0.03)) + 's',
                            data: subData
                        });
                        canvas.appendChild(subNode);
                    }, subIndex * 100);
                });
            }
        }, index * 150);
    });
    
    console.log('✅ Mind map rendered successfully!');
}

function createNode({ text, x, y, className, zIndex, animationDelay, data }) {
    const node = document.createElement('div');
    node.className = className;
    node.textContent = text;
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.zIndex = zIndex;
    if (animationDelay) node.style.animationDelay = animationDelay;
    
    node.dataset.nodeData = JSON.stringify(data);
    
    node.addEventListener('click', (e) => {
        e.stopPropagation();
        showLearningPopup(text, data);
        focusNode(node);
    });
    
    return node;
}

function drawConnection(svg, x1, y1, x2, y2) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const controlX = (x1 + x2) / 2;
    const controlY = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'connection connection-line');
    svg.appendChild(path);
}

// ========================================
// POPUP & CONTROLS
// ========================================

function showLearningPopup(title, data) {
    const popup = document.getElementById('learningPopup');
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupExplanation').textContent = data.explanation || 'Learn more';
    
    const pointsList = document.getElementById('popupKeyPoints');
    pointsList.innerHTML = '';
    (data.keyPoints || []).forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        pointsList.appendChild(li);
    });
    
    const exampleSection = document.getElementById('popupExampleSection');
    if (data.example) {
        document.getElementById('popupExample').textContent = data.example;
        exampleSection.style.display = 'block';
    } else {
        exampleSection.style.display = 'none';
    }
    
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    document.getElementById('learningPopup').classList.remove('active');
    document.body.style.overflow = '';
    
    if (focusedNode) {
        focusedNode.classList.remove('focused');
        document.querySelectorAll('.node').forEach(node => {
            node.classList.remove('dimmed');
        });
        focusedNode = null;
    }
}

function focusNode(node) {
    if (focusedNode) {
        focusedNode.classList.remove('focused');
    }
    
    document.querySelectorAll('.node').forEach(n => {
        n.classList.add('dimmed');
    });
    
    node.classList.remove('dimmed');
    node.classList.add('focused');
    focusedNode = node;
}

async function expandConcept() {
    alert('Add API key to use AI expansion');
}

function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.1, 2);
    document.documentElement.style.setProperty('--zoom-level', currentZoom);
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.1, 0.5);
    document.documentElement.style.setProperty('--zoom-level', currentZoom);
}

function downloadMindMap() {
    alert('Press Ctrl+P to save as PDF');
    window.print();
}

function resetCanvas() {
    if (confirm('Reset mind map?')) {
        document.getElementById('mindmapCanvas').innerHTML = `
            <div class="placeholder">
                <div class="placeholder-icon">✏️</div>
                <div class="placeholder-text">Upload file or paste notes</div>
            </div>`;
        document.getElementById('userInput').value = '';
        document.getElementById('uploadStatus').textContent = '';
    }
}

function scrollToGenerator() {
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFileUpload();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
});