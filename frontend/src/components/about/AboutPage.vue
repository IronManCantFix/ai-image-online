<template>
  <div class="max-w-2xl mx-auto space-y-4">
    <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">关于</h1>

    <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">项目简介</h2>
        <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <span class="font-semibold text-primary-600">AI Image Online</span> 是一款开源的 AI 图片生成 Web 应用，
          支持文生图与图生图，兼容 GPT Image 2 协议，可一键部署到飞牛 NAS 或任意支持 Docker 的环境。
          所有 API 配置、历史记录与图片数据均保存在浏览器本地，注重隐私与易用性。
        </p>
      </div>

      <div>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">开源地址</h2>
        <a :href="repoUrl" target="_blank" rel="noopener"
          class="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline break-all">
          {{ repoUrl }}
          <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">版本信息</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span class="text-slate-400 dark:text-slate-600">版本号</span>
            <p class="text-slate-600 dark:text-slate-300 mt-0.5">v{{ appVersion }}</p>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-600">构建号</span>
            <p class="text-slate-600 dark:text-slate-300 mt-0.5">#{{ buildVersion }}</p>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-600">构建时间</span>
            <p class="text-slate-600 dark:text-slate-300 mt-0.5">{{ buildTime }}</p>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-600">提交号</span>
            <p class="text-slate-600 dark:text-slate-300 mt-0.5">{{ gitSha || '—' }}</p>
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-400 dark:text-slate-600">版本号：发布时取 Git tag；日常构建为 package.json 版本 + 构建号与提交号。构建号与构建时间由 GitHub Actions 每次构建自动生成。</p>
      </div>

      <div>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">开发信息</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-slate-400 dark:text-slate-600">开发工具</span>
            <p class="text-slate-600 dark:text-slate-300 mt-0.5">Codex</p>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-600">开发模型</span>
            <p class="text-slate-600 dark:text-slate-300 mt-0.5 break-all">DeepSeek-v4-flash-0731 Mimo-v2.5-pro</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const repoUrl = 'https://github.com/IronManCantFix/ai-image-online'
const appVersion = __APP_VERSION__
const buildVersion = __BUILD_NUMBER__
const buildTime = new Date(__BUILD_TIME__).toLocaleString('zh-CN', { hour12: false })
const gitSha = __GIT_SHA__ ? __GIT_SHA__.slice(0, 7) : ''
</script>
