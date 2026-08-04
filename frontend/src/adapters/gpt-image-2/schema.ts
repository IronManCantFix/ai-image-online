import type { ParamSchema } from '@/adapters/types'

export const gptImage2Schema: ParamSchema = {
  fields: [
    {
      key: 'size',
      label: '图片尺寸',
      type: 'select',
      default: '1024x1024',
      options: [
        { label: '1024 × 1024（方形）', value: '1024x1024' },
        { label: '1792 × 1024（横图）', value: '1792x1024' },
        { label: '1024 × 1792（竖图）', value: '1024x1792' },
      ],
      description: '生成图片的分辨率',
    },
    {
      key: 'n',
      label: '生成数量',
      type: 'number',
      default: 1,
      min: 1,
      max: 4,
      description: '一次生成的图片数量（1-4）',
    },
    {
      key: 'response_format',
      label: '响应格式',
      type: 'select',
      default: 'b64_json',
      options: [
        { label: 'Base64（直接返回图片数据）', value: 'b64_json' },
        { label: 'URL（返回图片链接）', value: 'url' },
      ],
      description: 'API 返回图片的方式',
    },
  ],
}
