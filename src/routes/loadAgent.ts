import type { MiddlewareHandler } from "hono";
import { type Agent, getAgent } from "../db/agents.js";
import type { Db } from "../db/index.js";

export type AgentEnv = { Variables: { agent: Agent } };

// Loads the agent named by :id before any validator runs, so a request for
// an unknown agent is a 404 even when its form body is invalid.
export function loadAgent(db: Db): MiddlewareHandler<AgentEnv> {
  return async (c, next) => {
    const agent = getAgent(db, Number(c.req.param("id")));
    if (!agent) return c.notFound();
    c.set("agent", agent);
    await next();
  };
}
