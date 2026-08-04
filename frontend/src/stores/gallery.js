import { defineStore } from 'pinia';
import { ref } from 'vue';
import { saveToGallery, getAllFromGallery, deleteFromGallery, clearGallery } from '@/composables/useImageStorage';
export const useGalleryStore = defineStore('gallery', () => {
    const items = ref([]);
    const loaded = ref(false);
    async function load() {
        items.value = await getAllFromGallery();
        loaded.value = true;
    }
    async function save(payload) {
        const item = {
            id: crypto.randomUUID(),
            adapterId: payload.adapterId,
            mode: payload.mode,
            prompt: payload.prompt,
            params: payload.params,
            imageData: payload.image.data,
            mimeType: payload.image.mimeType,
            createdAt: Date.now(),
            apiConfig: payload.apiConfig,
        };
        await saveToGallery(item);
        items.value.unshift(item);
    }
    async function remove(id) {
        await deleteFromGallery(id);
        items.value = items.value.filter(i => i.id !== id);
    }
    async function clear() {
        await clearGallery();
        items.value = [];
    }
    return { items, loaded, load, save, remove, clear };
});
//# sourceMappingURL=gallery.js.map