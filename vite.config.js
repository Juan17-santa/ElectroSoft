import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ['favicon.png'],
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,jsx,css,html,png,jpg,svg}"],
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'ElectroSoft',
        short_name: 'ElectroSoft',
        description: 'Aplicación administrativa',
        scope: "/",
        start_url: "/",
        display: "standalone",
        theme_color: '#FFC107',
        background_color: "#ffffff",

        "screenshots": [
          {
            "src": "/background-details.jpg",
            "sizes": "2400x1344",
            "type": "image/jpeg",
            "form_factor": "wide"
          },
          {
            "src": "/login-bg.jpg",
            "sizes": "800x1066",
            "type": "image/jpeg",
            "form_factor": "narrow"
          }
        ],

        icons: [
          {
            src: "/favicon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/favicon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
})