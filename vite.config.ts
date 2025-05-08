import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  
  //base: import.meta.env.VITE_BASE_URL || '/', 
  
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // 自動更新 Service Worker
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^\/index\.html$/, // 精確匹配 /index.html
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 天
              },
            },
          },
          {
            urlPattern: /^\/assets\/.*$/, // 匹配 /assets/ 下的所有資源
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 天
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'esnext', // 更新为 esnext 支持最新的特性
  },
})

