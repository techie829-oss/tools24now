# Production Dockerfile for Next.js (SSR)
FROM node:18-alpine

WORKDIR /app

# Install dependencies (only package.json first for caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]
