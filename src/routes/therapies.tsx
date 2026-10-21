import { Hono } from "hono";
import type { Db } from "../db/index.js";
import { listTherapies } from "../db/therapies.js";
import { TherapiesPage } from "../pages/TherapiesPage.js";

export function therapyRoutes(db: Db) {
  const therapies = new Hono();

  therapies.get("/", (c) => c.render(<TherapiesPage therapies={listTherapies(db)} />));

  return therapies;
}
