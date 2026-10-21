# Plan: MVP (Phases 2–7)

See `requirements.md` for scope, pinned copy, and decisions, and
`validation.md` for the merge checklist. Work on the `mvp` branch.

Group headings use the same labels as the roadmap, so "plan 3" is roadmap
Phase 3. Each group ends the same way:

1. Run `npm run validate` and confirm it passes.
2. **Person:** check what changed in the browser at 320px and 1280px, in
   light and dark mode. A coding agent without browser access can't do
   this; it says the check is still to do instead of skipping it silently.
3. Commit.

Tests go in the same group as the code they cover, in the file named in
that group.

## 0a. Test tooling

1. Type-check the test files:
   1. In `tsconfig.json`, remove `exclude`. Keep `include: ["src"]`.
   2. Add `tsconfig.build.json`. It extends `tsconfig.json`, sets
      `rootDir: "src"` and `outDir: "dist"`, and excludes
      `src/**/*.test.ts`, `src/**/*.test.tsx`, and `src/test/**`.
   3. In `package.json`:
      - `build`: `tsc -p tsconfig.build.json`
      - `validate`: `tsc --noEmit && npm run build && npm test`
   4. Remove the `/** @jsxImportSource hono/jsx */` pragma from the test
      files.
   5. Run `npx vitest --clearCache`, then `npm run validate`. Confirm that
      `dist/index.js` exists and `dist/` has no test files.
2. Fix the style test helpers in `src/styles.test.ts`:
   1. When loading `public/styles.css`, strip comments once:
      `raw.replace(/\/\*[\s\S]*?\*\//g, "")`.
   2. Make `rule()` able to return every matching rule, not just the first.
   3. Make `color()` fail with a clear message for a missing token or a
      value that isn't 6-digit hex.
   4. Add a test: in a CSS string where a comment holds an old value after
      the real token, the helper returns the real value.
3. Remove the tokens no rule uses yet, and drop their contrast pairs:
   - `--color-surface`, `--color-border`, and `--color-muted` come back in
     2b, with the cards;
   - `--color-accent` comes back in 0b, with the link styles.
4. Update `src/project.test.ts`. It checks that:
   - `tsconfig.build.json` excludes the tests and `tsconfig.json` doesn't;
   - `build` and `validate` are the new commands.

## 0b. Accessibility base

1. In `public/styles.css`:
   1. Add `color-scheme: light dark` to `:root`.
   2. Add an `a` rule and an `a:visited` rule using `var(--color-accent)`,
      underlined. Add a hover state.
   3. In `.site-header a` and `.site-footer a`, use bar colors for links,
      including `:visited`. The `.brand` link stays bright orange.
   4. Add `--color-focus`: `#c2410c` in light, bright orange in dark.
      Inside `.site-header` and `.site-footer`, set it to bright orange.
   5. Add `:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }`.
   6. On the shared `.site-header, .site-footer` rule, change the padding
      to
      `max(var(--gutter), (100% - var(--content-width)) / 2 + var(--gutter))`.
   7. Add `.skip-link`. It is `position: absolute` and moved off-screen
      until `:focus`. When focused it shows bright orange text on a black
      background, at least `--touch-target` tall.
2. In `Layout`, add `<a class="skip-link" href="#main">Skip to content</a>`
   as the first item in `<body>`.
3. In `Main`, render `<main id="main" class="site-main">`.
4. In `src/styles.test.ts`, test:
   - `color-scheme`, the link and visited rules, the header and footer
     link overrides, and the `:focus-visible` rule;
   - the shared bar padding;
   - that `.skip-link` is `position: absolute`;
   - these contrast pairs, in both schemes:
     - focus on the page and on the bars (3:1);
     - skip-link text on its background (4.5:1);
     - visited links on the page (4.5:1);
     - bar links on the bar (4.5:1).
5. In `src/components/components.test.tsx`, test that the skip link is the
   first child of `<body>` and that `<main>` has `id="main"`.

## 2a. Navigation, home page, and 404

1. Rendering:
   1. Rename `src/app.ts` to `src/app.tsx`.
   2. Add `jsxRenderer` with `docType: "<!doctype html>"`, and render the
      home page with `c.render(<HomePage />)`.
   3. Remove the doctype that is currently added by hand.
2. Create `src/components/Nav.tsx`.
   - It takes `current` (a section key) and `currentIsPage` (a boolean).
   - It renders `<nav aria-label="Main">` from a list of sections. For
     now the list has Home only. Later groups add to it.
   - The current link gets `aria-current="page"` or `"true"`.
3. `Layout` gains `current` and `currentIsPage` props and passes them
   through `Header` to `Nav`.
4. Style the nav:
   - a wrapping flex row inside the header bar;
   - bar-colored links, each at least `--touch-target` tall;
   - the `[aria-current]` link in bright orange and underlined.
5. Move `src/home.tsx` to `src/pages/HomePage.tsx`. Add the "Our services"
   section, using the pinned copy, with no links yet.
6. Create `src/pages/NotFoundPage.tsx` with the pinned 404 copy, and
   register it with `app.notFound` with status 404.
7. Tests:
   - In `src/app.test.ts`, replace the Phase 1 tests for "only the brand
     link" and "no `<nav>`". The new tests check:
     - the nav, with Home marked `aria-current="page"`;
     - the services copy;
     - that an unknown route returns 404 with the pinned 404 copy and
       title, inside the layout.
   - In `src/components/components.test.tsx`, add `Nav` tests: the current
     link, and `"page"` versus `"true"`.
   - In `src/styles.test.ts`, test that the `[aria-current]` link is
     underlined.

## 2b. Database, agents, and ailments

1. Install `better-sqlite3@^13`, `zod@^4`, and `@hono/zod-validator`, and
   `@types/better-sqlite3` as a dev dependency. If npm asks, don't approve
   the `better-sqlite3` install script.
2. Add `/data` to `.gitignore`.
3. Create `src/time.ts` with:
   - `localNow()`;
   - `formatWhen(value)`, which gives `3 Nov 2026, 10:00`;
   - `isRealDateTime(value)`.
4. Create `src/db/migrations.ts` with migration 1, which:
   - creates `agents` and `ailments`, with the constraints from
     `requirements.md`;
   - inserts the pinned agents and ailments.
5. Create `src/db/index.ts` exporting `openDb(path)`:
   1. Open the database.
   2. Set `PRAGMA foreign_keys = ON`.
   3. Run each migration whose index is at or above `user_version`, each in
      its own transaction.
   4. Set `user_version` after each one.
6. Create `src/db/agents.ts` with `listAgents` and `getAgent`, and
   `src/db/ailments.ts` with `listAilments`.
7. Change `src/app.tsx` to export `createApp(db, { now = localNow } = {})`.
   Update `src/index.ts` to:
   1. create `data/`;
   2. call `openDb("data/agentclinic.db")`;
   3. pass the database to `createApp`.
8. Create `src/test/helpers.ts` with `createTestApp({ now })`. Move the
   existing route tests over to it.
9. Create the components and pages:
   - `src/components/AgentCard.tsx`
   - `src/pages/AgentsPage.tsx`
   - `src/pages/AgentPage.tsx`
   - `src/pages/AilmentsPage.tsx`
10. Create the routes:
    - `src/routes/agents.tsx`: `/:id{[1-9][0-9]{0,8}}`, with an agent-loader
      middleware that returns 404 and calls `c.set("agent", …)`.
    - `src/routes/ailments.tsx`.

    Mount both in `createApp`. Add Agents and Ailments to the nav and the
    home page links.
11. Styles:
    - add back `--color-surface` and `--color-border` for cards, which
      always have a border, and `--color-muted` for each card's role line;
    - add `.card-grid`: one column by default, and
      `repeat(auto-fill, minmax(16rem, 1fr))` in the `40rem` query.
12. Tests:
    - `src/db/db.test.ts`:
      - the tables exist;
      - `user_version` equals the number of migrations;
      - the pinned agents and ailments are there, including the three named
        in the mission;
      - opening a temporary file twice doesn't duplicate rows (call
        `db.close()` before deleting the file, or Windows fails with
        EBUSY);
      - foreign keys are on.
    - `src/routes/agents.test.ts`:
      - `/agents` lists the five agents, each with a link;
      - `/agents/1` shows Ada's role, human, and bio, with the title
        `Ada – AgentClinic`;
      - these ids return 404: `0`, `01`, `abc`, `1.5`, `-1`, `1e3`, `999`,
        and `99999999999999999999`.
    - `src/routes/ailments.test.ts`: all six ailments with their
      descriptions.
    - `src/components/components.test.tsx`: `AgentCard`.
    - `src/styles.test.ts`:
      - the card grid is one column by default and a grid only in the
        `40rem` query;
      - the surface and border contrast pairs.

## 3. Report an ailment

1. Add migration 2: the `agent_ailments` table, its index, and the two
   pinned reports.
2. In `src/db/ailments.ts`, add:
   - `reportAilment(db, { agentId, ailmentId, note, reportedAt })`;
   - `listAgentAilments(db, agentId)`, ordered by `reported_at DESC, id DESC`;
   - `ailmentExists(db, id)`.
3. Create `src/components/FormErrors.tsx` (the summary),
   `src/components/FieldError.tsx` (the inline message), and
   `src/components/EmptyState.tsx`, plus a `src/components/StatusMessage.tsx`
   that renders `role="status"`.
4. On `AgentPage`:
   - list the agent's ailments, with notes when present, or show an empty
     state;
   - add the report form, `id="report-ailment"`, with a labelled `<select>`
     (whose first option is "Choose an ailment"), a labelled note
     `<textarea>`, and a submit button;
   - show "Ailment reported." when `reported=1`.
5. Add the route `POST /agents/:id/ailments`:
   - It runs after the agent loader, with a zod-validator hook that
     re-renders `AgentPage` with status 422.
   - After validation, the handler checks `ailmentExists`, and returns 422
     with "Choose an ailment." if the ailment doesn't exist.
   - It sets `reportedAt` from `now()`, and stores a blank note as `NULL`.
   - It redirects with 303 to `/agents/:id?reported=1`.
6. Styles: add `--color-button-bg`, `--color-button-text`,
   `--color-input-border`, and `--color-error`, plus button, input, and
   error styles. Inputs use at least `1rem` text, and controls are at least
   `--touch-target` tall.
7. Tests:
   - `src/routes/agents.test.ts`:
     - Ada and Scribe show their seeded ailments and notes.
     - A valid report redirects with 303 to `?reported=1`, which shows the
       status message.
     - Two reports appear newest first, and reporting the same ailment
       twice lists it twice.
     - These `ailment_id` values return 422 "Choose an ailment.": missing,
       empty, `1.5`, `0`, and `99`.
     - A 501-character note returns 422, and a 500-character note passes.
     - A whitespace-only note is stored as `NULL` and no "Note:" label is
       shown.
     - On a 422 response:
       - the title starts with `Error: `;
       - the summary links to `#ailment_id`;
       - the field has `aria-invalid="true"` and
         `aria-describedby="ailment_id-error"`;
       - the note text and the chosen `<option … selected>` are kept.
     - A POST to an unknown agent with an empty body returns 404.
     - A note of `<script>alert(1)</script>` is shown escaped as
       `&lt;script&gt;`.
   - `src/components/components.test.tsx`: `FormErrors`, `FieldError`,
     `EmptyState`, and `StatusMessage`.
   - `src/styles.test.ts`: button text on the button, input border on the
     page and surface (3:1), and error text on the page, in both schemes.

## 4. Therapies catalog

1. Add migration 3: `therapies` and `therapy_ailments` with their index,
   plus the pinned therapies and links.
2. In `src/db/therapies.ts`, add `listTherapies(db)`, which returns each
   therapy with the names of the ailments it treats.
3. Create `src/pages/TherapiesPage.tsx` and `src/routes/therapies.tsx`, and
   mount the route. Add Therapies to the nav and the home page.
4. Tests:
   - `src/routes/therapies.test.ts`: all six therapies, each with the
     ailments it treats.
   - `src/db/db.test.ts`: every ailment has at least one therapy.

## 5. Recommended therapies

1. In `src/db/therapies.ts`, add `recommendedTherapies(db, agentId)`. It
   returns the distinct therapies for the agent's ailments, each with the
   names of the ailments it is recommended for.
2. On `AgentPage`, add a "Recommended therapies" section. Each therapy
   shows "For: …". With no ailments, show an empty state that links to
   `#report-ailment`.
3. Tests, in `src/routes/agents.test.ts`:
   - Ada is shown Context compaction and Priority triage, each "For:
     Context overload".
   - Ledger shows the empty state with its link.
   - After Ledger reports Scope creep, Clarifying-questions session and
     Boundary setting appear.
   - Reporting the same ailment twice doesn't duplicate any therapy.

## 6. Book an appointment

1. Add migration 4: `appointments`, with its `CHECK`, default, and
   indexes.
2. In `src/db/appointments.ts`, add `createAppointment` and
   `getAppointment`.
3. Create the pages:
   - `src/pages/BookAppointmentPage.tsx`: a one-column form with:
     - a labelled `datetime-local` input with `min` set to
       `nextMinute(now())`;
     - the format hint, linked with `aria-describedby`;
     - a labelled reason `<textarea>`;
     - a submit button.
   - `src/pages/AppointmentPage.tsx`: the confirmation page, showing the
     agent as a link, the time as `<time>` with the clinic-time note, the
     reason, the status, and links to "View all appointments" and the
     agent. A cancelled appointment shows "Cancelled".
4. In `src/routes/appointments.tsx`:
   - Add a `bookingRoutes` sub-app with `GET /new` and `POST /`. Mount it in
     `agentRoutes` at `/:id{[1-9][0-9]{0,8}}/appointments`, so the agent
     loader runs first.
   - Add an `appointmentRoutes` sub-app, mounted at `/appointments`, with
     `GET /:id{[1-9][0-9]{0,8}}`.
   - Build the Zod schema with a factory that takes `now`, checking the
     four rules in order.
   - Set `created_at` from `now()`.
5. On `AgentPage`, add a "Book an appointment" link.
6. Tests, in `src/routes/appointments.test.ts`, with a fixed `now`:
   - The form has a labelled `datetime-local` input with the right `min`,
     and the hint.
   - A valid booking redirects with 303 to `/appointments/:id`, which shows
     the agent link, `<time datetime=…>` with the formatted time, and the
     reason.
   - These inputs return 422 with the pinned messages:
     - a missing time;
     - a blank time;
     - `2026-13-45T99:99`;
     - `2026-02-30T10:00`;
     - a time equal to `now`;
     - a time before `now`.
   - A time with `:SS` passes, and the seconds are dropped.
   - A 501-character reason returns 422, and a 500-character reason passes.
   - The 422 page has the error summary, `aria-invalid`, the `Error: `
     title prefix, and the values already entered.
   - An unknown agent (GET and POST) and an unknown appointment return 404.
   - A reason of `<script>alert(1)</script>` is escaped on the confirmation
     page.
   - The agent page links to `/agents/1/appointments/new`.

## 7. Appointment list and cancel

1. In `src/db/appointments.ts`, add:
   - `listUpcoming(db, now)`, which returns booked appointments after `now`,
     ordered by `scheduled_at, id`, with each agent's name;
   - `cancelAppointment(db, id)`.
2. Create `src/pages/AppointmentsPage.tsx`:
   - cards with the agent link, `<time>`, and reason;
   - the clinic-time note;
   - a Cancel form on each card, with the pinned `aria-label`;
   - the empty state, with a link to `/agents`;
   - "Appointment cancelled." when `cancelled=<id>`.
3. Add the routes `GET /appointments` and
   `POST /appointments/:id{[1-9][0-9]{0,8}}/cancel`. Add Appointments to the
   nav and the home page.
4. Tests, in `src/routes/appointments.test.ts`:
   - The list is sorted and leaves out past and cancelled appointments.
   - Each card shows the agent, the time, and the reason.
   - The Cancel button's `aria-label` matches the pinned format.
   - Cancelling redirects with 303 to `?cancelled=<id>`, which shows the
     status message, and the appointment is gone from the list.
   - The cancelled appointment's own page shows "Cancelled" and has no
     cancel form.
   - Cancelling an unknown appointment returns 404.
   - Cancelling one that is already cancelled redirects without a message.
   - The empty state shows with its `/agents` link.
   - A reason containing a script is escaped.

## MVP-wide tests

1. `src/flow.test.ts` runs one end-to-end test on a fresh database with a
   fixed `now`. In order, it:
   1. opens `/agents`;
   2. opens Ledger (3) and sees the empty states;
   3. reports Scope creep;
   4. sees "Ailment reported." and the recommended therapies;
   5. books an appointment;
   6. checks the confirmation page and `/appointments`;
   7. cancels it;
   8. sees "Appointment cancelled." and the empty state.
2. `src/pages.test.ts` defines one list of every page:
   - `/`, `/agents`, `/agents/1`, `/ailments`, `/therapies`,
     `/appointments`, `/agents/1/appointments/new`;
   - a booked `/appointments/:id`;
   - an unknown route;
   - the 422 re-render of each form, sent with a `<script>` payload.

   For each page, it checks:
   - an HTML content type, and that the page starts with `<!doctype html>`;
   - the layout: the skip link first, the header, `<main id="main">`, and
     the footer;
   - `<nav aria-label="Main">` with all five links;
   - exactly one `aria-current`, or none on the 404 page;
   - a `<title>` that follows the pinned pattern, and no two pages sharing
     a title (the `Error: ` prefix keeps the 422 re-renders unique);
   - no `<script` anywhere.

## Wrap up

1. Update `specs/roadmap.md`:
   - mark Phases 2–7 complete, and point to `specs/2026-10-22-mvp/`;
   - split Phase 2 into 2a and 2b;
   - note the 0a and 0b groundwork under the MVP;
   - narrow Phase 10's "Accessibility pass" to reviewing the Phase 8–9
     pages, since the MVP covers the rest.
2. Update `specs/tech-stack.md`:
   - the new color tokens;
   - the scripts table;
   - the testing notes (type-checked tests, `tsconfig.build.json`, no
     pragma);
   - the database notes (migrations in TypeScript, `user_version`);
   - the time-zone limits;
   - the `better-sqlite3` install note.
3. Run `/changelog`. Leave `CHANGELOG.md` uncommitted, as the skill says;
   the person merging commits it with the branch.
4. Run `npm run validate`.
5. **Person:** work through every manual check in `validation.md`.
