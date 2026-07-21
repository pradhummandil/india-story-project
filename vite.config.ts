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
            if (id.includes("node_modules")) {
              if (id.includes("recharts") || id.includes("d3")) {
                return "vendor-recharts";
              }
              if (id.includes("gsap")) {
                return "vendor-animations";
              }
              if (id.includes("@supabase") || id.includes("supabase-js")) {
                return "vendor-supabase";
              }
              if (id.includes("@radix-ui") || id.includes("@radix-ui/react")) {
                return "vendor-radix";
              }
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              if (id.includes("three") || id.includes("@react-three")) {
                return "vendor-three";
              }
              if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler") || id.includes("framer-motion")) {
                return "vendor-react-core";
              }
              return "vendor";
            }
          },
        },
      },
    },
  },
});
