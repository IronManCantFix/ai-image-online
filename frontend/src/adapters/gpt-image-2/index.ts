import type { ImageAdapter, GenParams, EditParams, GenResult, GenResultImage } from '@/adapters/types'
import { gptImage2Schema } from './schema'
import { useProxy } from '@/composables/useProxy'

async function fetchImageViaProxy(imageUrl: string): Promise<Blob> {
  const resp = await fetch('/api/image-proxy?url=' + encodeURIComponent(imageUrl))
  if (!resp.ok) throw new Error(`图片下载失败 (${resp.status})`)
  return await resp.blob()
}

async function parseImageFromResponse(
  body: string,
): Promise<{ images: GenResultImage[]; raw: unknown }> {
  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    // Response is not JSON, wrap it as raw
    return { images: [], raw: { _raw_text: body } }
  }

  const obj = data as Record<string, unknown>
  const images: GenResultImage[] = []
  const items = (obj.data || obj.images || obj.results || []) as Record<string, unknown>[]

  for (const item of items) {
    try {
      if (item.b64_json) {
        const byteString = atob(item.b64_json as string)
        const bytes = new Uint8Array(byteString.length)
        for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
        const blob = new Blob([bytes], { type: 'image/png' })
        images.push({ data: blob, mimeType: 'image/png', url: URL.createObjectURL(blob) })
      } else if (item.url) {
        // Fetch through image proxy to avoid CORS
        const blob = await fetchImageViaProxy(item.url as string)
        images.push({ data: blob, mimeType: blob.type || 'image/png', url: URL.createObjectURL(blob) })
      } else if (item.b64 || item.base64) {
        const b64 = (item.b64 || item.base64) as string
        const byteString = atob(b64)
        const bytes = new Uint8Array(byteString.length)
        for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
        const blob = new Blob([bytes], { type: 'image/png' })
        images.push({ data: blob, mimeType: 'image/png', url: URL.createObjectURL(blob) })
      }
    } catch (e) {
      console.warn('[ImageAdapter] Failed to parse image item:', e, item)
    }
  }

  return { images, raw: data }
}

function buildPayload(params: Record<string, string | number | boolean>) {
  return {
    n: Number(params.n || 1),
    size: String(params.size || '1024x1024'),
    quality: String(params.quality || 'standard'),
    resolution: String(params.resolution || '1k'),
  }
}

export const gptImage2Adapter: ImageAdapter = {
  id: 'gpt-image-2',
  name: 'GPT Image 2',
  features: ['text-to-image', 'image-to-image'],
  defaultConfig: {
    endpoint: '',
    model: 'gpt-image-2',
  },
  getParamSchema() {
    return gptImage2Schema
  },
  async textToImage(params: GenParams): Promise<GenResult> {
    const { request } = useProxy()
    const { endpoint, apiKey, model } = params.config
    const p = buildPayload(params.params)
    const payload = {
      model: model || 'gpt-image-2',
      prompt: params.prompt,
      ...p,
    }

    const resp = await request({
      targetUrl: `${endpoint}/images/generations`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) throw new Error(`API 错误 (${resp.status}): ${resp.body}`)
    const { images, raw } = await parseImageFromResponse(resp.body)
    return { images, raw }
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
    params.images.forEach((file) => formData.append('image', file))
    if (params.mask) formData.append('mask', params.mask)

    const resp = await request({
      targetUrl: `${endpoint}/images/edits`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    })
    if (!resp.ok) throw new Error(`API 错误 (${resp.status}): ${resp.body}`)
    const { images, raw } = await parseImageFromResponse(resp.body)
    return { images, raw }
  },
}
