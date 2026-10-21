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
5. Confirm `npm run build` still succeeds.

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

## 4. Add the stylesheet

1. Create `public/styles.css` with color and font tokens on `:root` and a
   dark-mode override under `prefers-color-scheme: dark`.
2. Lay out the body as a grid so the footer stays at the bottom of short
   pages.
3. Style the header, brand link, main content width, heading, and footer.
4. In `src/app.ts`, import `serveStatic` from
   `@hono/node-server/serve-static` and serve `./public`, so the file is
   available at `/styles.css`.
5. Link it from `Layout` with `<link rel="stylesheet" href="/styles.css">`.

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

## 9. Add tests

1. In `src/app.test.ts`, call `app.request("/")` and assert status 200 and an
   HTML `Content-Type`.
2. Assert the body starts with `<!doctype html>` and contains the title,
   heading, and tagline.
3. Assert the body has the header, main, and footer elements, with the
   heading inside `<main>`, and the stylesheet link.
4. Call `app.request("/styles.css")` and assert status 200 and a CSS
   `Content-Type`.
5. Run `npm test` and confirm it passes.

## 10. Verify

1. Work through every item in `validation.md`.
