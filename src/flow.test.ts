import { expect, it } from "vitest";
import { createTestApp, postForm } from "./test/helpers.js";

it("runs the whole care loop on a fresh database", async () => {
  const { app } = createTestApp();
  const page = async (path: string) => (await app.request(path)).text();

  // 1. Find an agent.
  expect(await page("/agents")).toContain('<a href="/agents/3">Ledger</a>');

  // 2. Ledger starts with no ailments and no recommendations.
  let ledger = await page("/agents/3");
  expect(ledger).toContain("No ailments reported.");
  expect(ledger).toContain("No recommendations yet.");

  // 3. Report Scope creep.
  const report = await postForm(app, "/agents/3/ailments", { ailment_id: "5" });
  expect(report.status).toBe(303);

  // 4. See the status message and the recommended therapies.
  ledger = await page(report.headers.get("Location")!);
  expect(ledger).toContain("Ailment reported.");
  expect(ledger).toContain("<strong>Scope creep</strong>");
  expect(ledger).toContain("<h3>Clarifying-questions session</h3>");
  expect(ledger).toContain("<h3>Boundary setting</h3>");

  // 5. Book an appointment.
  const booking = await postForm(app, "/agents/3/appointments", {
    scheduled_at: "2026-11-03T10:00",
    reason: "Talk through the growing task list",
  });
  expect(booking.status).toBe(303);
  const appointmentPath = booking.headers.get("Location")!;

  // 6. See it on the confirmation page and in the list.
  expect(await page(appointmentPath)).toContain("<h1>Appointment booked</h1>");
  let appointments = await page("/appointments");
  expect(appointments).toContain("Talk through the growing task list");
  expect(appointments).toContain('aria-label="Cancel appointment for Ledger on 3 Nov 2026, 10:00"');

  // 7. Cancel it.
  const cancel = await app.request(`${appointmentPath}/cancel`, { method: "POST" });
  expect(cancel.status).toBe(303);

  // 8. See the status message and the empty list.
  appointments = await page(cancel.headers.get("Location")!);
  expect(appointments).toContain("Appointment cancelled.");
  expect(appointments).toContain("No upcoming appointments.");
});
