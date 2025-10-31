# Multi-stage Dockerfile for building and running the NestJS app
# Builder stage installs dev deps and builds the TypeScript project
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image (smaller)
FROM node:22-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /usr/src/app/dist ./dist

# If you rely on other runtime files (prisma client, public, etc.) copy them as needed
COPY prisma ./prisma
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/main"]
