import type { Db } from "./index.js";

export type Appointment = {
  id: number;
  agentId: number;
  agentName: string;
  scheduledAt: string;
  reason: string | null;
  status: "booked" | "cancelled";
};

const SELECT = `
  SELECT ap.id, ap.agent_id AS agentId, ag.name AS agentName,
         ap.scheduled_at AS scheduledAt, ap.reason, ap.status
  FROM appointments ap
  JOIN agents ag ON ag.id = ap.agent_id`;

type NewAppointment = {
  agentId: number;
  scheduledAt: string;
  reason: string | null;
  createdAt: string;
};

export function createAppointment(
  db: Db,
  { agentId, scheduledAt, reason, createdAt }: NewAppointment,
): number {
  const result = db
    .prepare(
      "INSERT INTO appointments (agent_id, scheduled_at, reason, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(agentId, scheduledAt, reason, createdAt);
  return Number(result.lastInsertRowid);
}

export function getAppointment(db: Db, id: number): Appointment | undefined {
  return db.prepare(`${SELECT} WHERE ap.id = ?`).get(id) as Appointment | undefined;
}

// Booked appointments later than now, soonest first. Times are server-local
// YYYY-MM-DDTHH:MM strings, so comparing them as strings orders them.
export function listUpcoming(db: Db, now: string): Appointment[] {
  return db
    .prepare(
      `${SELECT} WHERE ap.status = 'booked' AND ap.scheduled_at > ?
       ORDER BY ap.scheduled_at, ap.id`,
    )
    .all(now) as Appointment[];
}

export function cancelAppointment(
  db: Db,
  id: number,
): "cancelled" | "already-cancelled" | "not-found" {
  const result = db
    .prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ? AND status = 'booked'")
    .run(id);
  if (result.changes > 0) return "cancelled";
  return getAppointment(db, id) ? "already-cancelled" : "not-found";
}
