export default [
  {
    method: 'POST',
    path: '/generate',
    handler: 'aiController.generate',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/test-connection',
    handler: 'aiController.testConnection',
    config: {
      policies: [],
      auth: false,
    },
  },
];
