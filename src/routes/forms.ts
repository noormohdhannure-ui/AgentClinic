import type { Context } from "hono";
import { z } from "zod";

// Each field's first error message, keyed by field name.
export type FieldErrors = Partial<Record<string, string>>;

// The raw values the user entered, for re-rendering a form with errors.
export type FormValues = Partial<Record<string, string>>;

export function firstErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const field = String(issue.path[0]);
    errors[field] ??= issue.message;
  }
  return errors;
}

// Hono caches the parsed body, so this is safe to call after a validator.
export async function formValues(c: Context): Promise<FormValues> {
  const body = await c.req.parseBody();
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, typeof value === "string" ? value : ""]),
  );
}

// Optional free text: trimmed, at most 500 characters, and null when blank.
export function optionalText(tooLong: string) {
  return z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? "")
    .pipe(z.string().max(500, { error: tooLong }))
    .transform((value) => value || null);
}
