import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAdapter } from '@/adapters/registry';
import { useSettingsStore } from '@/stores/settings';
export const useGenerationStore = defineStore('generation', () => {
    const loading = ref(false);
    const error = ref(null);
    const results = ref(null);
    async function generateTextToImage(prompt, params) {
        const settings = useSettingsStore();
        const profile = settings.activeProfile;
        if (!profile || !profile.config.apiKey) {
            error.value = '请先在设置页配置 API Key';
            return;
        }
        const adapter = getAdapter(profile.adapterId);
        if (!adapter) {
            error.value = '找不到适配器';
            return;
        }
        loading.value = true;
        error.value = null;
        results.value = null;
        try {
            results.value = await adapter.textToImage({ prompt, config: profile.config, params });
        }
        catch (e) {
            error.value = e instanceof Error ? e.message : String(e);
        }
        finally {
            loading.value = false;
        }
    }
    async function generateImageToImage(prompt, images, params) {
        const settings = useSettingsStore();
        const profile = settings.activeProfile;
        if (!profile || !profile.config.apiKey) {
            error.value = '请先在设置页配置 API Key';
            return;
        }
        const adapter = getAdapter(profile.adapterId);
        if (!adapter) {
            error.value = '找不到适配器';
            return;
        }
        loading.value = true;
        error.value = null;
        results.value = null;
        try {
            results.value = await adapter.imageToImage({ prompt, config: profile.config, params, images });
        }
        catch (e) {
            error.value = e instanceof Error ? e.message : String(e);
        }
        finally {
            loading.value = false;
        }
    }
    function clearResults() { results.value = null; error.value = null; }
    return { loading, error, results, generateTextToImage, generateImageToImage, clearResults };
});
//# sourceMappingURL=generation.js.map