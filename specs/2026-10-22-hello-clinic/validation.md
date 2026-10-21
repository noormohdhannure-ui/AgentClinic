# Validation: Hello, clinic (Phase 1)

This phase can be merged when every item below is true.

## Automated checks

Run with `npm run validate`, which builds the project with `tsc` and then
runs every Vitest test once.

- [ ] `npm run validate` passes: the build has no TypeScript errors and every
      test passes.

Each item below is covered by a Vitest test.

### Routes (`src/app.test.ts`)

- [ ] `GET /` returns status 200 with an HTML `Content-Type`.
- [ ] The page starts with `<!doctype html>` and contains
      `<title>AgentClinic</title>`, the "AgentClinic" heading, and the
      tagline.
- [ ] The page has the header, main, and footer elements, with the heading
      inside `<main>`, and links `/styles.css`.
- [ ] The page's only link is the header's brand link, and it has no
      `<script>` or `<nav>`.
- [ ] `GET /styles.css` returns status 200 with a CSS `Content-Type`.
- [ ] An unknown route returns 404.

### Components (`src/components/components.test.tsx`)

- [ ] `Header` renders the "AgentClinic" brand link to `/`.
- [ ] `Main` wraps its children in `<main class="site-main">`.
- [ ] `Footer` renders "© <current year> AgentClinic".
- [ ] `Layout` renders `lang="en"`, the UTF-8 charset, the viewport meta tag,
      the page's title, and the stylesheet link.
- [ ] `Layout` composes header, main, and footer in that order.
- [ ] `Header.tsx`, `Main.tsx`, `Footer.tsx`, and `Layout.tsx` each export
      only their own component.
- [ ] `Layout.tsx` imports `Header`, `Main`, and `Footer` from their own
      files and does not define any of them inline.

### Responsive stylesheet (`src/styles.test.ts`)

- [ ] Width media queries are `min-width` only (mobile-first).
- [ ] The only breakpoints are `40rem` and `64rem`.
- [ ] No fixed pixel widths.
- [ ] Main content is capped at `--content-width` with a side gutter.
- [ ] Media is capped at `100%` width, and long words wrap.
- [ ] The brand link has a `--touch-target` (2.75rem) minimum height.
- [ ] The heading scales with `clamp()`.

### Brand colors (`src/styles.test.ts`)

- [ ] The brand tokens are orange `#f97316` and black `#0a0a0a`.
- [ ] The header and footer use the black bar color, the header has a 4px
      orange bottom border, and the brand link is orange.
- [ ] Text, muted text, accent, brand, and bar text colors each have at
      least 4.5:1 contrast against their background, in both the light and
      dark schemes.

### Project setup (`src/project.test.ts`)

- [ ] `package.json` has `"type": "module"`.
- [ ] `package.json` defines the `dev`, `build`, `start`, `test`,
      `test:watch`, and `validate` scripts.
- [ ] `tsconfig.json` leaves `*.test.ts` and `*.test.tsx` files out of the
      build.

## Manual check

These need a person and a browser, so they are not Vitest tests.

- [ ] `npm run dev` starts the server and logs `http://localhost:3000`.
- [ ] Opening `http://localhost:3000` in a modern browser shows:
  - [ ] a black header with the "AgentClinic" brand link in orange and an
        orange line under it, and a black footer,
  - [ ] the "AgentClinic" heading and the tagline "Care for AI agents and the
        ailments they pick up from their humans." in the main area,
  - [ ] a footer with "© <current year> AgentClinic" at the bottom of the
        window,
  - [ ] "AgentClinic" as the tab title,
  - [ ] no console errors, and `styles.css` loading with status 200 in the
        Network tab.
- [ ] Switching the OS or browser to dark mode shows the dark color scheme:
      a black page, light text, and the same black-and-orange header and
      footer.
- [ ] In browser dev tools, at 320px, 375px, 768px, and 1280px wide:
  - [ ] there is no horizontal scrolling,
  - [ ] nothing is cut off or overlapping, and the content keeps a side
        gutter,
  - [ ] the gutter and spacing grow at the tablet and desktop widths,
  - [ ] the heading shrinks on phones and grows on desktop,
  - [ ] the brand link is easy to tap (at least 44px tall).
- [ ] Editing the tagline in `src/home.tsx` while `npm run dev` is running
      reloads the server, and a browser refresh shows the change.

## Scope check

- [ ] No navigation, database, or routes beyond `/` and the stylesheet were
      added; those belong to later phases.
