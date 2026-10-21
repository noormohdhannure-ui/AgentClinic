import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import * as FooterModule from "./Footer.js";
import * as HeaderModule from "./Header.js";
import * as LayoutModule from "./Layout.js";
import * as MainModule from "./Main.js";

const { Footer } = FooterModule;
const { Header } = HeaderModule;
const { Layout } = LayoutModule;
const { Main } = MainModule;

describe("Header", () => {
  it("renders the brand link to the home page", () => {
    const html = String(<Header />);

    expect(html).toMatch(/^<header class="site-header">/);
    expect(html).toContain('<a class="brand" href="/">AgentClinic</a>');
  });
});

describe("Main", () => {
  it("wraps its children in a main element", () => {
    const html = String(
      <Main>
        <p>Hello</p>
      </Main>,
    );

    expect(html).toBe('<main class="site-main"><p>Hello</p></main>');
  });
});

describe("Footer", () => {
  it("shows the copyright line for the current year", () => {
    const html = String(<Footer />);

    expect(html).toMatch(/^<footer class="site-footer">/);
    expect(html).toContain(`© ${new Date().getFullYear()} AgentClinic`);
  });
});

describe("Layout", () => {
  it("renders the document head, stylesheet link, and title", () => {
    const html = String(<Layout title="Test page">content</Layout>);

    expect(html).toMatch(/^<html lang="en">/);
    expect(html).toContain('<meta charset="utf-8"/>');
    expect(html).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
    );
    expect(html).toContain("<title>Test page</title>");
    expect(html).toContain('<link rel="stylesheet" href="/styles.css"/>');
  });

  it("composes header, main, and footer in order", () => {
    const html = String(<Layout title="Test page">content</Layout>);

    expect(html).toMatch(
      /<body><header[\s\S]*<\/header><main[^>]*>content<\/main><footer[\s\S]*<\/footer><\/body>/,
    );
  });
});

describe("component files", () => {
  it.each([
    ["Header", HeaderModule],
    ["Main", MainModule],
    ["Footer", FooterModule],
    ["Layout", LayoutModule],
  ])("%s.tsx exports only its component", (name, module) => {
    expect(Object.keys(module)).toEqual([name]);
  });

  it("Layout imports Header, Main, and Footer from their own files", async () => {
    const source = await readFile(new URL("./Layout.tsx", import.meta.url), "utf8");

    for (const name of ["Header", "Main", "Footer"]) {
      expect(source).toContain(`import { ${name} } from "./${name}.js";`);
      expect(source).not.toMatch(new RegExp(`function ${name}\\b`));
    }
  });
});
