import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const raw = await readFile(new URL("../public/styles.css", import.meta.url), "utf8");
const css = stripComments(raw);

// Comments are stripped first, so a commented-out value can't be read as a
// real one.
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Every rule as its selector list and body, including rules inside media
// queries.
function allRules(source: string): [string[], string][] {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [
    m[1].split(",").map((s) => s.trim()),
    m[2],
  ]);
}

// The bodies of every rule whose selector list includes this selector.
function rules(selector: string): string[] {
  return allRules(css)
    .filter(([selectors]) => selectors.includes(selector))
    .map(([, body]) => body);
}

function rule(selector: string): string {
  const found = rules(selector);
  if (found.length === 0) throw new Error(`No rule for ${selector}`);
  return found.join("\n");
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

function rootTokens(source: string): Record<string, string> {
  const match = stripComments(source).match(/:root\s*\{([^}]*)\}/);
  if (!match) throw new Error("No :root rule");
  return tokens(match[1]);
}

const lightTokens = rootTokens(raw);
const darkTokens = {
  ...lightTokens,
  ...tokens(css.match(/prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/)![1]),
};

function color(scheme: Record<string, string>, name: string, seen: string[] = []): string {
  if (seen.includes(name)) throw new Error(`Circular token: ${[...seen, name].join(" -> ")}`);
  const value = scheme[name];
  if (value === undefined) throw new Error(`No token ${name}`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (ref) return color(scheme, ref[1], [...seen, name]);
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${name} is ${value}, not 6-digit hex`);
  return value;
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

describe("style test helpers", () => {
  it("ignore a commented-out token value", () => {
    const source = ":root { --x: #111111; /* was --x: #222222; */ }";

    expect(rootTokens(source)["--x"]).toBe("#111111");
  });

  it("ignore a comment with braces inside :root", () => {
    const source = ":root { /* Brand {orange} */ --x: #111111; }";

    expect(rootTokens(source)["--x"]).toBe("#111111");
  });

  it("fail clearly on a missing or non-hex token", () => {
    expect(() => color({}, "--missing")).toThrow("No token --missing");
    expect(() => color({ "--x": "#fff" }, "--x")).toThrow("not 6-digit hex");
    expect(() => color({ "--a": "var(--a)" }, "--a")).toThrow("Circular token");
  });
});

describe("brand colors", () => {
  it("defines orange and black brand tokens", () => {
    expect(lightTokens["--color-brand-orange"]).toBe("#f97316");
    expect(lightTokens["--color-brand-black"]).toBe("#0a0a0a");
  });

  it("uses black header and footer bars with an orange brand", () => {
    expect(lightTokens["--color-bar-bg"]).toBe("var(--color-brand-black)");
    expect(rule(".site-footer")).toContain("background: var(--color-bar-bg)");
    expect(rule(".site-header")).toContain("border-bottom-width: 4px");
    expect(rule(".brand")).toContain("color: var(--color-brand-orange)");
  });

  it("uses every color token in at least one rule", () => {
    const names = Object.keys(darkTokens).filter((name) => name.startsWith("--color-"));

    for (const name of names) {
      expect(css, name).toContain(`var(${name})`);
    }
  });
});

// Each pair is a foreground color, the background it is used on, and the
// minimum contrast: 4.5:1 for text, 3:1 for non-text such as focus rings.
const contrastPairs: [string, string, number][] = [
  ["--color-text", "--color-bg", 4.5],
  ["--color-brand-orange", "--color-bar-bg", 4.5],
  ["--color-bar-text", "--color-bar-bg", 4.5],
];

describe.each([
  ["light", lightTokens],
  ["dark", darkTokens],
])("contrast in the %s scheme", (_, scheme) => {
  it.each(contrastPairs)("%s on %s is at least %s:1", (foreground, background, minimum) => {
    const ratio = contrast(color(scheme, foreground), color(scheme, background));

    expect(ratio).toBeGreaterThanOrEqual(minimum);
  });
});
