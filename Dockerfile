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

# Install a simple static file server
# We'll use bun's built-in http server capabilities
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Create a simple server script
RUN echo 'import { serve } from "bun"; \n\
\n\
const server = serve({ \n\
  port: process.env.PORT || 3000, \n\
  hostname: "0.0.0.0", \n\
  async fetch(req) { \n\
    const url = new URL(req.url); \n\
    let filePath = url.pathname; \n\
    \n\
    // Serve index.html for root and routes \n\
    if (filePath === "/" || !filePath.includes(".")) { \n\
      filePath = "/index.html"; \n\
    } \n\
    \n\
    try { \n\
      const file = Bun.file(`./dist${filePath}`); \n\
      if (await file.exists()) { \n\
        return new Response(file); \n\
      } \n\
      // Fallback to index.html for client-side routing \n\
      const indexFile = Bun.file("./dist/index.html"); \n\
      return new Response(indexFile); \n\
    } catch (error) { \n\
      return new Response("Not Found", { status: 404 }); \n\
    } \n\
  }, \n\
}); \n\
\n\
console.log(`Server running on http://0.0.0.0:${server.port}`);' > server.js

# Expose port 3000
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start the server
CMD ["bun", "run", "server.js"]
