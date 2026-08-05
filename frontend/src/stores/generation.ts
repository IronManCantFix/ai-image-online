import { defineStore } from 'pinia'
import { ref } from 'vue'
import { randomUUID } from '@/utils/uuid'
import type { GenResult, GenResultImage } from '@/adapters/types'
import { getAdapter } from '@/adapters/registry'
import { useSettingsStore } from '@/stores/settings'
import { saveHistoryEntry, getAllHistory, deleteHistoryEntry, clearHistory as clearHistoryDB, type PersistedHistoryEntry } from '@/composables/useHistoryStorage'

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
  const textResults = ref<GenResult | null>(null)
  const imageResults = ref<GenResult | null>(null)
  const history = ref<HistoryEntry[]>([])

  function toPersistedEntry(mode: HistoryEntry['mode'], prompt: string, result: GenResult): PersistedHistoryEntry {
    return {
      id: randomUUID(),
      mode,
      prompt,
      images: result.images.map(img => ({ data: img.data, mimeType: img.mimeType })),
      raw: result.raw,
      createdAt: Date.now(),
    }
  }

  function toHistoryEntry(entry: PersistedHistoryEntry): HistoryEntry {
    return {
      id: entry.id,
      mode: entry.mode,
      prompt: entry.prompt,
      images: entry.images.map(img => {
        const url = URL.createObjectURL(img.data)
        return { data: img.data, mimeType: img.mimeType, url }
      }),
      raw: entry.raw,
      createdAt: entry.createdAt,
    }
  }

  async function loadHistory() {
    try {
      const entries = await getAllHistory()
      history.value = entries.map(toHistoryEntry)
    } catch (e) {
      console.error('[History] Failed to load history from IndexedDB:', e)
    }
  }

  async function pushHistory(mode: HistoryEntry['mode'], prompt: string, result: GenResult) {
    const entry = toPersistedEntry(mode, prompt, result)
    history.value.unshift(toHistoryEntry(entry))
    try {
      await saveHistoryEntry(entry)
    } catch (e) {
      console.error('[History] Failed to save history entry to IndexedDB:', e)
    }
  }

  async function generateTextToImage(prompt: string, params: Record<string, string | number | boolean>) {
    const settings = useSettingsStore()
    const profile = settings.activeProfile
    if (!profile || !profile.config.apiKey) { error.value = '请先在设置页配置 API Key'; return }
    const adapter = getAdapter(profile.adapterId)
    if (!adapter) { error.value = '找不到适配器'; return }
    loading.value = true; error.value = null; textResults.value = null
    try {
      textResults.value = await adapter.textToImage({ prompt, config: profile.config, params })
      if (textResults.value.images.length > 0) await pushHistory('text-to-image', prompt, textResults.value)
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
    loading.value = true; error.value = null; imageResults.value = null
    try {
      imageResults.value = await adapter.imageToImage({ prompt, config: profile.config, params, images })
      if (imageResults.value.images.length > 0) await pushHistory('image-to-image', prompt, imageResults.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally { loading.value = false }
  }

  function clearResults(mode?: 'text' | 'image') {
    if (mode === 'text') textResults.value = null
    else if (mode === 'image') imageResults.value = null
    else { textResults.value = null; imageResults.value = null }
    error.value = null
  }

  async function removeHistory(id: string) {
    history.value = history.value.filter(h => h.id !== id)
    await deleteHistoryEntry(id)
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

  async function clearHistory() { history.value = []; await clearHistoryDB() }

  loadHistory()

  return {
    loading, error, textResults, imageResults, history,
    generateTextToImage, generateImageToImage,
    clearResults, removeHistory, removeImageFromHistory, removeImagesFromHistory, clearHistory,
  }
})
