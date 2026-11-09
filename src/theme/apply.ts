// Writes a resolved theme to the document (OmniZip docs/05-theming.md §8): every token becomes a
// CSS custom property on the root, and the data attributes the stylesheets key on are set.

import type { Density, IconStyle, Platform, ResolvedTheme } from './types';

export interface ApplyOptions {
  platform: Platform;
  density: Density;
  iconStyle: IconStyle;
  /** Window material active (translucent sidebar); forced off for high-contrast themes. */
  material: boolean;
  /** Base font size in px (12–20; 14 is the default). */
  fontSize: number;
}

export function writeTheme(resolved: ResolvedTheme, o: ApplyOptions, root: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(resolved.tokens)) root.style.setProperty(`--${k}`, v);
  root.dataset.appearance = resolved.appearance;
  root.dataset.hc = String(resolved.highContrast);
  root.dataset.platform = o.platform;
  root.dataset.density = o.density;
  root.dataset.icons = o.iconStyle;
  root.dataset.material = String(o.material && !resolved.highContrast);
  root.style.colorScheme = resolved.appearance;
  root.style.setProperty('--size-base', `${o.fontSize}px`);
}

/** Writes the theme inside a View Transition when the browser supports it and motion is allowed. */
export function writeThemeAnimated(resolved: ResolvedTheme, o: ApplyOptions, root?: HTMLElement): void {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!reduce && doc.startViewTransition) doc.startViewTransition(() => writeTheme(resolved, o, root));
  else writeTheme(resolved, o, root);
}

export function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/** Calls `f` when the OS switches between light and dark; returns the unsubscribe. */
export function onSystemThemeChange(f: () => void): () => void {
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mq) return () => {};
  mq.addEventListener('change', f);
  return () => mq.removeEventListener('change', f);
}
