<template>
  <div @click="$emit('close')" class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
    <div @click.stop class="relative max-w-[90vw] max-h-[90vh]">
      <img :src="imageUrl" alt="预览" class="max-w-full max-h-[90vh] object-contain rounded-lg" />
      <button @click="$emit('close')"
        class="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">×</button>
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
