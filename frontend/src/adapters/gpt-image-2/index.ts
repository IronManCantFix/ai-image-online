import type { ImageAdapter, GenParams, EditParams, GenResult, GenResultImage } from '@/adapters/types'
import { gptImage2Schema } from './schema'
import { useProxy } from '@/composables/useProxy'

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchImageBlob(imageUrl: string): Promise<Blob | null> {
  // 直连与代理并行，谁先成功用谁：
  // - 图片服务器支持 CORS 时直连更快
  // - 被 CORS 拦截时 Promise.any 立即采用代理结果，不再串行等待超时
  const direct = fetchWithTimeout(imageUrl, 5000).then(async (resp) => (resp.ok ? await resp.blob() : null))
  const proxied = fetch('/api/image-proxy?url=' + encodeURIComponent(imageUrl)).then(async (resp) => (resp.ok ? await resp.blob() : null))
  try {
    return await Promise.any([direct, proxied])
  } catch {
    return null
  }
}

function b64ToBlob(b64: string): Blob {
  const byteString = atob(b64)
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i)
  return new Blob([bytes], { type: 'image/png' })
}

async function parseImageFromResponse(
  body: string,
): Promise<{ images: GenResultImage[]; raw: unknown }> {
  let data: unknown
  try {
    data = JSON.parse(body)
  } catch {
    return { images: [], raw: { _raw_text: body } }
  }

  const obj = data as Record<string, unknown>
  const rawItems = obj.data ?? obj.images ?? obj.results
  const items: unknown[] = Array.isArray(rawItems) ? rawItems : []

  // Extract all image values first
  const entries: { val: string; isUrl: boolean }[] = []
  for (const item of items) {
    try {
      const entry = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
      const val = (entry.b64_json || entry.url || entry.b64 || entry.base64 || (typeof item === 'string' ? item : null)) as string | null
      if (!val) continue
      entries.push({ val, isUrl: /^https?:\/\//.test(val) })
    } catch (e) {
      console.warn('[ImageAdapter] Failed to extract image item:', e)
    }
  }

  // URL 直接放进 <img> 展示（图片标签不受 CORS 限制，能立即开始加载），
  // 同时后台补拉 Blob 供历史记录/下载/画廊使用，不阻塞展示
  const images: GenResultImage[] = entries.map(({ val, isUrl }) => {
    if (isUrl) {
      const image: GenResultImage = {
        data: new Blob([], { type: 'image/png' }),
        mimeType: 'image/png',
        url: val,
      }
      image.ready = fetchImageBlob(val).then((blob) => {
        if (blob) {
          image.data = blob
          image.mimeType = blob.type || image.mimeType
        }
      })
      return image
    }
    const blob = b64ToBlob(val)
    return { data: blob, mimeType: 'image/png', url: URL.createObjectURL(blob) }
  })

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
