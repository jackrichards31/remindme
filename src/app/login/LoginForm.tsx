"use client";

import { useActionState } from "react";
import { sendMagicLink, type SendMagicLinkState } from "./actions";

const initialState: SendMagicLinkState = { status: "idle" };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <p className="text-sm text-[var(--ink-soft)]">
        Check your inbox for a sign-in link.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="rounded-md border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send magic link"}
      </button>
      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
    </form>
  );
}
