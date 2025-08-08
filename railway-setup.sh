#!/bin/bash

echo "🚀 Railway Setup Script for H POS"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Seed database if needed
echo "🌱 Seeding database..."
node database/migrate.js seed

echo "✅ Railway setup completed successfully!"
