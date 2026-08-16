import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from "@tailwindcss/vite";
import path from "path"
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lego Tracker',
        short_name: 'LegoTracker',
        description: 'Family Lego set collection tracker',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})