FROM node:20-bullseye-slim

# Install build deps required for native modules (better-sqlite3)
RUN apt-get update && \
  apt-get install -y --no-install-recommends build-essential python3 ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json only so we can run npm install without relying on a lockfile
COPY adventist/package.json ./

# Install production dependencies
RUN npm install --production

# Copy app code
COPY adventist/ ./

# Copy .env if present in the repo (used for quick deployments). Platforms should set env vars securely instead.
ARG COPY_ENV=true
COPY adventist/.env ./ .

ENV PORT=4010
EXPOSE 4010

CMD ["node", "server.js"]
