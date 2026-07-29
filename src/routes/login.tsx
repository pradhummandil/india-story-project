import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";
import { useAuthStore } from "@/lib/auth-store";
import signinVideo from "@/assets/stories/Indiasignin.mp4";
import signinVideo2 from "@/assets/stories/Indiasignin2.mp4";

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
    <div className="h-screen max-h-screen w-full flex bg-black overflow-hidden font-sans">
      {/* Left panel — Indiasignin.mp4 9:16 aspect ratio video */}
      <div className="hidden lg:flex lg:w-[calc(100vh*9/16)] xl:w-[calc(100vh*9/16)] max-w-[45vw] h-full relative overflow-hidden bg-black shrink-0">
        <video
          src={signinVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-10" />

        {/* Brand logo top overlay */}
        <div className="absolute top-5 left-5 xl:top-6 xl:left-6 z-30">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/Logo-ISP.jpg"
              alt="ISP"
              className="size-8 rounded-full border-2 border-white/40 shadow-lg object-cover"
            />
            <span className="font-display text-lg font-bold tracking-tight text-white drop-shadow-md">
              <span className="text-primary">India</span> Story Project
            </span>
          </Link>
        </div>

        {/* Tagline overlay at bottom */}
        <div className="absolute bottom-5 left-5 right-5 z-30 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-sans font-semibold text-white shadow-sm mb-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            India's Premiere Storytelling Hub
          </div>
          <p className="font-display text-lg font-bold text-white drop-shadow-lg leading-tight">
            "Every story connects India."
          </p>
        </div>
      </div>

      {/* Right panel — Indiasignin2.mp4 video background + Centered White Form Card */}
      <div className="flex-1 h-full relative overflow-hidden bg-black flex flex-col items-center justify-center p-6 lg:p-8">
        {/* Right side video — Indiasignin2.mp4 */}
        <video
          src={signinVideo2}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 pointer-events-none z-10" />

        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-6 lg:hidden shrink-0 relative z-20">
          <img
            src="/Logo-ISP.jpg"
            alt="ISP"
            className="size-8 rounded-full border border-white/20"
          />
          <span className="font-display text-xl font-bold text-white">
            <span className="text-primary">India</span> Story Project
          </span>
        </Link>

        {/* Form Card Box on the Right — White Box with Black Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 w-full max-w-md my-auto backdrop-blur-xl bg-[#FBF8F3]/95 text-foreground border border-white/50 shadow-2xl rounded-3xl p-7 sm:p-9"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 font-sans">
            Sign in to continue reading India's stories.
          </p>

          {/* Google OAuth */}
          <Button
            id="google-signin-btn"
            type="button"
            variant="outline"
            className="w-full h-11 rounded-full border-border bg-white font-sans text-xs font-semibold mb-4 gap-3 hover:border-primary/50 hover:bg-stone-50 text-foreground transition-all duration-300 shadow-xs"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="size-4 text-primary" />
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-[#FBF8F3] px-3 text-muted-foreground uppercase font-bold tracking-widest">
                or
              </span>
            </div>
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-1 cursor-pointer"
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
                  className="pl-10 h-11 rounded-xl border-border bg-white text-foreground placeholder:text-muted-foreground font-sans text-sm focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground cursor-pointer"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-sans text-primary hover:text-primary/80 font-semibold transition-colors"
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
                  className="pl-10 pr-10 h-11 rounded-xl border-border bg-white text-foreground placeholder:text-muted-foreground font-sans text-sm focus:ring-1 focus:ring-primary"
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
                className="text-xs text-destructive font-sans bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <Button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-white font-sans uppercase tracking-widest text-xs font-bold shadow-md cursor-pointer mt-1"
            >
              {loading ? "Signing in…" : "Sign In"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-sans mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-bold transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
