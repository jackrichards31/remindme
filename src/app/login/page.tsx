import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-2xl font-medium">Sign in</h1>
        <p className="mb-6 text-sm text-[var(--ink-soft)]">
          No password — we&apos;ll email you a link.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
