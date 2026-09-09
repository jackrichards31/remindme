import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./EmailLayout";

export type BirthdayEmailProps = {
  label: string;
  age: number | null;
  notes: string | null;
};

export default function BirthdayEmail({ label, age, notes }: BirthdayEmailProps) {
  return (
    <EmailLayout preview={`Today's the day: ${label}`}>
      <Text style={emailStyles.eyebrow}>Birthday reminder</Text>
      <Text style={emailStyles.heading}>
        {label}
        {age !== null ? ` turns ${age} today` : " — today's the day"}
      </Text>
      <Text style={emailStyles.body}>
        {notes || "Don't forget to send a message today."}
      </Text>
    </EmailLayout>
  );
}
