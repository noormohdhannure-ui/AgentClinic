import { describe, expect, it } from "vitest";
import { formatWhen, isRealDateTime, localNow } from "./time.js";

describe("localNow", () => {
  it("uses local time, not UTC", () => {
    expect(localNow(new Date(2026, 10, 3, 7, 5))).toBe("2026-11-03T07:05");
  });
});

describe("formatWhen", () => {
  it("formats without depending on the server locale", () => {
    expect(formatWhen("2026-11-03T10:00")).toBe("3 Nov 2026, 10:00");
    expect(formatWhen("2026-01-20T09:05")).toBe("20 Jan 2026, 09:05");
  });
});

describe("isRealDateTime", () => {
  it.each(["2026-11-03T10:00", "2026-11-03T10:00:30", "2028-02-29T23:59"])(
    "accepts %s",
    (value) => {
      expect(isRealDateTime(value)).toBe(true);
    },
  );

  it.each([
    "2026-02-30T10:00",
    "2027-02-29T10:00",
    "2026-13-01T10:00",
    "2026-00-10T10:00",
    "2026-11-03T24:00",
    "2026-11-03T10:60",
    "2026-11-03 10:00",
    "2026-11-03",
    "",
  ])("rejects %s", (value) => {
    expect(isRealDateTime(value)).toBe(false);
  });
});
