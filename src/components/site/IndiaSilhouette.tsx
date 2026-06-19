import { motion } from "framer-motion";

/**
 * Subtle artistic outline of India — used as a low-opacity background accent.
 * Path is a stylized representation, not a geographically accurate map.
 */
export function IndiaSilhouette({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 500 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 0.08, scale: 1 }}
      transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="indiaGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.82 0.14 75)" />
          <stop offset="100%" stopColor="oklch(0.72 0.2 50)" />
        </linearGradient>
        <filter id="indiaGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M180 60 C 220 50 260 55 295 70 C 330 82 355 100 365 125 C 372 145 360 165 345 178 C 380 185 410 200 425 230 C 440 260 430 295 405 320 C 395 332 380 340 365 345 C 380 370 385 400 375 430 C 365 460 345 485 320 505 C 295 525 265 540 240 550 C 220 558 200 555 195 540 C 188 520 200 500 215 485 C 200 480 188 470 185 455 C 180 435 195 418 210 408 C 195 395 185 378 188 358 C 192 335 215 320 235 318 C 220 305 210 285 215 265 C 222 240 245 225 268 222 C 245 215 225 200 215 178 C 205 155 215 132 232 118 C 215 110 200 95 195 78 C 190 65 175 62 180 60 Z"
        fill="none"
        stroke="url(#indiaGold)"
        strokeWidth="1.5"
        filter="url(#indiaGlow)"
      />
    </motion.svg>
  );
}
