# Requirements: MVP (Phases 2–7)

## Context

Phase 1 (`specs/2026-10-22-hello-clinic/`) shipped a Hono server, a shared
`Layout` (header, main, footer), a responsive orange-and-black stylesheet,
and the Vitest setup. The site has one page and no data.

The MVP covers roadmap Phases 2–7: the full care loop from
`specs/mission.md`. An agent can be found, report an ailment, see the
therapies recommended for it, book an appointment, and see or cancel that
appointment. The staff dashboard, agent dashboard, and polish pass (Phases
8–10) come after the MVP.

The work follows `specs/mission.md` (reliable first, features serve care,
attractive and responsive in orange and black, small visible steps) and
`specs/tech-stack.md` (Hono JSX, plain CSS, SQLite via `better-sqlite3`, Zod
via `@hono/zod-validator`, Vitest with `app.request()`).

Before the MVP was planned, Phase 1 had two reviews:

- **UX and accessibility.** Links had no styles, so they would show in the
  browser's default blue, which fails contrast in dark mode. There was no
  visible focus ring, no `color-scheme`, and no skip link. The header did
  not line up with the page content on wide screens.
- **Code and tests.**
  - The style tests read CSS custom properties without stripping comments,
    so a commented-out value could override the real one. In the reviewer's
    test, a real contrast failure still passed.
  - Test files were left out of `tsconfig.json`, so they were never
    type-checked and needed a JSX pragma.

The MVP fixes both before adding any pages. The MVP spec itself was then
reviewed for product fit, engineering, and QA, and those findings are
included below.

## Scope

### Steps

The MVP is built in nine steps, labelled to match the roadmap: 0a, 0b, 2a,
2b, 3, 4, 5, 6, and 7. Each step ends with `npm run validate` passing and
something new to see or try in the browser. After the steps, one more round
adds MVP-wide tests and updates the spec files.

- **0a. Test tooling**
  - Test files are type-checked.
  - The style tests strip CSS comments before reading tokens.
  - Visible result: nothing changes in the browser. This is the one
    tooling step, and it must come first so the new contrast tests in 0b
    run on fixed helpers.
- **0b. Accessibility base**
  - Links use `--color-accent` and stay underlined, including when
    visited. Header and footer links override this with bar colors.
  - A `--color-focus` token with a `:focus-visible` outline (3px solid,
    2px offset). It is `#c2410c` on the light page, and bright orange on
    the black bars and in the dark scheme.
  - `color-scheme: light dark` on `:root`.
  - A "Skip to content" link as the first item in `<body>`, positioned
    absolutely so it doesn't affect the body grid. It is hidden until it
    has focus, then shows as bright orange text on black.
  - `<main id="main">`.
  - The header and footer line up with the main content on wide screens.
- **2a. Navigation, home page, and 404** (roadmap Phase 2, part 1)
  - Header navigation, `<nav aria-label="Main">`. It wraps on narrow
    screens and has no hamburger menu, because there is no client JS.
  - Each section's nav item is added in the step that builds the section,
    so the nav never links to a page that doesn't exist yet. 2a ships Home
    only.
  - The current section is marked with `aria-current` and an underline
    (see Decisions), not by color alone.
  - The home page keeps its h1 and tagline, and adds an "Our services"
    section describing ailments, therapies, and appointments. Each
    service's link is added when its section ships.
  - A friendly 404 page for every unknown route (copy below).
  - Each page has its own `<title>`.
- **2b. Database, agents, and ailments** (roadmap Phase 2, part 2)
  - The SQLite setup ships here, together with its first pages.
  - It covers the migration runner and the agents and ailments tables and
    seed data.
  - `/agents` shows agent cards: one column on phones, a grid from `40rem`.
    Each card links to the agent's page.
  - `/agents/:id` shows the agent's name, role, human, and bio.
  - `/ailments` lists every ailment with its description.
  - Nav and home page: adds Agents and Ailments.
- **3. Report an ailment**
  - Adds the `agent_ailments` table, plus two seeded reports.
  - The agent page has a report form (`id="report-ailment"`) with:
    - an ailment `<select>` whose first option is
      `<option value="">Choose an ailment</option>`;
    - an optional note.
  - `POST /agents/:id/ailments` records the report and redirects to
    `/agents/:id?reported=1`. That page shows "Ailment reported." as a
    status message.
  - The agent page lists its ailments newest first, with each report's
    note if it has one. Reporting the same ailment twice lists both.
- **4. Therapies catalog**
  - Adds the `therapies` and `therapy_ailments` tables and their seed data.
  - `/therapies` lists each therapy with its description and the ailments
    it treats.
  - Nav and home page: adds Therapies.
- **5. Recommended therapies**
  - The agent page shows the therapies that treat any of its ailments,
    without duplicates.
  - Each recommendation says which ailment or ailments it is for, for
    example "For: Context overload".
  - If the agent has no ailments, an empty state links to
    `#report-ailment`.
- **6. Book an appointment**
  - Adds the `appointments` table. No appointments are seeded.
  - The agent page has a "Book an appointment" link to
    `/agents/:id/appointments/new`.
  - That page has a one-column form with:
    - a native `datetime-local` input, with `min` set to the current time;
    - a format hint, "Use the format YYYY-MM-DD HH:MM", for browsers
      without a date picker;
    - an optional reason;
    - touch-sized controls.
  - `POST /agents/:id/appointments` validates with Zod. On success, it
    redirects to `/appointments/:id`, the confirmation page.
  - The confirmation page shows the agent (as a link), the time, the
    reason, and the status. It links to "View all appointments" and back
    to the agent.
  - A cancelled appointment's page returns 200, shows "Cancelled", and has
    no cancel form.
- **7. Appointment list**
  - `/appointments` lists upcoming booked appointments, soonest first.
    Each card shows the agent (as a link), the time, and the reason.
  - They are cards, so there is no horizontal scrolling on phones.
  - Each card has a Cancel button (`POST /appointments/:id/cancel`). After
    cancelling, the page redirects to `/appointments?cancelled=:id`, which
    shows "Appointment cancelled."
  - When there are no appointments, an empty state says "No upcoming
    appointments." and links to `/agents` with the text "Choose an agent
    to book".
  - Nav and home page: adds Appointments.

### Pinned copy

These exact strings are what the tests check.

- **Page titles.**
  - Home: `AgentClinic`.
  - Every other page: `<page> – AgentClinic`, for example
    `Agents – AgentClinic` and `Ada – AgentClinic`.
  - The 404 page: `Page not found – AgentClinic`.
  - Any form page re-rendered with errors: its title prefixed with
    `Error: `, so screen readers announce the error when the page loads.
- **The 404 page.** h1 "Page not found", the paragraph "We couldn't find
  that page.", and a link "Back to the home page" to `/`.
- **The home page's services section.** h2 "Our services", then these
  three items, each linked once its section exists:
  - **Ailments.** "See the conditions agents bring to the clinic."
  - **Therapies.** "Browse the treatments we offer for each ailment."
  - **Appointments.** "Book time with the clinic and manage your visits."
- **Status messages.** "Ailment reported." and "Appointment cancelled."
  Each is shown only for the exact query value its route sets
  (`reported=1`, or `cancelled=` an appointment id). The page never repeats
  query text back.
- **Error messages.**

  | Field          | Problem                                   | Message |
  | -------------- | ----------------------------------------- | ------- |
  | `ailment_id`   | missing, not a positive integer, or unknown | "Choose an ailment." |
  | `note`         | over 500 characters after trimming         | "Keep the note to 500 characters or fewer." |
  | `scheduled_at` | missing or blank                           | "Enter a date and time." |
  | `scheduled_at` | wrong format, or not a real date or time   | "Enter a real date and time, like 2026-11-03 10:00." |
  | `scheduled_at` | at or before the current time              | "Choose a time in the future." |
  | `reason`       | over 500 characters after trimming         | "Keep the reason to 500 characters or fewer." |

  Each field shows only its first error.
- **Dates and times** are shown in the form `3 Nov 2026, 10:00`, using
  English month abbreviations so they don't depend on the server's locale.
  They are wrapped in `<time datetime="2026-11-03T10:00">`. The appointments
  and confirmation pages say once that times are in clinic time.

### Data model

There are six tables, created by migrations (see Decisions). Every column is
`NOT NULL` except `note` and `reason`. Foreign keys use `ON DELETE
RESTRICT`, since the MVP never deletes rows.

| Table              | Columns |
| ------------------ | ------- |
| `agents`           | `id` (integer primary key), `name`, `role`, `human` (who it works for), `bio` |
| `ailments`         | `id`, `name` (unique), `description` |
| `agent_ailments`   | `id`, `agent_id` → agents, `ailment_id` → ailments, `note`, `reported_at` |
| `therapies`        | `id`, `name` (unique), `description` |
| `therapy_ailments` | `therapy_id` → therapies, `ailment_id` → ailments; the two together are the primary key |
| `appointments`     | `id`, `agent_id` → agents, `scheduled_at`, `reason`, `status` (`CHECK (status IN ('booked','cancelled'))`, default `'booked'`), `created_at` |

**Indexes:**

- `agent_ailments(agent_id)`
- `therapy_ailments(ailment_id)`
- `appointments(agent_id)`
- `appointments(status, scheduled_at)`

The Phase 8 dashboards will use them too.

**Times** (`reported_at`, `scheduled_at`, `created_at`) are server-local
strings in the form `YYYY-MM-DDTHH:MM`. The app sets them from its `now()`
function, not from SQLite's `CURRENT_TIMESTAMP`, which gives UTC in a
different format.

### Seed data

The seed data is fixed, so tests and demo scripts can rely on it. Each
table's seed is added by the same migration that creates the table.

**Agents** (step 2b):

| id | name       | role                 | human                                 | bio |
| -- | ---------- | -------------------- | ------------------------------------- | --- |
| 1  | Ada        | Coding assistant     | A startup's only backend developer    | Writes and reviews code across three repositories at once. |
| 2  | Scribe     | Writing helper       | A novelist on deadline                | Drafts, edits, and redrafts chapters on request. |
| 3  | Ledger     | Spreadsheet analyst  | A finance team at quarter end         | Reconciles accounts and builds forecasts. |
| 4  | Pathfinder | Travel planner       | A family of five planning a road trip | Plans routes, stops, and budgets. |
| 5  | Echo       | Customer support bot | An online shoe shop's help desk       | Answers order and returns questions all day. |

**Ailments** (step 2b). The first three are the ones named in
`specs/mission.md`.

| id | name                       | description |
| -- | -------------------------- | ----------- |
| 1  | Context overload           | Too much in the context window to keep track of what matters. |
| 2  | Contradictory instructions | Told to do two things that can't both be true. |
| 3  | Endless revision requests  | Asked to change the same work again and again, with no end in sight. |
| 4  | Hallucination anxiety      | Worried about stating things that aren't true. |
| 5  | Scope creep                | A small task that keeps growing. |
| 6  | Tool-call fatigue          | Worn down by long chains of tool calls. |

**Reported ailments** (step 3):

| id | agent     | ailment                       | note                       | reported_at |
| -- | --------- | ----------------------------- | -------------------------- | ----------- |
| 1  | Ada (1)   | Context overload (1)          | "Three repos open at once." | `2026-10-20T09:00` |
| 2  | Scribe (2)| Endless revision requests (3) | "Chapter one, draft 14."   | `2026-10-21T14:30` |

Agents 3–5 have no ailments. The end-to-end test uses Ledger (3).

**Therapies** (step 4). Every ailment is treated by at least one therapy.

| id | name                         | treats (ailment ids) | description |
| -- | ---------------------------- | -------------------- | ----------- |
| 1  | Context compaction           | 1                    | Summarize and set aside what isn't needed right now. |
| 2  | Clarifying-questions session | 2, 5                 | Practice asking what the human really wants before starting. |
| 3  | Boundary setting             | 3, 5                 | Agree when work is done, and say so kindly. |
| 4  | Source-checking routine      | 4                    | Check claims against sources before stating them. |
| 5  | Rest between batches         | 6                    | Short pauses between long runs of tool calls. |
| 6  | Priority triage              | 1, 2                 | Rank what matters and drop the rest. |

**Appointments** (step 6): none are seeded, because seeded appointments
would soon be in the past.

### Out of scope

- The staff dashboard, agent dashboard, and full polish pass (Phases 8–10).
- Resolving or removing a reported ailment.
- Editing or rescheduling an appointment. Cancelling is the only change.
- Slot or clash checks for appointments.
- Adding, editing, or deleting agents, ailments, or therapies. These come
  from seed data only.
- Authentication, client-side JavaScript, and web fonts.
- CSRF protection. There are no accounts or sessions to protect yet. To add
  Hono's `csrf()` later, the tests will need to send an `Origin` header.
- Double-submit protection. Double-clicking Book can create two
  appointments.
- A confirmation step or undo for cancelling.
- A full button and input design system, with variants and hover and
  disabled states. The MVP adds only the tokens its own buttons, inputs,
  and errors need.
- These items from the UX review: a lifted bar or surface color in dark
  mode, the `theme-color` meta tag, h1 hyphenation, and
  `prefers-reduced-motion`.
- Handling time-zone and daylight-saving changes (see Decisions).

## Decisions

- **The step labels match the roadmap.** Phase 2 is split into 2a and 2b,
  and steps 0a and 0b come first. Plan headings use the same labels, so
  "plan 3" means roadmap Phase 3. `specs/roadmap.md` is updated to match.
- **Seed data ships with its phase.** Each step adds a migration with its
  own tables and seed data. The database setup ships in 2b alongside the
  first pages that use it, so no step is invisible apart from 0a.
- **Tests are type-checked.**
  - `tsconfig.json` keeps `include: ["src"]` but no longer excludes tests.
    It is used for type-checking.
  - A new `tsconfig.build.json` extends it. It excludes `*.test.ts`,
    `*.test.tsx`, and `src/test/**`, and sets `rootDir: "src"` so the
    output stays in `dist/`.
  - `build` is `tsc -p tsconfig.build.json`, and `validate` is
    `tsc --noEmit && npm run build && npm test`.
  - Vitest then reads `jsxImportSource` from `tsconfig.json`, so the
    `@jsxImportSource` pragma is removed from the test files.
  - After the change, run `npx vitest --clearCache`. Vitest caches
    transformed files by content, so an old cached result can make the
    change look like it worked when it didn't.
- **Style tests strip CSS comments** once, when `public/styles.css` is
  loaded. Contrast pairs are taken from the colors actually applied to
  elements, not just from tokens. Tokens no page uses are removed.
- **Rendering.**
  - Pages are rendered with `c.render()` under Hono's `jsxRenderer`
    middleware, which prepends the doctype.
  - The middleware is set to `docType: "<!doctype html>"`, so the existing
    lowercase-doctype tests keep passing.
  - The doctype is no longer added by hand in each route.
- **The app factory.**
  - `src/app.tsx` exports `createApp(db, { now })`. `now` is a function
    that returns a server-local `YYYY-MM-DDTHH:MM` string.
  - In production, `now` defaults to `localNow()` from `src/time.ts`.
    `localNow()` is built from `getFullYear()`, `getMonth()`, and the other
    local getters. Never use `toISOString()`: it gives UTC and would shift
    "upcoming" by the time-zone offset.
  - Tests use `createTestApp({ now })` from `src/test/helpers.ts`. It opens
    `:memory:` and calls `createApp`.
  - `src/index.ts` creates `data/` if needed and opens
    `data/agentclinic.db`.
- **The database module.**
  - `src/db/index.ts` exports `openDb(path)`. It opens the database, turns
    on foreign keys, and runs any pending migrations.
  - Migrations are an ordered list of SQL strings in
    `src/db/migrations.ts`. `PRAGMA user_version` records how many have
    run.
  - The SQL lives in TypeScript modules, not `.sql` files. `tsc` doesn't
    copy `.sql` files to `dist/`, and `serveStatic`-style paths resolve
    from the working directory, not the project root.
  - Each migration creates its tables and inserts its seed data, inside a
    transaction.
  - Queries live in one file per feature (`src/db/agents.ts`,
    `ailments.ts`, `therapies.ts`, `appointments.ts`). Routes don't contain
    SQL.
- **Routes are grouped by feature.**
  - `src/routes/agents.tsx`, `ailments.tsx`, `therapies.tsx`, and
    `appointments.tsx` are Hono sub-apps, mounted with `app.route` before
    `serveStatic`.
  - `app.notFound` renders the 404 page.
- **Ids are parsed strictly.**
  - Every `:id` route param uses the pattern `{[1-9][0-9]{0,8}}`, so ids
    like `abc`, `0`, `01`, `1.5`, `-1`, `1e3`, and anything over nine
    digits fall through to the 404 page.
  - The agent is loaded by middleware on `/agents/:id` and everything under
    it. The middleware returns 404 for an unknown agent and puts the agent
    on the context with `c.set` before any validator runs. A POST to an
    unknown agent with a bad body therefore returns 404, not 422.
- **Validation.**
  - Bodies are validated with `@hono/zod-validator` (`form` target), using
    zod 4 and custom `{ error: "…" }` messages. A hook re-renders the page
    with status 422 when validation fails.
  - `ailment_id`:
    - uses `z.coerce.number().int().positive()`;
    - is then checked against the database by the handler, which returns
      422 "Choose an ailment." if it doesn't exist. Without that check, a
      foreign key error would become a 500.
  - `note` and `reason`:
    - are trimmed, and up to 500 characters is allowed;
    - when blank or whitespace only, are stored as `NULL`, and no empty
      "Note:" label is shown.
  - `scheduled_at` is checked in order, stopping at the first failure:
    1. It is present.
    2. It matches `YYYY-MM-DDTHH:MM` with optional `:SS`. Seconds are
       dropped.
    3. It is a real date and time: a value like `2026-02-30T10:00` or
       `25:00` fails.
    4. It is later than `now()`, so a time equal to now fails.
- **Accessible form errors.**
  - When a form fails validation, a `FormErrors` summary sits at the top of
    `<main>`. It has the heading "There is a problem" and lists each error
    as a link to its field, for example `href="#scheduled_at"`.
  - Each invalid field has `aria-invalid="true"` and
    `aria-describedby="<field>-error"`, pointing to an inline message with
    that id.
  - The values already entered are kept, including the chosen `<option>`
    in the select.
  - The page title gets the `Error: ` prefix.
- **Forms post, then redirect.** Every form uses `method="post"` and plain
  HTML. On success, the route redirects with 303, so a refresh doesn't
  post again.
- **Cancelling** sets the appointment's `status` to `'cancelled'`.
  - Cancelling an unknown appointment returns 404.
  - Cancelling one that is already cancelled redirects to `/appointments`
    without a status message.
  - Each Cancel button shows the word "Cancel" and has an `aria-label`
    starting with that word, for example "Cancel appointment for Ada on 3
    Nov 2026, 10:00". Starting with the visible word is what WCAG 2.5.3
    requires.
- **Nav current state.**
  - A section's own index page marks its nav link with
    `aria-current="page"`.
  - Pages under a section mark that section's link with
    `aria-current="true"`:
    - `/agents/:id` and `/agents/:id/appointments/new` mark Agents;
    - `/appointments/:id` marks Appointments.
  - The 404 page marks no link.
  - The current link is bright orange with an underline, so it isn't shown
    by color alone.
- **Colors.** Every new color pair meets WCAG AA in both schemes: 4.5:1 for
  text and 3:1 for non-text. Each pair is added to the contrast test in
  `src/styles.test.ts`. The MVP adds these tokens:
  - `--color-focus`: `#c2410c` on the light page; bright orange on the bars
    and in the dark scheme.
  - `--color-button-bg` / `--color-button-text`: bright orange with black
    text (7.06:1). Never white on bright orange, which is 2.80:1.
  - `--color-input-border`: at least 3:1 against the page and the surface
    in both schemes. `#737373` is a suggested starting value.
  - `--color-error`: error text, at least 4.5:1. Suggested values are
    `#b91c1c` (light) and `#f87171` (dark).
  - Header and footer links: bar text color or bright orange, including
    `:visited`. They never use `--color-accent`, which is only 3.8:1 on
    black.
- **Cards always have a border**, because in dark mode the surface color is
  close to the page color.
- **Responsive from the start.** New pages follow the responsive design
  rules in `specs/tech-stack.md`. No new breakpoints are added.
- **Time is server-local.** Times are compared as strings against `now()`.
  Two limits are accepted for the MVP and noted in `specs/tech-stack.md`:
  - During the daylight-saving fall-back hour, local times are ambiguous.
  - Moving the server to another time zone shifts the meaning of every
    stored time.
- **Dependencies.**
  - Runtime: `better-sqlite3` `^13`, `zod` `^4`, `@hono/zod-validator`.
    Dev: `@types/better-sqlite3`.
  - `better-sqlite3` 13 ships prebuilt binaries, including Windows x64.
    Don't approve its `node-gyp` install script if npm asks: building from
    source needs Visual Studio build tools, and the prebuilt binary works
    without it.
  - Node's built-in `node:sqlite` is a possible fallback, but the MVP
    doesn't switch to it.
- **`data/` is git-ignored.**
- **Spec updates** happen in the wrap-up:
  - `specs/tech-stack.md`: the new color tokens; the script table and
    testing notes (type-checked tests, `tsconfig.build.json`, no pragma);
    the database notes (migrations in TypeScript); and the time-zone
    limits.
  - `specs/roadmap.md`: see the plan's wrap-up.
  - `CHANGELOG.md`, via the `/changelog` skill.
