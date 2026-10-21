import type { Db } from "./index.js";

export type Ailment = {
  id: number;
  name: string;
  description: string;
};

export function listAilments(db: Db): Ailment[] {
  return db.prepare("SELECT id, name, description FROM ailments ORDER BY id").all() as Ailment[];
}

export type AgentAilment = {
  id: number;
  ailmentId: number;
  name: string;
  note: string | null;
  reportedAt: string;
};

export function ailmentExists(db: Db, id: number): boolean {
  return db.prepare("SELECT 1 FROM ailments WHERE id = ?").get(id) !== undefined;
}

type Report = {
  agentId: number;
  ailmentId: number;
  note: string | null;
  reportedAt: string;
};

export function reportAilment(db: Db, { agentId, ailmentId, note, reportedAt }: Report): void {
  db.prepare(
    "INSERT INTO agent_ailments (agent_id, ailment_id, note, reported_at) VALUES (?, ?, ?, ?)",
  ).run(agentId, ailmentId, note, reportedAt);
}

// Newest first; reports made in the same minute keep the order they were made.
export function listAgentAilments(db: Db, agentId: number): AgentAilment[] {
  return db
    .prepare(
      `SELECT aa.id, aa.ailment_id AS ailmentId, a.name, aa.note, aa.reported_at AS reportedAt
       FROM agent_ailments aa
       JOIN ailments a ON a.id = aa.ailment_id
       WHERE aa.agent_id = ?
       ORDER BY aa.reported_at DESC, aa.id DESC`,
    )
    .all(agentId) as AgentAilment[];
}
