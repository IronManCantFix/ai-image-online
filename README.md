# AI Image Online

AI 图片生成 Web 应用，支持文生图和图生图，兼容 GPT Image 2 协议。可部署到飞牛 NAS。

## 技术栈

- **前端**：Vue 3 + TypeScript + Vite + TailwindCSS + Pinia + Naive UI
- **后端**：Go（透明代理，解决 CORS）
- **部署**：Docker 单容器

## 本地开发

```bash
# 启动 Go 后端
cd server && go run .

# 启动前端开发服务器
cd frontend && npm install && npm run dev
# 访问 http://localhost:3000
```

## Docker 构建

```bash
docker build -t ai-image-online:latest .
docker run -d -p 8080:8080 --name ai-image-online ai-image-online:latest
# 访问 http://localhost:8080
```

## 飞牛 NAS 部署

### 方式一：手动安装 fpk

1. 构建 Docker 镜像并推送到可访问的镜像仓库
2. 修改 `fnos-app/app/docker/docker-compose.yaml` 中的镜像地址
3. 打包 fpk：
   ```bash
   # 下载 fnpack CLI
   curl -sL https://static2.fnnas.com/fnpack/fnpack-1.2.3-darwin-arm64 -o /usr/local/bin/fnpack
   chmod +x /usr/local/bin/fnpack

   # 构建 fpk
   cd fnos-app && fnpack build
   ```
4. 将 `fnos-app/ai-image-online.fpk` 上传到飞牛 NAS
5. 在飞牛应用中心 → 手动安装 → 选择 fpk 文件

### 方式二：Docker Compose 直接部署

在飞牛 NAS 的终端中：
```bash
docker build -t ai-image-online:latest https://github.com/yourname/ai-image-online.git
docker run -d -p 8080:8080 -v /vol1/@appdata/ai-image-online:/app/data --name ai-image-online --restart unless-stopped ai-image-online:latest
```

## 功能

- 文生图 / 图生图（GPT Image 2 协议）
- 多 API 提供商配置
- 生成历史记录（支持批量删除）
- 画廊（IndexedDB 持久化）
- 浅色/深色主题切换
- PC/移动端响应式
- 图片下载
- 原始 API 响应查看
- 关于页面（开源地址、构建版本号，每次构建自动 +1）
