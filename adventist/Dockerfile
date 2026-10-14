FROM node:20-bullseye-slim

# Install build deps required for native modules (better-sqlite3)
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential python3 ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package metadata and install production deps (npm install is used to avoid lockfile mismatch failures)
# Note: COPY paths are relative to the Docker build context. When Render's "Root Directory" is set to the adventist/ folder,
# the build context is that folder so we should COPY from the current context (no extra adventist/ prefix).
COPY package.json ./package.json
RUN npm install --production --no-audit --no-fund

# Copy app source (current build context) into the image
COPY . ./

# Create a non-root user and give ownership of the app directory
RUN useradd --create-home --shell /usr/sbin/nologin appuser \
  && chown -R appuser:appuser /app

ENV NODE_ENV=production

# Run as non-root user
USER appuser

EXPOSE 4010

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4010/api/session || exit 1

CMD ["node", "server.js"]
