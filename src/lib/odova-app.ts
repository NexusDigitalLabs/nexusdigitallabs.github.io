const PLAY_BASE = 'https://play.google.com/store/apps/details?id=dev.nexusdigitallabs.odova';

/** Play Store link for the Odova app, tagged so Play Console shows where installs came from. */
export function odovaPlayUrl(campaign = 'fuel_tracker'): string {
  const referrer = `utm_source=nexusdigitallabs&utm_medium=web&utm_campaign=${campaign}`;
  return `${PLAY_BASE}&referrer=${encodeURIComponent(referrer)}`;
}

/** The web tracker covers the same limits as the app's free plan. */
export const WEB_FREE_VEHICLE_LIMIT = 1;
