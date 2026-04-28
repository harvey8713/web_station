const axios = require('axios');

const SOURCE_URL = (process.env.SOURCE_STRAPI_URL || '').replace(/\/$/, '');
const SOURCE_TOKEN = process.env.SOURCE_STRAPI_TOKEN;
const TARGET_URL = (process.env.TARGET_STRAPI_URL || '').replace(/\/$/, '');
const TARGET_TOKEN = process.env.TARGET_STRAPI_TOKEN;

if (!SOURCE_URL || !SOURCE_TOKEN || !TARGET_URL || !TARGET_TOKEN) {
  console.error('缺少环境变量: SOURCE_STRAPI_URL, SOURCE_STRAPI_TOKEN, TARGET_STRAPI_URL, TARGET_STRAPI_TOKEN');
  process.exit(1);
}

const sourceApi = axios.create({
  baseURL: `${SOURCE_URL}/api`,
  headers: { Authorization: `Bearer ${SOURCE_TOKEN}` },
  timeout: 30000,
});

const targetApi = axios.create({
  baseURL: `${TARGET_URL}/api`,
  headers: { Authorization: `Bearer ${TARGET_TOKEN}` },
  timeout: 60000,
});

async function fetchAll(api, path, params = {}) {
  const res = await api.get(path, {
    params: { 'pagination[pageSize]': 100, 'pagination[page]': 1, ...params },
  });
  return res.data.data || [];
}

async function fetchOne(api, path, params = {}) {
  const res = await api.get(path, { params });
  return res.data.data || null;
}

async function uploadImage(sourceImageUrl, filenameHint = 'image.jpg') {
  if (!sourceImageUrl) return null;
  const fullUrl = sourceImageUrl.startsWith('http')
    ? sourceImageUrl
    : `${SOURCE_URL}${sourceImageUrl}`;

  try {
    const imgRes = await axios.get(fullUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const buffer = Buffer.from(imgRes.data);
    const contentType = imgRes.headers['content-type'] || 'image/jpeg';
    const safeName = filenameHint.replace(/[^a-zA-Z0-9._-]/g, '-');

    const formData = new FormData();
    formData.append('files', new Blob([buffer], { type: contentType }), safeName);

    const uploadRes = await fetch(`${TARGET_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TARGET_TOKEN}` },
      body: formData,
    });
    const data = await uploadRes.json();
    return data[0]?.id || null;
  } catch (e) {
    console.warn(`  图片上传失败 (${filenameHint}): ${e.message}`);
    return null;
  }
}

async function syncCategories() {
  console.log('\n--- 同步分类 ---');
  const zhCats = await fetchAll(sourceApi, '/categories', { locale: 'zh' });
  const enCats = await fetchAll(sourceApi, '/categories', { locale: 'en' });
  const enBySlug = new Map(enCats.map((c) => [c.slug, c]));

  const existingZh = await fetchAll(targetApi, '/categories', { locale: 'zh' });
  const existingBySlug = new Map(existingZh.map((c) => [c.slug, c.documentId]));

  const categoryMap = new Map();

  for (const cat of zhCats) {
    let documentId = existingBySlug.get(cat.slug);

    if (documentId) {
      await targetApi.put(
        `/categories/${documentId}`,
        { data: { name: cat.name, slug: cat.slug, description: cat.description } },
        { params: { locale: 'zh', status: 'published' } }
      );
    } else {
      const res = await targetApi.post(
        '/categories',
        { data: { name: cat.name, slug: cat.slug, description: cat.description, locale: 'zh' } },
        { params: { status: 'published' } }
      );
      documentId = res.data.data.documentId;
    }

    const enCat = enBySlug.get(cat.slug);
    if (enCat && documentId) {
      await targetApi.put(
        `/categories/${documentId}`,
        { data: { name: enCat.name, description: enCat.description } },
        { params: { locale: 'en', status: 'published' } }
      );
    }

    categoryMap.set(cat.slug, documentId);
    console.log(`  ✓ ${cat.name} (${cat.slug})`);
  }

  return categoryMap;
}

async function syncArticles(categoryMap) {
  console.log('\n--- 同步文章 ---');
  const zhArticles = await fetchAll(sourceApi, '/articles', { locale: 'zh', populate: '*' });
  const enArticles = await fetchAll(sourceApi, '/articles', { locale: 'en', populate: '*' });
  const enBySlug = new Map(enArticles.map((a) => [a.slug, a]));

  const existingZh = await fetchAll(targetApi, '/articles', { locale: 'zh' });
  const existingBySlug = new Map(existingZh.map((a) => [a.slug, a.documentId]));

  for (const article of zhArticles) {
    let documentId = existingBySlug.get(article.slug);

    const imageId = await uploadImage(
      article.cover_image?.url || null,
      `${article.slug}.jpg`
    );

    const zhPayload = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      reading_time: article.reading_time,
      featured: article.featured,
      published_date: article.published_date,
      ...(categoryMap.get(article.category?.slug) && {
        category: categoryMap.get(article.category.slug),
      }),
      ...(imageId && { cover_image: imageId }),
    };

    if (documentId) {
      await targetApi.put(`/articles/${documentId}`, { data: zhPayload }, {
        params: { locale: 'zh', status: 'published' },
      });
    } else {
      const res = await targetApi.post(
        '/articles',
        { data: { ...zhPayload, locale: 'zh' } },
        { params: { status: 'published' } }
      );
      documentId = res.data.data.documentId;
    }

    const enArticle = enBySlug.get(article.slug);
    if (enArticle && documentId) {
      await targetApi.put(
        `/articles/${documentId}`,
        {
          data: {
            title: enArticle.title,
            excerpt: enArticle.excerpt,
            content: enArticle.content,
            reading_time: enArticle.reading_time,
            published_date: enArticle.published_date,
          },
        },
        { params: { locale: 'en', status: 'published' } }
      );
    }

    console.log(`  ✓ ${article.title}`);
  }
}

async function syncHomepage() {
  console.log('\n--- 同步首页 ---');
  for (const locale of ['zh', 'en']) {
    const homepage = await fetchOne(sourceApi, '/homepage', {
      locale,
      populate: 'sections',
    });
    if (!homepage) {
      console.log(`  跳过 ${locale} (无数据)`);
      continue;
    }

    try {
      await targetApi.put(
        '/homepage',
        { data: { sections: homepage.sections || [] } },
        { params: { locale, status: 'published' } }
      );
      console.log(`  ✓ ${locale}`);
    } catch {
      await targetApi.post(
        '/homepage',
        { data: { sections: homepage.sections || [], locale } },
        { params: { status: 'published' } }
      );
      console.log(`  ✓ ${locale} (新建)`);
    }
  }
}

async function main() {
  console.log('开始同步...');
  console.log(`源:   ${SOURCE_URL}`);
  console.log(`目标: ${TARGET_URL}`);

  const categoryMap = await syncCategories();
  console.log(`分类完成: ${categoryMap.size} 条`);

  await syncArticles(categoryMap);
  console.log('文章完成');

  await syncHomepage();
  console.log('\n✅ 全部同步完成');
}

main().catch((err) => {
  console.error('\n❌ 同步失败:', err.response?.data || err.message);
  process.exit(1);
});
