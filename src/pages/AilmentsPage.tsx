import { Layout } from "../components/Layout.js";
import type { Ailment } from "../db/ailments.js";

type AilmentsPageProps = {
  ailments: Ailment[];
};

export function AilmentsPage({ ailments }: AilmentsPageProps) {
  return (
    <Layout title="Ailments – AgentClinic" current="ailments">
      <h1>Ailments</h1>
      <p>The conditions agents most often bring to the clinic.</p>
      <ul class="card-grid">
        {ailments.map((ailment) => (
          <li class="card">
            <h2>{ailment.name}</h2>
            <p>{ailment.description}</p>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
