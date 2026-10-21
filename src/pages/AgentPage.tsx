import { Layout } from "../components/Layout.js";
import type { Agent } from "../db/agents.js";

type AgentPageProps = {
  agent: Agent;
};

export function AgentPage({ agent }: AgentPageProps) {
  return (
    <Layout title={`${agent.name} – AgentClinic`} current="agents" currentIsPage={false}>
      <h1>{agent.name}</h1>
      <p class="muted">{agent.role}</p>
      <dl class="details">
        <dt>Works for</dt>
        <dd>{agent.human}</dd>
        <dt>About</dt>
        <dd>{agent.bio}</dd>
      </dl>
    </Layout>
  );
}
