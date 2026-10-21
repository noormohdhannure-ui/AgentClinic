import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const css = await readFile(new URL("../public/styles.css", import.meta.url), "utf8");

function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(?:^|[\\s,}])${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`No rule for ${selector}`);
  return match[1];
}

describe("responsive stylesheet", () => {
  it("is mobile-first, using only min-width media queries", () => {
    const widthQueries = css.match(/@media[^{]*width[^{]*/g) ?? [];

    expect(widthQueries.length).toBeGreaterThan(0);
    for (const query of widthQueries) {
      expect(query).toMatch(/\(min-width: [\d.]+rem\)/);
      expect(query).not.toContain("max-width");
    }
  });

  it("uses only the standard breakpoints", () => {
    const breakpoints = [...css.matchAll(/min-width: ([\d.]+rem)/g)].map((m) => m[1]);

    expect(new Set(breakpoints)).toEqual(new Set(["40rem", "64rem"]));
  });

  it("has no fixed pixel widths", () => {
    expect(css).not.toMatch(/(?:^|[\s;{])(?:min-|max-)?width:\s*\d+px/);
  });

  it("caps content width and keeps a side gutter", () => {
    const main = rule(".site-main");

    expect(main).toContain("max-width: var(--content-width)");
    expect(main).toContain("var(--gutter)");
  });

  it("keeps media inside its container", () => {
    expect(rule("video")).toContain("max-width: 100%");
  });

  it("lets long words wrap instead of overflowing", () => {
    expect(rule("body")).toContain("overflow-wrap: break-word");
  });

  it("gives the brand link a touch-sized target", () => {
    expect(css).toContain("--touch-target: 2.75rem");
    expect(rule(".brand")).toContain("min-height: var(--touch-target)");
  });

  it("scales the heading fluidly", () => {
    expect(rule("h1")).toMatch(/font-size: clamp\(/);
  });
});
