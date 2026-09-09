import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReminderForm from "./ReminderForm";
import ReminderList from "./ReminderList";
import type { Reminder } from "@/lib/types";

export default async function RemindersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reminders } = await supabase.from("reminders").select("*");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl font-medium">Your reminders</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          Emailed to you the morning of, on whatever schedule you set.
        </p>
      </div>
      <ReminderForm defaultEmail={user.email ?? ""} />
      <ReminderList reminders={(reminders as Reminder[]) ?? []} />
    </div>
  );
}
