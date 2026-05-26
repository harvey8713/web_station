import type { Core } from '@strapi/strapi';
import sharp from 'sharp';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const provider = (strapi as any).plugin('upload').provider;
    const originalUpload = provider.upload.bind(provider);

    provider.upload = async (file: any) => {
      if (file.buffer && file.mime) {
        try {
          let compressed: Buffer | null = null;

          if (file.mime === 'image/jpeg' || file.mime === 'image/jpg') {
            compressed = await sharp(file.buffer)
              .jpeg({ quality: 82, progressive: true })
              .toBuffer();
          } else if (file.mime === 'image/webp') {
            compressed = await sharp(file.buffer)
              .webp({ quality: 82 })
              .toBuffer();
          } else if (file.mime === 'image/png') {
            compressed = await sharp(file.buffer)
              .png({ compressionLevel: 8, adaptiveFiltering: true })
              .toBuffer();
          }

          if (compressed && compressed.length < file.buffer.length) {
            const before = Math.round(file.buffer.length / 1024);
            const after = Math.round(compressed.length / 1024);
            (strapi as any).log.info(`[upload] ${file.name}: ${before}KB → ${after}KB`);
            file.buffer = compressed;
            file.size = after;
          }
        } catch (e: any) {
          (strapi as any).log.warn('[upload] Compression failed, uploading original:', e.message);
        }
      }
      return originalUpload(file);
    };
  },
};
