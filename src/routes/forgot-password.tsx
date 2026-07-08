import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Reset Password — India Story Project" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <Link
        to="/login"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-sans mb-12 self-start max-w-sm w-full mx-auto transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="size-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Check your inbox
            </h1>
            <p className="text-sm text-muted-foreground font-sans mb-8">
              We've sent a password reset link to{" "}
              <span className="text-foreground font-medium">{email}</span>. Check your spam folder
              if you don't see it.
            </p>
            <Link
              to="/login"
              className="text-sm text-primary hover:text-gold font-semibold font-sans transition-colors"
            >
              Return to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Forgot password?
            </h1>
            <p className="text-sm text-muted-foreground mb-10 font-sans">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="forgot-password-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 h-12 rounded-none border-border bg-background font-sans"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive font-sans bg-destructive/8 border border-destructive/20 px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                id="forgot-password-submit"
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.2em] text-xs btn-premium"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
