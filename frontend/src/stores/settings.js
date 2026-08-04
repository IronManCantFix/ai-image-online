import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getDefaultAdapter } from '@/adapters/registry';
const STORAGE_KEY = 'ai-image-online-settings';
export const useSettingsStore = defineStore('settings', () => {
    const defaultAdapter = getDefaultAdapter();
    const profiles = ref([]);
    const activeProfileId = ref('');
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                profiles.value = data.profiles || [];
                activeProfileId.value = data.activeProfileId || '';
            }
        }
        catch { /* ignore */ }
        if (profiles.value.length === 0) {
            const profile = {
                id: 'default',
                name: '默认配置',
                adapterId: defaultAdapter.id,
                config: {
                    endpoint: defaultAdapter.defaultConfig.endpoint || '',
                    apiKey: '',
                    model: defaultAdapter.defaultConfig.model || '',
                },
            };
            profiles.value = [profile];
            activeProfileId.value = profile.id;
            save();
        }
    }
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            profiles: profiles.value,
            activeProfileId: activeProfileId.value,
        }));
    }
    const activeProfile = computed(() => profiles.value.find(p => p.id === activeProfileId.value) || profiles.value[0]);
    const activeConfig = computed(() => activeProfile.value?.config);
    function updateProfile(id, updates) {
        const profile = profiles.value.find(p => p.id === id);
        if (profile) {
            Object.assign(profile, updates);
            save();
        }
    }
    function addProfile(name, adapterId, config) {
        const id = Date.now().toString();
        profiles.value.push({ id, name, adapterId, config });
        activeProfileId.value = id;
        save();
        return id;
    }
    function deleteProfile(id) {
        if (profiles.value.length <= 1)
            return;
        profiles.value = profiles.value.filter(p => p.id !== id);
        if (activeProfileId.value === id)
            activeProfileId.value = profiles.value[0].id;
        save();
    }
    function setActiveProfile(id) {
        activeProfileId.value = id;
        save();
    }
    load();
    return { profiles, activeProfileId, activeProfile, activeConfig, updateProfile, addProfile, deleteProfile, setActiveProfile };
});
//# sourceMappingURL=settings.js.map