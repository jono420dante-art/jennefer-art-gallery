import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { rememberAdminPortalReturn } from "@/lib/adminPortalReturn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AdminPortalGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminUser");
  }, []);

  const beginSignIn = () => {
    rememberAdminPortalReturn(`${window.location.pathname}${window.location.search}`);
    setLocation("/admin-login");
  };

  if (loading) {
    return <div className="grid min-h-[70vh] place-items-center text-muted-foreground">Verifying secure administrator session…</div>;
  }

  if (!user) {
    return <AdminSignInPanel onSignIn={beginSignIn} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4">
        <Card className="max-w-lg border-destructive/30 bg-card p-8 text-center">
          <LockKeyhole className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Administrator access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">You are signed in, but this account is not assigned the Administrator role.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/")}>Return home</Button>
            <Button variant="destructive" onClick={() => logout().then(() => setLocation("/"))}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminSignInPanel({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-10">
      <Card role="dialog" aria-modal="true" aria-labelledby="admin-signin-title" className="w-full max-w-md border-primary/30 bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary"><ShieldCheck className="h-7 w-7" /></div>
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-primary">JENNEFER ANN / ADMIN PORTAL</p>
        <h1 id="admin-signin-title" className="text-3xl font-bold text-foreground">Secure sign-in required</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Artwork management, customer leads, SEO controls, analytics, and reports are restricted to verified administrator accounts.</p>
        <Button size="lg" className="mt-7 w-full" onClick={onSignIn}><LockKeyhole className="mr-2 h-4 w-4" />Open Administrator sign in</Button>
        <p className="mt-4 text-xs text-muted-foreground">Use your Administrator username and password. Access is verified by an encrypted server session; browser storage cannot unlock this portal.</p>
      </Card>
    </div>
  );
}
