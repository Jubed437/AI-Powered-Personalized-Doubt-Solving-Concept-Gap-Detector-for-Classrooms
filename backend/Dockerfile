# syntax=docker/dockerfile:1

# Stage 1: Base Node environment
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Stage 2: Install production dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 3: Development environment (supports hot-reloading with --watch)
FROM base AS development
ENV NODE_ENV=development \
    PORT=5001
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]

# Stage 4: Production runner (lean, secure non-root container)
FROM base AS runner
ENV NODE_ENV=production \
    PORT=5001

# Security: run as non-root user
USER node

# Copy application code
COPY --chown=node:node . .

# Overlay production node_modules from the deps stage
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules

EXPOSE 5001

# Healthcheck testing the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5001) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]

