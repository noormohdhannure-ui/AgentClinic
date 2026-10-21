import type { Db } from "./index.js";

export type Agent = {
  id: number;
  name: string;
  role: string;
  human: string;
  bio: string;
};

export function listAgents(db: Db): Agent[] {
  return db.prepare("SELECT id, name, role, human, bio FROM agents ORDER BY id").all() as Agent[];
}

export function getAgent(db: Db, id: number): Agent | undefined {
  return db.prepare("SELECT id, name, role, human, bio FROM agents WHERE id = ?").get(id) as
    | Agent
    | undefined;
}
