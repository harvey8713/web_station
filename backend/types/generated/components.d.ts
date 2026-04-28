import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsArticleGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_article_grids';
  info: {
    displayName: 'Article Grid \u6587\u7AE0\u7F51\u683C';
    icon: 'apps';
  };
  attributes: {
    article_count: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<3>;
    layout: Schema.Attribute.Enumeration<['3-col', '2-col', 'list']> &
      Schema.Attribute.DefaultTo<'3-col'>;
    padding_bottom: Schema.Attribute.Integer;
    padding_top: Schema.Attribute.Integer;
    title_highlight: Schema.Attribute.String;
    title_prefix: Schema.Attribute.String;
    view_all_text: Schema.Attribute.String;
  };
}

export interface SectionsBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_banners';
  info: {
    displayName: 'Banner \u6A2A\u5E45';
    icon: 'picture';
  };
  attributes: {
    background_image_url: Schema.Attribute.String;
    cta_link: Schema.Attribute.String;
    cta_text: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['left', 'centered']> &
      Schema.Attribute.DefaultTo<'centered'>;
    min_height: Schema.Attribute.Integer;
    overlay_opacity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 80;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<40>;
    padding_bottom: Schema.Attribute.Integer;
    padding_top: Schema.Attribute.Integer;
    subtitle: Schema.Attribute.String;
  };
}

export interface SectionsContactBand extends Struct.ComponentSchema {
  collectionName: 'components_sections_contact_bands';
  info: {
    displayName: 'Contact Band \u8054\u7CFB\u533A';
    icon: 'phone';
  };
  attributes: {
    description: Schema.Attribute.Text;
    email: Schema.Attribute.String;
    heading_line1: Schema.Attribute.String;
    heading_line2: Schema.Attribute.String;
    instagram: Schema.Attribute.String;
    padding_bottom: Schema.Attribute.Integer;
    padding_top: Schema.Attribute.Integer;
    wechat: Schema.Attribute.String;
  };
}

export interface SectionsFeaturedArticle extends Struct.ComponentSchema {
  collectionName: 'components_sections_featured_articles';
  info: {
    displayName: 'Featured Article \u7CBE\u9009\u6587\u7AE0';
    icon: 'star';
  };
  attributes: {
    label: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['image-left', 'image-right']> &
      Schema.Attribute.DefaultTo<'image-left'>;
    padding_bottom: Schema.Attribute.Integer;
    padding_top: Schema.Attribute.Integer;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero \u5927\u6807\u9898';
    icon: 'dashboard';
  };
  attributes: {
    cta_link: Schema.Attribute.String;
    cta_text: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['left', 'centered']> &
      Schema.Attribute.DefaultTo<'left'>;
    padding_bottom: Schema.Attribute.Integer;
    padding_top: Schema.Attribute.Integer;
    subtitle: Schema.Attribute.String;
    title_line1: Schema.Attribute.String;
    title_line2: Schema.Attribute.String;
  };
}

export interface SectionsIntro extends Struct.ComponentSchema {
  collectionName: 'components_sections_intros';
  info: {
    displayName: 'Intro \u56FE\u6587\u4ECB\u7ECD';
    icon: 'layout';
  };
  attributes: {
    background_image_url: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    heading_en: Schema.Attribute.String;
    heading_zh: Schema.Attribute.String;
    label: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<
      ['image-left', 'image-right', 'text-only', 'text-centered']
    > &
      Schema.Attribute.DefaultTo<'image-left'>;
    link_text: Schema.Attribute.String;
    link_url: Schema.Attribute.String;
    min_height: Schema.Attribute.Integer;
    padding_bottom: Schema.Attribute.Integer;
    padding_top: Schema.Attribute.Integer;
  };
}

export interface SectionsQuote extends Struct.ComponentSchema {
  collectionName: 'components_sections_quotes';
  info: {
    displayName: 'Quote \u5F15\u8A00';
    icon: 'quote';
  };
  attributes: {
    attribution: Schema.Attribute.String;
    layout: Schema.Attribute.Enumeration<['dark', 'light', 'gold']> &
      Schema.Attribute.DefaultTo<'light'>;
    padding_bottom: Schema.Attribute.Integer;
    padding_top: Schema.Attribute.Integer;
    quote: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.article-grid': SectionsArticleGrid;
      'sections.banner': SectionsBanner;
      'sections.contact-band': SectionsContactBand;
      'sections.featured-article': SectionsFeaturedArticle;
      'sections.hero': SectionsHero;
      'sections.intro': SectionsIntro;
      'sections.quote': SectionsQuote;
    }
  }
}
