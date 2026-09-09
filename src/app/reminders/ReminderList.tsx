"use client";

import { useTransition } from "react";
import { deleteReminder } from "./actions";
import { nextOccurrence } from "@/lib/recurrence";
import type { Reminder, RecurrenceType } from "@/lib/types";

const RECURRENCE_LABEL: Record<RecurrenceType, string> = {
  none: "One-time",
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function formatUpcoming(dateStr: string | null): string {
  if (!dateStr) return "Already occurred";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function ReminderList({ reminders }: { reminders: Reminder[] }) {
  const [isPending, startTransition] = useTransition();

  if (reminders.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-soft)]">
        No reminders yet — add your first one above.
      </p>
    );
  }

  // Upcoming order — soonest next occurrence first. A one-time reminder
  // whose date has already passed has no next occurrence, so it sorts last.
  const sorted = [...reminders].sort((a, b) => {
    const na = nextOccurrence(a);
    const nb = nextOccurrence(b);
    if (na === null && nb === null) return 0;
    if (na === null) return 1;
    if (nb === null) return -1;
    return na.localeCompare(nb);
  });

  return (
    <ul className="flex flex-col divide-y divide-[var(--hairline)]">
      {sorted.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-medium">{r.label}</p>
            <p className="text-xs text-[var(--ink-soft)]">
              {formatUpcoming(nextOccurrence(r))} · {RECURRENCE_LABEL[r.recurrence]} ·{" "}
              {r.recipient_email}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => deleteReminder(r.id))}
            className="text-xs text-[var(--ink-soft)] hover:text-red-500 disabled:opacity-60"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
