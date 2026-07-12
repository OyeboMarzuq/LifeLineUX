
## Goal
Replace all mock data and localStorage auth with real calls to the Lifeline .NET 9 API documented in `Lifeline_Frontend_Integration_Guide.md`. Keep current blue/purple/red theme and Vite stack (no Lovable plugins).

## 1. Foundation
- Add `axios` dependency.
- Create `.env` with `VITE_API_BASE_URL=https://localhost:44325/api` (overridable per environment).
- New `src/lib/api.ts` — axios instance with:
  - JSON default headers, baseURL from `VITE_API_BASE_URL`.
  - Request interceptor attaching `Bearer <accessToken>` from token store.
  - Response interceptor: 401 → single-flight refresh via `/auth/refresh-token` then retry; on refresh failure clear tokens + redirect to `/login`. 429 → toast with `Retry-After`. 422 → surface `errors[]`. Other codes → toast `message`.
  - Helper that unwraps the universal `ApiResponse<T>` envelope and throws on `!isSuccess`.
- New `src/lib/tokens.ts` — in-memory access token + refresh token, with a sessionStorage mirror for page reloads (access token in memory only at runtime per guide; refresh token in sessionStorage so a refresh survives reload). Pub/sub so the interceptor stays in sync.

## 2. Auth rewrite (`src/lib/auth.tsx`)
- Replace localStorage user store with API-backed auth:
  - `signup` → `POST /auth/register` (no role field; backend assigns `CampaignCreator`).
  - `login` → `POST /auth/login`.
  - `logout` → `POST /auth/logout` then clear tokens.
  - `changePassword` → `POST /auth/change-password` (forces re-login).
  - `requestPasswordReset` → `POST /auth/forgot-password` (no token returned).
  - `resetPassword` → `POST /auth/reset-password`.
  - Google sign-in → `POST /auth/google` (helper exposed; UI button optional, off by default).
- Hydrate `user` from JWT claims (`jwt-decode`) on boot + refresh.
- Keep `hasRole`, `hasAnyRole`, `isAdmin`, `canCreateCampaign` helpers — switch on the JWT role string.
- Remove the signup role picker UI (backend forces `CampaignCreator`).

## 3. Typed API client modules
Create thin per-domain modules that return already-unwrapped DTOs typed to the guide:
- `src/lib/api/campaigns.ts` — list, getBySlug, getMine, create, update, uploadCover (multipart), uploadDocument (multipart), postUpdate, listUpdates, remove.
- `src/lib/api/donations.ts` — initiate, verify, listForCampaign.
- `src/lib/api/admin.ts` — listCampaigns(status?), getCampaign, verify, reject(reason), listUsers, suspendUser, reactivateUser.
- `src/lib/api/payouts.ts` — request, mine, listAll(status?), approve, reject(reason).

## 4. Page wiring (all become live)
Use TanStack Query (`useQuery`/`useMutation` + `queryClient.invalidateQueries`) inside components. Loaders stay light to avoid SSR auth issues — protected fetches happen in components.

- `/` (`index.tsx`) — featured campaigns from `GET /campaign?pageSize=6` (verified only).
- `/campaigns` — paginated list from `GET /campaign`, client-side search/filter on the page.
- `/campaigns/$slug` — `GET /campaign/{slug}`, updates from `GET /campaign/{id}/updates`, donations list from `GET /donations/campaign/{id}`.
- `/donate/$slug` — donation form → `POST /donations/initiate` → `window.location.href = paymentUrl`. Supports guest fields.
- `/donate/callback` — read `?reference=`, `GET /donations/verify`, render success/failure/duplicate.
- `/create` — create campaign → `POST /campaign`, then cover image + documents uploads in sequence with progress.
- `/dashboard` — `GET /campaign/my`, edit/delete actions, link to request payout.
- `/dashboard/payouts` — `GET /payouts/my`, new payout request modal → `POST /payouts/request`.
- `/admin` — `GET /admin/campaigns` with status filter + pagination.
- `/admin/campaigns/$id` — `GET /admin/campaigns/{id}` with documents; approve → `PUT .../verify`; reject (reason textarea) → `PUT .../reject`.
- `/admin/payouts` — `GET /payouts`, approve/reject actions.
- `/admin/users` (new route) — `GET /admin/users` + suspend/reactivate (SuperAdmin only).
- `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/change-password` — already shaped; rewire to new auth API. Reset page reads `email` + `token` from URL search.
- `/unauthorized`, `/server-error`, `/medical-documents`, `/about`, `/faq`, `/organization` — static, leave as-is (light copy adjustments only if needed).

## 5. RBAC + route guards
- Gate creator routes (`/create`, `/dashboard*`) and admin routes (`/admin*`) via the existing `RoleGuard`, sourcing the role from the JWT.
- Header CTAs (`Start a fundraiser`, dashboard links) reflect the live role.

## 6. Mock data + dev affordances
- Delete `src/lib/mock-data.ts` and all imports of it.
- Add a small `src/components/empty-state.tsx` and `src/components/loading.tsx` used by every list page.
- Toasts via the existing `sonner` Toaster for error/success messaging from the interceptor.

## 7. Build / packaging
- Confirm `vite.config.ts` remains on the standard Vite + TanStack Start plugins (no Lovable plugin) — already the case.
- No backend code added (no Lovable Cloud, no server functions). Everything is browser → .NET API.

## Technical notes
- Token refresh implements the single-flight queue pattern from §14 of the guide.
- Multipart uploads omit manual `Content-Type` so axios sets the boundary.
- All money values are NGN integers; format with `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`.
- Pagination state lives in URL search params via `validateSearch` so links and refreshes preserve view.
- API base URL is read from `import.meta.env.VITE_API_BASE_URL` — the user can set it in `.env.local` or `.env.production`.

## Out of scope (won't touch unless asked)
- Google OAuth UI button (endpoint helper added, button left disabled).
- Real-time campaign updates / websockets.
- Theme/design changes — current blue/purple/red palette is preserved.
