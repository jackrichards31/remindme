import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, FROM_ADDRESS } from "@/lib/resend";
import type { Reminder } from "@/lib/types";
import BirthdayEmail from "@/emails/BirthdayEmail";
import AnniversaryEmail from "@/emails/AnniversaryEmail";
import GenericReminderEmail from "@/emails/GenericReminderEmail";

// Triggered daily by Vercel Cron (see vercel.json). Vercel signs the request
// with CRON_SECRET as a bearer token automatically once that env var is set
// — this guards the route from being triggered by anyone else who finds it.
function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function renderEmail(reminder: Reminder) {
  const notes = reminder.notes;
  if (reminder.type === "birthday") {
    const age = reminder.year ? new Date().getUTCFullYear() - reminder.year : null;
    return BirthdayEmail({ label: reminder.label, age, notes });
  }
  if (reminder.type === "anniversary") {
    const years = reminder.year ? new Date().getUTCFullYear() - reminder.year : null;
    return AnniversaryEmail({ label: reminder.label, years, notes });
  }
  return GenericReminderEmail({ label: reminder.label, notes });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();

  const supabase = createAdminClient();
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("month", month)
    .eq("day", day);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    ((reminders as Reminder[]) ?? []).map((reminder) =>
      resend.emails.send({
        from: FROM_ADDRESS,
        to: reminder.recipient_email,
        subject: `Reminder: ${reminder.label}`,
        react: renderEmail(reminder),
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ checked: `${month}/${day}`, sent, failed });
}
