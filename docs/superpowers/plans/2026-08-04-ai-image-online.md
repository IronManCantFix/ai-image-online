# AI Image Online 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个自托管的 AI 图片生成 Web 应用，用户可配置任意 OpenAI 兼容图片 API，支持文生图和图生图，Docker 部署于飞牛 NAS。

**Architecture:** 单容器单进程。Go 二进制提供静态文件服务 + 透明代理（Pass-Through，协议无关）。Vue 3 SPA 处理所有业务逻辑（API 配置、参数设置、请求构造、图片展示）。适配器模式实现可扩展的图片 API 协议支持。

**Tech Stack:** Go 1.22 (net/http) | Vue 3 + TypeScript + Vite | TailwindCSS | Pinia | IndexedDB (idb) | Docker multi-stage

---

## 文件结构总览

```
ai-image-online/
├── server/                          # Go 后端
│   ├── main.go                      # 入口：路由 + 静态文件 + 启动
│   ├── proxy.go                     # 透明转发逻辑
│   ├── proxy_test.go                # 代理单元测试
│   ├── go.mod
│   └── go.sum
├── frontend/                        # Vue 3 前端
│   ├── src/
│   │   ├── main.ts                  # 应用入口
│   │   ├── App.vue                  # 根组件 + 布局
│   │   ├── router/index.ts          # 路由定义
│   │   ├── adapters/
│   │   │   ├── types.ts             # ImageAdapter 接口 + 类型定义
│   │   │   ├── registry.ts          # 适配器注册表
│   │   │   └── gpt-image-2/
│   │   │       ├── index.ts         # gpt-image-2 适配器实现
│   │   │       └── schema.ts        # 参数表单 schema
│   │   ├── stores/
│   │   │   ├── settings.ts          # API 配置 (localStorage)
│   │   │   ├── generation.ts        # 生成任务状态
│   │   │   └── gallery.ts           # 图片画廊 (IndexedDB)
│   │   ├── composables/
│   │   │   ├── useProxy.ts          # 代理请求封装
│   │   │   └── useImageStorage.ts   # IndexedDB 图片存储
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── AppNav.vue       # 导航栏（响应式）
│   │   │   ├── settings/
│   │   │   │   └── SettingsPage.vue # API 配置页
│   │   │   ├── generation/
│   │   │   │   ├── GeneratePage.vue # 生成页（文生图/图生图切换）
│   │   │   │   ├── TextToImage.vue  # 文生图面板
│   │   │   │   ├── ImageToImage.vue # 图生图面板
│   │   │   │   ├── ParamPanel.vue   # 动态参数面板（按 schema 渲染）
│   │   │   │   ├── ImageUploader.vue# 图片上传组件
│   │   │   │   └── ResultGallery.vue# 结果展示
│   │   │   ├── gallery/
│   │   │   │   └── GalleryPage.vue  # 历史画廊
│   │   │   └── ui/
│   │   │       └── ImageModal.vue   # 图片放大弹窗
│   │   └── assets/
│   │       └── main.css             # TailwindCSS 入口
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── package.json
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Task 1: Go 代理服务

**Files:**
- Create: `server/go.mod`
- Create: `server/main.go`
- Create: `server/proxy.go`
- Create: `server/proxy_test.go`

- [ ] **Step 1: 初始化 Go 模块**

```bash
mkdir -p server
cd server
go mod init ai-image-online
```

- [ ] **Step 2: 编写代理测试**

Create `server/proxy_test.go`:

```go
package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestProxy_ForwardsRequest(t *testing.T) {
	// 模拟目标 API
	target := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Errorf("expected Authorization header forwarded, got %q", r.Header.Get("Authorization"))
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, `{"data":[{"b64_json":"abc"}]}`)
	}))
	defer target.Close()

	// 模拟前端请求到代理
	req := httptest.NewRequest("POST", "/api/proxy", io.NopCloser(stringReader(`{"prompt":"test"}`)))
	req.Header.Set("X-Target-URL", target.URL+"/v1/images/generations")
	req.Header.Set("X-Forward-Headers", `{"Authorization":"Bearer test-key","Content-Type":"application/json"}`)

	rec := httptest.NewRecorder()
	handleProxy(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("expected CORS header, got %q", rec.Header().Get("Access-Control-Allow-Origin"))
	}
	body := rec.Body.String()
	if body != `{"data":[{"b64_json":"abc"}]}` {
		t.Errorf("unexpected response body: %s", body)
	}
}

func TestProxy_MissingTargetURL(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/proxy", io.NopCloser(stringReader(`{}`)))
	rec := httptest.NewRecorder()
	handleProxy(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestProxy_AllowsCORSPreflight(t *testing.T) {
	req := httptest.NewRequest("OPTIONS", "/api/proxy", nil)
	rec := httptest.NewRecorder()
	handleProxy(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Headers") == "" {
		t.Error("expected CORS allow-headers")
	}
}

func stringReader(s string) io.Reader {
	return &stringReaderImpl{s: s}
}

type stringReaderImpl struct {
	s   string
	pos int
}

func (r *stringReaderImpl) Read(p []byte) (int, error) {
	if r.pos >= len(r.s) {
		return 0, io.EOF
	}
	n := copy(p, r.s[r.pos:])
	r.pos += n
	return n, nil
}
```

- [ ] **Step 3: 运行测试确认失败**

```bash
cd server && go test -v -run TestProxy
```
Expected: FAIL — `handleProxy` 未定义

- [ ] **Step 4: 实现 proxy.go**

Create `server/proxy.go`:

```go
package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
)

func handleProxy(w http.ResponseWriter, r *http.Request) {
	// CORS 预检
	if r.Method == http.MethodOptions {
		setCORSHeaders(w)
		w.WriteHeader(http.StatusNoContent)
		return
	}

	targetURL := r.Header.Get("X-Target-URL")
	if targetURL == "" {
		http.Error(w, `{"error":"missing X-Target-URL header"}`, http.StatusBadRequest)
		return
	}

	// 解析要转发的 headers
	var forwardHeaders map[string]string
	headersJSON := r.Header.Get("X-Forward-Headers")
	if headersJSON != "" {
		if err := json.Unmarshal([]byte(headersJSON), &forwardHeaders); err != nil {
			http.Error(w, `{"error":"invalid X-Forward-Headers JSON"}`, http.StatusBadRequest)
			return
		}
	}

	// 构造转发请求
	proxyReq, err := http.NewRequest(r.Method, targetURL, r.Body)
	if err != nil {
		http.Error(w, `{"error":"invalid target URL"}`, http.StatusBadRequest)
		return
	}

	for key, value := range forwardHeaders {
		proxyReq.Header.Set(key, value)
	}

	// 发送请求
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("proxy error: %v", err)
		http.Error(w, `{"error":"failed to reach target API"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// 转发响应
	setCORSHeaders(w)
	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Target-URL, X-Forward-Headers, Authorization")
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, `{"status":"ok"}`)
}

// allowHostsMiddleware 限制只有 /api/ 路径走代理逻辑
func isAPIPath(path string) bool {
	return strings.HasPrefix(path, "/api/")
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
cd server && go test -v -run TestProxy
```
Expected: PASS

- [ ] **Step 6: 实现 main.go（静态文件 + 路由）**

Create `server/main.go`:

```go
package main

import (
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	// API 路由
	mux.HandleFunc("/api/proxy", handleProxy)
	mux.HandleFunc("/api/health", handleHealth)

	// 静态文件服务（SPA fallback）
	staticDir := "./static"
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		staticDir = "./server/static"
	}
	fs := http.FileServer(http.Dir(staticDir))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// SPA fallback：非文件请求都返回 index.html
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path != "" {
			fullPath := staticDir + "/" + path
			if _, err := os.Stat(fullPath); os.IsNotExist(err) {
				http.ServeFile(w, r, staticDir+"/index.html")
				return
			}
		}
		fs.ServeHTTP(w, r)
	})

	log.Printf("AI Image Online server starting on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
```

- [ ] **Step 7: 运行全部测试并验证编译**

```bash
cd server && go test -v ./... && go build -o /dev/null .
```
Expected: 全部 PASS，编译成功

- [ ] **Step 8: Commit**

```bash
git add server/
git commit -m "feat: Go proxy server with transparent forwarding and static file serving"
```

---

## Task 2: 前端脚手架

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.ts`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/router/index.ts`
- Create: `frontend/src/assets/main.css`
- Create: `frontend/src/components/layout/AppNav.vue`

- [ ] **Step 1: 用 Vite 初始化 Vue 3 + TS 项目**

```bash
npm create vite@latest frontend -- --template vue-ts
cd frontend
npm install
npm install vue-router@4 pinia idb
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: 配置 TailwindCSS**

Replace `frontend/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

Replace `frontend/src/assets/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900 antialiased;
}
```

- [ ] **Step 3: 配置 Vite 代理（开发时代理到 Go 服务）**

Replace `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: 创建路由**

Create `frontend/src/router/index.ts`:

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/generate' },
  { path: '/generate', name: 'generate', component: () => import('@/components/generation/GeneratePage.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/components/settings/SettingsPage.vue') },
  { path: '/gallery', name: 'gallery', component: () => import('@/components/gallery/GalleryPage.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

- [ ] **Step 5: 创建导航组件（响应式）**

Create `frontend/src/components/layout/AppNav.vue`:

```vue
<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <router-link to="/" class="flex items-center gap-2 font-bold text-lg">
          <span class="text-primary-600">AI</span> Image
        </router-link>

        <!-- 桌面端导航 -->
        <div class="hidden sm:flex items-center gap-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="$route.path === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'">
            {{ item.label }}
          </router-link>
        </div>

        <!-- 移动端汉堡菜单 -->
        <button @click="mobileOpen = !mobileOpen" class="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 移动端菜单展开 -->
      <div v-if="mobileOpen" class="sm:hidden pb-3 space-y-1">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          @click="mobileOpen = false"
          class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
          :class="$route.path === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'">
          {{ item.label }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileOpen = ref(false)
const navItems = [
  { path: '/generate', label: '生成' },
  { path: '/gallery', label: '画廊' },
  { path: '/settings', label: '设置' },
]
</script>
```

- [ ] **Step 6: 创建 App.vue + main.ts**

Replace `frontend/src/App.vue`:

```vue
<template>
  <div class="min-h-screen">
    <AppNav />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNav from '@/components/layout/AppNav.vue'
</script>
```

Replace `frontend/src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './assets/main.css'

createApp(App).use(createPinia()).use(router).mount('#app')
```

- [ ] **Step 7: 配置路径别名（@ → src）**

Update `frontend/tsconfig.json`，在 `compilerOptions` 中添加：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

在 `frontend/vite.config.ts` 中添加别名：

```typescript
import path from 'path'
// ... 在 defineConfig 中添加
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
},
```

- [ ] **Step 8: 创建占位页面，验证启动**

Create 三个占位 `.vue` 文件（内容 `<template><div>Coming soon</div></template>`），然后：

```bash
cd frontend && npm run dev
```
Expected: 浏览器打开 `http://localhost:3000`，导航栏正常显示

- [ ] **Step 9: Commit**

```bash
git add frontend/
git commit -m "feat: Vue 3 frontend scaffold with TailwindCSS, router, responsive nav"
```

---

## Task 3: 适配器层 + gpt-image-2 适配器

**Files:**
- Create: `frontend/src/adapters/types.ts`
- Create: `frontend/src/adapters/registry.ts`
- Create: `frontend/src/adapters/gpt-image-2/schema.ts`
- Create: `frontend/src/adapters/gpt-image-2/index.ts`
- Create: `frontend/src/composables/useProxy.ts`

- [ ] **Step 1: 定义适配器接口类型**

Create `frontend/src/adapters/types.ts`:

```typescript
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
  data: Blob      // 图片二进制
  mimeType: string
  url: string     // object URL 用于展示
}

export interface GenResult {
  images: GenResultImage[]
  raw?: unknown   // 原始 API 响应
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
```

- [ ] **Step 2: 实现代理请求 composable**

Create `frontend/src/composables/useProxy.ts`:

```typescript
import { useSettingsStore } from '@/stores/settings'

export interface ProxyRequestOptions {
  targetUrl: string
  method?: string
  headers?: Record<string, string>
  body?: BodyInit  // 支持 string, FormData, Blob 等
}

export interface ProxyResponse {
  ok: boolean
  status: number
  body: string
  headers: Record<string, string>
}

export function useProxy() {
  async function request(options: ProxyRequestOptions): Promise<ProxyResponse> {
    const forwardHeaders = JSON.stringify(options.headers || {})
    const resp = await fetch('/api/proxy', {
      method: options.method || 'POST',
      headers: {
        'X-Target-URL': options.targetUrl,
        'X-Forward-Headers': forwardHeaders,
      },
      body: options.body,
    })

    const body = await resp.text()
    const headers: Record<string, string> = {}
    resp.headers.forEach((value, key) => { headers[key] = value })

    return { ok: resp.ok, status: resp.status, body, headers }
  }

  return { request }
}
```

- [ ] **Step 3: 定义 gpt-image-2 参数 schema**

Create `frontend/src/adapters/gpt-image-2/schema.ts`:

```typescript
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
```

- [ ] **Step 4: 实现 gpt-image-2 适配器**

Create `frontend/src/adapters/gpt-image-2/index.ts`:

```typescript
import type { ImageAdapter, GenParams, EditParams, GenResult, GenResultImage } from '@/adapters/types'
import { gptImage2Schema } from './schema'
import { useProxy } from '@/composables/useProxy'

async function parseImageFromResponse(body: string, format: string): Promise<GenResultImage[]> {
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
    const size = String(params.params.size || '1024x1024')
    const n = Number(params.params.n || 1)
    const responseFormat = String(params.params.response_format || 'b64_json')

    const payload = {
      model: model || 'gpt-image-2',
      prompt: params.prompt,
      n,
      size,
      response_format: responseFormat,
    }

    const resp = await request({
      targetUrl: `${endpoint}/images/generations`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      throw new Error(`API 错误 (${resp.status}): ${resp.body}`)
    }

    const images = await parseImageFromResponse(resp.body, responseFormat)
    return { images, raw: JSON.parse(resp.body) }
  },

  async imageToImage(params: EditParams): Promise<GenResult> {
    const { request } = useProxy()
    const { endpoint, apiKey, model } = params.config
    const size = String(params.params.size || '1024x1024')
    const n = Number(params.params.n || 1)
    const responseFormat = String(params.params.response_format || 'b64_json')

    const formData = new FormData()
    formData.append('model', model || 'gpt-image-2')
    formData.append('prompt', params.prompt)
    formData.append('n', String(n))
    formData.append('size', size)
    formData.append('response_format', responseFormat)

    params.images.forEach((file, index) => {
      formData.append('image', file)
    })
    if (params.mask) {
      formData.append('mask', params.mask)
    }

    const resp = await request({
      targetUrl: `${endpoint}/images/edits`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!resp.ok) {
      throw new Error(`API 错误 (${resp.status}): ${resp.body}`)
    }

    const images = await parseImageFromResponse(resp.body, responseFormat)
    return { images, raw: JSON.parse(resp.body) }
  },
}
```

- [ ] **Step 5: 创建适配器注册表**

Create `frontend/src/adapters/registry.ts`:

```typescript
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
```

- [ ] **Step 6: 创建 settings store（供 useProxy 依赖）**

Create `frontend/src/stores/settings.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdapterConfig } from '@/adapters/types'
import { getDefaultAdapter } from '@/adapters/registry'

interface SettingsProfile {
  id: string
  name: string
  adapterId: string
  config: AdapterConfig
}

const STORAGE_KEY = 'ai-image-online-settings'

export const useSettingsStore = defineStore('settings', () => {
  const defaultAdapter = getDefaultAdapter()
  const profiles = ref<SettingsProfile[]>([])
  const activeProfileId = ref<string>('')

  // 从 localStorage 加载
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        profiles.value = data.profiles || []
        activeProfileId.value = data.activeProfileId || ''
      }
    } catch {
      // ignore
    }
    if (profiles.value.length === 0) {
      const profile: SettingsProfile = {
        id: 'default',
        name: '默认配置',
        adapterId: defaultAdapter.id,
        config: {
          endpoint: defaultAdapter.defaultConfig.endpoint || '',
          apiKey: '',
          model: defaultAdapter.defaultConfig.model || '',
        },
      }
      profiles.value = [profile]
      activeProfileId.value = profile.id
      save()
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profiles: profiles.value,
      activeProfileId: activeProfileId.value,
    }))
  }

  const activeProfile = computed(() =>
    profiles.value.find(p => p.id === activeProfileId.value) || profiles.value[0]
  )

  const activeConfig = computed(() => activeProfile.value?.config)

  function updateProfile(id: string, updates: Partial<SettingsProfile>) {
    const profile = profiles.value.find(p => p.id === id)
    if (profile) {
      Object.assign(profile, updates)
      save()
    }
  }

  function addProfile(name: string, adapterId: string, config: AdapterConfig) {
    const id = Date.now().toString()
    profiles.value.push({ id, name, adapterId, config })
    activeProfileId.value = id
    save()
    return id
  }

  function deleteProfile(id: string) {
    if (profiles.value.length <= 1) return
    profiles.value = profiles.value.filter(p => p.id !== id)
    if (activeProfileId.value === id) {
      activeProfileId.value = profiles.value[0].id
    }
    save()
  }

  function setActiveProfile(id: string) {
    activeProfileId.value = id
    save()
  }

  load()

  return {
    profiles, activeProfileId, activeProfile, activeConfig,
    updateProfile, addProfile, deleteProfile, setActiveProfile,
  }
})
```

- [ ] **Step 7: 验证编译**

```bash
cd frontend && npx vue-tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 8: Commit**

```bash
git add frontend/src/adapters/ frontend/src/composables/ frontend/src/stores/settings.ts
git commit -m "feat: adapter layer with gpt-image-2 implementation and proxy composable"
```

---

## Task 4: 设置页

**Files:**
- Create: `frontend/src/components/settings/SettingsPage.vue`
- Create: `frontend/src/composables/useConnectionTest.ts`

- [ ] **Step 1: 实现连接测试 composable**

Create `frontend/src/composables/useConnectionTest.ts`:

```typescript
import { ref } from 'vue'
import { useProxy } from '@/composables/useProxy'

export function useConnectionTest() {
  const testing = ref(false)
  const testResult = ref<{ ok: boolean; message: string } | null>(null)

  async function test(endpoint: string, apiKey: string, model: string) {
    testing.value = true
    testResult.value = null
    try {
      const { request } = useProxy()
      const resp = await request({
        targetUrl: `${endpoint}/models`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      if (resp.ok) {
        testResult.value = { ok: true, message: '连接成功！API 配置有效。' }
      } else {
        testResult.value = { ok: false, message: `连接失败 (${resp.status}): ${resp.body.slice(0, 200)}` }
      }
    } catch (e) {
      testResult.value = { ok: false, message: `请求失败: ${e instanceof Error ? e.message : String(e)}` }
    } finally {
      testing.value = false
    }
  }

  return { testing, testResult, test }
}
```

- [ ] **Step 2: 实现设置页**

Create `frontend/src/components/settings/SettingsPage.vue`:

```vue
<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">API 设置</h1>

    <!-- 配置文件切换 -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">配置文件</label>
      <div class="flex gap-2">
        <select v-model="store.activeProfileId" @change="store.setActiveProfile(store.activeProfileId)"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option v-for="p in store.profiles" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <button @click="showAddProfile = !showAddProfile"
          class="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">新建</button>
        <button v-if="store.profiles.length > 1" @click="store.deleteProfile(activeProfile.id)"
          class="px-3 py-2 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50">删除</button>
      </div>
      <div v-if="showAddProfile" class="mt-2 flex gap-2">
        <input v-model="newProfileName" placeholder="配置名称"
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <button @click="addProfile" class="px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700">确认</button>
      </div>
    </div>

    <!-- API 配置表单 -->
    <div class="space-y-4" v-if="activeProfile">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">适配器类型</label>
        <select v-model="activeProfile.adapterId" @change="onAdapterChange"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option v-for="a in adapters" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">API 地址</label>
        <input v-model="activeProfile.config.endpoint" @input="save"
          placeholder="https://www.dreamfield.top/v1"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <p class="mt-1 text-xs text-gray-500">OpenAI 兼容 API 的基础地址，不含 /images/generations</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
        <input v-model="activeProfile.config.apiKey" @input="save" type="password"
          placeholder="sk-..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
        <input v-model="activeProfile.config.model" @input="save"
          placeholder="gpt-image-2"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <!-- 连接测试 -->
      <div class="pt-2">
        <button @click="runTest" :disabled="testing"
          class="px-4 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
        <p v-if="testResult" :class="testResult.ok ? 'text-green-600' : 'text-red-600'"
          class="mt-2 text-sm">{{ testResult.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { getAllAdapters } from '@/adapters/registry'
import { getAdapter } from '@/adapters/registry'
import { useConnectionTest } from '@/composables/useConnectionTest'

const store = useSettingsStore()
const adapters = getAllAdapters()
const { testing, testResult, test } = useConnectionTest()

const showAddProfile = ref(false)
const newProfileName = ref('')

const activeProfile = computed(() => store.activeProfile)

function save() {
  if (activeProfile.value) {
    store.updateProfile(activeProfile.value.id, { config: { ...activeProfile.value.config } })
  }
}

function onAdapterChange() {
  const adapter = getAdapter(activeProfile.value.adapterId)
  if (adapter?.defaultConfig) {
    activeProfile.value.config.model = adapter.defaultConfig.model || ''
    if (!activeProfile.value.config.endpoint && adapter.defaultConfig.endpoint) {
      activeProfile.value.config.endpoint = adapter.defaultConfig.endpoint
    }
  }
  save()
}

function addProfile() {
  if (!newProfileName.value.trim()) return
  const adapter = getAdapter('gpt-image-2')!
  store.addProfile(newProfileName.value, adapter.id, {
    endpoint: adapter.defaultConfig.endpoint || '',
    apiKey: '',
    model: adapter.defaultConfig.model || '',
  })
  newProfileName.value = ''
  showAddProfile.value = false
}

function runTest() {
  if (activeProfile.value) {
    test(activeProfile.value.config.endpoint, activeProfile.value.config.apiKey, activeProfile.value.config.model)
  }
}
</script>
```

- [ ] **Step 3: 验证页面渲染**

```bash
cd frontend && npm run dev
```
浏览器访问 `http://localhost:3000/settings`，确认表单正常显示，输入内容刷新后仍保留。

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/settings/ frontend/src/composables/useConnectionTest.ts
git commit -m "feat: settings page with API config, multi-profile, connection test"
```

---

## Task 5: 文生图功能

**Files:**
- Create: `frontend/src/stores/generation.ts`
- Create: `frontend/src/components/generation/GeneratePage.vue`
- Create: `frontend/src/components/generation/TextToImage.vue`
- Create: `frontend/src/components/generation/ParamPanel.vue`
- Create: `frontend/src/components/generation/ResultGallery.vue`

- [ ] **Step 1: 实现 generation store**

Create `frontend/src/stores/generation.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GenResult } from '@/adapters/types'
import { getAdapter } from '@/adapters/registry'
import { useSettingsStore } from '@/stores/settings'

export const useGenerationStore = defineStore('generation', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const results = ref<GenResult | null>(null)
  const lastParams = ref<Record<string, unknown> | null>(null)

  async function generateTextToImage(prompt: string, params: Record<string, string | number | boolean>) {
    const settings = useSettingsStore()
    const profile = settings.activeProfile
    if (!profile || !profile.config.apiKey) {
      error.value = '请先在设置页配置 API Key'
      return
    }

    const adapter = getAdapter(profile.adapterId)
    if (!adapter) {
      error.value = '找不到适配器'
      return
    }

    loading.value = true
    error.value = null
    results.value = null

    try {
      const result = await adapter.textToImage({
        prompt,
        config: profile.config,
        params,
      })
      results.value = result
      lastParams.value = { prompt, ...params, mode: 'text-to-image', adapterId: profile.adapterId }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function generateImageToImage(prompt: string, images: File[], params: Record<string, string | number | boolean>) {
    const settings = useSettingsStore()
    const profile = settings.activeProfile
    if (!profile || !profile.config.apiKey) {
      error.value = '请先在设置页配置 API Key'
      return
    }

    const adapter = getAdapter(profile.adapterId)
    if (!adapter) {
      error.value = '找不到适配器'
      return
    }

    loading.value = true
    error.value = null
    results.value = null

    try {
      const result = await adapter.imageToImage({
        prompt,
        config: profile.config,
        params,
        images,
      })
      results.value = result
      lastParams.value = { prompt, ...params, mode: 'image-to-image', adapterId: profile.adapterId }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function clearResults() {
    results.value = null
    error.value = null
  }

  return { loading, error, results, lastParams, generateTextToImage, generateImageToImage, clearResults }
})
```

- [ ] **Step 2: 实现动态参数面板**

Create `frontend/src/components/generation/ParamPanel.vue`:

```vue
<template>
  <div class="space-y-4">
    <h3 class="text-sm font-semibold text-gray-700">生成参数</h3>
    <div v-for="field in schema.fields" :key="field.key">
      <label class="block text-sm font-medium text-gray-600 mb-1">{{ field.label }}</label>

      <!-- Select -->
      <select v-if="field.type === 'select'" v-model="values[field.key]"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
        <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <!-- Number -->
      <input v-else-if="field.type === 'number'" type="number" v-model.number="values[field.key]"
        :min="field.min" :max="field.max"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />

      <!-- Text -->
      <input v-else-if="field.type === 'text'" type="text" v-model="values[field.key]"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />

      <!-- Toggle -->
      <div v-else-if="field.type === 'toggle'">
        <button @click="values[field.key] = !values[field.key]"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="values[field.key] ? 'bg-primary-600' : 'bg-gray-300'">
          <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="values[field.key] ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </div>

      <p v-if="field.description" class="mt-1 text-xs text-gray-400">{{ field.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ParamSchema } from '@/adapters/types'

const props = defineProps<{ schema: ParamSchema }>()
const emit = defineEmits<{ (e: 'update', values: Record<string, string | number | boolean>): void }>()

const values = ref<Record<string, string | number | boolean>>({})

// 初始化默认值
watch(() => props.schema, (schema) => {
  const defaults: Record<string, string | number | boolean> = {}
  for (const field of schema.fields) {
    defaults[field.key] = field.default
  }
  values.value = defaults
  emit('update', values.value)
}, { immediate: true })

watch(values, () => emit('update', values.value), { deep: true })
</script>
```

- [ ] **Step 3: 实现结果展示组件**

Create `frontend/src/components/generation/ResultGallery.vue`:

```vue
<template>
  <div>
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
      <p class="text-gray-500 text-sm">生成中，请稍候...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm font-medium">生成失败</p>
      <p class="text-red-600 text-sm mt-1">{{ error }}</p>
    </div>

    <div v-else-if="results && results.images.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="(img, i) in results.images" :key="i"
        class="relative group rounded-lg overflow-hidden border border-gray-200 bg-white">
        <img :src="img.url" :alt="`生成结果 ${i + 1}`"
          class="w-full h-auto cursor-pointer"
          @click="$emit('preview', img)" />
        <div class="absolute bottom-0 inset-x-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2">
          <button @click="download(img, i)" class="text-white text-sm px-2 py-1 rounded hover:bg-white/20">下载</button>
          <button @click="$emit('save', img, i)" class="text-white text-sm px-2 py-1 rounded hover:bg-white/20 ml-1">保存到画廊</button>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center py-20 text-gray-400 text-sm">
      <p>生成的图片将显示在这里</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GenResult, GenResultImage } from '@/adapters/types'

defineProps<{
  loading: boolean
  error: string | null
  results: GenResult | null
}>()

defineEmits<{
  (e: 'preview', img: GenResultImage): void
  (e: 'save', img: GenResultImage, index: number): void
}>()

function download(img: GenResultImage, index: number) {
  const url = URL.createObjectURL(img.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-image-${Date.now()}-${index + 1}.png`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
```

- [ ] **Step 4: 实现文生图面板**

Create `frontend/src/components/generation/TextToImage.vue`:

```vue
<template>
  <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
    <!-- 左侧：输入 + 参数 -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">提示词 (Prompt)</label>
        <textarea v-model="prompt" rows="6"
          placeholder="描述你想要生成的图片..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-y"></textarea>
      </div>

      <ParamPanel :schema="schema" @update="onParamsUpdate" />

      <button @click="generate" :disabled="gen.loading || !prompt.trim()"
        class="w-full px-4 py-2.5 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
        {{ gen.loading ? '生成中...' : '生成图片' }}
      </button>
    </div>

    <!-- 右侧：结果 -->
    <div>
      <ResultGallery :loading="gen.loading" :error="gen.error" :results="gen.results"
        @preview="onPreview" @save="onSave" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { useSettingsStore } from '@/stores/settings'
import { getAdapter } from '@/adapters/registry'
import type { ParamSchema, GenResultImage } from '@/adapters/types'
import ParamPanel from './ParamPanel.vue'
import ResultGallery from './ResultGallery.vue'
import { useGalleryStore } from '@/stores/gallery'

const gen = useGenerationStore()
const settings = useSettingsStore()
const gallery = useGalleryStore()

const prompt = ref('')
const params = ref<Record<string, string | number | boolean>>({})

const adapter = getAdapter(settings.activeProfile?.adapterId || 'gpt-image-2')!
const schema: ParamSchema = adapter.getParamSchema()

function onParamsUpdate(values: Record<string, string | number | boolean>) {
  params.value = values
}

async function generate() {
  await gen.generateTextToImage(prompt.value, params.value)
}

function onPreview(img: GenResultImage) {
  emit('preview', img)
}

async function onSave(img: GenResultImage, _index: number) {
  await gallery.save({
    adapterId: settings.activeProfile!.adapterId,
    mode: 'text-to-image',
    prompt: prompt.value,
    params: params.value,
    image: img,
    apiConfig: { endpoint: settings.activeProfile!.config.endpoint, model: settings.activeProfile!.config.model },
  })
  emit('saved')
}

const emit = defineEmits<{
  (e: 'preview', img: GenResultImage): void
  (e: 'saved'): void
}>()
</script>
```

- [ ] **Step 5: 实现生成页（含 Tab 切换）**

Create `frontend/src/components/generation/GeneratePage.vue`:

```vue
<template>
  <div>
    <!-- 模式切换 -->
    <div class="flex gap-2 mb-6 border-b border-gray-200">
      <button v-for="tab in tabs" :key="tab.id" @click="mode = tab.id"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="mode === tab.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'">
        {{ tab.label }}
      </button>
    </div>

    <!-- 未配置 API Key 提示 -->
    <div v-if="!hasApiKey" class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <p class="text-amber-800 text-sm">
        尚未配置 API Key，请先前往
        <router-link to="/settings" class="underline font-medium">设置页面</router-link>
        配置。
      </p>
    </div>

    <TextToImage v-if="mode === 'text'" @preview="onPreview" @saved="onSaved" />
    <ImageToImage v-else @preview="onPreview" @saved="onSaved" />

    <!-- 图片预览弹窗 -->
    <ImageModal v-if="previewImage" :image="previewImage" @close="previewImage = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { GenResultImage } from '@/adapters/types'
import TextToImage from './TextToImage.vue'
import ImageToImage from './ImageToImage.vue'
import ImageModal from '@/components/ui/ImageModal.vue'

const settings = useSettingsStore()
const mode = ref<'text' | 'image'>('text')
const previewImage = ref<GenResultImage | null>(null)

const tabs = [
  { id: 'text' as const, label: '文生图' },
  { id: 'image' as const, label: '图生图' },
]

const hasApiKey = computed(() => !!settings.activeProfile?.config.apiKey)

function onPreview(img: GenResultImage) {
  previewImage.value = img
}

function onSaved() {
  // 可加 toast 提示，MVP 暂不处理
}
</script>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/stores/generation.ts frontend/src/components/generation/
git commit -m "feat: text-to-image generation with dynamic params and result display"
```

---

## Task 6: 图生图功能

**Files:**
- Create: `frontend/src/components/generation/ImageToImage.vue`
- Create: `frontend/src/components/generation/ImageUploader.vue`

- [ ] **Step 1: 实现图片上传组件**

Create `frontend/src/components/generation/ImageUploader.vue`:

```vue
<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">参考图片</label>
    <div @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
      :class="dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'"
      @click="fileInput?.click()">
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileSelect" />
      <div v-if="images.length === 0">
        <p class="text-gray-500 text-sm">点击或拖拽图片到此处上传</p>
        <p class="text-gray-400 text-xs mt-1">支持多张图片</p>
      </div>
      <div v-else class="flex flex-wrap gap-2 justify-center">
        <div v-for="(img, i) in previewUrls" :key="i" class="relative">
          <img :src="img" class="w-20 h-20 object-cover rounded-md border border-gray-200" />
          <button @click.stop="removeImage(i)"
            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ images: File[] }>()
const emit = defineEmits<{ (e: 'update:images', files: File[]): void }>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const previewUrls = ref<string[]>([])

function addFiles(files: FileList | File[]) {
  const newImages = [...props.images, ...Array.from(files).filter(f => f.type.startsWith('image/'))]
  emit('update:images', newImages)
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) addFiles(target.files)
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

function removeImage(index: number) {
  const newImages = props.images.filter((_, i) => i !== index)
  emit('update:images', newImages)
}

watch(() => props.images, (imgs) => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
  previewUrls.value = imgs.map(f => URL.createObjectURL(f))
}, { immediate: true, deep: true })
</script>
```

- [ ] **Step 2: 实现图生图面板**

Create `frontend/src/components/generation/ImageToImage.vue`:

```vue
<template>
  <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
    <!-- 左侧 -->
    <div class="space-y-4">
      <ImageUploader v-model:images="images" />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">提示词 (Prompt)</label>
        <textarea v-model="prompt" rows="4"
          placeholder="描述你想基于参考图片生成的内容..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-y"></textarea>
      </div>

      <ParamPanel :schema="schema" @update="onParamsUpdate" />

      <button @click="generate" :disabled="gen.loading || !prompt.trim() || images.length === 0"
        class="w-full px-4 py-2.5 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
        {{ gen.loading ? '生成中...' : '生成图片' }}
      </button>
    </div>

    <!-- 右侧 -->
    <div>
      <ResultGallery :loading="gen.loading" :error="gen.error" :results="gen.results"
        @preview="onPreview" @save="onSave" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { useSettingsStore } from '@/stores/settings'
import { getAdapter } from '@/adapters/registry'
import type { ParamSchema, GenResultImage } from '@/adapters/types'
import ParamPanel from './ParamPanel.vue'
import ResultGallery from './ResultGallery.vue'
import ImageUploader from './ImageUploader.vue'
import { useGalleryStore } from '@/stores/gallery'

const gen = useGenerationStore()
const settings = useSettingsStore()
const gallery = useGalleryStore()

const images = ref<File[]>([])
const prompt = ref('')
const params = ref<Record<string, string | number | boolean>>({})

const adapter = getAdapter(settings.activeProfile?.adapterId || 'gpt-image-2')!
const schema: ParamSchema = adapter.getParamSchema()

function onParamsUpdate(values: Record<string, string | number | boolean>) {
  params.value = values
}

async function generate() {
  await gen.generateImageToImage(prompt.value, images.value, params.value)
}

const emit = defineEmits<{
  (e: 'preview', img: GenResultImage): void
  (e: 'saved'): void
}>()

function onPreview(img: GenResultImage) {
  emit('preview', img)
}

async function onSave(img: GenResultImage, _index: number) {
  await gallery.save({
    adapterId: settings.activeProfile!.adapterId,
    mode: 'image-to-image',
    prompt: prompt.value,
    params: params.value,
    image: img,
    apiConfig: { endpoint: settings.activeProfile!.config.endpoint, model: settings.activeProfile!.config.model },
  })
  emit('saved')
}
</script>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/generation/ImageToImage.vue frontend/src/components/generation/ImageUploader.vue
git commit -m "feat: image-to-image generation with drag-drop uploader"
```

---

## Task 7: 图片下载、画廊与通用组件

**Files:**
- Create: `frontend/src/stores/gallery.ts`
- Create: `frontend/src/composables/useImageStorage.ts`
- Create: `frontend/src/components/ui/ImageModal.vue`
- Create: `frontend/src/components/gallery/GalleryPage.vue`

- [ ] **Step 1: 实现 IndexedDB 图片存储 composable**

Create `frontend/src/composables/useImageStorage.ts`:

```typescript
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'ai-image-online'
const STORE_NAME = 'gallery'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export interface GalleryItem {
  id: string
  adapterId: string
  mode: string
  prompt: string
  params: Record<string, unknown>
  imageData: Blob
  mimeType: string
  createdAt: number
  apiConfig: { endpoint: string; model: string }
}

export async function saveToGallery(item: GalleryItem): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, item)
}

export async function getAllFromGallery(): Promise<GalleryItem[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteFromGallery(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function clearGallery(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}
```

- [ ] **Step 2: 实现 gallery store**

Create `frontend/src/stores/gallery.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  saveToGallery, getAllFromGallery, deleteFromGallery, clearGallery,
  type GalleryItem,
} from '@/composables/useImageStorage'
import type { GenResultImage } from '@/adapters/types'

interface SavePayload {
  adapterId: string
  mode: string
  prompt: string
  params: Record<string, unknown>
  image: GenResultImage
  apiConfig: { endpoint: string; model: string }
}

export const useGalleryStore = defineStore('gallery', () => {
  const items = ref<GalleryItem[]>([])
  const loaded = ref(false)

  async function load() {
    items.value = await getAllFromGallery()
    loaded.value = true
  }

  async function save(payload: SavePayload) {
    const item: GalleryItem = {
      id: crypto.randomUUID(),
      adapterId: payload.adapterId,
      mode: payload.mode,
      prompt: payload.prompt,
      params: payload.params,
      imageData: payload.image.data,
      mimeType: payload.image.mimeType,
      createdAt: Date.now(),
      apiConfig: payload.apiConfig,
    }
    await saveToGallery(item)
    items.value.unshift(item)
  }

  async function remove(id: string) {
    await deleteFromGallery(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  async function clear() {
    await clearGallery()
    items.value = []
  }

  return { items, loaded, load, save, remove, clear }
})
```

- [ ] **Step 3: 实现图片放大弹窗**

Create `frontend/src/components/ui/ImageModal.vue`:

```vue
<template>
  <div @click="$emit('close')"
    class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
    <div @click.stop class="relative max-w-[90vw] max-h-[90vh]">
      <img :src="imageUrl" alt="预览"
        class="max-w-full max-h-[90vh] object-contain rounded-lg" />
      <button @click="$emit('close')"
        class="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GenResultImage } from '@/adapters/types'

const props = defineProps<{ image: GenResultImage }>()
defineEmits<{ (e: 'close'): void }>()

const imageUrl = computed(() => props.image.url)
</script>
```

- [ ] **Step 4: 实现画廊页**

Create `frontend/src/components/gallery/GalleryPage.vue`:

```vue
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">历史画廊</h1>
      <button v-if="gallery.items.length" @click="confirmClear"
        class="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50">清空全部</button>
    </div>

    <div v-if="!gallery.loaded" class="text-center py-20 text-gray-400">加载中...</div>

    <div v-else-if="gallery.items.length === 0" class="text-center py-20 text-gray-400">
      <p>还没有保存的图片</p>
      <p class="text-sm mt-1">在生成页面点击"保存到画廊"即可收藏</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="item in gallery.items" :key="item.id"
        class="relative group rounded-lg overflow-hidden border border-gray-200 bg-white cursor-pointer"
        @click="previewItem(item)">
        <img :src="getURL(item)" :alt="item.prompt"
          class="w-full aspect-square object-cover" />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-2">
          <p class="text-white text-xs opacity-0 group-hover:opacity-100 line-clamp-2">{{ item.prompt }}</p>
          <div class="flex gap-1 mt-1 opacity-0 group-hover:opacity-100">
            <button @click.stop="downloadItem(item)"
              class="text-white text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30">下载</button>
            <button @click.stop="gallery.remove(item.id)"
              class="text-white text-xs px-2 py-1 rounded bg-red-500/50 hover:bg-red-500/70">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="previewing" @click="previewing = null"
      class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div @click.stop class="relative max-w-[90vw] max-h-[90vh]">
        <img :src="getURL(previewing)" alt="预览" class="max-w-full max-h-[80vh] rounded-lg" />
        <div class="bg-white rounded-lg mt-3 p-4 max-w-[90vw]">
          <p class="text-sm text-gray-800">{{ previewing.prompt }}</p>
          <div class="flex gap-3 mt-2 text-xs text-gray-500">
            <span>{{ previewing.mode === 'text-to-image' ? '文生图' : '图生图' }}</span>
            <span>{{ previewing.apiConfig.model }}</span>
            <span>{{ new Date(previewing.createdAt).toLocaleString() }}</span>
          </div>
        </div>
        <button @click="previewing = null"
          class="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGalleryStore } from '@/stores/gallery'
import type { GalleryItem } from '@/composables/useImageStorage'

const gallery = useGalleryStore()
const previewing = ref<GalleryItem | null>(null)

const urlCache = new Map<string, string>()

function getURL(item: GalleryItem): string {
  if (!urlCache.has(item.id)) {
    urlCache.set(item.id, URL.createObjectURL(item.imageData))
  }
  return urlCache.get(item.id)!
}

function previewItem(item: GalleryItem) {
  previewing.value = item
}

function downloadItem(item: GalleryItem) {
  const url = getURL(item)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-image-${item.id}.png`
  a.click()
}

function confirmClear() {
  if (confirm('确定清空所有历史图片吗？此操作不可恢复。')) {
    gallery.clear()
  }
}

onMounted(() => gallery.load())
</script>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/composables/useImageStorage.ts frontend/src/stores/gallery.ts frontend/src/components/ui/ frontend/src/components/gallery/
git commit -m "feat: IndexedDB gallery with image viewer and download"
```

---

## Task 8: Docker 部署

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: 创建 .gitignore**

Create `.gitignore`:

```gitignore
# Dependencies
frontend/node_modules/

# Build output
frontend/dist/
server/server
server/static/

# Environment
.env
.env.local

# OS
.DS_Store

# IDE
.vscode/
.idea/

# Docker data
data/
```

- [ ] **Step 2: 创建 .dockerignore**

Create `.dockerignore`:

```dockerignore
frontend/node_modules
frontend/dist
server/server
data/
.git
.gitignore
*.md
docs/
```

- [ ] **Step 3: 创建 Dockerfile（多阶段构建）**

Create `Dockerfile`:

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
RUN mkdir -p static
COPY --from=frontend-builder /app/frontend/dist ./static
RUN CGO_ENABLED=0 GOOS=linux go build -o server -ldflags="-s -w" .

# Stage 3: 运行
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=server-builder /app/server/server /app/server
COPY --from=server-builder /app/server/static /app/static
EXPOSE 8080
CMD ["/app/server"]
```

- [ ] **Step 4: 创建 docker-compose.yml**

Create `docker-compose.yml`:

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
      - ./data/images:/app/data/images
    environment:
      - TZ=Asia/Shanghai
      - PORT=8080
    restart: unless-stopped
```

- [ ] **Step 5: 创建 README.md**

Create `README.md`:

```markdown
# AI Image Online

自托管 AI 图片生成 Web 应用，支持自配置 OpenAI 兼容图片 API，文生图 + 图生图，Docker 部署。

## 快速开始

### Docker 部署（推荐）

```bash
docker compose up -d --build
```

访问 `http://localhost:8080`（或 NAS IP:8080）。

### 飞牛 NAS 部署

1. 将项目复制到 NAS（如 `/vol1/1000/docker/ai-image-online/`）
2. SSH 登录 NAS，进入项目目录
3. 运行 `docker compose up -d --build`
4. 访问 `http://<NAS-IP>:8080`

### 本地开发

```bash
# 终端 1：启动 Go 后端
cd server && go run . &

# 终端 2：启动前端开发服务器
cd frontend && npm install && npm run dev
```

前端访问 `http://localhost:3000`，API 请求自动代理到 Go 服务。

## 使用说明

1. 打开「设置」页面，配置 API 地址和 API Key
2. 点击「测试连接」验证配置
3. 打开「生成」页面，选择文生图或图生图
4. 输入提示词，调整参数，点击生成
5. 生成后可下载图片或保存到画廊

## 技术栈

- 前端：Vue 3 + TypeScript + Vite + TailwindCSS + Pinia
- 后端：Go (net/http) — 静态文件 + 透明代理
- 存储：IndexedDB（浏览器本地）
- 部署：Docker multi-stage
```

- [ ] **Step 6: 验证 Docker 构建**

```bash
docker compose up -d --build
```
Expected: 构建成功，容器启动，访问 `http://localhost:8080` 正常

- [ ] **Step 7: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore .gitignore README.md
git commit -m "feat: Docker multi-stage build and deployment config"
```

---

## 完成标准

- [ ] 设置页可配置 API 地址、Key、模型，多配置切换，连接测试
- [ ] 文生图：输入 prompt → 配置参数 → 生成 → 结果展示 → 下载
- [ ] 图生图：上传图片 → 输入 prompt → 生成 → 结果展示 → 下载
- [ ] 画廊：保存图片 → 浏览历史 → 放大查看 → 下载/删除
- [ ] 响应式：移动端和 PC 端均正常使用
- [ ] Docker：`docker compose up -d --build` 一键部署
