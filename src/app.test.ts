import { describe, expect, it } from "vitest";
import { app } from "./app.js";

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

  it("has only the skip and brand links and no client-side JavaScript", async () => {
    const body = await (await app.request("/")).text();

    expect(body.match(/<a\b[^>]*>/g)).toEqual([
      '<a class="skip-link" href="#main">',
      '<a class="brand" href="/">',
    ]);
    expect(body).not.toContain("<script");
    expect(body).not.toContain("<nav");
  });
});

describe("unknown routes", () => {
  it("return 404", async () => {
    const res = await app.request("/agents");

    expect(res.status).toBe(404);
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
