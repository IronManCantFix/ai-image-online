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
        <div class="grid grid-cols-2 gap-2 text-xs">
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
        <n-input v-model:value="activeProfile.config.apiKey" size="small" type="password" show-password-toggle-on="click" placeholder="sk-..." @update:value="save" />
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

    <!-- 新建提供商弹窗 -->
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
          <n-input v-model:value="newProfile.apiKey" type="password" placeholder="sk-..." />
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
