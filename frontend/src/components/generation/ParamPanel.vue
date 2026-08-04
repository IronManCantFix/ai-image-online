<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold text-gray-700">生成参数</h3>
    <div v-for="field in schema.fields" :key="field.key">
      <label class="block text-sm font-medium text-gray-600 mb-1">{{ field.label }}</label>

      <div v-if="field.type === 'select'" class="relative">
        <select v-model="values[field.key]"
          class="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-9 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          min-h-[44px] appearance-none">
          <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <input v-else-if="field.type === 'number'" type="number" v-model.number="values[field.key]"
        :min="field.min" :max="field.max"
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]" />

      <input v-else-if="field.type === 'text'" type="text" v-model="values[field.key]"
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]" />

      <div v-else-if="field.type === 'toggle'">
        <button @click="values[field.key] = !values[field.key]"
          class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
          :class="values[field.key] ? 'bg-primary-600' : 'bg-gray-300'">
          <span class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow"
            :class="values[field.key] ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </div>

      <p v-if="field.description" class="mt-1 text-xs text-gray-400">{{ field.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ParamSchema } from '@/adapters/types'

const props = defineProps<{ schema: ParamSchema }>()
const emit = defineEmits<{ (e: 'update', values: Record<string, string | number | boolean>): void }>()

const values = ref<Record<string, string | number | boolean>>({})

watch(() => props.schema, (schema) => {
  const defaults: Record<string, string | number | boolean> = {}
  for (const field of schema.fields) defaults[field.key] = field.default
  values.value = defaults
  emit('update', values.value)
}, { immediate: true })

watch(values, () => emit('update', values.value), { deep: true })
</script>
