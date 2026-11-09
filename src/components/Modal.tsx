import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '../icons/Icon';

export interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Width in CSS pixels (default 520). */
  width?: number;
  /** Clicking the backdrop does not close (answers that block a job). */
  sticky?: boolean;
  /** The header doubles as the window's title bar (a standalone dialog window): it drags the window. */
  dragHeader?: boolean;
  /** Accessible label of the close button; pass the app's translation. */
  closeLabel?: string;
}

/** Modal dialog with focus trapping and Escape to close. */
export function Modal({ title, onClose, children, footer, width, sticky, dragHeader, closeLabel = 'Close' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = dragHeader || undefined;
  // Focus moves into the dialog once, when it opens. `onClose` is usually a new function on every
  // render; were it a dependency, each keystroke would re-run this and pull the focus back to the
  // first field (typing a password into a later field ended up in the file name).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>('[data-autofocus], input:not([type=checkbox]):not([type=radio]):not([type=range]):not([readonly]), select, button.primary');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === 'Tab' && el) {
        const items = Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, [tabindex]:not([tabindex="-1"]), summary'));
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    el?.addEventListener('keydown', onKey);
    return () => {
      el?.removeEventListener('keydown', onKey);
      // A frame later: the rest of the key press that closed the dialog (Enter) must not reach
      // the button that opened it, which would open the dialog again.
      requestAnimationFrame(() => prev?.focus?.());
    };
  }, []);
  return createPortal(
    <div className="scrim" onMouseDown={(e) => !sticky && e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="modal" role="dialog" aria-modal="true" style={{ ['--mw' as string]: `${width ?? 520}px` }}>
        <header data-tauri-drag-region={drag}>
          <h2 data-tauri-drag-region={drag}>{title}</h2>
          <button type="button" className="iconbtn" onClick={onClose} aria-label={closeLabel}>
            <Icon name="x" />
          </button>
        </header>
        <div className="mb">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
