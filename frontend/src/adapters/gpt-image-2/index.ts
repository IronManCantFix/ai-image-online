import type { ImageAdapter, GenParams, EditParams, GenResult, GenResultImage } from '@/adapters/types'
import { gptImage2Schema } from './schema'
import { useProxy } from '@/composables/useProxy'

async function parseImageFromResponse(body: string): Promise<GenResultImage[]> {
  const data = JSON.parse(body)
  const images: GenResultImage[] = []
  for (const item of data.data || []) {
    if (item.b64_json) {
      const byteString = atob(item.b64_json)
      const bytes = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'image/png' })
      images.push({ data: blob, mimeType: 'image/png', url: URL.createObjectURL(blob) })
    } else if (item.url) {
      const resp = await fetch(item.url)
      const blob = await resp.blob()
      images.push({ data: blob, mimeType: blob.type, url: URL.createObjectURL(blob) })
    }
  }
  return images
}

function buildPayload(params: Record<string, string | number | boolean>) {
  return {
    model: '', // 在调用时设置
    prompt: '',
    n: Number(params.n || 1),
    size: String(params.size || '1024x1024'),
    quality: String(params.quality || 'standard'),
    resolution: String(params.resolution || '1k'),
    response_format: String(params.response_format || 'b64_json'),
  }
}

export const gptImage2Adapter: ImageAdapter = {
  id: 'gpt-image-2',
  name: 'GPT Image 2',
  features: ['text-to-image', 'image-to-image'],
  defaultConfig: {
    endpoint: 'https://www.dreamfield.top/v1',
    model: 'gpt-image-2',
  },
  getParamSchema() {
    return gptImage2Schema
  },
  async textToImage(params: GenParams): Promise<GenResult> {
    const { request } = useProxy()
    const { endpoint, apiKey, model } = params.config
    const payload = buildPayload(params.params)
    payload.model = model || 'gpt-image-2'
    payload.prompt = params.prompt

    const resp = await request({
      targetUrl: `${endpoint}/images/generations`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) throw new Error(`API 错误 (${resp.status}): ${resp.body}`)
    const images = await parseImageFromResponse(resp.body)
    return { images, raw: JSON.parse(resp.body) }
  },
  async imageToImage(params: EditParams): Promise<GenResult> {
    const { request } = useProxy()
    const { endpoint, apiKey, model } = params.config
    const p = buildPayload(params.params)
    const formData = new FormData()
    formData.append('model', model || 'gpt-image-2')
    formData.append('prompt', params.prompt)
    formData.append('n', String(p.n))
    formData.append('size', p.size)
    formData.append('quality', p.quality)
    formData.append('resolution', p.resolution)
    formData.append('response_format', p.response_format)
    params.images.forEach((file) => formData.append('image', file))
    if (params.mask) formData.append('mask', params.mask)

    const resp = await request({
      targetUrl: `${endpoint}/images/edits`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    })
    if (!resp.ok) throw new Error(`API 错误 (${resp.status}): ${resp.body}`)
    const images = await parseImageFromResponse(resp.body)
    return { images, raw: JSON.parse(resp.body) }
  },
}
