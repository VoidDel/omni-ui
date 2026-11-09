import type { IconName } from './Icon';

const IMAGE = /^(jpe?g|png|gif|webp|svg|bmp|heic|ico|icns|tiff?|avif)$/;
const VIDEO = /^(mp4|mkv|mov|avi|webm|m4v|ts|flv|wmv)$/;
const AUDIO = /^(mp3|flac|wav|m4a|ogg|aac|opus|wma)$/;
const FONT = /^(woff2?|ttf|otf|pf2)$/;
const CODE = /^(ts|tsx|js|jsx|mjs|rs|c|h|cc|cpp|hpp|py|go|java|kt|swift|cs|css|scss|html|vue|json|toml|ya?ml|lock|cfg|ini|sh|ps1|bat|xml|plist|sql|gradle)$/;
const TEXT = /^(md|txt|env|srt|log|csv|rst|tex|rtf|license|pdf|docx?|xlsx?|pptx?|epub)$/;
const ARCHIVE = /^(zip|7z|rar|tar|gz|tgz|bz2|xz|zst|lz4|br|cab|deb|rpm|jar|apk|squashfs|wim)$/;
const DISC = /^(iso|img|dmg|vhdx?|qcow2)$/;
const APP = /^(exe|msi|msix|appimage|pkg|run|appx)$/;

/** Colour class of a file icon (`.fi.<class>`, coloured by the duotone rules in components.css). */
export type FileIconClass = 'folder' | 'image' | 'video' | 'audio' | 'font' | 'archive' | 'disc' | 'app' | 'code' | 'text' | 'file';

/** `[icon, colour class]` for a file name. */
export function fileIcon(name: string, isDir: boolean, kind?: string): [IconName, FileIconClass] {
  if (isDir) return ['folder', 'folder'];
  if (kind === 'symlink' || kind === 'hardlink') return ['link', 'text'];
  const i = name.lastIndexOf('.');
  const e = i > 0 ? name.slice(i + 1).toLowerCase() : '';
  if (IMAGE.test(e)) return ['fileImage', 'image'];
  if (VIDEO.test(e)) return ['fileVideo', 'video'];
  if (AUDIO.test(e)) return ['fileAudio', 'audio'];
  if (FONT.test(e)) return ['fileFont', 'font'];
  if (ARCHIVE.test(e)) return ['archive', 'archive'];
  if (DISC.test(e)) return ['disc', 'disc'];
  if (APP.test(e)) return ['cpu', 'app'];
  if (CODE.test(e)) return ['fileCode', 'code'];
  if (TEXT.test(e) || !e) return ['fileText', 'text'];
  return ['file', 'file'];
}
