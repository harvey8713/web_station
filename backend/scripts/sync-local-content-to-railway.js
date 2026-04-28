const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createStrapi } = require('@strapi/strapi');

const SOURCE_STRAPI_URL = process.env.SOURCE_STRAPI_URL;
const SOURCE_STRAPI_TOKEN = process.env.SOURCE_STRAPI_TOKEN;

if (!SOURCE_STRAPI_URL || !SOURCE_STRAPI_TOKEN) {
  throw new Error('缺少 SOURCE_STRAPI_URL / SOURCE_STRAPI_TOKEN');
}

function createSourceApi() {
  return axios.create({
    baseURL: `${SOURCE_STRAPI_URL.replace(/\/$/, '')}/api`,
    headers: {
      Authorization: `Bearer ${SOURCE_STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
}

const sourceApi = createSourceApi();

async function fetchAll(pathname, params = {}) {
  const response = await sourceApi.get(pathname, {
    params: {
      'pagination[page]': 1,
      'pagination[pageSize]': 100,
      ...params,
    },
  });
  return response.data.data || [];
}

async function fetchOne(pathname, params = {}) {
  const response = await sourceApi.get(pathname, { params });
  return response.data.data || null;
}

async function uploadRemoteImageToTarget(strapi, url, filenameHint = 'image.jpg') {
  if (!url) return null;

  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  const safeName = filenameHint.replace(/[^a-zA-Z0-9._-]/g, '-');
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sync-upload-'));
  const tmpPath = path.join(tmpDir, safeName);
  await fs.promises.writeFile(tmpPath, response.data);

  const stats = await fs.promises.stat(tmpPath);
  const file = {
    filepath: tmpPath,
    originalFilename: safeName,
    mimetype: response.headers['content-type'] || 'image/jpeg',
    size: stats.size,
  };

  try {
    const uploaded = await strapi.plugin('upload').service('upload').upload({
      data: {},
      files: file,
    });
    return uploaded[0]?.id || null;
  } finally {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  }
}

async function upsertCategories(strapi) {
  const zhCategories = await fetchAll('/categories', { locale: 'zh' });
  const enCategories = await fetchAll('/categories', { locale: 'en' });
  const enBySlug = new Map(enCategories.map((item) => [item.slug, item]));
  const targetCategoryIds = new Map();
  const categoryService = strapi.documents('api::category.category');

  for (const category of zhCategories) {
    const existing = await categoryService.findMany({
      locale: 'zh',
      filters: { slug: { $eq: category.slug } },
    });

    let documentId;
    if (existing.length > 0) {
      documentId = existing[0].documentId;
      await categoryService.update({
        documentId,
        locale: 'zh',
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
      });
    } else {
      const created = await categoryService.create({
        locale: 'zh',
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
      });
      documentId = created.documentId;
    }

    const enCategory = enBySlug.get(category.slug);
    if (enCategory) {
      await categoryService.update({
        documentId,
        locale: 'en',
        data: {
          name: enCategory.name,
          description: enCategory.description,
        },
      });
    }

    targetCategoryIds.set(category.slug, documentId);
  }

  return targetCategoryIds;
}

async function upsertArticles(strapi, categoryMap) {
  const zhArticles = await fetchAll('/articles', { locale: 'zh', populate: '*' });
  const enArticles = await fetchAll('/articles', { locale: 'en', populate: '*' });
  const enBySlug = new Map(enArticles.map((item) => [item.slug, item]));
  const articleService = strapi.documents('api::article.article');

  for (const article of zhArticles) {
    const existing = await articleService.findMany({
      locale: 'zh',
      filters: { slug: { $eq: article.slug } },
      populate: ['category', 'cover_image'],
    });

    const remoteImageUrl = article.cover_image?.url
      ? article.cover_image.url.startsWith('http')
        ? article.cover_image.url
        : `${SOURCE_STRAPI_URL.replace(/\/$/, '')}${article.cover_image.url}`
      : null;

    const imageId = await uploadRemoteImageToTarget(strapi, remoteImageUrl, `${article.slug}.jpg`);

    const zhPayload = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      reading_time: article.reading_time,
      featured: article.featured,
      published_date: article.published_date,
      ...(categoryMap.get(article.category?.slug) && { category: categoryMap.get(article.category.slug) }),
      ...(imageId && { cover_image: imageId }),
    };

    let documentId;
    if (existing.length > 0) {
      documentId = existing[0].documentId;
      await articleService.update({
        documentId,
        locale: 'zh',
        status: 'published',
        data: zhPayload,
      });
    } else {
      const created = await articleService.create({
        locale: 'zh',
        status: 'published',
        data: zhPayload,
      });
      documentId = created.documentId;
    }

    const enArticle = enBySlug.get(article.slug);
    if (enArticle) {
      await articleService.update({
        documentId,
        locale: 'en',
        status: 'published',
        data: {
          title: enArticle.title,
          excerpt: enArticle.excerpt,
          content: enArticle.content,
          reading_time: enArticle.reading_time,
          published_date: enArticle.published_date,
        },
      });
    }
  }
}

async function upsertHomepage(strapi, locale) {
  const homepage = await fetchOne('/homepage', { locale, populate: 'sections' });
  if (!homepage) return;

  const homepageService = strapi.documents('api::homepage.homepage');
  const existing = await homepageService.findMany({ locale });

  if (existing.length > 0) {
    await homepageService.update({
      documentId: existing[0].documentId,
      locale,
      status: 'published',
      data: {
        sections: homepage.sections || [],
      },
    });
  } else {
    await homepageService.create({
      locale,
      status: 'published',
      data: {
        sections: homepage.sections || [],
      },
    });
  }
}

async function main() {
  const strapi = createStrapi();

  try {
    await strapi.load();

    console.log('开始同步本地内容到 Railway 数据库...');
    const categoryMap = await upsertCategories(strapi);
    console.log(`分类同步完成: ${categoryMap.size}`);
    await upsertArticles(strapi, categoryMap);
    console.log('文章同步完成');
    await upsertHomepage(strapi, 'zh');
    await upsertHomepage(strapi, 'en');
    console.log('首页同步完成');
    console.log('全部同步完成');
  } finally {
    await strapi.destroy();
  }
}

main().catch((error) => {
  console.error(error.response?.data || error.message || error);
  process.exit(1);
});
