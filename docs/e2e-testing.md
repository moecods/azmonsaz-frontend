# E2E Testing with Cypress

This project uses Cypress for end-to-end tests. Specs live under `cypress/e2e/` and are grouped by feature (auth, navigation, admin, exams, etc.).

## Running tests

- **Interactive:** `npm run cy:open` (requires the app to be running, e.g. `npm run dev`).
- **Headless:** `npm run cy:run` (app must be running).
- **Full pipeline:** `npm run build && npm run test:e2e` (builds, starts the app, then runs Cypress).

See [README.md](../README.md#e2e-testing-cypress) for environment variables and test user setup.

## Conventions

- **Selectors:** Prefer `data-cy` attributes for stable selectors. Use the custom command `cy.getByTestId('id')` which resolves to `[data-cy="id"]`.
- **Auth:** Use `cy.login(phone?, password?)` to log in; omit arguments to use `cypress/fixtures/auth.json`. The fixture must match the backend: credentials in `auth.json` are the same as in the Laravel `UserSeeder` (admin `09123456789` / `password`, creator `09123456791` / `password`). Use `cy.logout()` to clear the token.
- **Naming:** Spec files are named `*.cy.ts` and grouped in folders (e.g. `auth/login.cy.ts`, `admin/partners.cy.ts`).

## When to stub API

- **Local with backend:** Run the Laravel API and use real login/data; no stubs needed.
- **CI without backend:** Stub `POST **/login` and `GET **/me` in `cypress/support/e2e.ts` or in a dedicated spec, and optionally stub list/create endpoints so admin and exam specs can run without a real API.

## Adding new specs

1. Add a new `*.cy.ts` file under `cypress/e2e/<feature>/`.
2. Add `data-cy` to any new UI elements you need to target.
3. Use `cy.login()` in `beforeEach` for protected pages; use fixture credentials for admin when needed.
