type StatusMessageProps = {
  message: string;
};

export function StatusMessage({ message }: StatusMessageProps) {
  return (
    <p class="status-message" role="status">
      {message}
    </p>
  );
}
