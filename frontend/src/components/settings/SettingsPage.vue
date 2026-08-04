<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">API 设置</h1>
      <n-button size="small" type="primary" @click="showAddModal = true">
        <template #icon><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg></template>
        新建提供商
      </n-button>
    </div>

    <div class="space-y-3">
      <div v-for="p in store.profiles" :key="p.id"
        @click="selectProfile(p.id)"
        class="rounded-xl border p-4 cursor-pointer transition-all"
        :class="store.activeProfileId === p.id
          ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="store.activeProfileId === p.id ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'"></div>
            <span class="font-medium text-slate-900 dark:text-slate-100 text-sm">{{ p.name }}</span>
            <span v-if="store.activeProfileId === p.id" class="text-xs text-primary-600 dark:text-primary-400">当前</span>
          </div>
          <n-button v-if="store.profiles.length > 1" size="tiny" quaternary type="error" @click.stop="store.deleteProfile(p.id)">删除</n-button>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div><span class="text-slate-400 dark:text-slate-600">地址</span><p class="text-slate-600 dark:text-slate-300 truncate">{{ p.config.endpoint || '未配置' }}</p></div>
          <div><span class="text-slate-400 dark:text-slate-600">模型</span><p class="text-slate-600 dark:text-slate-300">{{ p.config.model || '未配置' }}</p></div>
          <div><span class="text-slate-400 dark:text-slate-600">Key</span><p :class="p.config.apiKey ? 'text-green-600 dark:text-green-400' : 'text-slate-400'">{{ p.config.apiKey ? '已配置' : '未配置' }}</p></div>
        </div>
      </div>
    </div>

    <div v-if="activeProfile" class="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">编辑：{{ activeProfile.name }}</h3>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">配置名称</label>
        <n-input v-model:value="activeProfile.name" size="small" @update:value="save" />
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API 地址</label>
        <n-input v-model:value="activeProfile.config.endpoint" size="small" placeholder="https://www.dreamfield.top/v1" @update:value="save" />
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API Key</label>
        <div class="relative">
          <input
            v-model="activeProfile.config.apiKey"
            @input="save"
            :type="showKey ? 'text' : 'password'"
            placeholder="sk-..."
            class="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
          <button @click="showKey = !showKey" type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1">
            <svg v-if="!showKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A7.962 7.962 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 01-4.243-4.243M3 3l18 18" />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">模型名称</label>
        <n-input v-model:value="activeProfile.config.model" size="small" placeholder="gpt-image-2" @update:value="save" />
      </div>
      <div class="flex items-center gap-3 pt-1">
        <n-button size="small" type="primary" :loading="testing" @click="runTest">测试连接</n-button>
        <n-text v-if="testResult" :type="testResult.ok ? 'success' : 'error'" class="text-sm">{{ testResult.message }}</n-text>
      </div>
    </div>

    <n-modal v-model:show="showAddModal" preset="card" title="新建提供商" class="max-w-md">
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">配置名称</label>
          <n-input v-model:value="newProfile.name" placeholder="如：Dreamfield、OpenAI" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API 地址</label>
          <n-input v-model:value="newProfile.endpoint" placeholder="https://www.dreamfield.top/v1" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">API Key</label>
          <div class="relative">
            <input v-model="newProfile.apiKey" :type="showNewKey ? 'text' : 'password'" placeholder="sk-..."
              class="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            <button @click="showNewKey = !showNewKey" type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1">
              <svg v-if="!showNewKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A7.962 7.962 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 01-4.243-4.243M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">模型名称</label>
          <n-input v-model:value="newProfile.model" placeholder="gpt-image-2" />
        </div>
        <div class="flex gap-2 pt-2">
          <n-button class="flex-1" @click="showAddModal = false">取消</n-button>
          <n-button class="flex-1" type="primary" :disabled="!newProfile.name.trim()" @click="addProfile">创建</n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NInput, NButton, NModal, NText } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'
import { getAdapter } from '@/adapters/registry'
import { useConnectionTest } from '@/composables/useConnectionTest'

const store = useSettingsStore()
const { activeProfile } = storeToRefs(store)
const { testing, testResult, test } = useConnectionTest()

const showAddModal = ref(false)
const showKey = ref(false)
const showNewKey = ref(false)
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
  showNewKey.value = false
}
</script>
