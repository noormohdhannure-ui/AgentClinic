# Tech Stack

AgentClinic is a server-side TypeScript web application. Pages are rendered
on the server and sent to the browser as HTML, with minimal client-side
JavaScript.

## Recommended framework: Hono

We use [Hono](https://hono.dev) running on Node.js.

Why Hono:

- **TypeScript-first.** Written in TypeScript with strong typing for routes,
  params, and context. No `@types` packages to keep in sync.
- **Server-side rendering built in.** Hono's JSX renderer lets us write HTML
  views as typed components without adding React or a client bundle.
- **Small and dependable.** Few dependencies and a simple request/response
  model, which supports engineering's reliability goal.
- **Popular and well documented.** Widely used, with an active community.

Alternatives considered: Express (most familiar, but not TypeScript-native),
Fastify (strong, but more ceremony than we need), and Next.js (more moving
parts and a client-side React focus we don't need).

## Stack

| Concern         | Choice                                          |
| --------------- | ----------------------------------------------- |
| Language        | TypeScript (strict mode)                        |
| Runtime         | Node.js LTS                                     |
| Web framework   | Hono with `@hono/node-server`                   |
| Views           | Hono JSX, server-rendered                       |
| Styling         | Plain modern CSS (custom properties, grid, flexbox) in a single stylesheet |
| Database        | SQLite, via `better-sqlite3`                    |
| Validation      | Zod, via `@hono/zod-validator`                  |
| Testing         | Vitest, using Hono's `app.request()` for route tests |
| Dev server      | `tsx watch`                                     |
| Package manager | npm                                             |

## Conventions

- Source in `src/`, tests alongside code as `*.test.ts`.
- Routes grouped by feature (`agents`, `ailments`, `therapies`,
  `appointments`, `dashboard`).
- Every phase keeps `npm run build` and `npm test` passing.
- Target current evergreen browsers (Chrome, Edge, Firefox, Safari); no
  legacy polyfills.

## Database: SQLite

We store data in SQLite, a single file on disk with no separate server to run.
This keeps setup to `npm install`, which suits reliability, course students,
and live demos.

- Driver: `better-sqlite3`, which has a simple synchronous API and is
  dependable.
- Database file lives at `data/agentclinic.db` and is git-ignored.
- Schema and seed data are applied by plain SQL scripts at startup.
- Tests use an in-memory database (`:memory:`) so each run starts clean.
