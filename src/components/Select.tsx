import { type CSSProperties, type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '../icons/Icon';

export interface SelectProps<T extends string> {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  id?: string;
  label?: string;
  style?: CSSProperties;
}

/**
 * A drop-down list. On Linux it is drawn here: WebKitGTK opens a `<select>` as a GTK menu,
 * outside the page, which no style reaches and which looks like nothing else in the app.
 * Elsewhere it is the system's own control. The button is as wide as the longest option, as a
 * `<select>` is, so that it does not change size with the choice. The platform comes from
 * `document.documentElement.dataset.platform`, which `writeTheme` sets.
 */
export function Select<T extends string>({ value, options, onChange, id, label, style }: SelectProps<T>) {
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  if (document.documentElement.dataset.platform !== 'linux') {
    return (
      <select id={id} className="sel" style={style} value={value} aria-label={label} onChange={(e) => onChange(e.target.value as T)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>{text}</option>
        ))}
      </select>
    );
  }
  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };
  return (
    <>
      <button
        ref={btn}
        type="button"
        id={id}
        className="sel"
        style={style}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="sel-val">
          {options.map(([v, text]) => (
            <span key={v} className={v === value ? 'on' : undefined} aria-hidden={v !== value}>{text}</span>
          ))}
        </span>
      </button>
      {open && btn.current && (
        <SelectList
          anchor={btn.current}
          options={options}
          value={value}
          onPick={(v) => {
            close(true);
            if (v !== value) onChange(v);
          }}
          onClose={close}
        />
      )}
    </>
  );
}

/** The open list of a `Select`, below its button (above when there is more room there). */
function SelectList<T extends string>({ anchor, options, value, onPick, onClose }: {
  anchor: HTMLElement;
  options: [T, string][];
  value: T;
  onPick: (v: T) => void;
  onClose: (refocus: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(Math.max(0, options.findIndex(([v]) => v === value)));
  const [pos, setPos] = useState<CSSProperties>({ visibility: 'hidden' });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = anchor.getBoundingClientRect();
    const below = window.innerHeight - a.bottom - 8;
    const above = a.top - 8;
    const up = el.scrollHeight > below && above > below;
    const max = Math.max(80, up ? above : below) - 4;
    const height = Math.min(el.scrollHeight, max);
    setPos({
      left: Math.max(8, Math.min(a.left, window.innerWidth - Math.max(el.offsetWidth, a.width) - 8)),
      top: up ? a.top - 4 - height : a.bottom + 4,
      minWidth: a.width,
      maxHeight: max,
    });
    el.focus();
  }, [anchor]);
  // The active option in view, scrolling the list only (never the page under it).
  useEffect(() => {
    const el = ref.current;
    const item = el?.children[active] as HTMLElement | undefined;
    if (!el || !item) return;
    if (item.offsetTop < el.scrollTop) el.scrollTop = item.offsetTop - 4;
    else if (item.offsetTop + item.offsetHeight > el.scrollTop + el.clientHeight) el.scrollTop = item.offsetTop + item.offsetHeight - el.clientHeight + 4;
  }, [active, pos]);
  useEffect(() => {
    const down = (e: MouseEvent) => {
      const target = e.target as Node;
      // A press on the button is its own: it toggles the list.
      if (!ref.current?.contains(target) && !anchor.contains(target)) onClose(false);
    };
    // The list stays where it opened: anything that moves its button closes it.
    const moved = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose(false);
    };
    const blur = () => onClose(false);
    window.addEventListener('mousedown', down, true);
    window.addEventListener('scroll', moved, true);
    window.addEventListener('resize', blur);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('mousedown', down, true);
      window.removeEventListener('scroll', moved, true);
      window.removeEventListener('resize', blur);
      window.removeEventListener('blur', blur);
    };
  }, [anchor, onClose]);
  const onKey = (e: KeyboardEvent) => {
    const last = options.length - 1;
    const to = ({ ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: last, PageDown: active + 8, PageUp: active - 8 } as Record<string, number>)[e.key];
    if (to !== undefined) {
      e.preventDefault();
      setActive(Math.max(0, Math.min(last, to)));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPick(options[active][0]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // The next option starting with the letter typed.
      const k = e.key.toLowerCase();
      const next = [...options.keys()].map((i) => (active + 1 + i) % options.length).find((i) => options[i][1].toLowerCase().startsWith(k));
      if (next !== undefined) setActive(next);
    }
  };
  return createPortal(
    <div ref={ref} className="ctx sel-pop" role="listbox" tabIndex={-1} style={pos} onKeyDown={onKey}>
      {options.map(([v, text], i) => (
        <button
          key={v}
          type="button"
          role="option"
          aria-selected={v === value}
          className={i === active ? 'active' : undefined}
          onMouseEnter={() => setActive(i)}
          onClick={() => onPick(v)}
        >
          <span>{text}</span>
          {v === value && <Icon name="check" className="check" />}
        </button>
      ))}
    </div>,
    document.body,
  );
}
