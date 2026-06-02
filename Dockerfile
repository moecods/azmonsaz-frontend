FROM node:22-bookworm AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Baked into the client bundle at build time (see docker-compose.prod.yml + .env)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_USE_MOCK_DATA=false
ARG NEXT_PUBLIC_APP_NAME_FA=آزمون‌افزار
ARG NEXT_PUBLIC_APP_NAME_EN=azmonsaz
ARG NEXT_PUBLIC_REVERB_APP_KEY=
ARG NEXT_PUBLIC_REVERB_HOST=localhost
ARG NEXT_PUBLIC_REVERB_PORT=8080
ARG NEXT_PUBLIC_REVERB_SCHEME=http

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_USE_MOCK_DATA=${NEXT_PUBLIC_USE_MOCK_DATA}
ENV NEXT_PUBLIC_APP_NAME_FA=${NEXT_PUBLIC_APP_NAME_FA}
ENV NEXT_PUBLIC_APP_NAME_EN=${NEXT_PUBLIC_APP_NAME_EN}
ENV NEXT_PUBLIC_REVERB_APP_KEY=${NEXT_PUBLIC_REVERB_APP_KEY}
ENV NEXT_PUBLIC_REVERB_HOST=${NEXT_PUBLIC_REVERB_HOST}
ENV NEXT_PUBLIC_REVERB_PORT=${NEXT_PUBLIC_REVERB_PORT}
ENV NEXT_PUBLIC_REVERB_SCHEME=${NEXT_PUBLIC_REVERB_SCHEME}

RUN npm run build:docker

FROM node:22-bookworm AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
