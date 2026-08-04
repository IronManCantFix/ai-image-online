<template>
  <div class="flex flex-col lg:grid lg:grid-cols-[360px_1fr] gap-4 lg:gap-6">
    <div class="space-y-3">
      <ImageUploader v-model:images="images" />
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">提示词 (Prompt)</label>
        <textarea v-model="prompt" rows="2" placeholder="描述你想基于参考图片生成的内容..."
          class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[60px] transition-colors"></textarea>
      </div>
      <ParamPanel :schema="schema" @update="onParamsUpdate" />
      <button @click="generate" :disabled="gen.loading || !prompt.trim() || images.length === 0"
        class="w-full px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] cursor-pointer transition-colors">
        {{ gen.loading ? '生成中...' : '生成图片' }}
      </button>
    </div>
    <div>
      <ResultGallery :loading="gen.loading" :error="gen.error" :results="gen.imageResults"
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
  try {
    const profile = settings.activeProfile
    if (!profile || !profile.config.apiKey) {
      alert('请先配置 API Key')
      return
    }
    await gallery.save({
      adapterId: profile.adapterId,
      mode: 'image-to-image',
      prompt: prompt.value,
      params: params.value,
      image: img,
      apiConfig: { endpoint: profile.config.endpoint, model: profile.config.model },
    })
    alert('已保存到画廊！')
    emit('saved')
  } catch (e) {
    console.error('保存失败:', e)
    alert('保存失败: ' + (e instanceof Error ? e.message : String(e)))
  }
}
</script>
