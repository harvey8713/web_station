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
  ],
};
