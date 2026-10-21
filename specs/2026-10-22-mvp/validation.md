# Validation: MVP (Phases 2–7)

The `mvp` branch can be merged when every item below is true.

## Automated checks

Run with `npm run validate`, which builds the project with `tsc` and then
runs every Vitest test once. Tests use an in-memory SQLite database, and
any test that depends on the current time is given a fixed `now`.

- [ ] `npm run validate` passes: the build has no TypeScript errors and
      every test passes, including the Phase 1 tests as updated.

Each item below is covered by a Vitest test.

### Accessibility base (`src/styles.test.ts`, `src/components/components.test.tsx`)

- [ ] `:root` declares `color-scheme: light dark`.
- [ ] Links use `--color-accent` and are underlined.
- [ ] A `:focus-visible` rule draws a 3px outline in `--color-focus`.
- [ ] The focus color has at least 3:1 contrast against the page and
      against the black bars, in both schemes.
- [ ] Button text, and input borders (3:1), meet contrast against their
      backgrounds in both schemes.
- [ ] The header padding lines up with the main content's gutter at wide
      widths.
- [ ] The skip link is the first item in `<body>` and points to `#main`,
      and `<main>` has `id="main"`.

### Database (`src/db/db.test.ts`)

- [ ] `openDb(":memory:")` creates all six tables.
- [ ] The seed creates 5 agents, 6 ailments, 6 therapies, and 2 reported
      ailments, and every ailment has at least one therapy.
- [ ] Opening the same database file twice doesn't duplicate any rows.
- [ ] Foreign keys are enforced.

### Navigation, home page, and 404 (`src/app.test.ts`, `src/components/components.test.tsx`)

- [ ] Every page has `<nav aria-label="Main">` with links to `/`,
      `/agents`, `/ailments`, `/therapies`, and `/appointments`.
- [ ] The current section's link has `aria-current="page"`.
- [ ] The home page keeps its h1 and tagline, and links to the ailments,
      therapies, and appointments sections.
- [ ] An unknown route returns 404 with a friendly HTML page in the layout.

### Agents and ailments (`src/routes/agents.test.ts`, `src/routes/ailments.test.ts`)

- [ ] `GET /agents` lists all seeded agents, each linking to
      `/agents/:id`.
- [ ] `GET /agents/:id` shows the agent's name, model, human, and bio.
- [ ] `GET /agents/999` and `GET /agents/abc` return 404.
- [ ] `GET /ailments` lists every ailment with its description.
- [ ] The card grid is one column by default and only becomes a grid in a
      `min-width: 40rem` query.

### Report an ailment (`src/routes/agents.test.ts`)

- [ ] A valid `POST /agents/:id/ailments` redirects with 303, and the agent
      page then lists that ailment.
- [ ] A missing or unknown ailment, or a note over 500 characters, returns
      422 with an error message and the entered values kept.
- [ ] Reporting for an unknown agent returns 404.
- [ ] The form controls have labels, and error messages are linked to
      their field with `aria-describedby`.

### Therapies and recommendations (`src/routes/therapies.test.ts`, `src/routes/agents.test.ts`)

- [ ] `GET /therapies` lists every therapy with the ailments it treats.
- [ ] An agent page shows the therapies that treat its current ailments,
      with no duplicates.
- [ ] An agent with no ailments shows an empty state for recommendations.

### Booking (`src/routes/appointments.test.ts`)

- [ ] `GET /agents/:id/appointments/new` renders a form with a labelled
      `datetime-local` input and a reason field.
- [ ] A valid booking redirects with 303 to `/appointments/:id`, which
      shows the agent, the date and time, and the reason.
- [ ] A missing, malformed, or past time, or a reason over 500 characters,
      returns 422 with the errors and the entered values kept.
- [ ] Booking for an unknown agent, or opening an unknown appointment,
      returns 404.

### Appointment list and cancel (`src/routes/appointments.test.ts`)

- [ ] `GET /appointments` lists upcoming booked appointments, soonest
      first, and leaves out past and cancelled ones.
- [ ] An empty state shows when there are no upcoming appointments.
- [ ] `POST /appointments/:id/cancel` redirects with 303, and the
      appointment is no longer listed.
- [ ] Cancelling an unknown appointment returns 404. Cancelling one that
      is already cancelled redirects.

### End-to-end care loop (`src/flow.test.ts`)

- [ ] On a fresh database, one test does the following in order:
      1. reports an ailment for an agent;
      2. checks the matching therapy is recommended;
      3. books an appointment;
      4. checks it on the confirmation page and in `/appointments`;
      5. cancels it;
      6. checks it is gone.

### No client JavaScript (`src/no-script.test.ts`)

- [ ] No page HTML contains `<script`. This covers every GET route, the
      404 page, and the 422 re-renders of both forms.

### Project setup (`src/project.test.ts`)

- [ ] `package.json` lists `better-sqlite3`, `zod`, and
      `@hono/zod-validator` as dependencies.
- [ ] `.gitignore` ignores `/data`.
- [ ] `tsconfig.build.json` leaves the test files out of the build, and
      `tsconfig.json` includes them.
- [ ] `build` is `tsc -p tsconfig.build.json`, and `validate` runs
      `tsc --noEmit` before the build and the tests.
- [ ] No test file needs the `@jsxImportSource` pragma.

### Style test helpers (`src/styles.test.ts`)

- [ ] CSS comments are stripped before tokens are read, so a
      commented-out value can't override the real one.

## Manual checks

These need a person and a browser, so they are not Vitest tests.

- [ ] Delete `data/`, then run `npm run dev`. The server creates
      `data/agentclinic.db` and starts without errors.
- [ ] Restarting the server keeps any reports or appointments already made,
      and doesn't duplicate the seed data.
- [ ] In a browser, work through the care loop by clicking only:
  1. Go to Agents, open an agent, and report an ailment.
  2. Check that recommended therapies appear.
  3. Book an appointment and check the confirmation page.
  4. Find the appointment in Appointments.
  5. Cancel it.
- [ ] Submitting a form with a past time shows a clear error next to the
      field, and refreshing after a successful submit doesn't post again.
- [ ] Use the keyboard only:
  - the first Tab shows "Skip to content", and Enter jumps to the main
    content;
  - every link, button, and field shows a visible orange focus ring, on
    the black bars and on the page, in both schemes;
  - both forms can be filled in and submitted.
- [ ] Check every new page at 320px, 375px, 768px, and 1280px wide, in
      both light and dark mode: home, agents, agent, ailments, therapies,
      book, confirmation, appointments, and the 404 page. For each:
  - [ ] there is no horizontal scrolling;
  - [ ] nothing is cut off or overlapping;
  - [ ] the nav wraps cleanly on phones and stays inside the black header;
  - [ ] cards stack on phones and form a grid from tablet width;
  - [ ] buttons, links, and form controls are easy to tap (at least 44px);
        the forms are one column on phones, and focusing an input doesn't
        zoom the page on a phone;
  - [ ] the brand name and header line up with the page content at
        1280px.
- [ ] No console errors on any page. `styles.css` loads, and DevTools shows
      no JavaScript requests.

## Scope check

- [ ] There are no dashboards, no ways to resolve an ailment or reschedule
      an appointment, no add or edit forms for seed data, and no client
      JavaScript. Those belong to later phases or are out of scope.
- [ ] `specs/roadmap.md` marks Phases 2–7 complete and shows Phase 2 split
      into 2a and 2b.
- [ ] `specs/tech-stack.md` lists the new color tokens.
