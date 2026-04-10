/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';

const extensionModes = new Set(['extension', 'firefox']);
const manifestByMode: Record<string, string> = {
  extension: './extension/manifest.json',
  firefox: './extension/manifest.firefox.json',
};

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    tailwindcss(),
    ...(extensionModes.has(mode)
      ? [
          {
            name: 'copy-extension-assets',
            writeBundle() {
              const manifestPath = manifestByMode[mode] || manifestByMode.extension;
              if (fs.existsSync(manifestPath)) {
                fs.copyFileSync(manifestPath, './dist/manifest.json');
              }

              if (fs.existsSync('./extension/background.js')) {
                fs.copyFileSync('./extension/background.js', './dist/background.js');
              }
            },
          },
        ]
      : [
          VitePWA({
            registerType: 'autoUpdate',
            workbox: {
              runtimeCaching: [
                {
                  urlPattern: /^\/index\.html$/,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'html-cache',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24,
                    },
                  },
                },
                {
                  urlPattern: /^\/assets\/.*$/,
                  handler: 'StaleWhileRevalidate',
                  options: {
                    cacheName: 'assets-cache',
                    expiration: {
                      maxEntries: 50,
                      maxAgeSeconds: 60 * 60 * 24 * 7,
                    },
                  },
                },
              ],
            },
          }),
        ]),
  ],
  build: {
    target: 'es2020',
  },
}));
