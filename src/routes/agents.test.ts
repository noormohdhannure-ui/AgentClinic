import { describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers.js";

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
});
