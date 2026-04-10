# Postman-like API 测试工具 - 实现方案

## 项目架构

### 技术栈选择
- **后端**: Node.js + Express + TypeScript
- **前端**: React + Ant Design + Vite
- **数据库**: MongoDB (已有连接)
- **HTTP客户端**: axios

## 数据库设计

### collections

### 1. projects (项目集合)
```javascript
{
  _id: ObjectId,
  name: String,           // 项目名称
  description: String,    // 项目描述
  createdAt: Date,
  updatedAt: Date
}
```

### 2. requests (请求集合)
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,    // 所属项目
  name: String,           // 请求名称
  method: String,         // GET, POST, PUT, DELETE, PATCH
  url: String,            // 请求URL
  headers: Array[{        // 请求头
    key: String,
    value: String,
    enabled: Boolean
  }],
  params: Array[{         // URL参数
    key: String,
    value: String,
    enabled: Boolean
  }],
  body: {
    type: String,         // none, form-data, x-www-form-urlencoded, raw, json
    raw: String,          // raw内容
    formUrlEncoded: Array[{key, value, enabled}],
    formData: Array[{key, value, type, enabled}]
  },
  auth: {
    type: String,         // none, basic, bearer, apikey
    basic: {username, password},
    bearer: {token},
    apikey: {key, value, addTo}
  },
  response: Object,       // 保存最后一次响应
  createdAt: Date,
  updatedAt: Date
}
```

## 后端API设计

### 项目管理
- `POST /api/projects` - 创建项目
- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 请求管理
- `POST /api/requests` - 创建请求
- `GET /api/requests?projectId=xxx` - 获取项目的所有请求
- `GET /api/requests/:id` - 获取请求详情
- `PUT /api/requests/:id` - 更新请求
- `DELETE /api/requests/:id` - 删除请求

### 请求执行
- `POST /api/requests/:id/send` - 发送请求
- `POST /api/send` - 直接发送（不保存）

## 前端页面设计

### 主要功能模块

1. **项目列表页**
   - 显示所有项目
   - 创建/编辑/删除项目
   - 点击进入项目详情

2. **请求编辑器** (核心页面)
   - 左侧：项目内请求列表
   - 右侧：请求编辑和发送区域
     - Method选择 + URL输入
     - Tabs: Params | Authorization | Headers | Body | Response
     - Send按钮
     - Response显示区域

3. **响应显示**
   - 状态码、耗时、大小
   - Response Body (支持JSON格式化)
   - Response Headers

## 项目目录结构

```
flux-api/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts      # MongoDB配置
│   │   ├── models/
│   │   │   ├── Project.ts
│   │   │   └── Request.ts
│   │   ├── routes/
│   │   │   ├── projects.ts
│   │   │   ├── requests.ts
│   │   │   └── send.ts          # 请求发送
│   │   ├── controllers/
│   │   │   └── requestController.ts
│   │   ├── middleware/
│   │   │   └── cors.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── httpClient.ts    # HTTP请求封装
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── RequestEditor.tsx
│   │   │   ├── RequestList.tsx
│   │   │   ├── ResponseViewer.tsx
│   │   │   └── KeyValueEditor.tsx
│   │   ├── pages/
│   │   │   ├── Projects.tsx
│   │   │   └── Workspace.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

## 核心实现要点

### 1. HTTP请求转发
后端作为代理，避免前端CORS问题：
```typescript
// 使用axios发送请求，支持所有配置
axios({
  method: request.method,
  url: request.url,
  headers: buildHeaders(request.headers),
  params: buildParams(request.params),
  data: buildBody(request.body),
  timeout: 30000,
  validateStatus: () => true  // 接收所有状态码
})
```

### 2. 响应处理
- 记录响应时间
- 保存响应状态码、headers、body
- JSON自动格式化显示

### 3. 实时保存
- 请求修改时自动保存到数据库（debounce）
- 可选择保存为示例请求

## 开发步骤建议

1. **Phase 1: 后端基础**
   - 项目初始化
   - MongoDB连接
   - 定义数据模型
   - 实现基础CRUD API

2. **Phase 2: 请求发送**
   - 实现HTTP代理功能
   - 处理各种请求类型
   - 响应存储

3. **Phase 3: 前端基础**
   - 项目初始化
   - 布局框架
   - 项目列表页面

4. **Phase 4: 请求编辑器**
   - 请求编辑表单
   - Key-Value编辑器
   - 发送请求

5. **Phase 5: 响应展示**
   - 响应数据显示
   - JSON格式化
   - 状态展示

6. **Phase 6: 优化**
   - 请求历史
   - 环境变量支持
   - 请求收藏/导入导出
