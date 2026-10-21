import { createApp } from "../app.js";
import { openDb } from "../db/index.js";

// The fixed "now" tests run at, unless they pass their own.
export const TEST_NOW = "2026-11-01T09:00";

// A fresh app on an in-memory database with a fixed clock.
export function createTestApp({ now = () => TEST_NOW }: { now?: () => string } = {}) {
  const db = openDb(":memory:");
  return { app: createApp(db, { now }), db };
}

type App = ReturnType<typeof createApp>;

// Posts form fields the way a browser does.
export function postForm(app: App, path: string, fields: Record<string, string>) {
  return app.request(path, { method: "POST", body: new URLSearchParams(fields) });
}
