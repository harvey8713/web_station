# Web Station 项目总览

珠宝设计编辑平台 - Magician in Jewellery

## 项目结构

```
web_station/
├── backend/          # Strapi CMS 后端
├── frontend/         # Next.js 14 前端
└── design-templates/ # 设计模板
```

## 技术栈

### 后端 (Strapi)
- Strapi 5.x
- PostgreSQL (生产环境) / SQLite (开发环境)
- AI 内容生成插件
- 图片上传功能
- Railway 部署: https://backend-production-fafe.up.railway.app

### 前端 (Next.js)
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- next-intl (国际化)
- 极简黑白设计风格

## 快速开始

### 1. 启动后端

```bash
cd backend
npm run develop
```

访问: http://localhost:1337/admin

### 2. 启动前端

```bash
cd frontend
npm run dev
```

访问: http://localhost:3001 (端口可能因占用而变化)

## 功能特性

- 中英文双语支持
- 文章管理系统
- 分类管理
- AI 内容生成
- 响应式设计
- SEO 优化
- 图片优化

## 环境配置

### 后端环境变量
在 `backend/.env` 中配置

### 前端环境变量
在 `frontend/.env.local` 中配置:
```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=
```

## 开发状态

- [x] Strapi 后端搭建
- [x] AI 内容生成插件
- [x] 图片上传配置
- [x] Next.js 前端搭建
- [x] 前后端 API 对接
- [x] 部署后端到 Railway
- [x] 部署前端到 Vercel
- [x] 修复 logo 显示问题
- [x] 修复 Strapi i18n API 调用问题
- [ ] 修复 Vercel 部署超时问题
- [ ] 部署到阿里云

## 最近更新 (2026-04-25)

### 修复的问题
1. **Logo 显示问题**: 将 logo.jpg 移至 frontend/public/ 目录，使用标准 img 标签
2. **API 400 错误**: 修正 Strapi i18n 插件的 API 参数格式
   - 使用 `locale` 参数替代 `filters[locale][$eq]`
   - 简化 populate 参数为 `populate: '*'`
3. **Middleware 配置**: 排除图片等静态资源文件，避免被国际化路由拦截

### 技术要点
- Strapi i18n 插件使用 `locale` 参数而非过滤器语法
- Next.js middleware 需要正确配置 matcher 以排除静态资源
- 图片文件应放在 public 目录下直接访问

## 文档

- [后端文档](./backend/README.md)
- [前端文档](./frontend/README.md)
