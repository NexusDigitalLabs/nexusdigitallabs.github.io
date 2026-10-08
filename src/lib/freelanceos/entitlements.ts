/**
 * FreelanceOS plan limits — the single place plan rules live.
 *
 * Everyone is on `beta` today (no limits except AI, which costs real money per
 * call). Turning on paid plans later is a change to this table plus setting
 * `organizations.plan` from the billing webhook — no feature code changes.
 */

export const PLANS = ['beta', 'free', 'freelancer', 'pro'] as const;
export type Plan = (typeof PLANS)[number];

export type Entitlements = {
  /** `null` = unlimited. */
  maxClients: number | null;
  maxActiveProjects: number | null;
  maxInvoicesPerMonth: number | null;
  /** Always finite — every AI action is a paid API call. */
  aiActionsPerMonth: number;
};

const ENTITLEMENTS: Record<Plan, Entitlements> = {
  beta: { maxClients: null, maxActiveProjects: null, maxInvoicesPerMonth: null, aiActionsPerMonth: 100 },
  free: { maxClients: 3, maxActiveProjects: 2, maxInvoicesPerMonth: 5, aiActionsPerMonth: 25 },
  freelancer: { maxClients: null, maxActiveProjects: null, maxInvoicesPerMonth: null, aiActionsPerMonth: 500 },
  pro: { maxClients: null, maxActiveProjects: null, maxInvoicesPerMonth: null, aiActionsPerMonth: 2000 },
};

export function isPlan(value: unknown): value is Plan {
  return typeof value === 'string' && (PLANS as readonly string[]).includes(value);
}

/** Unknown plan values fall back to `free` (fail closed, never unlimited). */
export function getEntitlements(plan: unknown): Entitlements {
  return ENTITLEMENTS[isPlan(plan) ? plan : 'free'];
}

/** True if one more item may be created given the current count. */
export function isWithinLimit(limit: number | null, currentCount: number): boolean {
  return limit === null || currentCount < limit;
}
