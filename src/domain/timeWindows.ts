import type { TimeWindow } from './types';

export const TIME_WINDOWS: { id: TimeWindow; label: string }[] = [
  { id: 'today', label: 'Current day' },
  { id: 'week', label: 'Last 7 days' },
  { id: 'quarter', label: 'Last quarter' },
];

export const DEFAULT_WINDOW: TimeWindow = 'today';
