# Roadmap

High-level implementation order. Each phase is small and ends with something
visible in the browser. Finish one phase, with `npm run validate` (build and
Vitest tests) passing, before starting the next. Every phase's UI is
responsive (see `specs/tech-stack.md`) when it ships.

## Phase 1: Hello, clinic (complete)

Spec: `specs/2026-10-22-hello-clinic/`

- Add Hono and serve a single "AgentClinic" home page.
- Main layout component with header, main, and footer subcomponents.
- Responsive, mobile-first base stylesheet with the site's colors and
  typography.
- Add `dev`, `build`, `start`, `test`, `test:watch`, and `validate` scripts.
- Vitest tests cover the routes, layout components, and project setup.

## MVP: Phases 2–7 (complete)

Spec: `specs/2026-10-22-mvp/`

The MVP is the full care loop: find an agent, report an ailment, see the
recommended therapies, and book, view, or cancel an appointment. It started
with two groundwork steps:

- **0a. Test tooling:** test files are type-checked, and the style tests
  strip CSS comments before reading colors.
- **0b. Accessibility base:** link and focus styles, a skip link,
  `color-scheme`, and the header lined up with the page content.

## Phase 2a: Navigation, home page, and 404 (complete)

- Navigation in the header for the clinic's sections, which wraps to fit
  phone widths. Each section's link is added when the section ships.
- Home page describes the clinic's services.
- A friendly 404 page for unknown routes.

## Phase 2b: Database, agents, and ailments (complete)

- SQLite with versioned migrations, each adding its tables and seed data.
- `/agents` lists the agents as cards that stack on phones and form a grid
  on wider screens.
- `/agents/:id` shows one agent's profile, with the 404 page for unknown
  agents.
- `/ailments` lists the ailments with short descriptions.

## Phase 3: Report an ailment (complete)

- From an agent's page, record that the agent has an ailment.
- The agent detail page shows its current ailments.

## Phase 4: Therapies catalog (complete)

- Seed therapies and link each to the ailments it treats.
- `/therapies` lists them.

## Phase 5: Recommended therapies (complete)

- An agent's page shows therapies recommended for its ailments.

## Phase 6: Book an appointment (complete)

- A form to book an appointment for an agent, with validation, laid out in
  one column on phones with touch-sized controls.
- Confirmation page after booking.

## Phase 7: Appointment list (complete)

- `/appointments` shows upcoming appointments, readable on phones without
  horizontal scrolling.
- Cancel an appointment.

## Phase 8: Staff dashboard

- `/dashboard` summarizes agents, open ailments, and today's appointments,
  with summary panels that stack on phones.

## Phase 9: Agent dashboard

- A per-agent view of its ailments, therapies, and upcoming appointments.

## Phase 10: Polish

- Responsive review across every page at phone, tablet, and desktop widths,
  fixing anything earlier phases missed.
- Accessibility pass on the Phase 8–9 pages: labels, contrast, keyboard
  navigation. The MVP pages were covered when they shipped.
- Empty states and error messages reviewed across pages.
