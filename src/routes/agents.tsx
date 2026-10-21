import { Hono } from "hono";
import { listAgents } from "../db/agents.js";
import type { Db } from "../db/index.js";
import { AgentPage } from "../pages/AgentPage.js";
import { AgentsPage } from "../pages/AgentsPage.js";
import { type AgentEnv, loadAgent } from "./loadAgent.js";
import { ID } from "./params.js";

export function agentRoutes(db: Db) {
  const agents = new Hono<AgentEnv>();

  agents.get("/", (c) => c.render(<AgentsPage agents={listAgents(db)} />));

  // "/:id/*" also matches "/:id" itself.
  agents.use(`/:id${ID}/*`, loadAgent(db));

  agents.get(`/:id${ID}`, (c) => c.render(<AgentPage agent={c.get("agent")} />));

  return agents;
}
