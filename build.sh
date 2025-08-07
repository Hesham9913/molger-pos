#!/bin/bash
set -e

echo "🚀 Starting H POS build process..."

# Install root dependencies
echo "📦 Installing server dependencies..."
npm ci --only=production

# Navigate to client and install dependencies
echo "📦 Installing client dependencies..."
cd client
npm install --legacy-peer-deps

# Build the React app
echo "🏗️  Building React application..."
npm run build

# Go back to root
cd ..

echo "✅ Build completed successfully!"
echo "📁 Client build files are ready in: client/build/"
echo "🚀 Server is ready to start with: npm start"