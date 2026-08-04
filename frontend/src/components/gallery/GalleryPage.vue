<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">历史画廊</h1>
      <button v-if="gallery.items.length" @click="confirmClear"
        class="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50">清空全部</button>
    </div>
    <div v-if="!gallery.loaded" class="text-center py-20 text-gray-400">加载中...</div>
    <div v-else-if="gallery.items.length === 0" class="text-center py-20 text-gray-400">
      <p>还没有保存的图片</p>
      <p class="text-sm mt-1">在生成页面点击"保存到画廊"即可收藏</p>
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="item in gallery.items" :key="item.id"
        class="relative group rounded-lg overflow-hidden border border-gray-200 bg-white cursor-pointer"
        @click="previewItem(item)">
        <img :src="getURL(item)" :alt="item.prompt" class="w-full aspect-square object-cover" />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-2">
          <p class="text-white text-xs opacity-0 group-hover:opacity-100 line-clamp-2">{{ item.prompt }}</p>
          <div class="flex gap-1 mt-1 opacity-0 group-hover:opacity-100">
            <button @click.stop="downloadItem(item)" class="text-white text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30">下载</button>
            <button @click.stop="gallery.remove(item.id)" class="text-white text-xs px-2 py-1 rounded bg-red-500/50 hover:bg-red-500/70">删除</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="previewing" @click="previewing = null" class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div @click.stop class="relative max-w-[90vw] max-h-[90vh]">
        <img :src="getURL(previewing)" alt="预览" class="max-w-full max-h-[80vh] rounded-lg" />
        <div class="bg-white rounded-lg mt-3 p-4 max-w-[90vw]">
          <p class="text-sm text-gray-800">{{ previewing.prompt }}</p>
          <div class="flex gap-3 mt-2 text-xs text-gray-500">
            <span>{{ previewing.mode === 'text-to-image' ? '文生图' : '图生图' }}</span>
            <span>{{ previewing.apiConfig.model }}</span>
            <span>{{ new Date(previewing.createdAt).toLocaleString() }}</span>
          </div>
        </div>
        <button @click="previewing = null" class="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center">×</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import type { GalleryItem } from '@/composables/useImageStorage'

const gallery = useGalleryStore()
const previewing = ref<GalleryItem | null>(null)
const urlCache = new Map<string, string>()

function getURL(item: GalleryItem): string {
  if (!urlCache.has(item.id)) urlCache.set(item.id, URL.createObjectURL(item.imageData))
  return urlCache.get(item.id)!
}
function previewItem(item: GalleryItem) { previewing.value = item }
function downloadItem(item: GalleryItem) {
  const url = getURL(item)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-image-${item.id}.png`
  a.click()
}
function confirmClear() {
  if (confirm('确定清空所有历史图片吗？此操作不可恢复。')) gallery.clear()
}
onMounted(() => gallery.load())
</script>
