---
name: changelog
description: Create or update CHANGELOG.md in the project root, with a heading per date and bullets for the changes made on that date. If there is no changelog yet, build one from the project's git history. Run manually before merging a feature branch.
disable-model-invocation: true
---

# Changelog

Keep `CHANGELOG.md` in the project root up to date. The user runs this
before merging a branch, so the changelog lands in the same merge as the
work it describes.

## Find the project root and scope git to it

The project root is the folder holding `package.json` (and `CHANGELOG.md`).
The git repository root may be a parent folder that also holds unrelated
work, so run every git command from the project root and end it with `-- .`
to see only this project's commits. Leave out commits that only change
`CHANGELOG.md`.

```bash
git log --no-merges --date=short --format='%ad%x09%h%x09%s%n%b' -- .
```

Commit messages are often incomplete: an amended or squashed commit can hold
far more than its subject says. Check what each commit actually changed with
`git show --stat --format= <hash> -- .`, and base the bullets on the files,
using the message for the why.

## Decide what to add

**No `CHANGELOG.md` yet:** build it from the whole project history using the
command above. Group commits by date.

**`CHANGELOG.md` exists:** add only what isn't in it yet.

1. On a feature branch, the new work is the branch's commits that `main`
   doesn't have: `git log main..HEAD --no-merges --date=short ... -- .`
   Everything already on `main` went into the changelog when it was merged.
2. On `main` itself, use commits dated on or after the newest date heading,
   and skip any change that already has a bullet.
3. Also include uncommitted changes (`git status --short -- .` and
   `git diff HEAD --stat -- .`), since the user often runs this just before
   committing. Date these with today's date.

If there is nothing new, say so and leave the file unchanged.

## Write the entries

- Date each change by its commit date (`%ad`, `YYYY-MM-DD`), not today's
  date, except for uncommitted work.
- If a heading for that date already exists, add the bullets under it rather
  than making a second heading for the same date.
- Write for someone reading the project's history, not for git: describe
  what changed and why it matters, in plain past-tense sentences
  ("Added...", "Changed...", "Fixed..."). Commit subjects are a starting
  point; rewrite them when they are terse or unclear.
- One bullet per meaningful change. A big commit may need several bullets;
  several small commits for one change ("fix typo", "address review") become
  one bullet. Skip merge commits and pure housekeeping.
- When a change implements a roadmap phase or feature spec, name it and link
  the spec folder, e.g. ``Phase 1: Hello, clinic (`specs/2026-10-22-hello-clinic/`)``.
- Don't include commit hashes or author names.

## Format

Newest date first. Keep the intro line as is.

```markdown
# Changelog

All notable changes to AgentClinic, newest first.

## 2026-10-23

- Added the agents list at `/agents`, showing sample agents as cards that
  stack on phones (Phase 2, `specs/2026-10-23-agents-list/`).
- Fixed the footer overlapping content on short screens.

## 2026-10-22

- Added the project constitution: mission, tech stack, and roadmap in
  `specs/`.
```

## Finish

Show the user the new or changed entries. Don't commit; the user commits the
changelog with the rest of the branch before merging. Suggest a commit
message such as `Update CHANGELOG for <feature>`.
