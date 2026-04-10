# Flux API - Postman-like API Testing Tool

一个功能完整的 API 测试工具，类似 Postman，支持项目管理和请求保存。

## 功能特性

- 项目管理：创建、编辑、删除 API 项目
- 请求管理：保存和管理 API 请求
- 支持 HTTP 方法：GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- 请求配置：
  - URL 参数 (Query Params)
  - 请求头 (Headers)
  - 请求体 (Body): raw, json, form-data, x-www-form-urlencoded
  - 认证 (Authorization): Basic, Bearer Token, API Key
- 响应查看：状态码、响应时间、响应大小、Headers、Body
- JSON 响应格式化显示
- 数据持久化存储在 MongoDB

## 技术栈

### 后端

- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- Axios (HTTP 请求)

### 前端

- React 18 + TypeScript
- Ant Design 5
- Vite
- React Router

## 快速开始

### 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 配置环境变量

后端 `.env` 文件已配置好 MongoDB 连接：

```
PORT=3001
MONGODB_URI=mongodb://xxxx:xxxx@xxxx:xxxx/smartck?authSource=admin
```

### 启动应用

```bash
# 后端 (终端1)
cd backend
npm run dev

# 前端 (终端2)
cd frontend
npm run dev
```

### 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001

## 使用指南

1. **创建项目**
   - 首页点击 "New Project"
   - 输入项目名称和描述
   - 创建后进入工作区

2. **添加请求**
   - 在工作区左侧点击 "+ New"
   - 配置请求方法、URL
   - 添加 Params、Headers、Body 等
   - 点击 "Send" 发送请求
   - 点击 "Save" 保存请求

3. **查看响应**
   - 发送请求后，响应会显示在底部
   - 包含状态码、耗时、大小
   - 支持 JSON 格式化显示

## API 端点

### 项目

- `POST /api/projects` - 创建项目
- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 请求

- `POST /api/requests` - 创建请求
- `GET /api/requests?projectId=xxx` - 获取请求列表
- `GET /api/requests/:id` - 获取请求详情
- `PUT /api/requests/:id` - 更新请求
- `DELETE /api/requests/:id` - 删除请求
- `POST /api/requests/:id/send` - 发送并保存请求

### 发送请求

- `POST /api/send` - 直接发送请求（不保存）

## 数据库结构

### Projects (项目)

- `_id`: 项目ID
- `name`: 项目名称
- `description`: 项目描述
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### Requests (请求)

- `_id`: 请求ID
- `projectId`: 所属项目ID
- `name`: 请求名称
- `method`: HTTP 方法
- `url`: 请求 URL
- `headers`: 请求头数组
- `params`: URL 参数数组
- `body`: 请求体配置
- `auth`: 认证配置
- `response`: 最后一次响应
- `createdAt`: 创建时间
- `updatedAt`: 更新时间
