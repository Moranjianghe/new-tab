/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import *as fs from 'fs'
// https://vite.dev/config/
/*
try {
  const appMode = import.meta.env.VITE_APP_MODE;
  console.log('當前應用程式模式:', appMode);
} catch (error) {
  console.error('無法讀取環境變數:', error);
}
*/

export default defineConfig(({ mode }) => ({

  //base: import.meta.env.VITE_BASE_URL || '/', 


  plugins: [
    vue(),
    tailwindcss(),
    ...(mode === 'extension' ? [{
      name: 'copy-manifest',
      writeBundle() {
        // 複製 manifest.json 到 dist 目錄
        if (fs.existsSync('./extension/manifest.json')) {
          fs.copyFileSync('./extension/manifest.json', './dist/manifest.json')
        }
        // 複製 background.js 到 dist 目錄
        if (fs.existsSync('./extension/background.js')) {
          fs.copyFileSync('./extension/background.js', './dist/background.js')
        }
      }
    }] : [
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
    ]),
  ],
  build: {
    target: 'esnext', // 更新为 esnext 支持最新的特性
  },
  
})
)

