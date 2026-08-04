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
cd server && go run .

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
