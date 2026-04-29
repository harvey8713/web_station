/**
 * 向生产环境 Railway Strapi 写入种子数据：4 个分类 + 6 篇双语文章
 * 用法（PowerShell）：
 *   $env:TARGET_STRAPI_URL="https://backend-production-fafe.up.railway.app"
 *   $env:TARGET_STRAPI_TOKEN="<Railway Full Access Token>"
 *   node scripts/seed-production.js
 */

const axios = require('axios');

const TARGET_URL = (process.env.TARGET_STRAPI_URL || '').replace(/\/$/, '');
const TARGET_TOKEN = process.env.TARGET_STRAPI_TOKEN;

if (!TARGET_URL || !TARGET_TOKEN) {
  console.error('缺少环境变量: TARGET_STRAPI_URL, TARGET_STRAPI_TOKEN');
  process.exit(1);
}

const api = axios.create({
  baseURL: `${TARGET_URL}/api`,
  headers: { Authorization: `Bearer ${TARGET_TOKEN}`, 'Content-Type': 'application/json' },
  timeout: 90000,
});

async function withRetry(fn, label, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      const code = e.code || e.response?.status;
      if (i < retries && (code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ECONNABORTED' || code === 'ECONNREFUSED' || code === 503 || code === 502)) {
        console.warn(`  ${label} 重试 (${i}/${retries - 1})...`);
        await new Promise(r => setTimeout(r, 2000 * i));
      } else {
        throw e;
      }
    }
  }
}

async function warmUp() {
  console.log('正在唤醒服务...');
  for (let i = 0; i < 3; i++) {
    try {
      await api.get('/categories?pagination[pageSize]=1');
      console.log('服务已就绪\n');
      return;
    } catch {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log('服务响应缓慢，继续执行...\n');
}

async function uploadImage(imageUrl, filenameHint = 'cover.jpg') {
  if (!imageUrl) return null;
  try {
    const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 60000 });
    const buffer = Buffer.from(imgRes.data);
    const contentType = imgRes.headers['content-type'] || 'image/jpeg';
    const safeName = filenameHint.replace(/[^a-zA-Z0-9._-]/g, '-');

    const FormData = require('form-data');
    const form = new FormData();
    form.append('files', buffer, { filename: safeName, contentType });

    const uploadRes = await axios.post(`${TARGET_URL}/api/upload`, form, {
      headers: { Authorization: `Bearer ${TARGET_TOKEN}`, ...form.getHeaders() },
      timeout: 60000,
    });
    return uploadRes.data[0]?.id || null;
  } catch (e) {
    console.warn(`  图片上传失败 (${filenameHint}): ${e.message}`);
    return null;
  }
}

// ─── 数据 ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { zh: { name: '品牌策略', slug: 'brand-strategy', description: '珠宝品牌定位与传播策略' },
    en: { name: 'Brand Strategy', description: 'Jewelry brand positioning and communication' } },
  { zh: { name: '设计美学', slug: 'design-aesthetics', description: '珠宝设计语言与美学探索' },
    en: { name: 'Design Aesthetics', description: 'Jewelry design language and aesthetic exploration' } },
  { zh: { name: '材质工艺', slug: 'materials-craft', description: '宝石、金属与传统工艺研究' },
    en: { name: 'Materials & Craft', description: 'Gemstones, metals and traditional craftsmanship' } },
  { zh: { name: '文化叙事', slug: 'cultural-narrative', description: '珠宝背后的文化符号与历史脉络' },
    en: { name: 'Cultural Narrative', description: 'Cultural symbols and historical context behind jewelry' } },
];

const ARTICLES = [
  {
    slug: 'brand-identity-luxury-jewelry',
    cover_image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop',
    category: 'brand-strategy',
    zh: {
      title: '奢侈珠宝品牌的身份构建：从符号到情感',
      excerpt: '当一枚戒指不再只是金属与宝石的组合，它如何成为身份、情感与记忆的载体？本文探讨奢侈珠宝品牌如何通过视觉语言、叙事策略和仪式感设计，在消费者心智中建立不可替代的品牌位置。',
      content: `# 奢侈珠宝品牌的身份构建：从符号到情感

当一枚戒指不再只是金属与宝石的组合，它承载的是身份、情感与记忆。奢侈珠宝品牌的核心竞争力，从来不在于产品本身，而在于它所构建的符号体系。

## 符号先于产品

卡地亚的三环手镯、梵克雅宝的四叶草、蒂芙尼的蓝色礼盒——这些视觉符号在全球消费者的认知中早已超越了"珠宝"本身，成为某种生活方式与价值观的代码。

品牌建设的第一步，是确立自己的视觉符号系统。这个符号必须同时满足三个条件：**高辨识度**、**情感共鸣**、**可延展性**。高辨识度意味着在任何场合下消费者都能一眼认出；情感共鸣意味着它能触发某种集体记忆或个人情感；可延展性意味着它能在不同产品线、不同媒介上保持一致而不显僵硬。

## 叙事是品牌的灵魂

符号是骨架，叙事是血肉。世界顶级珠宝品牌都是出色的故事讲述者。宝格丽讲述罗马的永恒，将地中海文明的厚重感注入每一件作品；御木本（MIKIMOTO）讲述一个渔夫之子与珍珠的故事，将坚韧与梦想转化为品牌精神。

对于新兴珠宝品牌而言，叙事策略的关键在于**找到自己的"起源故事"**——不一定需要百年历史，但必须有真实的情感内核和清晰的价值主张。

## 仪式感设计：让购买成为事件

奢侈珠宝的购买体验本身就是产品的一部分。从进入精品店的那一刻，到打开礼盒的瞬间，每一个触点都在强化品牌叙事。蒂芙尼标志性的蓝色礼盒已经成为"惊喜"与"爱意"的代名词，无数人在社交媒体上分享打开礼盒的瞬间，品牌由此获得了远超广告投放的传播效果。

设计仪式感，就是设计消费者愿意主动传播的节点。

## 对新品牌的启示

品牌身份的构建不是一蹴而就的事，但可以从以下三个维度着手：

1. **锚定一个核心符号**，持续强化，不要频繁更换视觉系统
2. **讲述真实的品牌故事**，创始人背景、设计灵感、工艺传承都是素材
3. **打造有记忆点的消费仪式**，从包装到售后，每个触点都有机会成为传播素材

珠宝行业的品牌竞争，本质上是一场关于意义的竞争。谁能让自己的产品在消费者心中成为某种情感或价值的唯一载体，谁就赢得了这场竞争。`,
      reading_time: 8,
      featured: true,
      published_date: '2025-03-15',
    },
    en: {
      title: 'Building Brand Identity in Luxury Jewelry: From Symbol to Emotion',
      excerpt: 'When a ring transcends metal and stone to become a vessel for identity, emotion, and memory, how do luxury jewelry brands build their irreplaceable position in the consumer\'s mind?',
      content: `# Building Brand Identity in Luxury Jewelry: From Symbol to Emotion

When a ring transcends metal and stone, it becomes a vessel for identity, emotion, and memory. The core competitiveness of luxury jewelry brands has never been the product itself, but the symbolic system it constructs.

## Symbol Before Product

Cartier's Trinity bracelet, Van Cleef & Arpels' four-leaf clover, Tiffany's blue box — these visual symbols have long surpassed "jewelry" in global consumer consciousness, becoming codes for a certain lifestyle and set of values.

The first step in brand building is establishing your visual symbol system. This symbol must simultaneously meet three conditions: **high recognizability**, **emotional resonance**, and **extensibility**.

## Narrative is the Soul of the Brand

Symbols are the skeleton; narrative is the flesh. The world's top jewelry brands are all excellent storytellers. Bulgari tells the story of eternal Rome, infusing each piece with the weight of Mediterranean civilization.

For emerging jewelry brands, the key to narrative strategy is **finding your own "origin story"** — you don't necessarily need a century of history, but you must have an authentic emotional core and a clear value proposition.

## Ritual Design: Making Purchase an Event

The luxury jewelry buying experience is itself part of the product. From entering the boutique to opening the box, every touchpoint reinforces brand narrative. Tiffany's iconic blue box has become synonymous with "surprise" and "love."

## Insights for New Brands

1. **Anchor one core symbol** and consistently reinforce it
2. **Tell authentic brand stories** — founder background, design inspiration, craft heritage
3. **Create memorable consumption rituals** — every touchpoint is an opportunity

The brand competition in the jewelry industry is fundamentally a competition for meaning.`,
      reading_time: 7,
      published_date: '2025-03-15',
    },
  },
  {
    slug: 'minimalism-fine-jewelry-design',
    cover_image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop',
    category: 'design-aesthetics',
    zh: {
      title: '极简主义与当代精致珠宝：少即是多的设计哲学',
      excerpt: '在信息过载的时代，极简主义珠宝以其克制的线条和纯粹的形态，成为都市精英群体的新宠。本文解析当代极简珠宝设计的美学逻辑，以及它如何在"减法"中创造最大价值。',
      content: `# 极简主义与当代精致珠宝：少即是多的设计哲学

"少即是多"（Less is More）这句话出自建筑师密斯·凡·德·罗，却在当代珠宝设计中找到了最动人的注脚。

## 为什么极简珠宝在当下流行

当奢华炫耀性消费逐渐让位于"安静的奢华"（Quiet Luxury），极简主义珠宝迎来了它的时代。穿着一件极简设计的金项链或素银戒指，传递的信息是：**我不需要用繁复的装饰来证明自己**。

这种消费观的转变，在35岁以下的高净值人群中尤为明显。他们更倾向于选择设计语言克制、工艺精湛、可以与各种场合穿搭的珠宝单品。

## 极简设计的核心要素

**形态纯粹性**：圆形、方形、线条——极简珠宝使用最基本的几何语言，但对比例的掌控要求极高。一根金条的厚薄、一个圆环的直径，毫厘之差带来截然不同的视觉感受。

**材质说话**：当装饰性元素被压缩到最低，材质本身的质感成为设计的核心语言。18K金与9K金的色温差异、925银与铂金的光泽对比，都成为设计师可以精心调度的变量。

**负空间的价值**：好的极简珠宝设计，留白和虚空与实体同样重要。一个开口戒的开口弧度，一对耳钉与耳垂之间的空气感，都是设计师刻意经营的"无"。

## 极简不等于简单

极简主义最容易陷入的误区是"没设计感"。真正优秀的极简珠宝，往往在不显眼的地方藏着精心的设计细节：内圈的一行镌刻、扣环的独特开合方式、特定角度下才显现的渐变效果。

这些细节不是为了让人一眼看到，而是为了让长期佩戴者在某个不经意的瞬间突然发现，从而加深与珠宝的情感连接。

## 给设计师的建议

如果你正在探索极简风格，记住：极简的对立面不是繁复，而是随意。每一条线、每一个面、每一处连接，都应该是深思熟虑的结果。`,
      reading_time: 7,
      featured: false,
      published_date: '2025-04-02',
    },
    en: {
      title: 'Minimalism in Fine Jewelry: The Design Philosophy of Less Is More',
      excerpt: 'In an age of information overload, minimalist jewelry with its restrained lines and pure forms has become the new favorite of urban elites. We analyze the aesthetic logic behind contemporary minimalist jewelry design.',
      content: `# Minimalism in Fine Jewelry: The Design Philosophy of Less Is More

"Less is More" — coined by architect Mies van der Rohe — finds its most compelling expression in contemporary jewelry design.

## Why Minimalist Jewelry Thrives Now

As conspicuous consumption gives way to "Quiet Luxury," minimalist jewelry has found its moment. Wearing a simply designed gold necklace or plain silver ring communicates: **I don't need elaborate decoration to prove myself**.

This shift is particularly pronounced among high-net-worth individuals under 35, who prefer jewelry with restrained design language, exceptional craftsmanship, and versatility across occasions.

## Core Elements of Minimalist Design

**Formal Purity**: Circles, squares, lines — minimalist jewelry uses basic geometric language, but demands exceptional mastery of proportion. The thickness of a gold bar, the diameter of a ring — a millimeter's difference creates entirely different visual experiences.

**Material as Voice**: When decorative elements are minimized, the material's texture itself becomes the core design language. The color temperature difference between 18K and 9K gold, the contrast between sterling silver and platinum — all become carefully orchestrated variables.

**The Value of Negative Space**: In good minimalist jewelry design, the void is as important as the solid. The angle of an open ring's gap, the airiness between a stud and the earlobe — these are deliberately crafted "nothings."

## Minimalism Is Not Simplicity

The greatest pitfall of minimalism is "lack of design sense." Truly excellent minimalist jewelry often hides careful design details in inconspicuous places: an engraving on the inner ring, a unique clasp mechanism, a gradient effect visible only from certain angles.

These details aren't meant to be seen at first glance, but to be discovered in an unguarded moment by the long-term wearer, deepening their emotional connection to the piece.`,
      reading_time: 6,
      published_date: '2025-04-02',
    },
  },
  {
    slug: 'jade-cultural-significance-modern-design',
    cover_image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop',
    category: 'cultural-narrative',
    zh: {
      title: '玉的文化重量：从传统符号到当代珠宝叙事',
      excerpt: '玉在中国文化中承载着数千年的精神意涵——君子比德于玉、玉碎不改其白。当代珠宝设计师如何在保留这份文化厚度的同时，让玉石进入现代审美语境？',
      content: `# 玉的文化重量：从传统符号到当代珠宝叙事

"玉"字在甲骨文中的形象，是用一根绳子串起三块玉璧。这个简单的象形字背后，是中华文明对玉长达八千年的珍视与崇拜。

## 玉为何是"君子之石"

儒家将玉的自然属性与君子品格一一对应：玉的温润对应仁，坚而不折对应义，廉而有棱对应勇，内蕴光华对应智，叩之有声对应信。这套"五德"说，使玉从装饰品升华为道德的载体，从物质升华为精神。

这也是为什么在中国文化中，送玉是极具分量的礼节——它不仅是财富的表达，更是人格与祝愿的传递。

## 当代设计师面临的挑战

然而，传统玉文化与当代审美之间存在明显的张力。年轻一代对"老气横秋"的玉雕形制望而却步，但对玉石本身的温润质感和文化底蕴并不排斥。

当代玉石珠宝设计师们正在探索一条中间道路：**保留材质的文化基因，革新形制的美学语言**。

具体而言，这些探索体现在：
- 将传统纹样（云纹、凤纹、山水）以极简方式重新诠释
- 用现代金工将玉石嵌入当代珠宝结构
- 以非对称、解构化的形式挑战传统的圆满审美

## 几个值得关注的当代案例

**素白系列**：一些设计师选择最素净的白玉，配以纤细的18K金框架，让玉石的天然肌理成为设计主角，完全摒弃雕刻，回归玉石本身。

**碎玉重组**：将残缺的老玉重新切割组合，以"断裂与弥合"为叙事主题，赋予有瑕疵的材料新的意义——这与日本金继（Kintsugi）美学有异曲同工之妙。

**文字介入**：将汉字、诗句以极细的激光刻制嵌入玉面，让文学性成为设计语言，呼应玉作为文化载体的传统属性。

## 给品牌的思考

如果你的品牌希望在国际市场讲述中国玉文化的故事，最重要的是找到**普世情感的接入点**——玉所蕴含的"长久"、"温柔"、"传承"，是跨越文化边界的人类共同情感。从这里出发，再辅以视觉设计的现代化，才能让玉石珠宝真正走向世界。`,
      reading_time: 9,
      featured: true,
      published_date: '2025-02-20',
    },
    en: {
      title: 'The Cultural Weight of Jade: From Traditional Symbol to Contemporary Jewelry Narrative',
      excerpt: 'Jade has carried millennia of spiritual meaning in Chinese culture. How do contemporary jewelry designers preserve this cultural depth while bringing jade into the modern aesthetic context?',
      content: `# The Cultural Weight of Jade: From Traditional Symbol to Contemporary Jewelry Narrative

The oracle bone script character for "jade" depicts three jade discs strung on a cord — a simple pictograph behind which lies eight thousand years of reverence.

## Why Jade is the "Gentleman's Stone"

Confucian philosophy mapped jade's natural attributes to the qualities of a noble person: its warmth corresponds to benevolence, its resilience to righteousness, its sharp edges to courage, its inner luminance to wisdom, its clear ring when struck to integrity.

This "Five Virtues" framework elevated jade from decoration to moral vessel, from material to spirit. This is why gifting jade carries profound weight in Chinese culture — it expresses not just wealth, but character and blessing.

## The Challenge for Contemporary Designers

Yet tension exists between traditional jade culture and contemporary aesthetics. Younger generations are put off by the dated forms of traditional jade carving, yet they are not averse to jade's warm texture and cultural depth.

Contemporary jade jewelry designers are exploring a middle path: **preserving the material's cultural DNA while revolutionizing its aesthetic language**.

## Notable Contemporary Approaches

**Pure White Series**: Some designers choose the most unadorned white jade, set in delicate 18K gold frames, allowing the stone's natural texture to take center stage — no carving, just the jade itself.

**Broken Jade Reconstruction**: Re-cutting and recombining damaged antique jade pieces, with "fracture and healing" as the narrative theme — echoing Japanese Kintsugi aesthetics.

**Literary Intervention**: Laser-engraving Chinese characters and poetry onto jade surfaces, making literary content a design language.

## For Brands

If your brand hopes to tell the story of Chinese jade culture in international markets, the key is finding **universal emotional entry points** — the "permanence," "gentleness," and "heritage" embodied in jade are human emotions that transcend cultural boundaries.`,
      reading_time: 8,
      published_date: '2025-02-20',
    },
  },
  {
    slug: 'diamond-grading-guide-4cs',
    cover_image_url: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&auto=format&fit=crop',
    category: 'materials-craft',
    zh: {
      title: '钻石4C评级深度解析：消费者真正需要懂的那些事',
      excerpt: '切工、色级、净度、克拉——钻石4C评级体系对普通消费者而言既熟悉又陌生。哪个C最影响视觉效果？如何在预算内做出最明智的取舍？本文给出专业而实用的答案。',
      content: `# 钻石4C评级深度解析：消费者真正需要懂的那些事

4C评级体系（Cut切工、Color色级、Clarity净度、Carat克拉）由美国宝石学院（GIA）在20世纪中叶建立，至今仍是全球钻石行业的通用语言。但对于普通消费者，这套体系常常制造焦虑而非帮助决策。本文试图给出一个更实用的视角。

## 第一C：切工（Cut）——最被低估的评级项

在四个C中，切工对钻石视觉效果的影响最为直接，却最常被消费者忽视。GIA切工分级从Excellent（极优）到Poor（差），一颗切工极优的G色SI1钻石，往往比切工良好的E色VS1更闪耀动人。

**实用建议**：如果预算有限，宁可在色级和净度上做一定妥协，也要确保切工达到Excellent或Very Good级别。

## 第二C：色级（Color）——肉眼差异没你想的那么大

GIA色级从D（无色）到Z（明显黄色）。D-F为无色组，G-J为近无色组，K-M为微黄组。

关键事实：**D色和G色的区别，在镶嵌成品戒指后，普通人在正常光线下几乎无法分辨**。但价格差异可能高达30%-40%。

**实用建议**：主石选G-H色是性价比最高的区间；如果戒托是黄金，可以进一步降到I-J色，黄金会掩盖轻微的黄色调。

## 第三C：净度（Clarity）——大多数内含物肉眼不可见

GIA净度级别从FL（无瑕）到I3（重度内含）。SI1和SI2（轻微内含）级别的钻石，其内含物在10倍放大镜下可见，但肉眼通常无法察觉。

**实用建议**：1克拉以下的钻石，选SI1净度完全够用；只有在2克拉以上，净度对肉眼的影响才开始变得明显。

## 第四C：克拉（Carat）——重量陷阱

克拉是重量单位而非尺寸单位（1克拉=0.2克）。由于价格在0.5、0.75、1.0等整数节点前后有明显跳升，选择0.90ct往往比1.00ct更具价值——视觉效果几乎一样，价格却可能便宜20%以上。

## 给消费者的选购优先级

**优先级排序**：切工 > 克拉大小 > 色级 ≈ 净度

不要被证书上的每一项数据绑架。最终决策标准只有一个：**这颗钻石在你眼中是否足够美**。`,
      reading_time: 10,
      featured: false,
      published_date: '2025-01-10',
    },
    en: {
      title: 'The 4Cs of Diamond Grading: What Consumers Really Need to Know',
      excerpt: 'Cut, color, clarity, carat — the diamond 4C grading system is both familiar and mysterious to most consumers. Which C matters most for visual impact? How do you make the wisest trade-offs within budget?',
      content: `# The 4Cs of Diamond Grading: What Consumers Really Need to Know

The 4C grading system (Cut, Color, Clarity, Carat) was established by GIA in the mid-20th century and remains the universal language of the global diamond industry. But for consumers, this system often creates anxiety rather than aiding decisions.

## The First C: Cut — The Most Underestimated Grade

Among the four Cs, cut has the most direct impact on a diamond's visual appearance, yet is most commonly overlooked by consumers. GIA cut grades range from Excellent to Poor. An Excellent-cut G/SI1 diamond often outsparkles a Good-cut E/VS1.

**Practical advice**: If budget is limited, compromise on color and clarity before cut quality. Always aim for Excellent or Very Good.

## The Second C: Color — Visual Differences Are Smaller Than You Think

GIA color grades run from D (colorless) to Z (noticeably yellow). D-F are colorless; G-J are near-colorless.

Key fact: **The difference between D and G color is nearly indistinguishable to the naked eye in a set ring under normal lighting** — yet the price difference can be 30-40%.

**Practical advice**: G-H color offers the best value. If the setting is yellow gold, you can drop to I-J; the gold masks any slight warmth.

## The Third C: Clarity — Most Inclusions Are Invisible

GIA clarity grades from FL (flawless) to I3. SI1 and SI2 diamonds have inclusions visible under 10x magnification but typically invisible to the naked eye.

**Practical advice**: For diamonds under 1 carat, SI1 clarity is perfectly adequate.

## The Fourth C: Carat — The Weight Trap

Carat is a weight unit, not a size unit (1 carat = 0.2 grams). Since prices jump at round numbers (0.5, 0.75, 1.0 ct), choosing 0.90ct over 1.00ct often delivers 20%+ savings with virtually identical visual presence.

## Consumer Priority Guide

**Priority order**: Cut > Carat size > Color ≈ Clarity

Don't be held hostage by every number on the certificate. The only final criterion: **is this diamond beautiful to you?**`,
      reading_time: 9,
      published_date: '2025-01-10',
    },
  },
  {
    slug: 'social-media-jewelry-brand-building',
    cover_image_url: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&auto=format&fit=crop',
    category: 'brand-strategy',
    zh: {
      title: '社交媒体时代的珠宝品牌建设：内容策略与社群运营',
      excerpt: 'Instagram、小红书、Pinterest——视觉社交平台彻底改变了珠宝品牌的传播逻辑。本文拆解头部珠宝品牌的社交媒体内容策略，以及如何在有限预算下建立有粘性的品牌社群。',
      content: `# 社交媒体时代的珠宝品牌建设：内容策略与社群运营

珠宝行业与视觉社交媒体天然契合——美丽的物件、有温度的故事、丰富的场景延展性。但"天然契合"并不意味着"自然成功"，内容策略的差异决定了品牌在社交媒体上的命运。

## 内容分层：不同类型内容的不同使命

成功的珠宝品牌社交媒体运营，通常在内容上有清晰的分层：

**顶层：品牌形象内容（占比20%）**
高质量的大片，传递品牌美学调性。这类内容触达率不一定高，但是品牌气质的锚点。

**中层：产品场景内容（占比50%）**
真实的生活场景，展示珠宝如何融入日常。早餐桌上的手，开会时的耳环，睡前摘下项链的仪式感——这类内容最容易引发共鸣和保存。

**底层：用户共创内容（占比30%）**
鼓励消费者分享佩戴照、上手图、故事。这类内容真实可信，也是最省预算的内容来源。

## 珠宝摄影的黄金法则

在社交媒体上，图片质量直接决定用户是否停下来。珠宝摄影有几个不能忽视的要点：

- **光线是第一位的**：自然漫射光是大多数珠宝最友好的光线，避免直射硬光造成的高光溢出
- **背景服务于主体**：白色、米色、质感布料和真实皮肤是珠宝的最佳背景
- **细节即故事**：一张展示手工锉边细节的微距图，往往比整体图更能传达工艺价值

## 社群运营：从交易关系到情感连接

最强大的珠宝品牌社群，是那些让消费者觉得"这个品牌懂我"的社群。建立这种连接需要：

**回应真实问题**：有人在评论区问"这款戒指能和婚戒叠戴吗"，给出真诚详尽的回答，往往比一条精心策划的内容更有价值。

**讲述消费者的故事**：每一件珠宝背后都有一个故事——求婚、周年纪念、自我奖励。挖掘并讲述这些故事，让每一位消费者都觉得自己是品牌叙事的一部分。

**建立专属仪式**：每年的固定企划（如"告诉我们你的珠宝故事"年度话题）、会员专属内容、新品内测邀请——这些都在构建社群的专属感。`,
      reading_time: 8,
      featured: false,
      published_date: '2025-03-28',
    },
    en: {
      title: 'Building a Jewelry Brand in the Social Media Age: Content Strategy and Community',
      excerpt: 'Instagram, Pinterest, TikTok — visual social platforms have fundamentally changed jewelry brand communication. We break down the content strategies of leading jewelry brands and how to build an engaged community on a limited budget.',
      content: `# Building a Jewelry Brand in the Social Media Age: Content Strategy and Community

The jewelry industry has a natural affinity with visual social media — beautiful objects, warm stories, rich scene versatility. But "natural affinity" doesn't mean "automatic success." Content strategy determines a brand's social media fate.

## Content Layering: Different Content, Different Missions

Successful jewelry brand social media typically employs clear content layering:

**Top layer: Brand image content (20%)**
High-quality editorial images conveying brand aesthetic. Reach may not be highest, but this anchors brand identity.

**Middle layer: Product-in-life content (50%)**
Real lifestyle scenes showing how jewelry integrates into daily life. Hands at a breakfast table, earrings in a meeting, the ritual of removing a necklace before bed — this content resonates most deeply.

**Bottom layer: User-generated content (30%)**
Encouraging consumers to share wearing photos, close-ups, stories. Authentic, trustworthy, and your most budget-efficient content source.

## Golden Rules of Jewelry Photography

On social media, image quality determines whether users pause:

- **Light is paramount**: Natural diffused light is most flattering for most jewelry
- **Background serves subject**: White, cream, textured fabric, and real skin are ideal backgrounds
- **Details tell stories**: A macro shot of hand-filed edges often communicates craft value better than a full product shot

## Community Building: From Transaction to Emotional Connection

The strongest jewelry brand communities are those where consumers feel "this brand understands me":

**Respond to real questions**: Someone asking "can this ring be stacked with a wedding band?" — a genuine, detailed answer is often more valuable than a planned content piece.

**Tell consumer stories**: Every piece of jewelry has a story behind it — a proposal, an anniversary, a self-reward. Surface and tell these stories.

**Create exclusive rituals**: Annual campaigns, member-exclusive content, early access invitations — these build a sense of community belonging.`,
      reading_time: 7,
      published_date: '2025-03-28',
    },
  },
  {
    slug: 'ethical-sourcing-sustainable-jewelry',
    cover_image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&auto=format&fit=crop',
    category: 'materials-craft',
    zh: {
      title: '道德采购与可持续珠宝：当Z世代遇上供应链透明度',
      excerpt: '越来越多的年轻消费者在购买珠宝时会问：这颗宝石从哪里来？这位工匠得到了公平的报酬吗？可持续珠宝不再是小众话题，它正在重塑整个行业的价值主张。',
      content: `# 道德采购与可持续珠宝：当Z世代遇上供应链透明度

2006年，电影《血钻》让"冲突钻石"这个概念进入大众视野，引发了珠宝行业的集体反思。近20年后，这场关于道德采购的讨论早已超越钻石，延伸到整个珠宝供应链的每一个环节。

## 什么是"可持续珠宝"

可持续珠宝是一个多维度的概念，涵盖：

**环境维度**：采矿对生态的影响最小化，回收金属和再生宝石的使用，碳足迹的追踪与抵消。

**社会维度**：矿工获得公平薪酬和安全的工作环境，不使用童工，支持开采地社区的发展。

**经济维度**：供应链中每一个环节的参与者都能获得可持续的生计，而非被中间商压榨。

## Z世代消费者的购买逻辑

根据多项消费者研究，Z世代（1995-2010年出生）在高价值消费决策中，有73%的人表示品牌的社会责任表现会影响其购买决策。

但更重要的是：他们要求的不仅仅是品牌的自我声明，而是**可验证的透明度**。一个能在品牌官网追溯到具体矿山、具体工坊的故事，远比"我们承诺道德采购"这句话更有说服力。

## 实践中的挑战与机遇

**挑战**：珠宝供应链极其复杂，一颗宝石从矿山到成品可能经过十几个中间环节，完整溯源在技术上和成本上都面临挑战。

**机遇**：区块链技术正在被越来越多的珠宝品牌用于供应链追踪；Lab-grown diamonds（实验室培育钻石）提供了一个完全规避采矿问题的选项；古董珠宝和二手珠宝的市场正在快速增长，因为它代表了最彻底的"零新增开采"。

## 给品牌的行动建议

你不必一步到位，但必须真诚地开始：
1. 梳理你目前能知道的供应链信息，诚实地向消费者披露
2. 选择一个切入点深入做（比如只用回收黄金，或者从某一品类开始做认证）
3. 讲述这个过程中真实的困难和进展，不完美的诚实远好过完美的谎言

可持续珠宝不是公关噱头，它是未来十年行业竞争的底线。`,
      reading_time: 9,
      featured: true,
      published_date: '2025-04-10',
    },
    en: {
      title: 'Ethical Sourcing and Sustainable Jewelry: When Gen Z Meets Supply Chain Transparency',
      excerpt: 'More and more young consumers are asking when purchasing jewelry: where did this gemstone come from? Was this artisan fairly compensated? Sustainable jewelry is reshaping the entire industry\'s value proposition.',
      content: `# Ethical Sourcing and Sustainable Jewelry: When Gen Z Meets Supply Chain Transparency

In 2006, the film "Blood Diamond" brought "conflict diamonds" into public consciousness. Nearly 20 years later, the discussion around ethical sourcing has extended far beyond diamonds to every link in the jewelry supply chain.

## What Is "Sustainable Jewelry"

Sustainable jewelry is a multidimensional concept encompassing:

**Environmental**: Minimizing mining's ecological impact, using recycled metals and reclaimed gemstones, tracking and offsetting carbon footprints.

**Social**: Miners receiving fair wages and safe working conditions, no child labor, supporting mining community development.

**Economic**: Every participant in the supply chain able to sustain their livelihood, not exploited by intermediaries.

## Gen Z's Purchasing Logic

According to multiple consumer studies, 73% of Gen Z consumers (born 1995-2010) say a brand's social responsibility performance influences their high-value purchase decisions.

More importantly, they demand not just brand self-declaration, but **verifiable transparency**. A story traceable to a specific mine and workshop on the brand website is far more convincing than "we promise ethical sourcing."

## Practical Challenges and Opportunities

**Challenge**: Jewelry supply chains are extremely complex. A gemstone may pass through a dozen intermediaries from mine to finished product.

**Opportunity**: Blockchain is being used by more jewelry brands for supply chain tracking. Lab-grown diamonds offer an option that completely bypasses mining concerns. The antique and secondhand jewelry market is growing rapidly as it represents "zero new extraction."

## Action Recommendations for Brands

You don't need to achieve perfection immediately, but you must begin sincerely:
1. Map what you currently know about your supply chain and honestly disclose it
2. Choose one entry point and go deep (e.g., only recycled gold, or certification for one category)
3. Tell the real story of challenges and progress — imperfect honesty beats perfect lies

Sustainable jewelry is not a PR gimmick; it's the baseline for industry competition in the next decade.`,
      reading_time: 8,
      published_date: '2025-04-10',
    },
  },
];

// ─── 工具函数 ────────────────────────────────────────────────────────────────

async function fetchAll(path, params = {}) {
  const res = await withRetry(
    () => api.get(path, { params: { 'pagination[pageSize]': 100, ...params } }),
    `读取 ${path}`,
    4
  );
  return res.data.data || [];
}

async function findBySlug(endpoint, slug) {
  for (const params of [
    { locale: 'zh-CN', 'filters[slug][$eq]': slug },
    { 'filters[slug][$eq]': slug },
    { locale: 'zh-CN', 'filters[slug][$eq]': slug, status: 'draft' },
  ]) {
    const items = await fetchAll(endpoint, params);
    if (items.length) return items[0];
  }
  return null;
}

// ─── 同步逻辑 ────────────────────────────────────────────────────────────────

async function seedCategories() {
  console.log('\n--- 创建分类 ---');
  const categoryMap = new Map();

  for (const cat of CATEGORIES) {
    let existing = await findBySlug('/categories', cat.zh.slug);

    let documentId;
    if (existing) {
      documentId = existing.documentId;
      await withRetry(
        () => api.put(`/categories/${documentId}`, { data: cat.zh }, {
          params: { locale: 'zh-CN', status: 'published' },
        }),
        `更新分类 ${cat.zh.slug}`,
        4
      );
      console.log(`  更新: ${cat.zh.name}`);
    } else {
      try {
        const res = await withRetry(
          () => api.post('/categories', { data: { ...cat.zh, locale: 'zh-CN' } }, {
            params: { status: 'published' },
          }),
          `创建分类 ${cat.zh.slug}`,
          4
        );
        documentId = res.data.data.documentId;
        console.log(`  创建: ${cat.zh.name}`);
      } catch (err) {
        if (err.response?.data?.error?.message?.includes('unique')) {
          existing = await findBySlug('/categories', cat.zh.slug);
          if (!existing) throw err;
          documentId = existing.documentId;
          console.log(`  已存在: ${cat.zh.name}`);
        } else throw err;
      }
    }

    await withRetry(
      () => api.put(`/categories/${documentId}`, { data: { ...cat.en, slug: cat.zh.slug } }, {
        params: { locale: 'en', status: 'published' },
      }),
      `更新分类英文 ${cat.zh.slug}`,
      4
    );

    categoryMap.set(cat.zh.slug, documentId);
  }

  return categoryMap;
}

async function seedArticles(categoryMap) {
  console.log('\n--- 创建文章 ---');

  for (const article of ARTICLES) {
    let existing = await findBySlug('/articles', article.slug);

    const imageId = await uploadImage(article.cover_image_url, `${article.slug}.jpg`);
    if (imageId) console.log(`  图片上传成功 id=${imageId}`);

    const zhData = {
      ...article.zh,
      slug: article.slug,
      category: categoryMap.get(article.category),
      locale: 'zh-CN',
      ...(imageId && { cover_image: imageId }),
    };

    let documentId;
    if (existing) {
      documentId = existing.documentId;
      const { locale: _l, ...updateData } = zhData;
      await withRetry(
        () => api.put(`/articles/${documentId}`, { data: updateData }, {
          params: { locale: 'zh-CN', status: 'published' },
        }),
        `更新文章 ${article.slug}`,
        4
      );
      console.log(`  更新: ${article.zh.title}`);
    } else {
      try {
        const res = await withRetry(
          () => api.post('/articles', { data: zhData }, {
            params: { status: 'published' },
          }),
          `创建文章 ${article.slug}`,
          4
        );
        documentId = res.data.data.documentId;
        console.log(`  创建: ${article.zh.title}`);
      } catch (err) {
        if (err.response?.data?.error?.message?.includes('unique')) {
          existing = await findBySlug('/articles', article.slug);
          if (!existing) throw err;
          documentId = existing.documentId;
          console.log(`  已存在: ${article.zh.title}`);
        } else throw err;
      }
    }

    await withRetry(
      () => api.put(`/articles/${documentId}`, { data: { ...article.en, slug: article.slug } }, {
        params: { locale: 'en', status: 'published' },
      }),
      `更新文章英文 ${article.slug}`,
      4
    );
  }
}

async function main() {
  console.log('开始写入生产数据...');
  console.log(`目标: ${TARGET_URL}\n`);

  await warmUp();

  const categoryMap = await seedCategories();
  console.log(`\n分类完成: ${categoryMap.size} 个`);

  await seedArticles(categoryMap);
  console.log('\n✅ 全部完成');
}

main().catch((err) => {
  console.error('\n❌ 失败:', err.response?.data || err.message);
  process.exit(1);
});
