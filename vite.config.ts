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
  build: {
    // Vite 5+ defaults to placing the manifest at `.vite/manifest.json`
    // inside the outDir, but Laravel's @vite() helper expects it at the
    // root of the build directory (public/build/manifest.json).
    // Setting this explicitly keeps the manifest where Laravel can find it.
    manifest: "manifest.json",
    outDir: "public/build",
    emptyOutDir: true,
  },
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
});
