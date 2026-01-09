# Multi-stage Dockerfile for Number Flow

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copy build artifacts and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/.env .env

# Expose port
EXPOSE 5000

# Start the server
CMD ["tsx", "server/index.ts"]
