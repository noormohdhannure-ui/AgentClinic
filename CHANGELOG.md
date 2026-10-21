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
