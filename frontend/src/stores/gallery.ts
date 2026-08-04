import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { saveToGallery, getAllFromGallery, deleteFromGallery, clearGallery, type GalleryItem } from '@/composables/useImageStorage'
import type { GenResultImage } from '@/adapters/types'

interface SavePayload {
  adapterId: string
  mode: string
  prompt: string
  params: Record<string, unknown>
  image: GenResultImage
  apiConfig: { endpoint: string; model: string }
}

export const useGalleryStore = defineStore('gallery', () => {
  const items = ref<GalleryItem[]>([])
  const loaded = ref(false)

  async function load() {
    items.value = await getAllFromGallery()
    loaded.value = true
  }

  async function save(payload: SavePayload) {
    const item: GalleryItem = {
      id: crypto.randomUUID(),
      adapterId: payload.adapterId,
      mode: payload.mode,
      prompt: payload.prompt,
      params: payload.params,
      imageData: payload.image.data,
      mimeType: payload.image.mimeType,
      createdAt: Date.now(),
      apiConfig: payload.apiConfig,
    }
    const rawItem = { ...toRaw(item), params: JSON.parse(JSON.stringify(toRaw(item.params))) }
    await saveToGallery(rawItem)
    items.value.unshift(item)
  }

  async function remove(id: string) {
    await deleteFromGallery(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function clear() {
    await clearGallery()
    items.value = []
  }

  return { items, loaded, load, save, remove, clear }
})
