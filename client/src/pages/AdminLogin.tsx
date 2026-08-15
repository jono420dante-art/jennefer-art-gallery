import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { consumeAdminPortalReturn } from "@/lib/adminPortalReturn";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = trpc.auth.nativeAdminLogin.useMutation({
    onSuccess: (result) => {
      utils.auth.me.setData(undefined, result.user);
      toast.success("Administrator access granted");
      setLocation(consumeAdminPortalReturn() ?? "/admin-dashboard");
    },
    onError: () => toast.error("Incorrect Administrator username or password"),
  });
  useEffect(() => {
    if (user?.role === "admin") setLocation("/admin-dashboard");
  }, [setLocation, user?.role]);

  if (loading) return <div className="grid min-h-[70vh] place-items-center text-muted-foreground">Checking your secure session…</div>;
  if (user?.role === "admin") return <div className="grid min-h-[70vh] place-items-center text-muted-foreground">Opening Admin Portal…</div>;
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-10">
      <Card className="w-full max-w-md border-primary/30 bg-card p-7 text-center shadow-2xl sm:p-8">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary"><ShieldCheck className="h-7 w-7" /></div>
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-primary">JENNEFER ANN / ADMIN PORTAL</p>
        <h1 className="text-3xl font-bold text-foreground">Administrator sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter your Administrator credentials to open the protected gallery command centre.</p>
        <form className="mt-7 space-y-4 text-left" onSubmit={(event) => {
          event.preventDefault();
          login.mutate({ username, password });
        }}>
          <label className="block text-sm font-semibold text-foreground">Username
            <Input className="mt-2" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Administrator username" required />
          </label>
          <label className="block text-sm font-semibold text-foreground">Password
            <Input className="mt-2" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Administrator password" required />
          </label>
          <Button type="submit" size="lg" className="w-full" disabled={login.isPending}><LockKeyhole className="mr-2 h-4 w-4" />{login.isPending ? "Verifying secure access…" : "Sign in to Admin Portal"}</Button>
        </form>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">Credentials are checked on the server. This portal does not store your password in the browser.</p>
      </Card>
    </div>
  );
}
