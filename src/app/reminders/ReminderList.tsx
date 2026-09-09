"use client";

import { useTransition } from "react";
import { deleteReminder } from "./actions";
import type { Reminder } from "@/lib/types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function ReminderList({ reminders }: { reminders: Reminder[] }) {
  const [isPending, startTransition] = useTransition();

  if (reminders.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-soft)]">
        No reminders yet — add your first one above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--hairline)]">
      {reminders.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-sm font-medium">{r.label}</p>
            <p className="text-xs text-[var(--ink-soft)]">
              {MONTH_NAMES[r.month - 1]} {r.day}
              {r.year ? `, ${r.year}` : ""} · {r.recipient_email}
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
