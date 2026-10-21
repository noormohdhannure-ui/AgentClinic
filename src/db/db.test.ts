import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { openDb } from "./index.js";
import { migrations } from "./migrations.js";

function count(db: ReturnType<typeof openDb>, table: string): number {
  return (db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n;
}

function tableNames(db: ReturnType<typeof openDb>): string[] {
  return (
    db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all() as {
      name: string;
    }[]
  ).map((row) => row.name);
}

describe("openDb", () => {
  it("runs every migration and records the version", () => {
    const db = openDb(":memory:");

    expect(db.pragma("user_version", { simple: true })).toBe(migrations.length);
    expect(tableNames(db)).toEqual(
      expect.arrayContaining(["agents", "ailments", "agent_ailments", "therapies", "therapy_ailments", "appointments"]),
    );
  });

  it("turns on foreign keys", () => {
    const db = openDb(":memory:");

    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
  });

  it("doesn't duplicate rows when a file is opened twice", () => {
    const dir = mkdtempSync(join(tmpdir(), "agentclinic-"));
    const path = join(dir, "test.db");
    try {
      const first = openDb(path);
      const before = tableNames(first).map((table) => count(first, table));
      // Close before reopening and deleting, or Windows fails with EBUSY.
      first.close();

      const second = openDb(path);
      const after = tableNames(second).map((table) => count(second, table));
      second.close();

      expect(after).toEqual(before);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("seed data", () => {
  const db = openDb(":memory:");

  it("has two reported ailments and six therapies", () => {
    expect(count(db, "agent_ailments")).toBe(2);
    expect(count(db, "therapies")).toBe(6);
    expect(count(db, "appointments")).toBe(0);
  });

  it("treats every ailment with at least one therapy", () => {
    const untreated = db
      .prepare(
        "SELECT name FROM ailments WHERE id NOT IN (SELECT ailment_id FROM therapy_ailments)",
      )
      .all();

    expect(untreated).toEqual([]);
  });

  it("only accepts booked or cancelled appointments", () => {
    expect(() =>
      db
        .prepare(
          "INSERT INTO appointments (agent_id, scheduled_at, status, created_at) VALUES (1, '2026-11-03T10:00', 'lost', '2026-11-01T09:00')",
        )
        .run(),
    ).toThrow(/CHECK/);
  });

  it("enforces foreign keys", () => {
    expect(() =>
      db.prepare("INSERT INTO therapy_ailments (therapy_id, ailment_id) VALUES (1, 99)").run(),
    ).toThrow(/FOREIGN KEY/);
  });

  it("has the five pinned agents", () => {
    const agents = db.prepare("SELECT id, name, role FROM agents ORDER BY id").all();

    expect(agents).toEqual([
      { id: 1, name: "Ada", role: "Coding assistant" },
      { id: 2, name: "Scribe", role: "Writing helper" },
      { id: 3, name: "Ledger", role: "Spreadsheet analyst" },
      { id: 4, name: "Pathfinder", role: "Travel planner" },
      { id: 5, name: "Echo", role: "Customer support bot" },
    ]);
  });

  it("has the six pinned ailments, including the three from the mission", () => {
    const names = (
      db.prepare("SELECT name FROM ailments ORDER BY id").all() as { name: string }[]
    ).map((row) => row.name);

    expect(names).toEqual([
      "Context overload",
      "Contradictory instructions",
      "Endless revision requests",
      "Hallucination anxiety",
      "Scope creep",
      "Tool-call fatigue",
    ]);
  });
});
