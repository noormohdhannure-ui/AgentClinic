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
| Brand colors    | Orange and black, as CSS custom properties      |
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
- Component props are defined as a named TypeScript `type` above the
  component (`type LayoutProps = { ... }`), not inline in the function
  signature.

## Brand colors

AgentClinic's brand colors are **orange and black**. They are defined once as
CSS custom properties in `public/styles.css`, and every other color is built
around them.

| Token                  | Value     | Use                                      |
| ---------------------- | --------- | ---------------------------------------- |
| `--color-brand-orange` | `#f97316` | Brand name, header accent border, highlights on black |
| `--color-brand-black`  | `#0a0a0a` | Header and footer bars, body text (light scheme), page background (dark scheme) |
| `--color-accent`       | `#c2410c` light, `#fb923c` dark | Orange for links (visited too) and text on the page background |
| `--color-focus`        | `#c2410c` light, bright orange dark and on the bars | `:focus-visible` outline (3:1 against what it sits on) |
| `--color-button-bg` / `--color-button-text` | bright orange / black | Buttons (7:1). Never white on bright orange (2.8:1) |
| `--color-input-border` | `#737373`  | Form control borders (3:1 against page and surface) |
| `--color-error`        | `#b91c1c` light, `#f87171` dark | Error text and invalid-field borders |
| `--color-bar-strong`   | `#fafafa`  | Headings on black (the home hero) |
| `--color-badge-bg` / `--color-badge-text` | orange-100 / orange-800 light, orange-950 / orange-300 dark | Status badges and status messages |

- **Header and footer are black bars** in both color schemes, with the
  brand name in bright orange and an orange border under the header.
- **Bright orange is not used for text on light backgrounds.** It reaches
  only 2.8:1 contrast on white, so text uses the darker `--color-accent`
  orange instead. Bright orange is for black backgrounds and decoration.
- **Text contrast is at least 4.5:1** (WCAG AA) in both color schemes.
  Vitest tests in `src/styles.test.ts` check the brand tokens and compute
  the contrast of every text and background pair.
- Grays are neutral (no blue or warm tint) so they sit with black and orange.
- **Header and footer links** use the bar colors, never `--color-accent`,
  which is only 3.8:1 on black.
- **Avatars** use black on bright orange (7:1), the same pair as buttons.
- **Non-text contrast is at least 3:1:** focus rings and form control
  borders. The contrast test covers these pairs too, and every color token
  must be used by some rule.

## Visual design

The look is modern and calm: orange and black, with neutral surfaces.

- **Shape and depth.** Corners use `--radius` (`0.75rem`), and cards use
  `--shadow`, rising to `--shadow-raised` on hover.
- **Components.** Each is styled once in `public/styles.css`:
  - buttons: a primary pill in orange, and a secondary outline;
  - cards: the whole card is the link, via a stretched heading link;
  - avatars, badges, panels, and page headers;
  - the home hero.
- **Inline SVG only.** The logo mark is an inline SVG, hidden from screen
  readers, and `public/favicon.svg` is the same mark. There are no other
  images and no web fonts.
- **Motion.** Movement is small: hover lifts of 1–2px. It is turned off
  under `prefers-reduced-motion: reduce`.

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
- **Fluid type.** Body text, form controls, and links are at least `1rem`;
  large headings scale with `clamp()`. Secondary text, such as the footer's
  copyright line, may be `0.875rem` but never smaller, and still meets the
  4.5:1 contrast rule.
- **No horizontal scrolling** at any width from 320px up. Media scales down
  to its container, and long words wrap. Wide content such as tables gets
  its own scroll container or stacks into cards on small screens.
- **Touch-friendly.** Every link, button, and form control has a target at
  least `--touch-target` (2.75rem, 44px) tall. This includes links inside
  cards, empty states, and "back" links. A link inside running text uses
  the `.back-link` class or becomes a button. Form inputs use at least
  `1rem` text so phones don't zoom in on focus.
- **Viewport meta.** `Layout` always includes
  `<meta name="viewport" content="width=device-width, initial-scale=1">`.

### Checking responsiveness

- **Automated:** Vitest tests in `src/styles.test.ts` check the stylesheet
  follows these rules (mobile-first queries, standard breakpoints, no fixed
  pixel widths, touch targets), and component tests check the viewport meta.
- **Browser:** each feature's `validation.md` lists a check at 320px,
  375px, 768px, and 1280px wide, in light and dark mode. It covers:
  - no horizontal scrolling;
  - nothing cut off or overlapping;
  - tappable controls of at least 44px;
  - no console errors or script requests.

  A headless Chrome script can run it, taking screenshots for a person to
  review.

## Testing and validation

Each feature's `validation.md` says how we know the work is done and can be
merged. We prove it with Vitest tests.

- **Automated checks are Vitest tests.** Every automated item in a feature's
  `validation.md` is covered by at least one Vitest test. If a check can't be
  written as a test, it goes under the manual checks instead.
- **Route tests use `app.request()`.** Tests import the Hono app and send
  requests to it directly, without starting a server or opening a port.
- **Tests live next to the code** as `*.test.ts` or `*.test.tsx`. Shared
  test helpers live in `src/test/`.
- **Tests are type-checked.** `tsconfig.json` includes every file in `src/`,
  tests too, and is used for type-checking. `tsconfig.build.json` extends
  it and leaves out the tests and `src/test/`, so they never reach `dist/`.
  Vitest reads the JSX settings from `tsconfig.json`, so test files need no
  JSX pragma. After changing a tsconfig, run `npx vitest --clearCache`:
  Vitest caches transformed files by content, not by config.
- **Route tests use a fresh database.** `createTestApp()` from
  `src/test/helpers.ts` opens an in-memory database and passes a fixed
  `now`, so tests don't depend on the clock.
- **Component tests render JSX directly.** Render a component and check its
  HTML with `String(<Component />)`; no browser or DOM library is needed.
- **One command to validate.** `npm run validate` type-checks everything,
  builds the project, and then runs the full Vitest suite once. It must
  pass before a feature branch is merged.

| Script             | Command                          | Use                                   |
| ------------------ | -------------------------------- | ------------------------------------- |
| `npm test`         | `vitest run`                     | Run the tests once                    |
| `npm run test:watch` | `vitest`                       | Re-run tests on file changes while working |
| `npm run build`    | `tsc -p tsconfig.build.json`     | Build `dist/`, without the tests      |
| `npm run validate` | `tsc --noEmit && npm run build && npm test` | Merge check: type-check, build, then all tests |

## Database: SQLite

We store data in SQLite, a single file on disk with no separate server to run.
This keeps setup to `npm install`, which suits reliability, course students,
and live demos.

- Driver: `better-sqlite3`, which has a simple synchronous API and is
  dependable. Version 13 ships prebuilt binaries, including Windows x64. If
  npm asks to approve its `node-gyp` install script, don't: building from
  source needs Visual Studio build tools, and the prebuilt binary works
  without it.
- Database file lives at `data/agentclinic.db` and is git-ignored. Like
  `public/`, it is found relative to the working directory, so always run
  the server from the project root (the npm scripts do).
- **Migrations.** The schema and seed data are an ordered list of SQL
  strings in `src/db/migrations.ts`, applied at startup by `openDb()`.
  `PRAGMA user_version` records how many have run, so each runs once per
  database file. Each migration creates its tables and inserts the seed
  data that goes with them. Never edit a shipped migration; add a new one.
  The SQL lives in TypeScript rather than `.sql` files, because `tsc` doesn't
  copy `.sql` files into `dist/`.
- Foreign keys are on. Queries live in one file per feature under
  `src/db/`; routes don't contain SQL.
- Tests use an in-memory database (`:memory:`) so each run starts clean.

## Time

Times are server-local strings in the form `YYYY-MM-DDTHH:MM`, the same
format a `datetime-local` input sends, so they compare correctly as
strings. The app gets the current time from `localNow()` in `src/time.ts`,
built from local getters; never use `toISOString()`, which is UTC. Pages
say that times are in clinic time.

Two limits are accepted for now:

- During the daylight-saving fall-back hour, local times are ambiguous.
- Moving the server to another time zone shifts the meaning of every
  stored time.
