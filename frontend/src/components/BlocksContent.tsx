import type { ReactNode } from 'react';
import { getImageUrl } from '@/lib/api';

type TextNode = {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type InlineNode = TextNode;

type Block =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'divider'; children: InlineNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: { type: 'list-item'; children: InlineNode[] }[] }
  | { type: 'image'; image: { url: string; alternativeText?: string; width?: number; height?: number }; children: InlineNode[] }
  | { type: 'code'; language?: string; children: InlineNode[] };

function RenderInline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type !== 'text') return null;
        let content: ReactNode = node.text;
        if (node.bold) content = <strong key={i}>{content}</strong>;
        else if (node.italic) content = <em key={i}>{content}</em>;
        else if (node.underline) content = <u key={i}>{content}</u>;
        else if (node.strikethrough) content = <s key={i}>{content}</s>;
        else if (node.code) content = <code key={i} className="bg-[rgba(0,0,0,0.06)] px-1.5 py-0.5 rounded text-[0.9em] font-mono">{content}</code>;
        else content = <span key={i}>{content}</span>;
        return content;
      })}
    </>
  );
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p><RenderInline nodes={block.children} /></p>;

    case 'heading': {
      const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <Tag><RenderInline nodes={block.children} /></Tag>;
    }

    case 'quote':
      return (
        <blockquote>
          <p><RenderInline nodes={block.children} /></p>
        </blockquote>
      );

    case 'divider':
      return <hr />;

    case 'list': {
      const Tag = block.format === 'ordered' ? 'ol' : 'ul';
      return (
        <Tag>
          {block.children.map((item, i) => (
            <li key={i}><RenderInline nodes={item.children} /></li>
          ))}
        </Tag>
      );
    }

    case 'image': {
      const src = getImageUrl(block.image?.url);
      const alt = block.image?.alternativeText || '';
      const caption = block.children?.[0]?.text;
      return (
        <figure>
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'multiply' }}
          />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }

    case 'code':
      return (
        <pre className="bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.08)] rounded p-4 overflow-x-auto my-6">
          <code className="font-mono text-sm"><RenderInline nodes={block.children} /></code>
        </pre>
      );

    default:
      return null;
  }
}

export default function BlocksContent({ blocks }: { blocks: any[] }) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;
  return (
    <div className="article-content">
      {blocks.map((block, i) => (
        <RenderBlock key={i} block={block as Block} />
      ))}
    </div>
  );
}
