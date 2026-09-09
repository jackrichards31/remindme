"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReminderType } from "@/lib/types";

export type FormState = { status: "idle" | "error"; message?: string };

export async function addReminder(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Not signed in." };

  const date = String(formData.get("date") ?? "");
  const [yearStr, monthStr, dayStr] = date.split("-");
  if (!yearStr || !monthStr || !dayStr) {
    return { status: "error", message: "Pick a date." };
  }

  const label = String(formData.get("label") ?? "").trim();
  const recipientEmail = String(formData.get("recipient_email") ?? "").trim();
  if (!label || !recipientEmail) {
    return { status: "error", message: "Label and recipient email are required." };
  }

  const { error } = await supabase.from("reminders").insert({
    user_id: user.id,
    type: String(formData.get("type") ?? "custom") as ReminderType,
    label,
    month: Number(monthStr),
    day: Number(dayStr),
    year: Number(yearStr),
    recipient_email: recipientEmail,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/reminders");
  return { status: "idle" };
}

export async function deleteReminder(id: string) {
  const supabase = await createClient();
  await supabase.from("reminders").delete().eq("id", id);
  revalidatePath("/reminders");
}
