import React, { useState } from "react";
import { getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/utils";

interface UniversalImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  sizes?: string;
  widths?: number[];
  aspectRatio?: string;
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
  widths = [320, 480, 640, 800, 1200],
  aspectRatio = "aspect-[16/10]",
  className = "",
  containerClassName = "",
  ...props
}: UniversalImageProps) {
  const [error, setError] = useState(false);
  const [retried, setRetried] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const primarySrc = src ? getOptimizedImageUrl(src, width) : fallbackSrc;
  const srcSet = src && !error ? getResponsiveSrcSet(src, widths) : undefined;

  const handleError = () => {
    if (!retried && src && !src.startsWith("data:")) {
      setRetried(true);
      // Force reload once
      setError(false);
    } else {
      setError(true);
    }
  };

  const finalSrc = error || !src ? fallbackSrc : primarySrc;

  return (
    <div
      className={`relative overflow-hidden bg-muted/60 ${aspectRatio} ${containerClassName}`}
    >
      {/* Skeleton Blur Background until image finishes loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-card/60 via-muted/80 to-card/60 animate-pulse pointer-events-none z-10" />
      )}

      <img
        src={finalSrc}
        srcSet={error ? undefined : srcSet}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...props}
      />
    </div>
  );
});
