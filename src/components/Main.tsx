import type { Child } from "hono/jsx";

export function Main({ children }: { children?: Child }) {
  return <main class="site-main">{children}</main>;
}
