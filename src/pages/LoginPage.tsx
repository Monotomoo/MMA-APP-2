import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

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

      <div aria-hidden="true" className="login-overlay" />
      <div aria-hidden="true" className="login-glow-line pointer-events-none" />
      <div aria-hidden="true" className="login-top-accent" />

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo + Title */}
        <div className="mb-10 flex flex-col items-center gap-5">
          <img
            src="/assets/hrvatski_mma_savez_logo.png"
            alt="Hrvatski MMA Savez"
            className="h-28 w-28 object-contain drop-shadow-[0_0_32px_rgba(200,0,0,0.6)]"
          />
          <div className="text-center space-y-1">
            <h1 className="login-title font-display font-black uppercase">
              Hrvatski MMA Savez
            </h1>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="h-px w-12 bg-primary/60" />
              <p className="text-sm font-display font-semibold tracking-[0.3em] uppercase text-primary">
                Pristup sustavu
              </p>
              <span className="h-px w-12 bg-primary/60" />
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="login-card rounded-xl border border-white/10 p-8 space-y-6">
          {/* Red top border accent */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                E-mail / Korisničko ime
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="fighter@mmaclub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base border-white/10 bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-150 placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Lozinka
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base border-white/10 bg-white/5 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-150"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              className="login-btn w-full h-13 text-base font-display font-black tracking-[0.2em] uppercase cursor-pointer transition-all duration-200"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Prijava u tijeku..." : "Prijavi se"}
            </Button>
          </form>

          {/* Dev hint */}
          <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/8 px-3 py-2">
            <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            <p className="text-[11px] text-muted-foreground/50">
              Demo pristup: <span className="font-mono text-muted-foreground/70">tomo / tomo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
