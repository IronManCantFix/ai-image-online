<template>
  <div @click="$emit('close')" class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-2 sm:p-4">
    <div @click.stop class="relative max-w-[95vw] max-h-[95vh]">
      <img :src="imageUrl" alt="预览" class="max-w-full max-h-[85vh] object-contain rounded-lg" />
      <button @click="$emit('close')"
        class="absolute top-2 right-2 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center text-xl hover:bg-black/70">
        ×
      </button>
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
