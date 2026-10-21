import { EmptyState } from "../components/EmptyState.js";
import { FieldError } from "../components/FieldError.js";
import { FormErrors } from "../components/FormErrors.js";
import { Layout } from "../components/Layout.js";
import { StatusMessage } from "../components/StatusMessage.js";
import type { Agent } from "../db/agents.js";
import type { AgentAilment, Ailment } from "../db/ailments.js";
import type { Therapy } from "../db/therapies.js";
import type { FieldErrors, FormValues } from "../routes/forms.js";
import { formatWhen } from "../time.js";

type AgentPageProps = {
  agent: Agent;
  ailments: Ailment[];
  reports: AgentAilment[];
  recommendations: Therapy[];
  reported?: boolean;
  values?: FormValues;
  errors?: FieldErrors;
};

export function AgentPage({
  agent,
  ailments,
  reports,
  recommendations,
  reported = false,
  values = {},
  errors = {},
}: AgentPageProps) {
  const hasErrors = Object.keys(errors).length > 0;
  const title = `${hasErrors ? "Error: " : ""}${agent.name} – AgentClinic`;

  return (
    <Layout title={title} current="agents" currentIsPage={false}>
      <FormErrors errors={errors} />
      <div class="profile">
        <span class="avatar avatar-lg" aria-hidden="true">
          {agent.name.charAt(0)}
        </span>
        <div>
          <h1>{agent.name}</h1>
          <p class="muted">{agent.role}</p>
        </div>
      </div>
      {reported && <StatusMessage message="Ailment reported." />}

      <div class="agent-layout">
        <div class="agent-main">
          <section class="panel" aria-labelledby="about-heading">
            <h2 id="about-heading">About</h2>
            <dl class="details">
              <dt>Works for</dt>
              <dd>{agent.human}</dd>
              <dt>About</dt>
              <dd>{agent.bio}</dd>
            </dl>
            <a class="button" href={`/agents/${agent.id}/appointments/new`}>
              Book an appointment
            </a>
          </section>

          <section class="panel" aria-labelledby="ailments-heading">
            <h2 id="ailments-heading">Ailments</h2>
            {reports.length === 0 ? (
              <EmptyState message="No ailments reported." />
            ) : (
              <ul class="report-list">
                {reports.map((report) => (
                  <li>
                    <strong>{report.name}</strong>{" "}
                    <span class="muted">
                      reported{" "}
                      <time datetime={report.reportedAt}>{formatWhen(report.reportedAt)}</time>
                    </span>
                    {report.note && <p>Note: {report.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section class="panel" aria-labelledby="recommended-heading">
            <h2 id="recommended-heading">Recommended therapies</h2>
            {recommendations.length === 0 ? (
              <EmptyState
                message="No recommendations yet. Report an ailment to see therapies that can help."
                action={{ href: "#report-ailment", label: "Report an ailment" }}
              />
            ) : (
              <ul class="card-grid">
                {recommendations.map((therapy) => (
                  <li class="card">
                    <h3>{therapy.name}</h3>
                    <p>{therapy.description}</p>
                    <p class="card-meta">For: {therapy.ailments.join(", ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside class="agent-side">
          <section class="panel" aria-labelledby="report-heading">
            <h2 id="report-heading">Report an ailment</h2>
            <form
              id="report-ailment"
              class="form"
              method="post"
              action={`/agents/${agent.id}/ailments`}
            >
              <div class="field">
                <label for="ailment_id">Ailment</label>
                <select
                  id="ailment_id"
                  name="ailment_id"
                  aria-invalid={errors.ailment_id ? "true" : undefined}
                  aria-describedby={errors.ailment_id ? "ailment_id-error" : undefined}
                >
                  <option value="">Choose an ailment</option>
                  {ailments.map((ailment) => (
                    <option
                      value={String(ailment.id)}
                      selected={values.ailment_id === String(ailment.id)}
                    >
                      {ailment.name}
                    </option>
                  ))}
                </select>
                <FieldError field="ailment_id" message={errors.ailment_id} />
              </div>
              <div class="field">
                <label for="note">Note (optional)</label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  aria-invalid={errors.note ? "true" : undefined}
                  aria-describedby={errors.note ? "note-error" : undefined}
                >
                  {values.note ?? ""}
                </textarea>
                <FieldError field="note" message={errors.note} />
              </div>
              <button type="submit" class="button">
                Report ailment
              </button>
            </form>
          </section>
        </aside>
      </div>
    </Layout>
  );
}
