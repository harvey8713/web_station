/**
 * Seed Homepage content into Strapi from the current frontend defaults.
 * Run: node scripts/seed-homepage.js
 * Requires STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD env vars,
 * or edit them inline below for local use.
 */

const axios = require('axios');

const BASE_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL    = process.env.STRAPI_ADMIN_EMAIL    || 'harvey07@sina.com';
const PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || '0926Harvey';

async function login() {
  const res = await axios.post(`${BASE_URL}/admin/login`, { email: EMAIL, password: PASSWORD });
  return res.data.data.token;
}

async function putHomepage(token, locale, sections) {
  await axios.put(
    `${BASE_URL}/content-manager/single-types/api::homepage.homepage?locale=${locale}`,
    { data: { sections } },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✔ Homepage [${locale}] saved`);
}

async function publishHomepage(token, locale) {
  await axios.post(
    `${BASE_URL}/content-manager/single-types/api::homepage.homepage/actions/publish?locale=${locale}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✔ Homepage [${locale}] published`);
}

const ZH_SECTIONS = [
  {
    __component: 'sections.hero',
    eyebrow: '珠宝 · 品牌 · 设计',
    title_line1: 'Magician in',
    title_line2: 'Jewellery',
    subtitle: '解码珠宝设计的语言——品牌策略、创意愿景，以及那些宝石背后的故事。',
    cta_text: '探索洞察',
    cta_link: '/insights',
    layout: 'left',
  },
  {
    __component: 'sections.intro',
    label: '关于平台',
    heading_zh: '工艺与\n品牌智识的交汇',
    heading_en: 'Where craft meets\nbrand intelligence',
    body: 'Magician in Jewellery 是一个专注于珠宝设计、品牌身份与文化叙事交汇地带的编辑平台。我们研究世界上最令人信服的珠宝品牌是如何被打造出来的——而不仅仅是被佩戴。',
    link_text: '了解更多 →',
    link_url: '/about',
    layout: 'image-left',
  },
  {
    __component: 'sections.article-grid',
    title: '最新洞察',
    count: 6,
  },
  {
    __component: 'sections.contact-band',
    heading_line1: '来聊聊珠宝。',
    heading_line2: '',
    description: '欢迎洽谈合作、联合编辑，或是探讨珠宝设计的未来。',
    email: 'hello@magicianinjewellery.com',
    instagram: 'https://instagram.com/',
    wechat: '',
  },
];

const EN_SECTIONS = [
  {
    __component: 'sections.hero',
    eyebrow: 'Jewellery · Brand · Design',
    title_line1: 'Magician in',
    title_line2: 'Jewellery',
    subtitle: 'Decoding the language of jewellery design — brand strategy, creative vision, and the stories behind the stones.',
    cta_text: 'Explore Insights',
    cta_link: '/insights',
    layout: 'left',
  },
  {
    __component: 'sections.intro',
    label: 'About the Platform',
    heading_zh: '工艺与\n品牌智识的交汇',
    heading_en: 'Where craft meets\nbrand intelligence',
    body: 'Magician in Jewellery is an editorial platform dedicated to the intersection of jewellery design, brand identity, and cultural storytelling. We examine how the world\'s most compelling jewellery brands are built — not just worn.',
    link_text: 'Read More →',
    link_url: '/about',
    layout: 'image-left',
  },
  {
    __component: 'sections.article-grid',
    title: 'Latest Insights',
    count: 6,
  },
  {
    __component: 'sections.contact-band',
    heading_line1: 'Let\'s talk about jewellery.',
    heading_line2: '',
    description: 'For collaborations, editorial partnerships, or simply a conversation about the future of jewellery design.',
    email: 'hello@magicianinjewellery.com',
    instagram: 'https://instagram.com/',
    wechat: '',
  },
];

async function run() {
  console.log(`Connecting to ${BASE_URL}...`);
  const token = await login();
  console.log('✔ Logged in');

  await putHomepage(token, 'zh', ZH_SECTIONS);
  await publishHomepage(token, 'zh');

  await putHomepage(token, 'en', EN_SECTIONS);
  await publishHomepage(token, 'en');

  console.log('\n✅ Done — open Content Manager → Homepage to review and edit.');
}

run().catch((err) => {
  console.error('❌', err.response?.data || err.message);
  process.exit(1);
});
