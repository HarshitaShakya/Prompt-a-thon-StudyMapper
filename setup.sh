#!/bin/bash

echo "🚀 Setting up StudyMapper..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Go back to root
cd ..

echo "✅ Setup complete!"
echo "🎯 Run 'cd backend && npm start' to start the server"
echo "🌐 Then open index.html in your browser"