FROM node:22-alpine

WORKDIR /app

# Install system deps for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 7860

# Set env - HF Spaces uses port 7860
ENV PORT=7860

# Start server
CMD ["npx", "tsx", "server/index.ts"]
