import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdapterConfig } from '@/adapters/types'
import { getDefaultAdapter } from '@/adapters/registry'

interface SettingsProfile {
  id: string
  name: string
  adapterId: string
  config: AdapterConfig
}

const STORAGE_KEY = 'ai-image-online-settings'

export const useSettingsStore = defineStore('settings', () => {
  const defaultAdapter = getDefaultAdapter()
  const profiles = ref<SettingsProfile[]>([])
  const activeProfileId = ref<string>('')
  const loaded = ref(false)

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        profiles.value = data.profiles || []
        activeProfileId.value = data.activeProfileId || ''
      }
    } catch { /* ignore */ }
    if (profiles.value.length === 0) {
      const profile: SettingsProfile = {
        id: 'default',
        name: '默认配置',
        adapterId: defaultAdapter.id,
        config: {
          endpoint: defaultAdapter.defaultConfig.endpoint || '',
          apiKey: '',
          model: defaultAdapter.defaultConfig.model || '',
        },
      }
      profiles.value = [profile]
      activeProfileId.value = profile.id
      save()
    }
    loaded.value = true
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profiles: profiles.value,
      activeProfileId: activeProfileId.value,
    }))
  }

  function reload() {
    load()
  }

  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeProfileId.value) || profiles.value[0]
  )
  const activeConfig = computed(() => activeProfile.value?.config)

  function updateProfile(id: string, updates: Partial<SettingsProfile>) {
    const profile = profiles.value.find(p => p.id === id)
    if (profile) { Object.assign(profile, updates); save() }
  }

  function addProfile(name: string, adapterId: string, config: AdapterConfig) {
    const id = Date.now().toString()
    profiles.value.push({ id, name, adapterId, config })
    activeProfileId.value = id
    save()
    return id
  }

  function deleteProfile(id: string) {
    if (profiles.value.length <= 1) return
    profiles.value = profiles.value.filter(p => p.id !== id)
    if (activeProfileId.value === id) activeProfileId.value = profiles.value[0].id
    save()
  }

  function setActiveProfile(id: string) {
    activeProfileId.value = id
    save()
  }

  load()

  return { profiles, activeProfileId, activeProfile, activeConfig, loaded, updateProfile, addProfile, deleteProfile, setActiveProfile, reload }
})
