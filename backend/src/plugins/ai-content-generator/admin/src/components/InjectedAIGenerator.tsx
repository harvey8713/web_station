import React from 'react';
import { useCMEditViewDataManager } from '@strapi/strapi/admin';
import AIContentGenerator from './AIContentGenerator';

const InjectedAIGenerator = () => {
  const { modifiedData, onChange, layout } = useCMEditViewDataManager();

  // 只在Article内容类型中显示
  if (layout?.uid !== 'api::article.article') {
    return null;
  }

  const handleContentGenerated = (content: {
    title: string;
    excerpt: string;
    content: string;
    readingTime: number;
  }) => {
    // 更新表单数据
    onChange({
      target: {
        name: 'title',
        value: content.title,
        type: 'string',
      },
    });

    onChange({
      target: {
        name: 'excerpt',
        value: content.excerpt,
        type: 'text',
      },
    });

    onChange({
      target: {
        name: 'content',
        value: content.content,
        type: 'richtext',
      },
    });

    onChange({
      target: {
        name: 'reading_time',
        value: content.readingTime,
        type: 'integer',
      },
    });
  };

  return <AIContentGenerator onContentGenerated={handleContentGenerated} />;
};

export default InjectedAIGenerator;
