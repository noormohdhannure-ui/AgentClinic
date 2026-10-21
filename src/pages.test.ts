import { beforeAll, describe, expect, it } from "vitest";
import { createTestApp, postForm } from "./test/helpers.js";

const { app } = createTestApp();
const XSS = "<script>alert(1)</script>";

type Page = { name: string; status: number; html: string; is404?: boolean };

// One of every page the MVP renders, including errors.
const pages: Page[] = [];

async function add(name: string, response: Response | Promise<Response>, is404 = false) {
  const res = await response;
  expect(res.headers.get("Content-Type"), name).toMatch(/^text\/html/);
  pages.push({ name, status: res.status, html: await res.text(), is404 });
}

beforeAll(async () => {
  const booking = await postForm(app, "/agents/1/appointments", {
    scheduled_at: "2026-11-03T10:00",
    reason: XSS,
  });

  for (const path of [
    "/",
    "/agents",
    "/agents/1",
    "/ailments",
    "/therapies",
    "/appointments",
    "/agents/1/appointments/new",
    booking.headers.get("Location")!,
  ]) {
    await add(path, app.request(path));
  }
  await add("404", app.request("/no-such-page"), true);
  await add("report 422", postForm(app, "/agents/1/ailments", { ailment_id: "", note: XSS }));
  await add(
    "booking 422",
    postForm(app, "/agents/1/appointments", { scheduled_at: "", reason: XSS }),
  );
});

describe("every page", () => {
  it("covers each page with the expected status", () => {
    expect(pages.map((page) => [page.name, page.status])).toEqual([
      ["/", 200],
      ["/agents", 200],
      ["/agents/1", 200],
      ["/ailments", 200],
      ["/therapies", 200],
      ["/appointments", 200],
      ["/agents/1/appointments/new", 200],
      [expect.stringMatching(/^\/appointments\/\d+$/), 200],
      ["404", 404],
      ["report 422", 422],
      ["booking 422", 422],
    ]);
  });

  it("starts with the doctype and uses the layout", () => {
    for (const { name, html } of pages) {
      expect(html, name).toMatch(/^<!doctype html><html lang="en">/);
      expect(html, name).toMatch(
        /<body><a class="skip-link" href="#main">Skip to content<\/a><header class="site-header">[\s\S]*<\/header><main id="main" class="site-main">[\s\S]*<\/main><footer class="site-footer">/,
      );
    }
  });

  it("has the main nav with all five sections", () => {
    for (const { name, html } of pages) {
      expect(html, name).toContain('<nav aria-label="Main">');
      for (const href of ["/", "/agents", "/ailments", "/therapies", "/appointments"]) {
        expect(html, `${name} ${href}`).toMatch(new RegExp(`<a href="${href}"[ >]`));
      }
    }
  });

  it("marks exactly one current section, or none on the 404 page", () => {
    for (const { name, html, is404 } of pages) {
      expect(html.match(/aria-current=/g) ?? [], name).toHaveLength(is404 ? 0 : 1);
    }
  });

  it("has a title in the pinned pattern, unique to the page", () => {
    const titles = pages.map(({ name, html }) => {
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      expect(title, name).toMatch(/^(AgentClinic|(Error: )?.+ – AgentClinic)$/);
      return title;
    });

    expect(new Set(titles).size).toBe(titles.length);
  });

  it("ships no client-side JavaScript, even with a script in user input", () => {
    for (const { name, html } of pages) {
      expect(html, name).not.toContain("<script");
    }
    expect(pages.filter(({ html }) => html.includes("&lt;script&gt;")).length).toBeGreaterThan(0);
  });
});
