#!/bin/sh
set -e
cd /app

# Compile caches must live on Docker volumes (see docker-compose.dev.yml)
mkdir -p .next .turbo

exec npm run dev:docker
