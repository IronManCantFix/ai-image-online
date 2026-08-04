import type { ParamSchema } from '@/adapters/types'

export const gptImage2Schema: ParamSchema = {
  fields: [
    {
      key: 'size',
      label: '图片尺寸',
      type: 'select',
      default: '1024x1024',
      options: [
        { label: '512 × 512', value: '512x512' },
        { label: '768 × 768', value: '768x768' },
        { label: '1024 × 1024（方形）', value: '1024x1024' },
        { label: '1536 × 1024（3:2 横图）', value: '1536x1024' },
        { label: '1024 × 1536（3:2 竖图）', value: '1024x1536' },
        { label: '1792 × 1024（16:9 横图）', value: '1792x1024' },
        { label: '1024 × 1792（16:9 竖图）', value: '1024x1792' },
        { label: '2048 × 2048（2K 方形）', value: '2048x2048' },
        { label: '2560 × 1440（2K 横图）', value: '2560x1440' },
        { label: '1440 × 2560（2K 竖图）', value: '1440x2560' },
        { label: '3840 × 2160（4K 横图）', value: '3840x2160' },
        { label: '2160 × 3840（4K 竖图）', value: '2160x3840' },
      ],
      description: '生成图片的分辨率尺寸',
    },
    {
      key: 'quality',
      label: '图片质量',
      type: 'select',
      default: 'standard',
      options: [
        { label: '低（draft，快速生成）', value: 'low' },
        { label: '标准（standard）', value: 'standard' },
        { label: '高（hd，精细生成）', value: 'high' },
      ],
      description: '控制生成质量，高质量耗时更长',
    },
    {
      key: 'resolution',
      label: '分辨率档位',
      type: 'select',
      default: '1k',
      options: [
        { label: '1K', value: '1k' },
        { label: '2K', value: '2k' },
        { label: '4K', value: '4k' },
      ],
      description: '分辨率档位，与尺寸配合使用',
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
