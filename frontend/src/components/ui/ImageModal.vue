<template>
  <div @click="$emit('close')" class="fixed inset-0 z-[100] bg-black/80 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
    <div @click.stop class="relative max-w-[95vw] max-h-[95vh]">
      <img :src="imageUrl" alt="预览" class="max-w-full max-h-[85vh] object-contain rounded-xl" />
      <button @click="$emit('close')" class="absolute top-2 right-2 w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center text-xl hover:bg-white/20 cursor-pointer backdrop-blur">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GenResultImage } from '@/adapters/types'
const props = defineProps<{ image: GenResultImage }>()
defineEmits<{ (e: 'close'): void }>()
const imageUrl = computed(() => props.image.url)
</script>
