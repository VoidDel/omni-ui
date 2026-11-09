import { useState } from 'react';

import { Icon } from '../icons/Icon';

export interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
  label: string;
  /** Accessible label of the show / hide button; pass the app's translation. */
  toggleLabel?: string;
}

/** Password input with show / hide toggle (`.pw`). */
export function PasswordInput({ value, onChange, id, autoFocus, onEnter, label, toggleLabel = 'Show password' }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        data-autofocus={autoFocus ? '' : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
      />
      <button type="button" className="iconbtn sm" onClick={() => setShow(!show)} aria-label={toggleLabel} aria-pressed={show}>
        <Icon name={show ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );
}
