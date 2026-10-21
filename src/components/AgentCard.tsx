import type { Agent } from "../db/agents.js";

type AgentCardProps = {
  agent: Agent;
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <li class="card card-link">
      <div class="card-head">
        <span class="avatar" aria-hidden="true">
          {agent.name.charAt(0)}
        </span>
        <div>
          <h2>
            <a href={`/agents/${agent.id}`}>{agent.name}</a>
          </h2>
          <p class="muted">{agent.role}</p>
        </div>
      </div>
      <p class="card-meta">Works for: {agent.human}</p>
    </li>
  );
}
