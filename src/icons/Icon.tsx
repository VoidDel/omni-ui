import { BUILTIN_PATHS, type BuiltinIconName } from './paths';

const PATHS: Record<string, string[]> = { ...BUILTIN_PATHS };

/** Built-in icon names; apps may add their own with `registerIcons` and pass them as strings. */
export type IconName = BuiltinIconName;

/** Adds (or replaces) icons, in the part syntax of `paths.ts`. */
export function registerIcons(extra: Record<string, string[]>): void {
  Object.assign(PATHS, extra);
}

/** Whether an icon of this name exists (built in or registered). */
export function hasIcon(name: string): boolean {
  return name in PATHS;
}

function shape(spec: string, i: number) {
  const [kind, args] = spec.includes(':') ? spec.split(':') : ['path', spec];
  const n = (args ?? '').split(',').map(Number);
  switch (kind) {
    case 'circle':
      return <circle key={i} cx={n[0]} cy={n[1]} r={n[2]} />;
    case 'circle-fill':
      return <circle key={i} cx={n[0]} cy={n[1]} r={n[2]} fill="var(--bg-elevated)" stroke="none" />;
    case 'rect':
      return <rect key={i} x={n[0]} y={n[1]} width={n[2]} height={n[3]} rx={n[4]} />;
    case 'tone':
      return <path key={i} className="tone" d={args} />;
    default:
      return <path key={i} d={spec} />;
  }
}

export interface IconProps {
  name: IconName | string;
  className?: string;
  /** Makes the icon meaningful (`role="img"`) instead of decorative. */
  title?: string;
}

export function Icon({ name, className, title }: IconProps) {
  const parts = PATHS[name] ?? PATHS.file;
  return (
    <svg
      className={`ic${className ? ` ${className}` : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {parts.map(shape)}
    </svg>
  );
}

/** GitHub's mark (Octicons mark-github, MIT), filled with the text colour. */
export function GitHubMark() {
  return (
    <svg className="gh-mark" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}
