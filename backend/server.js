// ========================================
// STUDYMAPPER BACKEND SERVER
// Node.js + Express API for File Processing
// ========================================

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// File processing libraries
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const textract = require('textract');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, and TXT are allowed.'));
        }
    }
});

// ========================================
// FILE PROCESSING FUNCTIONS
// ========================================

async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

async function extractTextFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error('DOCX extraction error:', error);
        throw new Error('Failed to extract text from DOCX');
    }
}

async function extractTextFromPPTX(filePath) {
    return new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, { preserveLineBreaks: true }, (error, text) => {
            if (error) {
                console.error('PPTX extraction error:', error);
                reject(new Error('Failed to extract text from PPTX'));
            } else {
                resolve(text);
            }
        });
    });
}

async function extractTextFromTXT(filePath) {
    try {
        const text = await fs.readFile(filePath, 'utf-8');
        return text;
    } catch (error) {
        console.error('TXT reading error:', error);
        throw new Error('Failed to read text file');
    }
}

async function extractTextFromFile(filePath, fileExt) {
    switch (fileExt.toLowerCase()) {
        case '.pdf':
            return await extractTextFromPDF(filePath);
        case '.doc':
        case '.docx':
            return await extractTextFromDOCX(filePath);
        case '.ppt':
        case '.pptx':
            return await extractTextFromPPTX(filePath);
        case '.txt':
            return await extractTextFromTXT(filePath);
        default:
            throw new Error('Unsupported file type');
    }
}

// ========================================
// TEXT PROCESSING & MIND MAP GENERATION
// ========================================

function processTextToMindMap(text, contextType) {
    // Clean and normalize text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Extract headings and key phrases
    const lines = cleanText.split(/\n+/);
    const headings = [];
    const content = [];
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
            // Detect headings (ALL CAPS, numbered, or short lines)
            if (trimmed === trimmed.toUpperCase() && trimmed.length < 50) {
                headings.push(trimmed);
            } else if (/^\d+\./.test(trimmed)) {
                headings.push(trimmed);
            } else if (trimmed.length < 60 && trimmed.endsWith(':')) {
                headings.push(trimmed.replace(':', ''));
            } else {
                content.push(trimmed);
            }
        }
    });
    
    // Extract key terms using simple NLP
    const words = cleanText.toLowerCase().split(/\W+/);
    const wordFreq = {};
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were']);
    
    words.forEach(word => {
        if (word.length > 4 && !stopWords.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    // Sort by frequency
    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word]) => word);
    
    // Generate central idea
    const centralIdea = headings.length > 0 
        ? headings[0].substring(0, 40) 
        : topWords.slice(0, 3).join(' ').substring(0, 40);
    
    // Generate branches based on context
    const branches = generateBranchesFromContent(headings, topWords, contextType, content);
    
    return {
        centralIdea: capitalizeWords(centralIdea),
        branches: branches
    };
}

function generateBranchesFromContent(headings, topWords, contextType, content) {
    const branches = [];
    
    // If we have clear headings, use them
    if (headings.length >= 3) {
        headings.slice(1, 7).forEach((heading, idx) => {
            branches.push({
                title: capitalizeWords(heading.substring(0, 30)),
                explanation: `Key concept: ${heading}`,
                keyPoints: [
                    'Important topic to understand',
                    'Central to the main subject',
                    'Study this carefully'
                ],
                example: 'Apply this concept in practice',
                subBranches: generateSubBranches(topWords, idx)
            });
        });
    } else {
        // Generate based on content analysis and context type
        const contextTemplates = {
            personal: ['Overview', 'Key Points', 'Details', 'Examples', 'Summary'],
            academic: ['Definition', 'Theory', 'Application', 'Analysis', 'Conclusion'],
            creative: ['Concept', 'Process', 'Techniques', 'Examples', 'Practice'],
            professional: ['Background', 'Analysis', 'Strategy', 'Implementation', 'Results']
        };
        
        const templates = contextTemplates[contextType] || contextTemplates.personal;
        
        templates.forEach((title, idx) => {
            branches.push({
                title: title,
                explanation: `Understanding ${title.toLowerCase()} in context`,
                keyPoints: [
                    `Focus on ${title.toLowerCase()}`,
                    'Connect to main concept',
                    'Apply knowledge practically'
                ],
                example: `Real-world application of ${title.toLowerCase()}`,
                subBranches: generateSubBranches(topWords, idx)
            });
        });
    }
    
    return branches;
}

/*function generateSubBranches(topWords, offset) {
    const start = offset * 3;
    return topWords.slice(start, start + 3).map(word => capitalizeWords(word));
}*/

function generateSubBranches(topWords, offset) {
    const start = offset * 3;
    return topWords.slice(start, start + 3).map(word => ({
        title: capitalizeWords(word),
        explanation: `Detail about ${capitalizeWords(word)}`,
        keyPoints: ['Supporting point', 'Additional detail'],
        example: 'Specific instance'
    }));
}

function capitalizeWords(str) {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// ========================================
// API ROUTES
// ========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'StudyMapper backend is running' });
});

// File upload and processing
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname);
        const contextType = req.body.contextType || 'personal';
        
        console.log(`Processing file: ${req.file.originalname}`);
        
        // Extract text from file
        const extractedText = await extractTextFromFile(filePath, fileExt);
        
        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('No text could be extracted from the file');
        }
        
        console.log(`Extracted ${extractedText.length} characters`);
        
        // Process text into mind map structure
        const mindMapData = processTextToMindMap(extractedText, contextType);
        
        // Clean up uploaded file
        await fs.unlink(filePath);
        
        res.json({
            success: true,
            filename: req.file.originalname,
            textLength: extractedText.length,
            ...mindMapData
        });
        
    } catch (error) {
        console.error('Upload processing error:', error);
        
        // Clean up file if exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        
        res.status(500).json({
            error: error.message || 'Failed to process file',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Text analysis endpoint (for direct text input)
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, contextType } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'No text provided' });
        }
        
        const mindMapData = processTextToMindMap(text, contextType || 'personal');
        
        res.json({
            success: true,
            ...mindMapData
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze text',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// ========================================
// SERVER STARTUP
// ========================================

async function startServer() {
    // Ensure uploads directory exists
    try {
        await fs.mkdir('uploads', { recursive: true });
        console.log('📁 Uploads directory ready');
    } catch (error) {
        console.error('Failed to create uploads directory:', error);
    }
    
    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════╗
║   🧠 StudyMapper Backend Server               ║
║   Port: ${PORT}                               ║
║   Status: Running                             ║
║   Endpoints:                                  ║
║   • POST /api/upload (file processing)        ║
║   • POST /api/analyze (text analysis)         ║
║   • GET  /api/health (health check)           ║
╚═══════════════════════════════════════════════╝
        `);
    });
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;