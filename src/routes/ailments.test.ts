import { describe, expect, it } from "vitest";
import { createTestApp } from "../test/helpers.js";

const { app } = createTestApp();

describe("GET /ailments", () => {
  it("lists every ailment with its description", async () => {
    const res = await app.request("/ailments");

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<title>Ailments – AgentClinic</title>");
    expect(body).toContain('<a href="/ailments" aria-current="page">Ailments</a>');
    for (const [name, description] of [
      ["Context overload", "Too much in the context window to keep track of what matters."],
      ["Contradictory instructions", "Told to do two things that can&#39;t both be true."],
      [
        "Endless revision requests",
        "Asked to change the same work again and again, with no end in sight.",
      ],
      ["Hallucination anxiety", "Worried about stating things that aren&#39;t true."],
      ["Scope creep", "A small task that keeps growing."],
      ["Tool-call fatigue", "Worn down by long chains of tool calls."],
    ]) {
      expect(body).toContain(`<h2>${name}</h2>`);
      expect(body).toContain(description);
    }
  });
});
