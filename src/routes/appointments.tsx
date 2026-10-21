import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  listUpcoming,
} from "../db/appointments.js";
import type { Db } from "../db/index.js";
import { AppointmentPage } from "../pages/AppointmentPage.js";
import { AppointmentsPage } from "../pages/AppointmentsPage.js";
import { BookAppointmentPage } from "../pages/BookAppointmentPage.js";
import { isRealDateTime, nextMinute } from "../time.js";
import { firstErrors, formValues, optionalText } from "./forms.js";
import { type AgentEnv, currentAgent } from "./loadAgent.js";
import { ID } from "./params.js";

const ENTER_TIME = "Enter a date and time.";
const REAL_TIME = "Enter a real date and time, like 2026-11-03 10:00.";
const FUTURE_TIME = "Choose a time in the future.";

// The checks run in order and stop at the first failure, so each field shows
// one error. Seconds, which some browsers send, are dropped, and a typed
// space separator is stored as the T a date picker sends.
export function bookingSchema(now: () => string) {
  return z.object({
    scheduled_at: z.string({ error: ENTER_TIME }).transform((input, ctx) => {
      const value = input.trim();
      if (value === "") {
        ctx.addIssue({ code: "custom", message: ENTER_TIME });
        return z.NEVER;
      }
      if (!isRealDateTime(value)) {
        ctx.addIssue({ code: "custom", message: REAL_TIME });
        return z.NEVER;
      }
      const minute = value.slice(0, 16).replace(" ", "T");
      if (minute <= now()) {
        ctx.addIssue({ code: "custom", message: FUTURE_TIME });
        return z.NEVER;
      }
      return minute;
    }),
    reason: optionalText("Keep the reason to 500 characters or fewer."),
  });
}

// Booking, mounted under /agents/:id/appointments so the agent loader runs
// first.
export function bookingRoutes(db: Db, now: () => string) {
  const booking = new Hono<AgentEnv>();

  booking.get("/new", (c) =>
    c.render(<BookAppointmentPage agent={c.get("agent")} min={nextMinute(now())} />),
  );

  booking.post(
    "/",
    zValidator("form", bookingSchema(now), async (result, c) => {
      if (!result.success) {
        c.status(422);
        return c.render(
          <BookAppointmentPage
            agent={currentAgent(c)}
            min={nextMinute(now())}
            values={await formValues(c)}
            errors={firstErrors(result.error.issues)}
          />,
        );
      }
    }),
    (c) => {
      const { scheduled_at, reason } = c.req.valid("form");
      const id = createAppointment(db, {
        agentId: c.get("agent").id,
        scheduledAt: scheduled_at,
        reason,
        createdAt: now(),
      });
      return c.redirect(`/appointments/${id}`, 303);
    },
  );

  return booking;
}

export function appointmentRoutes(db: Db, now: () => string) {
  const appointments = new Hono();

  appointments.get("/", (c) => {
    // Only an id, as the cancel route sets it, shows the message; the query
    // text itself is never put on the page.
    const cancelled = /^[1-9][0-9]{0,8}$/.test(c.req.query("cancelled") ?? "");
    return c.render(
      <AppointmentsPage appointments={listUpcoming(db, now())} cancelled={cancelled} />,
    );
  });

  appointments.get(`/:id${ID}`, (c) => {
    const appointment = getAppointment(db, Number(c.req.param("id")));
    if (!appointment) return c.notFound();
    return c.render(<AppointmentPage appointment={appointment} />);
  });

  appointments.post(`/:id${ID}/cancel`, (c) => {
    const id = Number(c.req.param("id"));
    const result = cancelAppointment(db, id);
    if (result === "not-found") return c.notFound();
    if (result === "already-cancelled") return c.redirect("/appointments", 303);
    return c.redirect(`/appointments?cancelled=${id}`, 303);
  });

  return appointments;
}
