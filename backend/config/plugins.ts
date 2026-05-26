import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const plugins: Core.Config.Plugin = {
    'ai-content-generator': {
      enabled: false,
      resolve: './src/plugins/ai-content-generator',
    },
    'ckeditor': {
      enabled: true,
      resolve: './node_modules/@_sh/strapi-plugin-ckeditor',
    },
  };

  // Only configure OSS if all required credentials are provided
  const ossBucket = env('OSS_BUCKET');
  const ossAccessKeyId = env('OSS_ACCESS_KEY_ID');
  const ossAccessKeySecret = env('OSS_ACCESS_KEY_SECRET');

  console.log('[plugins.ts] OSS vars check — bucket:', !!ossBucket, 'keyId:', !!ossAccessKeyId, 'secret:', !!ossAccessKeySecret);

  if (ossBucket && ossAccessKeyId && ossAccessKeySecret) {
    plugins.upload = {
      config: {
        provider: 'strapi-provider-upload-oss',
        providerOptions: {
          accessKeyId: ossAccessKeyId,
          accessKeySecret: ossAccessKeySecret,
          region: env('OSS_REGION'),
          bucket: ossBucket,
          endpoint: env('OSS_ENDPOINT'),
          baseUrl: env('OSS_BASE_URL', undefined),
          uploadPath: env('OSS_UPLOAD_PATH', undefined),
          secure: env.bool('OSS_SECURE', true),
          timeout: env.int('OSS_TIMEOUT', 60000),
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    };
  }

  return plugins;
};

export default config;
