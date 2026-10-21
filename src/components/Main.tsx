import type { Child } from "hono/jsx";

type MainProps = {
  children?: Child;
};

export function Main({ children }: MainProps) {
  return <main class="site-main">{children}</main>;
}
