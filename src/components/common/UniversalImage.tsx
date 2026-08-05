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
  className = "",
  containerClassName = "",
  loading = "lazy",
  ...props
}: UniversalImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check if image is already cached/complete on mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const primarySrc = src && !error ? getOptimizedImageUrl(src, width) : fallbackSrc;

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const finalSrc = error || !src ? fallbackSrc : primarySrc;

  return (
    <div
      className={`relative overflow-hidden bg-muted/40 ${aspectRatio} ${containerClassName}`}
    >
      {/* Background placeholder while image is fetching */}
      {!loaded && (
        <div className="absolute inset-0 bg-muted/60 animate-pulse pointer-events-none z-0" />
      )}

      <img
        ref={imgRef}
        src={finalSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover object-top transition-opacity duration-200 ${className}`}
        {...props}
      />
    </div>
  );
});
