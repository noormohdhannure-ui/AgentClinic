import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { HomePage } from "./home.js";

export const app = new Hono();

app.get("/", (c) => c.html(`<!doctype html>${HomePage()}`));

app.use("/*", serveStatic({ root: "./public" }));
