import type { Db } from "./index.js";

export type Therapy = {
  id: number;
  name: string;
  description: string;
  // The ailments it treats or, for a recommendation, the agent's ailments it
  // is recommended for.
  ailments: string[];
};

type TherapyRow = Omit<Therapy, "ailments"> & { ailments: string };

// group_concat(DISTINCT ...) can only join with commas, and order isn't
// guaranteed, so split and sort here. Ailment names contain no commas.
function toTherapy(row: TherapyRow): Therapy {
  return { ...row, ailments: row.ailments.split(",").sort() };
}

export function listTherapies(db: Db): Therapy[] {
  const rows = db
    .prepare(
      `SELECT t.id, t.name, t.description, group_concat(DISTINCT a.name) AS ailments
       FROM therapies t
       JOIN therapy_ailments ta ON ta.therapy_id = t.id
       JOIN ailments a ON a.id = ta.ailment_id
       GROUP BY t.id
       ORDER BY t.id`,
    )
    .all() as TherapyRow[];
  return rows.map(toTherapy);
}

// Distinct therapies that treat any of the agent's reported ailments, each
// with the names of the agent's ailments it is recommended for.
export function recommendedTherapies(db: Db, agentId: number): Therapy[] {
  const rows = db
    .prepare(
      `SELECT t.id, t.name, t.description, group_concat(DISTINCT a.name) AS ailments
       FROM agent_ailments aa
       JOIN therapy_ailments ta ON ta.ailment_id = aa.ailment_id
       JOIN therapies t ON t.id = ta.therapy_id
       JOIN ailments a ON a.id = aa.ailment_id
       WHERE aa.agent_id = ?
       GROUP BY t.id
       ORDER BY t.id`,
    )
    .all(agentId) as TherapyRow[];
  return rows.map(toTherapy);
}
