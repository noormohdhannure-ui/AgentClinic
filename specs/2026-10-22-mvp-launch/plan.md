# Plan: MVP launch

See `requirements.md` for scope and decisions, and `validation.md` for the
merge checklist. Work on the `mvp` branch.

## 1. Browser baseline

1. Build the app, and run it from a scratch folder with a fresh database on
   a spare port.
2. Run the headless Chrome check: every page, at four widths, in two
   schemes. Record the defects found: small tap targets and the favicon
   404.

## 2. Design system

1. Rewrite `public/styles.css` around tokens:
   - the colors, `--radius`, `--shadow`, and `--shadow-raised`;
   - the components: buttons (primary and secondary), cards and
     whole-card links, avatars, badges, the hero, page headers, panels,
     the steps list, and the agent page's two-column layout.
2. Keep every existing rule the style tests check:
   - mobile-first queries at `40rem` and `64rem` only;
   - the skip link, the focus ring, and link colors;
   - the bar padding, the nav, and form controls.
3. Add `prefers-reduced-motion` handling that turns off hover movement.
4. Extend `src/styles.test.ts`:
   - the new contrast pairs: bar-strong on the bar, badge text on the
     badge, the avatar, and the secondary button;
   - the whole-card link overlay;
   - the reduced-motion rule.

## 3. Markup

1. `Header`: the logo mark SVG inside the brand link. `Footer`: the "Built
   with spec-driven development." line.
2. `Layout`: the favicon link and the `theme-color` meta tag. Add
   `public/favicon.svg`.
3. `HomePage`: the hero, the service cards, and "How it works".
4. `AgentsPage`, `AilmentsPage`, and `TherapiesPage`: page headers.
   `AgentCard`: an avatar and a whole-card link.
5. `AgentPage`: the profile header, panels, and the two-column layout.
6. `BookAppointmentPage`: a back link to the agent. `AppointmentPage`: a
   status badge, and action buttons. `AppointmentsPage`: an avatar, the
   time, and a secondary Cancel button.
7. `EmptyState` actions and the 404 back link become secondary buttons.
8. Update the tests to match the new markup, keeping every pinned string.

## 4. Browser checks and the care loop

1. Rebuild, then rerun the Chrome check until it reports no problems.
2. Review the screenshots at 320px and 1280px in both schemes.
3. Run the scripted care loop in Chrome:
   1. agents;
   2. Ledger;
   3. report;
   4. recommendations;
   5. book;
   6. confirmation;
   7. list;
   8. cancel.
4. Check the keyboard: the first Tab shows the skip link, and the focus
   ring is visible on the bars and in the hero.

## 5. Docs and cleanup

1. Move `prompts.md` to `docs/prompts-constitution.md`.
2. Remove `.idea/` from git and add it to `.gitignore`.
3. Rewrite `README.md` with the overview, a feature tour, the setup and
   scripts, the project layout, and the SDD case study.
4. Update `specs/tech-stack.md` (tokens and design notes),
   `specs/roadmap.md` (this phase), and `CHANGELOG.md`.

## 6. Ship

1. Run `npm run validate`.
2. Commit, merge `mvp` into `main`, and push both to the `agentclinic`
   GitHub remote.
