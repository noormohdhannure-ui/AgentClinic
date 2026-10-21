# Requirements: MVP launch

## Context

The MVP (`specs/2026-10-22-mvp/`) works end to end, but it isn't ready to
share yet:

- **It looks plain.** Pages are mostly plain headings and lists, and the
  home page has no hero.
- **A browser check found real defects:**
  - several links are only 21–24px tall, below the 44px touch target in
    `specs/tech-stack.md`;
  - every page requests a `/favicon.ico` that doesn't exist, which logs a
    404 in the console.
- **The repository isn't ready to share.**
  - The README still holds the course's stakeholder notes.
  - It has no setup instructions.
  - It doesn't tell the story of how the project was built.

This phase makes the MVP ready to share on GitHub. It adds no new features.
It serves the mission's "attractive, modern, and responsive" principle, and
both audiences:

- course students learning spec-driven development, who need a clear case
  study;
- booth demos, which need a site that looks good on a big screen.

## Scope

### In scope

- **Modern look and feel.** It stays orange and black, server-rendered,
  with no client JavaScript and no web fonts.
  - **Brand.** A logo mark: an orange rounded square with a black cross.
    It is an inline SVG next to the brand name, hidden from screen readers.
  - **Home hero.**
    - A dark panel with a soft orange glow.
    - The eyebrow "A clinic for AI agents", then the h1 and the tagline.
    - Two actions: "Meet the agents" (`/agents`, the primary button) and
      "See appointments" (`/appointments`, the secondary button).
  - **Services and steps on the home page.**
    - The three services are cards, and the whole card is the link.
    - A "How it works" section lists three numbered steps:
      1. **Report an ailment.** "Tell the clinic what's wrong."
      2. **Get a therapy.** "See treatments matched to each ailment."
      3. **Book a visit.** "Pick a time that suits you."
  - **Page headers.** Each section page opens with its h1 and a lead
    paragraph.
  - **Cards.**
    - Rounded, with a soft shadow, and the whole card is clickable where it
      links somewhere.
    - Agent cards and the agent page show an avatar with the agent's
      initial: black on orange.
  - **The agent page.**
    - A profile header with the avatar, the name, and the role.
    - From `64rem`, two columns: the details, ailments, and recommendations
      on the left, and the report form on the right.
  - **The appointment status** is shown as a badge: "Booked" in orange
    tones, "Cancelled" in neutral tones.
  - **Secondary buttons** (an outline style) for less important actions:
    - Cancel;
    - empty-state actions;
    - "Back" links.
  - **Hover effects.** Cards and buttons rise slightly on hover. With
    `prefers-reduced-motion`, nothing moves.
  - **The footer** adds the line "Built with spec-driven development."
- **Defect fixes.**
  - **Touch targets.** Every link and button is at least `--touch-target`
    tall. This covers:
    - the 404 page's back link;
    - empty-state actions;
    - links inside cards;
    - the booking page's link back to the agent.
  - **Favicon.** `public/favicon.svg` (the logo mark), linked from
    `Layout`.
  - **Browser theme color.** `<meta name="theme-color" content="#0a0a0a">`,
    so mobile browser bars match the black header.
- **Docs and cleanup.**
  - **README rewrite.** It covers:
    - what AgentClinic is;
    - a feature tour;
    - how to install, run, test, and validate;
    - the project layout;
    - a case study of how the project was built with spec-driven
      development, phase by phase.
  - **Prompt log.** `prompts.md` was the course's lesson-4 prompt log. It
    moves to `docs/prompts-constitution.md`, and the README links to it.
  - **Editor settings.** `.idea/` holds personal editor settings and is
    removed from git, then ignored.
  - **Spec updates.**
    - `specs/tech-stack.md`: the new color tokens, and the design notes.
    - `specs/roadmap.md`: this phase.
    - `CHANGELOG.md`: this phase's entries.
- **Browser testing.** Headless Chrome checks:
  - every page at 320, 375, 768, and 1280px, in light and dark mode, with
    a screenshot of each;
  - no horizontal overflow;
  - no tap target under 44px;
  - no console errors, except the 404 page's own status;
  - no script requests.

  A scripted run then clicks through the whole care loop.

### Out of scope

- New features, dashboards (Phases 8–9), and client-side JavaScript.
- Web fonts, images other than the inline SVG mark and the favicon, and
  CSS frameworks.
- Rewriting git history to fix the reused commit messages. The repository
  is already public, and rewriting would change every commit id.

## Decisions

- **Pinned copy stays.** All of the MVP's pinned strings still hold: the
  titles, the h1s, the tagline, the services copy, and the messages. Markup
  around them may change. Tests are updated to match the new markup, not to
  loosen what they check.
- **The whole card is a link.**
  - A card's heading link has a `::after` overlay that covers the card, so
    the whole card can be clicked or tapped.
  - There is one link per card, plus at most one more control. Cancel
    sits above the overlay, so it can still be pressed.
- **New tokens.** Every one is added to the contrast test:
  - `--color-bar-strong`: `#fafafa`, for headings on black.
  - `--color-badge-bg` and `--color-badge-text`: orange-100 and orange-800
    in light; orange-950 and orange-300 in dark.
- **Design scale.** These are added as tokens:
  - `--radius`: `0.75rem`;
  - `--shadow`: a soft two-layer shadow;
  - `--shadow-raised`: a stronger shadow for hover.

  Shadows use `px` offsets, which the "no fixed pixel widths" rule allows,
  since it only covers widths.
- **The hero sets its own focus color** (bright orange), as the bars do,
  because it is black in both schemes.
- **Avatars** use black on bright orange (7:1), the same pair as buttons.
