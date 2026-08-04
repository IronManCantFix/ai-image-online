<template>
  <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">提示词 (Prompt)</label>
        <textarea v-model="prompt" rows="6" placeholder="描述你想要生成的图片..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-y"></textarea>
      </div>
      <ParamPanel :schema="schema" @update="onParamsUpdate" />
      <button @click="generate" :disabled="gen.loading || !prompt.trim()"
        class="w-full px-4 py-2.5 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
        {{ gen.loading ? '生成中...' : '生成图片' }}
      </button>
    </div>
    <div>
      <ResultGallery :loading="gen.loading" :error="gen.error" :results="gen.results" @preview="onPreview" @save="onSave" />
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
import { useGalleryStore } from '@/stores/gallery'

const gen = useGenerationStore()
const settings = useSettingsStore()
const gallery = useGalleryStore()
const prompt = ref('')
const params = ref<Record<string, string | number | boolean>>({})

const adapter = getAdapter(settings.activeProfile?.adapterId || 'gpt-image-2')!
const schema: ParamSchema = adapter.getParamSchema()

const emit = defineEmits<{ (e: 'preview', img: GenResultImage): void; (e: 'saved'): void }>()

function onParamsUpdate(values: Record<string, string | number | boolean>) { params.value = values }
async function generate() { await gen.generateTextToImage(prompt.value, params.value) }
function onPreview(img: GenResultImage) { emit('preview', img) }
async function onSave(img: GenResultImage, _index: number) {
  await gallery.save({
    adapterId: settings.activeProfile!.adapterId,
    mode: 'text-to-image',
    prompt: prompt.value,
    params: params.value,
    image: img,
    apiConfig: { endpoint: settings.activeProfile!.config.endpoint, model: settings.activeProfile!.config.model },
  })
  emit('saved')
}
</script>
