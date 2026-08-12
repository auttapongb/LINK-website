/**
 * Demo family-pool seed data. Every signed-in account gets the same
 * illustrative Somsri household so the admin dashboard is immediately useful.
 */

export const DEFAULT_POOL = {
  name: "Somsri Family Pool",
  balance: 48260,
  /** Tuned so shortfall ÷ Lotus 1:100 ≈ a few hundred baht of groceries */
  goal: 71000,
  goalLabel: "Family getaway · IHG stay",
  expiryNote: "2,400 Lotus’s points expire in 18 days — review before they lapse.",
  members: [
    { name: "Nan", partner: "Lotus’s", points: 12400, initials: "Na" },
    { name: "Wit", partner: "AIS", points: 18100, initials: "Wi" },
    { name: "Ploy", partner: "BTS / iBerry", points: 17760, initials: "Pl" },
  ],
};

export function goalProgress(pool = DEFAULT_POOL) {
  const pct = pool.goal > 0 ? Math.min(100, Math.round((pool.balance / pool.goal) * 100)) : 0;
  const shortfall = Math.max(0, pool.goal - pool.balance);
  return { pct, shortfall };
}

/**
 * Stable per-account seed: same narrative numbers, light personalisation by email.
 */
export function poolForAccount(user) {
  const email = (user?.email || "demo@link.local").toLowerCase();
  const hash = [...email].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const nudge = (hash % 5) * 40;
  const balance = DEFAULT_POOL.balance + nudge;
  return {
    ...DEFAULT_POOL,
    balance,
    members: DEFAULT_POOL.members.map((m, i) => ({
      ...m,
      points: m.points + (i === hash % 3 ? nudge : 0),
    })),
  };
}
