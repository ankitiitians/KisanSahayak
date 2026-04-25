# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (layer cache)
COPY package*.json ./

# Install ALL deps (including devDeps needed for build)
RUN npm ci

# Copy full source
COPY . .

# Build frontend (vite) + backend (esbuild via npm run build)
RUN npm run build

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy what production needs
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# App runs on 5000
EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
