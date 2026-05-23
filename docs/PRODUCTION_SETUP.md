# Production setup (frontend)

## Environment

Copy `.env.example` to `.env.local` (development) or configure hosting env vars:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Laravel API base URL |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | `false` in production |
| `NEXT_PUBLIC_APP_NAME_FA` | No | Branding |

## Build

```bash
npm ci
npm run build
npm run start
```

## E2E in CI

Cypress workflow builds the app and runs headless tests. Full exam flows may require a running API — configure secrets or use documented mocks.
