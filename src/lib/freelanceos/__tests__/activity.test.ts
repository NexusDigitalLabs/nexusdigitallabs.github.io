import { describe, it, expect } from 'vitest';
import { activityHref, describeActivity, timeAgo, type ActivityEntry } from '../activity';

const entry = (over: Partial<ActivityEntry>): ActivityEntry => ({
  id: 1,
  entity_type: 'project',
  entity_id: 'abc',
  action: 'created',
  summary: 'Mobile App',
  details: {},
  created_at: '2026-10-07T10:00:00Z',
  ...over,
});

describe('describeActivity', () => {
  it('describes each action', () => {
    expect(describeActivity(entry({}))).toBe('Project created');
    expect(describeActivity(entry({ entity_type: 'client', action: 'archived' }))).toBe('Client archived');
    expect(describeActivity(entry({ action: 'status_changed', details: { from: 'active', to: 'on_hold' } }))).toBe(
      'Project marked On hold'
    );
    expect(describeActivity(entry({ action: 'updated' }))).toBe('Project updated');
  });
});

describe('activityHref', () => {
  it('links to the entity', () => {
    expect(activityHref(entry({ entity_type: 'client', entity_id: 'c1' }))).toBe('/app/clients/c1/');
    expect(activityHref(entry({ entity_id: 'p1' }))).toBe('/app/projects/p1/');
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-10-07T12:00:00Z');
  it('formats relative times', () => {
    expect(timeAgo('2026-10-07T11:59:40Z', now)).toBe('just now');
    expect(timeAgo('2026-10-07T11:55:00Z', now)).toBe('5 minutes ago');
    expect(timeAgo('2026-10-07T09:00:00Z', now)).toBe('3 hours ago');
    expect(timeAgo('2026-10-06T12:00:00Z', now)).toBe('yesterday');
    expect(timeAgo('2026-09-01T12:00:00Z', now)).toBe('Sep 1, 2026');
  });
});
