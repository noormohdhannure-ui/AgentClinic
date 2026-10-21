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

## Phase 2: Navigation, agents, and ailments

- Navigation in the header for the clinic's sections, which wraps or
  collapses to fit phone widths.
- Home page describes the clinic's services.
- Set up SQLite with a schema and seed data for sample agents and common
  ailments.
- `/agents` lists the agents as cards that stack on phones and form a grid
  on wider screens.
- `/agents/:id` shows one agent's profile, with a friendly 404 page for
  unknown agents.
- `/ailments` lists the ailments with short descriptions.

## Phase 3: Report an ailment

- From an agent's page, record that the agent has an ailment.
- The agent detail page shows its current ailments.

## Phase 4: Therapies catalog

- Seed therapies and link each to the ailments it treats.
- `/therapies` lists them.

## Phase 5: Recommended therapies

- An agent's page shows therapies recommended for its ailments.

## Phase 6: Book an appointment

- A form to book an appointment for an agent, with validation, laid out in
  one column on phones with touch-sized controls.
- Confirmation page after booking.

## Phase 7: Appointment list

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
- Accessibility pass: labels, contrast, keyboard navigation.
- Empty states and error messages reviewed across pages.
