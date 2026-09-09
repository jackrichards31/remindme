import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

const poppins = Poppins({
  variable: "--font-display",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RemindMe",
  description: "Never miss a birthday, anniversary, or the date that matters.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <nav className="flex items-center justify-between border-b border-[var(--hairline)] px-6 py-4">
          <Link href="/" className="font-display text-lg font-medium">
            RemindMe
          </Link>
          {user ? (
            <form action={signOut}>
              <button type="submit" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">
              Sign in
            </Link>
          )}
        </nav>
        {children}
      </body>
    </html>
  );
}
