import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/reminders");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="max-w-md font-display text-3xl font-medium leading-tight">
        Never miss the date that matters.
      </h1>
      <p className="max-w-sm text-[var(--ink-soft)]">
        Birthdays, anniversaries, whatever else you don&apos;t want to forget —
        add it once, get an email every year.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
      >
        Get started
      </Link>
    </div>
  );
}
