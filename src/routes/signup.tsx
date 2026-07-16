import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — India Story Project" },
      {
        name: "description",
        content: "Join India Story Project to access premium stories and contribute your own.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    void navigate({ to: "/verify-email" });
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <img
          src="https://i.pinimg.com/1200x/69/e9/93/69e993f15d25d967b7f77d73a1af4dca.jpg"
          alt="India stories"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
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
          <h2 className="font-display text-4xl font-bold leading-tight text-white/95 mb-4">
            Join 50,000+ readers discovering India's untold stories.
          </h2>
          <p className="text-sm text-white/60 font-sans leading-relaxed">
            Free access to 422+ curated stories of changemakers and innovators across India.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
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
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Create account</h1>
          <p className="text-sm text-muted-foreground mb-10 font-sans">
            Join India Story Project to access premium stories and contribute your own.
          </p>

          {/* Google OAuth */}
          <Button
            id="google-signup-btn"
            type="button"
            variant="outline"
            className="w-full h-12 rounded-full border-border font-sans text-sm font-medium mb-6 gap-3 hover:border-gold/50 hover:bg-white/5 text-foreground transition-all duration-300"
            onClick={handleGoogleSignup}
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2 cursor-pointer"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="pl-10 h-12 rounded-lg border-border bg-background font-sans"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2 cursor-pointer"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="signup-email"
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
              <label
                htmlFor="signup-password"
                className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2 cursor-pointer"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            <p className="text-xs text-muted-foreground font-sans">
              By creating an account, you agree to our{" "}
              <span className="text-primary">Terms of Service</span> and{" "}
              <span className="text-primary">Privacy Policy</span>.
            </p>

            <Button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.2em] text-xs btn-premium"
            >
              {loading ? "Creating account…" : "Create Account"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-sans mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-gold font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
