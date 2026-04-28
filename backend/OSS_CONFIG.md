# 阿里云OSS图片上传配置说明

## 概述

本项目已集成阿里云OSS作为Strapi的图片上传存储方案，所有通过Strapi管理后台上传的媒体文件将自动存储到阿里云OSS。

## 安装的插件

- `strapi-provider-upload-oss` - Strapi的阿里云OSS上传提供者插件

## 配置步骤

### 1. 获取阿里云OSS凭证

登录阿里云控制台，获取以下信息：

- **AccessKey ID**: 访问密钥ID
- **AccessKey Secret**: 访问密钥Secret
- **Region**: OSS区域，如 `oss-cn-hangzhou`
- **Bucket**: OSS存储桶名称
- **Endpoint**: OSS访问域名，如 `oss-cn-hangzhou.aliyuncs.com`

### 2. 配置环境变量

在项目根目录的 `.env` 文件中添加以下配置：

```bash
# 阿里云OSS配置
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=your_bucket_name
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
```

**注意**:
- 请将上述占位符替换为你的实际OSS凭证
- 不要将 `.env` 文件提交到版本控制系统
- `.env.example` 文件已更新，包含了所需的环境变量模板

### 3. OSS Bucket权限设置

确保你的OSS Bucket具有以下权限：

1. **读写权限**: 允许上传和删除文件
2. **公共读**: 如果需要直接通过URL访问图片，设置Bucket为公共读权限
3. **跨域配置**: 如果前端需要直接访问OSS，配置CORS规则

### 4. 配置文件说明

插件配置位于 `/Users/harvey/Desktop/web_station/backend/config/plugins.ts`：

```typescript
upload: {
  config: {
    provider: 'strapi-provider-upload-oss',
    providerOptions: {
      accessKeyId: env('OSS_ACCESS_KEY_ID'),
      accessKeySecret: env('OSS_ACCESS_KEY_SECRET'),
      region: env('OSS_REGION'),
      bucket: env('OSS_BUCKET'),
      endpoint: env('OSS_ENDPOINT'),
      secure: true,  // 使用HTTPS
      timeout: 60000,  // 超时时间60秒
    },
    actionOptions: {
      upload: {},
      uploadStream: {},
      delete: {},
    },
  },
}
```

## 使用方法

### 在Strapi管理后台上传图片

1. 启动Strapi: `npm run develop`
2. 登录管理后台: `http://localhost:1337/admin`
3. 进入 Media Library (媒体库)
4. 点击上传按钮，选择图片文件
5. 图片将自动上传到阿里云OSS

### 在内容类型中使用图片

1. 在Content-Type Builder中添加Media字段
2. 在内容编辑页面上传或选择图片
3. 图片URL将自动指向OSS存储地址

## 常见问题

### 1. 上传失败

- 检查环境变量是否正确配置
- 确认AccessKey ID和Secret是否有效
- 验证Bucket名称和Region是否匹配
- 检查OSS Bucket权限设置

### 2. 图片无法访问

- 确认Bucket是否设置为公共读
- 检查OSS防盗链设置
- 验证Endpoint配置是否正确

### 3. 超时错误

- 调整 `timeout` 配置值
- 检查网络连接
- 确认OSS服务状态

## 安全建议

1. **不要硬编码密钥**: 始终使用环境变量存储敏感信息
2. **最小权限原则**: 为OSS AccessKey分配最小必要权限
3. **定期轮换密钥**: 定期更新AccessKey ID和Secret
4. **使用RAM子账号**: 不要使用主账号的AccessKey
5. **启用HTTPS**: 配置中已启用 `secure: true`

## 相关链接

- [阿里云OSS文档](https://help.aliyun.com/product/31815.html)
- [strapi-provider-upload-oss](https://www.npmjs.com/package/strapi-provider-upload-oss)
- [Strapi Upload插件文档](https://docs.strapi.io/dev-docs/plugins/upload)
