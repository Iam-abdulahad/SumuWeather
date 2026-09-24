import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      includeAssets: ["favicon.ico", "apple-touch-icon.png"],

      manifest: {
        id: "/",
        name: "SuMo Weather",
        short_name: "SuMo",
        description:
          "Real-time weather dashboard with current conditions, forecasts and location-based weather.",

        start_url: "/",
        scope: "/",

        display: "standalone",

        orientation: "portrait-primary",

        theme_color: "#0B1526",
        background_color: "#0B1526",

        categories: ["weather", "utilities"],

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "open-meteo-cache",
              networkTimeoutSeconds: 8,

              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\/.*/i,

            handler: "NetworkFirst",

            options: {
              cacheName: "open-meteo-aqi-cache",

              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
