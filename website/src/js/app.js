import "lenis/dist/lenis.css";
import { mountMarks } from "./brand.js";
import { mountChrome } from "./chrome.js";
import { mountIcons } from "./icons.js";
import { initInteractions } from "./main.js";
import { initMotion } from "./motion.js";

mountChrome();
mountMarks();
mountIcons();
initInteractions();
initMotion();
