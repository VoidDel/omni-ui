import { type KeyboardEvent, type ReactNode, useRef } from 'react';

export interface SegmentedProps<T extends string> {
  value: T;
  /** `[value, label, disabled?]` per option. */
  options: [T, ReactNode, boolean?][];
  onChange: (v: T) => void;
  large?: boolean;
  label?: string;
}

/**
 * Picks one value out of a few (`.seg`); `Tabs` switches what is shown instead. A radio group:
 * Tab stops at the chosen option, the arrow keys (Home, End) move the choice.
 */
export function Segmented<T extends string>({ value, options, onChange, large, label }: SegmentedProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = options.filter(([, , disabled]) => !disabled).map(([v]) => v);
  // The Tab stop: the chosen option, or the first one when the value is none of them.
  const stop = enabled.includes(value) ? value : enabled[0];
  const onKeyDown = (e: KeyboardEvent) => {
    const at = enabled.indexOf(stop);
    const to = ({ ArrowLeft: at - 1, ArrowUp: at - 1, ArrowRight: at + 1, ArrowDown: at + 1, Home: 0, End: enabled.length - 1 } as Record<string, number>)[e.key];
    if (to === undefined || !enabled.length) return;
    e.preventDefault();
    const next = enabled[(to + enabled.length) % enabled.length];
    if (next !== value) onChange(next);
    ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[options.findIndex(([v]) => v === next)]?.focus();
  };
  return (
    <div ref={ref} className={`seg${large ? ' lg' : ''}`} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map(([v, text, disabled]) => (
        <button type="button" role="radio" key={v} aria-checked={v === value} tabIndex={v === stop ? 0 : -1} disabled={disabled} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
