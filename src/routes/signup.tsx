import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";
import signupVideo from "@/assets/stories/Indiasignup.mp4";

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
    <div className="h-screen max-h-screen w-full relative overflow-hidden bg-black flex flex-col justify-between font-sans p-5 sm:p-8 xl:p-10 max-w-7xl mx-auto">
      {/* 16:9 Full-Screen Video Background — object-cover fills 100% of viewport with ZERO gaps */}
      <video
        src={signupVideo}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
      />
      <div className="fixed inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/40 pointer-events-none z-0" />

      {/* Header Logo */}
      <header className="relative z-10 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/Logo-ISP.jpg"
            alt="ISP"
            className="size-10 rounded-full border-2 border-white/40 shadow-lg object-cover group-hover:scale-105 transition-transform"
          />
          <span className="font-display text-xl font-bold tracking-tight text-white drop-shadow-md">
            <span className="text-primary">India</span> Story Project
          </span>
        </Link>
      </header>

      {/* Content Layout — Split Hero & Glassmorphic Form Card */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center my-auto overflow-y-auto max-h-[calc(100vh-120px)]">
        {/* Left Hero Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 space-y-4 text-white text-left hidden lg:block"
        >
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-primary/80 backdrop-blur-md border border-primary/30 text-[11px] font-sans font-bold uppercase tracking-wider shadow-md">
            ✨ Discover Untold Stories
          </div>
          <h1 className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight text-white drop-shadow-xl">
            Join 50,000+ readers discovering India's untold stories.
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed max-w-xl">
            Free access to 422+ curated stories of changemakers, innovators, and unsung heroes across India.
          </p>
        </motion.div>

        {/* Right Floating Glassmorphic Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 w-full max-w-sm mx-auto lg:ml-auto"
        >
          <div className="backdrop-blur-xl bg-[#FBF8F3]/95 text-foreground border border-white/50 shadow-2xl rounded-2xl p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">Create account</h2>
            <p className="text-xs text-muted-foreground mb-4 font-sans">
              Access premium stories and contribute your own.
            </p>

            {/* Google OAuth */}
            <Button
              id="google-signup-btn"
              type="button"
              variant="outline"
              className="w-full h-10 rounded-full border-border font-sans text-xs font-semibold mb-3.5 gap-3 hover:border-primary/50 hover:bg-black/5 text-foreground transition-all duration-300 shadow-xs"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <Chrome className="size-4 text-primary" />
              Continue with Google
            </Button>

            <div className="relative mb-3.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-[#FBF8F3] px-3 text-muted-foreground uppercase font-bold tracking-widest">
                  or
                </span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-1 cursor-pointer"
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
                    className="pl-10 h-10 rounded-xl border-border bg-white font-sans text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-1 cursor-pointer"
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
                    className="pl-10 h-10 rounded-xl border-border bg-white font-sans text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-1 cursor-pointer"
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
                    className="pl-10 pr-10 h-10 rounded-xl border-border bg-white font-sans text-xs focus:ring-1 focus:ring-primary"
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
                  className="text-xs text-destructive font-sans bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              <p className="text-[10px] text-muted-foreground font-sans leading-tight">
                By creating an account, you agree to our{" "}
                <span className="text-primary font-semibold">Terms</span> and{" "}
                <span className="text-primary font-semibold">Privacy Policy</span>.
              </p>

              <Button
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-full bg-primary hover:bg-primary/90 text-white font-sans uppercase tracking-widest text-xs font-bold shadow-md cursor-pointer mt-1"
              >
                {loading ? "Creating account…" : "Create Account"}
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground font-sans mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-bold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-[10px] text-white/50 font-sans shrink-0">
        © {new Date().getFullYear()} India Story Project. All rights reserved.
      </footer>
    </div>
  );
}
