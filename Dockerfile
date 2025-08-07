# Multi-stage build for React + Node.js app
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files and install server dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy client package files and install client dependencies
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install --legacy-peer-deps && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy all source files
COPY . .

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules

# Build the React app
RUN cd client && npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy built React app
COPY --from=builder /app/client/build ./client/build

# Copy server files
COPY --from=builder /app/server ./server

# Copy shared types
COPY --from=builder /app/shared ./shared

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]