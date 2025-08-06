# Multi-stage build for React + Node.js app
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy client package files
COPY client/package.json client/package-lock.json* ./client/
WORKDIR /app/client
RUN npm ci --legacy-peer-deps

# Build stage
FROM base AS builder
WORKDIR /app

# Copy all files
COPY . .

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules

# Build the React app
WORKDIR /app/client
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built React app
COPY --from=builder /app/client/build ./client/build

# Copy server files
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENV PORT 5000

CMD ["npm", "start"] 