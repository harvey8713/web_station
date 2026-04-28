# AI内容生成插件使用指南

## 快速开始

### 1. 配置API密钥

编辑 `/Users/harvey/Desktop/web_station/backend/.env` 文件，将 `QWEN_API_KEY` 替换为你的真实API密钥：

```bash
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 启动Strapi

```bash
cd /Users/harvey/Desktop/web_station/backend
npm run develop
```

### 3. 使用插件

1. 访问 http://localhost:1337/admin
2. 登录管理后台
3. 进入 Content Manager > Article
4. 点击"Create new entry"或编辑现有文章
5. 在右侧面板找到"AI 内容生成"组件
6. 填写文章描述，点击"生成文章内容"

## 使用示例

### 示例1：基于描述生成内容

**输入描述：**
```
介绍一款极简主义钻石戒指，采用18K白金材质，单颗0.5克拉钻石，
设计灵感来自包豪斯建筑的简洁线条，体现"少即是多"的设计哲学。
```

**生成结果：**
- 标题：线条的诗意：极简主义钻石戒指
- 摘要：以包豪斯建筑为灵感，18K白金与0.5克拉钻石的完美结合...
- 正文：完整的Markdown格式文章
- 阅读时间：自动计算

### 示例2：基于图片和描述生成

**输入：**
- 图片URL：https://example.com/ring-image.jpg
- 描述：这款戒指展现了建筑美学与珠宝工艺的融合...

**效果：**
AI会参考图片内容和描述，生成更贴合实际产品的文章。

## 品牌调性说明

插件默认使用以下品牌调性：

### 极简黑白风格
- 语言简洁有力
- 避免冗余修饰
- 注重留白和节奏

### 建筑美学
- 强调结构感
- 突出线条感
- 体现空间感

### 艺术性表达
- 融入艺术鉴赏视角
- 提升内容格调
- 注重细节描写

## API接口使用

### 生成内容接口

```bash
curl -X POST http://localhost:1337/api/ai-content-generator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "介绍一款极简风格的钻石戒指",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

### 测试连接接口

```bash
curl http://localhost:1337/api/ai-content-generator/test-connection
```

## 常见问题

### Q: 生成的内容不符合预期？
A: 尝试提供更详细的描述，包括产品特点、设计理念、材质工艺等信息。

### Q: API调用超时？
A: 检查网络连接，确保能访问阿里云服务。超时时间设置为60秒。

### Q: 如何自定义品牌调性？
A: 在API调用时传入 `brandTone` 参数，或修改 `qwen-service.ts` 中的默认提示词。

### Q: 生成的内容需要人工审核吗？
A: 建议对AI生成的内容进行人工审核和优化后再发布。

## 技术支持

如遇问题，请查看：
1. Strapi日志：`/Users/harvey/Desktop/web_station/backend/strapi.log`
2. 浏览器控制台错误信息
3. 插件README：`/Users/harvey/Desktop/web_station/backend/src/plugins/ai-content-generator/README.md`
