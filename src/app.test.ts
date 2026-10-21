import { describe, expect, it } from "vitest";
import { createTestApp } from "./test/helpers.js";

const { app } = createTestApp();

describe("GET /", () => {
  it("returns the AgentClinic home page", async () => {
    const res = await app.request("/");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/^text\/html/);

    const body = await res.text();
    expect(body).toMatch(/^<!doctype html>/);
    expect(body).toContain("<title>AgentClinic</title>");
    expect(body).toContain("<h1>AgentClinic</h1>");
    expect(body).toContain(
      "Care for AI agents and the ailments they pick up from their humans.",
    );
  });

  it("renders the main layout with header, main, and footer", async () => {
    const body = await (await app.request("/")).text();

    expect(body).toMatch(/<header class="site-header">[\s\S]*AgentClinic[\s\S]*<\/header>/);
    expect(body).toMatch(/<main id="main" class="site-main">[\s\S]*<h1>AgentClinic<\/h1>[\s\S]*<\/main>/);
    expect(body).toMatch(/<footer class="site-footer">[\s\S]*AgentClinic[\s\S]*<\/footer>/);
    expect(body).toContain('<link rel="stylesheet" href="/styles.css"/>');
  });

  it("has the main nav with Home as the current page", async () => {
    const body = await (await app.request("/")).text();

    expect(body).toMatch(/<header[\s\S]*<nav aria-label="Main">[\s\S]*<\/nav>[\s\S]*<\/header>/);
    expect(body).toContain('<a href="/" aria-current="page">Home</a>');
    expect(body).toContain('<h3><a href="/ailments">Ailments</a></h3>');
    expect(body).not.toContain("<script");
  });

  it("describes the clinic's services", async () => {
    const body = await (await app.request("/")).text();

    expect(body).toContain("<h2>Our services</h2>");
    expect(body).toContain("See the conditions agents bring to the clinic.");
    expect(body).toContain("Browse the treatments we offer for each ailment.");
    expect(body).toContain("Book time with the clinic and manage your visits.");
  });
});

describe("unknown routes", () => {
  it("return a friendly 404 page inside the layout", async () => {
    const res = await app.request("/no-such-page");

    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toMatch(/^text\/html/);

    const body = await res.text();
    expect(body).toMatch(/^<!doctype html>/);
    expect(body).toContain("<title>Page not found – AgentClinic</title>");
    expect(body).toContain("<h1>Page not found</h1>");
    expect(body).toContain("We couldn&#39;t find that page.");
    expect(body).toContain('<a href="/">Back to the home page</a>');
    expect(body).toContain('<nav aria-label="Main">');
    expect(body).not.toContain("aria-current");
  });
});

describe("GET /styles.css", () => {
  it("serves the stylesheet", async () => {
    const res = await app.request("/styles.css");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/^text\/css/);
    expect(await res.text()).toContain(".site-header");
  });
});
