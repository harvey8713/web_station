import type { StrapiApp } from '@strapi/strapi/admin';
import { Magic, Information } from '@strapi/icons';
import { TranslatePanel } from './components/TranslatePanel';

export default {
  config: {
    locales: ['zh-Hans'],
    translations: {
      en: {
        'app.components.LeftMenu.navbrand.title': 'MiJ Admin',
        'app.components.LeftMenu.navbrand.workplace': '内容管理后台',
      },
      'zh-Hans': {
        'app.components.LeftMenu.navbrand.title': 'MiJ Admin',
        'app.components.LeftMenu.navbrand.workplace': '内容管理后台',
      },
    },
  },

  bootstrap(app: StrapiApp) {
    (app as any).addMenuLink({
      to: '/quick-guide',
      icon: Information,
      intlLabel: {
        id: 'quick-guide.nav.label',
        defaultMessage: '快速上手指南',
      },
      Component: async () => import('./pages/QuickGuidePage'),
      permissions: [],
    });

    (app as any).addMenuLink({
      to: '/ai-generate',
      icon: Magic,
      intlLabel: {
        id: 'ai-generate.nav.label',
        defaultMessage: 'AI 生成文章',
      },
      Component: async () => import('./pages/AIGeneratePage'),
      permissions: [],
    });

    // Register translate panel in article edit view sidebar
    app.getPlugin('content-manager').apis.addEditViewSidePanel((panels: any[]) => [
      ...panels,
      TranslatePanel,
    ]);
  },
};
