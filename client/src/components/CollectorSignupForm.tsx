import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAnalytics } from "@/hooks/useAnalytics";

type CollectorSignupFormProps = {
  placement: "footer" | "home";
};

export function CollectorSignupForm({ placement }: CollectorSignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { trackEvent } = useAnalytics();
  const signup = trpc.newsletter.signup.useMutation();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!hasConsent) return setError("Please confirm that you would like collector updates.");

    try {
      await signup.mutateAsync({
        firstName: firstName.trim(),
        lastName: "",
        email: email.trim(),
        consent: true,
      });
      trackEvent("click_newsletter", `${placement}_collector_signup`);
      setSuccess(true);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "We could not save your place on the collector list.";
      setError(message.includes("already subscribed") ? "You are already on the collector list." : "We could not save your place on the collector list. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
        <CheckCircle2 className="mr-2 inline h-4 w-4" /> You are on Jennefer’s collector list.
      </div>
    );
  }

  const isFooter = placement === "footer";
  return (
    <form onSubmit={submit} className={isFooter ? "space-y-3" : "space-y-4"} noValidate>
      <div className={isFooter ? "grid gap-3 sm:grid-cols-[0.7fr_1.3fr_auto]" : "grid gap-3 sm:grid-cols-[0.7fr_1.3fr]"}>
        <label className="sr-only" htmlFor={`${placement}-collector-first-name`}>First name</label>
        <input
          id={`${placement}-collector-first-name`}
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          autoComplete="given-name"
          placeholder="First name (optional)"
          disabled={signup.isPending}
          className="min-h-11 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
        />
        <label className="sr-only" htmlFor={`${placement}-collector-email`}>Email address</label>
        <input
          id={`${placement}-collector-email`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="Email address"
          required
          disabled={signup.isPending}
          className="min-h-11 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
        />
        {isFooter && (
          <button type="submit" disabled={signup.isPending} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
            {signup.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Join"}
          </button>
        )}
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} disabled={signup.isPending} className="mt-1 h-3.5 w-3.5 accent-primary" />
        <span>I would like occasional updates on new artworks, commissions, exhibitions, and special conservation releases.</span>
      </label>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {!isFooter && (
        <button type="submit" disabled={signup.isPending} className="min-h-12 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          {signup.isPending ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving your place…</span> : "Join the collector list"}
        </button>
      )}
    </form>
  );
}
