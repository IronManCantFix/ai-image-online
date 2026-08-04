<template>
  <div>
    <div class="flex gap-2 mb-6 border-b border-gray-200">
      <button v-for="tab in tabs" :key="tab.id" @click="mode = tab.id"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="mode === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'">
        {{ tab.label }}
      </button>
    </div>
    <div v-if="!hasApiKey" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <p class="text-amber-800 text-sm">
        尚未配置 API Key，请先前往
        <router-link to="/settings" class="underline font-medium">设置页面</router-link>
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

const settings = useSettingsStore()
const mode = ref<'text' | 'image'>('text')
const previewImage = ref<GenResultImage | null>(null)

const tabs = [
  { id: 'text' as const, label: '文生图' },
  { id: 'image' as const, label: '图生图' },
]
const hasApiKey = computed(() => !!settings.activeProfile?.config.apiKey)
function onPreview(img: GenResultImage) { previewImage.value = img }
function onSaved() { /* MVP: 可加 toast */ }
</script>
