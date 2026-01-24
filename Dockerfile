# Dockerfile

# 1. Base Image for building the application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# 2. Production Image
FROM node:20-alpine
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy built files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Expose the port Next.js runs on
EXPOSE 3000

# The command to start the Next.js production server
CMD ["npm", "start"]
