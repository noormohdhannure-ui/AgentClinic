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
      <div class="page-header">
        <h1>Appointments</h1>
        <p class="lead">Upcoming appointments, soonest first. Times are in clinic time.</p>
      </div>
      {cancelled && <StatusMessage message="Appointment cancelled." />}
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
                <div class="card-head">
                  <span class="avatar" aria-hidden="true">
                    {appointment.agentName.charAt(0)}
                  </span>
                  <div>
                    <h2>
                      <a href={`/agents/${appointment.agentId}`}>{appointment.agentName}</a>
                    </h2>
                    <p class="card-meta">
                      <time datetime={appointment.scheduledAt}>{when}</time>
                    </p>
                  </div>
                </div>
                {appointment.reason && <p>{appointment.reason}</p>}
                <div class="card-actions">
                  <a class="back-link card-action" href={`/appointments/${appointment.id}`}>
                    Details
                  </a>
                  <form method="post" action={`/appointments/${appointment.id}/cancel`}>
                    <button
                      type="submit"
                      class="button button-secondary"
                      aria-label={`Cancel appointment for ${appointment.agentName} on ${when}`}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}
