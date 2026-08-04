<template>
  <div class="max-w-xl mx-auto">
    <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5">API 设置</h1>
    <div class="mb-5">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">配置文件</label>
      <div class="flex flex-col sm:flex-row gap-2">
        <select v-model="store.activeProfileId" @change="store.setActiveProfile(store.activeProfileId)"
          class="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors">
          <option v-for="p in store.profiles" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div class="flex gap-2">
          <button @click="showAddProfile = !showAddProfile" class="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[44px] cursor-pointer transition-colors">新建</button>
          <button v-if="store.profiles.length > 1" @click="store.deleteProfile(activeProfile.id)" class="px-3 py-2.5 text-sm rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 min-h-[44px] cursor-pointer transition-colors">删除</button>
        </div>
      </div>
      <div v-if="showAddProfile" class="mt-2 flex gap-2">
        <input v-model="newProfileName" placeholder="配置名称" class="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[44px]" />
        <button @click="addProfile" class="px-3 py-2.5 text-sm rounded-xl bg-primary-600 text-white hover:bg-primary-500 min-h-[44px] cursor-pointer transition-colors">确认</button>
      </div>
    </div>
    <div class="space-y-3" v-if="activeProfile">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">适配器类型</label>
        <select v-model="activeProfile.adapterId" @change="onAdapterChange" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors">
          <option v-for="a in adapters" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API 地址</label>
        <input v-model="activeProfile.config.endpoint" @input="save" placeholder="https://www.dreamfield.top/v1" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors" />
        <p class="mt-1 text-xs text-slate-400 dark:text-slate-600">OpenAI 兼容 API 基础地址</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key</label>
        <input v-model="activeProfile.config.apiKey" @input="save" type="password" placeholder="sk-..." class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">模型名称</label>
        <input v-model="activeProfile.config.model" @input="save" placeholder="gpt-image-2" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors" />
      </div>
      <div class="pt-1">
        <button @click="runTest" :disabled="testing" class="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 disabled:opacity-40 min-h-[44px] cursor-pointer transition-colors">{{ testing ? '测试中...' : '测试连接' }}</button>
        <p v-if="testResult" :class="testResult.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="mt-2 text-sm break-all">{{ testResult.message }}</p>
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
function save() { if (activeProfile.value) store.updateProfile(activeProfile.value.id, { config: { ...activeProfile.value.config } }) }
function onAdapterChange() { const a = getAdapter(activeProfile.value.adapterId); if (a?.defaultConfig) { activeProfile.value.config.model = a.defaultConfig.model || ''; if (!activeProfile.value.config.endpoint && a.defaultConfig.endpoint) activeProfile.value.config.endpoint = a.defaultConfig.endpoint } save() }
function addProfile() { if (!newProfileName.value.trim()) return; const a = getAdapter('gpt-image-2')!; store.addProfile(newProfileName.value, a.id, { endpoint: a.defaultConfig.endpoint || '', apiKey: '', model: a.defaultConfig.model || '' }); newProfileName.value = ''; showAddProfile.value = false }
function runTest() { if (activeProfile.value) test(activeProfile.value.config.endpoint, activeProfile.value.config.apiKey, activeProfile.value.config.model) }
</script>
