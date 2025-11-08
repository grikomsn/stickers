# Builder stage - Build the application
FROM oven/bun:1.2.12 AS builder

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json bun.lock ./

# Install dependencies (disable SSL for network issues in CI/CD environments)
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 bun install --frozen-lockfile

# Copy source code and configuration files
COPY . .

# Build the application
RUN bun run build

# Runner stage - Serve the static files
FROM oven/bun:1.2.12-slim AS runner

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Install serve package globally
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 bun install -g serve

# Expose port 3000
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start the server using serve
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000"]
