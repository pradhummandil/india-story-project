import { useEffect, useRef } from "react";

/**
 * Custom hook to enable horizontal mouse wheel scrolling and mouse drag-to-scroll
 * for horizontally scrollable containers (overflow-x-auto).
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Convert vertical mouse wheel scroll (deltaY) into horizontal scroll (scrollLeft)
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          const isScrollingRight = e.deltaY > 0 && el.scrollLeft < maxScroll - 1;
          const isScrollingLeft = e.deltaY < 0 && el.scrollLeft > 1;

          if (isScrollingRight || isScrollingLeft) {
            el.scrollLeft += e.deltaY * 1.2;
            e.preventDefault();
          }
        }
      }
    };

    // Support mouse drag-to-scroll
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Don't intercept drag if clicking interactive buttons or links directly
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a") || target.closest("input")) {
        return;
      }
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const onMouseLeave = () => {
      isDown = false;
      el.style.cursor = "";
    };

    const onMouseUp = () => {
      isDown = false;
      el.style.cursor = "";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return ref;
}
