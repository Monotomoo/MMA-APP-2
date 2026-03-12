import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Shield } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      navigate("/app/dashboard");
      return;
    }

    // Dev bypass: tomo / tomo gets in as admin
    if (email === "tomo" && password === "tomo") {
      localStorage.setItem("dev_bypass_admin", "true");
      navigate("/app/dashboard");
      return;
    }

    setLoading(false);
    setError("Pogrešni podaci. Pokušajte: tomo / tomo");
  };

  return (
    <div className="login-bg relative flex min-h-screen items-center justify-center p-4 overflow-hidden">

      <div aria-hidden="true" className="login-glow-line pointer-events-none" />

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow-primary-strong animate-pulse-glow">
            <Flame className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="shimmer-text font-display text-5xl font-black tracking-widest uppercase">
              Antigravity
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
              MMA Savez &mdash; Prijava
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-glow-primary space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
                E-mail / korisničko ime
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="fighter@mmaclub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border/60 bg-secondary/50 focus:border-primary focus:ring-primary/20 transition-colors duration-150"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">
                Lozinka
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-border/60 bg-secondary/50 focus:border-primary focus:ring-primary/20 transition-colors duration-150"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              className="w-full bg-primary hover:bg-primary/90 shadow-glow-primary hover:shadow-glow-primary-strong transition-all duration-200 cursor-pointer font-display tracking-widest text-base uppercase"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Prijava..." : "Prijavi se"}
            </Button>
          </form>

          {/* Dev hint */}
          <div className="flex items-center gap-2 rounded-lg bg-secondary/50 border border-border/40 px-3 py-2">
            <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <p className="text-[11px] text-muted-foreground/60">
              Dev pristup: <span className="font-mono text-muted-foreground">tomo / tomo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
