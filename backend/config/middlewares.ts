import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io', 'https://*.aliyuncs.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://*.aliyuncs.com'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'https://frontend-harvey8713s-projects.vercel.app',
        'https://*.vercel.app',
        'https://*.up.railway.app',
      ],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '20mb',
      formLimit: '20mb',
      formidable: {
        maxFileSize: 20 * 1024 * 1024,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  { name: 'global::uid-generate-fallback', config: {} },
];

export default config;
