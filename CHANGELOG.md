# Changelog

All notable changes to AgentClinic, newest first.

## 2026-10-22

- Added the project constitution in `specs/`: the mission, the tech stack
  (Hono on Node.js with SQLite), and a roadmap of small phases.
- Built Phase 1: Hello, clinic (`specs/2026-10-22-hello-clinic/`): a Hono
  server with a home page rendered through a main layout of separate Header,
  Main, and Footer components, a stylesheet with a dark color scheme, and
  `dev`, `build`, `start`, and `test` scripts.
- Moved the project to ES modules and Hono JSX.
- Marked Phase 1 complete in the roadmap.
- Added `npm run validate` (build, then all tests) as the merge check, and
  `npm run test:watch` for development.
- Made Vitest tests the way every automated check in a feature's
  `validation.md` is proven, adding route, component, stylesheet, and
  project-setup tests.
- Made responsive design a product requirement: the stylesheet is now
  mobile-first with standard breakpoints, fluid type, and touch-sized
  targets, and the mission, tech stack, roadmap, and Phase 1 spec describe
  the responsive rules.
- Added a `/changelog` skill that keeps this file up to date before each
  merge.
- Gave the site its orange-and-black brand: black header and footer bars,
  the brand name in orange with an orange line under the header, and a
  darker orange for text on light backgrounds. Vitest tests now check the
  brand tokens and the contrast of every text color in both color schemes.
- Added the MVP spec (`specs/2026-10-22-mvp/`), covering roadmap Phases
  2–7: the full care loop from finding an agent to reporting an ailment,
  seeing recommended therapies, booking, and cancelling an appointment.
  It splits Phase 2 into 2a and 2b, with each phase adding its own tables
  and seed data, and pins the seed data, page copy, and error messages
  that the tests check.
- Settled how the MVP is built: free date-and-time booking, forms that post
  and then redirect with a status message, versioned database migrations
  in TypeScript, strict id parsing, and accessible form errors.
- Planned two groundwork steps before any new pages:
  - test tooling: type-checked tests, and CSS comments stripped before
    the contrast tests read colors;
  - an accessibility base: link and focus styles, a skip link,
    `color-scheme`, and lining up the header with the page content.
- Set the MVP's merge bar:
  - an end-to-end care-loop test;
  - input edge-case tests, such as HTML escaping, strict ids, and time
    boundaries;
  - checks that run on every page, such as the layout, the nav, page
    titles, and that no page ships client JavaScript;
  - a manual responsive, keyboard, and screen-reader pass.
- Revised the MVP spec after product, engineering, and QA reviews.
- Built the MVP (`specs/2026-10-22-mvp/`), roadmap Phases 2–7. The full
  care loop now works in the browser: find an agent, report an ailment, see
  recommended therapies, book an appointment, and view or cancel it.
- Added test tooling: test files are now type-checked, with a separate
  `tsconfig.build.json` for the build, and `npm run validate` type-checks
  first. The style tests now ignore CSS comments, which could previously
  hide a real contrast failure.
- Added an accessibility base: underlined accent-colored links, a visible
  orange focus ring on the page and the black bars, a "Skip to content"
  link, `color-scheme`, and a header and footer that line up with the page
  content.
- Added header navigation that wraps on phones and marks the current
  section by underline as well as color, a services section on the home
  page, and a friendly 404 page.
- Added SQLite with versioned migrations, each adding its tables and seed
  data: five agents, six ailments, six therapies, and two reported
  ailments.
- Added `/agents`, `/agents/:id`, `/ailments`, and `/therapies`, with cards
  that stack on phones and form a grid on wider screens.
- Added reporting an ailment from an agent's page, and recommended
  therapies for the agent's ailments.
- Added booking an appointment with a date-and-time picker, a confirmation
  page, and `/appointments`, which lists upcoming appointments with a
  Cancel button for each.
- Made forms accessible: an error summary that links to each field, inline
  errors, kept values, an `Error:` page title, and a status message after
  each successful report or cancellation.
- Added an end-to-end test of the care loop, and checks that run on every
  page for the layout, the nav, unique titles, and no client-side
  JavaScript.
- Updated the roadmap and tech stack for the MVP: new color tokens,
  scripts, migrations, and time handling.
- Fixed booking for browsers without a date picker: a time typed in the
  hint's format, `YYYY-MM-DD HH:MM`, is now accepted. The picker also now
  starts one minute after the current time, the earliest time the clinic
  accepts.
- Clarified the MVP spec from what building it turned up: page titles, how
  booking routes are mounted, when the cancelled message shows, running the
  server from the project root, footer text size, who does the browser
  checks, and that the changelog is committed by the person merging.
- Gave AgentClinic a modern look in its orange and black brand
  (`specs/2026-10-22-mvp-launch/`). The design adds:
  - a logo mark and favicon;
  - a home page hero with "How it works";
  - cards you can click anywhere, with avatars;
  - a two-column agent page;
  - status badges, outline buttons, and gentle hover effects that respect
    reduced motion.
- Fixed two defects found by testing in Chrome at every width and in both
  color schemes: links under the 44px touch target, and a missing favicon
  that logged a 404 on every page.
- Rewrote the README with setup instructions, a feature tour, the project
  layout, screenshots, and a case study of how the project was built with
  spec-driven development.
- Cleaned up the repository: moved the constitution prompt log to `docs/`,
  and stopped tracking editor settings (`.idea/`).
- Explained why AgentClinic exists, in the README and the mission:
  - the playful idea and its tone;
  - how each ailment and therapy maps to a real AI-agent failure mode and
    its fix;
  - the use cases: teaching SDD, booth demos, a blueprint for booking apps,
    and agent ops;
  - the key technical decisions, my role in the build, and what's next.
- Trimmed the README: removed sections that repeated the intro, the
  features, and the case study.
