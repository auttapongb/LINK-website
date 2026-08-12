/**
 * Illustrative demo earn rates for the Family Admin calculator.
 * Not real partner terms — shown on-page as “illustrative demo rates”.
 *
 * Lotus’s is intentionally generous (1 THB → 100 pts) so goal shortfalls map
 * to ordinary household spend (a few hundred to a few thousand baht), not
 * six-figure scenarios.
 */

export const DEMO_RATES = {
  lotuss: {
    id: "lotuss",
    label: "Lotus’s",
    unit: "THB",
    /** Points earned per 1 THB spent */
    pointsPerUnit: 100,
    blurb: "1 THB spent → 100 points",
  },
  bts: {
    id: "bts",
    label: "BTS",
    unit: "ride",
    /** Points per ride (one station ≈ one trip for the demo) */
    pointsPerUnit: 120,
    blurb: "1 ride → 120 points",
  },
  ais: {
    id: "ais",
    label: "AIS",
    unit: "THB",
    pointsPerUnit: 10,
    blurb: "1 THB bill → 10 points",
  },
  ihg: {
    id: "ihg",
    label: "IHG",
    unit: "THB",
    pointsPerUnit: 15,
    blurb: "1 THB stay spend → 15 points",
  },
};

/** Weeks in an average month for weekly → monthly conversion */
export const WEEKS_PER_MONTH = 4.33;

/**
 * Estimate monthly pooled points from household inputs.
 * @param {{ lotussSpend: number, btsRidesPerWeek: number, aisBill: number, ihgSpend: number }} inputs
 */
export function estimateMonthlyPoints(inputs) {
  const lotuss = Math.max(0, Number(inputs.lotussSpend) || 0) * DEMO_RATES.lotuss.pointsPerUnit;
  const btsRides = Math.max(0, Number(inputs.btsRidesPerWeek) || 0) * WEEKS_PER_MONTH;
  const bts = btsRides * DEMO_RATES.bts.pointsPerUnit;
  const ais = Math.max(0, Number(inputs.aisBill) || 0) * DEMO_RATES.ais.pointsPerUnit;
  const ihg = Math.max(0, Number(inputs.ihgSpend) || 0) * DEMO_RATES.ihg.pointsPerUnit;
  return Math.round(lotuss + bts + ais + ihg);
}

/**
 * How much more activity is needed to cover a points shortfall.
 * @param {number} pointsNeeded
 */
export function shortfallPaths(pointsNeeded) {
  const need = Math.max(0, Math.ceil(pointsNeeded));
  if (need <= 0) {
    return {
      pointsNeeded: 0,
      lotussBaht: 0,
      btsRides: 0,
      aisBaht: 0,
    };
  }
  return {
    pointsNeeded: need,
    lotussBaht: Math.ceil(need / DEMO_RATES.lotuss.pointsPerUnit),
    btsRides: Math.ceil(need / DEMO_RATES.bts.pointsPerUnit),
    aisBaht: Math.ceil(need / DEMO_RATES.ais.pointsPerUnit),
  };
}

export function formatPoints(n) {
  return Math.round(n).toLocaleString("en-US");
}

export function formatBaht(n) {
  return `฿${Math.round(n).toLocaleString("en-US")}`;
}
