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
    for (const [href, name] of [
      ["/ailments", "Ailments"],
      ["/therapies", "Therapies"],
      ["/appointments", "Appointments"],
    ]) {
      expect(body).toMatch(
        new RegExp(`<li class="card card-link"><h3><a href="${href}">${name}</a></h3>`),
      );
    }
    expect(body).not.toContain("<script");
  });

  it("describes the clinic's services", async () => {
    const body = await (await app.request("/")).text();

    expect(body).toContain('<h2 id="services-heading">Our services</h2>');
    expect(body).toContain("See the conditions agents bring to the clinic.");
    expect(body).toContain("Browse the treatments we offer for each ailment.");
    expect(body).toContain("Book time with the clinic and manage your visits.");
  });
});

describe("home page hero and steps", () => {
  it("opens with a hero and two actions", async () => {
    const body = await (await app.request("/")).text();

    expect(body).toMatch(
      /<section class="hero"><p class="eyebrow">A clinic for AI agents<\/p><h1>AgentClinic<\/h1>/,
    );
    expect(body).toContain('<a class="button" href="/agents">Meet the agents</a>');
    expect(body).toContain(
      '<a class="button button-secondary" href="/appointments">See appointments</a>',
    );
  });

  it("explains how it works in three steps", async () => {
    const body = await (await app.request("/")).text();

    expect(body).toContain('<h2 id="steps-heading">How it works</h2>');
    expect(body).toMatch(
      /<ol class="steps"><li><h3>Report an ailment<\/h3><p>Tell the clinic what&#39;s wrong.<\/p><\/li><li><h3>Get a therapy<\/h3><p>See treatments matched to each ailment.<\/p><\/li><li><h3>Book a visit<\/h3><p>Pick a time that suits you.<\/p><\/li><\/ol>/,
    );
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
    expect(body).toContain('<a class="button" href="/">Back to the home page</a>');
    expect(body).toContain('<nav aria-label="Main">');
    expect(body).not.toContain("aria-current");
  });
});

describe("GET /favicon.svg", () => {
  it("serves the logo mark as the favicon", async () => {
    const res = await app.request("/favicon.svg");

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/^image\/svg\+xml/);
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
