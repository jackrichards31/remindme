import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./EmailLayout";

export type GenericReminderEmailProps = {
  label: string;
  notes: string | null;
};

export default function GenericReminderEmail({ label, notes }: GenericReminderEmailProps) {
  return (
    <EmailLayout preview={`Reminder: ${label}`}>
      <Text style={emailStyles.eyebrow}>Reminder</Text>
      <Text style={emailStyles.heading}>{label}</Text>
      <Text style={emailStyles.body}>{notes || "Today's the day you asked to be reminded about."}</Text>
    </EmailLayout>
  );
}
