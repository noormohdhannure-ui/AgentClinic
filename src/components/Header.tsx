import { Nav, type Section } from "./Nav.js";

type HeaderProps = {
  current?: Section;
  currentIsPage?: boolean;
};

export function Header({ current, currentIsPage }: HeaderProps) {
  return (
    <header class="site-header">
      <a class="brand" href="/">
        AgentClinic
      </a>
      <Nav current={current} currentIsPage={currentIsPage} />
    </header>
  );
}
