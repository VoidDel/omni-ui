import { Icon, type IconName } from '../icons/Icon';

export type ToastTone = 'success' | 'info' | 'warn' | 'error';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  text: string;
  action?: { label: string; run: () => void };
}

export interface ToastsProps {
  toasts: readonly ToastItem[];
  onDismiss: (id: number) => void;
  /** Accessible label of the close buttons; pass the app's translation. */
  closeLabel?: string;
}

const ICON: Record<ToastTone, IconName> = { success: 'checkCircle', info: 'info', warn: 'alert', error: 'alert' };

/** Toast stack at the bottom right (OmniZip docs/04-ui-design.md §5.5). The app owns the list. */
export function Toasts({ toasts, onDismiss, closeLabel = 'Close' }: ToastsProps) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((x) => (
        <div key={x.id} className={`toast ${x.tone}`} role="status">
          <Icon name={ICON[x.tone]} />
          <span>{x.text}</span>
          {x.action && (
            <button
              type="button"
              className="lnk"
              onClick={() => {
                onDismiss(x.id);
                x.action?.run();
              }}
            >
              {x.action.label}
            </button>
          )}
          <button type="button" className="iconbtn" aria-label={closeLabel} onClick={() => onDismiss(x.id)}>
            <Icon name="x" />
          </button>
        </div>
      ))}
    </div>
  );
}
