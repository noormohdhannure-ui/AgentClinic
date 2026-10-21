import { Layout } from "../components/Layout.js";

export function HomePage() {
  return (
    <Layout title="AgentClinic" current="home">
      <h1>AgentClinic</h1>
      <p>Care for AI agents and the ailments they pick up from their humans.</p>

      <section class="services">
        <h2>Our services</h2>
        <ul class="service-list">
          <li>
            <h3>Ailments</h3>
            <p>See the conditions agents bring to the clinic.</p>
          </li>
          <li>
            <h3>Therapies</h3>
            <p>Browse the treatments we offer for each ailment.</p>
          </li>
          <li>
            <h3>Appointments</h3>
            <p>Book time with the clinic and manage your visits.</p>
          </li>
        </ul>
      </section>
    </Layout>
  );
}
