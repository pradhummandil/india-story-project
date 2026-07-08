import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [{ title: "Verify Email — India Story Project" }],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <Mail className="size-10 text-primary" />
        </div>

        <h1 className="font-display text-4xl font-bold text-foreground mb-4">Check your email</h1>

        <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-8">
          We've sent you a verification link. Click it to activate your account and start reading
          India's stories.
        </p>

        <div className="border border-border/60 bg-card p-6 text-left space-y-3 mb-8">
          {[
            "Open your email inbox",
            "Find the email from India Story Project",
            'Click the "Verify Email" link',
            "You'll be redirected back automatically",
          ].map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <div className="size-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground font-sans">{step}</p>
            </div>
          ))}
        </div>

        <CheckCircle className="size-5 text-primary mx-auto mb-3" />
        <p className="text-xs text-muted-foreground font-sans mb-6">
          Didn't receive the email? Check your spam folder.
        </p>

        <Link
          to="/login"
          className="text-sm text-primary hover:text-gold font-semibold font-sans transition-colors"
        >
          Return to sign in →
        </Link>
      </motion.div>
    </div>
  );
}
