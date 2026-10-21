import { describe, expect, it } from "vitest";
import { createTestApp, postForm } from "../test/helpers.js";

const { app } = createTestApp();

describe("GET /agents", () => {
  it("lists every agent, each linking to its page", async () => {
    const res = await app.request("/agents");

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<title>Agents – AgentClinic</title>");
    for (const [id, name] of [
      [1, "Ada"],
      [2, "Scribe"],
      [3, "Ledger"],
      [4, "Pathfinder"],
      [5, "Echo"],
    ]) {
      expect(body).toContain(`<a href="/agents/${id}">${name}</a>`);
    }
    expect(body).toContain('<a href="/agents" aria-current="page">Agents</a>');
  });
});

describe("GET /agents/:id", () => {
  it("shows the agent's profile", async () => {
    const res = await app.request("/agents/1");

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<title>Ada – AgentClinic</title>");
    expect(body).toContain("<h1>Ada</h1>");
    expect(body).toContain("Coding assistant");
    expect(body).toContain("A startup&#39;s only backend developer");
    expect(body).toContain("Writes and reviews code across three repositories at once.");
    expect(body).toContain('<a href="/agents" aria-current="true">Agents</a>');
  });

  it.each(["0", "01", "abc", "1.5", "-1", "1e3", "999", "99999999999999999999"])(
    "returns the 404 page for /agents/%s",
    async (id) => {
      const res = await app.request(`/agents/${id}`);

      expect(res.status).toBe(404);
      expect(await res.text()).toContain("<h1>Page not found</h1>");
    },
  );

  it("shows the seeded reports with their notes", async () => {
    const ada = await (await app.request("/agents/1")).text();
    const scribe = await (await app.request("/agents/2")).text();

    expect(ada).toContain("<strong>Context overload</strong>");
    expect(ada).toContain("Note: Three repos open at once.");
    expect(ada).toContain('<time datetime="2026-10-20T09:00">20 Oct 2026, 09:00</time>');
    expect(scribe).toContain("<strong>Endless revision requests</strong>");
    expect(scribe).toContain("Note: Chapter one, draft 14.");
  });

  it("shows an empty state when the agent has no ailments", async () => {
    const body = await (await app.request("/agents/3")).text();

    expect(body).toContain("No ailments reported.");
  });

  it("has a labelled report form", async () => {
    const body = await (await app.request("/agents/1")).text();

    expect(body).toContain(
      '<form id="report-ailment" class="form" method="post" action="/agents/1/ailments">',
    );
    expect(body).toContain('<label for="ailment_id">Ailment</label>');
    expect(body).toContain('<option value="">Choose an ailment</option>');
    expect(body).toContain('<label for="note">Note (optional)</label>');
    expect(body).not.toContain("role=\"status\"");
  });
});

describe("recommended therapies", () => {
  it("recommends the therapies for the agent's ailments", async () => {
    const body = await (await app.request("/agents/1")).text();

    expect(body).toContain('<h2 id="recommended-heading">Recommended therapies</h2>');
    expect(body).toMatch(/<h3>Context compaction<\/h3>[\s\S]*?For: Context overload/);
    expect(body).toMatch(/<h3>Priority triage<\/h3>[\s\S]*?For: Context overload/);
    expect(body).not.toContain("<h3>Boundary setting</h3>");
  });

  it("shows an empty state linking to the report form when there are no ailments", async () => {
    const body = await (await app.request("/agents/3")).text();

    expect(body).toContain("No recommendations yet.");
    expect(body).toContain(
      '<a class="button button-secondary" href="#report-ailment">Report an ailment</a>',
    );
  });

  it("adds a new report's therapies without duplicates", async () => {
    const { app } = createTestApp();

    await postForm(app, "/agents/3/ailments", { ailment_id: "5" });
    await postForm(app, "/agents/3/ailments", { ailment_id: "5" });
    await postForm(app, "/agents/3/ailments", { ailment_id: "3" });

    const body = await (await app.request("/agents/3")).text();
    expect(body.match(/<h3>Clarifying-questions session<\/h3>/g)).toHaveLength(1);
    expect(body.match(/<h3>Boundary setting<\/h3>/g)).toHaveLength(1);
    expect(body).toMatch(
      /<h3>Boundary setting<\/h3>[\s\S]*?For: Endless revision requests, Scope creep/,
    );
    expect(body).not.toContain("No recommendations yet.");
  });
});

describe("POST /agents/:id/ailments", () => {
  it("records a report and redirects with a status message", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/3/ailments", { ailment_id: "5", note: "Huge" });

    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe("/agents/3?reported=1");

    const body = await (await app.request("/agents/3?reported=1")).text();
    expect(body).toContain('<p class="status-message" role="status">Ailment reported.</p>');
    expect(body).toContain("<strong>Scope creep</strong>");
    expect(body).toContain("Note: Huge");
    expect(body).toContain('<time datetime="2026-11-01T09:00">1 Nov 2026, 09:00</time>');
  });

  it("lists reports newest first, including the same ailment twice", async () => {
    let now = "2026-11-01T09:00";
    const { app } = createTestApp({ now: () => now });

    await postForm(app, "/agents/3/ailments", { ailment_id: "5", note: "first" });
    now = "2026-11-01T10:00";
    await postForm(app, "/agents/3/ailments", { ailment_id: "5", note: "second" });

    const body = await (await app.request("/agents/3")).text();
    expect(body.match(/<strong>Scope creep<\/strong>/g)).toHaveLength(2);
    expect(body.indexOf("Note: second")).toBeLessThan(body.indexOf("Note: first"));
  });

  it("stores a whitespace-only note as no note", async () => {
    const { app } = createTestApp();

    await postForm(app, "/agents/3/ailments", { ailment_id: "5", note: "   " });

    const body = await (await app.request("/agents/3")).text();
    expect(body).toContain("<strong>Scope creep</strong>");
    expect(body).not.toContain("Note:");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["not an integer", "1.5"],
    ["zero", "0"],
    ["unknown", "99"],
  ])("returns 422 when ailment_id is %s", async (_, ailmentId) => {
    const { app } = createTestApp();
    const fields: Record<string, string> = { note: "Kept note" };
    if (ailmentId !== undefined) fields.ailment_id = ailmentId;

    const res = await postForm(app, "/agents/1/ailments", fields);

    expect(res.status).toBe(422);
    const body = await res.text();
    expect(body).toContain('<p id="ailment_id-error" class="field-error">Choose an ailment.</p>');
    expect(body).toContain("Kept note</textarea>");
  });

  it("re-renders the form accessibly on a 422", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/1/ailments", {
      ailment_id: "3",
      note: "x".repeat(501),
    });

    expect(res.status).toBe(422);
    const body = await res.text();
    expect(body).toContain("<title>Error: Ada – AgentClinic</title>");
    expect(body).toContain('<h2 id="form-errors-heading">There is a problem</h2>');
    expect(body).toContain(
      '<a href="#note">Keep the note to 500 characters or fewer.</a>',
    );
    expect(body).toContain('aria-invalid="true" aria-describedby="note-error"');
    expect(body).toContain('<option value="3" selected="">Endless revision requests</option>');
  });

  it("links the summary to the ailment field", async () => {
    const { app } = createTestApp();

    const body = await (await postForm(app, "/agents/1/ailments", {})).text();

    expect(body).toContain('<a href="#ailment_id">Choose an ailment.</a>');
    expect(body).toMatch(
      /<select id="ailment_id" name="ailment_id" aria-invalid="true" aria-describedby="ailment_id-error">/,
    );
  });

  it("accepts a note of exactly 500 characters", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/1/ailments", {
      ailment_id: "2",
      note: ` ${"x".repeat(500)} `,
    });

    expect(res.status).toBe(303);
  });

  it("returns 404 for an unknown agent, even with an invalid body", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/999/ailments", {});

    expect(res.status).toBe(404);
  });

  it("escapes HTML in notes", async () => {
    const { app } = createTestApp();

    await postForm(app, "/agents/3/ailments", {
      ailment_id: "1",
      note: "<script>alert(1)</script>",
    });

    const body = await (await app.request("/agents/3")).text();
    expect(body).toContain("Note: &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(body).not.toContain("<script");
  });
});
