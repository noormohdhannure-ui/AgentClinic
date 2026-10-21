# Requirements: Hello, clinic (Phase 1)

## Context

This is Phase 1 of `specs/roadmap.md`. The project currently has a TypeScript
starter (`src/index.ts` logs a message) with CommonJS output and no web
server. This phase sets up the foundation every later phase builds on:
a running Hono server, a shared page layout with a stylesheet, the npm
scripts, and a working test setup.

See `specs/mission.md` (reliable first, attractive and modern, small visible
steps) and `specs/tech-stack.md` (Hono on Node.js, Hono JSX, plain modern
CSS, Vitest, `tsx watch`).

## Scope

### In scope

- A main layout component made of three subcomponents: header, main, and
  footer (see below).
- One stylesheet, served by the app and linked from the layout.
- A minimal AgentClinic home page rendered inside the layout, served at
  `GET /` using Hono with `@hono/node-server`.
- npm scripts: `dev`, `build`, `start`, `test`, `test:watch`, and
  `validate`.
- Vitest tests covering every automated check in `validation.md`: routes,
  components, and project setup.

### Main layout

`Layout` renders the full HTML5 document and is used by every page:

- `<html lang="en">`, a UTF-8 charset, a viewport meta tag, and a `<title>`
  passed in by the page.
- `<link rel="stylesheet" href="/styles.css">`.
- A body made of three subcomponents, each in its own file under
  `src/components/`:
  - **Header**: the "AgentClinic" brand, linking to `/`.
  - **Main**: wraps the page's own content.
  - **Footer**: a copyright line, "© <current year> AgentClinic".

### Stylesheet

`public/styles.css` gives the site a clean, modern, responsive look in
current evergreen browsers, following the responsive design rules in
`specs/tech-stack.md`:

- Colors, fonts, and spacing defined as CSS custom properties on `:root`,
  with a dark color scheme when the browser prefers it.
- Brand colors orange (`#f97316`) and black (`#0a0a0a`), following the brand
  color rules in `specs/tech-stack.md`: black header and footer bars, the
  brand name in orange with an orange border under the header, darker orange
  for text on light backgrounds, and at least 4.5:1 text contrast in both
  color schemes.
- System font stack; no web fonts or images.
- Mobile-first: base styles fit a 320px-wide phone, and `min-width` media
  queries at `40rem` and `64rem` widen the gutter and vertical spacing.
- Header and footer span the full width; content is centered and capped at
  `--content-width`, with a side gutter at every width.
- The header is a wrapping flex row, ready for Phase 2's navigation.
- The brand link is at least `--touch-target` (44px) tall.
- The heading scales with `clamp()`; body text is `1rem`.
- Media scales to its container and long words wrap, so nothing causes
  horizontal scrolling.
- The footer stays at the bottom of the window on short pages.

### Minimal home page

The home page's content, inside the layout, is only:

- An `<h1>` reading "AgentClinic".
- One `<p>` with the tagline: "Care for AI agents and the ailments they pick
  up from their humans."

### Out of scope

- Navigation links beyond the brand link (Phase 2).
- Describing the clinic's services on the home page (Phase 2).
- Client-side JavaScript.
- SQLite and any data (Phase 2 onward).
- A health-check route.

## Decisions

- **ES modules.** Move the project to ESM: `"type": "module"` in
  `package.json`, and `tsconfig.json` uses `"module": "NodeNext"`,
  `"moduleResolution": "NodeNext"`, and `"target": "ES2022"`. Hono and
  Vitest are ESM-first, and doing this now avoids a migration later.
- **Hono JSX for views.** `tsconfig.json` sets `"jsx": "react-jsx"` and
  `"jsxImportSource": "hono/jsx"`. Pages and components are `.tsx` files
  rendered on the server; no React and no client bundle.
- **One component per file.** The header, main, and footer components each
  live in their own file in `src/components/`: `Header.tsx`, `Main.tsx`, and
  `Footer.tsx`. Each file exports only its component. `Layout.tsx` is a
  separate file that imports and composes them; none of the three are
  defined inline in `Layout.tsx` or in a page. Pages such as `src/home.tsx`
  wrap their content in `Layout`.
- **App and server are separate.** `src/app.ts` builds and exports the Hono
  app; `src/index.ts` starts the Node server. Tests import the app and call
  `app.request()` without opening a port.
- **Doctype added by the route.** JSX cannot emit `<!doctype html>`, so the
  route prepends it to the rendered page.
- **Static files from `public/`.** `src/app.ts` imports `serveStatic` from
  `@hono/node-server/serve-static` and serves `./public` after the routes,
  so `public/styles.css` is available at `/styles.css`. Paths resolve from
  the project root, which is where the npm scripts run.
- **Port.** The server listens on `PORT` from the environment, defaulting to
  `3000`.
- **Dependencies.** Runtime: `hono`, `@hono/node-server`. Dev: `typescript`,
  `tsx`, `vitest`, `@types/node`.
- **Tests excluded from build.** `*.test.ts` and `*.test.tsx` files are not
  emitted to `dist/`. Because of this, `.tsx` test files name the JSX runtime
  with a `/** @jsxImportSource hono/jsx */` comment.
- **Responsive from the start.** The layout and stylesheet follow the
  responsive design rules in `specs/tech-stack.md` now, so later phases
  build on a mobile-first base instead of retrofitting one.
- **Validation with Vitest.** Following `specs/tech-stack.md`, every
  automated check in `validation.md` is a Vitest test, and
  `npm run validate` (build, then all tests) is the merge check. Checks that
  need a person in a browser stay manual.
