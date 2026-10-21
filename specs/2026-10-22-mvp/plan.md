# Plan: MVP (Phases 2–7)

See `requirements.md` for scope and decisions, and `validation.md` for the
merge checklist. Work on the `mvp` branch.

Each group below ends the same way:

1. Run `npm run validate` and confirm it passes.
2. Check the new pages in the browser at 320px and 1280px, in light and dark
   mode.
3. Commit.

Add tests in the same group as the code they cover.

## 0. Accessibility base

1. In `public/styles.css`:
   1. Add `color-scheme: light dark` to `:root`.
   2. Add an `a` rule: color `var(--color-accent)`, underlined, with hover
      and visited states.
   3. Add a `--color-focus` token: `#c2410c` in the light scheme and
      `var(--color-brand-orange)` in the dark scheme. Override it to bright
      orange inside the header and footer.
   4. Add `:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }`.
   5. Change the header padding to
      `max(var(--gutter), (100% - var(--content-width)) / 2 + var(--gutter))`.
   6. Add a `.skip-link` that is visually hidden until it has focus.
2. In `Layout`, add `<a class="skip-link" href="#main">Skip to content</a>`
   as the first item in `<body>`.
3. In `Main`, render `<main id="main" class="site-main">`.
4. Add `--color-focus` to the "Brand colors" table in
   `specs/tech-stack.md`.
5. Add tests to `src/styles.test.ts`:
   - the link rule, the `:focus-visible` rule, `color-scheme`, and the
     header padding;
   - contrast of at least 3:1 for the focus color against the page and
     against the bars, in both schemes.
6. Update the component tests: the skip link comes first, and `<main>` has
   `id="main"`.
7. Fix the style test helpers in `src/styles.test.ts`:
   1. Strip CSS comments once, when the file is loaded:
      `raw.replace(/\/\*[\s\S]*?\*\//g, "")`.
   2. Add a test that proves it: a commented-out token value must not
      override the real one.
8. Type-check the test files:
   1. `tsconfig.json` includes every file, tests too, and is used only for
      type-checking.
   2. Add `tsconfig.build.json`. It extends `tsconfig.json`, leaves out
      `*.test.ts` and `*.test.tsx`, and keeps `outDir: "dist"`.
   3. Change `build` to `tsc -p tsconfig.build.json`.
   4. Change `validate` to `tsc --noEmit && npm run build && npm test`.
   5. Remove the `/** @jsxImportSource hono/jsx */` pragma from the test
      files. With tests inside `tsconfig.json`, Vitest gets the JSX setting
      from there.
   6. Clear `node_modules/.vitest-cache` after changing the tsconfig. The
      cache is keyed on file content, so old results can make the change
      look like it worked.
   7. Update `src/project.test.ts`: it now checks that
      `tsconfig.build.json` leaves out the tests, and checks the new
      `build` and `validate` commands.
   8. Update `specs/tech-stack.md` to match: the script table, and the
      testing notes about the pragma and the excluded tests.

## 1. Database foundation (Phase 2a, part 1)

1. Install the runtime dependencies `better-sqlite3`, `zod`, and
   `@hono/zod-validator`. Install `@types/better-sqlite3` as a dev
   dependency.
2. Add `/data` to `.gitignore`.
3. Create `src/db/schema.sql` with the six tables from `requirements.md`.
   Use `CREATE TABLE IF NOT EXISTS`.
4. Create `src/db/seed.sql`, using `INSERT OR IGNORE` with fixed ids:
   - 5 agents
   - 6 ailments
   - 6 therapies, with `therapy_ailments` links so that every ailment has
     at least one therapy
   - 2 reported ailments
5. Create `src/db/index.ts` exporting `openDb(path)`:
   1. Open the database.
   2. Set `PRAGMA foreign_keys = ON`.
   3. Run the schema, then the seed.
   4. Return the database.

   Read the `.sql` files relative to the project root, as `serveStatic`
   does.
6. Change `src/app.ts` to export `createApp(db)`.
7. Update `src/index.ts` to:
   1. create `data/` if it doesn't exist,
   2. call `openDb("data/agentclinic.db")`,
   3. pass the database to `createApp`.
8. Update `src/app.test.ts` and any other existing tests to use
   `createApp(openDb(":memory:"))`.
9. Write `src/db/db.test.ts`. It checks that:
   - all six tables exist;
   - the seed counts are right;
   - every ailment has a therapy;
   - running `openDb` twice on one file doesn't duplicate rows (use a
     temporary file);
   - foreign keys are enforced.

## 2. Navigation and home page (Phase 2a, part 2)

1. Create `src/components/Nav.tsx`. It takes `current` and renders
   `<nav aria-label="Main">` with links to Home, Agents, Ailments,
   Therapies, and Appointments. The current link gets
   `aria-current="page"`.
2. Add an optional `current` prop to `Layout`. `Layout` passes it through
   `Header`, which renders `Nav` after the brand link.
3. Style the nav in `public/styles.css`:
   - a wrapping flex row inside the header bar;
   - links in the bar text color, with the current link in bright orange;
   - each link at least `--touch-target` tall.
4. Move `src/home.tsx` to `src/pages/HomePage.tsx`. Keep the h1 and
   tagline, and add a short services section: Ailments, Therapies, and
   Appointments, each with a sentence and a link.
5. Create `src/pages/NotFoundPage.tsx` and register it with
   `app.notFound`, returning status 404.
6. Update the Phase 1 route tests that said "only the brand link" and
   "no `<nav>`". They now check:
   - the nav and its five links;
   - `aria-current` on Home;
   - the services section.
7. Add `Nav` component tests and a test that an unknown route returns a
   404 HTML page with the layout.

## 3. Agents and ailments pages (Phase 2b)

1. Create `src/db/agents.ts` with `listAgents(db)` and `getAgent(db, id)`.
2. Create `src/db/ailments.ts` with `listAilments(db)`.
3. Create the components and pages:
   - `src/components/AgentCard.tsx`
   - `src/pages/AgentsPage.tsx`
   - `src/pages/AgentPage.tsx`
   - `src/pages/AilmentsPage.tsx`
4. Create `src/routes/agents.tsx` and `src/routes/ailments.tsx`, and mount
   them in `createApp`.
5. For `/agents/:id`, return the 404 page if the id is not a positive
   integer or the agent doesn't exist.
6. Add a `.card-grid` style: one column by default, and
   `repeat(auto-fill, minmax(16rem, 1fr))` from `40rem`.
7. Add route tests:
   - `/agents` lists all 5 seeded agents, each linking to its own page;
   - `/agents/1` shows the agent's details;
   - `/agents/999` and `/agents/abc` return 404;
   - `/ailments` lists all 6 ailments with their descriptions.
8. Add a component test for `AgentCard`, and a styles test for the grid.

## 4. Report an ailment (Phase 3)

1. In `src/db/ailments.ts`, add:
   - `reportAilment(db, agentId, ailmentId, note)`
   - `listAgentAilments(db, agentId)`, newest first
2. On `AgentPage`:
   - list the agent's current ailments, or show an `EmptyState`;
   - add a report form with an ailment `<select>`, an optional note
     `<textarea>`, and a submit button.

   Every control has a `<label>` and is touch-sized, with text at least
   `1rem`.
3. Create `src/components/FormErrors.tsx` and
   `src/components/EmptyState.tsx`.
4. Add a `POST /agents/:id/ailments` route, validated with
   `@hono/zod-validator` and a hook:
   - invalid input: re-render the agent page with status 422 and the
     errors;
   - valid input: redirect with 303 to `/agents/:id`.
5. Add button and input-border styles that follow the contrast rules in
   `requirements.md`. Add the new tokens to `specs/tech-stack.md`, and
   their color pairs to the contrast test.
6. Add tests:
   - a valid report redirects with 303, and the ailment then shows on the
     page;
   - a missing or unknown `ailment_id` returns 422 with an error;
   - a note over 500 characters returns 422;
   - an unknown agent returns 404;
   - the seeded agents show their reported ailment.

## 5. Therapies catalog (Phase 4)

1. Create `src/db/therapies.ts` with `listTherapies(db)`, which returns
   each therapy with the names of the ailments it treats.
2. Create `src/pages/TherapiesPage.tsx` and `src/routes/therapies.tsx`,
   and mount the route.
3. Add tests: `/therapies` lists all 6 therapies, and each one shows the
   ailments it treats.

## 6. Recommended therapies (Phase 5)

1. In `src/db/therapies.ts`, add `recommendedTherapies(db, agentId)`. It
   returns the distinct therapies that treat any of the agent's ailments,
   each with the ailments it is recommended for.
2. Add a "Recommended therapies" section to `AgentPage`, with an empty
   state when the agent has no ailments.
3. Add tests:
   - an agent with a seeded ailment shows the matching therapies;
   - an agent with no ailments shows the empty state;
   - after a new report, the agent page shows that ailment's therapies;
   - reporting the same ailment twice doesn't duplicate any therapy.

## 7. Book an appointment (Phase 6)

1. Create `src/db/appointments.ts` with `createAppointment` and
   `getAppointment`.
2. Create:
   - `src/pages/BookAppointmentPage.tsx`: a one-column form with a
     `datetime-local` input, a reason `<textarea>`, and touch-sized
     controls;
   - `src/pages/AppointmentConfirmedPage.tsx`.
3. In `src/routes/appointments.tsx`, add:
   - `GET /agents/:id/appointments/new`
   - `POST /agents/:id/appointments`, with a Zod schema whose future-time
     check uses an injectable `now`
   - `GET /appointments/:id`
4. On `AgentPage`, add a "Book an appointment" link.
5. Add tests:
   - the form renders with labelled controls;
   - a valid booking redirects with 303 to `/appointments/:id`, and that
     page shows the agent, time, and reason;
   - a missing, malformed, or past time returns 422 and keeps the entered
     values;
   - a reason over 500 characters returns 422;
   - an unknown agent or appointment returns 404.

## 8. Appointment list and cancel (Phase 7)

1. In `src/db/appointments.ts`, add:
   - `listUpcoming(db, now)`, which returns booked appointments after `now`,
     soonest first;
   - `cancelAppointment(db, id)`.
2. Create `src/pages/AppointmentsPage.tsx`. Show the appointments as cards,
   each with a Cancel form button, and show an `EmptyState` when there are
   none.
3. Add these routes:
   - `GET /appointments`
   - `POST /appointments/:id/cancel`, which redirects with 303 to
     `/appointments`
4. Add tests:
   - the list is sorted and excludes past and cancelled appointments;
   - cancelling removes the appointment from the list;
   - cancelling an unknown appointment returns 404;
   - cancelling one that is already cancelled redirects;
   - the empty state shows when there are no appointments.

## 9. MVP-wide tests

1. Write `src/flow.test.ts`, one end-to-end test on a fresh in-memory
   database. In order, it:
   1. opens `/agents`;
   2. opens an agent with no ailments;
   3. reports an ailment;
   4. checks the recommended therapy shows;
   5. books an appointment;
   6. checks it on the confirmation page and in `/appointments`;
   7. cancels it;
   8. checks it is gone.
2. Write `src/no-script.test.ts`. For every GET page, including a 404 and
   a 422 form re-render, check that the HTML has no `<script`.

## 10. Wrap up

1. Mark Phases 2–7 complete in `specs/roadmap.md`. Split Phase 2 into
   2a and 2b, and point to `specs/2026-10-22-mvp/`.
2. Run `npm run validate`.
3. Work through every manual check in `validation.md`.
