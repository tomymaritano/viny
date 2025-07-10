# Multi-stage build for production optimization
FROM node:18-alpine AS base
WORKDIR /app
# Install curl for healthcheck in development
RUN apk add --no-cache curl

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies for building
FROM base AS build-deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM build-deps AS build
COPY . .
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production image
FROM base AS production
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nototo

# Copy built application
COPY --from=deps --chown=nototo:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nototo:nodejs /app/dist ./dist
COPY --from=build --chown=nototo:nodejs /app/prisma ./prisma
COPY --from=build --chown=nototo:nodejs /app/package.json ./

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nototo:nodejs /app/data

USER nototo

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]