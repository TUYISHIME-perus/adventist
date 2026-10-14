FROM node:20-bullseye-slim

# Install build deps required for native modules (better-sqlite3)
RUN apt-get update && \
  apt-get install -y --no-install-recommends build-essential python3 ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY adventist/package.json ./
COPY adventist/package-lock.json ./

RUN npm ci --production

# Copy app
COPY adventist/ ./

ENV PORT=4010
EXPOSE 4010

CMD ["node", "server.js"]
