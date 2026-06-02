# Frontend production (Docker)

## Deploy

```bash
cd azmonsaz-frontend
cp .env.prod.example .env
# Edit .env — for a public server use your IP/domain, not localhost:
#   NEXT_PUBLIC_API_URL=http://YOUR_IP:8000/api
#   NEXT_PUBLIC_REVERB_HOST=YOUR_IP
docker compose -f docker-compose.prod.yml up -d --build
```

Open: `http://YOUR_IP:3000` (or `NEXT_PORT`).

## Checklist (with backend)

| Frontend `.env` | Backend `.env` |
|-----------------|----------------|
| `NEXT_PUBLIC_API_URL` = `{APP_URL}/api` | `APP_URL` |
| `NEXT_PUBLIC_REVERB_APP_KEY` | `REVERB_APP_KEY` (same value) |
| `NEXT_PUBLIC_REVERB_HOST` | Public host (IP/domain), **not** `reverb` |
| `NEXT_PUBLIC_REVERB_PORT` | Published Reverb port (e.g. `8080`) |
| — | `FRONTEND_URL` = where this app is served |

After any `.env` change: rebuild (`--build`).

## Smoke test

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
# expect 200 or 307

docker compose -f docker-compose.prod.yml ps
# next should be healthy
```

## Common mistakes

1. Running compose from the **backend** repo — run from `azmonsaz-frontend`.
2. No `.env` file — only `.env.prod.example` is not enough; run `cp .env.prod.example .env`.
3. `NEXT_PUBLIC_REVERB_HOST=localhost` on a remote server — browsers on other machines cannot connect.
4. Forgetting `--build` after editing `.env` (values are baked at build time).
