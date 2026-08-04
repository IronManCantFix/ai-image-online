<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-xl sm:text-2xl font-bold mb-6">API 设置</h1>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">配置文件</label>
      <div class="flex flex-col sm:flex-row gap-2">
        <select v-model="store.activeProfileId" @change="store.setActiveProfile(store.activeProfileId)"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white appearance-none min-h-[44px]
          focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option v-for="p in store.profiles" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div class="flex gap-2">
          <button @click="showAddProfile = !showAddProfile"
            class="px-3 py-2.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 min-h-[44px]">新建</button>
          <button v-if="store.profiles.length > 1" @click="store.deleteProfile(activeProfile.id)"
            class="px-3 py-2.5 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 min-h-[44px]">删除</button>
        </div>
      </div>
      <div v-if="showAddProfile" class="mt-2 flex gap-2">
        <input v-model="newProfileName" placeholder="配置名称"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm min-h-[44px]" />
        <button @click="addProfile" class="px-3 py-2.5 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 min-h-[44px]">确认</button>
      </div>
    </div>

    <div class="space-y-4" v-if="activeProfile">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">适配器类型</label>
        <select v-model="activeProfile.adapterId" @change="onAdapterChange"
          class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white appearance-none min-h-[44px]
          focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option v-for="a in adapters" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">API 地址</label>
        <input v-model="activeProfile.config.endpoint" @input="save"
          placeholder="https://www.dreamfield.top/v1"
          class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm min-h-[44px]
          focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <p class="mt-1 text-xs text-gray-500">OpenAI 兼容 API 的基础地址，不含 /images/generations</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
        <input v-model="activeProfile.config.apiKey" @input="save" type="password"
          placeholder="sk-..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm min-h-[44px]
          focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
        <input v-model="activeProfile.config.model" @input="save"
          placeholder="gpt-image-2"
          class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm min-h-[44px]
          focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div class="pt-2">
        <button @click="runTest" :disabled="testing"
          class="px-4 py-3 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 min-h-[48px]">
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
        <p v-if="testResult" :class="testResult.ok ? 'text-green-600' : 'text-red-600'" class="mt-2 text-sm break-all">{{ testResult.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { getAllAdapters, getAdapter } from '@/adapters/registry'
import { useConnectionTest } from '@/composables/useConnectionTest'

const store = useSettingsStore()
const adapters = getAllAdapters()
const { testing, testResult, test } = useConnectionTest()

const showAddProfile = ref(false)
const newProfileName = ref('')
const activeProfile = computed(() => store.activeProfile)

function save() {
  if (activeProfile.value) {
    store.updateProfile(activeProfile.value.id, { config: { ...activeProfile.value.config } })
  }
}

function onAdapterChange() {
  const adapter = getAdapter(activeProfile.value.adapterId)
  if (adapter?.defaultConfig) {
    activeProfile.value.config.model = adapter.defaultConfig.model || ''
    if (!activeProfile.value.config.endpoint && adapter.defaultConfig.endpoint) {
      activeProfile.value.config.endpoint = adapter.defaultConfig.endpoint
    }
  }
  save()
}

function addProfile() {
  if (!newProfileName.value.trim()) return
  const adapter = getAdapter('gpt-image-2')!
  store.addProfile(newProfileName.value, adapter.id, {
    endpoint: adapter.defaultConfig.endpoint || '',
    apiKey: '',
    model: adapter.defaultConfig.model || '',
  })
  newProfileName.value = ''
  showAddProfile.value = false
}

function runTest() {
  if (activeProfile.value) {
    test(activeProfile.value.config.endpoint, activeProfile.value.config.apiKey, activeProfile.value.config.model)
  }
}
</script>
