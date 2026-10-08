import { PROJECT_STATUS_LABELS, type ProjectStatus } from '@/lib/freelanceos/projects';

export type ActivityEntry = {
  id: number;
  entity_type: 'client' | 'project';
  entity_id: string;
  action: string;
  summary: string;
  details: { from?: string; to?: string };
  created_at: string;
};

const ENTITY_LABEL = { client: 'Client', project: 'Project' } as const;

const statusLabel = (s: string | undefined) => (s && s in PROJECT_STATUS_LABELS ? PROJECT_STATUS_LABELS[s as ProjectStatus] : s ?? '?');

/** "Project marked Completed", "Client archived", … */
export function describeActivity(entry: ActivityEntry): string {
  const entity = ENTITY_LABEL[entry.entity_type];
  switch (entry.action) {
    case 'created':
      return `${entity} created`;
    case 'archived':
      return `${entity} archived`;
    case 'restored':
      return `${entity} restored`;
    case 'status_changed':
      return `${entity} marked ${statusLabel(entry.details.to)}`;
    default:
      return `${entity} updated`;
  }
}

export function activityHref(entry: ActivityEntry): string {
  return `/app/${entry.entity_type === 'client' ? 'clients' : 'projects'}/${entry.entity_id}/`;
}

/** "just now", "5 minutes ago", "3 days ago", then a date. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return 'just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 7) return rtf.format(Math.round(seconds / 86400), 'day');
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
}
