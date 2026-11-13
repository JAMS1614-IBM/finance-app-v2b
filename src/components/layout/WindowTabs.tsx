import { TIME_WINDOWS } from '../../domain/timeWindows';
import type { TimeWindow } from '../../domain/types';

export function WindowTabs({ value, onChange }: { value: TimeWindow; onChange: (w: TimeWindow) => void }) {
  return (
    <div role="tablist" aria-label="Time window" className="tabs">
      {TIME_WINDOWS.map((w) => (
        <button
          key={w.id}
          role="tab"
          type="button"
          aria-selected={w.id === value}
          onClick={() => onChange(w.id)}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}
