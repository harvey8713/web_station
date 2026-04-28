export default ({ strapi }) => ({
  async generate(ctx) {
    try {
      const { imageUrl, description, brandTone } = ctx.request.body;

      // 验证必填参数
      if (!description || description.trim().length === 0) {
        return ctx.badRequest('Description is required');
      }

      // 调用服务生成内容
      const qwenService = strapi.plugin('ai-content-generator').service('qwenService');
      const generatedContent = await qwenService.generateContent({
        imageUrl,
        description,
        brandTone,
      });

      ctx.body = {
        success: true,
        data: generatedContent,
      };
    } catch (error) {
      strapi.log.error('AI content generation failed:', error);
      ctx.badRequest(error.message || 'Failed to generate content');
    }
  },

  async testConnection(ctx) {
    try {
      const qwenService = strapi.plugin('ai-content-generator').service('qwenService');
      const isConnected = await qwenService.testConnection();

      ctx.body = {
        success: true,
        connected: isConnected,
        message: isConnected
          ? 'Qwen API connection successful'
          : 'Qwen API connection failed. Please check your API key.',
      };
    } catch (error) {
      strapi.log.error('Connection test failed:', error);
      ctx.body = {
        success: false,
        connected: false,
        message: error.message || 'Connection test failed',
      };
    }
  },
});
