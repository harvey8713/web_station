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
  ],
};
