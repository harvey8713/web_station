# Magician in Jewellery - Frontend

Next.js 14 前端项目，采用极简黑白设计风格。

## 技术栈

- **Next.js 14** - App Router
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **next-intl** - 国际化（中英文切换）
- **Axios** - API 请求
- **Strapi** - 后端 CMS

## 项目结构

```
frontend/
├── src/
│   ├── app/
│   │   ├── [locale]/          # 国际化路由
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── about/         # 关于页
│   │   │   ├── insights/      # 洞察列表页
│   │   │   ├── profiles/      # 人物页
│   │   │   ├── culture/       # 文化页
│   │   │   ├── articles/[slug]/ # 文章详情页
│   │   │   └── category/[slug]/ # 分类页
│   │   ├── layout.tsx
│   │   ├── page.tsx           # 根路由重定向
│   │   └── globals.css
│   ├── components/
│   │   ├── Navigation.tsx     # 导航栏
│   │   ├── Footer.tsx         # 页脚
│   │   └── ArticleCard.tsx    # 文章卡片
│   ├── i18n/
│   │   ├── routing.ts         # 路由配置
│   │   └── request.ts         # 请求配置
│   ├── lib/
│   │   └── api.ts             # Strapi API 封装
│   └── middleware.ts          # 国际化中间件
├── messages/
│   ├── en.json                # 英文翻译
│   └── zh.json                # 中文翻译
├── public/
│   └── logo.jpg               # Logo（需要添加）
├── .env.local                 # 环境变量
└── next.config.ts
```

## 环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your_api_token_here
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

访问 http://localhost:3000

## 功能特性

### 1. 国际化
- 支持中英文切换
- URL 路径包含语言前缀（/en, /zh）
- 使用 next-intl 实现

### 2. 页面
- **首页** - Hero、简介、最新文章、联系方式
- **文章列表** - 所有文章展示
- **文章详情** - 单篇文章完整内容
- **分类页** - 按分类筛选文章
- **关于页** - 平台介绍

### 3. 设计风格
- 极简黑白风格
- Cormorant Garamond（衬线字体）+ Inter（无衬线字体）
- 响应式设计
- 优雅的动画效果

### 4. SEO 优化
- 服务端渲染（SSR）
- 图片优化（next/image）
- 语义化 HTML
- Meta 标签支持

## API 集成

项目通过 `/src/lib/api.ts` 与 Strapi 后端通信：

- `getArticles()` - 获取文章列表
- `getArticleBySlug()` - 获取单篇文章
- `getCategories()` - 获取分类列表
- `getArticlesByCategory()` - 按分类获取文章

## 构建

```bash
npm run build
npm start
```

## 注意事项

1. 需要在 `public/` 目录添加 `logo.jpg` 文件
2. 确保 Strapi 后端已启动并配置正确
3. 文章内容使用 HTML 格式存储
4. 图片需要配置 Strapi 上传功能

## 待完成

- [ ] 添加 Logo 文件
- [ ] 配置 Strapi API Token
- [ ] 添加分页功能
- [ ] 添加搜索功能
- [ ] 优化 SEO metadata
- [ ] 添加 sitemap
