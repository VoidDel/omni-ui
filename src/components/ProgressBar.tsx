export interface ProgressBarProps {
  /** 0 to 1. */
  value: number;
  indeterminate?: boolean;
}

/** Thin progress track (`.progress`); the fill colour follows the parent's state classes. */
export function ProgressBar({ value, indeterminate }: ProgressBarProps) {
  return (
    <div className={`progress${indeterminate ? ' indeterminate' : ''}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
      <i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}
