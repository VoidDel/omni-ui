import type { ReactNode } from 'react';

export interface SegmentedProps<T extends string> {
  value: T;
  /** `[value, label, disabled?]` per option. */
  options: [T, ReactNode, boolean?][];
  onChange: (v: T) => void;
  large?: boolean;
  label?: string;
}

/** Picks one value out of a few (`.seg`); `Tabs` switches what is shown instead. */
export function Segmented<T extends string>({ value, options, onChange, large, label }: SegmentedProps<T>) {
  return (
    <div className={`seg${large ? ' lg' : ''}`} role="group" aria-label={label}>
      {options.map(([v, text, disabled]) => (
        <button type="button" key={v} aria-pressed={v === value} disabled={disabled} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
