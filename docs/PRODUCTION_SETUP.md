# Production setup (frontend)

## Docker (recommended)

Backend runs separately (`azmonsaz` repo). Frontend only needs a `.env` file.

```bash
cp .env.prod.example .env
# Edit .env — URLs and Reverb (must match backend)
docker compose -f docker-compose.prod.yml up -d --build
```

All `NEXT_PUBLIC_*` values are **baked in at image build time** (Next.js).  
After changing `.env`, rebuild: `docker compose -f docker-compose.prod.yml up -d --build`.

## Sync with backend `.env`

| Frontend | Backend |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `${APP_URL}/api` |
| `NEXT_PUBLIC_REVERB_APP_KEY` | `REVERB_APP_KEY` |
| `NEXT_PUBLIC_REVERB_HOST` | Public host users open in browser (IP or domain), **not** `reverb` |
| `NEXT_PUBLIC_REVERB_PORT` | Published Reverb port (e.g. `8080` or `443` behind proxy) |
| `NEXT_PUBLIC_REVERB_SCHEME` | `http` or `https` (browser) |

Backend should set `FRONTEND_URL` to where this app is served (e.g. `http://your-server:3000`).

## Example (server IP)

```env
NEXT_PUBLIC_API_URL=http://194.5.207.92:8000/api
NEXT_PUBLIC_REVERB_APP_KEY=<same as backend REVERB_APP_KEY>
NEXT_PUBLIC_REVERB_HOST=194.5.207.92
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

## Local development

```bash
cp .env.example .env.local
npm run dev
```

## Without Docker

```bash
cp .env.prod.example .env.local   # or export vars
npm ci && npm run build && npm run start
```

## Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Laravel API base URL |
| `NEXT_PUBLIC_REVERB_APP_KEY` | Yes (realtime) | Must match backend |
| `NEXT_PUBLIC_REVERB_HOST` | Yes (realtime) | Browser WebSocket host |
| `NEXT_PUBLIC_REVERB_PORT` | Yes (realtime) | WebSocket port |
| `NEXT_PUBLIC_REVERB_SCHEME` | Yes (realtime) | `http` or `https` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | `false` in production |
| `NEXT_PUBLIC_APP_NAME_FA` | No | Branding |
| `NEXT_PORT` | No | Host port (default `3000`) |
