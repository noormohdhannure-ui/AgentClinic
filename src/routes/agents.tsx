import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { z } from "zod";
import { type Agent, listAgents } from "../db/agents.js";
import { ailmentExists, listAgentAilments, listAilments, reportAilment } from "../db/ailments.js";
import type { Db } from "../db/index.js";
import { recommendedTherapies } from "../db/therapies.js";
import { AgentPage } from "../pages/AgentPage.js";
import { AgentsPage } from "../pages/AgentsPage.js";
import {
  type FieldErrors,
  type FormValues,
  firstErrors,
  formValues,
  optionalText,
} from "./forms.js";
import { type AgentEnv, currentAgent, loadAgent } from "./loadAgent.js";
import { ID } from "./params.js";

const CHOOSE_AILMENT = "Choose an ailment.";

const reportSchema = z.object({
  ailment_id: z.coerce
    .number({ error: CHOOSE_AILMENT })
    .int({ error: CHOOSE_AILMENT })
    .positive({ error: CHOOSE_AILMENT })
    .max(999_999_999, { error: CHOOSE_AILMENT }),
  note: optionalText("Keep the note to 500 characters or fewer."),
});

type AgentPageState = {
  status?: 200 | 422;
  reported?: boolean;
  values?: FormValues;
  errors?: FieldErrors;
};

export function agentRoutes(db: Db, now: () => string) {
  const agents = new Hono<AgentEnv>();

  function renderAgentPage(c: Context, agent: Agent, state: AgentPageState = {}) {
    c.status(state.status ?? 200);
    return c.render(
      <AgentPage
        agent={agent}
        ailments={listAilments(db)}
        reports={listAgentAilments(db, agent.id)}
        recommendations={recommendedTherapies(db, agent.id)}
        reported={state.reported}
        values={state.values}
        errors={state.errors}
      />,
    );
  }

  agents.get("/", (c) => c.render(<AgentsPage agents={listAgents(db)} />));

  // "/:id/*" also matches "/:id" itself.
  agents.use(`/:id${ID}/*`, loadAgent(db));

  agents.get(`/:id${ID}`, (c) =>
    renderAgentPage(c, c.get("agent"), { reported: c.req.query("reported") === "1" }),
  );

  agents.post(
    `/:id${ID}/ailments`,
    zValidator("form", reportSchema, async (result, c) => {
      if (!result.success) {
        return renderAgentPage(c, currentAgent(c), {
          status: 422,
          values: await formValues(c),
          errors: firstErrors(result.error.issues),
        });
      }
    }),
    async (c) => {
      const agent = c.get("agent");
      const { ailment_id, note } = c.req.valid("form");

      // Checked here because the schema can't see the database. Without it,
      // an unknown id would fail the foreign key and become a 500.
      if (!ailmentExists(db, ailment_id)) {
        return renderAgentPage(c, agent, {
          status: 422,
          values: await formValues(c),
          errors: { ailment_id: CHOOSE_AILMENT },
        });
      }

      reportAilment(db, { agentId: agent.id, ailmentId: ailment_id, note, reportedAt: now() });
      return c.redirect(`/agents/${agent.id}?reported=1`, 303);
    },
  );

  return agents;
}
