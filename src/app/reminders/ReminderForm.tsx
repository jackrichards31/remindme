"use client";

import { useActionState, useRef, useEffect } from "react";
import { addReminder, type FormState } from "./actions";
import { RECURRENCE_OPTIONS, REMINDER_TYPES } from "@/lib/types";

const initialState: FormState = { status: "idle" };

export default function ReminderForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, formAction, isPending] = useActionState(addReminder, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "idle") formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] p-4 sm:grid-cols-2"
    >
      <select
        name="type"
        defaultValue="birthday"
        className="rounded-md border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm"
      >
        {REMINDER_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="label"
        required
        placeholder="e.g. Mom's birthday"
        className="rounded-md border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm"
      />

      <input
        type="date"
        name="date"
        required
        className="rounded-md border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm"
      />

      <select
        name="recurrence"
        defaultValue="yearly"
        aria-label="Repeats"
        className="rounded-md border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm"
      >
        {RECURRENCE_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>
            Repeats: {r.label}
          </option>
        ))}
      </select>

      <input
        type="email"
        name="recipient_email"
        required
        defaultValue={defaultEmail}
        placeholder="Reminder goes to"
        className="rounded-md border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm sm:col-span-2"
      />

      <input
        type="text"
        name="notes"
        placeholder="Notes (optional)"
        className="rounded-md border border-[var(--hairline)] bg-transparent px-3 py-2 text-sm sm:col-span-2"
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-2"
      >
        {isPending ? "Saving…" : "Add reminder"}
      </button>

      {state.status === "error" && (
        <p className="text-sm text-red-500 sm:col-span-2">{state.message}</p>
      )}
    </form>
  );
}
