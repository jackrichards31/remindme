export type ReminderType = "birthday" | "anniversary" | "custom";
export type RecurrenceType = "none" | "weekly" | "biweekly" | "monthly" | "yearly";

export type Reminder = {
  id: string;
  user_id: string;
  type: ReminderType;
  label: string;
  start_date: string; // "YYYY-MM-DD"
  recurrence: RecurrenceType;
  recipient_email: string;
  notes: string | null;
  created_at: string;
};

export const REMINDER_TYPES: { value: ReminderType; label: string }[] = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "custom", label: "Custom" },
];

export const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "yearly", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "none", label: "Never (one-time)" },
];
