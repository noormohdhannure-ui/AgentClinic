# Requirements: MVP (Phases 2–7)

## Context

Phase 1 (`specs/2026-10-22-hello-clinic/`) shipped a Hono server, a shared
`Layout` (header, main, footer), a responsive brand stylesheet, and the
Vitest setup. The site has one page and no data.

The MVP covers roadmap Phases 2–7: the full care loop from
`specs/mission.md`. An agent can be found, report an ailment, see the
therapies recommended for it, book an appointment, and see or cancel that
appointment. The staff dashboard, agent dashboard, and polish pass (Phases
8–10) come after the MVP.

The work follows `specs/mission.md` (reliable first, features serve care,
attractive and responsive in orange and black, small visible steps) and
`specs/tech-stack.md` (Hono JSX, plain CSS, SQLite via `better-sqlite3`, Zod
via `@hono/zod-validator`, Vitest with `app.request()`).

A UX and accessibility review of Phase 1 found gaps that will matter as soon
as more links and forms arrive. Its must-fix items are part of this MVP and
come before any new pages.

## Scope

### In scope

The MVP is built in seven small steps. Each one ends with something visible
in the browser and with `npm run validate` passing.

- **0. Accessibility base** (from the UX review)
  - Link styles: links use `--color-accent` and stay underlined, with hover
    and visited states.
  - A `--color-focus` token with a `:focus-visible` outline (3px solid,
    2px offset). It is bright orange on the black bars and in the dark
    scheme, and `#c2410c` on the light page.
  - `color-scheme: light dark` on `:root`.
  - A "Skip to content" link as the first item in `<body>`, pointing to
    `<main id="main">`.
  - The header lines up with the main content on wide screens: header
    padding is `max(var(--gutter), (100% - var(--content-width)) / 2 + var(--gutter))`.
- **2a. Navigation, home page, and database** (roadmap Phase 2, part 1)
  - Header navigation with Home, Agents, Ailments, Therapies, and
    Appointments. It wraps on narrow screens and has no hamburger menu,
    because there is no client JS. The current section is marked with
    `aria-current="page"`.
  - The home page describes the clinic's services: ailments, therapies,
    and appointments, each linking to its section.
  - SQLite schema and seed data, applied at startup.
- **2b. Agents and ailments pages** (roadmap Phase 2, part 2)
  - `/agents` shows agent cards: one column on phones, a grid from `40rem`.
  - `/agents/:id` shows an agent's profile. An unknown or non-numeric id
    gets a friendly 404 page.
  - `/ailments` lists every ailment with its short description.
- **3. Report an ailment**
  - The agent page has a form to choose an ailment and add an optional
    note. `POST /agents/:id/ailments` records it.
  - The agent page lists the agent's current ailments, newest first.
- **4. Therapies catalog**
  - Seeded therapies, each linked to one or more of the ailments it treats.
  - `/therapies` lists each therapy with its description and the ailments
    it treats.
- **5. Recommended therapies**
  - The agent page shows the therapies that treat any of its current
    ailments, without duplicates, and names the ailment each one is for.
  - If the agent has no ailments, the page shows an empty state.
- **6. Book an appointment**
  - `GET /agents/:id/appointments/new` shows a one-column form with a
    native `datetime-local` input and an optional reason, using touch-sized
    controls.
  - `POST /agents/:id/appointments` validates the input with Zod.
  - On success, it redirects to `/appointments/:id`, a confirmation page.
- **7. Appointment list**
  - `/appointments` lists upcoming booked appointments, soonest first,
    showing the agent, date and time, and reason.
  - The list is cards on phones, so there is no horizontal scrolling.
  - Each appointment has a Cancel button (`POST /appointments/:id/cancel`).
    Cancelled appointments disappear from the list.
- **Friendly 404** for every unknown route, using `Layout`.

### Data model

Defined in `src/db/schema.sql`:

| Table             | Columns |
| ----------------- | ------- |
| `agents`          | `id`, `name`, `model`, `human` (who it works for), `bio` |
| `ailments`        | `id`, `name` (unique), `description` |
| `agent_ailments`  | `id`, `agent_id` → agents, `ailment_id` → ailments, `note`, `reported_at` |
| `therapies`       | `id`, `name` (unique), `description` |
| `therapy_ailments`| `therapy_id` → therapies, `ailment_id` → ailments (composite primary key) |
| `appointments`    | `id`, `agent_id` → agents, `scheduled_at` (ISO `YYYY-MM-DDTHH:MM`), `reason`, `status` (`booked` or `cancelled`), `created_at` |

Foreign keys are on (`PRAGMA foreign_keys = ON`).

### Seed data

Defined in `src/db/seed.sql`:

- **Agents (5):** each with a name, model, human, and bio. A few, for example
  "Ada (coding assistant)" and "Scribe (writing helper)".
- **Ailments (6):** at least the three from `specs/mission.md`:
  - Context overload
  - Contradictory instructions
  - Endless revision requests
  - Three more of our choosing, for example "Hallucination anxiety",
    "Scope creep", and "Tool-call fatigue".
- **Therapies (6):** each linked to at least one ailment, and every ailment
  treated by at least one therapy. For example "Context compaction",
  "Clarifying-questions session", and "Boundary setting".
- **Reported ailments:** two agents start with one reported ailment each,
  so recommendations can be shown in a demo without any setup.
- **No appointments:** seeded appointments would quickly be in the past.

### Out of scope

- Staff dashboard, agent dashboard, and the full polish pass (Phases 8–10).
- Resolving or removing a reported ailment.
- Editing or rescheduling appointments. Cancelling is the only change.
- Slot or clash checking for appointments.
- Creating, editing, or deleting agents, ailments, or therapies through the
  UI. They come from seed data only.
- Authentication, client-side JavaScript, and web fonts.
- The UX review's "should fix" and "nice to have" items that are not listed
  above: dark-mode bar lift, button and input-border tokens, theme-color
  meta, h1 hyphenation, and reduced motion. Exception: any buttons or inputs
  this MVP adds must meet the contrast rules below.

## Decisions

- **Phase 2 is split into 2a and 2b.** The roadmap's Phase 2 combines
  navigation, the database, and three pages. Splitting it keeps to "small,
  visible steps". `specs/roadmap.md` is updated to match.
- **The app is created with a database.**
  - `src/app.ts` exports `createApp(db)` instead of a single `app`.
  - `src/index.ts` opens `data/agentclinic.db`, creating `data/` if needed.
  - Tests call `createApp(openDb(":memory:"))`.
  - Phase 1 tests are updated to use the factory.
- **Database module.** `src/db/index.ts` exports `openDb(path)`. It opens
  the database, turns on foreign keys, and runs `schema.sql` and `seed.sql`.
  - The schema uses `CREATE TABLE IF NOT EXISTS`.
  - The seed uses `INSERT OR IGNORE` with fixed ids, so restarting the
    server is safe.
  - Queries live in one file per feature, for example
    `src/db/agents.ts` and `src/db/appointments.ts`. Routes don't write SQL.
- **Routes are grouped by feature**, as `specs/tech-stack.md` says:
  `src/routes/agents.tsx`, `ailments.tsx`, `therapies.tsx`, and
  `appointments.tsx`. Each is a Hono sub-app mounted in `createApp`.
- **One component per file, and one page per file.**
  - Shared components go in `src/components/`: `Nav`, `AgentCard`,
    `EmptyState`, `FormErrors`, and so on.
  - Pages go in `src/pages/`.
  - `Layout` gains a `current` prop so `Nav` can mark the active section.
- **Forms post, then redirect.**
  - Every form uses `method="post"` and plain HTML.
  - On success, the route redirects with 303, so refreshing the page
    doesn't post again.
  - On a validation failure, the route re-renders the form with status
    422, the error messages, and the values already entered. It uses a
    `@hono/zod-validator` hook, not the default JSON error.
- **Booking validation:**
  - `scheduled_at` is required, uses the `YYYY-MM-DDTHH:MM` format, and
    must be in the future.
  - `reason` is optional, trimmed, and at most 500 characters.
  - The agent must exist; otherwise the route returns a 404.
- **Ailment report validation:**
  - `ailment_id` must be an existing ailment.
  - `note` is optional, trimmed, and at most 500 characters.
  - Reporting the same ailment twice is allowed. Each report is listed.
- **Time is server-local.** `scheduled_at` is stored as the string from
  `datetime-local`. "Upcoming" means `scheduled_at` is later than the
  server's current local time, compared as strings. Tests inject `now`, so
  they don't depend on the clock.
- **Cancel is a soft delete.** It sets `status = 'cancelled'`. Cancelling an
  unknown appointment returns 404. Cancelling one that is already cancelled
  redirects back to `/appointments` with no error.
- **No client JavaScript.** No page renders a `<script>` tag. Native inputs
  and forms do all the work.
- **Accessibility and contrast:**
  - Every new color pair (button text on its background, input borders,
    focus ring) meets WCAG AA in both schemes: 4.5:1 for text and 3:1 for
    non-text.
  - These pairs are added to the contrast test in `src/styles.test.ts`.
  - Buttons use black text on bright orange, or white text on `#c2410c`.
    Never white on bright orange.
  - Every form control has a `<label>`.
  - Error messages are linked to their field with `aria-describedby`.
- **Responsive from the start.** New pages follow the responsive design
  rules in `specs/tech-stack.md`. This MVP adds no new breakpoints.
- **Spec updates.**
  - Add `--color-focus` and any button and input-border tokens to the
    "Brand colors" table in `specs/tech-stack.md`.
  - Mark Phases 2–7 complete in `specs/roadmap.md` when the MVP is done.
- **Dependencies.**
  - Runtime: `better-sqlite3`, `zod`, `@hono/zod-validator`.
  - Dev: `@types/better-sqlite3`.
  - `better-sqlite3` ships prebuilt binaries for current Node LTS on
    Windows, macOS, and Linux.
- **`data/` is git-ignored.**
- **Tests are type-checked.**
  - `tsconfig.json` includes the test files.
  - A separate `tsconfig.build.json` leaves them out of `dist/`.
  - `validate` runs `tsc --noEmit` first.

  This replaces Phase 1's approach of excluding tests from `tsconfig.json`
  and adding a JSX pragma to each test file. That approach left the tests
  unchecked.
- **Style tests strip CSS comments first.** The code review found that a
  commented-out token value could override the real one, so a real
  contrast failure passed the test.
