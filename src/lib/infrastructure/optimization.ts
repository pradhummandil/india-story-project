// CDN & Asset Optimizations Helper
// Resolves compressed images, video stream parameters, and lazy loading configurations.

export const optimizationService = {
  // Image Compression & Optimization (Unsplash CDN resizing parameters)
  optimizeImage: (url: string, width = 800, quality = 80): string => {
    if (!url) return "/Logo-ISP.jpg";
    if (url.includes("unsplash.com")) {
      // Modify/append Unsplash parameters for lightweight delivery
      const baseUrl = url.split("?")[0];
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
    }
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
