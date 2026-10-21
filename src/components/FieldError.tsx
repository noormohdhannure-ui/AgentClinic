type FieldErrorProps = {
  field: string;
  message?: string;
};

// The inline error under a field. Its id is what the field's
// aria-describedby points to.
export function FieldError({ field, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p id={`${field}-error`} class="field-error">
      {message}
    </p>
  );
}
