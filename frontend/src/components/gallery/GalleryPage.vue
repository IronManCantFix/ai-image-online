<template>
  <div>
    <div class="flex items-center justify-between mb-4 sm:mb-5">
      <div class="flex gap-1 border-b border-slate-200 dark:border-slate-800 -mb-5">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer min-h-[44px] relative"
          :class="activeTab === tab.id ? 'border-primary-500 text-primary-700 dark:text-primary-300' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
          {{ tab.label }}
          <span v-if="tab.id === 'history' && historyCount > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary-500 text-white text-[10px] font-bold px-1">
            {{ historyCount > 99 ? '99+' : historyCount }}
          </span>
        </button>
      </div>
      <button v-if="activeTab === 'gallery' && gallery.items.length" @click="confirmClear"
        class="px-3 py-2 text-sm rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 min-h-[40px] cursor-pointer transition-colors">
        清空全部
      </button>
    </div>

    <!-- 画廊内容 -->
    <div v-if="activeTab === 'gallery'">
      <div v-if="!gallery.loaded" class="text-center py-20 text-slate-400 dark:text-slate-600">加载中...</div>
      <div v-else-if="gallery.items.length === 0" class="text-center py-20 text-slate-400 dark:text-slate-600">
        <p>还没有保存的图片</p>
        <p class="text-sm mt-1">在生成页面点击"保存"即可收藏</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <div v-for="item in gallery.items" :key="item.id"
          class="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer"
          @click="previewItem(item)">
          <img :src="getURL(item)" :alt="item.prompt" class="w-full aspect-square object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
            <p class="text-white text-xs line-clamp-2">{{ item.prompt }}</p>
            <div class="flex gap-1 mt-1">
              <button @click.stop="downloadItem(item)" class="text-white text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur cursor-pointer">下载</button>
              <button @click.stop="gallery.remove(item.id)" class="text-white text-xs px-2 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/50 backdrop-blur cursor-pointer">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史内容 -->
    <HistoryPanel v-else @preview="onPreview" />

    <!-- 画廊预览弹窗 -->
    <div v-if="previewing" @click="previewing = null"
      class="fixed inset-0 z-[100] bg-black/80 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div @click.stop class="relative max-w-[95vw] max-h-[95vh] overflow-auto">
        <img :src="getURL(previewing)" alt="预览" class="max-w-full max-h-[70vh] rounded-xl mx-auto" />
        <div class="bg-white dark:bg-slate-900 rounded-xl mt-2 p-3 sm:p-4">
          <p class="text-sm text-slate-800 dark:text-slate-200 break-all">{{ previewing.prompt }}</p>
          <div class="flex flex-wrap gap-2 mt-2 text-xs text-slate-500 dark:text-slate-500">
            <span>{{ previewing.mode === 'text-to-image' ? '文生图' : '图生图' }}</span>
            <span>{{ previewing.apiConfig.model }}</span>
            <span>{{ new Date(previewing.createdAt).toLocaleString() }}</span>
          </div>
        </div>
        <button @click="previewing = null"
          class="absolute top-2 right-2 w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center text-xl hover:bg-white/20 backdrop-blur cursor-pointer">
          ×
        </button>
      </div>
    </div>

    <!-- 历史预览弹窗 -->
    <ImageModal v-if="historyPreview" :image="historyPreview" @close="historyPreview = null" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import { useGenerationStore } from '@/stores/generation'
import type { GalleryItem } from '@/composables/useImageStorage'
import type { GenResultImage } from '@/adapters/types'
import HistoryPanel from '@/components/generation/HistoryPanel.vue'
import ImageModal from '@/components/ui/ImageModal.vue'

const gallery = useGalleryStore()
const genStore = useGenerationStore()
const activeTab = ref<'gallery' | 'history'>('gallery')
const previewing = ref<GalleryItem | null>(null)
const historyPreview = ref<GenResultImage | null>(null)

const tabs = [
  { id: 'gallery' as const, label: '画廊' },
  { id: 'history' as const, label: '历史' },
]

const historyCount = computed(() => genStore.history.length)
const urlCache = new Map<string, string>()

function getURL(item: GalleryItem): string {
  if (!urlCache.has(item.id)) urlCache.set(item.id, URL.createObjectURL(item.imageData))
  return urlCache.get(item.id)!
}

function previewItem(item: GalleryItem) { previewing.value = item }
function onPreview(img: GenResultImage) { historyPreview.value = img }

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
