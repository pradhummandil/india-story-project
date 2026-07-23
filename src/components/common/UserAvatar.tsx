import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const GRADIENTS = [
  "from-amber-600 via-saffron to-gold",
  "from-red-900 via-burgundy to-rose-950",
  "from-indigo-900 via-purple-800 to-slate-900",
  "from-emerald-800 via-teal-700 to-cyan-900",
  "from-orange-800 via-amber-700 to-yellow-900",
  "from-blue-900 via-sky-800 to-slate-900",
];

export function UserAvatar({
  src,
  name,
  email,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const displayName = name || email?.split("@")[0] || "User";
  
  // Calculate initials
  const parts = displayName.trim().split(/\s+/);
  let initials = "";
  if (parts.length >= 2 && parts[0] && parts[1]) {
    initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length > 0 && parts[0]) {
    initials = parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  } else {
    initials = "U";
  }

  // Deterministic gradient selection
  let charSum = 0;
  for (let i = 0; i < displayName.length; i++) {
    charSum += displayName.charCodeAt(i);
  }
  const gradientClass = GRADIENTS[charSum % GRADIENTS.length];

  const sizeClasses = {
    xs: "size-6 text-[10px]",
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
    xl: "size-16 text-xl",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (src && !imgError) {
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full border border-border/40 overflow-hidden bg-card shadow-sm ${currentSizeClass} ${className}`}
      >
        <img
          src={src}
          alt={displayName}
          onError={() => setImgError(true)}
          className="size-full object-cover transition-transform hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br ${gradientClass} text-white font-display font-bold tracking-wider shadow-md select-none ${currentSizeClass} ${className}`}
      title={displayName}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <User className="size-1/2 text-white/80" />
      )}
    </div>
  );
}
