# Validation: Hello, clinic (Phase 1)

This phase can be merged when every item below is true.

## Automated checks

- [ ] `npm run build` completes with no TypeScript errors and writes
      `dist/index.js`, `dist/app.js`, `dist/home.js`, and the four files in
      `dist/components/`, with no test files in `dist/`.
- [ ] `npm test` passes.
- [ ] The tests in `src/app.test.ts` assert that `GET /`:
  - [ ] returns status 200 with an HTML `Content-Type`,
  - [ ] starts with `<!doctype html>`,
  - [ ] contains `<title>AgentClinic</title>`, the "AgentClinic" heading, and
        the tagline,
  - [ ] has the header, main, and footer elements, with the heading inside
        `<main>`,
  - [ ] links `/styles.css`.
- [ ] The tests assert that `GET /styles.css` returns status 200 with a CSS
      `Content-Type`.

## Manual check

- [ ] `npm run dev` starts the server and logs `http://localhost:3000`.
- [ ] Opening `http://localhost:3000` in a modern browser shows:
  - [ ] a styled header with the "AgentClinic" brand link,
  - [ ] the "AgentClinic" heading and the tagline "Care for AI agents and the
        ailments they pick up from their humans." in the main area,
  - [ ] a footer with "© <current year> AgentClinic" at the bottom of the
        window,
  - [ ] "AgentClinic" as the tab title,
  - [ ] no console errors, and `styles.css` loading with status 200 in the
        Network tab.
- [ ] Switching the OS or browser to dark mode shows the dark color scheme.
- [ ] At phone width (about 375px) there is no horizontal scrolling and the
      content keeps a side gutter.
- [ ] Editing the tagline in `src/home.tsx` while `npm run dev` is running
      reloads the server, and a browser refresh shows the change.

## Scope check

- [ ] `package.json` has `"type": "module"` and the `dev`, `build`, `start`,
      and `test` scripts.
- [ ] `Layout` is composed of the `Header`, `Main`, and `Footer`
      subcomponents in `src/components/`.
- [ ] The home page content is only the heading and tagline. The only link is
      the header's brand link, and there is no client-side JavaScript.
- [ ] No navigation, database, or extra routes were added; those belong to
      later phases.
