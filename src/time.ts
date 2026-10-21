// Times are server-local strings in the form YYYY-MM-DDTHH:MM, the same
// format a datetime-local input sends, so they compare correctly as strings.

const pad = (n: number) => String(n).padStart(2, "0");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Built from local getters on purpose: toISOString() gives UTC, which would
// shift "upcoming" by the time-zone offset.
export function localNow(date = new Date()): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

// "2026-11-03T10:00" -> "3 Nov 2026, 10:00", independent of server locale.
export function formatWhen(value: string): string {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}, ${time.slice(0, 5)}`;
}

// True for a real calendar date and time in YYYY-MM-DDTHH:MM(:SS) form, so
// values like 2026-02-30T10:00 or 2026-01-01T25:00 are rejected.
export function isRealDateTime(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return false;
  const [year, month, day, hours, minutes, seconds = 0] = match.slice(1).map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth &&
    hours <= 23 &&
    minutes <= 59 &&
    seconds <= 59
  );
}
