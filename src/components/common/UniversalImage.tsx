import React, { useState, useRef, useEffect } from "react";
import { getOptimizedImageUrl } from "@/lib/utils";

interface UniversalImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  sizes?: string;
  widths?: number[];
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
  className?: string;
  containerClassName?: string;
}

export const UniversalImage = React.memo(function UniversalImage({
  src,
  alt,
  fallbackSrc = "/Logo-ISP.jpg",
  width = 800,
  height = 500,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  aspectRatio = "aspect-[16/10]",
  objectFit = "cover",
  className = "",
  containerClassName = "",
  loading = "lazy",
  ...props
}: UniversalImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const hasValidSrc = Boolean(src && typeof src === "string" && src.trim() !== "" && !error);

  useEffect(() => {
    setError(false);
    setLoaded(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const primarySrc = hasValidSrc && src ? getOptimizedImageUrl(src, width) : fallbackSrc;

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const finalSrc = hasValidSrc ? primarySrc : fallbackSrc;
  const isFallback = !hasValidSrc;

  const fitClass = isFallback
    ? "object-contain object-center p-6 bg-black"
    : objectFit === "contain"
      ? "object-contain object-center bg-black"
      : objectFit === "fill"
        ? "object-fill"
        : "object-cover object-center";

  return (
    <div
      className={`relative overflow-hidden ${isFallback ? "bg-black" : "bg-[#14141A]"} ${aspectRatio} ${containerClassName}`}
    >
      {/* Black Background Placeholder while image is loading */}
      {!loaded && !isFallback && (
        <div className="absolute inset-0 bg-black/80 animate-pulse pointer-events-none z-0 flex items-center justify-center">
          <img src={fallbackSrc} alt="ISP Logo" className="w-16 h-16 object-contain opacity-50" />
        </div>
      )}

      <img
        ref={imgRef}
        src={finalSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full ${fitClass} transition-opacity duration-300 ease-out ${
          loaded || isFallback ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...props}
      />
    </div>
  );
});
