import type { Child } from "hono/jsx";
import { Footer } from "./Footer.js";
import { Header } from "./Header.js";
import { Main } from "./Main.js";

type LayoutProps = {
  title: string;
  children?: Child;
};

export function Layout({ title, children }: LayoutProps) {
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
        <Header />
        <Main>{children}</Main>
        <Footer />
      </body>
    </html>
  );
}
