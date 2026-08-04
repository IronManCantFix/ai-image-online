<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold text-gray-700">生成参数</h3>
    <div v-for="field in schema.fields" :key="field.key">
      <label class="block text-sm font-medium text-gray-600 mb-1">{{ field.label }}</label>
      <select v-if="field.type === 'select'" v-model="values[field.key]"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input v-else-if="field.type === 'number'" type="number" v-model.number="values[field.key]"
        :min="field.min" :max="field.max"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      <input v-else-if="field.type === 'text'" type="text" v-model="values[field.key]"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      <div v-else-if="field.type === 'toggle'">
        <button @click="values[field.key] = !values[field.key]"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="values[field.key] ? 'bg-primary-600' : 'bg-gray-300'">
          <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
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
