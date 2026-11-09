// Theme model (OmniZip docs/05-theming.md). Mirrors the Rust theme service in OmniZip
// (apps/desktop/src-tauri/src/theme.rs); the two must derive the same tokens.

export type Appearance = 'light' | 'dark';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type IconStyle = 'mono' | 'duotone';
export type Platform = 'win' | 'mac' | 'linux';

/** A theme file (schema version 1, `themes/schema/theme-1.json`). */
export interface ThemeFile {
  $schema?: string;
  schemaVersion: 1;
  id: string;
  /** Display name per BCP 47 tag; `en-US` is required and the fallback. */
  name: Record<string, string>;
  author?: string;
  appearance: Appearance;
  highContrast?: boolean;
  /** Semantic colours; the required ones are listed in `REQUIRED_COLORS`. */
  colors: Record<string, string>;
  /** Component token overrides (`titlebar.bg` …), copied through with `.` → `-`. */
  components?: Record<string, string>;
  /** Shape overrides (`radius.md` …) in px. */
  shape?: Record<string, number>;
  effects?: Record<string, string>;
  icons?: Record<string, string>;
}

export const REQUIRED_COLORS = [
  'bg.canvas', 'bg.surface', 'bg.elevated', 'bg.sidebar',
  'fg.primary', 'fg.secondary', 'border.default',
  'accent', 'success', 'warning', 'danger', 'info',
] as const;

/** Options that change resolution. */
export interface ResolveOptions {
  /** `"theme"`, `"system"` or `#RRGGBB`. */
  accent: string;
  /** System accent colour when known. */
  systemAccent?: string | null;
  /** Window material active (translucent sidebar). */
  material: boolean;
}

/** Resolved CSS custom properties (without the leading `--`). */
export interface ResolvedTheme {
  id: string;
  appearance: Appearance;
  highContrast: boolean;
  tokens: Record<string, string>;
  /** Adjustments made by the contrast guard. */
  adjusted: string[];
}

/** Summary for a theme picker card. */
export interface ThemeSummary {
  id: string;
  name: Record<string, string>;
  appearance: Appearance;
  highContrast: boolean;
  builtin: boolean;
  colors: Record<string, string>;
  /** Contrast of primary text on the canvas, one decimal. */
  contrast: number;
}
