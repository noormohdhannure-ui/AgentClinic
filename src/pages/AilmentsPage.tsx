import { Layout } from "../components/Layout.js";
import type { Ailment } from "../db/ailments.js";

type AilmentsPageProps = {
  ailments: Ailment[];
};

export function AilmentsPage({ ailments }: AilmentsPageProps) {
  return (
    <Layout title="Ailments – AgentClinic" current="ailments">
      <div class="page-header">
        <h1>Ailments</h1>
        <p class="lead">The conditions agents most often bring to the clinic.</p>
      </div>
      <ul class="card-grid">
        {ailments.map((ailment) => (
          <li class="card">
            <h2>{ailment.name}</h2>
            <p class="muted">{ailment.description}</p>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
