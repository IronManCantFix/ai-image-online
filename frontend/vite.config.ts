import { fileURLToPath, URL } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 构建元数据：优先取 CI 环境变量（GitHub Actions 自动注入），本地构建回退到 build-version.txt
const versionFile = fileURLToPath(new URL('./build-version.txt', import.meta.url))
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'))

function readLocalBuildNumber(): number {
  if (existsSync(versionFile)) return parseInt(readFileSync(versionFile, 'utf-8').trim(), 10) || 0
  return 0
}

function buildVersionPlugin(): Plugin {
  return {
    name: 'build-version',
    config(config) {
      const buildNumber = process.env.BUILD_NUMBER ? Number(process.env.BUILD_NUMBER) : readLocalBuildNumber()
      const buildTime = process.env.BUILD_TIME || new Date().toISOString()
      const gitSha = process.env.GIT_SHA || ''
      const appVersion = process.env.APP_VERSION || pkg.version
      const define = config.define ? { ...config.define } : {}
      define.__APP_VERSION__ = JSON.stringify(appVersion)
      define.__BUILD_NUMBER__ = JSON.stringify(buildNumber)
      define.__BUILD_TIME__ = JSON.stringify(buildTime)
      define.__GIT_SHA__ = JSON.stringify(gitSha)
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
