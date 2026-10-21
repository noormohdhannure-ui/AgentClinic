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
