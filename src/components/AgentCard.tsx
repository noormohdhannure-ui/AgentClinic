import type { Agent } from "../db/agents.js";

type AgentCardProps = {
  agent: Agent;
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <li class="card">
      <h2>
        <a href={`/agents/${agent.id}`}>{agent.name}</a>
      </h2>
      <p class="muted">{agent.role}</p>
      <p>Works for: {agent.human}</p>
    </li>
  );
}
