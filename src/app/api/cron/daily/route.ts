import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend, FROM_ADDRESS } from "@/lib/resend";
import { occursOn } from "@/lib/recurrence";
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
  const startYear = new Date(reminder.start_date).getUTCFullYear();
  const nowYear = new Date().getUTCFullYear();
  if (reminder.type === "birthday") {
    return BirthdayEmail({ label: reminder.label, age: nowYear - startYear, notes });
  }
  if (reminder.type === "anniversary") {
    return AnniversaryEmail({ label: reminder.label, years: nowYear - startYear, notes });
  }
  return GenericReminderEmail({ label: reminder.label, notes });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  // Recurrence (weekly/biweekly/monthly's day-of-month clamp) isn't a plain
  // column match, so every reminder gets fetched and checked in code rather
  // than filtered in the query — fine at personal scale, would need
  // reworking if this ever needed to scale to many thousands of reminders.
  const { data: reminders, error } = await supabase.from("reminders").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = new Date();
  const due = ((reminders as Reminder[]) ?? []).filter((r) => occursOn(r, today));

  const results = await Promise.allSettled(
    due.map((reminder) =>
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

  return NextResponse.json({ checked: due.length, sent, failed });
}
