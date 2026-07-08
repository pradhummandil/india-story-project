import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Forbidden403() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="text-center max-w-md">
        <ShieldAlert className="size-16 text-primary mx-auto mb-6 animate-bounce" />
        <h1 className="font-display text-4xl font-bold mb-4 tracking-tight">403 — Access Denied</h1>
        <p className="text-sm font-sans text-white/60 mb-8 leading-relaxed">
          You do not have the required permissions to view this section. If you believe this is an
          error, please contact your administrator.
        </p>
        <Link to="/">
          <Button className="h-12 px-8 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.2em] text-xs btn-premium">
            Back to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
