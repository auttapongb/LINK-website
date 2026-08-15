export type WakeKind = "status" | "brief" | "share" | "remind" | "help";

const WAKE = /#ขบวน|#convoy|ขบวน|mcg\s*convoy/i;

/** Keyword-only, like ขุนทอง. Anything else is silence. */
export function parseWake(text: string): WakeKind | null {
  const t = text.trim();
  if (!t || !WAKE.test(t)) return null;
  if (/บรีฟ|brief|ด่าน|toll|easy\s*pass/i.test(t)) return "brief";
  if (/เตือน|remind/i.test(t)) return "remind";
  if (/แชร์|share|เชิญ|invite/i.test(t)) return "share";
  if (/สถานะ|status|ถึงไหน/i.test(t)) return "status";
  return "help";
}

export const WAKE_PHRASE = "#ขบวน";
