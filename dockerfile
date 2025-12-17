# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source + config
COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations   

# Compile TypeScript
RUN npm run build


# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Expose API port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"]
