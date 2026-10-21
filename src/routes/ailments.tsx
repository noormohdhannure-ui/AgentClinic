import { Hono } from "hono";
import { listAilments } from "../db/ailments.js";
import type { Db } from "../db/index.js";
import { AilmentsPage } from "../pages/AilmentsPage.js";

export function ailmentRoutes(db: Db) {
  const ailments = new Hono();

  ailments.get("/", (c) => c.render(<AilmentsPage ailments={listAilments(db)} />));

  return ailments;
}
