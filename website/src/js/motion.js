import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { initFlow } from "./flow.js";
import { initGradient } from "./gradient.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarseQuery = window.matchMedia("(pointer: coarse)");

export const prefersReducedMotion = () => reduceQuery.matches;

/* ------------------------------------------------------------------ *
 * Smooth scrolling
 * ------------------------------------------------------------------ */

function initSmoothScroll() {
  if (prefersReducedMotion() || coarseQuery.matches) return null;

  const lenis = new Lenis({
    duration: 1.05,
    lerp: 0.1,
    smoothWheel: true,
    anchors: { offset: -80 },
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add("has-lenis");

  return lenis;
}

/* ------------------------------------------------------------------ *
 * Scroll reveals
 * ------------------------------------------------------------------ */

function initReveals() {
  const nodes = gsap.utils.toArray(".reveal, [data-reveal]");
  if (!nodes.length) return;

  if (prefersReducedMotion()) {
    nodes.forEach((node) => node.classList.add("is-in"));
    return;
  }

  // The CSS `.reveal` rule is the no-JS fallback. Once GSAP owns these nodes
  // we neutralise it and drive the hidden state from the timeline instead.
  nodes.forEach((node) => node.classList.add("is-in"));
  gsap.set(nodes, { autoAlpha: 0, y: 26 });

  ScrollTrigger.batch(nodes, {
    start: "top 92%",
    once: true,
    onEnter: (batch) =>
      // "auto" so this only resolves conflicts on opacity/transform; a plain
      // `true` would kill unrelated tweens such as the clip-path wipes.
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.08,
        overwrite: "auto",
      }),
  });
}

/* ------------------------------------------------------------------ *
 * Word / line reveals for section headings
 * ------------------------------------------------------------------ */

function splitLines(el) {
  return SplitText.create(el, {
    type: "lines",
    linesClass: "split-line",
    mask: "lines",
    autoSplit: true,
  });
}

function initHeadings() {
  const headings = gsap.utils.toArray("[data-split]");
  if (!headings.length || prefersReducedMotion()) return;

  headings.forEach((heading) => {
    const split = splitLines(heading);
    gsap.set(heading, { autoAlpha: 1 });
    gsap.from(split.lines, {
      yPercent: 115,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.08,
      scrollTrigger: { trigger: heading, start: "top 85%", once: true },
    });
  });
}

/* ------------------------------------------------------------------ *
 * Hero: intro timeline, orbit flow, pointer parallax
 * ------------------------------------------------------------------ */

/**
 * Sits each orbit node exactly on its own ellipse rather than relying on
 * hand-guessed coordinates that drift whenever a radius changes. Nodes live
 * inside the same rotated <g> as their ellipse, so local coordinates line up.
 */
function placeOrbitNodes(nodes) {
  nodes.forEach((node) => {
    const arc = node.parentElement?.querySelector("[data-orbit-arc]");
    if (!arc?.getPointAtLength) return;

    const t = Number(node.dataset.orbitNode);
    const point = arc.getPointAtLength(arc.getTotalLength() * ((Number.isFinite(t) ? t : 0.25) % 1));
    node.setAttribute("cx", point.x.toFixed(2));
    node.setAttribute("cy", point.y.toFixed(2));
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const canvas = hero.querySelector("[data-gradient]");
  initGradient(canvas, { reducedMotion: prefersReducedMotion() });

  const brand = hero.querySelector("[data-hero-brand]");
  const title = hero.querySelector("[data-hero-title]");
  const copy = gsap.utils.toArray(hero.querySelectorAll("[data-hero-copy]"));
  const photo = hero.querySelector("[data-hero-photo]");
  const stage = hero.querySelector("[data-hero-stage]");
  const nodes = gsap.utils.toArray(hero.querySelectorAll("[data-orbit-node]"));
  const arcs = gsap.utils.toArray(hero.querySelectorAll("[data-orbit-arc]"));
  const flows = gsap.utils.toArray(hero.querySelectorAll("[data-orbit-flow]"));

  placeOrbitNodes(nodes);

  if (prefersReducedMotion()) {
    gsap.set([brand, title, ...copy, photo, stage, ...nodes], { autoAlpha: 1, clearProps: "transform" });
    hero.classList.add("is-ready");
    return;
  }

  const titleSplit = title ? splitLines(title) : null;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onStart: () => hero.classList.add("is-ready"),
  });

  if (photo) {
    tl.fromTo(
      photo,
      { clipPath: "inset(0% 0% 100% 0%)", scale: 1.14 },
      { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.5, ease: "expo.out" },
      0
    );
  }

  if (brand) {
    // The mark draws itself: both halves of the ribbon stroke on from their
    // own tips, then the crossing node, dot and wordmark land.
    const ribbons = gsap.utils.toArray(brand.querySelectorAll("[data-ribbon]"));
    const trim = gsap.utils.toArray(brand.querySelectorAll("[data-ribbon-node], [data-ribbon-dot]"));
    const word = gsap.utils.toArray(brand.querySelectorAll('g[fill="currentColor"] path'));

    tl.fromTo(brand, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.05);

    ribbons.forEach((ribbon) => {
      const length = ribbon.getTotalLength?.() || 800;
      gsap.set(ribbon, { strokeDasharray: length, strokeDashoffset: length });
      tl.to(ribbon, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 0.15);
    });

    if (trim.length) {
      tl.fromTo(trim, { autoAlpha: 0, scale: 0.4, transformOrigin: "center" }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 1.25);
    }

    if (word.length) {
      tl.fromTo(word, { autoAlpha: 0, yPercent: 45 }, { autoAlpha: 1, yPercent: 0, duration: 0.7, stagger: 0.06, ease: "expo.out" }, 1.0);
    }
  }

  if (titleSplit) {
    tl.from(titleSplit.lines, { yPercent: 115, duration: 1, stagger: 0.09 }, 0.4);
  }

  if (copy.length) {
    tl.fromTo(copy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.7);
  }

  arcs.forEach((arc) => {
    const length = arc.getTotalLength?.() || 600;
    gsap.set(arc, { strokeDasharray: length, strokeDashoffset: length });
    tl.to(arc, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0.5);
  });

  if (nodes.length) {
    tl.fromTo(
      nodes,
      { autoAlpha: 0, scale: 0.6 },
      { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.09, ease: "back.out(2)" },
      0.85
    );
  }

  if (stage) {
    tl.fromTo(stage, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 1.1 }, 0.55);
  }

  // Continuous: a short dash travels each arc, reading as points flowing from
  // the partner programs into the family pool.
  flows.forEach((flow, index) => {
    const length = flow.getTotalLength?.() || 600;
    gsap.set(flow, { strokeDasharray: `14 ${length}`, strokeDashoffset: length, strokeOpacity: 1 });
    gsap.to(flow, {
      strokeDashoffset: -14,
      duration: 2.8,
      delay: 1.4 + index * 0.42,
      repeat: -1,
      repeatDelay: 0.5,
      ease: "none",
    });
  });

  // Pointer parallax across the hero layers.
  if (!coarseQuery.matches) {
    const layers = gsap.utils.toArray(hero.querySelectorAll("[data-hero-depth]"));
    const setters = layers.map((layer) => ({
      x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3.out" }),
      depth: Number(layer.dataset.heroDepth) || 1,
    }));

    hero.addEventListener(
      "pointermove",
      (event) => {
        const rect = hero.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        setters.forEach((s) => {
          s.x(nx * 22 * s.depth);
          s.y(ny * 16 * s.depth);
        });
      },
      { passive: true }
    );

    hero.addEventListener("pointerleave", () => {
      setters.forEach((s) => {
        s.x(0);
        s.y(0);
      });
    });
  }

  // Hero drifts away as the page scrolls past it.
  gsap.to(hero.querySelector("[data-hero-inner]"), {
    y: -60,
    autoAlpha: 0.25,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "bottom 92%", end: "bottom 30%", scrub: 0.6 },
  });
}

/* ------------------------------------------------------------------ *
 * Parallax imagery
 * ------------------------------------------------------------------ */

function initParallax() {
  if (prefersReducedMotion()) return;

  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const amount = Number(el.dataset.parallax) || 12;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: { trigger: el.closest("[data-parallax-scope]") || el, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });
}

/* ------------------------------------------------------------------ *
 * Media wipes
 * ------------------------------------------------------------------ */

function initMediaWipes() {
  if (prefersReducedMotion()) return;

  gsap.utils.toArray("[data-wipe]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      }
    );
  });
}

/* ------------------------------------------------------------------ *
 * Number counters
 * ------------------------------------------------------------------ */

function initCounters() {
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    if (Number.isNaN(target)) return;

    if (prefersReducedMotion()) {
      el.textContent = target.toLocaleString("en-US");
      return;
    }

    const proxy = { value: 0 };
    gsap.to(proxy, {
      value: target,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.round(proxy.value).toLocaleString("en-US");
      },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });
}

/* ------------------------------------------------------------------ *
 * Progress bars
 * ------------------------------------------------------------------ */

function initProgressBars() {
  const bars = gsap.utils.toArray(".progress__bar");
  if (!bars.length) return;

  if (prefersReducedMotion()) {
    bars.forEach((bar) => bar.classList.add("is-on"));
    return;
  }

  bars.forEach((bar) => {
    ScrollTrigger.create({
      trigger: bar,
      start: "top 92%",
      once: true,
      onEnter: () => bar.classList.add("is-on"),
    });
  });
}

/* ------------------------------------------------------------------ *
 * Hover / pointer interactions
 * ------------------------------------------------------------------ */

function initPointerInteractions() {
  if (prefersReducedMotion() || coarseQuery.matches) return;

  // Buttons lean toward the cursor.
  gsap.utils.toArray(".btn").forEach((btn) => {
    const xTo = gsap.quickTo(btn, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.45, ease: "power3.out" });

    btn.addEventListener("pointermove", (event) => {
      const rect = btn.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * 0.22);
      yTo((event.clientY - rect.top - rect.height / 2) * 0.3);
    });

    btn.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });

  // Sections that light up under the cursor.
  gsap.utils.toArray("[data-spotlight]").forEach((section) => {
    const xTo = gsap.quickTo(section, "--spot-x", { duration: 0.6, ease: "power2.out" });
    const yTo = gsap.quickTo(section, "--spot-y", { duration: 0.6, ease: "power2.out" });

    section.addEventListener("pointermove", (event) => {
      const rect = section.getBoundingClientRect();
      xTo(((event.clientX - rect.left) / rect.width) * 100);
      yTo(((event.clientY - rect.top) / rect.height) * 100);
    });
  });
}

/* ------------------------------------------------------------------ *
 * Section transitions
 * ------------------------------------------------------------------ */

function initSectionTransitions() {
  if (prefersReducedMotion()) return;

  // Rules draw themselves in as each row arrives.
  gsap.utils.toArray("[data-rule]").forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left center",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      }
    );
  });

  // The journey ribbon marches in as you scrub through it.
  const journey = document.querySelector("[data-journey]");
  if (journey) {
    const items = gsap.utils.toArray(journey.querySelectorAll("[data-journey-item]"));
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: journey, start: "top 82%", end: "bottom 70%", scrub: 0.8 },
      }
    );
  }

  // Full-bleed bands scale their imagery slightly as they pass.
  gsap.utils.toArray("[data-band-media]").forEach((media) => {
    gsap.fromTo(
      media,
      { scale: 1.16 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: media.closest("section") || media, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });
}

/* ------------------------------------------------------------------ *
 * Scroll progress indicator
 * ------------------------------------------------------------------ */

function initScrollProgress() {
  const bar = document.querySelector("[data-scroll-progress]");
  if (!bar) return;

  gsap.fromTo(
    bar,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      transformOrigin: "left center",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    }
  );
}

/* ------------------------------------------------------------------ */

export function initMotion() {
  initSmoothScroll();
  initHero();
  initReveals();
  initHeadings();
  initParallax();
  initMediaWipes();
  initCounters();
  initProgressBars();
  initSectionTransitions();
  initPointerInteractions();
  initScrollProgress();
  initFlow();

  // Late-loading imagery changes document height; keep triggers honest.
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.querySelectorAll("img[loading='lazy']").forEach((img) => {
    img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  });
}
