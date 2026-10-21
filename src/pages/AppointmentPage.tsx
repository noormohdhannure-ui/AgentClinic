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
      <h1>{booked ? "Appointment booked" : "Appointment cancelled"}</h1>
      <dl class="details">
        <dt>Agent</dt>
        <dd>
          <a href={`/agents/${appointment.agentId}`}>{appointment.agentName}</a>
        </dd>
        <dt>When</dt>
        <dd>
          <time datetime={appointment.scheduledAt}>{when}</time> (clinic time)
        </dd>
        <dt>Reason</dt>
        <dd>{appointment.reason ?? "None given"}</dd>
        <dt>Status</dt>
        <dd>{booked ? "Booked" : "Cancelled"}</dd>
      </dl>
      <ul class="link-list">
        <li>
          <a href="/appointments">View all appointments</a>
        </li>
        <li>
          <a href={`/agents/${appointment.agentId}`}>Back to {appointment.agentName}</a>
        </li>
      </ul>
    </Layout>
  );
}
