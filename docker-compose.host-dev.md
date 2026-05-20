# Run frontend on Mac (fast)

1. Backend + DB: see `../azmonsaz-docs/DOCKER_FAST_DEV.md` (database in Docker, `php artisan serve` on Mac).

2. Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

3. Start:

```bash
npm run dev
```

Do **not** run `docker-compose.dev.yml` for the frontend in this mode.

`npm run dev` uses Turbopack and native macOS filesystem — same speed as before Docker.
