import { EmptyState } from "../components/EmptyState.js";
import { Layout } from "../components/Layout.js";
import { StatusMessage } from "../components/StatusMessage.js";
import type { Appointment } from "../db/appointments.js";
import { formatWhen } from "../time.js";

type AppointmentsPageProps = {
  appointments: Appointment[];
  cancelled?: boolean;
};

export function AppointmentsPage({ appointments, cancelled = false }: AppointmentsPageProps) {
  return (
    <Layout title="Appointments – AgentClinic" current="appointments">
      <h1>Appointments</h1>
      {cancelled && <StatusMessage message="Appointment cancelled." />}
      <p class="muted">Upcoming appointments, soonest first. Times are in clinic time.</p>
      {appointments.length === 0 ? (
        <EmptyState
          message="No upcoming appointments."
          action={{ href: "/agents", label: "Choose an agent to book" }}
        />
      ) : (
        <ul class="card-grid">
          {appointments.map((appointment) => {
            const when = formatWhen(appointment.scheduledAt);
            return (
              <li class="card">
                <h2>
                  <a href={`/agents/${appointment.agentId}`}>{appointment.agentName}</a>
                </h2>
                <p>
                  <time datetime={appointment.scheduledAt}>{when}</time>
                </p>
                {appointment.reason && <p>{appointment.reason}</p>}
                <p>
                  <a href={`/appointments/${appointment.id}`}>Details</a>
                </p>
                <form method="post" action={`/appointments/${appointment.id}/cancel`}>
                  <button
                    type="submit"
                    class="button"
                    aria-label={`Cancel appointment for ${appointment.agentName} on ${when}`}
                  >
                    Cancel
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}
