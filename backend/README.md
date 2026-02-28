# Todo Backend

Go + Gin + SQLite Todo List 后端应用

## 技术栈

- Go 1.21+
- Gin (Web 框架)
- GORM (ORM)
- SQLite (数据库)

## 项目结构

```
/backend
  /cmd
    server/main.go       # 入口文件
  /internal
    /handler             # HTTP 处理器
      todo.go
    /model               # 数据模型
      todo.go
    /repository          # 数据访问层
      todo.go
    /database            # 数据库初始化
      database.go
  go.mod
  go.sum
```

## API 接口

Base URL: http://localhost:8080/api

### 统一响应格式

```json
{
  "code": 0,
  "data": ...,
  "message": "success"
}
```

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/todos | 获取所有 Todo |
| GET | /api/todos/:id | 获取单个 Todo |
| POST | /api/todos | 创建 Todo |
| PUT | /api/todos/:id | 更新 Todo |
| DELETE | /api/todos/:id | 删除 Todo |

### 请求示例

#### 创建 Todo
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "学习 Go", "content": "学习 Gin 框架"}'
```

#### 更新 Todo
```bash
curl -X PUT http://localhost:8080/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "学习 Go", "content": "完成", "completed": true}'
```

## 运行步骤

1. 确保已安装 Go 1.21+

2. 进入后端目录
   ```bash
   cd backend
   ```

3. 安装依赖
   ```bash
   go mod tidy
   ```

4. 运行服务
   ```bash
   go run cmd/server/main.go
   ```

5. 服务启动后访问 http://localhost:8080

## 数据库

数据库文件: `todo.db` (自动创建)

表结构:
- id: INTEGER PRIMARY KEY
- title: TEXT NOT NULL
- content: TEXT
- completed: BOOLEAN
- created_at: DATETIME
- updated_at: DATETIME
