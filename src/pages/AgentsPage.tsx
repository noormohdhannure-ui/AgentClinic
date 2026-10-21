import { AgentCard } from "../components/AgentCard.js";
import { Layout } from "../components/Layout.js";
import type { Agent } from "../db/agents.js";

type AgentsPageProps = {
  agents: Agent[];
};

export function AgentsPage({ agents }: AgentsPageProps) {
  return (
    <Layout title="Agents – AgentClinic" current="agents">
      <h1>Agents</h1>
      <p>The agents in the clinic's care.</p>
      <ul class="card-grid">
        {agents.map((agent) => (
          <AgentCard agent={agent} />
        ))}
      </ul>
    </Layout>
  );
}
