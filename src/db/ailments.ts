import type { Db } from "./index.js";

export type Ailment = {
  id: number;
  name: string;
  description: string;
};

export function listAilments(db: Db): Ailment[] {
  return db.prepare("SELECT id, name, description FROM ailments ORDER BY id").all() as Ailment[];
}
