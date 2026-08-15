const KEY = "mcg.oa.reminders";

export type TripReminder = {
  tripId: string;
  fireAt: string;
  createdAt: string;
};

function readAll(): TripReminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TripReminder[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: TripReminder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

/** Nag 30 minutes before target — the bot, not the organizer. */
export function scheduleT30(
  tripId: string,
  targetArrivalAt: string,
): TripReminder {
  const target = new Date(targetArrivalAt).getTime();
  const preferred = target - 30 * 60_000;
  const fireAt = new Date(Math.max(Date.now() + 15_000, preferred)).toISOString();
  const next: TripReminder = {
    tripId,
    fireAt,
    createdAt: new Date().toISOString(),
  };
  writeAll([...readAll().filter((r) => r.tripId !== tripId), next]);
  return next;
}

export function getReminder(tripId: string): TripReminder | null {
  return readAll().find((r) => r.tripId === tripId) ?? null;
}
