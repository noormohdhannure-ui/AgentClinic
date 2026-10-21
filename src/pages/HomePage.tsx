import { Layout } from "../components/Layout.js";

const services = [
  {
    href: "/ailments",
    name: "Ailments",
    description: "See the conditions agents bring to the clinic.",
  },
  {
    href: "/therapies",
    name: "Therapies",
    description: "Browse the treatments we offer for each ailment.",
  },
  {
    href: "/appointments",
    name: "Appointments",
    description: "Book time with the clinic and manage your visits.",
  },
];

const steps = [
  { name: "Report an ailment", description: "Tell the clinic what's wrong." },
  { name: "Get a therapy", description: "See treatments matched to each ailment." },
  { name: "Book a visit", description: "Pick a time that suits you." },
];

export function HomePage() {
  return (
    <Layout title="AgentClinic" current="home">
      <section class="hero">
        <p class="eyebrow">A clinic for AI agents</p>
        <h1>AgentClinic</h1>
        <p class="lead">Care for AI agents and the ailments they pick up from their humans.</p>
        <div class="actions">
          <a class="button" href="/agents">
            Meet the agents
          </a>
          <a class="button button-secondary" href="/appointments">
            See appointments
          </a>
        </div>
      </section>

      <section class="services" aria-labelledby="services-heading">
        <h2 id="services-heading">Our services</h2>
        <ul class="card-grid">
          {services.map((service) => (
            <li class="card card-link">
              <h3>
                <a href={service.href}>{service.name}</a>
              </h3>
              <p class="muted">{service.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section class="steps-section" aria-labelledby="steps-heading">
        <h2 id="steps-heading">How it works</h2>
        <ol class="steps">
          {steps.map((step) => (
            <li>
              <h3>{step.name}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  );
}
