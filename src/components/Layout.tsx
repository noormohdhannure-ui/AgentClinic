import type { Child } from "hono/jsx";
import { Footer } from "./Footer.js";
import { Header } from "./Header.js";
import { Main } from "./Main.js";
import type { Section } from "./Nav.js";

type LayoutProps = {
  title: string;
  // The nav section this page belongs to, if any.
  current?: Section;
  // True on a section's own index page; false on pages under it.
  currentIsPage?: boolean;
  children?: Child;
};

export function Layout({ title, current, currentIsPage, children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <a class="skip-link" href="#main">
          Skip to content
        </a>
        <Header current={current} currentIsPage={currentIsPage} />
        <Main>{children}</Main>
        <Footer />
      </body>
    </html>
  );
}
