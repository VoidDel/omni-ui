import { type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon, type IconName } from '../icons/Icon';

export interface MenuItem {
  label?: string;
  icon?: IconName;
  kbd?: string;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  separator?: boolean;
  run?: () => void;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
  /** The button that toggles the menu: a press on it is left to the button instead of closing. */
  anchor?: HTMLElement | null;
}

/** Context menu positioned at a point and kept inside the viewport. */
export function ContextMenu({ x, y, items, onClose, anchor }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });
  const [active, setActive] = useState(-1);
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      left: Math.max(8, Math.min(x, window.innerWidth - r.width - 8)),
      top: y + r.height > window.innerHeight - 8 ? Math.max(8, y - r.height) : y,
    });
    ref.current?.focus();
  }, [x, y]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !anchor?.contains(target)) onClose();
    };
    const blur = () => onClose();
    window.addEventListener('mousedown', close, true);
    window.addEventListener('blur', blur);
    window.addEventListener('resize', blur);
    return () => {
      window.removeEventListener('mousedown', close, true);
      window.removeEventListener('blur', blur);
      window.removeEventListener('resize', blur);
    };
  }, [onClose, anchor]);
  const enabled = items.map((it, i) => (!it.separator && !it.disabled ? i : -1)).filter((i) => i >= 0);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = enabled.indexOf(active);
      const next = e.key === 'ArrowDown' ? enabled[(idx + 1) % enabled.length] : enabled[(idx - 1 + enabled.length) % enabled.length];
      setActive(next ?? -1);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      onClose();
      items[active].run?.();
    }
  };
  return createPortal(
    <div ref={ref} className="ctx" role="menu" tabIndex={-1} style={pos} onKeyDown={onKey} onContextMenu={(e) => e.preventDefault()}>
      {items.map((it, i) =>
        it.separator ? (
          <hr key={i} />
        ) : (
          <button
            key={i}
            type="button"
            role="menuitem"
            className={`${it.danger ? 'danger' : ''}${i === active ? ' active' : ''}`}
            disabled={it.disabled}
            onMouseEnter={() => setActive(i)}
            onClick={() => {
              onClose();
              it.run?.();
            }}
          >
            {it.icon ? <Icon name={it.icon} /> : <i className="ic" />}
            <span>{it.label}</span>
            {it.checked && <Icon name="check" className="check" />}
            {it.kbd && <kbd>{it.kbd}</kbd>}
          </button>
        ),
      )}
    </div>,
    document.body,
  );
}
