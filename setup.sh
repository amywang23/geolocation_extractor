#!/bin/bash

echo "🚀 Setting up GeoExtractor..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "🎉 You're all set! To start the development server, run:"
    echo ""
    echo "   npm run dev"
    echo ""
    echo "Then open your browser to the URL shown in the terminal."
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
