import { Nav, type Section } from "./Nav.js";

type HeaderProps = {
  current?: Section;
  currentIsPage?: boolean;
};

export function Header({ current, currentIsPage }: HeaderProps) {
  return (
    <header class="site-header">
      <a class="brand" href="/">
        <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <rect class="brand-mark-bg" width="32" height="32" rx="8" />
          <path class="brand-mark-cross" d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" />
        </svg>
        AgentClinic
      </a>
      <Nav current={current} currentIsPage={currentIsPage} />
    </header>
  );
}
