import { cookies } from 'next/headers';
import {
  EVENT_COOKIE,
  EVENT_COOKIE_MAX_AGE,
  decodeEvents,
  encodeEvents,
  type AnalyticsEvent,
} from '@/lib/analytics-events';

/**
 * Queue a product event from a server action. Delivered by <AnalyticsFlush />
 * in the browser on the next render. Never throws — analytics must not break
 * the action it describes.
 */
export async function queueEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const jar = await cookies();
    const pending = decodeEvents(jar.get(EVENT_COOKIE)?.value);
    jar.set(EVENT_COOKIE, encodeEvents([...pending, event]), {
      path: '/',
      maxAge: EVENT_COOKIE_MAX_AGE,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // read (and cleared) by AnalyticsFlush
    });
  } catch {
    /* analytics is best-effort */
  }
}
