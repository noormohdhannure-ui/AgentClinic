export type Section = "home" | "agents" | "ailments" | "therapies" | "appointments";

// Each section is added here in the step that builds it, so the nav never
// links to a page that doesn't exist yet.
const sections: { key: Section; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "agents", label: "Agents", href: "/agents" },
  { key: "ailments", label: "Ailments", href: "/ailments" },
  { key: "therapies", label: "Therapies", href: "/therapies" },
  { key: "appointments", label: "Appointments", href: "/appointments" },
];

type NavProps = {
  current?: Section;
  // True on the section's own index page; false on pages under it.
  currentIsPage?: boolean;
};

export function Nav({ current, currentIsPage = true }: NavProps) {
  return (
    <nav aria-label="Main">
      <ul class="nav-list">
        {sections.map((section) => (
          <li>
            <a
              href={section.href}
              aria-current={
                section.key === current ? (currentIsPage ? "page" : "true") : undefined
              }
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
