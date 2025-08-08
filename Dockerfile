# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set npm registry and retry settings
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Copy Prisma schema first (needed for postinstall script)
COPY prisma ./prisma/

# Install dependencies with retry logic
RUN npm install --only=production --no-audit --no-fund
RUN cd client && npm install --legacy-peer-deps --no-audit --no-fund --network-timeout=100000

# Copy remaining source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the client
RUN cd client && npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]