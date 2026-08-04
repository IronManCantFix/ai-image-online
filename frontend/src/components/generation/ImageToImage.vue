<template>
  <div class="flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
    <div class="space-y-4">
      <ImageUploader v-model:images="images" />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">提示词 (Prompt)</label>
        <textarea v-model="prompt" rows="3" placeholder="描述你想基于参考图片生成的内容..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-y bg-white
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"></textarea>
      </div>

      <ParamPanel :schema="schema" @update="onParamsUpdate" />

      <button @click="generate" :disabled="gen.loading || !prompt.trim() || images.length === 0"
        class="w-full px-4 py-3 rounded-lg bg-primary-600 text-white text-sm font-medium
        hover:bg-primary-700 disabled:opacity-50 min-h-[48px] transition-colors">
        {{ gen.loading ? '生成中...' : '生成图片' }}
      </button>
    </div>

    <div>
      <ResultGallery :loading="gen.loading" :error="gen.error" :results="gen.results"
        @preview="onPreview" @save="onSave" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { useSettingsStore } from '@/stores/settings'
import { getAdapter } from '@/adapters/registry'
import type { ParamSchema, GenResultImage } from '@/adapters/types'
import ParamPanel from './ParamPanel.vue'
import ResultGallery from './ResultGallery.vue'
import ImageUploader from './ImageUploader.vue'
import { useGalleryStore } from '@/stores/gallery'

const gen = useGenerationStore()
const settings = useSettingsStore()
const gallery = useGalleryStore()
const images = ref<File[]>([])
const prompt = ref('')
const params = ref<Record<string, string | number | boolean>>({})

const adapter = getAdapter(settings.activeProfile?.adapterId || 'gpt-image-2')!
const schema: ParamSchema = adapter.getParamSchema()

const emit = defineEmits<{ (e: 'preview', img: GenResultImage): void; (e: 'saved'): void }>()

function onParamsUpdate(values: Record<string, string | number | boolean>) { params.value = values }
async function generate() { await gen.generateImageToImage(prompt.value, images.value, params.value) }
function onPreview(img: GenResultImage) { emit('preview', img) }
async function onSave(img: GenResultImage, _index: number) {
  await gallery.save({
    adapterId: settings.activeProfile!.adapterId,
    mode: 'image-to-image',
    prompt: prompt.value,
    params: params.value,
    image: img,
    apiConfig: { endpoint: settings.activeProfile!.config.endpoint, model: settings.activeProfile!.config.model },
  })
  emit('saved')
}
</script>
