import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("leaflet") || id.includes("react-leaflet")) {
            return "leaflet";
          }
          if (id.includes("react-dom") || id.includes("react/")) {
            return "react";
          }
        },
      },
    },
  },
});
