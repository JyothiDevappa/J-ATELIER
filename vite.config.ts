import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/js/main.tsx"],
      refresh: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
    watch: {
      ignored: ["**/storage/framework/views/**"],
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core + scheduler (must stay together to avoid circular deps)
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          // Framer Motion
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-framer-motion";
          }
          // Radix UI primitives (the biggest contributor to vendor-misc)
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Recharts + d3 (chart library)
          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/d3") ||
            id.includes("node_modules/victory-vendor/")
          ) {
            return "vendor-charts";
          }
          // TanStack React Query
          if (id.includes("node_modules/@tanstack/")) {
            return "vendor-tanstack";
          }
          // Lucide icons
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-lucide";
          }
          // Wouter router
          if (id.includes("node_modules/wouter/")) {
            return "vendor-wouter";
          }
          // Everything else (clsx, tailwind-merge, zod, date-fns, etc.)
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
});

