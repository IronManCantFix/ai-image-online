<template>
  <div>
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-700 border-t-primary-500 mb-3"></div>
      <p class="text-slate-400 dark:text-slate-600 text-sm">生成中，请稍候...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
      <p class="text-red-700 dark:text-red-300 text-sm font-medium">生成失败</p>
      <p class="text-red-600 dark:text-red-400/80 text-sm mt-1 break-all">{{ error }}</p>
    </div>
    <div v-else-if="results && results.images.length">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="(img, i) in results.images" :key="i" class="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
          <img :src="img.url" :alt="`生成结果 ${i + 1}`" class="w-full h-auto cursor-pointer" @click="$emit('preview', img)" />
          <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex justify-end p-2 gap-1">
            <button @click.stop="download(img, i)" class="text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur cursor-pointer">下载</button>
            <button @click.stop="$emit('save', img, i)" class="text-white text-xs px-3 py-1.5 rounded-lg bg-primary-500/30 hover:bg-primary-500/50 backdrop-blur cursor-pointer ml-1">保存</button>
          </div>
        </div>
      </div>
      <div class="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <button @click="showRaw = !showRaw" class="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer min-h-[44px] transition-colors">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400 dark:text-slate-600 transition-transform" :class="showRaw ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span class="text-sm font-medium text-slate-500 dark:text-slate-500">原始响应数据</span>
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-700">{{ showRaw ? '收起' : '展开' }}</span>
        </button>
        <div v-if="showRaw" class="p-3 bg-slate-950 overflow-auto max-h-60 sm:max-h-96">
          <pre class="text-xs text-green-400/80 whitespace-pre-wrap break-all font-mono">{{ formattedRaw }}</pre>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center py-20 text-slate-300 dark:text-slate-700 text-sm">
      <p>生成的图片将显示在这里</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GenResult, GenResultImage } from '@/adapters/types'
const props = defineProps<{ loading: boolean; error: string | null; results: GenResult | null }>()
defineEmits<{ (e: 'preview', img: GenResultImage): void; (e: 'save', img: GenResultImage, index: number): void }>()
const showRaw = ref(false)
const formattedRaw = computed(() => { try { return JSON.stringify(props.results?.raw, null, 2) } catch { return String(props.results?.raw) } })
function download(img: GenResultImage, index: number) { const url = URL.createObjectURL(img.data); const a = document.createElement('a'); a.href = url; a.download = `ai-image-${Date.now()}-${index + 1}.png`; a.click(); URL.revokeObjectURL(url) }
</script>
