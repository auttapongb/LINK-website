/*
 * Lucide (ISC licensed) icons, imported individually so the bundler only
 * ships the handful this site actually uses.
 */
import {
  createElement,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  Clock,
  Compass,
  Crosshair,
  Database,
  Eye,
  FileText,
  GitMerge,
  Handshake,
  Hotel,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  Megaphone,
  Plane,
  Radio,
  Route,
  Share2,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Target,
  TrainFront,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide";

const REGISTRY = {
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "bar-chart-3": BarChart3,
  check: Check,
  clock: Clock,
  compass: Compass,
  crosshair: Crosshair,
  database: Database,
  eye: Eye,
  "file-text": FileText,
  "git-merge": GitMerge,
  handshake: Handshake,
  hotel: Hotel,
  "key-round": KeyRound,
  layers: Layers,
  lock: Lock,
  "map-pin": MapPin,
  megaphone: Megaphone,
  plane: Plane,
  radio: Radio,
  route: Route,
  "share-2": Share2,
  "shield-check": ShieldCheck,
  "shopping-basket": ShoppingBasket,
  smartphone: Smartphone,
  sparkles: Sparkles,
  target: Target,
  "train-front": TrainFront,
  "trending-up": TrendingUp,
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
