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
| Styling         | Plain modern CSS (custom properties, grid, flexbox) in a single stylesheet, responsive and mobile-first |
| Database        | SQLite, via `better-sqlite3`                    |
| Input validation | Zod, via `@hono/zod-validator`                 |
| Testing         | Vitest, using Hono's `app.request()` for route tests |
| Feature validation | Vitest tests, run with `npm run validate`    |
| Dev server      | `tsx watch`                                     |
| Package manager | npm                                             |

## Conventions

- Source in `src/`, tests alongside code as `*.test.ts`.
- Routes grouped by feature (`agents`, `ailments`, `therapies`,
  `appointments`, `dashboard`).
- Every phase keeps `npm run validate` passing.
- Target current evergreen browsers (Chrome, Edge, Firefox, Safari); no
  legacy polyfills.
- Every page follows the responsive design rules below.

## Responsive design

The web UI works on phones, tablets, and desktops. Every page and component
is responsive from the phase that introduces it, not fixed up later.

- **Mobile-first CSS.** Base styles target small screens. Larger screens
  are handled by adding styles in `min-width` media queries; we do not use
  `max-width` media queries.
- **Standard breakpoints.** `40rem` (640px, tablet) and `64rem` (1024px,
  desktop). Use only these, so the site changes layout at consistent points.
- **Fluid layout.** Size things in `rem`, `%`, and viewport units, never
  fixed pixel widths. Cap content with `max-width: var(--content-width)` and
  keep a side gutter (`--gutter`) at every width. Use flexbox and grid with
  wrapping so rows stack on narrow screens.
- **Fluid type.** Base text is at least `1rem`; large headings scale with
  `clamp()`.
- **No horizontal scrolling** at any width from 320px up. Media scales down
  to its container, and long words wrap. Wide content such as tables gets
  its own scroll container or stacks into cards on small screens.
- **Touch-friendly.** Links, buttons, and form controls have a target at
  least `--touch-target` (2.75rem, 44px) tall. Form inputs use at least
  `1rem` text so phones don't zoom in on focus.
- **Viewport meta.** `Layout` always includes
  `<meta name="viewport" content="width=device-width, initial-scale=1">`.

### Checking responsiveness

- **Automated:** Vitest tests in `src/styles.test.ts` check the stylesheet
  follows these rules (mobile-first queries, standard breakpoints, no fixed
  pixel widths, touch targets), and component tests check the viewport meta.
- **Manual:** each feature's `validation.md` lists a check at 320px, 375px,
  768px, and 1280px wide in browser dev tools: no horizontal scrolling,
  nothing cut off or overlapping, and tappable controls.

## Testing and validation

Each feature's `validation.md` says how we know the work is done and can be
merged. We prove it with Vitest tests.

- **Automated checks are Vitest tests.** Every automated item in a feature's
  `validation.md` is covered by at least one Vitest test. If a check can't be
  written as a test, it goes under the manual checks instead.
- **Route tests use `app.request()`.** Tests import the Hono app and send
  requests to it directly, without starting a server or opening a port.
- **Tests live next to the code** as `*.test.ts` or `*.test.tsx`, and are
  left out of the build. Because they are outside `tsconfig.json`, `.tsx`
  test files start with `/** @jsxImportSource hono/jsx */`.
- **Component tests render JSX directly.** Render a component and check its
  HTML with `String(<Component />)`; no browser or DOM library is needed.
- **One command to validate.** `npm run validate` builds the project with
  `tsc` and then runs the full Vitest suite once. It must pass before a
  feature branch is merged.

| Script             | Command                          | Use                                   |
| ------------------ | -------------------------------- | ------------------------------------- |
| `npm test`         | `vitest run`                     | Run the tests once                    |
| `npm run test:watch` | `vitest`                       | Re-run tests on file changes while working |
| `npm run validate` | `npm run build && npm test`      | Merge check: build, then all tests    |

## Database: SQLite

We store data in SQLite, a single file on disk with no separate server to run.
This keeps setup to `npm install`, which suits reliability, course students,
and live demos.

- Driver: `better-sqlite3`, which has a simple synchronous API and is
  dependable.
- Database file lives at `data/agentclinic.db` and is git-ignored.
- Schema and seed data are applied by plain SQL scripts at startup.
- Tests use an in-memory database (`:memory:`) so each run starts clean.
