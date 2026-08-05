import { getLenis } from "./lenis";

let lockCount = 0;

export function lockScroll() {
  lockCount++;
  if (typeof document === "undefined") return;
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
  getLenis()?.stop();
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && typeof document !== "undefined") {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.body.removeAttribute("data-scroll-locked");
    const lenis = getLenis();
    lenis?.start();
    lenis?.resize();
  }
}

export function forceUnlockScroll() {
  lockCount = 0;
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
  document.body.style.touchAction = "";
  document.body.removeAttribute("data-scroll-locked");
  const lenis = getLenis();
  lenis?.start();
  lenis?.resize();
}

