import { Icon } from './Icon';
import { fileIcon } from './fileTypes';

export interface FileIconProps {
  name: string;
  isDir: boolean;
  /** `symlink` / `hardlink` show a link icon. */
  kind?: string;
  big?: boolean;
}

/** File type icon (`.fi`), mono or duotone per `data-icons` on the root. */
export function FileIcon({ name, isDir, kind, big }: FileIconProps) {
  const [ic, cls] = fileIcon(name, isDir, kind);
  return <Icon name={ic} className={`fi ${cls}${big ? ' big' : ''}`} />;
}
