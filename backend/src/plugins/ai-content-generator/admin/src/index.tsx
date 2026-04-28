import { prefixPluginTranslations } from '@strapi/strapi/admin';

export default {
  register(app: any) {
    app.registerPlugin({
      id: 'ai-content-generator',
      name: 'AI Content Generator',
    });
  },

  bootstrap(app: any) {
    // 注入到Article编辑页面
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'ai-content-generator',
      Component: async () => {
        const component = await import('./components/InjectedAIGenerator');
        return component;
      },
    });
  },

  async registerTrads(app: any) {
    const { locales } = app;

    const importedTrads = await Promise.all(
      (locales as string[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, 'ai-content-generator'),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
