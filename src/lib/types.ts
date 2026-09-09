export type ReminderType = "birthday" | "anniversary" | "custom";

export type Reminder = {
  id: string;
  user_id: string;
  type: ReminderType;
  label: string;
  month: number; // 1-12
  day: number; // 1-31
  year: number | null; // optional — lets birthdays show "turns 30"
  recipient_email: string;
  notes: string | null;
  created_at: string;
};

export const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "custom", label: "Custom" },
];
