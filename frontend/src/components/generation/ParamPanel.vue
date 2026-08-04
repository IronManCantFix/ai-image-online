<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold text-gray-700">生成参数</h3>
    <div v-for="field in schema.fields" :key="field.key">
      <label class="block text-sm font-medium text-gray-600 mb-1">{{ field.label }}</label>

      <!-- Select -->
      <select v-if="field.type === 'select'" v-model="values[field.key]"
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white appearance-none
        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23667eea%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%2F%3E%3C%2Fsvg%3E')]
        bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5rem] pr-10
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        min-h-[44px]">
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <!-- Number -->
      <input v-else-if="field.type === 'number'" type="number" v-model.number="values[field.key]"
        :min="field.min" :max="field.max"
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]" />

      <!-- Text -->
      <input v-else-if="field.type === 'text'" type="text" v-model="values[field.key]"
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px]" />

      <!-- Toggle -->
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
