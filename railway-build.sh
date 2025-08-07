#!/bin/bash

echo "🚀 Railway Build Script for H POS"

# Configure npm for better reliability
npm config set registry https://registry.npmjs.org/
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Install server dependencies
echo "📦 Installing server dependencies..."
npm ci --include=dev --no-audit --no-fund --network-timeout=100000

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm ci --legacy-peer-deps --no-audit --no-fund --network-timeout=100000

# Build client for production
echo "🔨 Building client for production..."
npm run build

cd ..

echo "✅ Railway build completed successfully!"
