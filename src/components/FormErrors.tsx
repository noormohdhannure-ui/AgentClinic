import type { FieldErrors } from "../routes/forms.js";

type FormErrorsProps = {
  errors: FieldErrors;
};

// The error summary at the top of a form page, linking to each field.
export function FormErrors({ errors }: FormErrorsProps) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div class="form-errors" aria-labelledby="form-errors-heading">
      <h2 id="form-errors-heading">There is a problem</h2>
      <ul>
        {entries.map(([field, message]) => (
          <li>
            <a href={`#${field}`}>{message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
