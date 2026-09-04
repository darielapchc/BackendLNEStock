# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FixIt Backend — REST API for a home services platform ("proyecto ancla" of a bootcamp). This repo is at an early stage (Session 1: setup + manual JWT auth module); expect the codebase to grow module by module (users, services, requests, etc.) in subsequent sessions. Comments in the code are written for students learning the stack and often explain *why*, not just *what* — preserve that style when editing existing files.

Code comments and documentation in this repo are written in Spanish; follow that convention when editing existing files.

## Commands

```bash
npm install       # install dependencies
npm run dev        # start with nodemon (auto-restart) — normal dev workflow
npm start           # start without nodemon
```

There is no `.env.example` committed, but `src/config/database.js` and `src/server.js`/`src/utils/jwt.js` read these env vars (see `.env` locally, never commit it):
`NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`.

A local MySQL database must exist before starting (`mysql -u root -p -e "CREATE DATABASE fixit_dev;"`). Generate JWT secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

No test suite, linter, or build step is configured yet (no test framework, no eslint/prettier config in package.json).

### Manual smoke test (curl)

```bash
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" \
  -d '{"fullName":"Ana Torres","email":"ana@example.com","password":"password123","role":"client"}'

curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -c cookies.txt -d '{"email":"ana@example.com","password":"password123"}'

curl http://localhost:4000/api/auth/me -H "Authorization: Bearer <accessToken>"

curl -X POST http://localhost:4000/api/auth/refresh -b cookies.txt -c cookies.txt
```

## Architecture

Strict layered architecture. A request always flows in one direction, and the response returns the same way in reverse:

```
Route → Middleware (validation/auth) → Controller → Service → Repository → Model → DB
```

Skipping a layer (e.g. calling Sequelize directly from a Controller) is considered an architecture violation.

- **`src/app.js`** — Express app configuration only (middleware, routes, error handler). Does *not* start the server — this separation exists so integration tests can `require('./app')` without binding a real port.
- **`src/server.js`** — entry point: loads env, connects to MySQL (`sequelize.authenticate()`), registers models (imported here so Sequelize associations like `User.hasMany(RefreshToken)` are set up before sync), runs `sequelize.sync({ alter: true })` **only when `NODE_ENV === 'development'`** (never in production — migrations via `sequelize-cli` are the intended production path, not yet implemented), then `app.listen`.
- **`src/config/database.js`** — Sequelize instance, configured entirely from env vars.
- **`src/models/`** — Sequelize model definitions (the shape of the data). Associations between models are declared in the model file (see `refreshToken.model.js`).
- **`src/repositories/`** — the *only* layer allowed to import/query Sequelize models directly. Services must go through a repository, never touch a model. This is the seam intended for swapping ORMs later without touching business logic. Repositories are exported as singleton instances (`module.exports = new XRepository()`).
- **`src/services/`** — pure business logic. Services never reference `req`/`res` or know they're behind HTTP. Domain errors are thrown as `Error` objects with a `.statusCode` property attached (e.g. `error.statusCode = 409`); the controller/error handler translates these to HTTP responses, not the service.
- **`src/controllers/`** — thin: parse the request, call one service method, set status code/response shape. No business-logic conditionals here — an `if` deciding business rules inside a controller is a smell and belongs in the service. All controller methods wrap calls in try/catch and forward errors via `next(err)` to the centralized `errorHandler`.
- **`src/middlewares/`** — `authenticate` (verifies the `Authorization: Bearer <accessToken>` header, sets `req.user = { id, role }`, distinguishes `TOKEN_EXPIRED` from a generally invalid token so the frontend knows whether to call `/refresh`), `authorize(...roles)` (RBAC gate, used after `authenticate`), `validate` (runs `express-validator`'s `validationResult` and short-circuits with 400 before the controller), `errorHandler` (must be the last middleware registered in `app.js`; only 500s are logged server-side, business errors return `err.message` as-is).
- **`src/routes/`** — endpoint definitions with `express-validator` rules declared inline (validation rules live next to the route because they're the endpoint's contract). `src/routes/index.js` mounts feature routers under `/api` (e.g. `/api/auth`); new feature routers get added there as the app grows.
- **`src/utils/`** — pure, framework-agnostic helpers: `jwt.js` (sign/verify access + refresh tokens) and `password.js` (bcrypt hash/compare, 12 salt rounds).

### Auth model specifics

- Access and refresh tokens use **separate JWT secrets** (`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`) to limit blast radius if one leaks.
- Access token: 15 min expiry, stateless, sent in `Authorization: Bearer` header, minimal payload (`sub`, `role` only — never `passwordHash` or other sensitive data, since a JWT is signed but not encrypted).
- Refresh token: 7 day expiry, persisted in the `refresh_tokens` table (via `RefreshToken` model/repository) so it can be revoked; delivered as an `httpOnly` + `secure` (prod only) + `sameSite=strict` cookie scoped to `path: '/api/auth'`, never in `localStorage`.
- Refresh rotation: every `/api/auth/refresh` call revokes the presented refresh token and issues a new one (limits damage from a stolen token to one use).
- Login returns a generic "credenciales inválidas" error for both "user not found" and "wrong password" to avoid user-enumeration.
- `role` accepted at registration is restricted to `client`/`provider` via `express-validator`'s `isIn` — `admin` is never self-assignable through the public API.
- `AuthService.logoutAllDevices(userId)` exists (revokes every refresh token for a user) but is not yet wired to a route — see README's student exercise for the intended `POST /api/auth/logout-all` endpoint.
