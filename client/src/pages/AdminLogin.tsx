import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple credential check (in production, use proper authentication)
      if (username === "Grant444" && password === "RARE333") {
        // Store admin session
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminUser", username);
        toast.success("Admin login successful!");
        setLocation("/admin");
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center pt-20 pb-20">
      <div className="container max-w-md">
        <Card className="p-8 border-border bg-card">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Lock className="text-primary" size={40} />
            </div>
            <h1 className="heading-font text-4xl gradient-text mb-2">
              ADMIN LOGIN
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access the admin panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted border-border"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-border"
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Protected admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
