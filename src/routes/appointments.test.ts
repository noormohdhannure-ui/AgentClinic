import { describe, expect, it } from "vitest";
import { createTestApp, postForm, TEST_NOW } from "../test/helpers.js";

// TEST_NOW is 2026-11-01T09:00.

async function book(
  app: ReturnType<typeof createTestApp>["app"],
  agentId: number,
  scheduledAt: string,
  reason = "",
) {
  const res = await postForm(app, `/agents/${agentId}/appointments`, {
    scheduled_at: scheduledAt,
    reason,
  });
  return res.headers.get("Location");
}

describe("GET /agents/:id/appointments/new", () => {
  it("shows a labelled booking form", async () => {
    const { app } = createTestApp();

    const res = await app.request("/agents/1/appointments/new");

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<title>Book an appointment for Ada – AgentClinic</title>");
    expect(body).toContain('<a href="/agents" aria-current="true">Agents</a>');
    expect(body).toContain('<label for="scheduled_at">Date and time</label>');
    expect(body).toContain(
      '<input type="datetime-local" id="scheduled_at" name="scheduled_at" min="2026-11-01T09:01" value="" aria-describedby="scheduled_at-hint"/>',
    );
    expect(body).toContain(
      '<p id="scheduled_at-hint" class="hint">Use the format YYYY-MM-DD HH:MM</p>',
    );
    expect(body).toContain('<label for="reason">Reason (optional)</label>');
  });

  it("is linked from the agent page", async () => {
    const { app } = createTestApp();

    const body = await (await app.request("/agents/1")).text();

    expect(body).toContain('href="/agents/1/appointments/new"');
  });

  it("returns 404 for an unknown agent", async () => {
    const { app } = createTestApp();

    expect((await app.request("/agents/999/appointments/new")).status).toBe(404);
  });
});

describe("POST /agents/:id/appointments", () => {
  it("books and redirects to the confirmation page", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/1/appointments", {
      scheduled_at: "2026-11-03T10:00",
      reason: "  Follow-up  ",
    });

    expect(res.status).toBe(303);
    const location = res.headers.get("Location")!;
    expect(location).toMatch(/^\/appointments\/[1-9][0-9]*$/);

    const page = await app.request(location);
    expect(page.status).toBe(200);
    const body = await page.text();
    expect(body).toContain("<h1>Appointment booked</h1>");
    expect(body).toContain('<a href="/agents/1">Ada</a>');
    expect(body).toContain('<time datetime="2026-11-03T10:00">3 Nov 2026, 10:00</time> (clinic time)');
    expect(body).toContain("<dd>Follow-up</dd>");
    expect(body).toContain('<a href="/appointments">View all appointments</a>');
    expect(body).toContain('<a href="/agents/1">Back to Ada</a>');
    expect(body).toContain('<a href="/appointments" aria-current="true">Appointments</a>');
  });

  it("accepts the hint's typed format, with a space instead of T", async () => {
    const { app } = createTestApp();

    const location = await book(app, 1, "2026-11-03 10:00");

    expect(location).toMatch(/^\/appointments\/\d+$/);
    const body = await (await app.request(location!)).text();
    expect(body).toContain('<time datetime="2026-11-03T10:00">');
  });

  it("accepts the picker's minimum, one minute after now", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/1/appointments", { scheduled_at: "2026-11-01T09:01" });

    expect(res.status).toBe(303);
  });

  it("drops seconds from the time", async () => {
    const { app } = createTestApp();

    const location = await book(app, 1, "2026-11-03T10:00:30");

    const body = await (await app.request(location!)).text();
    expect(body).toContain('<time datetime="2026-11-03T10:00">');
  });

  it.each([
    ["missing", undefined, "Enter a date and time."],
    ["blank", "  ", "Enter a date and time."],
    ["malformed", "2026-13-45T99:99", "Enter a real date and time, like 2026-11-03 10:00."],
    ["not a real date", "2026-02-30T10:00", "Enter a real date and time, like 2026-11-03 10:00."],
    ["equal to now", TEST_NOW, "Choose a time in the future."],
    ["in the past", "2026-10-31T09:00", "Choose a time in the future."],
  ])("returns 422 when the time is %s", async (_, scheduledAt, message) => {
    const { app } = createTestApp();
    const fields: Record<string, string> = { reason: "Kept reason" };
    if (scheduledAt !== undefined) fields.scheduled_at = scheduledAt;

    const res = await postForm(app, "/agents/1/appointments", fields);

    expect(res.status).toBe(422);
    const body = await res.text();
    expect(body.match(/class="field-error"/g)).toHaveLength(1);
    expect(body).toContain(`<p id="scheduled_at-error" class="field-error">${message}</p>`);
    expect(body).toContain("Kept reason</textarea>");
  });

  it("re-renders the form accessibly on a 422", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/1/appointments", {
      scheduled_at: "2026-10-31T09:00",
      reason: "x".repeat(501),
    });

    expect(res.status).toBe(422);
    const body = await res.text();
    expect(body).toContain("<title>Error: Book an appointment for Ada – AgentClinic</title>");
    expect(body).toContain('<a href="#scheduled_at">Choose a time in the future.</a>');
    expect(body).toContain('<a href="#reason">Keep the reason to 500 characters or fewer.</a>');
    expect(body).toContain(
      'value="2026-10-31T09:00" aria-invalid="true" aria-describedby="scheduled_at-hint scheduled_at-error"/>',
    );
    expect(body).toContain('aria-invalid="true" aria-describedby="reason-error"');
  });

  it("accepts a reason of exactly 500 characters", async () => {
    const { app } = createTestApp();

    const res = await postForm(app, "/agents/1/appointments", {
      scheduled_at: "2026-11-03T10:00",
      reason: "x".repeat(500),
    });

    expect(res.status).toBe(303);
  });

  it("returns 404 for an unknown agent, even with an invalid body", async () => {
    const { app } = createTestApp();

    expect((await postForm(app, "/agents/999/appointments", {})).status).toBe(404);
  });

  it("escapes HTML in the reason", async () => {
    const { app } = createTestApp();

    const location = await book(app, 1, "2026-11-03T10:00", "<script>alert(1)</script>");

    const body = await (await app.request(location!)).text();
    expect(body).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(body).not.toContain("<script");
  });
});

describe("GET /appointments/:id", () => {
  it.each(["999", "0", "abc"])("returns 404 for /appointments/%s", async (id) => {
    const { app } = createTestApp();

    expect((await app.request(`/appointments/${id}`)).status).toBe(404);
  });
});

describe("GET /appointments", () => {
  it("shows an empty state that points to the agents", async () => {
    const { app } = createTestApp();

    const res = await app.request("/appointments");

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<title>Appointments – AgentClinic</title>");
    expect(body).toContain('<a href="/appointments" aria-current="page">Appointments</a>');
    expect(body).toContain("No upcoming appointments.");
    expect(body).toContain('<a href="/agents">Choose an agent to book</a>');
  });

  it("lists upcoming booked appointments soonest first, leaving out past and cancelled", async () => {
    let now = "2026-10-01T09:00";
    const { app } = createTestApp({ now: () => now });
    await book(app, 2, "2026-11-05T15:00", "Second");
    await book(app, 1, "2026-11-03T10:00", "First");
    await book(app, 3, "2026-10-15T09:00", "Past by then");
    const cancelled = await book(app, 4, "2026-11-04T09:00", "Cancelled");
    await app.request(`${cancelled}/cancel`, { method: "POST" });
    now = "2026-11-01T09:00";

    const body = await (await app.request("/appointments")).text();

    expect(body).not.toContain("Past by then");
    expect(body).not.toContain("<p>Cancelled</p>");
    expect(body.indexOf("First")).toBeLessThan(body.indexOf("Second"));
    expect(body).toContain('<h2><a href="/agents/1">Ada</a></h2>');
    expect(body).toContain('<time datetime="2026-11-03T10:00">3 Nov 2026, 10:00</time>');
    expect(body).toContain(
      '<button type="submit" class="button" aria-label="Cancel appointment for Ada on 3 Nov 2026, 10:00">Cancel</button>',
    );
  });

  it("escapes HTML in reasons", async () => {
    const { app } = createTestApp();
    await book(app, 1, "2026-11-03T10:00", "<script>alert(1)</script>");

    const body = await (await app.request("/appointments")).text();

    expect(body).toContain("&lt;script&gt;");
    expect(body).not.toContain("<script");
  });
});

describe("POST /appointments/:id/cancel", () => {
  it("cancels and redirects with a status message", async () => {
    const { app } = createTestApp();
    const location = await book(app, 1, "2026-11-03T10:00", "Checkup");
    const id = location!.split("/").pop();

    const res = await app.request(`/appointments/${id}/cancel`, { method: "POST" });

    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe(`/appointments?cancelled=${id}`);
    const list = await (await app.request(res.headers.get("Location")!)).text();
    expect(list).toContain('<p class="status-message" role="status">Appointment cancelled.</p>');
    expect(list).not.toContain("Checkup");
  });

  it("shows a cancelled appointment's page without a cancel form", async () => {
    const { app } = createTestApp();
    const location = await book(app, 1, "2026-11-03T10:00");
    await app.request(`${location}/cancel`, { method: "POST" });

    const res = await app.request(location!);

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<dd>Cancelled</dd>");
    expect(body).not.toContain('/cancel"');
  });

  it("redirects without a message when already cancelled", async () => {
    const { app } = createTestApp();
    const location = await book(app, 1, "2026-11-03T10:00");
    await app.request(`${location}/cancel`, { method: "POST" });

    const res = await app.request(`${location}/cancel`, { method: "POST" });

    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe("/appointments");
  });

  it("returns 404 for an unknown appointment", async () => {
    const { app } = createTestApp();

    expect((await app.request("/appointments/999/cancel", { method: "POST" })).status).toBe(404);
  });

  it("ignores a cancelled message that isn't an id", async () => {
    const { app } = createTestApp();

    const body = await (await app.request("/appointments?cancelled=%3Cb%3E")).text();

    expect(body).not.toContain("Appointment cancelled.");
    expect(body).not.toContain("<b>");
  });
});
