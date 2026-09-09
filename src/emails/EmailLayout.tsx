import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";

const ACCENT = "#e0662f";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#fbfaf8", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "32px 24px", maxWidth: "480px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px", border: "1px solid #e6e2db" }}>
            {children}
          </Section>
          <Text style={{ color: "#9c968c", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
            Sent by RemindMe — because you asked to be reminded.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  eyebrow: { color: ACCENT, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" as const, margin: "0 0 8px" },
  heading: { fontSize: "24px", fontWeight: 600, margin: "0 0 12px", color: "#201d1a" },
  body: { fontSize: "15px", lineHeight: "1.6", color: "#6b6660", margin: 0 },
};
