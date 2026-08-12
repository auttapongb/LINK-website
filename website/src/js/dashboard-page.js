import { requireAuth, getCurrentUser, initialsFor } from "./auth.js";
import { poolForAccount, goalProgress } from "./family-pool.js";
import {
  DEMO_RATES,
  estimateMonthlyPoints,
  shortfallPaths,
  formatPoints,
  formatBaht,
  WEEKS_PER_MONTH,
} from "./demo-rates.js";

function bindSlider(input, output, formatter) {
  const write = () => {
    output.textContent = formatter(Number(input.value));
  };
  input.addEventListener("input", write);
  write();
  return () => Number(input.value);
}

export async function initDashboardPage() {
  const root = document.querySelector("[data-dashboard]");
  if (!root) return;

  const user = await requireAuth("/login.html");
  if (!user) return;

  const pool = poolForAccount(user);
  const { pct, shortfall } = goalProgress(pool);
  const paths = shortfallPaths(shortfall);

  const greeting = root.querySelector("[data-dash-greeting]");
  if (greeting) {
    greeting.textContent = `Signed in as ${user.displayName}`;
  }

  const adminAvatar = root.querySelector("[data-dash-avatar]");
  if (adminAvatar) adminAvatar.textContent = initialsFor(user);

  root.querySelector("[data-pool-name]") &&
    (root.querySelector("[data-pool-name]").textContent = pool.name);
  root.querySelector("[data-pool-balance]") &&
    (root.querySelector("[data-pool-balance]").textContent = formatPoints(pool.balance));
  root.querySelector("[data-pool-goal-label]") &&
    (root.querySelector("[data-pool-goal-label]").textContent = pool.goalLabel);
  root.querySelector("[data-pool-goal-pct]") &&
    (root.querySelector("[data-pool-goal-pct]").textContent = `${pct}%`);
  root.querySelector("[data-pool-goal-meta]") &&
    (root.querySelector("[data-pool-goal-meta]").textContent =
      `${formatPoints(pool.balance)} / ${formatPoints(pool.goal)} points`);
  const bar = root.querySelector("[data-pool-progress]");
  if (bar) bar.style.setProperty("--progress", `${pct}%`);
  root.querySelector("[data-pool-expiry]") &&
    (root.querySelector("[data-pool-expiry]").textContent = pool.expiryNote);

  const contrib = root.querySelector("[data-pool-contrib]");
  if (contrib) {
    contrib.innerHTML = pool.members
      .map(
        (m) =>
          `<li><span>${m.name} · ${m.partner}</span><span>${formatPoints(m.points)}</span></li>`
      )
      .join("");
  }

  // Shortfall panel
  root.querySelector("[data-shortfall-points]") &&
    (root.querySelector("[data-shortfall-points]").textContent = formatPoints(paths.pointsNeeded));
  root.querySelector("[data-shortfall-lotuss]") &&
    (root.querySelector("[data-shortfall-lotuss]").textContent = formatBaht(paths.lotussBaht));
  root.querySelector("[data-shortfall-bts]") &&
    (root.querySelector("[data-shortfall-bts]").textContent =
      `${paths.btsRides.toLocaleString("en-US")} rides`);
  root.querySelector("[data-shortfall-ais]") &&
    (root.querySelector("[data-shortfall-ais]").textContent = formatBaht(paths.aisBaht));

  const ratesList = root.querySelector("[data-rates-list]");
  if (ratesList) {
    ratesList.innerHTML = Object.values(DEMO_RATES)
      .map((r) => `<li><strong>${r.label}:</strong> ${r.blurb}</li>`)
      .join("");
  }

  // Simulator
  const lotuss = root.querySelector("#sim-lotuss");
  const bts = root.querySelector("#sim-bts");
  const ais = root.querySelector("#sim-ais");
  const ihg = root.querySelector("#sim-ihg");
  const outLotuss = root.querySelector("[data-sim-lotuss-val]");
  const outBts = root.querySelector("[data-sim-bts-val]");
  const outAis = root.querySelector("[data-sim-ais-val]");
  const outIhg = root.querySelector("[data-sim-ihg-val]");
  const totalEl = root.querySelector("[data-sim-total]");
  const monthsEl = root.querySelector("[data-sim-months]");

  if (!lotuss || !bts || !ais || !ihg || !totalEl) return;

  const readLotuss = bindSlider(lotuss, outLotuss, (v) => formatBaht(v));
  const readBts = bindSlider(bts, outBts, (v) => String(v));
  const readAis = bindSlider(ais, outAis, (v) => formatBaht(v));
  const readIhg = bindSlider(ihg, outIhg, (v) => formatBaht(v));

  const update = () => {
    const monthly = estimateMonthlyPoints({
      lotussSpend: readLotuss(),
      btsRidesPerWeek: readBts(),
      aisBill: readAis(),
      ihgSpend: readIhg(),
    });
    totalEl.textContent = formatPoints(monthly);

    if (monthsEl) {
      if (shortfall <= 0) {
        monthsEl.textContent = "Goal already reached with the current pool.";
      } else if (monthly <= 0) {
        monthsEl.textContent = "Move a slider to estimate months to the goal.";
      } else {
        const months = Math.ceil(shortfall / monthly);
        monthsEl.textContent =
          months <= 1
            ? `At this pace, the remaining ${formatPoints(shortfall)} points could land in about one month.`
            : `At this pace, the remaining ${formatPoints(shortfall)} points could land in about ${months} months.`;
      }
    }

    // Live “still needed” if they treat sim Lotus as incremental path
    const liveLotuss = root.querySelector("[data-live-lotuss-need]");
    if (liveLotuss) {
      liveLotuss.textContent = formatBaht(paths.lotussBaht);
    }
  };

  [lotuss, bts, ais, ihg].forEach((el) => el.addEventListener("input", update));
  update();

  // Expose weeks note for accessibility
  const weeksNote = root.querySelector("[data-weeks-note]");
  if (weeksNote) {
    weeksNote.textContent = `BTS weekly rides × ${WEEKS_PER_MONTH} ≈ monthly trips.`;
  }
}
