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

function tokens(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
}

const lightTokens = tokens(css.match(/:root\s*\{([^}]*)\}/)![1]);
const darkTokens = {
  ...lightTokens,
  ...tokens(css.match(/prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/)![1]),
};

function color(scheme: Record<string, string>, name: string): string {
  const value = scheme[name];
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  return ref ? color(scheme, ref[1]) : value;
}

function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = hex
      .slice(1)
      .match(/../g)!
      .map((h) => parseInt(h, 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

describe("brand colors", () => {
  it("defines orange and black brand tokens", () => {
    expect(lightTokens["--color-brand-orange"]).toBe("#f97316");
    expect(lightTokens["--color-brand-black"]).toBe("#0a0a0a");
  });

  it("uses black header and footer bars with an orange brand", () => {
    expect(lightTokens["--color-bar-bg"]).toBe("var(--color-brand-black)");
    expect(css).toMatch(/\.site-footer\s*\{[^}]*background: var\(--color-bar-bg\)/);
    expect(rule(".site-header")).toContain("border-bottom-width: 4px");
    expect(rule(".brand")).toContain("color: var(--color-brand-orange)");
  });

  it.each([
    ["light", lightTokens],
    ["dark", darkTokens],
  ])("keeps text contrast at least 4.5:1 in the %s scheme", (_, scheme) => {
    const pairs = [
      ["--color-text", "--color-bg"],
      ["--color-text", "--color-surface"],
      ["--color-muted", "--color-bg"],
      ["--color-accent", "--color-bg"],
      ["--color-brand-orange", "--color-bar-bg"],
      ["--color-bar-text", "--color-bar-bg"],
    ];

    for (const [text, background] of pairs) {
      const ratio = contrast(color(scheme, text), color(scheme, background));
      expect(ratio, `${text} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
