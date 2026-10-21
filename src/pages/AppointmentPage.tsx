import { Layout } from "../components/Layout.js";
import type { Appointment } from "../db/appointments.js";
import { formatWhen } from "../time.js";

type AppointmentPageProps = {
  appointment: Appointment;
};

// The confirmation page after booking, and the page for one appointment.
export function AppointmentPage({ appointment }: AppointmentPageProps) {
  const when = formatWhen(appointment.scheduledAt);
  const booked = appointment.status === "booked";

  return (
    <Layout
      title={`Appointment for ${appointment.agentName} on ${when} – AgentClinic`}
      current="appointments"
      currentIsPage={false}
    >
      <div class="page-header">
        <h1>{booked ? "Appointment booked" : "Appointment cancelled"}</h1>
      </div>
      <div class="panel">
        <dl class="details">
          <dt>Agent</dt>
          <dd>
            <a class="back-link" href={`/agents/${appointment.agentId}`}>
              {appointment.agentName}
            </a>
          </dd>
          <dt>When</dt>
          <dd>
            <time datetime={appointment.scheduledAt}>{when}</time> (clinic time)
          </dd>
          <dt>Reason</dt>
          <dd>{appointment.reason ?? "None given"}</dd>
          <dt>Status</dt>
          <dd>
            <span class={booked ? "badge" : "badge badge-neutral"}>
              {booked ? "Booked" : "Cancelled"}
            </span>
          </dd>
        </dl>
      </div>
      <ul class="link-list">
        <li>
          <a class="button" href="/appointments">
            View all appointments
          </a>
        </li>
        <li>
          <a class="button button-secondary" href={`/agents/${appointment.agentId}`}>
            Back to {appointment.agentName}
          </a>
        </li>
      </ul>
    </Layout>
  );
}
