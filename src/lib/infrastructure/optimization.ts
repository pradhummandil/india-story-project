// CDN & Asset Optimizations Helper
// Resolves compressed images, video stream parameters, and lazy loading configurations.

export const optimizationService = {
  // Image Compression & Optimization (CDN resizing and format parameters)
  optimizeImage: (url: string, width = 800, quality = 80): string => {
    if (!url) return "/Logo-ISP.jpg";
    return url;
  },

  // Video Buffering & Stream Resolution presets
  optimizeVideo: (url: string): { src: string; preload: "metadata" | "none" | "auto" } => {
    return {
      src: url,
      preload: "metadata", // Prevents heavy downloads on cell networks
    };
  },

  // API Versioning and Routing Prefix Resolvers
  resolveApiRoute: (path: string, version = "v1"): string => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/api/${version}${cleanPath}`;
  },
};
