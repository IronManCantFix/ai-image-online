<template>
  <div class="space-y-3">
    <h3 class="text-sm font-semibold text-gray-700 mb-2">生成参数</h3>

    <div v-for="field in schema.fields" :key="field.key">
      <div class="text-sm font-medium text-gray-700 mb-1.5">{{ field.label }}</div>

      <!-- Select：按钮组，全部展示，点击选中 -->
      <div v-if="field.type === 'select'" class="flex flex-wrap gap-1.5">
        <button
          v-for="opt in field.options"
          :key="opt.value"
          @click="values[field.key] = opt.value"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[36px]"
          :class="values[field.key] === opt.value
            ? 'bg-primary-600 text-white border-primary-600'
            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Number -->
      <div v-else-if="field.type === 'number'" class="flex items-center gap-2">
        <button @click="decrement(field)"
          class="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center">−</button>
        <span class="text-sm font-medium text-gray-700 w-8 text-center">{{ values[field.key] }}</span>
        <button @click="increment(field)"
          class="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center">+</button>
      </div>

      <!-- Text -->
      <input v-else-if="field.type === 'text'" type="text" v-model="values[field.key]"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[40px]" />

      <!-- Toggle -->
      <button v-else-if="field.type === 'toggle'" @click="values[field.key] = !values[field.key]"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        :class="values[field.key] ? 'bg-primary-600' : 'bg-gray-300'">
        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
          :class="values[field.key] ? 'translate-x-6' : 'translate-x-1'" />
      </button>

      <p v-if="field.description" class="mt-1 text-xs text-gray-400">{{ field.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ParamSchema, ParamField } from '@/adapters/types'

const props = defineProps<{ schema: ParamSchema }>()
const emit = defineEmits<{ (e: 'update', values: Record<string, string | number | boolean>): void }>()

const values = ref<Record<string, string | number | boolean>>({})

function increment(field: ParamField) {
  const current = Number(values.value[field.key] || 0)
  const max = field.max ?? 99
  values.value[field.key] = Math.min(current + 1, max)
}

function decrement(field: ParamField) {
  const current = Number(values.value[field.key] || 0)
  const min = field.min ?? 0
  values.value[field.key] = Math.max(current - 1, min)
}

watch(() => props.schema, (schema) => {
  const defaults: Record<string, string | number | boolean> = {}
  for (const field of schema.fields) defaults[field.key] = field.default
  values.value = defaults
  emit('update', values.value)
}, { immediate: true })

watch(values, () => emit('update', values.value), { deep: true })
</script>
