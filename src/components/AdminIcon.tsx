import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconName =
  | 'plus' | 'edit' | 'save' | 'trash' | 'eye' | 'download' | 'check'
  | 'x' | 'ban' | 'undo' | 'search' | 'export' | 'link' | 'upload'
  | 'globe' | 'send' | 'chevron' | 'logout' | 'eyeOff';

const paths: Record<IconName, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  save: <><path d="M20 6 9 17l-5-5" /></>,
  trash: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14" /><path d="M9 7V4h6v3" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  download: <><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  ban: <><circle cx="12" cy="12" r="9" /><path d="m6 6 12 12" /></>,
  undo: <><path d="M9 8H4V3" /><path d="M4 8a8 8 0 1 1-1 5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  export: <><path d="M12 14V4" /><path d="m8 8 4-4 4 4" /><path d="M5 20h14" /></>,
  link: <><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7L12.5 18.5" /></>,
  upload: <><path d="M12 20V8" /><path d="m7 13 5-5 5 5" /><path d="M5 4h14" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></>,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a18.5 18.5 0 0 1-3.2 3.8" /><path d="M6.1 6.1C3.8 7.8 2 12 2 12s4 7 10 7a10.5 10.5 0 0 0 4.4-1" /></>,
};

export function AdminIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function IconButton({
  name,
  label,
  tone = 'default',
  href,
  ...props
}: {
  name: IconName;
  label: string;
  tone?: 'default' | 'gold' | 'danger' | 'success';
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const className = `iconBtn tone-${tone} ${props.className || ''}`.trim();
  if (href) {
    return (
      <a className={className} href={href} title={label} aria-label={label} target={href.startsWith('http') || href.startsWith('/api/') ? '_blank' : undefined} rel="noreferrer">
        <AdminIcon name={name} />
      </a>
    );
  }
  return (
    <button type={props.type || 'button'} {...props} className={className} title={label} aria-label={label}>
      <AdminIcon name={name} />
    </button>
  );
}

export function AdminPageHead({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="adminPageHead">
      <div>
        <span className="kicker">THURAYA CMS</span>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="adminPageActions">{actions}</div> : null}
    </div>
  );
}
