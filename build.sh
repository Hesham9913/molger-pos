#!/bin/bash

# Install root dependencies
npm ci --only=production

# Install and build client
cd client
npm ci --legacy-peer-deps
npm run build
cd ..

echo "Build completed successfully!" 