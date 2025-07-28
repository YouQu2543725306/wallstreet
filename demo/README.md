# 酒店管理系统 Demo

本项目包含：
- 前端：React + Vite，展示酒店列表，支持添加、编辑、删除酒店。
- 后端：Node.js + Express，连接 MySQL，提供酒店的增删改查接口。

## 启动方法

### 后端
1. 进入 `server` 目录，安装依赖：
   ```bash
   npm install
   ```
2. 启动服务：
   ```bash
   npm start
   ```
3. 确保 MySQL 已启动，并创建数据库 `hotel_demo`。

### 前端
1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动前端：
   ```bash
   npm run dev
   ```

## 数据库初始化
```sql
CREATE DATABASE hotel_demo;
```

## API 示例
- GET    /api/hotels
- POST   /api/hotels
- PUT    /api/hotels/:id
- DELETE /api/hotels/:id
