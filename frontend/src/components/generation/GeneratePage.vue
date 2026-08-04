<template>
  <div>
    <!-- 提供商选择 -->
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xs text-slate-400 dark:text-slate-600 shrink-0">提供商</span>
      <select v-model="store.activeProfileId" @change="store.setActiveProfile(store.activeProfileId)"
        class="flex-1 sm:max-w-[200px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer min-h-[32px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-colors">
        <option v-for="p in store.profiles" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <!-- Tab 切换 -->
    <div class="flex gap-1 mb-5 border-b border-slate-200 dark:border-slate-800">
      <button v-for="tab in tabs" :key="tab.id" @click="mode = tab.id"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer min-h-[44px]"
        :class="mode === tab.id ? 'border-primary-500 text-primary-700 dark:text-primary-300' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
        {{ tab.label }}
      </button>
    </div>

    <div v-if="!hasApiKey" class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 mb-5">
      <p class="text-amber-700 dark:text-amber-300 text-sm">
        尚未配置 API Key，请先前往
        <router-link to="/settings" class="underline font-medium text-amber-800 dark:text-amber-200">设置页面</router-link>
        配置。
      </p>
    </div>

    <TextToImage v-if="mode === 'text'" @preview="onPreview" @saved="onSaved" />
    <ImageToImage v-else @preview="onPreview" @saved="onSaved" />
    <ImageModal v-if="previewImage" :image="previewImage" @close="previewImage = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { GenResultImage } from '@/adapters/types'
import TextToImage from './TextToImage.vue'
import ImageToImage from './ImageToImage.vue'
import ImageModal from '@/components/ui/ImageModal.vue'

const store = useSettingsStore()
const mode = ref<'text' | 'image'>('text')
const previewImage = ref<GenResultImage | null>(null)
const tabs = [{ id: 'text' as const, label: '文生图' }, { id: 'image' as const, label: '图生图' }]
const hasApiKey = computed(() => !!store.activeProfile?.config.apiKey)
function onPreview(img: GenResultImage) { previewImage.value = img }
function onSaved() {}
</script>
