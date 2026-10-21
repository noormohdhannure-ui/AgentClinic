# Validation: MVP launch

This phase is done when every item below is true.

## Automated checks (`npm run validate`)

- [x] `npm run validate` passes: type-check, build, and every Vitest test.
- [x] Every pinned string from `specs/2026-10-22-mvp/requirements.md`
      still appears where the MVP tests expect it.
- [x] `Layout` links `/favicon.svg` and has
      `<meta name="theme-color" content="#0a0a0a">`, and `GET /favicon.svg`
      returns 200.
- [x] The brand link holds the logo mark with `aria-hidden="true"` and the
      text "AgentClinic".
- [x] The home page has:
  - the hero, with the eyebrow;
  - the two action links, to `/agents` and `/appointments`;
  - the services as linked cards;
  - "How it works" with its three steps.
- [x] The style tests cover:
  - the new contrast pairs (bar-strong, badge, avatar, secondary button)
    in both schemes;
  - the whole-card link overlay;
  - the reduced-motion rule.
- [x] Every color token is used by at least one rule.

## Browser checks (headless Chrome)

Each item is checked in Chrome on every page, at 320, 375, 768, and
1280px, in light and dark mode:

- [x] No page scrolls horizontally.
- [x] No link or button is under 44px tall. The skip link is checked only
      while it has focus.
- [x] No console errors, except the 404 page's own status.
- [x] No script requests.
- [x] The screenshots at 320px and 1280px look right in both schemes:
  - nothing overlaps;
  - the hero, cards, and badges are readable;
  - the agent page has two columns from 1280px.
- [x] The scripted care loop works by clicking:
  1. agents;
  2. Ledger;
  3. report an ailment;
  4. recommendations;
  5. book;
  6. confirmation;
  7. list;
  8. cancel.
- [x] The first Tab focuses "Skip to content", and the focus ring shows.

## Docs and cleanup

- [x] The README explains:
  - what the project is;
  - how to install, run, test, and validate it;
  - the project layout;
  - the SDD case study, from the constitution through this phase.
- [x] `prompts.md` lives at `docs/prompts-constitution.md` and is linked
      from the README.
- [x] `.idea/` is no longer tracked and is git-ignored.
- [x] `specs/tech-stack.md`, `specs/roadmap.md`, and `CHANGELOG.md` cover
      this phase.

## Still needs a person

- [ ] A screen-reader pass with NVDA or VoiceOver.
- [ ] Checks on a real phone and in Safari.
