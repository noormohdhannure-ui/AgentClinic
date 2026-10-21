import { describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers.js";

const { app } = createTestApp();

describe("GET /therapies", () => {
  it("lists every therapy with the ailments it treats", async () => {
    const res = await app.request("/therapies");

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<title>Therapies – AgentClinic</title>");
    expect(body).toContain('<a href="/therapies" aria-current="page">Therapies</a>');
    for (const [name, treats] of [
      ["Context compaction", "Context overload"],
      ["Clarifying-questions session", "Contradictory instructions, Scope creep"],
      ["Boundary setting", "Endless revision requests, Scope creep"],
      ["Source-checking routine", "Hallucination anxiety"],
      ["Rest between batches", "Tool-call fatigue"],
      ["Priority triage", "Context overload, Contradictory instructions"],
    ]) {
      expect(body).toContain(`<h2>${name}</h2>`);
      expect(body).toContain(`Treats: ${treats}`);
    }
  });
});
