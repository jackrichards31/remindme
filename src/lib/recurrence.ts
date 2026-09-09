import type { RecurrenceType } from "./types";

export type OccurrenceInput = {
  start_date: string; // "YYYY-MM-DD"
  recurrence: RecurrenceType;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysInMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

// If the start day doesn't exist in the target month (e.g. day 31 in a
// 30-day month, or day 29 in a non-leap February), land on that month's
// last day instead — so a reminder set for "the last day of the month"
// keeps landing there every month, and one set for the 30th quietly
// becomes the 28th/29th in February rather than erroring or skipping.
function clampedMonthDate(year: number, month1to12: number, day: number): Date {
  const clampedDay = Math.min(day, daysInMonth(year, month1to12));
  return new Date(Date.UTC(year, month1to12 - 1, clampedDay));
}

/**
 * The next date (inclusive of `from`) this reminder occurs on, as
 * "YYYY-MM-DD" in UTC. Returns null for a one-time reminder whose date has
 * already passed — it has no more occurrences.
 */
export function nextOccurrence(input: OccurrenceInput, from: Date = new Date()): string | null {
  const today = startOfDay(from);
  const start = parseDate(input.start_date);

  switch (input.recurrence) {
    case "none": {
      return start.getTime() >= today.getTime() ? formatDate(start) : null;
    }
    case "weekly":
    case "biweekly": {
      if (start.getTime() >= today.getTime()) return formatDate(start);
      const interval = input.recurrence === "weekly" ? 7 : 14;
      const daysSinceStart = Math.round((today.getTime() - start.getTime()) / MS_PER_DAY);
      const daysUntilNext = (interval - (daysSinceStart % interval)) % interval;
      return formatDate(new Date(today.getTime() + daysUntilNext * MS_PER_DAY));
    }
    case "monthly": {
      const day = start.getUTCDate();
      let year = today.getUTCFullYear();
      let month = today.getUTCMonth() + 1;
      // Walk forward at most 12 months to find the next occurrence — a
      // fixed bound so a bad input can't loop forever.
      for (let i = 0; i < 13; i++) {
        const candidate = clampedMonthDate(year, month, day);
        if (candidate.getTime() >= Math.max(today.getTime(), start.getTime())) {
          return formatDate(candidate);
        }
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
      return null;
    }
    case "yearly": {
      const month = start.getUTCMonth() + 1;
      const day = start.getUTCDate();
      const year = today.getUTCFullYear();
      let candidate = clampedMonthDate(year, month, day);
      if (candidate.getTime() < Math.max(today.getTime(), start.getTime())) {
        candidate = clampedMonthDate(year + 1, month, day);
      }
      return formatDate(candidate);
    }
  }
}

/** Whether this reminder fires on the given date. */
export function occursOn(input: OccurrenceInput, date: Date): boolean {
  return nextOccurrence(input, date) === formatDate(startOfDay(date));
}
