import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

export const app = new Hono();

// Pages render their own Layout; the renderer only adds the doctype.
app.use(jsxRenderer(({ children }) => <>{children}</>, { docType: "<!doctype html>" }));

app.get("/", (c) => c.render(<HomePage />));

app.use("/*", serveStatic({ root: "./public" }));

app.notFound((c) => {
  c.status(404);
  return c.render(<NotFoundPage />);
});
