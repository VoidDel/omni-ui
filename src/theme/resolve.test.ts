import { describe, expect, it } from 'vitest';

import { builtinThemes } from './builtin';
import { mix } from './color';
import { contrast, parseTheme, resolveTheme } from './resolve';
import type { ResolveOptions, ThemeFile } from './types';

const opts: ResolveOptions = { accent: 'theme', systemAccent: null, material: true };
const aurora = () => builtinThemes.find((t) => t.id === 'aurora')!;

describe('built-in themes', () => {
  it('are twelve, parse, and pass the contrast guard', () => {
    expect(builtinThemes).toHaveLength(12);
    for (const t of builtinThemes) {
      const r = resolveTheme(t, opts);
      // Two third-party palettes have secondary text just under 4.5:1; it is nudged, not redrawn.
      expect(r.adjusted, `${t.id} needed adjustment`).toEqual(['catppuccin-latte', 'solarized-dark'].includes(t.id) ? ['fg.secondary'] : []);
      for (const bg of ['bg-canvas', 'bg-surface', 'bg-elevated']) {
        expect(contrast(r.tokens['fg-primary'], r.tokens[bg]), `${t.id} ${bg}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(r.tokens['fg-secondary'], r.tokens[bg]), `${t.id} secondary on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(r.tokens['accent-fg'], r.tokens.accent), t.id).toBeGreaterThanOrEqual(3.0);
    }
  });

  it('keep every kind of text at 4.5:1 on every pane', () => {
    const panes = ['bg-canvas', 'bg-surface', 'bg-elevated', 'bg-sidebar'];
    for (const t of builtinThemes) {
      const k = resolveTheme(t, { ...opts, material: false }).tokens;
      const opacity = Number(/,([\d.]+)\)$/.exec(k['fg-muted'])![1]);
      for (const bg of panes) {
        expect(contrast(mix(k[bg], k['fg-primary'], opacity), k[bg]), `${t.id} muted on ${bg}`).toBeGreaterThanOrEqual(4.5);
        for (const name of ['accent', 'success', 'warning', 'danger', 'info', 'bt']) {
          expect(contrast(k[`${name}-text`], k[bg]), `${t.id} ${name}-text on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
      // The chosen navigation item: accent text on the accent's own tint over the sidebar.
      expect(contrast(k['accent-text'], mix(k['bg-sidebar'], k.accent, t.highContrast ? 0.28 : 0.14)), `${t.id} current item`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('leave colours that already read as text alone', () => {
    const k = resolveTheme(builtinThemes.find((t) => t.id === 'midnight')!, opts).tokens;
    for (const name of ['success', 'warning', 'info']) expect(k[`${name}-text`]).toBe(k[name]);
  });

  it('put the better of black and white on the accent', () => {
    const on = (id: string) => resolveTheme(builtinThemes.find((t) => t.id === id)!, opts).tokens['accent-fg'];
    expect(on('aurora')).toBe('#FFFFFF');
    // White on Midnight's light blue is 3.2:1; black is 6:1.
    expect(on('midnight')).toBe('#111111');
    // About level on Paper's orange: white stays.
    expect(on('paper')).toBe('#FFFFFF');
  });

  // `fg-muted` is ahead of the Rust service (0.55 there) until it takes the same contrast pass.
  it('derive the same tokens as the Rust service (aurora)', () => {
    const r = resolveTheme(aurora(), { ...opts, material: false });
    expect(r.tokens['bg-subtle']).toBe('#F6F6F7');
    expect(r.tokens['bg-hover']).toBe('#EFF0F1');
    expect(r.tokens['bg-pressed']).toBe('#E6E7E8');
    expect(r.tokens['fg-muted']).toBe('rgba(27,34,48,0.64)');
    expect(r.tokens['border-subtle']).toBe('#EEF1F6');
    expect(r.tokens['accent-hover']).toBe('#2D66D6');
    expect(r.tokens['accent-subtle']).toBe('rgba(47,111,237,0.14)');
    expect(r.tokens['accent-fg']).toBe('#FFFFFF');
    expect(r.tokens['selection-bg']).toBe('rgba(47,111,237,0.22)');
    expect(r.tokens['sidebar-material']).toBe('#EEF2F8');
    expect(r.tokens['folder-color']).toBe('#E0A82E');
    expect(r.tokens.bt).toBe('#7A5AF8');
  });

  it('veil the sidebar and canvas when the material is on', () => {
    const r = resolveTheme(aurora(), opts);
    expect(r.tokens['sidebar-material']).toBe('rgba(238,242,248,0.35)');
    expect(r.tokens['canvas-material']).toBe('rgba(245,247,251,0.55)');
    const hc = builtinThemes.find((t) => t.id === 'high-contrast-light')!;
    expect(resolveTheme(hc, opts).tokens['sidebar-material']).toBe('#FFFFFF');
  });
});

describe('contrast guard', () => {
  it('repairs a theme with faint text', () => {
    const t: ThemeFile = { ...aurora(), colors: { ...aurora().colors, 'fg.primary': '#C0C0C0' } };
    const r = resolveTheme(t, opts);
    expect(r.adjusted).toEqual(['fg.primary']);
    expect(contrast(r.tokens['fg-primary'], r.tokens['bg-canvas'])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('accent choices', () => {
  it('uses the theme, the system or a custom colour', () => {
    const t = aurora();
    expect(resolveTheme(t, { ...opts, accent: '#123456' }).tokens.accent).toBe('#123456');
    expect(resolveTheme(t, { ...opts, accent: 'system', systemAccent: '#0067C0' }).tokens.accent).toBe('#0067C0');
    expect(resolveTheme(t, { ...opts, accent: 'system', systemAccent: null }).tokens.accent).toBe('#2F6FED');
    expect(resolveTheme(t, { ...opts, accent: 'blue' }).tokens.accent).toBe('#2F6FED');
  });
});

describe('validation', () => {
  it('rejects bad files', () => {
    expect(() => parseTheme('{}')).toThrow();
    const v = JSON.parse(JSON.stringify(aurora())) as Record<string, unknown>;
    (v.colors as Record<string, string>).accent = 'blue';
    expect(() => parseTheme(v)).toThrow(/accent/);
    const w = JSON.parse(JSON.stringify(aurora())) as Record<string, unknown>;
    w.unexpected = 1;
    expect(() => parseTheme(w)).toThrow(/unexpected/);
  });
});
