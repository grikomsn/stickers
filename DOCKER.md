# Docker Deployment Guide

This guide explains how to deploy the Stickers application using Docker.

## Quick Start

### Using Docker

```bash
# Build the image
docker build -t stickers .

# Run the container
docker run -d -p 3000:3000 --name stickers stickers

# Access at http://localhost:3000
```

### Using Docker Compose

```bash
# Start the application
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

### Using Pre-built Images from GHCR

```bash
# Pull the latest image
docker pull ghcr.io/grikomsn/stickers:latest

# Run it
docker run -d -p 3000:3000 ghcr.io/grikomsn/stickers:latest
```

## Architecture

The Dockerfile uses a multi-stage build pattern for optimization:

### Builder Stage
- Base: `oven/bun:1.2.12`
- Installs dependencies using Bun
- Builds the application with Vite
- Compiles TypeScript

### Runner Stage
- Base: `oven/bun:1.2.12-slim` (smaller image)
- Copies only the built `dist` folder
- Includes a lightweight HTTP server using Bun's built-in capabilities
- Serves static files with proper fallback for client-side routing

## Configuration

### Environment Variables

- `PORT` - The port the application listens on (default: 3000)

Example:
```bash
docker run -d -p 8080:8080 -e PORT=8080 stickers
```

### Custom Port with Docker Compose

Create a `.env` file:
```
PORT=8080
```

Then run:
```bash
docker compose up -d
```

## GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/docker.yml`) that automatically:

1. Builds the Docker image on push to `main`
2. Builds on version tags (e.g., `v1.0.0`)
3. Publishes images to GitHub Container Registry (ghcr.io)
4. Supports multi-platform builds (linux/amd64, linux/arm64)
5. Implements layer caching for faster builds

### Image Tags

Images are automatically tagged as:
- `latest` - Latest build from main branch
- `main` - Main branch builds
- `v1.0.0` - Semantic version tags
- `v1.0` - Major.minor version
- `v1` - Major version
- `main-<sha>` - Commit SHA tags

## Development

To modify the server or build process:

1. Edit the `Dockerfile` for build configuration
2. The static file server is embedded in the Dockerfile
3. To use a different server, modify the `CMD` instruction

## Troubleshooting

### Build fails with SSL errors

The Dockerfile includes `NODE_TLS_REJECT_UNAUTHORIZED=0` for environments with SSL issues. This is safe in controlled build environments but should be removed if security is a concern.

### Container doesn't start

Check logs:
```bash
docker logs stickers
```

### Port already in use

Change the host port:
```bash
docker run -d -p 8080:3000 stickers
```

## Production Considerations

1. **Reverse Proxy**: Use nginx or Traefik in front for HTTPS and load balancing
2. **Health Checks**: Add health check endpoints if needed
3. **Resource Limits**: Set memory and CPU limits in production
4. **Logging**: Configure log aggregation (ELK, Loki, etc.)
5. **Monitoring**: Add application monitoring (Prometheus, Grafana, etc.)

### Example with Resource Limits

```bash
docker run -d \
  --name stickers \
  --memory="512m" \
  --cpus="1.0" \
  -p 3000:3000 \
  stickers
```

### Example with Docker Compose + nginx

```yaml
services:
  stickers:
    image: ghcr.io/grikomsn/stickers:latest
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - stickers
```

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues and discussions
- Review the main README.md

## License

This project is licensed under the MIT License.
