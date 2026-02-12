# 🧠 StudyMapper - AI-Powered Interactive Mind Maps

**Turn any document or notes into beautiful, interactive mind maps that enhance learning and retention.**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

---

## 🌟 Features

### ✨ **Multi-Theme System**
- **6 Beautiful Themes**: Dark Neon, Light Minimal, Cyberpunk, Pastel Dream, Glassmorphism, High Contrast
- **Accessibility**: High contrast mode for visually impaired users
- **Persistent**: Theme preference saved in localStorage
- **Palette-Driven**: All colors managed via CSS variables for easy customization

### 📁 **Smart File Upload**
- **Multiple Formats**: PDF, DOC, DOCX, PPT, PPTX, TXT
- **Drag & Drop**: Intuitive file upload interface
- **Automatic Processing**: Extracts text and generates mind maps instantly
- **10MB Limit**: Handles documents up to 10MB

### 🎯 **Interactive Learning**
- **Click-to-Learn**: Click any node to explore detailed explanations
- **Smart Popups**: See explanations, key points, and real-world examples
- **AI Expansion**: Use Anthropic API to expand concepts with AI
- **Visual Focus**: Dimming and highlighting for better concentration

### 🤖 **AI-Powered Generation**
- **Optional API**: Works without AI in demo mode
- **Smart Analysis**: Context-aware mind map generation
- **Educational Metadata**: Automatically generates explanations and examples
- **4 Context Types**: Personal study, Academic, Creative, Professional

### 🎨 **Beautiful Design**
- **Animated Nodes**: Smooth fade-in and drawing animations
- **Responsive**: Works on desktop, tablet, and mobile
- **Modern UI**: Glassmorphism effects and gradient accents
- **Zoom Controls**: Zoom in/out for better viewing

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 14+ and npm
- **Anthropic API Key** (optional, for AI features)

### Frontend Setup

```bash
# 1. Clone or download the project
# 2. Open index.html in a browser
# That's it! Frontend works standalone.

# For development server (optional):
npx serve .
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start

# For development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3000`

---

## 📂 Project Structure

```
studymapper/
├── index.html              # Main HTML file
├── styles.css              # All theme styles and UI
├── script.js               # Frontend JavaScript logic
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json        # Backend dependencies
│   └── uploads/            # Temporary file storage (auto-created)
├── README.md               # This file
├── ARCHITECTURE.md         # Technical documentation
└── DEPLOYMENT.md           # Deployment guide
```

---

## 🎨 Theme System

### Available Themes

1. **Dark Neon** (Default)
   - Purple/pink gradients with neon glow
   - High contrast, modern aesthetic
   
2. **Light Minimal**
   - Clean white background
   - Subtle colors, professional look
   
3. **Cyberpunk**
   - Black background with neon green/pink
   - Maximum glow intensity
   
4. **Pastel Dream**
   - Soft purple/pink pastels
   - Gentle on the eyes
   
5. **Glassmorphism**
   - Frosted glass effect
   - Gradient purple background
   
6. **High Contrast**
   - Maximum accessibility
   - Yellow/green/white on black

### How to Customize

All themes use CSS variables. Edit `styles.css`:

```css
body[data-theme="your-theme"] {
    --bg-primary: #yourcolor;
    --text-primary: #yourcolor;
    --accent-primary: #yourcolor;
    /* ... more variables */
}
```

---

## 🔌 API Integration

### Frontend Configuration

Update the backend URL in `script.js`:

```javascript
const BACKEND_API = 'http://localhost:3000/api';
// Change to your deployed backend URL
```

### Anthropic API Setup

1. Get a free API key at [console.anthropic.com](https://console.anthropic.com)
2. Paste it in the "Enhanced AI Mode" field in the app
3. Generate smarter, context-aware mind maps

---

## 🛠️ Backend API

### Endpoints

#### `POST /api/upload`
Upload and process a document file.

**Request:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@document.pdf" \
  -F "contextType=academic"
```

**Response:**
```json
{
  "success": true,
  "filename": "document.pdf",
  "textLength": 5234,
  "centralIdea": "Main Topic",
  "branches": [
    {
      "title": "Key Concept",
      "explanation": "Explanation text",
      "keyPoints": ["Point 1", "Point 2"],
      "example": "Example text",
      "subBranches": ["Detail 1", "Detail 2"]
    }
  ]
}
```

#### `POST /api/analyze`
Analyze text without file upload.

**Request:**
```json
{
  "text": "Your text content here",
  "contextType": "personal"
}
```

#### `GET /api/health`
Health check endpoint.

---

## 🎓 How It Works

### 1. **File Upload**
- User uploads PDF/DOC/PPT/TXT or pastes text
- Backend extracts all text content
- Cleans and normalizes the text

### 2. **Text Processing**
- Identifies headings and key phrases
- Performs frequency analysis for keywords
- Detects document structure

### 3. **Mind Map Generation**
- Creates central idea from main topic
- Generates 4-6 main branches (concepts)
- Adds 2-4 sub-branches per branch (details)
- Optionally uses AI for smarter generation

### 4. **Interactive Display**
- Renders nodes with smooth animations
- Connects nodes with curved lines
- Enables click-to-learn functionality

### 5. **Learning Popup**
- Shows detailed explanations
- Lists key points to remember
- Provides real-world examples
- Can expand with AI for deeper learning

---

## 💡 Usage Tips

### For Students
1. **Upload lecture notes** → Get instant visual summary
2. **Click concepts** → Learn more about each topic
3. **Use context types** → Match your study goal
4. **Try themes** → Find what works best for focus

### For Teachers
1. **Upload curriculum** → Create teaching aids
2. **Generate for classes** → Share mind maps with students
3. **Use professional mode** → Structured presentation

### For Professionals
1. **Upload reports** → Visualize complex data
2. **Meeting notes** → Share visual summaries
3. **Research papers** → Extract key findings

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if port 3000 is available
lsof -i :3000

# Use different port
PORT=3001 npm start
```

### File Upload Fails
- Check file size (max 10MB)
- Ensure file type is supported
- Check backend is running

### Mind Map Not Generating
- Check browser console for errors
- Verify API key if using AI mode
- Try demo mode without API key

### Theme Not Persisting
- Check localStorage is enabled
- Clear browser cache
- Disable browser extensions

---

## 📊 Technical Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - CSS Variables, animations, glassmorphism
- **Vanilla JavaScript** - No framework dependencies
- **SVG** - Connection lines and graphics

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX processing
- **textract** - PPTX/DOC processing

### APIs
- **Anthropic Claude** - AI-powered analysis (optional)

---

## 🚀 Deployment

### Frontend (Static Hosting)

**Netlify / Vercel:**
```bash
# Deploy frontend files
netlify deploy --prod
```

**GitHub Pages:**
```bash
# Push to gh-pages branch
git subtree push --prefix . origin gh-pages
```

### Backend (Node.js Hosting)

**Heroku:**
```bash
cd backend
heroku create studymapper-api
git push heroku main
```

**Railway / Render:**
- Connect GitHub repo
- Set root directory to `backend/`
- Deploy automatically

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
ANTHROPIC_API_KEY=your_key_here  # Optional
```

---

## 🎯 Hackathon Judging Criteria

### ✅ **Innovation**
- Multi-theme system with 6 unique palettes
- Interactive learning with click-to-explore
- AI concept expansion feature
- Automatic document processing

### ✅ **Technical Excellence**
- Clean, modular code structure
- RESTful API design
- File processing for 5+ formats
- Responsive, accessible design

### ✅ **User Experience**
- Intuitive drag-and-drop interface
- Smooth animations and transitions
- Context-aware generation
- Mobile-friendly

### ✅ **Real-World Impact**
- Helps students study more effectively
- Visual learning for better retention
- Accessibility features for all users
- Free and open-source

### ✅ **Completeness**
- Full-stack implementation
- Comprehensive documentation
- Error handling and validation
- Deployment-ready

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Comment complex logic
- Test on multiple browsers
- Update documentation

---

## 📄 License

MIT License - feel free to use this project for learning, hackathons, or commercial purposes.

---

## 🙏 Acknowledgments

- **Anthropic** - For Claude AI API
- **Open Source Community** - For amazing libraries
- **Students Everywhere** - This is for you!

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/studymapper/issues)
- **Documentation**: See `ARCHITECTURE.md` for technical details
- **Email**: support@studymapper.com

---

## 🔮 Future Roadmap

- [ ] Export to PNG/SVG
- [ ] Collaborative mind maps
- [ ] Mobile app (React Native)
- [ ] More themes
- [ ] Voice input
- [ ] Integration with note-taking apps
- [ ] Flashcard generation from nodes
- [ ] Quiz mode

---

**Built with ❤️ for students, by students**

*StudyMapper - Learn Smarter, Not Harder* 🚀