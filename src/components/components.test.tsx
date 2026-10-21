import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import * as AgentCardModule from "./AgentCard.js";
import * as EmptyStateModule from "./EmptyState.js";
import * as FieldErrorModule from "./FieldError.js";
import * as FormErrorsModule from "./FormErrors.js";
import * as FooterModule from "./Footer.js";
import * as HeaderModule from "./Header.js";
import * as LayoutModule from "./Layout.js";
import * as MainModule from "./Main.js";
import * as NavModule from "./Nav.js";
import * as StatusMessageModule from "./StatusMessage.js";

const { AgentCard } = AgentCardModule;
const { EmptyState } = EmptyStateModule;
const { FieldError } = FieldErrorModule;
const { FormErrors } = FormErrorsModule;
const { Footer } = FooterModule;
const { Header } = HeaderModule;
const { Layout } = LayoutModule;
const { Main } = MainModule;
const { Nav } = NavModule;
const { StatusMessage } = StatusMessageModule;

describe("Header", () => {
  it("renders the brand link to the home page", () => {
    const html = String(<Header />);

    expect(html).toMatch(/^<header class="site-header">/);
    expect(html).toContain('<a class="brand" href="/">AgentClinic</a>');
  });

  it("includes the main nav after the brand", () => {
    const html = String(<Header current="home" />);

    expect(html).toMatch(/<\/a><nav aria-label="Main">/);
    expect(html).toContain('aria-current="page"');
  });
});

describe("Nav", () => {
  it("renders the main nav with a link per section", () => {
    const html = String(<Nav />);

    expect(html).toMatch(/^<nav aria-label="Main"><ul class="nav-list">/);
    expect(html).toContain('<a href="/">Home</a>');
    expect(html).not.toContain("aria-current");
  });

  it("marks the current section's index page", () => {
    expect(String(<Nav current="home" />)).toContain(
      '<a href="/" aria-current="page">Home</a>',
    );
  });

  it("marks the section of a page under it", () => {
    expect(String(<Nav current="home" currentIsPage={false} />)).toContain(
      '<a href="/" aria-current="true">Home</a>',
    );
  });
});

describe("AgentCard", () => {
  it("renders a card linking to the agent's page", () => {
    const agent = { id: 3, name: "Ledger", role: "Spreadsheet analyst", human: "A finance team", bio: "" };
    const html = String(<AgentCard agent={agent} />);

    expect(html).toMatch(/^<li class="card">/);
    expect(html).toContain('<h2><a href="/agents/3">Ledger</a></h2>');
    expect(html).toContain('<p class="muted">Spreadsheet analyst</p>');
    expect(html).toContain("Works for: A finance team");
  });
});

describe("FormErrors", () => {
  it("renders nothing without errors", () => {
    expect(String(<FormErrors errors={{}} />)).toBe("");
  });

  it("summarizes each error as a link to its field", () => {
    const html = String(<FormErrors errors={{ scheduled_at: "Enter a date and time." }} />);

    expect(html).toContain('<h2 id="form-errors-heading">There is a problem</h2>');
    expect(html).toContain('<a href="#scheduled_at">Enter a date and time.</a>');
  });
});

describe("FieldError", () => {
  it("renders the message with the id aria-describedby points to", () => {
    expect(String(<FieldError field="note" message="Too long." />)).toBe(
      '<p id="note-error" class="field-error">Too long.</p>',
    );
  });

  it("renders nothing without a message", () => {
    expect(String(<FieldError field="note" />)).toBe("");
  });
});

describe("EmptyState", () => {
  it("shows the message and an optional next action", () => {
    const html = String(
      <EmptyState message="Nothing here." action={{ href: "/agents", label: "Go" }} />,
    );

    expect(html).toContain("<p>Nothing here.</p>");
    expect(html).toContain('<a href="/agents">Go</a>');
    expect(String(<EmptyState message="Nothing here." />)).not.toContain("<a");
  });
});

describe("StatusMessage", () => {
  it("renders a status region", () => {
    expect(String(<StatusMessage message="Done." />)).toBe(
      '<p class="status-message" role="status">Done.</p>',
    );
  });
});

describe("Main", () => {
  it("wraps its children in a main element", () => {
    const html = String(
      <Main>
        <p>Hello</p>
      </Main>,
    );

    expect(html).toBe('<main id="main" class="site-main"><p>Hello</p></main>');
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
      /<body><a[^>]*>[^<]*<\/a><header[\s\S]*<\/header><main[^>]*>content<\/main><footer[\s\S]*<\/footer><\/body>/,
    );
  });

  it("starts the body with a skip link to the main content", () => {
    const html = String(<Layout title="Test page">content</Layout>);

    expect(html).toContain(
      '<body><a class="skip-link" href="#main">Skip to content</a><header',
    );
    expect(html).toContain('<main id="main" class="site-main">');
  });
});

describe("component files", () => {
  it.each([
    ["Header", HeaderModule],
    ["Main", MainModule],
    ["Footer", FooterModule],
    ["Layout", LayoutModule],
    ["Nav", NavModule],
    ["AgentCard", AgentCardModule],
    ["EmptyState", EmptyStateModule],
    ["FieldError", FieldErrorModule],
    ["FormErrors", FormErrorsModule],
    ["StatusMessage", StatusMessageModule],
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
