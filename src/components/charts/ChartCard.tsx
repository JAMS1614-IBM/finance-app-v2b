import type { ReactNode } from 'react';
import { ErrorState } from '../feedback/ErrorState';
import { LoadingState } from '../feedback/LoadingState';

interface ChartCardProps {
  title: string;
  status: 'loading' | 'success' | 'error';
  error?: Error;
  onRetry?: () => void;
  children: ReactNode;
}

/** Frame for any chart: owns the title plus loading and error (with Retry) states. */
export function ChartCard({ title, status, error, onRetry, children }: ChartCardProps) {
  return (
    <section className="card" aria-label={title}>
      <h2>{title}</h2>
      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={error?.message ?? 'Something went wrong'} onRetry={onRetry} />}
      {status === 'success' && children}
    </section>
  );
}
