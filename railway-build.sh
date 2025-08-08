#!/bin/bash

echo "🚀 Railway Build Script for H POS"

# Configure npm for better reliability
npm config set registry https://registry.npmjs.org/
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Ensure Prisma schema is available
echo "📁 Setting up Prisma schema..."
mkdir -p prisma
if [ -f prisma/schema.prisma ]; then
    echo "✅ Prisma schema found"
else
    echo "⚠️ Prisma schema not found, will be copied during build"
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
npm ci --include=dev --no-audit --no-fund --network-timeout=100000

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm ci --legacy-peer-deps --no-audit --no-fund --network-timeout=100000

# Build client for production
echo "🔨 Building client for production..."
npm run build

cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Railway build completed successfully!"
