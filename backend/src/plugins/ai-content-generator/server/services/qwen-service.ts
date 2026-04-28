import axios from 'axios';

interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface QwenResponse {
  output: {
    text: string;
    finish_reason: string;
  };
  usage: {
    total_tokens: number;
  };
}

interface GenerateContentParams {
  imageUrl?: string;
  description: string;
  brandTone?: string;
}

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  readingTime: number;
}

export default ({ strapi }) => ({
  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    const { imageUrl, description, brandTone } = params;

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      throw new Error('QWEN_API_KEY is not configured in environment variables');
    }

    // 构建品牌调性提示词
    const brandPrompt = brandTone || `
你是一位专业的珠宝品牌内容创作者，擅长以极简、建筑美学和艺术性的风格撰写文章。

品牌调性要求：
- 极简黑白风格：语言简洁有力，避免冗余修饰
- 建筑美学：注重结构感、线条感、空间感的表达
- 艺术性：融入艺术鉴赏视角，提升内容格调
- 高端定位：体现品质感和专业性

写作风格：
- 使用短句和段落，保持视觉呼吸感
- 善用留白和节奏控制
- 注重细节描写但不过度堆砌
- 融入哲学思考和美学观点
`;

    // 构建提示词
    let userPrompt = `${description}\n\n`;

    if (imageUrl) {
      userPrompt += `参考图片：${imageUrl}\n\n`;
    }

    userPrompt += `
请基于以上信息，创作一篇符合品牌调性的文章。

输出要求（严格按照以下JSON格式）：
{
  "title": "文章标题（简洁有力，10-20字）",
  "excerpt": "文章摘要（精炼概括，50-100字）",
  "content": "文章正文（Markdown格式，800-1500字，包含适当的标题、段落、引用等）"
}

注意：
1. 正文使用Markdown格式，包含## 二级标题、段落、> 引用等
2. 保持极简风格，避免过度修饰
3. 融入建筑美学和艺术性表达
4. 内容要有深度和思考性
`;

    const messages: QwenMessage[] = [
      {
        role: 'system',
        content: brandPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    try {
      // 调用通义千问API
      const response = await axios.post<QwenResponse>(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          model: 'qwen-plus',
          input: {
            messages,
          },
          parameters: {
            temperature: 0.7,
            top_p: 0.8,
            max_tokens: 2000,
            result_format: 'message',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60秒超时
        }
      );

      const generatedText = response.data.output.text;

      // 解析JSON响应
      let parsedContent;
      try {
        // 尝试提取JSON（可能包含在markdown代码块中）
        const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                         generatedText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          parsedContent = JSON.parse(jsonStr);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        strapi.log.error('Failed to parse AI response:', parseError);
        throw new Error('Failed to parse AI generated content');
      }

      // 计算阅读时间（中文按每分钟300字计算）
      const contentLength = parsedContent.content.replace(/[#*>\-\s]/g, '').length;
      const readingTime = Math.ceil(contentLength / 300);

      return {
        title: parsedContent.title || '未命名文章',
        excerpt: parsedContent.excerpt || '',
        content: parsedContent.content || '',
        readingTime: readingTime > 0 ? readingTime : 1,
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        strapi.log.error('Qwen API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 401) {
          throw new Error('Invalid Qwen API key');
        } else if (error.response?.status === 429) {
          throw new Error('Qwen API rate limit exceeded');
        } else {
          throw new Error(`Qwen API error: ${error.message}`);
        }
      }

      throw error;
    }
  },

  async testConnection(): Promise<boolean> {
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      return false;
    }

    try {
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          model: 'qwen-plus',
          input: {
            messages: [
              {
                role: 'user',
                content: 'Hello',
              },
            ],
          },
          parameters: {
            max_tokens: 10,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.status === 200;
    } catch (error) {
      strapi.log.error('Qwen API connection test failed:', error);
      return false;
    }
  },
});
