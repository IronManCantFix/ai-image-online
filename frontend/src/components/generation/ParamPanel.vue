<template>
  <div class="space-y-3">
    <h3 class="text-sm font-semibold text-gray-700 mb-2">生成参数</h3>

    <div v-for="field in schema.fields" :key="field.key">
      <div class="text-sm font-medium text-gray-700 mb-1">{{ field.label }}</div>

      <!-- Select 类型 -->
      <template v-if="field.type === 'select'">
        <!-- 移动端：Vant Picker 弹窗 -->
        <van-field
          v-if="isMobile"
          :model-value="displayValues[field.key] || ''"
          readonly
          is-link
          input-align="left"
          placeholder="请选择"
          class="!bg-white !rounded-lg !border !border-gray-200"
          @click="openPicker(field)"
        />
        <!-- PC 端：原生 select -->
        <div v-else class="relative">
          <select
            v-model="values[field.key]"
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-9 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            min-h-[44px] appearance-none cursor-pointer"
          >
            <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </template>

      <!-- Number 类型：Vant Stepper（两端通用） -->
      <van-stepper
        v-else-if="field.type === 'number'"
        :model-value="Number(values[field.key])"
        :min="field.min"
        :max="field.max"
        class="mt-1"
        @update:model-value="values[field.key] = $event"
      />

      <!-- Text 类型 -->
      <van-field
        v-else-if="field.type === 'text'"
        :model-value="String(values[field.key] || '')"
        class="!bg-white !rounded-lg !border !border-gray-200"
        @update:model-value="values[field.key] = $event"
      />

      <!-- Toggle 类型 -->
      <van-switch
        v-else-if="field.type === 'toggle'"
        :model-value="!!values[field.key]"
        @update:model-value="values[field.key] = $event"
      />

      <p v-if="field.description" class="mt-1 text-xs text-gray-400">{{ field.description }}</p>
    </div>

    <!-- Vant Picker 弹窗（仅移动端使用） -->
    <van-popup
      v-if="isMobile"
      v-model:show="pickerShow"
      position="bottom"
      round
    >
      <van-picker
        :columns="pickerColumns"
        @confirm="onPickerConfirm"
        @cancel="pickerShow = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ParamSchema, ParamField } from '@/adapters/types'
import { useIsMobile } from '@/composables/useMediaQuery'

const props = defineProps<{ schema: ParamSchema }>()
const emit = defineEmits<{ (e: 'update', values: Record<string, string | number | boolean>): void }>()

const isMobile = useIsMobile()
const values = ref<Record<string, string | number | boolean>>({})

const displayValues = computed(() => {
  const result: Record<string, string> = {}
  for (const field of props.schema.fields) {
    if (field.type === 'select' && field.options) {
      const opt = field.options.find(o => o.value === values.value[field.key])
      result[field.key] = opt ? opt.label : ''
    }
  }
  return result
})

const pickerShow = ref(false)
const pickerColumns = ref<{ text: string; value: string }[]>([])
const currentField = ref<ParamField | null>(null)

function openPicker(field: ParamField) {
  if (!field.options) return
  currentField.value = field
  pickerColumns.value = field.options.map(o => ({ text: o.label, value: o.value }))
  pickerShow.value = true
}

function onPickerConfirm({ selectedValues }: { selectedValues: string[] }) {
  if (currentField.value && selectedValues[0]) {
    values.value[currentField.value.key] = selectedValues[0]
  }
  pickerShow.value = false
}

watch(() => props.schema, (schema) => {
  const defaults: Record<string, string | number | boolean> = {}
  for (const field of schema.fields) defaults[field.key] = field.default
  values.value = defaults
  emit('update', values.value)
}, { immediate: true })

watch(values, () => emit('update', values.value), { deep: true })
</script>
