import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // No sourcemaps in production
    sourcemap: false,
    // Target modern browsers only
    target: "es2020",
    // Split vendor (React) into its own chunk for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
