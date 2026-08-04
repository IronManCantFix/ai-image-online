# AI Image Online — 设计文档

> 自托管 AI 图片生成 Web 应用，支持自配置 API，部署于飞牛 NAS Docker

## 1. 项目概述

一个可自托管（self-hosted）的 AI 图片生成网站，用户可在浏览器中配置任意 OpenAI 兼容图片 API 的地址和密钥，进行文生图和图生图。第一版实现 gpt-image-2 协议适配，后续可扩展其他图片模型接口。

**核心目标：**
- 用户自助配置 API 地址、密钥、模型名
- 支持文生图（text-to-image）和图生图（image-to-image）
- 生成参数可配置（尺寸、数量、响应格式等）
- 生成图片可保存（浏览器下载 + 本地历史画廊 + 可选 NAS 存储）
- 响应式设计，同时适配移动端和 PC 端
- Docker 部署，可一键运行于飞牛 NAS
- 架构可扩展，方便适配新的图片 API 协议

## 2. 架构设计

### 2.1 CORS 解决方案

**问题：** 浏览器直接调用第三方图片 API 会被 CORS 策略拦截。大多数 OpenAI 兼容 API（含 Dreamfield）不设置跨域允许头。

**方案：** Docker 容器内包含一个轻量级 Go 反向代理，与前端静态文件一同部署。代理协议无关（protocol-agnostic），只做透明转发，不感知具体 API 协议。

```
┌──────────────────────────────────────────────────┐
│              Docker 容器 (单容器单进程)            │
│                                                  │
│  ┌─────────────────┐    ┌─────────────────────┐  │
│  │   Go Server     │───▶│  静态前端 (SPA)      │  │
│  │   (单二进制)      │    │  Vue3 + Vite build  │  │
│  │                  │    └─────────────────────┘  │
│  │  /api/proxy      │                             │
│  │  (透明转发)       │──────▶  用户配置的图片 API   │
│  │  /api/health     │       (Dreamfield / 兼容)   │
│  │  /api/save(可选) │                             │
│  └──────────────────┘                             │
└──────────────────────────────────────────────────┘
```

### 2.2 代理端点设计（Pass-Through 模式）

代理协议无关，前端构造完整请求体（JSON 或 multipart），代理原样转发 binary 数据，无 base64 开销。

```
POST /api/proxy
请求头:
  X-Target-URL: https://www.dreamfield.top/v1/images/generations
  X-Forward-Headers: {"Authorization":"Bearer sk-xxx","Content-Type":"application/json"}
请求体: <原始请求体，原样转发>

响应: 原样返回目标 API 的响应，添加 CORS 头
```

代理逻辑：
1. 读取 `X-Target-URL` → 转发目标地址
2. 读取 `X-Forward-Headers` → 设置到转发请求的 headers
3. 原样转发请求体（支持 JSON 和 multipart/form-data binary 流）
4. 返回目标响应 + CORS 头

**优势：** 代理不需要理解任何 API 协议，新增适配器时代理层零改动。

### 2.3 前端架构

```
┌──────────────────────────────────────────────────┐
│                   浏览器 (SPA)                    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ 设置页面  │  │ 生成页面  │  │  历史画廊页面  │  │
│  │ API配置   │  │ 文生图/   │  │  IndexedDB    │  │
│  │ 适配器选择│  │ 图生图    │  │  浏览/下载     │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │             │                │           │
│  ┌────▼─────────────▼────────────────▼───────┐  │
│  │            Pinia Store (状态管理)          │  │
│  │  - settings: API 配置 (localStorage)      │  │
│  │  - generation: 当前生成任务状态            │  │
│  │  - gallery: 历史图片 (IndexedDB)          │  │
│  └────────────────────┬──────────────────────┘  │
│                       │                          │
│  ┌────────────────────▼──────────────────────┐  │
│  │           适配器层 (Adapter Layer)         │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ interface ImageAdapter              │  │  │
│  │  │   - id, name, features              │  │  │
│  │  │   - getParamSchema() → 参数表单定义  │  │  │
│  │  │   - textToImage(params)             │  │  │
│  │  │   - imageToImage(params, images)    │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │           ▲               ▲               │  │
│  │  ┌────────┴──────┐ ┌──────┴──────────┐   │  │
│  │  │ GptImage2     │ │ FutureAdapter   │   │  │
│  │  │ Adapter       │ │ (SD/MJ/...)     │   │  │
│  │  └───────────────┘ └─────────────────┘   │  │
│  └────────────────────┬──────────────────────┘  │
│                       │                          │
│  ┌────────────────────▼──────────────────────┐  │
│  │         HTTP 代理客户端 (ProxyClient)      │  │
│  │    fetch('/api/proxy', { X-Target-URL })  │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 2.4 适配器模式（核心扩展机制）

每个图片 API 提供商实现统一的 `ImageAdapter` 接口，新增 API 只需新增适配器，代理层和 UI 层零改动。

```typescript
interface ImageAdapter {
  id: string                          // "gpt-image-2"
  name: string                        // 显示名
  features: AdapterFeature[]          // ['text-to-image', 'image-to-image']
  defaultConfig: AdapterConfig        // 默认 endpoint, model 等
  getParamSchema(): ParamSchema       // 动态参数表单定义
  textToImage(params: GenParams): Promise<GenResult[]>
  imageToImage(params: EditParams, images: File[]): Promise<GenResult[]>
}

interface ParamField {
  key: string                         // "size"
  label: string                       // "图片尺寸"
  type: 'select' | 'number' | 'text' | 'toggle'
  options?: { label: string, value: string }[]
  default: any
  min?: number
  max?: number
  description?: string
}
```

**gpt-image-2 参数定义：**

| 参数 | 类型 | 默认值 | 选项 |
|------|------|--------|------|
| model | text | gpt-image-2 | — |
| size | select | 1024x1024 | 1024x1024, 1792x1024, 1024x1792 |
| n | number | 1 | 1-4 |
| response_format | select | b64_json | b64_json, url |

**API 协议（gpt-image-2）：**

文生图 — `POST /v1/images/generations` (JSON)
```json
{ "model": "gpt-image-2", "prompt": "...", "n": 1, "size": "1792x1024", "response_format": "b64_json" }
```
Headers: `Authorization: Bearer <key>`, `Content-Type: application/json`

图生图 — `POST /v1/images/edits` (multipart/form-data)
- Fields: model, prompt, n, size, response_format
- Files: image (可多个), mask (可选)

## 3. 技术选型

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | 轻量、组合式 API、适合中等规模 |
| 构建工具 | Vite | 极快的开发体验 |
| UI 样式 | TailwindCSS | 原子化、响应式开箱即用 |
| 状态管理 | Pinia | Vue 3 官方推荐、TS 友好 |
| 路由 | Vue Router | SPA 路由 |
| 配置存储 | localStorage | API 配置持久化 |
| 图片存储 | IndexedDB (idb) | 大容量二进制、历史画廊 |
| 后端代理 | Go (net/http) | 单二进制、~20MB 镜像、低资源 |
| 容器 | Docker multi-stage | 可移植、飞牛 NAS 原生支持 |

## 4. 项目结构

```
ai-image-online/
├── frontend/                      # 前端项目
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── router/index.ts
│   │   ├── stores/
│   │   │   ├── settings.ts        # API 配置 (localStorage)
│   │   │   ├── generation.ts      # 生成任务状态
│   │   │   └── gallery.ts         # 图片画廊 (IndexedDB)
│   │   ├── adapters/              # 适配器层
│   │   │   ├── types.ts           # ImageAdapter 接口
│   │   │   ├── registry.ts        # 适配器注册表
│   │   │   └── gpt-image-2/
│   │   │       ├── index.ts       # 适配器实现
│   │   │       └── schema.ts      # 参数表单定义
│   │   ├── components/
│   │   │   ├── layout/            # Header, Nav
│   │   │   ├── settings/          # 设置页
│   │   │   ├── generation/        # 生成页
│   │   │   │   ├── TextToImage.vue
│   │   │   │   ├── ImageToImage.vue
│   │   │   │   ├── ParamPanel.vue       # 动态参数面板
│   │   │   │   ├── ImageUploader.vue
│   │   │   │   └── ResultGallery.vue
│   │   │   ├── gallery/           # 画廊页
│   │   │   └── ui/                # 通用 UI 组件
│   │   ├── composables/
│   │   │   ├── useProxy.ts        # 代理请求封装
│   │   │   └── useImageStorage.ts # 图片存储
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/                        # Go 后端代理
│   ├── main.go                    # 静态文件 + 代理入口
│   ├── proxy.go                   # 透明转发逻辑
│   ├── go.mod
│   └── go.sum
├── Dockerfile                     # 多阶段构建
├── docker-compose.yml             # 飞牛 NAS 部署
├── .dockerignore
└── README.md
```

## 5. 核心模块设计

### 5.1 设置页 — API 配置

- API 地址（如 `https://www.dreamfield.top/v1`）
- API Key（密码框，存 localStorage）
- 适配器类型选择（第一版仅 gpt-image-2）
- 默认模型名
- 连接测试按钮
- 支持多组配置（profiles），可切换

### 5.2 生成页 — 文生图 / 图生图

**文生图：** Prompt 输入 + 动态参数面板（按 ParamSchema 渲染）+ 生成 + 结果网格

**图生图：** 图片上传（拖拽/粘贴/多图）+ Prompt + 参数 + 生成 + 结果网格

**响应式布局：**
- 移动端：单列，参数面板可折叠抽屉
- PC 端：左侧参数 + 右侧结果区

### 5.3 画廊页 — 历史记录

- IndexedDB 读取历史
- 缩略图网格 → 点击查看大图/Prompt/参数
- 下载到设备 / 删除 / 清空
- 可选：保存到 NAS 文件系统

### 5.4 图片存储 (IndexedDB)

```
Database: ai-image-online
Store: gallery
  - id: string (uuid)
  - adapterId: string
  - mode: "text-to-image" | "image-to-image"
  - prompt: string
  - params: object
  - images: Array<{ data: Blob, mimeType: string }>
  - createdAt: number (timestamp)
  - apiConfig: { endpoint, model } (不含 key)
```

### 5.5 Go 代理服务

- 静态文件服务：serve `frontend/dist/`
- API 代理：`POST /api/proxy`（Pass-Through 模式，见 2.2）
- 健康检查：`GET /api/health`
- 可选 NAS 存储：`POST /api/save`（写入挂载卷）

**安全：** 代理不存储 API Key（前端通过 header 传递），不暴露内部服务，可选域名白名单。

## 6. Docker 部署

### 6.1 Dockerfile（多阶段构建）

```dockerfile
# Stage 1: 构建前端
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: 构建后端
FROM golang:1.22-alpine AS server-builder
WORKDIR /app/server
COPY server/go.* ./
RUN go mod download
COPY server/ ./
COPY --from=frontend-builder /app/frontend/dist ./static
RUN CGO_ENABLED=0 go build -o /app/server -ldflags="-s -w" .

# Stage 3: 运行（~20MB）
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=server-builder /app/server /app/server
COPY --from=server-builder /app/server/static /app/static
EXPOSE 8080
CMD ["/app/server"]
```

### 6.2 docker-compose.yml

```yaml
version: "3.8"
services:
  ai-image-online:
    build: .
    image: ai-image-online:latest
    container_name: ai-image-online
    ports:
      - "8080:8080"
    volumes:
      - ./data/images:/app/data/images  # 可选：NAS 图片持久化
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

### 6.3 飞牛 NAS 部署步骤

1. SSH 登录飞牛 NAS 或使用飞牛应用中心
2. 将项目传到 NAS（如 `/vol1/1000/docker/ai-image-online/`）
3. `docker compose up -d --build`
4. 访问 `http://<NAS-IP>:8080`
5. 可选：在飞牛应用中心注册为自定义应用

## 7. 未来扩展

| 扩展项 | 实现方式 |
|--------|----------|
| Stable Diffusion | 新增 SDAdapter |
| ComfyUI | 新增 ComfyUIAdapter |
| 批量生成 | 前端任务队列 + 并发控制 |
| Inpainting/Mask | 适配器增加 mask 功能 + 前端画布 |
| 多用户 | 后端认证 + 配置隔离 |
| NAS 图片管理 | 后端文件管理 API + 文件浏览器 |

## 8. 开发路线图

### Phase 1 — MVP
- [ ] 项目脚手架（Vue 3 + Vite + TailwindCSS）
- [ ] Go 代理服务（静态文件 + 透明代理）
- [ ] 设置页（API 配置 + localStorage）
- [ ] 适配器接口 + gpt-image-2 适配器
- [ ] 文生图（参数面板 + 调用 + 结果展示）
- [ ] 图生图（图片上传 + multipart 调用）
- [ ] 图片下载
- [ ] 响应式布局
- [ ] Dockerfile + docker-compose

### Phase 2 — 体验优化
- [ ] IndexedDB 历史画廊
- [ ] 生成中 loading / 进度
- [ ] 错误处理与重试
- [ ] Prompt 模板/历史
- [ ] 图片放大查看
- [ ] 暗色模式

### Phase 3 — 扩展
- [ ] 第二个适配器
- [ ] NAS 文件系统持久化
- [ ] 批量生成
- [ ] Inpainting/Mask 编辑
