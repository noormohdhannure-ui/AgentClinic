# Validation: MVP (Phases 2–7)

The `mvp` branch can be merged when every item below is true.

## Automated checks

Run with `npm run validate`. It runs three things in order:

1. `tsc --noEmit`, which type-checks the source and the tests;
2. `tsc -p tsconfig.build.json`, which builds `dist/`;
3. every Vitest test, once.

Tests use an in-memory SQLite database through `createTestApp`, with a fixed
`now`. Copy and messages are checked against the pinned strings in
`requirements.md`.

- [ ] `npm run validate` passes, including the updated Phase 1 tests.

Each item below is covered by a Vitest test in the file named in its
heading.

### Test tooling (`src/project.test.ts`, `src/styles.test.ts`)

- [ ] `tsconfig.json` includes the test files.
- [ ] `tsconfig.build.json` excludes `*.test.ts`, `*.test.tsx`, and
      `src/test/**`, and sets `rootDir: "src"`.
- [ ] `build` is `tsc -p tsconfig.build.json`, and `validate` is
      `tsc --noEmit && npm run build && npm test`.
- [ ] No test file has the `@jsxImportSource` pragma.
- [ ] The style test helpers strip CSS comments, so a commented-out value
      can't override the real token.
- [ ] `package.json` lists `better-sqlite3`, `zod`, and
      `@hono/zod-validator`.
- [ ] `.gitignore` ignores `/data`.

### Accessibility base and colors (`src/styles.test.ts`, `src/components/components.test.tsx`)

- [ ] `:root` declares `color-scheme: light dark`.
- [ ] Links and visited links use `--color-accent` and are underlined.
- [ ] Header and footer links override that with bar colors, including when
      visited.
- [ ] A `:focus-visible` rule draws a 3px `--color-focus` outline.
- [ ] The bars set `--color-focus` to bright orange.
- [ ] The shared header and footer padding includes `+ var(--gutter)`, so
      the bars line up with the main content.
- [ ] `.skip-link` is `position: absolute`.
- [ ] The skip link is the first child of `<body>` and points to `#main`,
      and `<main>` has `id="main"`.
- [ ] The current nav link is underlined, not marked by color alone.
- [ ] Cards are one column by default and only become a grid in a
      `min-width: 40rem` query.
- [ ] Each of these color pairs meets the contrast shown, in both schemes:

  | Pair | Minimum |
  | ---- | ------- |
  | Text, muted text, and links on the page and on the surface | 4.5:1 |
  | Error text on the page | 4.5:1 |
  | Button text on the button | 4.5:1 |
  | Bar text, bar links, and the brand on the bar | 4.5:1 |
  | Skip-link text on its background | 4.5:1 |
  | Focus ring on the page, the surface, and the bar | 3:1 |
  | Input border on the page and the surface | 3:1 |

- [ ] Every color token is used by at least one rule.

### Database (`src/db/db.test.ts`)

- [ ] `openDb(":memory:")` creates all six tables and sets
      `user_version` to the number of migrations.
- [ ] The seed matches the pinned tables: 5 agents, 6 ailments (including
      the three named in the mission), 2 reported ailments, and 6
      therapies.
- [ ] Every ailment has at least one therapy.
- [ ] Opening the same database file twice doesn't duplicate any rows, and
      the file is closed before it is deleted.
- [ ] Foreign keys are enforced, and `status` only accepts `booked` or
      `cancelled`.

### Home page, nav, and 404 (`src/app.test.ts`, `src/components/components.test.tsx`)

- [ ] The home page keeps its h1 and tagline, and shows the "Our services"
      copy with links to `/ailments`, `/therapies`, and `/appointments`.
- [ ] `Nav` gives the current link `aria-current="page"` on a section's
      index page, and `"true"` on the pages under it.
- [ ] An unknown route returns 404 with HTML, the title
      `Page not found – AgentClinic`, the pinned copy, and a link to `/`.

### Agents and ailments (`src/routes/agents.test.ts`, `src/routes/ailments.test.ts`)

- [ ] `/agents` lists all five agents, each linking to `/agents/:id`.
- [ ] `/agents/1` shows Ada's name, role, human, and bio, with the title
      `Ada – AgentClinic`.
- [ ] `/agents/` followed by `0`, `01`, `abc`, `1.5`, `-1`, `1e3`, `999`,
      or `99999999999999999999` returns 404.
- [ ] `/ailments` lists all six ailments with their descriptions.

### Report an ailment (`src/routes/agents.test.ts`)

- [ ] The seeded reports show on Ada's and Scribe's pages, with notes.
- [ ] A valid report redirects with 303 to `/agents/:id?reported=1`, which
      shows "Ailment reported." in a `role="status"` element.
- [ ] Reports are listed newest first. The same ailment reported twice is
      listed twice.
- [ ] `ailment_id` returns 422 "Choose an ailment." when it is missing,
      empty, `1.5`, `0`, or `99`.
- [ ] A 501-character note returns 422, and a 500-character note passes.
- [ ] A whitespace-only note is stored as `NULL`, and no empty "Note:"
      label is shown.
- [ ] A 422 response has:
  - the `Error: ` title prefix;
  - a summary linking to `#ailment_id`;
  - `aria-invalid="true"` and `aria-describedby="ailment_id-error"` on
    the field;
  - the note and the selected option kept.
- [ ] A POST to an unknown agent returns 404, even with an invalid body.
- [ ] A note of `<script>alert(1)</script>` is shown escaped.

### Therapies and recommendations (`src/routes/therapies.test.ts`, `src/routes/agents.test.ts`)

- [ ] `/therapies` lists all six therapies, each with the ailments it
      treats.
- [ ] Ada is recommended Context compaction and Priority triage, each
      "For: Context overload".
- [ ] A new report adds its therapies to the recommendations, and no
      therapy is listed twice.
- [ ] An agent with no ailments shows an empty state that links to
      `#report-ailment`.

### Booking (`src/routes/appointments.test.ts`)

- [ ] The agent page links to `/agents/:id/appointments/new`.
- [ ] The booking form has a labelled `datetime-local` input with `min`
      set to one minute after `now`, the format hint linked with `aria-describedby`, and a
      labelled reason.
- [ ] A valid booking redirects with 303 to `/appointments/:id`. That page
      shows:
  - the agent link;
  - `<time datetime="…">` with the formatted time and the clinic-time
    note;
  - the reason;
  - links to `/appointments` and to the agent.
- [ ] These times return 422 with the pinned message, one error per field:
      missing, blank, `2026-13-45T99:99`, `2026-02-30T10:00`, equal to
      `now`, and before `now`.
- [ ] A time with `:SS` passes, and so does the minimum, one minute after
      `now`.
- [ ] A time typed in the hint's format, `2026-11-03 10:00` with a space,
      books and is stored as `2026-11-03T10:00`.
- [ ] A 501-character reason returns 422, and a 500-character reason
      passes.
- [ ] A 422 response has the summary, `aria-invalid`, `aria-describedby`,
      the `Error: ` title prefix, and the values already entered.
- [ ] Booking for an unknown agent (GET or POST), or opening an unknown
      appointment, returns 404.
- [ ] A reason containing a script is shown escaped.

### Appointment list and cancel (`src/routes/appointments.test.ts`)

- [ ] `/appointments` lists upcoming booked appointments, soonest first,
      each with the agent link, the time, and the reason. It leaves out
      past and cancelled appointments.
- [ ] Each Cancel button shows "Cancel" and has
      `aria-label="Cancel appointment for <agent> on <formatted time>"`.
- [ ] Cancelling redirects with 303 to `/appointments?cancelled=<id>`,
      which shows "Appointment cancelled.", and the appointment is gone
      from the list.
- [ ] A cancelled appointment's page returns 200, shows "Cancelled", and
      has no cancel form.
- [ ] Cancelling an unknown appointment returns 404. Cancelling one that
      is already cancelled redirects without a message.
- [ ] With no appointments, the page shows "No upcoming appointments." and
      a "Choose an agent to book" link to `/agents`.

### End-to-end care loop (`src/flow.test.ts`)

- [ ] On a fresh database, one test does the following in order:
  1. opens `/agents`;
  2. opens Ledger and sees the empty states;
  3. reports Scope creep and sees "Ailment reported." and its
     recommended therapies;
  4. books an appointment and sees it on the confirmation page and in
     `/appointments`;
  5. cancels it and sees "Appointment cancelled." and the empty state.

### Every page (`src/pages.test.ts`)

These checks run on every page:

- every GET page;
- a booked appointment's page;
- the 404 page;
- the 422 re-render of both forms, each sent with a `<script>` payload.

- [ ] Each page has an HTML content type and starts with
      `<!doctype html>`.
- [ ] Each page has the layout: the skip link first, then the header,
      `<main id="main">`, and the footer.
- [ ] Each page has `<nav aria-label="Main">` with the five section links.
- [ ] Each page has exactly one `aria-current`, except the 404 page, which
      has none.
- [ ] Each `<title>` follows the pinned pattern, and no two pages share a
      title.
- [ ] No page contains `<script`.

## Manual checks

These need a person and a browser, so they are not Vitest tests.

- [ ] **Fresh start.** Delete `data/` and run `npm run dev`. The server
      creates `data/agentclinic.db` and starts without errors.
- [ ] **Restart.** Restarting the server keeps the reports and appointments
      already made, and doesn't duplicate the seed data.
- [ ] **`npm start`.** After `npm run build`, `npm start` serves every page,
      including the database pages.
- [ ] **The care loop by clicking only.**
  1. Go to Agents and open Ledger.
  2. Report an ailment and see the status message and recommended
     therapies.
  3. Book an appointment and check the confirmation page.
  4. Find the appointment in Appointments.
  5. Cancel it and see the status message.
- [ ] **Form errors.**
  - Submitting with a past time shows the summary and an error next to
    the field.
  - Clicking the summary link moves focus to the field.
  - Refreshing after a successful submit doesn't post again.
- [ ] **Date picker.**
  - The `datetime-local` input works in Chrome, Firefox, and Safari.
  - Where a browser has no picker, the format hint is visible and a typed
    value is accepted.
- [ ] **Keyboard only.**
  - The first Tab shows "Skip to content", and Enter jumps to the main
    content.
  - Every link, button, and field shows a visible orange focus ring, on
    the black bars and on the page, in both schemes.
  - Both forms can be filled in and submitted.
- [ ] **Screen reader.** With NVDA or VoiceOver:
  - a 422 page announces "Error:" in its title;
  - the status messages are announced;
  - each Cancel button's name includes the agent and the time.
- [ ] **Every page at 320px, 375px, 768px, and 1280px wide, in light and
      dark mode.** This covers home, agents, agent, ailments, therapies,
      booking, confirmation, cancelled confirmation, appointments (empty
      and with entries), the 404 page, and both forms with errors.
  - [ ] There is no horizontal scrolling.
  - [ ] Nothing is cut off or overlapping.
  - [ ] At 320px the nav wraps cleanly inside the black header and takes
        no more than three rows.
  - [ ] Cards stack on phones and form a grid from tablet width. Cards
        stay visibly separate from the page in dark mode.
  - [ ] Buttons, links, and form controls are easy to tap (at least 44px).
        Forms are one column on phones, and focusing an input doesn't zoom
        the page on a phone.
  - [ ] At 1280px, the brand, the page content, and the footer text start
        at the same left edge.
- [ ] **Console and network.** No console errors on any page. `styles.css`
      loads, and DevTools shows no JavaScript requests.

## Scope check

- [ ] Nothing out of scope was added: no dashboards, no resolving ailments,
      no rescheduling, no forms to add or edit seed data, no client
      JavaScript, and no CSRF or double-submit handling.
- [ ] `specs/roadmap.md`:
  - marks Phases 2–7 complete and links this spec;
  - shows Phase 2 split into 2a and 2b, and the 0a and 0b groundwork;
  - narrows Phase 10's accessibility pass to the Phase 8–9 pages.
- [ ] `specs/tech-stack.md` covers:
  - the new color tokens;
  - the scripts table;
  - the testing notes;
  - the database migrations;
  - the time-zone limits;
  - the `better-sqlite3` install note.
- [ ] `CHANGELOG.md` has entries for this branch, written with
      `/changelog` and committed by the person merging.
