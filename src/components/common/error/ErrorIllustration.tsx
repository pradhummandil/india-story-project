import React from "react";
import { motion } from "framer-motion";

export type ErrorType = "404" | "offline" | "api" | "crash";

interface ErrorIllustrationProps {
  type?: ErrorType;
  className?: string;
}

export function ErrorIllustration({ type = "404", className = "w-36 h-36" }: ErrorIllustrationProps) {
  if (type === "offline") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Soft Gold Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C89A3D]/30 to-amber-500/10 rounded-full blur-2xl animate-pulse" />
        
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
          {/* Outer Connection Wave 1 */}
          <motion.path
            d="M 25 75 A 45 45 0 0 1 95 75"
            stroke="#C89A3D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4 4"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Outer Connection Wave 2 */}
          <motion.path
            d="M 35 65 A 32 32 0 0 1 85 65"
            stroke="#A50000"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          {/* Central Animated Cloud */}
          <motion.path
            d="M 40 70 C 32 70 26 64 26 56 C 26 49 31 43 38 42 C 41 33 50 27 60 27 C 72 27 82 35 84 46 C 91 47 96 53 96 60 C 96 68 89 74 81 74 L 40 74 Z"
            fill="url(#cloudGrad)"
            stroke="#C89A3D"
            strokeWidth="2"
            initial={{ y: 0 }}
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Signal Disconnection Mark */}
          <motion.path
            d="M 52 52 L 68 68 M 68 52 L 52 68"
            stroke="#A50000"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <defs>
            <linearGradient id="cloudGrad" x1="26" y1="27" x2="96" y2="74" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFDF9" />
              <stop offset="1" stopColor="#F5ECE0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === "api") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#A50000]/20 to-[#C89A3D]/20 rounded-full blur-2xl animate-pulse" />
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
          {/* Ancient Scroll / Archival Vault */}
          <motion.rect
            x="30"
            y="25"
            width="60"
            height="70"
            rx="6"
            fill="url(#scrollGrad)"
            stroke="#C89A3D"
            strokeWidth="2.5"
            initial={{ y: 0 }}
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Scroll Text Lines */}
          <line x1="42" y1="42" x2="78" y2="42" stroke="#C89A3D" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="42" y1="54" x2="70" y2="54" stroke="#C89A3D" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="42" y1="66" x2="74" y2="66" stroke="#A50000" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          
          {/* Glowing Archival Shield / Seal */}
          <motion.circle
            cx="60"
            cy="80"
            r="12"
            fill="#A50000"
            stroke="#C89A3D"
            strokeWidth="2"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <path d="M 56 80 L 64 80" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          
          <defs>
            <linearGradient id="scrollGrad" x1="30" y1="25" x2="90" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFDF9" />
              <stop offset="1" stopColor="#F3E7D3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === "crash") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#A50000]/25 to-amber-600/20 rounded-full blur-2xl animate-pulse" />
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
          {/* Open Heritage Book */}
          <path
            d="M 20 75 Q 40 70 60 77 Q 80 70 100 75 L 100 35 Q 80 30 60 37 Q 40 30 20 35 Z"
            fill="url(#bookGrad)"
            stroke="#C89A3D"
            strokeWidth="2"
          />
          <path d="M 60 37 L 60 77" stroke="#C89A3D" strokeWidth="2" strokeDasharray="2 2" />

          {/* Floating Ink Feather Pen */}
          <motion.g
            initial={{ rotate: 0, y: 0 }}
            animate={{ rotate: [-6, 6, -6], y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M 72 25 C 80 15 90 20 92 30 C 84 32 78 38 72 48 L 65 62 L 62 55 Z"
              fill="#A50000"
              stroke="#C89A3D"
              strokeWidth="1.5"
            />
            <path d="M 65 62 L 58 70" stroke="#111" strokeWidth="2" strokeLinecap="round" />
          </motion.g>

          <defs>
            <linearGradient id="bookGrad" x1="20" y1="30" x2="100" y2="77" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFDF9" />
              <stop offset="1" stopColor="#F1E3CD" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Default: 404 Lost Manuscript & Compass
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#C89A3D]/30 via-amber-400/10 to-transparent rounded-full blur-2xl animate-pulse" />

      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
        {/* Ancient Parchment Scroll Base */}
        <motion.rect
          x="28"
          y="28"
          width="64"
          height="64"
          rx="8"
          fill="url(#parchmentGrad)"
          stroke="#C89A3D"
          strokeWidth="2.5"
          initial={{ rotate: -4 }}
          animate={{ rotate: [-4, -1, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Faded Manuscript Text Lines */}
        <line x1="38" y1="42" x2="72" y2="42" stroke="#C89A3D" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <line x1="38" y1="50" x2="65" y2="50" stroke="#C89A3D" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="38" y1="58" x2="78" y2="58" stroke="#C89A3D" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

        {/* Flying Page Corner */}
        <motion.path
          d="M 72 28 L 92 28 L 92 48 Z"
          fill="#EEDEB8"
          stroke="#C89A3D"
          strokeWidth="1.5"
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: [-2, 2, -2], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Floating Lost Compass */}
        <motion.g
          initial={{ y: 0 }}
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="76" cy="74" r="20" fill="#FFFDF9" stroke="#C89A3D" strokeWidth="2.5" />
          <circle cx="76" cy="74" r="16" fill="none" stroke="#C89A3D" strokeWidth="1" strokeDasharray="2 2" />

          {/* Glowing Crimson Needle */}
          <motion.path
            d="M 76 60 L 80 74 L 76 88 L 72 74 Z"
            fill="url(#needleGrad)"
            stroke="#A50000"
            strokeWidth="1"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "76px 74px" }}
          />

          <circle cx="76" cy="74" r="3" fill="#C89A3D" />
        </motion.g>

        <defs>
          <linearGradient id="parchmentGrad" x1="28" y1="28" x2="92" y2="92" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFDF9" />
            <stop offset="1" stopColor="#F4E6D2" />
          </linearGradient>
          <linearGradient id="needleGrad" x1="72" y1="60" x2="80" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A50000" />
            <stop offset="1" stopColor="#C89A3D" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
