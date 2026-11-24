import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    manifest: {
      name: 'Шаромир — мастерская стран', short_name: 'Шаромир', lang: 'ru',
      id: './', start_url: './', scope: './',
      theme_color: '#faf9fe', background_color: '#faf9fe', display: 'standalone',
      icons: [192, 512].map(n => ({ src: `./icon-${n}.png`, sizes: `${n}x${n}`, type: 'image/png' }))
    },
    workbox: { globPatterns: ['**/*.{html,js,css,svg,png,woff2,mp3}'] }
  })]
})
