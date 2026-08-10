/*
 * The earn-to-burn loop.
 *
 * The diagram in earn-to-burn.html ships in its *finished* state: pool full,
 * window spent, boundary drawn, loop closed. That is deliberate — with
 * JavaScript off, on a narrow screen, or under prefers-reduced-motion the page
 * is a complete static explanation and the six acts are all legible at once.
 *
 * When the sticky two-column layout is in play we rewind that state to zero and
 * hand it to a single scrubbed timeline, six units long, one per act. The motion
 * is doing the explaining: dashes travel the earn streams, the level rises, the
 * counter climbs, the governance boundary draws itself around the pool, the
 * twelve months burn down, then the pool drains into the reward and the loop
 * closes back to where the streams came from.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TARGET_POINTS = 48260;
const MONTHS = 12;

/** The sticky stage only exists at the desktop breakpoint in flow.css. */
const STICKY_QUERY = "(min-width: 900px)";

const token = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const len = (el) => el.getTotalLength?.() || 1000;

/**
 * Hides a stroked path by pushing its whole length out of view. The opacity goes
 * with it because a round cap on a fully offset dash still paints a dot at the
 * start point, which shows up as a speck floating in the diagram.
 */
function hideStroke(el) {
  const length = len(el);
  gsap.set(el, { strokeDasharray: length, strokeDashoffset: length, strokeOpacity: 0 });
  return length;
}

function initHeroMark(root) {
  const flows = gsap.utils.toArray(root.querySelectorAll("[data-ribbon-flow]"));
  if (!flows.length) return;

  // A short dash on each half of the mark, looping forever: the mark itself
  // demonstrates the point stream before the page explains it.
  flows.forEach((path, i) => {
    const length = len(path);
    gsap.set(path, {
      strokeDasharray: `${length * 0.04} ${length}`,
      strokeDashoffset: 0,
      strokeOpacity: 1,
    });
    gsap.to(path, {
      strokeDashoffset: -length,
      duration: 5.2,
      ease: "none",
      repeat: -1,
      delay: i * 2.6,
    });
  });
}

function buildTimeline(section, stage, acts) {
  const q = (sel) => gsap.utils.toArray(stage.querySelectorAll(sel));

  const streams = q("[data-flow-stream]");
  const pulses = q("[data-flow-pulse]");
  const vessel = stage.querySelector("[data-flow-vessel]");
  const fill = stage.querySelector("[data-flow-fill]");
  const level = stage.querySelector("[data-flow-level]");
  const fence = stage.querySelector("[data-flow-fence]");
  const rules = q("[data-flow-rule]");
  const months = q("[data-flow-month]");
  const burn = q("[data-flow-burn]");
  const plate = stage.querySelector("[data-flow-plate]");
  const plateLabel = stage.querySelector("[data-flow-plate-label]");
  const loop = stage.querySelector("[data-flow-loop]");
  const count = stage.querySelector("[data-flow-count]");
  const windowLabel = stage.querySelector("[data-flow-window-label]");

  // Vessel geometry, read off the markup rather than duplicated here.
  const top = Number(fill.getAttribute("y"));
  const height = Number(fill.getAttribute("height"));
  const bottom = top + height;

  const SURFACE = token("--color-surface") || "#ffffff";
  const LINE = token("--color-line-strong") || "rgba(64, 49, 42, 0.22)";
  const AMBER = token("--color-amber") || "#f0900f";
  const AMBER_DEEP = token("--color-amber-deep") || "#8f5105";

  const pulseLengths = pulses.map((p) => len(p));
  streams.forEach(hideStroke);
  burn.forEach(hideStroke);
  hideStroke(vessel);
  hideStroke(loop);

  gsap.set(fill, { attr: { y: bottom, height: 0 } });
  gsap.set(level, { attr: { y1: bottom, y2: bottom }, autoAlpha: 0 });
  gsap.set([fence, ...rules], { autoAlpha: 0 });
  gsap.set(rules, { scale: 0.3, transformOrigin: "center" });
  gsap.set(months, { fill: SURFACE, stroke: LINE });
  // The reward waits in the diagram as an empty outline, so the destination is
  // visible before the pool has anything in it. Its label holds off until the
  // plate is solid, because half-opacity text on navy is neither readable nor
  // decorative.
  gsap.set(plate, { attr: { "fill-opacity": 0.05 } });
  gsap.set(plateLabel, { autoAlpha: 0 });
  gsap.set(pulses, {
    strokeDasharray: (i) => `9 ${pulseLengths[i] * 0.34}`,
    strokeDashoffset: (i) => pulseLengths[i],
    strokeOpacity: 1,
    autoAlpha: 0,
  });

  // Plain numbers rather than a class-swap, so scrubbing backwards rewrites
  // them exactly instead of leaving a stale caption behind.
  const readout = { points: 0, month: 0, converted: 0 };
  const writeCount = () => {
    count.textContent = Math.round(readout.points).toLocaleString("en-US");
  };
  const writeMonth = () => {
    if (readout.converted > 0.5) {
      windowLabel.textContent = "Converted to a stay";
      return;
    }
    const m = Math.min(MONTHS, Math.round(readout.month));
    windowLabel.textContent = m === 0 ? "Window opens · 12 months" : `Month ${m} of ${MONTHS}`;
  };
  writeCount();
  writeMonth();

  // The prose and the diagram are lit from the same clock: whichever sixth of
  // the timeline is playing is the act that reads at full strength.
  let lit = -1;
  const light = (self) => {
    const i = gsap.utils.clamp(0, acts.length - 1, Math.floor(self.progress * acts.length));
    if (i === lit) return;
    acts[lit]?.classList.remove("is-active");
    acts[i]?.classList.add("is-active");
    lit = i;
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section.querySelector(".flow-acts"),
      start: "top 62%",
      end: "bottom 58%",
      scrub: 0.7,
      onUpdate: light,
      onRefresh: light,
    },
  });

  /* 01 — Earn: the streams appear, and the pool is drawn empty. */
  tl.to(streams, { strokeDashoffset: 0, strokeOpacity: 1, duration: 0.7, stagger: 0.05 }, 0)
    .to(vessel, { strokeDashoffset: 0, strokeOpacity: 1, duration: 0.6 }, 0.3)
    .to(pulses, { autoAlpha: 1, duration: 0.2 }, 0.75);

  /* 02 — Stream: dashes run the whole length of every path. They keep moving
     through the pooling act too, because the earning never actually stops. */
  pulses.forEach((pulse, i) => {
    tl.to(pulse, { strokeDashoffset: -pulseLengths[i] * 1.4, duration: 3.2 }, 1);
  });

  /* 03 — Pool: the level rises and the number climbs with it. */
  tl.to(level, { autoAlpha: 1, duration: 0.2 }, 2)
    .to(fill, { attr: { y: bottom - height * 0.52, height: height * 0.52 }, duration: 1 }, 2)
    .to(level, { attr: { y1: bottom - height * 0.52, y2: bottom - height * 0.52 }, duration: 1 }, 2)
    .to(readout, { points: TARGET_POINTS * 0.56, duration: 1, onUpdate: writeCount }, 2);

  /* 04 — Hold: the boundary draws itself around the pool. */
  tl.to(fence, { autoAlpha: 1, duration: 0.35 }, 3)
    .to(rules, { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.09, ease: "back.out(2.2)" }, 3.15)
    .to(fill, { attr: { y: bottom - height * 0.82, height: height * 0.82 }, duration: 0.9 }, 3.05)
    .to(level, { attr: { y1: bottom - height * 0.82, y2: bottom - height * 0.82 }, duration: 0.9 }, 3.05)
    .to(readout, { points: TARGET_POINTS * 0.84, duration: 0.9, onUpdate: writeCount }, 3.05);

  /* 05 — Window: twelve months spend themselves, and the pool tops out. */
  tl.to(fill, { attr: { y: top, height }, duration: 0.7 }, 4)
    .to(level, { attr: { y1: top, y2: top }, duration: 0.7 }, 4)
    .to(readout, { points: TARGET_POINTS, duration: 0.7, onUpdate: writeCount }, 4)
    .to(months, { fill: AMBER, stroke: AMBER_DEEP, duration: 0.3, stagger: 0.05 }, 4.1)
    .to(readout, { month: MONTHS, duration: 0.85, onUpdate: writeMonth }, 4.1);

  /* 06 — Burn: the pool empties into the reward, then the loop closes. */
  tl.to(burn, { strokeDashoffset: 0, strokeOpacity: 1, duration: 0.35, stagger: 0.08 }, 5)
    .to(plate, { attr: { "fill-opacity": 1 }, duration: 0.4 }, 5.15)
    .to(plateLabel, { autoAlpha: 1, duration: 0.4 }, 5.2)
    .to(fill, { attr: { y: bottom, height: 0 }, duration: 0.7 }, 5.15)
    .to(level, { attr: { y1: bottom, y2: bottom }, duration: 0.7 }, 5.15)
    .to(readout, { points: 0, duration: 0.7, onUpdate: writeCount }, 5.15)
    .to(readout, { converted: 1, duration: 0.4, onUpdate: writeMonth }, 5.6)
    .to(level, { autoAlpha: 0, duration: 0.2 }, 5.7)
    .to(pulses, { autoAlpha: 0.35, duration: 0.4 }, 5.2)
    .to(loop, { strokeDashoffset: 0, strokeOpacity: 1, duration: 0.85 }, 5.15);

  return tl;
}

export function initFlow() {
  const section = document.querySelector("[data-flow]");
  if (!section) return;

  const heroMark = document.querySelector("[data-brand-mark='flowhero']");
  const stage = section.querySelector("[data-flow-stage]");
  const acts = gsap.utils.toArray(section.querySelectorAll("[data-flow-act]"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !window.matchMedia(STICKY_QUERY).matches || !stage) return;

  if (heroMark) initHeroMark(heroMark);

  section.classList.add("flow--motion");
  buildTimeline(section, stage, acts);
}
