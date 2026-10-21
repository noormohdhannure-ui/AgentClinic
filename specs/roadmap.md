# Roadmap

High-level implementation order. Each phase is small and ends with something
visible in the browser. Finish one phase, keeping build and tests green,
before starting the next.

## Phase 1: Hello, clinic

- Add Hono and serve a single "AgentClinic" home page.
- Add `dev`, `build`, `start`, and `test` scripts.
- One test confirms the home page returns 200.

## Phase 2: Layout and styling

- Shared page layout: header, navigation, footer.
- Base stylesheet with the site's colors and typography.
- Home page describes the clinic's services.

## Phase 3: Agents list

- Seed a small set of sample agents.
- `/agents` lists them.

## Phase 4: Agent detail

- `/agents/:id` shows one agent's profile.
- Friendly 404 page for unknown agents.

## Phase 5: Ailments catalog

- Seed common ailments.
- `/ailments` lists them with short descriptions.

## Phase 6: Report an ailment

- From an agent's page, record that the agent has an ailment.
- The agent detail page shows its current ailments.

## Phase 7: Therapies catalog

- Seed therapies and link each to the ailments it treats.
- `/therapies` lists them.

## Phase 8: Recommended therapies

- An agent's page shows therapies recommended for its ailments.

## Phase 9: Book an appointment

- A form to book an appointment for an agent, with validation.
- Confirmation page after booking.

## Phase 10: Appointment list

- `/appointments` shows upcoming appointments.
- Cancel an appointment.

## Phase 11: Staff dashboard

- `/dashboard` summarizes agents, open ailments, and today's appointments.

## Phase 12: Agent dashboard

- A per-agent view of its ailments, therapies, and upcoming appointments.

## Phase 13: Polish

- Responsive layout checks on phone and desktop widths.
- Accessibility pass: labels, contrast, keyboard navigation.
- Empty states and error messages reviewed across pages.
