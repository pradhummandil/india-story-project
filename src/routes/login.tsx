import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — India Story Project" },
      { name: "description", content: "Sign in to your India Story Project account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      const role = profile.role?.toLowerCase();
      if (role === "admin") {
        void navigate({ to: "/admin" });
      } else if (role === "editor") {
        void navigate({ to: "/editor" });
      } else if (role === "author") {
        void navigate({ to: "/dashboard" });
      } else {
        void navigate({ to: "/" });
      }
    }
  }, [user, profile, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — cinematic editorial image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <img
          src="https://i.pinimg.com/736x/79/dd/35/79dd35c9bb8c81217aac32843621ccc3.jpg"
          alt="India"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-16 text-white">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <img
              src="Logo-ISP.jpg"
              alt="ISP"
              className="size-10 rounded-full border border-white/20"
            />
            <span className="font-display text-2xl font-bold">
              <span className="text-primary">India</span> Story Project
            </span>
          </Link>
          <blockquote className="font-display text-4xl font-bold leading-tight text-white/95 mb-6">
            "Every story connects India."
          </blockquote>
          <p className="text-sm text-white/60 font-sans leading-relaxed max-w-sm">
            A premium storytelling platform celebrating changemakers, innovators, and unsung heroes
            shaping modern India.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-12 lg:hidden">
          <img
            src="Logo-ISP.jpg"
            alt="ISP"
            className="size-8 rounded-full border border-border"
          />
          <span className="font-display text-xl font-bold">
            <span className="text-primary">India</span> Story Project
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-10 font-sans">
            Sign in to continue reading India's stories.
          </p>

          {/* Google OAuth */}
          <Button
            id="google-signin-btn"
            type="button"
            variant="outline"
            className="w-full h-12 rounded-full border-border font-sans text-sm font-medium mb-6 gap-3 hover:border-gold/50 hover:bg-white/5 text-foreground transition-all duration-300"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="size-4" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-4 text-muted-foreground uppercase tracking-widest">
                or
              </span>
            </div>
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2 cursor-pointer"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-12 rounded-lg border-border bg-background font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-sans text-primary hover:text-gold transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 rounded-lg border-border bg-background font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive font-sans bg-destructive/8 border border-destructive/20 px-3 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <Button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.2em] text-xs btn-premium mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-sans mt-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-gold font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
