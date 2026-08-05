export type AdapterFeature = 'text-to-image' | 'image-to-image'
export type ParamFieldType = 'select' | 'number' | 'text' | 'toggle'

export interface ParamField {
  key: string
  label: string
  type: ParamFieldType
  options?: { label: string; value: string }[]
  default: string | number | boolean
  min?: number
  max?: number
  description?: string
}

export interface ParamSchema {
  fields: ParamField[]
}

export interface AdapterConfig {
  endpoint: string
  apiKey: string
  model: string
}

export interface GenParams {
  prompt: string
  config: AdapterConfig
  params: Record<string, string | number | boolean>
}

export interface EditParams extends GenParams {
  images: File[]
  mask?: File
}

export interface GenResultImage {
  data: Blob
  mimeType: string
  url: string
  /** 生成结果为 URL 时，后台补拉 Blob 的完成信号（从历史记录加载的图片没有该字段） */
  ready?: Promise<void>
}

export interface GenResult {
  images: GenResultImage[]
  raw?: unknown
}

export interface ImageAdapter {
  id: string
  name: string
  features: AdapterFeature[]
  defaultConfig: Partial<AdapterConfig>
  getParamSchema(): ParamSchema
  textToImage(params: GenParams): Promise<GenResult>
  imageToImage(params: EditParams): Promise<GenResult>
}
