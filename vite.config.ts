import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true,

  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/@google/genai")) {
              return "vendor-genai";
            }
            if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
              return "vendor-charts";
            }
          },
        },
      },
    },
  },
});
