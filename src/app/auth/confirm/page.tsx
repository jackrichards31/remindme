import { redirect } from "next/navigation";
import { confirmSignIn } from "./actions";

// Deliberately requires a click (a POST via this form) rather than verifying
// on GET. Email security scanners (Outlook Safe Links, similar corporate
// link-scanners) automatically pre-fetch every link in an incoming email the
// moment it arrives — if verifying happened on GET, that automated fetch
// would silently consume the single-use token before the recipient ever
// opens the email. A plain link-fetch can't submit a form, so this can't be
// pre-consumed the same way.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const { token_hash, type, next } = await searchParams;

  if (!token_hash || !type) {
    redirect(`/login?error=${encodeURIComponent("Link expired or invalid - request a new one.")}`);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-1 font-display text-2xl font-medium">Confirm sign-in</h1>
        <p className="mb-6 text-sm text-[var(--ink-soft)]">
          One more click to finish signing in.
        </p>
        <form action={confirmSignIn}>
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next ?? "/reminders"} />
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
