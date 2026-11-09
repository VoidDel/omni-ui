import { type ReactNode, useRef } from 'react';

export interface TabsProps<T extends string> {
  id: string;
  value: T;
  /** `[value, label, marked?]`: a tab marked `true` holds a non-default setting (a dot). */
  options: [T, ReactNode, boolean?][];
  onChange: (v: T) => void;
  label?: string;
}

/**
 * Tabs over panels the caller renders (each with `role="tabpanel"` and `aria-labelledby` set to
 * `${id}-${value}`). Unlike `Segmented`, which picks a value, they switch what is shown: text
 * with an underline under the current tab. Arrow keys, Home and End move between tabs.
 */
export function Tabs<T extends string>({ id, value, options, onChange, label }: TabsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  /** Moves to the tab a key points at; whether it was such a key. */
  const move = (key: string) => {
    const at = options.findIndex(([v]) => v === value);
    const to = ({ ArrowLeft: at - 1, ArrowRight: at + 1, Home: 0, End: options.length - 1 } as Record<string, number>)[key];
    if (to === undefined) return false;
    const next = options[(to + options.length) % options.length][0];
    onChange(next);
    ref.current?.querySelector<HTMLElement>(`#${id}-${next}`)?.focus();
    return true;
  };
  return (
    <div ref={ref} className="tabs" role="tablist" aria-label={label} onKeyDown={(e) => move(e.key) && e.preventDefault()}>
      {options.map(([v, text, marked]) => (
        <button type="button" role="tab" key={v} id={`${id}-${v}`} aria-selected={v === value} tabIndex={v === value ? 0 : -1} onClick={() => onChange(v)}>
          {text}
          {marked && <i className="mark" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
