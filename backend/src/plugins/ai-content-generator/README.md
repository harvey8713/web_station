# AI Content Generator Plugin for Strapi

基于通义千问API的Strapi AI内容生成插件，专为珠宝品牌内容创作设计。

## 功能特性

- ✨ 使用通义千问qwen-plus模型生成高质量文章内容
- 🎨 符合品牌调性：极简黑白风格、建筑美学、艺术性表达
- 📝 自动生成标题、摘要、正文（Markdown格式）
- ⏱️ 自动计算阅读时间
- 🖼️ 支持基于图片和描述生成内容
- 🔌 无缝集成到Article内容类型编辑页面

## 安装配置

### 1. 环境变量配置

在 `.env` 文件中添加通义千问API密钥：

```bash
QWEN_API_KEY=your_qwen_api_key_here
```

### 2. 获取通义千问API密钥

1. 访问阿里云百炼平台：https://bailian.console.aliyun.com/
2. 开通DashScope服务
3. 创建API Key
4. 将API Key配置到环境变量中

### 3. 插件已自动注册

插件已在 `config/plugins.ts` 中注册，无需额外配置。

## 使用方法

### 在Admin面板中使用

1. 登录Strapi管理后台
2. 进入 Content Manager > Article
3. 创建或编辑文章
4. 在右侧面板找到"AI 内容生成"组件
5. 输入文章描述（可选：添加参考图片URL）
6. 点击"生成文章内容"按钮
7. AI生成的内容会自动填充到表单中

### API调用

#### 生成内容

```bash
POST /api/ai-content-generator/generate
Content-Type: application/json

{
  "description": "介绍一款极简风格的钻石戒指，强调其建筑感的线条设计和艺术性",
  "imageUrl": "https://example.com/image.jpg",  // 可选
  "brandTone": "自定义品牌调性"  // 可选
}
```

响应：

```json
{
  "success": true,
  "data": {
    "title": "生成的标题",
    "excerpt": "生成的摘要",
    "content": "生成的Markdown格式正文",
    "readingTime": 5
  }
}
```

#### 测试API连接

```bash
GET /api/ai-content-generator/test-connection
```

响应：

```json
{
  "success": true,
  "connected": true,
  "message": "Qwen API connection successful"
}
```

## 品牌调性

插件默认使用以下品牌调性生成内容：

- **极简黑白风格**：语言简洁有力，避免冗余修饰
- **建筑美学**：注重结构感、线条感、空间感的表达
- **艺术性**：融入艺术鉴赏视角，提升内容格调
- **高端定位**：体现品质感和专业性

## 技术架构

```
src/plugins/ai-content-generator/
├── admin/                          # 管理面板前端
│   └── src/
│       ├── components/
│       │   ├── AIContentGenerator.tsx      # AI生成组件
│       │   └── InjectedAIGenerator.tsx     # 注入到编辑页面
│       ├── translations/
│       │   ├── en.json
│       │   └── zh-Hans.json
│       └── index.tsx                       # Admin入口
├── server/                         # 服务端
│   ├── controllers/
│   │   └── ai-controller.ts               # 控制器
│   ├── services/
│   │   └── qwen-service.ts                # 通义千问服务
│   ├── routes/
│   │   └── index.ts                       # 路由配置
│   └── index.ts                           # Server入口
├── strapi-admin.ts                 # Admin配置
├── strapi-server.ts                # Server配置
└── package.json
```

## 依赖项

- `axios`: HTTP客户端，用于调用通义千问API
- `@strapi/design-system`: Strapi设计系统组件
- `@strapi/strapi`: Strapi核心

## 注意事项

1. **API密钥安全**：请勿将API密钥提交到版本控制系统
2. **API配额**：注意通义千问API的调用配额和费用
3. **内容审核**：AI生成的内容建议人工审核后再发布
4. **网络超时**：API调用超时时间设置为60秒

## 故障排查

### 插件未显示

- 检查 `config/plugins.ts` 中是否正确注册插件
- 重启Strapi服务：`npm run develop`
- 清除缓存：删除 `.cache` 和 `dist` 目录后重启

### API调用失败

- 检查 `.env` 中的 `QWEN_API_KEY` 是否正确配置
- 使用测试接口验证API连接：`GET /api/ai-content-generator/test-connection`
- 查看Strapi日志获取详细错误信息

### 内容未自动填充

- 确认在Article内容类型的编辑页面
- 检查浏览器控制台是否有错误信息
- 确认Article schema中包含 `title`、`excerpt`、`content`、`reading_time` 字段

## 开发者

Harvey

## 许可证

MIT
