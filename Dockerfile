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
