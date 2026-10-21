import { mkdirSync } from "node:fs";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { openDb } from "./db/index.js";

const port = Number(process.env.PORT) || 3000;

mkdirSync("data", { recursive: true });
const app = createApp(openDb("data/agentclinic.db"));

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`AgentClinic listening on http://localhost:${info.port}`);
});
