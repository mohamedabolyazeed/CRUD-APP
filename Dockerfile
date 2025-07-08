# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy client package files
COPY client/package*.json ./client/

# Install client dependencies
WORKDIR /app/client
RUN npm ci --only=production

# Copy client source and build
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install server dependencies
RUN npm ci --only=production

# Copy server files
COPY server/ ./server/
COPY server.js ./

# Copy built React app from builder stage
COPY --from=builder /app/build ./client/build/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (Render will set PORT environment variable)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-5000}/api/auth/me', (res) => { process.exit(res.statusCode === 401 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"] 