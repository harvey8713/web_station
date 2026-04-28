import server from './server';

export default {
  register({ strapi }) {
    // Register plugin services, controllers, routes, etc.
    if (server.services) {
      Object.entries(server.services).forEach(([name, service]) => {
        strapi.plugin('ai-content-generator').service(name, service);
      });
    }

    if (server.controllers) {
      Object.entries(server.controllers).forEach(([name, controller]) => {
        strapi.plugin('ai-content-generator').controller(name, controller);
      });
    }

    if (server.routes) {
      strapi.plugin('ai-content-generator').routes(server.routes);
    }
  },

  bootstrap({ strapi }) {
    // Bootstrap plugin
    strapi.log.info('AI Content Generator plugin loaded');
  },

  destroy({ strapi }) {
    // Cleanup
  },
};
