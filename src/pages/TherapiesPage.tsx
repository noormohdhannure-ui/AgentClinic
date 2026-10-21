import { Layout } from "../components/Layout.js";
import type { Therapy } from "../db/therapies.js";

type TherapiesPageProps = {
  therapies: Therapy[];
};

export function TherapiesPage({ therapies }: TherapiesPageProps) {
  return (
    <Layout title="Therapies – AgentClinic" current="therapies">
      <div class="page-header">
        <h1>Therapies</h1>
        <p class="lead">The treatments the clinic offers, and the ailments each one treats.</p>
      </div>
      <ul class="card-grid">
        {therapies.map((therapy) => (
          <li class="card">
            <h2>{therapy.name}</h2>
            <p>{therapy.description}</p>
            <p class="card-meta">Treats: {therapy.ailments.join(", ")}</p>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
