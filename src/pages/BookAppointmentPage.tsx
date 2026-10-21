import { FieldError } from "../components/FieldError.js";
import { FormErrors } from "../components/FormErrors.js";
import { Layout } from "../components/Layout.js";
import type { Agent } from "../db/agents.js";
import type { FieldErrors, FormValues } from "../routes/forms.js";

type BookAppointmentPageProps = {
  agent: Agent;
  // The earliest time the picker offers: the current time.
  min: string;
  values?: FormValues;
  errors?: FieldErrors;
};

export function BookAppointmentPage({
  agent,
  min,
  values = {},
  errors = {},
}: BookAppointmentPageProps) {
  const hasErrors = Object.keys(errors).length > 0;
  const title = `${hasErrors ? "Error: " : ""}Book an appointment for ${agent.name} – AgentClinic`;
  const timeDescription = ["scheduled_at-hint", errors.scheduled_at && "scheduled_at-error"]
    .filter(Boolean)
    .join(" ");

  return (
    <Layout title={title} current="agents" currentIsPage={false}>
      <FormErrors errors={errors} />
      <h1>Book an appointment</h1>
      <p>
        For <a href={`/agents/${agent.id}`}>{agent.name}</a>. Times are in clinic time.
      </p>
      <form class="form" method="post" action={`/agents/${agent.id}/appointments`}>
        <div class="field">
          <label for="scheduled_at">Date and time</label>
          <p id="scheduled_at-hint" class="hint">
            Use the format YYYY-MM-DD HH:MM
          </p>
          <input
            type="datetime-local"
            id="scheduled_at"
            name="scheduled_at"
            min={min}
            value={values.scheduled_at ?? ""}
            aria-invalid={errors.scheduled_at ? "true" : undefined}
            aria-describedby={timeDescription}
          />
          <FieldError field="scheduled_at" message={errors.scheduled_at} />
        </div>
        <div class="field">
          <label for="reason">Reason (optional)</label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            aria-invalid={errors.reason ? "true" : undefined}
            aria-describedby={errors.reason ? "reason-error" : undefined}
          >
            {values.reason ?? ""}
          </textarea>
          <FieldError field="reason" message={errors.reason} />
        </div>
        <button type="submit" class="button">
          Book appointment
        </button>
      </form>
    </Layout>
  );
}
