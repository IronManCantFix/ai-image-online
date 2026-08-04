<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">API 设置</h1>
      <button @click="showAddModal = true"
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 cursor-pointer min-h-[40px] transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        新建提供商
      </button>
    </div>

    <!-- 提供商列表 -->
    <div class="space-y-3">
      <div v-for="p in store.profiles" :key="p.id"
        @click="selectProfile(p.id)"
        class="rounded-xl border p-4 cursor-pointer transition-all"
        :class="store.activeProfileId === p.id
          ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="store.activeProfileId === p.id ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'"></div>
            <span class="font-medium text-slate-900 dark:text-slate-100 text-sm">{{ p.name }}</span>
            <span v-if="store.activeProfileId === p.id" class="text-xs text-primary-600 dark:text-primary-400">当前使用</span>
          </div>
          <button v-if="store.profiles.length > 1" @click.stop="store.deleteProfile(p.id)"
            class="text-slate-400 hover:text-red-500 text-xs px-2 py-1 rounded cursor-pointer">删除</button>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-slate-400 dark:text-slate-600">地址</span>
            <p class="text-slate-600 dark:text-slate-300 truncate">{{ p.config.endpoint || '未配置' }}</p>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-600">模型</span>
            <p class="text-slate-600 dark:text-slate-300">{{ p.config.model || '未配置' }}</p>
          </div>
          <div>
            <span class="text-slate-400 dark:text-slate-600">Key</span>
            <p :class="p.config.apiKey ? 'text-green-600 dark:text-green-400' : 'text-slate-400'">{{ p.config.apiKey ? '已配置' : '未配置' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑区（选中后显示） -->
    <div v-if="activeProfile" class="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">编辑：{{ activeProfile.name }}</h3>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">配置名称</label>
        <input v-model="activeProfile.name" @input="save" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors" />
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API 地址</label>
        <input v-model="activeProfile.config.endpoint" @input="save" placeholder="https://www.dreamfield.top/v1" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors" />
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API Key</label>
        <input v-model="activeProfile.config.apiKey" @input="save" type="password" placeholder="sk-..." class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors" />
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">模型名称</label>
        <input v-model="activeProfile.config.model" @input="save" placeholder="gpt-image-2" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors" />
      </div>
      <div class="flex items-center gap-3 pt-1">
        <button @click="runTest" :disabled="testing" class="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 disabled:opacity-40 min-h-[40px] cursor-pointer transition-colors">{{ testing ? '测试中...' : '测试连接' }}</button>
        <p v-if="testResult" :class="testResult.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" class="text-sm break-all">{{ testResult.message }}</p>
      </div>
    </div>

    <!-- 新建提供商弹窗 -->
    <div v-if="showAddModal" @click.self="showAddModal = false"
      class="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">新建提供商</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-2xl leading-none">×</button>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">配置名称</label>
          <input v-model="newProfile.name" placeholder="如：Dreamfield、OpenAI" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API 地址</label>
          <input v-model="newProfile.endpoint" placeholder="https://www.dreamfield.top/v1" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API Key</label>
          <input v-model="newProfile.apiKey" type="password" placeholder="sk-..." class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">模型名称</label>
          <input v-model="newProfile.model" placeholder="gpt-image-2" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <div class="flex gap-2 pt-1">
          <button @click="showAddModal = false" class="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">取消</button>
          <button @click="addProfile" :disabled="!newProfile.name.trim()"
            class="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 disabled:opacity-40 cursor-pointer transition-colors">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { getAdapter } from '@/adapters/registry'
import { useConnectionTest } from '@/composables/useConnectionTest'

const store = useSettingsStore()
const { activeProfile } = storeToRefs(store)
const { testing, testResult, test } = useConnectionTest()

const showAddModal = ref(false)
const newProfile = ref({ name: '', endpoint: '', apiKey: '', model: 'gpt-image-2' })

function selectProfile(id: string) { store.setActiveProfile(id) }
function save() { if (activeProfile.value) store.updateProfile(activeProfile.value.id, { config: { ...activeProfile.value.config } }) }
function runTest() { if (activeProfile.value) test(activeProfile.value.config.endpoint, activeProfile.value.config.apiKey, activeProfile.value.config.model) }

function addProfile() {
  if (!newProfile.value.name.trim()) return
  const a = getAdapter('gpt-image-2')!
  store.addProfile(newProfile.value.name, a.id, { endpoint: newProfile.value.endpoint, apiKey: newProfile.value.apiKey, model: newProfile.value.model })
  newProfile.value = { name: '', endpoint: '', apiKey: '', model: 'gpt-image-2' }
  showAddModal.value = false
}
</script>
