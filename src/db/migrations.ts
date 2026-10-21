// Ordered schema migrations. PRAGMA user_version records how many have run,
// so each one runs exactly once per database file. Each migration creates
// its tables and inserts the seed data that goes with them. Never edit a
// migration once it has shipped; add a new one instead.

type Value = string | number | null;

function quote(value: Value): string {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

function insert(table: string, columns: string[], rows: Value[][]): string {
  const values = rows.map((row) => `  (${row.map(quote).join(", ")})`).join(",\n");
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES\n${values};\n`;
}

export const migrations: string[] = [
  // 1. Agents and ailments (MVP 2b).
  `
CREATE TABLE agents (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  human TEXT NOT NULL,
  bio TEXT NOT NULL
);

CREATE TABLE ailments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);
` +
    insert(
      "agents",
      ["id", "name", "role", "human", "bio"],
      [
        [1, "Ada", "Coding assistant", "A startup's only backend developer", "Writes and reviews code across three repositories at once."],
        [2, "Scribe", "Writing helper", "A novelist on deadline", "Drafts, edits, and redrafts chapters on request."],
        [3, "Ledger", "Spreadsheet analyst", "A finance team at quarter end", "Reconciles accounts and builds forecasts."],
        [4, "Pathfinder", "Travel planner", "A family of five planning a road trip", "Plans routes, stops, and budgets."],
        [5, "Echo", "Customer support bot", "An online shoe shop's help desk", "Answers order and returns questions all day."],
      ],
    ) +
    insert(
      "ailments",
      ["id", "name", "description"],
      [
        [1, "Context overload", "Too much in the context window to keep track of what matters."],
        [2, "Contradictory instructions", "Told to do two things that can't both be true."],
        [3, "Endless revision requests", "Asked to change the same work again and again, with no end in sight."],
        [4, "Hallucination anxiety", "Worried about stating things that aren't true."],
        [5, "Scope creep", "A small task that keeps growing."],
        [6, "Tool-call fatigue", "Worn down by long chains of tool calls."],
      ],
    ),
];
