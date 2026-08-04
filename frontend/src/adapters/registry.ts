import type { ImageAdapter } from '@/adapters/types'
import { gptImage2Adapter } from './gpt-image-2'

const adapters: Record<string, ImageAdapter> = {
  [gptImage2Adapter.id]: gptImage2Adapter,
}

export function getAdapter(id: string): ImageAdapter | undefined {
  return adapters[id]
}
export function getAllAdapters(): ImageAdapter[] {
  return Object.values(adapters)
}
export function getDefaultAdapter(): ImageAdapter {
  return gptImage2Adapter
}
