import { defineStore } from 'pinia'
import { ref } from 'vue'
import { randomUUID } from '@/utils/uuid'
import type { GenResult, GenResultImage } from '@/adapters/types'
import { getAdapter } from '@/adapters/registry'
import { useSettingsStore } from '@/stores/settings'

export interface HistoryEntry {
  id: string
  mode: 'text-to-image' | 'image-to-image'
  prompt: string
  images: GenResultImage[]
  raw?: unknown
  createdAt: number
}

export const useGenerationStore = defineStore('generation', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const results = ref<GenResult | null>(null)
  const history = ref<HistoryEntry[]>([])

  function pushHistory(mode: HistoryEntry['mode'], prompt: string, result: GenResult) {
    history.value.unshift({
      id: randomUUID(),
      mode,
      prompt,
      images: result.images,
      raw: result.raw,
      createdAt: Date.now(),
    })
  }

  async function generateTextToImage(prompt: string, params: Record<string, string | number | boolean>) {
    const settings = useSettingsStore()
    const profile = settings.activeProfile
    if (!profile || !profile.config.apiKey) { error.value = '请先在设置页配置 API Key'; return }
    const adapter = getAdapter(profile.adapterId)
    if (!adapter) { error.value = '找不到适配器'; return }
    loading.value = true; error.value = null; results.value = null
    try {
      results.value = await adapter.textToImage({ prompt, config: profile.config, params })
      pushHistory('text-to-image', prompt, results.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally { loading.value = false }
  }

  async function generateImageToImage(prompt: string, images: File[], params: Record<string, string | number | boolean>) {
    const settings = useSettingsStore()
    const profile = settings.activeProfile
    if (!profile || !profile.config.apiKey) { error.value = '请先在设置页配置 API Key'; return }
    const adapter = getAdapter(profile.adapterId)
    if (!adapter) { error.value = '找不到适配器'; return }
    loading.value = true; error.value = null; results.value = null
    try {
      results.value = await adapter.imageToImage({ prompt, config: profile.config, params, images })
      pushHistory('image-to-image', prompt, results.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally { loading.value = false }
  }

  function clearResults() { results.value = null; error.value = null }

  function removeHistory(id: string) {
    history.value = history.value.filter(h => h.id !== id)
  }

  function removeImageFromHistory(entryId: string, imageIndex: number) {
    const entry = history.value.find(h => h.id === entryId)
    if (!entry) return
    entry.images.splice(imageIndex, 1)
    if (entry.images.length === 0) {
      history.value = history.value.filter(h => h.id !== entryId)
    }
  }

  function removeImagesFromHistory(selected: Map<string, Set<number>>) {
    for (const [entryId, indices] of selected.entries()) {
      const entry = history.value.find(h => h.id === entryId)
      if (!entry) continue
      const sorted = [...indices].sort((a, b) => b - a)
      for (const i of sorted) entry.images.splice(i, 1)
    }
    history.value = history.value.filter(h => h.images.length > 0)
  }

  function clearHistory() { history.value = [] }

  return {
    loading, error, results, history,
    generateTextToImage, generateImageToImage,
    clearResults, removeHistory, removeImageFromHistory, removeImagesFromHistory, clearHistory,
  }
})
