# 🔗 StudyMapper Integration Guide

Step-by-step guide to integrate all features into your existing StudyMapper or build from scratch.

---

## 📚 Table of Contents

1. [Quick Integration](#quick-integration)
2. [Feature-by-Feature Integration](#feature-by-feature-integration)
3. [Testing Each Feature](#testing-each-feature)
4. [Customization Guide](#customization-guide)
5. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Integration

### If You Have My Original HTML File

**Replace these files:**
```bash
# Backup your current files first
cp index.html index.html.backup
cp styles.css styles.css.backup
cp script.js script.js.backup

# Copy new enhanced files
cp new-index.html index.html
cp new-styles.css styles.css
cp new-script.js script.js
```

**Add backend:**
```bash
# Create backend directory
mkdir backend
cd backend

# Copy backend files
cp new-server.js server.js
cp new-package.json package.json

# Install dependencies
npm install

# Start backend
npm start
```

**Done!** Open `index.html` in your browser.

---

## 🎯 Feature-by-Feature Integration

### Feature 1: Multi-Theme System

#### Step 1: Add Theme CSS Variables

**In your `<style>` or CSS file, ADD:**

```css
/* Theme System - Add at the top of your CSS */
:root {
    --transition-speed: 0.3s;
}

/* Theme 1: Dark Neon */
body[data-theme="dark-neon"] {
    --bg-primary: #0f1419;
    --bg-secondary: #1a202c;
    --text-primary: #f7fafc;
    --accent-primary: #7c3aed;
    /* ... add all variables from styles.css */
}

/* Theme 2: Light Minimal */
body[data-theme="light-minimal"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    /* ... add all variables */
}

/* Repeat for all 6 themes */
```

#### Step 2: Replace Hard-Coded Colors

**Find and replace in your CSS:**
```css
/* OLD */
background: #1a202c;
color: #f7fafc;

/* NEW */
background: var(--bg-secondary);
color: var(--text-primary);
```

#### Step 3: Add Theme Selector UI

**In your HTML header, REPLACE the theme toggle with:**

```html
<div class="theme-selector-wrapper">
    <button class="btn-icon" onclick="toggleThemeDropdown()" title="Change Theme">
        🎨
    </button>
    <div class="theme-dropdown" id="themeDropdown">
        <div class="theme-option" data-theme="dark-neon" onclick="changeTheme('dark-neon')">
            <div class="theme-preview theme-preview-dark-neon"></div>
            <span>Dark Neon</span>
        </div>
        <!-- Add other theme options -->
    </div>
</div>
```

#### Step 4: Add JavaScript Functions

**In your script.js, ADD:**

```javascript
function initTheme() {
    const savedTheme = localStorage.getItem('studymapper-theme') || 'dark-neon';
    applyTheme(savedTheme);
}

function toggleThemeDropdown() {
    const dropdown = document.getElementById('themeDropdown');
    dropdown.classList.toggle('active');
}

function changeTheme(themeName) {
    applyTheme(themeName);
    localStorage.setItem('studymapper-theme', themeName);
    document.getElementById('themeDropdown').classList.remove('active');
}

function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    // Update active state in dropdown
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === themeName);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initTheme);
```

**✅ Test:** Click the theme button and try switching themes.

---

### Feature 2: File Upload System

#### Step 1: Update HTML Upload Section

**REPLACE your upload zone with:**

```html
<div class="form-group">
    <label class="form-label">📁 Upload Document</label>
    <div class="upload-zone" id="uploadZone">
        <div class="upload-icon">📄</div>
        <div class="upload-text">Click to upload or drag & drop</div>
        <div class="upload-formats">PDF, DOCX, PPTX, TXT</div>
        <div class="upload-status" id="uploadStatus"></div>
    </div>
    <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" style="display: none;">
</div>
```

#### Step 2: Add JavaScript Upload Handlers

**In script.js, ADD:**

```javascript
function initFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    // Click to upload
    uploadZone.addEventListener('click', () => fileInput.click());
    
    // File selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
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
        if (files.length > 0) handleFile(files[0]);
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

async function handleFile(file) {
    const uploadStatus = document.getElementById('uploadStatus');
    const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    // Validate
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
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contextType', document.getElementById('contextType').value);
        
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        uploadStatus.textContent = `✅ ${file.name} uploaded!`;
        
        // Auto-generate mind map
        setTimeout(() => generateMindMapFromBackend(data), 500);
        
    } catch (error) {
        console.error('Upload error:', error);
        uploadStatus.textContent = '❌ Upload failed - using demo mode';
        setTimeout(() => generateMindMap(), 1500);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initFileUpload);
```

#### Step 3: Set Up Backend

**Create `backend/server.js` with the full server code provided.**

**Start backend:**
```bash
cd backend
npm install
npm start
```

**✅ Test:** Try uploading a PDF file.

---

### Feature 3: Interactive Learning Popup

#### Step 1: Add Popup HTML

**Before closing `</body>` tag, ADD:**

```html
<div class="learning-popup" id="learningPopup">
    <div class="popup-overlay" onclick="closePopup()"></div>
    <div class="popup-content">
        <button class="popup-close" onclick="closePopup()">✕</button>
        <div class="popup-header">
            <div class="popup-icon">💡</div>
            <h3 class="popup-title" id="popupTitle">Concept Explorer</h3>
        </div>
        <div class="popup-body">
            <div class="popup-section">
                <h4>📝 Explanation</h4>
                <p id="popupExplanation">Click any node to learn more.</p>
            </div>
            <div class="popup-section">
                <h4>🎯 Key Points</h4>
                <ul id="popupKeyPoints"></ul>
            </div>
            <div class="popup-section" id="popupExampleSection">
                <h4>💭 Example</h4>
                <p id="popupExample"></p>
            </div>
        </div>
        <div class="popup-footer">
            <button class="btn-expand" onclick="expandConcept()">
                <span>🔍 Expand This Concept</span>
            </button>
        </div>
    </div>
</div>
```

#### Step 2: Add Popup CSS

**Copy the popup styles from `styles.css` (starting from `.learning-popup`)**

#### Step 3: Add Popup JavaScript

**In your node creation function, ADD click handler:**

```javascript
function createNode({ text, x, y, className, zIndex, animationDelay, data }) {
    const node = document.createElement('div');
    node.className = className;
    node.textContent = text;
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.zIndex = zIndex;
    if (animationDelay) node.style.animationDelay = animationDelay;
    
    // ADD THIS: Store data for popup
    node.dataset.nodeData = JSON.stringify(data);
    
    // ADD THIS: Click handler
    node.addEventListener('click', (e) => {
        e.stopPropagation();
        showLearningPopup(text, data);
        focusNode(node);
    });
    
    return node;
}

function showLearningPopup(title, data) {
    const popup = document.getElementById('learningPopup');
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupExplanation').textContent = 
        data.explanation || 'Click concepts to learn more.';
    
    // Key points
    const pointsList = document.getElementById('popupKeyPoints');
    pointsList.innerHTML = '';
    (data.keyPoints || ['Important concept']).forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        pointsList.appendChild(li);
    });
    
    // Example
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
    
    // Remove focus effects
    document.querySelectorAll('.node').forEach(node => {
        node.classList.remove('focused', 'dimmed');
    });
}

function focusNode(node) {
    document.querySelectorAll('.node').forEach(n => n.classList.add('dimmed'));
    node.classList.remove('dimmed');
    node.classList.add('focused');
}
```

**✅ Test:** Click any node in your mind map.

---

### Feature 4: AI Concept Expansion

#### Step 1: Add Expand Function

**ADD to script.js:**

```javascript
async function expandConcept() {
    const title = document.getElementById('popupTitle').textContent;
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiKey) {
        alert('💡 Add your Anthropic API key to use AI expansion!');
        return;
    }
    
    const popupBody = document.querySelector('.popup-body');
    popupBody.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Expanding with AI...</div></div>';
    
    try {
        const prompt = `Provide a detailed explanation of: "${title}"
        
Include:
1. Clear explanation (2-3 sentences)
2. 4-5 key points
3. Real-world example
4. Why it matters

Keep it student-friendly.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 800,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        const explanation = data.content.find(item => item.type === 'text')?.text || '';
        
        popupBody.innerHTML = `
            <div class="popup-section">
                <h4>🤖 AI-Expanded Explanation</h4>
                <p style="white-space: pre-line;">${explanation}</p>
            </div>
        `;
        
    } catch (error) {
        popupBody.innerHTML = `
            <div class="popup-section">
                <h4>⚠️ Error</h4>
                <p>Could not expand. Check your API key.</p>
            </div>
        `;
    }
}
```

**✅ Test:** Add API key, click node, then click "Expand This Concept"

---

## 🧪 Testing Each Feature

### Test 1: Theme System
```
✓ Open app
✓ Click theme button (🎨)
✓ Select different theme
✓ Verify colors change
✓ Refresh page
✓ Theme should persist
```

### Test 2: File Upload
```
✓ Click upload zone
✓ Select PDF file
✓ Verify status shows "Uploading..."
✓ Verify status shows "Uploaded!"
✓ Verify mind map generates
✓ Try drag & drop
```

### Test 3: Interactive Popup
```
✓ Generate mind map
✓ Click any node
✓ Verify popup appears
✓ Check explanation displays
✓ Check key points list
✓ Check example (if present)
✓ Press ESC or click X
✓ Verify popup closes
```

### Test 4: AI Expansion
```
✓ Add API key
✓ Generate mind map
✓ Click node
✓ Click "Expand This Concept"
✓ Verify loading spinner
✓ Verify AI explanation appears
```

---

## 🎨 Customization Guide

### Adding a New Theme

**1. Define color variables:**
```css
body[data-theme="your-theme"] {
    --bg-primary: #yourcolor;
    --bg-secondary: #yourcolor;
    --text-primary: #yourcolor;
    --accent-primary: #yourcolor;
    --accent-secondary: #yourcolor;
    --border: #yourcolor;
    --shadow: 0 4px 20px rgba(0,0,0,0.2);
    --glow-intensity: 0.5;
    
    /* Node colors (6 variations) */
    --node-0: #color; --node-0-border: #color; --node-0-text: #color;
    --node-1: #color; --node-1-border: #color; --node-1-text: #color;
    /* ... continue for node-2 through node-5 */
}
```

**2. Add theme option to HTML:**
```html
<div class="theme-option" data-theme="your-theme" onclick="changeTheme('your-theme')">
    <div class="theme-preview theme-preview-your-theme"></div>
    <span>Your Theme Name</span>
</div>
```

**3. Add preview style:**
```css
.theme-preview-your-theme {
    background: linear-gradient(135deg, #color1, #color2);
}
```

### Customizing Node Appearance

**Change node sizes:**
```css
.node-center { width: 120px; height: 120px; }  /* Default: 100px */
.node-branch { width: 100px; height: 100px; }  /* Default: 85px */
.node-sub { width: 80px; height: 80px; }       /* Default: 70px */
```

**Change node positioning:**
```javascript
const radius = 200;      // Default: 180 (branch distance from center)
const subRadius = 100;   // Default: 90 (sub-branch distance)
```

### Adding More Context Types

**In HTML:**
```html
<option value="science">🔬 Science Study</option>
<option value="language">📖 Language Learning</option>
```

**In JavaScript:**
```javascript
const templates = {
    science: {
        branches: [
            { title: 'Hypothesis', /* ... */ },
            { title: 'Experiment', /* ... */ },
            { title: 'Results', /* ... */ },
            { title: 'Conclusion', /* ... */ }
        ]
    },
    language: {
        branches: [
            { title: 'Vocabulary', /* ... */ },
            { title: 'Grammar', /* ... */ },
            { title: 'Practice', /* ... */ },
            { title: 'Culture', /* ... */ }
        ]
    }
};
```

---

## 🔧 Troubleshooting

### Theme Not Changing
**Problem:** Clicking theme does nothing
**Solutions:**
1. Check browser console for errors
2. Verify `changeTheme()` function exists
3. Check theme CSS variables are defined
4. Clear browser cache

### File Upload Not Working
**Problem:** "Upload failed" error
**Solutions:**
1. Check backend is running (`npm start` in backend/)
2. Verify backend URL in `script.js`
3. Check CORS settings in backend
4. Try smaller file (< 5MB)
5. Check file type is supported

### Popup Not Showing
**Problem:** Clicking node does nothing
**Solutions:**
1. Check popup HTML is present
2. Verify click handler is attached to nodes
3. Check popup CSS is loaded
4. Look for JavaScript errors in console

### AI Expansion Not Working
**Problem:** "Check your API key" error
**Solutions:**
1. Verify API key is correct
2. Check Anthropic account has credits
3. Verify internet connection
4. Check API endpoint in code

### Styles Not Applying
**Problem:** App looks broken
**Solutions:**
1. Check CSS file is linked correctly
2. Verify no syntax errors in CSS
3. Check browser developer tools
4. Clear browser cache
5. Try hard refresh (Ctrl+Shift+R)

---

## 📝 Integration Checklist

Use this checklist to ensure everything is integrated correctly:

### Frontend Integration
- [ ] Theme system CSS variables added
- [ ] All 6 themes defined
- [ ] Theme selector UI added
- [ ] Theme JavaScript functions added
- [ ] File upload UI added
- [ ] File upload JavaScript added
- [ ] Drag & drop working
- [ ] Learning popup HTML added
- [ ] Popup CSS added
- [ ] Popup JavaScript added
- [ ] Node click handlers added
- [ ] AI expansion function added
- [ ] All functions initialized on DOMContentLoaded

### Backend Integration
- [ ] Backend directory created
- [ ] server.js added
- [ ] package.json added
- [ ] Dependencies installed (`npm install`)
- [ ] Backend starts without errors
- [ ] Can access http://localhost:3000/api/health
- [ ] File upload endpoint working
- [ ] Text analysis endpoint working
- [ ] CORS configured correctly

### Testing
- [ ] All themes work
- [ ] Theme persists on refresh
- [ ] File upload works
- [ ] Drag & drop works
- [ ] Mind map generates
- [ ] Nodes are clickable
- [ ] Popup shows information
- [ ] Popup closes properly
- [ ] AI expansion works (with API key)
- [ ] Mobile responsive
- [ ] No console errors

### Documentation
- [ ] README.md reviewed
- [ ] ARCHITECTURE.md reviewed
- [ ] DEPLOYMENT.md reviewed
- [ ] Comments in code understood
- [ ] API endpoints documented

---

## 🎯 Next Steps

Once you've integrated all features:

1. **Test thoroughly** on different browsers
2. **Deploy** using the DEPLOYMENT.md guide
3. **Customize** themes and styling to your preference
4. **Add analytics** to track usage
5. **Gather feedback** from users
6. **Iterate** and improve

---

## 💡 Pro Tips

1. **Start with one feature at a time** - Don't try to integrate everything at once
2. **Test after each feature** - Make sure it works before moving on
3. **Keep backups** - Always backup your working code
4. **Use browser DevTools** - Console, Network, Elements tabs are your friends
5. **Read error messages** - They usually tell you exactly what's wrong
6. **Ask for help** - Check documentation or reach out to the community

---

**You're all set! Happy integrating! 🚀**