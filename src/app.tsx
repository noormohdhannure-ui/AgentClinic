import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import type { Db } from "./db/index.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { agentRoutes } from "./routes/agents.js";
import { ailmentRoutes } from "./routes/ailments.js";
import { localNow } from "./time.js";

type AppOptions = {
  // Returns the current server-local time as YYYY-MM-DDTHH:MM. Tests pass a
  // fixed value so they don't depend on the clock.
  now?: () => string;
};

export function createApp(db: Db, { now = localNow }: AppOptions = {}) {
  const app = new Hono();

  // Pages render their own Layout; the renderer only adds the doctype.
  app.use(jsxRenderer(({ children }) => <>{children}</>, { docType: "<!doctype html>" }));

  app.get("/", (c) => c.render(<HomePage />));
  app.route("/agents", agentRoutes(db, now));
  app.route("/ailments", ailmentRoutes(db));

  app.use("/*", serveStatic({ root: "./public" }));

  app.notFound((c) => {
    c.status(404);
    return c.render(<NotFoundPage />);
  });

  return app;
}
