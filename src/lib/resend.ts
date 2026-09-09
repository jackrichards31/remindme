import { Resend } from "resend";

// Falls back to a placeholder so module evaluation (and `next build`, which
// imports this at the top of the cron route) doesn't throw when the real
// key isn't set yet — actual sends still fail loudly against Resend's API
// if it's never replaced.
export const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_unset");

// Update this once you've verified a domain in Resend — until then Resend
// only allows sending from onboarding@resend.dev.
export const FROM_ADDRESS = process.env.REMINDER_FROM_ADDRESS ?? "RemindMe <onboarding@resend.dev>";
