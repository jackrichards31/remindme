import { Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./EmailLayout";

export type AnniversaryEmailProps = {
  label: string;
  years: number | null;
  notes: string | null;
};

export default function AnniversaryEmail({ label, years, notes }: AnniversaryEmailProps) {
  return (
    <EmailLayout preview={`Today's the day: ${label}`}>
      <Text style={emailStyles.eyebrow}>Anniversary reminder</Text>
      <Text style={emailStyles.heading}>
        {label}
        {years !== null ? ` — ${years} year${years === 1 ? "" : "s"} today` : " — today's the day"}
      </Text>
      <Text style={emailStyles.body}>
        {notes || "Today's the day — don't let it slip by."}
      </Text>
    </EmailLayout>
  );
}
