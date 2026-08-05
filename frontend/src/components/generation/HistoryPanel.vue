<template>
  <div>
    <div class="mb-4 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
      <p class="text-xs text-blue-600 dark:text-blue-400">历史记录自动保存在浏览器中，保留 7 天。如需永久保存，请下载图片到本地。</p>
    </div>
    <div v-if="history.length === 0" class="flex items-center justify-center py-20 text-slate-300 dark:text-slate-700 text-sm">
      <p>暂无生成历史</p>
    </div>
    <div v-else>
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-slate-500 dark:text-slate-400">共 {{ totalImages }} 张图片</span>
        <div class="flex items-center gap-2">
          <button v-if="batchMode && selectedCount > 0" @click="deleteSelected"
            class="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors">
            删除选中 ({{ selectedCount }})
          </button>
          <button @click="batchMode = !batchMode; selected.clear()"
            class="text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
            :class="batchMode
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'">
            {{ batchMode ? '取消选择' : '批量选择' }}
          </button>
          <button @click="clearAll"
            class="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors">
            清空历史
          </button>
        </div>
      </div>

      <!-- 历史条目 -->
      <div class="space-y-4">
        <div v-for="entry in history" :key="entry.id"
          class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <!-- 条目头部 -->
          <div class="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50">
            <div class="flex items-center gap-2 min-w-0">
              <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                :class="entry.mode === 'text-to-image'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'">
                {{ entry.mode === 'text-to-image' ? '文生图' : '图生图' }}
              </span>
              <span class="text-sm text-slate-600 dark:text-slate-300 truncate">{{ entry.prompt }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-slate-400 dark:text-slate-600">{{ formatTime(entry.createdAt) }}</span>
              <button @click="removeHistory(entry.id)"
                class="text-slate-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer p-1 transition-colors"
                title="删除此条记录">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <!-- 图片网格 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
            <div v-for="(img, i) in entry.images" :key="i"
              class="relative group rounded-lg overflow-hidden border transition-colors"
              :class="isSelected(entry.id, i)
                ? 'border-primary-500 ring-2 ring-primary-500/30'
                : 'border-slate-100 dark:border-slate-800'">
              <!-- 批量选择勾选框 -->
              <button v-if="batchMode" @click.stop="toggleSelect(entry.id, i)"
                class="absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all"
                :class="isSelected(entry.id, i)
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600'">
                <svg v-if="isSelected(entry.id, i)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <!-- 点击图片：批量模式下切换选中，否则预览 -->
              <img :src="img.url" :alt="`历史图片 ${i + 1}`"
                class="w-full h-auto cursor-pointer" @click="batchMode ? toggleSelect(entry.id, i) : $emit('preview', img)" />
              <!-- 单张删除按钮（非批量模式） -->
              <button v-if="!batchMode" @click.stop="removeImageFromHistory(entry.id, i)"
                class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                title="删除此图片">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <!-- 下载按钮 -->
              <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex justify-end p-2 gap-1">
                <button v-if="!isInGallery(entry, i)" @click.stop="addToGallery(entry, img, i)"
                  class="text-white text-xs px-3 py-1.5 rounded-lg bg-primary-500/30 hover:bg-primary-500/50 backdrop-blur cursor-pointer">
                  添加到画廊
                </button>
                <span v-else class="text-white/70 text-xs px-3 py-1.5">已收藏</span>
                <button @click.stop="download(img, i)"
                  class="text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur cursor-pointer">
                  下载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGenerationStore } from '@/stores/generation'
import { useGalleryStore } from '@/stores/gallery'
import { useSettingsStore } from '@/stores/settings'
import type { GenResultImage } from '@/adapters/types'
import type { HistoryEntry } from '@/stores/generation'

const genStore = useGenerationStore()
const gallery = useGalleryStore()
const settings = useSettingsStore()
const { history } = storeToRefs(genStore)
const { removeHistory, removeImageFromHistory, removeImagesFromHistory, clearHistory } = genStore

defineEmits<{ (e: 'preview', img: GenResultImage): void }>()

onMounted(() => { gallery.load() })

const batchMode = ref(false)
const selected = ref(new Map<string, Set<number>>())

const totalImages = computed(() => history.value.reduce((sum, e) => sum + e.images.length, 0))
const selectedCount = computed(() => {
  let count = 0
  for (const s of selected.value.values()) count += s.size
  return count
})

function isSelected(entryId: string, index: number) {
  return selected.value.get(entryId)?.has(index) ?? false
}

function toggleSelect(entryId: string, index: number) {
  if (!selected.value.has(entryId)) selected.value.set(entryId, new Set())
  const set = selected.value.get(entryId)!
  if (set.has(index)) {
    set.delete(index)
    if (set.size === 0) selected.value.delete(entryId)
  } else {
    set.add(index)
  }
}

function deleteSelected() {
  if (selectedCount.value === 0) return
  removeImagesFromHistory(selected.value)
  selected.value = new Map()
  batchMode.value = false
}

function clearAll() {
  if (history.value.length === 0) return
  clearHistory()
}

function formatTime(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function download(img: GenResultImage, index: number) {
  const url = URL.createObjectURL(img.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-image-${Date.now()}-${index + 1}.png`
  a.click()
  URL.revokeObjectURL(url)
}

function isInGallery(entry: HistoryEntry, index: number): boolean {
  return gallery.items.some(g => g.sourceHistoryId === entry.id && g.sourceHistoryImageIndex === index)
}

async function addToGallery(entry: HistoryEntry, img: GenResultImage, index: number) {
  try {
    const profile = settings.activeProfile
    const apiConfig = entry.apiConfig ?? (profile ? { endpoint: profile.config.endpoint, model: profile.config.model } : { endpoint: '', model: '' })
    const adapterId = entry.adapterId ?? profile?.adapterId ?? 'gpt-image-2'
    await gallery.save({
      adapterId,
      mode: entry.mode,
      prompt: entry.prompt,
      params: {},
      image: img,
      apiConfig,
      sourceHistoryId: entry.id,
      sourceHistoryImageIndex: index,
    })
    alert('已添加到画廊！')
  } catch (e) {
    alert('添加到画廊失败: ' + (e instanceof Error ? e.message : String(e)))
  }
}
</script>
