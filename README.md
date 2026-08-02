# Academic Planner Web

Responsive Thai-first Academic Planner built with Next.js App Router, TypeScript, Tailwind CSS, React Query, React Hook Form, Zod, Dexie, Recharts, Vitest, and Playwright.

## Security architecture

The browser calls only same-origin `/api/bff` routes. The backend refresh token is stored in the `ap_refresh` cookie with `HttpOnly`, `SameSite=Lax`, a restricted auth path, and `Secure` in production. Access tokens live only in memory. Auth mutations enforce same-origin requests, and the domain proxy accepts only declared API domains and safe path segments.

Guest data is kept in IndexedDB and exported as `schema_version: 1`, compatible with the backend guest-import flow. Passwords, access tokens, refresh tokens, VAPID private keys, and database credentials are never included in exports or committed to Git.

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `BACKEND_API_URL` to the Render API root, including `/api/v1`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The GitHub Actions workflow runs all checks and uploads the Playwright report on failure.

## Vercel

Import the private `Yoshi4489/academic_planner_web` repository into Vercel.

- Production branch: `main`
- Preview branches: pull requests and `develop`
- Required environment: `BACKEND_API_URL=https://<render-service>/api/v1`
- Do not place the VAPID private key in Vercel. The public key is read through the authenticated backend endpoint.

## Web Push rollout

Deploy in this order:

1. Run the backend Prisma migration.
2. Deploy backend subscription APIs with the scheduled worker disabled.
3. Configure Render secrets: `WEB_PUSH_VAPID_PUBLIC_KEY`, `WEB_PUSH_VAPID_PRIVATE_KEY`, and `WEB_PUSH_SUBJECT`.
4. Deploy a Vercel preview and validate permission denied, permission granted, subscription rotation, and notification deep links.
5. Create a Render scheduled job that runs `npm run notifications:dispatch` every minute or the shortest supported interval.
6. Enable the worker only after preview validation, then promote `develop` to `main` through a reviewed PR.

## Git flow

Changes move through `feature/* → develop → main`. Do not force-push or commit secrets. Protect `main` with required Web CI checks and pull-request reviews.
