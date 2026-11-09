// Theme validation and token derivation (OmniZip docs/05-theming.md §2), the TypeScript twin of
// OmniZip's Rust theme service. Apps with a Rust theme service resolve there; this one serves
// previews, tests and apps that resolve in the WebView.

import { alpha, contrast, guard, mix, onColor, validHex } from './color';
import { REQUIRED_COLORS, type ResolveOptions, type ResolvedTheme, type ThemeFile, type ThemeSummary } from './types';

const KNOWN_KEYS = new Set(['$schema', 'schemaVersion', 'id', 'name', 'author', 'appearance', 'highContrast', 'colors', 'components', 'shape', 'effects', 'icons']);

/** Parses and validates a theme (a JSON string or an already parsed object). Throws on errors. */
export function parseTheme(input: string | unknown): ThemeFile {
  const v: unknown = typeof input === 'string' ? JSON.parse(input) : input;
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('theme must be an object');
  const t = v as Record<string, unknown>;
  for (const k of Object.keys(t)) if (!KNOWN_KEYS.has(k)) throw new Error(`unknown field ${k}`);
  if (t.schemaVersion !== 1) throw new Error(`unsupported schemaVersion ${String(t.schemaVersion)}`);
  const id = t.id;
  if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) throw new Error(`invalid id ${JSON.stringify(id)}`);
  const name = t.name;
  if (!name || typeof name !== 'object' || typeof (name as Record<string, unknown>)['en-US'] !== 'string') throw new Error('name must include en-US');
  if (t.appearance !== 'light' && t.appearance !== 'dark') throw new Error('appearance must be light or dark');
  const colors = t.colors;
  if (!colors || typeof colors !== 'object') throw new Error('colors must be an object');
  const c = colors as Record<string, unknown>;
  for (const k of REQUIRED_COLORS) {
    const x = c[k];
    if (x === undefined) throw new Error(`missing required color ${k}`);
    if (typeof x !== 'string' || !validHex(x)) throw new Error(`${k}: invalid color ${String(x)}`);
  }
  const components = (t.components ?? {}) as Record<string, unknown>;
  for (const [k, x] of [...Object.entries(c), ...Object.entries(components)]) {
    if (typeof x !== 'string' || !validHex(x)) throw new Error(`${k}: invalid color ${String(x)}`);
  }
  return t as unknown as ThemeFile;
}

/** Derives every token (docs/05-theming.md §2.1). */
export function resolveTheme(t: ThemeFile, o: ResolveOptions): ResolvedTheme {
  const c = (k: string) => t.colors[k] ?? '#FF00FF';
  const dark = t.appearance === 'dark';
  const hc = !!t.highContrast;
  const [canvas, surface, elevated, sidebar] = [c('bg.canvas'), c('bg.surface'), c('bg.elevated'), c('bg.sidebar')];
  const adjusted: string[] = [];

  const [fg, a1] = guard(c('fg.primary'), [canvas, surface, elevated], 4.5);
  const [fg2, a2] = guard(c('fg.secondary'), [canvas, surface, elevated], 3.0);
  if (a1) adjusted.push('fg.primary');
  if (a2) adjusted.push('fg.secondary');
  let accent: string;
  if (o.accent === 'theme') accent = c('accent');
  else if (o.accent === 'system') accent = o.systemAccent && validHex(o.systemAccent) ? o.systemAccent : c('accent');
  else accent = validHex(o.accent) ? o.accent : c('accent');
  const border = c('border.default');
  const material = o.material && !hc;

  const tk: Record<string, string> = {};
  tk['bg-canvas'] = canvas;
  tk['bg-surface'] = surface;
  tk['bg-elevated'] = elevated;
  tk['bg-sidebar'] = sidebar;
  // Small windows (progress, standalone dialogs) are all material when it is on: a veil of the
  // canvas keeps text readable even over Acrylic's live blur.
  tk['canvas-material'] = material ? alpha(canvas, dark ? 0.6 : 0.55) : canvas;
  // A light veil of the theme colour: enough to keep the theme's tint, thin enough for the
  // material (wallpaper-tinted Mica) to read as a material, like native Windows 11 panes.
  tk['sidebar-material'] = material ? alpha(sidebar, dark ? 0.45 : 0.35) : sidebar;
  tk['bg-subtle'] = mix(surface, fg, 0.04);
  tk['bg-hover'] = mix(surface, fg, hc ? 0.12 : 0.07);
  tk['bg-pressed'] = mix(surface, fg, hc ? 0.2 : 0.11);
  tk['fg-primary'] = fg;
  tk['fg-secondary'] = fg2;
  tk['fg-muted'] = alpha(fg, hc ? 0.8 : 0.55);
  tk['fg-disabled'] = alpha(fg, hc ? 0.5 : 0.35);
  tk['border-subtle'] = hc ? border : mix(border, surface, 0.5);
  tk['border-default'] = border;
  tk['border-strong'] = mix(border, fg, 0.25);
  tk['border-focus'] = accent;
  tk['accent'] = accent;
  tk['accent-hover'] = mix(accent, fg, 0.12);
  tk['accent-pressed'] = mix(accent, fg, 0.22);
  tk['accent-subtle'] = alpha(accent, hc ? 0.28 : 0.14);
  tk['accent-fg'] = onColor(accent);
  for (const s of ['success', 'warning', 'danger', 'info'] as const) {
    tk[s] = c(s);
    tk[`${s}-subtle`] = alpha(c(s), s === 'warning' ? 0.16 : 0.14);
  }
  // Fixed family colour for BitTorrent / magnet badges (Omni Download), lighter on dark themes.
  tk['bt'] = dark ? '#A48BFF' : '#7A5AF8';
  tk['bt-subtle'] = alpha(tk['bt'], dark ? 0.16 : 0.14);
  tk['selection-bg'] = alpha(accent, hc ? 0.35 : 0.22);
  tk['selection-fg'] = fg;
  tk['folder-color'] = dark ? '#F0C35C' : '#E0A82E';
  tk['shadow-1'] = dark ? '0 2px 8px rgba(0,0,0,.45)' : '0 2px 8px rgba(20,30,50,.10)';
  tk['shadow-2'] = dark ? '0 16px 48px rgba(0,0,0,.6)' : '0 16px 48px rgba(20,30,50,.18)';
  tk['overlay-scrim'] = dark ? 'rgba(0,0,0,.55)' : 'rgba(10,14,22,.4)';
  for (const [k, v] of Object.entries(t.components ?? {})) tk[k.replace(/\./g, '-')] = v;
  for (const [k, v] of Object.entries(t.shape ?? {})) tk[k.replace(/\./g, '-')] = `${v}px`;

  return { id: t.id, appearance: t.appearance, highContrast: hc, tokens: tk, adjusted };
}

/** Card summary of a theme for a picker. */
export function summarize(t: ThemeFile, builtin: boolean): ThemeSummary {
  return {
    id: t.id,
    name: t.name,
    appearance: t.appearance,
    highContrast: !!t.highContrast,
    builtin,
    colors: t.colors,
    contrast: Math.round(contrast(t.colors['fg.primary'], t.colors['bg.canvas']) * 10) / 10,
  };
}

export { contrast };
