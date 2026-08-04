<template>
  <div class="space-y-3">
    <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">生成参数</h3>
    <div v-for="field in schema.fields" :key="field.key">
      <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{{ field.label }}</div>

      <div v-if="field.type === 'select'" class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        <button v-for="opt in field.options" :key="opt.value" @click="values[field.key] = opt.value"
          class="px-2 py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[34px] cursor-pointer text-center leading-tight"
          :class="values[field.key] === opt.value
            ? 'bg-primary-600 text-white border-primary-500'
            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-slate-200'">
          {{ opt.label }}
        </button>
      </div>

      <div v-else-if="field.type === 'number'" class="flex items-center gap-2">
        <button @click="decrement(field)" class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer">−</button>
        <span class="text-sm font-medium text-slate-700 dark:text-slate-200 w-8 text-center">{{ values[field.key] }}</span>
        <button @click="increment(field)" class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer">+</button>
      </div>

      <n-input v-else-if="field.type === 'text'" :value="String(values[field.key] || '')" size="small" @update:value="values[field.key] = $event" />

      <button v-else-if="field.type === 'toggle'" @click="values[field.key] = !values[field.key]"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
        :class="values[field.key] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'">
        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
          :class="values[field.key] ? 'translate-x-6' : 'translate-x-1'" />
      </button>

      <p v-if="field.description" class="mt-1 text-xs text-slate-400 dark:text-slate-600">{{ field.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput } from 'naive-ui'
import type { ParamSchema, ParamField } from '@/adapters/types'

const props = defineProps<{ schema: ParamSchema }>()
const emit = defineEmits<{ (e: 'update', values: Record<string, string | number | boolean>): void }>()

const values = ref<Record<string, string | number | boolean>>({})

function increment(field: ParamField) { const c = Number(values.value[field.key] || 0); values.value[field.key] = Math.min(c + 1, field.max ?? 99) }
function decrement(field: ParamField) { const c = Number(values.value[field.key] || 0); values.value[field.key] = Math.max(c - 1, field.min ?? 0) }

watch(() => props.schema, (s) => {
  const d: Record<string, string | number | boolean> = {}
  for (const f of s.fields) d[f.key] = f.default
  values.value = d
  emit('update', values.value)
}, { immediate: true })

watch(values, () => emit('update', values.value), { deep: true })
</script>
