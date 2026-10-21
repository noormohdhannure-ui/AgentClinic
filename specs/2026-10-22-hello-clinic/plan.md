# Plan: Hello, clinic (Phase 1)

See `requirements.md` for scope and decisions, and `validation.md` for the
merge checklist.

## 1. Move the project to ES modules

1. Add `"type": "module"` to `package.json`.
2. Update `tsconfig.json`: `"target": "ES2022"`, `"module": "NodeNext"`,
   `"moduleResolution": "NodeNext"`, keep `strict`, `outDir: "dist"`.
3. Enable Hono JSX: `"jsx": "react-jsx"`, `"jsxImportSource": "hono/jsx"`.
4. Exclude `src/**/*.test.ts` and `src/**/*.test.tsx` from the TypeScript
   build.
5. Confirm `npm run build` still succeeds (the `validate` script comes in
   group 8).

## 2. Install dependencies

1. Install runtime dependencies: `hono`, `@hono/node-server`.
2. Install dev dependencies: `tsx`, `vitest`, `@types/node`.

## 3. Build the main layout component

Each component goes in its own file in `src/components/`, exporting only
that component.

1. Create `src/components/Header.tsx`: a `<header class="site-header">` with
   an "AgentClinic" brand link to `/`.
2. Create `src/components/Main.tsx`: a `<main class="site-main">` that renders
   its `children`.
3. Create `src/components/Footer.tsx`: a `<footer class="site-footer">` with
   a copyright line for the current year.
4. Create `src/components/Layout.tsx` taking `title` and `children`. It
   imports `Header`, `Main`, and `Footer` from their files and renders
   the HTML5 document (`lang="en"`, UTF-8 charset, viewport meta, `<title>`),
   links the stylesheet, and composes `<Header />`, `<Main>{children}</Main>`,
   and `<Footer />` in the body.

## 4. Add the responsive stylesheet

Follow the responsive design rules in `specs/tech-stack.md`.

1. Create `public/styles.css` with color and font tokens on `:root` and a
   dark-mode override under `prefers-color-scheme: dark`. Start the color
   tokens from the brand colors, `--color-brand-orange` and
   `--color-brand-black`, as set out in `specs/tech-stack.md`.
2. Write mobile-first base styles for small screens, with `--gutter` and
   `--space-y` tokens that grow at the `40rem` and `64rem` breakpoints in
   `min-width` media queries.
3. Lay out the body as a grid so the footer stays at the bottom of short
   pages (`min-height: 100dvh`).
4. Style the header and footer as black bars, the header as a wrapping flex
   row with an orange bottom border, the brand link in orange with a
   `--touch-target` minimum height, the main content capped at
   `--content-width` with a side gutter, a `clamp()` heading, and the footer.
5. Add base rules so media scales to its container and long words wrap.
6. In `src/app.ts`, import `serveStatic` from
   `@hono/node-server/serve-static` and serve `./public`, so the file is
   available at `/styles.css`.
7. Link it from `Layout` with `<link rel="stylesheet" href="/styles.css">`.

## 5. Create the minimal home page

1. Create `src/home.tsx` exporting a `HomePage` component.
2. Render `<Layout title="AgentClinic">` containing an `<h1>` reading
   "AgentClinic" and a `<p>` with the tagline from `requirements.md`.

## 6. Build the Hono app

1. Create `src/app.ts` that creates a Hono app and exports it.
2. Add `GET /` responding with `<!doctype html>` followed by the rendered
   `HomePage`.
3. Register the static file middleware from group 4 after the routes.

## 7. Start the server

1. Replace `src/index.ts` so it imports the app and serves it with
   `@hono/node-server`.
2. Read `PORT` from the environment, defaulting to `3000`.
3. Log the URL the server is listening on.

## 8. Add npm scripts

1. `dev`: `tsx watch src/index.ts`
2. `build`: `tsc`
3. `start`: `node dist/index.js`
4. `test`: `vitest run`
5. `test:watch`: `vitest`
6. `validate`: `npm run build && npm test`

## 9. Add Vitest tests

Every automated check in `validation.md` is covered by a Vitest test.

1. Route tests in `src/app.test.ts`, using `app.request()`:
   1. `GET /` returns 200 with an HTML `Content-Type`, starts with
      `<!doctype html>`, and contains the title, heading, and tagline.
   2. The page has the header, main, and footer elements, with the heading
      inside `<main>`, and links the stylesheet.
   3. The page's only link is the brand link, with no `<script>` or `<nav>`.
   4. `GET /styles.css` returns 200 with a CSS `Content-Type`.
   5. An unknown route returns 404.
2. Component tests in `src/components/components.test.tsx`:
   1. `Header`, `Main`, and `Footer` each render their element and content.
   2. `Layout` renders the document head, title, and stylesheet link, and
      composes header, main, and footer in order.
   3. Each component file exports only its component, and `Layout.tsx`
      imports the other three from their own files.
   4. Start the file with `/** @jsxImportSource hono/jsx */`, since test
      files are outside `tsconfig.json`.
3. Responsive stylesheet tests in `src/styles.test.ts`, reading
   `public/styles.css`:
   1. Width media queries are `min-width` only and use only the `40rem` and
      `64rem` breakpoints.
   2. No fixed pixel widths.
   3. Main content is capped at `--content-width` with a side gutter.
   4. Media is capped at `100%` width and long words wrap.
   5. The brand link has a `--touch-target` minimum height, and the heading
      uses `clamp()`.
   6. The brand tokens are orange `#f97316` and black `#0a0a0a`; the header
      and footer use the black bar color, the header has a 4px orange
      border, and the brand link is orange.
   7. Every text and background color pair has at least 4.5:1 contrast in
      both the light and dark schemes.
4. Project tests in `src/project.test.ts`:
   1. `package.json` is an ES module package and defines all six scripts.
   2. `tsconfig.json` leaves test files out of the build.
5. Run `npm test` and confirm it passes.

## 10. Verify

1. Run `npm run validate` and confirm the build and every test pass.
2. Work through the manual checks in `validation.md`.
