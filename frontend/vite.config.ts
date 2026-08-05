import { fileURLToPath, URL } from 'node:url'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 构建版本号：每次 build 自动 +1，写入 build-version.txt 以便排查问题时确认版本
const versionFile = fileURLToPath(new URL('./build-version.txt', import.meta.url))
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'))

function buildVersionPlugin(): Plugin {
  return {
    name: 'build-version',
    config(config, env) {
      let buildNumber = 0
      if (existsSync(versionFile)) {
        buildNumber = parseInt(readFileSync(versionFile, 'utf-8').trim(), 10) || 0
      }
      if (env.command === 'build') {
        buildNumber += 1
        writeFileSync(versionFile, String(buildNumber))
      }
      const define = config.define ? { ...config.define } : {}
      define.__APP_VERSION__ = JSON.stringify(pkg.version)
      define.__BUILD_NUMBER__ = JSON.stringify(buildNumber)
      define.__BUILD_TIME__ = JSON.stringify(new Date().toISOString())
      return { define }
    },
  }
}

export default defineConfig({
  plugins: [vue(), buildVersionPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
})
