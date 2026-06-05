export default {
  routes: [
    {
      method: 'POST',
      path: '/ai-generate',
      handler: 'ai-generate.generate',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/ai-translate',
      handler: 'ai-generate.translate',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/ai-format',
      handler: 'ai-generate.format',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/agent-upload-image',
      handler: 'ai-generate.agentUploadImage',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/agent-upload',
      handler: 'ai-generate.agentUpload',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
