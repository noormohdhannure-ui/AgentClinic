type EmptyStateProps = {
  message: string;
  action?: { href: string; label: string };
};

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div class="empty-state">
      <p>{message}</p>
      {action && (
        <p>
          <a class="button button-secondary" href={action.href}>
            {action.label}
          </a>
        </p>
      )}
    </div>
  );
}
