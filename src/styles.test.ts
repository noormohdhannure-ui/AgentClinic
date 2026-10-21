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

describe("accessibility base", () => {
  it("declares both color schemes", () => {
    expect(rule(":root")).toContain("color-scheme: light dark");
  });

  it("underlines links in the accent color, visited or not", () => {
    expect(rule("a:visited")).toBe(rule("a"));
    expect(rule("a")).toContain("color: var(--color-accent)");
    expect(rule("a")).toContain("text-decoration: underline");
  });

  it("gives header and footer links bar colors, visited or not", () => {
    for (const selector of [
      ".site-header a:not(.brand)",
      ".site-header a:not(.brand):visited",
      ".site-footer a",
      ".site-footer a:visited",
    ]) {
      expect(rule(selector), selector).toContain("color: var(--color-bar-text)");
    }
    expect(rule(".brand:visited")).toContain("color: var(--color-brand-orange)");
  });

  it("draws a visible focus ring", () => {
    expect(rule(":focus-visible")).toContain("outline: 3px solid var(--color-focus)");
    expect(rule(":focus-visible")).toContain("outline-offset: 2px");
    expect(rule(".site-header")).toContain("--color-focus: var(--color-brand-orange)");
  });

  it("lines the header and footer up with the main content", () => {
    expect(rule(".site-footer")).toContain(
      "max(var(--gutter), (100% - var(--content-width)) / 2 + var(--gutter))",
    );
  });

  it("marks the current nav link by underline as well as color", () => {
    const current = rule(".nav-list a[aria-current]");

    expect(current).toContain("color: var(--color-brand-orange)");
    expect(current).toContain("text-decoration: underline");
    expect(rule(".nav-list a")).toContain("min-height: var(--touch-target)");
  });

  it("keeps the skip link out of the body grid", () => {
    expect(rule(".skip-link")).toContain("position: absolute");
    expect(rule(".skip-link")).toContain("min-height: var(--touch-target)");
    expect(rule(".skip-link:focus")).toContain("transform: none");
  });
});

// Tokens set on the header and footer bars override the page's.
const barTokens = tokens(rule(".site-header"));

// Each pair is a foreground color, the background it is used on, the minimum
// contrast (4.5:1 for text, 3:1 for non-text such as focus rings), and
// whether it sits on the page or on the black bars.
const contrastPairs: [string, string, number, "page" | "bar"][] = [
  ["--color-text", "--color-bg", 4.5, "page"],
  // Links and visited links share the accent color.
  ["--color-accent", "--color-bg", 4.5, "page"],
  ["--color-focus", "--color-bg", 3, "page"],
  ["--color-brand-orange", "--color-bar-bg", 4.5, "bar"],
  ["--color-bar-text", "--color-bar-bg", 4.5, "bar"],
  ["--color-focus", "--color-bar-bg", 3, "bar"],
  // The skip link: bright orange text on a black background.
  ["--color-brand-orange", "--color-bar-bg", 4.5, "page"],
];

describe.each([
  ["light", lightTokens],
  ["dark", darkTokens],
])("contrast in the %s scheme", (_, scheme) => {
  it.each(contrastPairs)(
    "%s on %s is at least %s:1 (%s)",
    (foreground, background, minimum, where) => {
      const tokens = where === "bar" ? { ...scheme, ...barTokens } : scheme;
      const ratio = contrast(color(tokens, foreground), color(tokens, background));

      expect(ratio).toBeGreaterThanOrEqual(minimum);
    },
  );
});
