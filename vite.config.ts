import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true,

  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  // NOTE: No manualChunks.
  //
  // The previous manualChunks strategy routed lucide-react into "vendor-icons"
  // and react/framer-motion into "vendor-react-core", but Rollup resolved React
  // into a shared intermediate chunk (the app entry, index-xxxxx.js) that had a
  // circular dependency with the big vendor bundle. This caused:
  //
  //   vendor-icons → index-xxxxx.js → vendor-CVd9xxxxx.js → vendor-icons  (CIRCULAR)
  //
  // At runtime in production, ESM modules in a cycle can evaluate in an order
  // where the React exports are not yet initialised when lucide-react tries to
  // call React.forwardRef() / React.createContext() at the top level, causing:
  //
  //   Uncaught TypeError: Cannot read properties of undefined (reading 'forwardRef')
  //
  // Localhost masks this because Vite's dev server serves modules individually
  // with warm caches and no parallel fetch races.
  //
  // The fix: let Vite/Rollup use its own automatic code-splitting algorithm,
  // which correctly tracks the full dependency graph and never produces circular
  // inter-chunk references for vendor libraries.
});
