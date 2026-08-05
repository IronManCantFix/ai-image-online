<template>
  <div class="flex flex-col lg:grid lg:grid-cols-[360px_1fr] gap-4 lg:gap-6">
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">提示词 (Prompt)</label>
        <textarea v-model="prompt" rows="3" placeholder="描述你想要生成的图片..."
          class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[80px] transition-colors"></textarea>
      </div>
      <ParamPanel :schema="schema" @update="onParamsUpdate" />
      <button @click="generate" :disabled="gen.loading || !prompt.trim()"
        class="w-full px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] cursor-pointer transition-colors">
        {{ gen.loading ? '生成中...' : '生成图片' }}
      </button>
    </div>
    <div>
      <ResultGallery :loading="gen.loading" :error="gen.error" :results="gen.textResults"
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
  try {
    await img.ready
    const profile = settings.activeProfile
    if (!profile || !profile.config.apiKey) {
      alert('请先配置 API Key')
      return
    }
    const histEntry = gen.history.find(h => h.images.some(hi => hi.data === img.data))
    const histIndex = histEntry ? histEntry.images.findIndex(hi => hi.data === img.data) : -1
    if (histEntry && histIndex >= 0 && gallery.items.some(g => g.sourceHistoryId === histEntry.id && g.sourceHistoryImageIndex === histIndex)) {
      alert('该图片已在画廊中')
      return
    }
    await gallery.save({
      adapterId: profile.adapterId,
      mode: 'text-to-image',
      prompt: prompt.value,
      params: params.value,
      image: img,
      apiConfig: { endpoint: profile.config.endpoint, model: profile.config.model },
      sourceHistoryId: histEntry?.id,
      sourceHistoryImageIndex: histIndex >= 0 ? histIndex : undefined,
    })
    alert('已添加到画廊！')
    emit('saved')
  } catch (e) {
    console.error('保存失败:', e)
    alert('保存失败: ' + (e instanceof Error ? e.message : String(e)))
  }
}
</script>
