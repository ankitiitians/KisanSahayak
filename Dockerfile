# ============================================================
# Stage 1: deps — install ALL dependencies (cached layer)
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Only copy package files first — better Docker layer caching
# (If source changes but package.json unchanged, npm ci won't re-run)
COPY package.json package-lock.json ./
RUN npm ci

# ============================================================
# Stage 2: builder — compile frontend (Vite) + backend (esbuild)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Bring installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Build: Vite bundles React → dist/public, esbuild bundles server → dist/index.js
RUN npm run build

# ============================================================
# Stage 3: production — lean, secure final image
# ============================================================
FROM node:20-alpine AS production

# Security: run as non-root user (best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy shared schema (Drizzle needs it at runtime)
COPY --from=builder /app/shared ./shared

# Fix file ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose app port
EXPOSE 5000

# Health check (wget is included in alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/index.js"]
