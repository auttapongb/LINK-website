/*
 * Lucide (ISC licensed) icons, imported individually so the bundler only
 * ships the handful this site actually uses.
 */
import {
  createElement,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  Handshake,
  KeyRound,
  MapPin,
  Plane,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Target,
  TrainFront,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide";

const REGISTRY = {
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  check: Check,
  eye: Eye,
  handshake: Handshake,
  "key-round": KeyRound,
  "map-pin": MapPin,
  plane: Plane,
  "shield-check": ShieldCheck,
  "shopping-basket": ShoppingBasket,
  smartphone: Smartphone,
  sparkles: Sparkles,
  target: Target,
  "train-front": TrainFront,
  users: Users,
  "utensils-crossed": UtensilsCrossed,
  wallet: Wallet,
};

export function mountIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((host) => {
    const node = REGISTRY[host.dataset.icon];
    if (!node || host.firstElementChild) return;

    const svg = createElement(node, {
      "stroke-width": host.dataset.iconWeight || "1.6",
      "aria-hidden": "true",
      focusable: "false",
    });
    svg.classList.add("icon");
    host.appendChild(svg);
  });
}
