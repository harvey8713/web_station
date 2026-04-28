import React, { useState } from 'react';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Typography } from '@strapi/design-system/Typography';
import { TextInput } from '@strapi/design-system/TextInput';
import { Textarea } from '@strapi/design-system/Textarea';
import { Stack } from '@strapi/design-system/Stack';
import { Alert } from '@strapi/design-system/Alert';
import { Loader } from '@strapi/design-system/Loader';
import { useFetchClient } from '@strapi/strapi/admin';
import Magic from '@strapi/icons/Magic';

interface AIContentGeneratorProps {
  onContentGenerated: (content: {
    title: string;
    excerpt: string;
    content: string;
    readingTime: number;
  }) => void;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ onContentGenerated }) => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { post } = useFetchClient();

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('请输入文章描述');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await post('/ai-content-generator/generate', {
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      if (response.data?.success && response.data?.data) {
        onContentGenerated(response.data.data);
        setSuccess(true);
        setDescription('');
        setImageUrl('');

        // 3秒后清除成功提示
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('生成内容失败');
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      setError(err.response?.data?.error?.message || err.message || '生成内容时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      background="neutral0"
      hasRadius
      shadow="filterShadow"
      padding={6}
      style={{ marginBottom: '24px' }}
    >
      <Stack spacing={4}>
        <Box>
          <Typography variant="beta" as="h2">
            AI 内容生成
          </Typography>
          <Typography variant="pi" textColor="neutral600" style={{ marginTop: '8px' }}>
            使用通义千问AI生成符合品牌调性的文章内容
          </Typography>
        </Box>

        {error && (
          <Alert closeLabel="关闭" variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert closeLabel="关闭" variant="success" onClose={() => setSuccess(false)}>
            内容生成成功！已自动填充到表单中。
          </Alert>
        )}

        <TextInput
          label="图片URL（可选）"
          placeholder="输入参考图片的URL"
          value={imageUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
          disabled={loading}
        />

        <Textarea
          label="文章描述"
          placeholder="请简要描述文章主题、关键信息或创作方向...&#10;例如：介绍一款极简风格的钻石戒指，强调其建筑感的线条设计和艺术性"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          disabled={loading}
          style={{ minHeight: '120px' }}
        />

        <Box>
          <Button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            startIcon={loading ? <Loader small /> : <Magic />}
            size="L"
            variant="default"
            fullWidth
          >
            {loading ? '正在生成内容...' : '生成文章内容'}
          </Button>
        </Box>

        <Box
          padding={3}
          background="neutral100"
          hasRadius
          style={{ fontSize: '12px', color: '#666' }}
        >
          <Typography variant="pi" textColor="neutral600">
            <strong>品牌调性：</strong>极简黑白风格 · 建筑美学 · 艺术性表达
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default AIContentGenerator;
