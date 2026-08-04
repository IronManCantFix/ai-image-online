<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">参考图片</label>
    <div @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="onDrop"
      class="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer min-h-[120px] flex items-center justify-center"
      :class="dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'"
      @click="fileInput?.click()">
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileSelect" />
      <div v-if="images.length === 0">
        <p class="text-gray-500 text-sm">点击或拖拽图片到此处上传</p>
        <p class="text-gray-400 text-xs mt-1">支持多张图片</p>
      </div>
      <div v-else class="flex flex-wrap gap-2 justify-center">
        <div v-for="(img, i) in previewUrls" :key="i" class="relative">
          <img :src="img" class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200" />
          <button @click.stop="removeImage(i)"
            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center min-w-[20px]">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ images: File[] }>()
const emit = defineEmits<{ (e: 'update:images', files: File[]): void }>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const previewUrls = ref<string[]>([])

function addFiles(files: FileList | File[]) {
  const newImages = [...props.images, ...Array.from(files).filter(f => f.type.startsWith('image/'))]
  emit('update:images', newImages)
}
function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) addFiles(target.files)
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}
function removeImage(index: number) {
  emit('update:images', props.images.filter((_, i) => i !== index))
}
watch(() => props.images, (imgs) => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
  previewUrls.value = imgs.map(f => URL.createObjectURL(f))
}, { immediate: true, deep: true })
</script>
