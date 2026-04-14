# ============================================================
# Stage 1: deps
# Install all node_modules (including devDependencies for build)
# Separated as its own stage so npm ci only re-runs when
# package-lock.json actually changes — not on every code edit
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ============================================================
# Stage 2: builder
# Compile React frontend via Vite and Express backend via esbuild
# Output: dist/public (frontend) + dist/index.js (backend)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================
# Stage 3: production
# Lean final image — only runtime deps + compiled output
# Runs as non-root user for security
# ============================================================
FROM node:20-alpine AS production

# Create a non-root system user/group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy shared Drizzle schema (needed by ORM at runtime)
COPY --from=builder /app/shared ./shared

# Hand ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# wget is available in alpine — used for the health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/index.js"]
