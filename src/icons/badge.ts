import type { CSSProperties } from 'react';

/**
 * `--badge-bg` / `--badge-fg` for a `.badge` or `.card .ico` from a fixed brand colour, tinted for
 * the current appearance (OmniZip docs/05-theming.md §7: format badges keep their colour across
 * themes, only their lightness follows).
 */
export function badgeStyle(color: string, dark: boolean): CSSProperties {
  const h = color.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (t: number, to: number) => [r, g, b].map((v) => Math.round(v + (to - v) * t));
  const fg = dark ? mix(0.35, 255) : mix(0.15, 0);
  return {
    ['--badge-bg' as string]: `rgba(${r},${g},${b},${dark ? 0.22 : 0.14})`,
    ['--badge-fg' as string]: `rgb(${fg.join(',')})`,
  };
}
