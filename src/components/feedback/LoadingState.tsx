export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <p role="status" className="state state-loading">
      {label}
    </p>
  );
}
