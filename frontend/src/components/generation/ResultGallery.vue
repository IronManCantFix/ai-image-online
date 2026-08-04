<template>
  <div>
    <!-- 加载中 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
      <p class="text-gray-500 text-sm">生成中，请稍候...</p>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm font-medium">生成失败</p>
      <p class="text-red-600 text-sm mt-1 break-all">{{ error }}</p>
    </div>

    <!-- 结果 -->
    <div v-else-if="results && results.images.length">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="(img, i) in results.images" :key="i"
          class="relative group rounded-lg overflow-hidden border border-gray-200 bg-white">
          <img :src="img.url" :alt="`生成结果 ${i + 1}`" class="w-full h-auto cursor-pointer" @click="$emit('preview', img)" />
          <div class="absolute bottom-0 inset-x-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2">
            <button @click="download(img, i)" class="text-white text-sm px-2 py-1 rounded hover:bg-white/20">下载</button>
            <button @click="$emit('save', img, i)" class="text-white text-sm px-2 py-1 rounded hover:bg-white/20 ml-1">保存到画廊</button>
          </div>
        </div>
      </div>

      <!-- 原始响应展示 -->
      <div class="mt-6 border border-gray-200 rounded-lg overflow-hidden">
        <button @click="showRaw = !showRaw"
          class="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500 transition-transform" :class="showRaw ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-sm font-medium text-gray-700">原始响应数据</span>
          </div>
          <span class="text-xs text-gray-400">{{ showRaw ? '点击收起' : '点击展开' }}</span>
        </button>
        <div v-if="showRaw" class="p-4 bg-gray-900 overflow-auto max-h-96">
          <pre class="text-xs text-green-400 whitespace-pre-wrap break-all font-mono">{{ formattedRaw }}</pre>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex items-center justify-center py-20 text-gray-400 text-sm">
      <p>生成的图片将显示在这里</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GenResult, GenResultImage } from '@/adapters/types'

const props = defineProps<{ loading: boolean; error: string | null; results: GenResult | null }>()
defineEmits<{
  (e: 'preview', img: GenResultImage): void
  (e: 'save', img: GenResultImage, index: number): void
}>()

const showRaw = ref(false)

const formattedRaw = computed(() => {
  if (!props.results?.raw) return ''
  try {
    return JSON.stringify(props.results.raw, null, 2)
  } catch {
    return String(props.results.raw)
  }
})

function download(img: GenResultImage, index: number) {
  const url = URL.createObjectURL(img.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-image-${Date.now()}-${index + 1}.png`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
