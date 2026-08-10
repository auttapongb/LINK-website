import "lenis/dist/lenis.css";
import { mountChrome } from "./chrome.js";
import { mountIcons } from "./icons.js";
import { initInteractions } from "./main.js";
import { initMotion } from "./motion.js";

mountChrome();
mountIcons();
initInteractions();
initMotion();
