<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-5">生成历史</h1>
    <HistoryPanel @preview="onPreview" />
    <ImageModal v-if="previewImage" :image="previewImage" @close="previewImage = null" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GenResultImage } from '@/adapters/types'
import HistoryPanel from '@/components/generation/HistoryPanel.vue'
import ImageModal from '@/components/ui/ImageModal.vue'

const previewImage = ref<GenResultImage | null>(null)

function onPreview(img: GenResultImage) {
  previewImage.value = img
}
</script>
