# ================================
# Stage 1 : Build
# ================================
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ================================
# Stage 2 : Production
# ================================
FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app .

# Sécurité : ne pas utiliser root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000
CMD ["node", "server.js"]