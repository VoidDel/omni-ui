// Colour math shared by the resolver; the same formulas as OmniZip's theme.rs.

export function validHex(s: string): boolean {
  const h = s.startsWith('#') ? s.slice(1) : '';
  return (h.length === 6 || h.length === 8) && /^[0-9a-fA-F]+$/.test(h);
}

type Rgb = [number, number, number];

function rgb(hex: string): Rgb {
  const h = hex.replace(/^#/, '');
  const p = (i: number) => parseInt(h.slice(i, i + 2) || '00', 16) || 0;
  return [p(0), p(2), p(4)];
}

function toHex(c: Rgb): string {
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).toUpperCase().padStart(2, '0');
  return `#${f(c[0])}${f(c[1])}${f(c[2])}`;
}

/** `a` moved toward `b` by `t` (0..1), in sRGB. */
export function mix(a: string, b: string, t: number): string {
  const [x, y] = [rgb(a), rgb(b)];
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

/** `rgba()` of a hex colour. */
export function alpha(c: string, a: number): string {
  const [r, g, b] = rgb(c);
  return `rgba(${r},${g},${b},${a})`;
}

export function luminance(c: string): number {
  const lin = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb(c);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio. */
export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** White on `bg` when it reads as body text (4.5:1); otherwise black or white, whichever
 *  contrasts more (white when they are about level). */
export function onColor(bg: string): string {
  const white = contrast(bg, '#FFFFFF');
  return white >= 4.5 || white >= contrast(bg, '#111111') * 0.9 ? '#FFFFFF' : '#111111';
}

/** The lowest opacity from `from` up at which `fg` over each background reaches `min` contrast. */
export function opacityFor(fg: string, backgrounds: string[], min: number, from: number): number {
  for (let a = Math.round(from * 100); a < 100; a++) {
    if (backgrounds.every((bg) => contrast(mix(bg, fg, a / 100), bg) >= min)) return a / 100;
  }
  return 1;
}

/** Moves `fg` toward black or white until it reaches `min` contrast against every background. */
export function guard(fg: string, backgrounds: string[], min: number): [string, boolean] {
  const worst = (c: string) => Math.min(...backgrounds.map((b) => contrast(c, b)));
  if (worst(fg) >= min) return [fg, false];
  const target = luminance(backgrounds[0]) < 0.5 ? '#FFFFFF' : '#000000';
  for (let step = 1; step <= 20; step++) {
    const c = mix(fg, target, step * 0.05);
    if (worst(c) >= min) return [c, true];
  }
  return [target, true];
}
