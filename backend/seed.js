/**
 * Strapi 内容种子脚本
 * 运行: node seed.js
 */

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN = 'a8b324a59e7e8a5f01ecb55daff6559cadcd2372da511a9685b299dd441ed8283216b2c03ee4ae842b0a296314e1a66ec1c95cdf1c9c63955e071a604e09db57095d3a2c10119aad40b931e7c8722d61fa939ea867bc86cf051c578ea86c144821ac81c598840cc3267b477e848d346a8a60b5e2b26db24f3936773e5f69882e';
const API_URL = 'http://localhost:1337';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  timeout: 30000,
});

async function uploadImage(imageUrl, filename) {
  console.log(`  Downloading: ${imageUrl}`);
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
  const tmpPath = path.join(require('os').tmpdir(), filename);
  fs.writeFileSync(tmpPath, response.data);

  console.log(`  Uploading to Strapi...`);
  const result = execSync(
    `curl -s -X POST "${API_URL}/api/upload" -H "Authorization: Bearer ${TOKEN}" -F "files=@${tmpPath};type=image/jpeg"`,
    { encoding: 'utf8' }
  );
  const uploaded = JSON.parse(result);
  fs.unlinkSync(tmpPath);
  return uploaded[0].id;
}

// ────────────────────────────────
// 文章数据
// ────────────────────────────────
const ARTICLES = [
  {
    slug: 'minimalist-jewellery-language',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=85',
    category: 'forecast',
    reading_time: 5,
    featured: true,
    zh: {
      title: '极简主义的珠宝语言：当少即是多',
      excerpt: '在当代珠宝设计中，极简主义不仅是一种审美选择，更是一种哲学立场。探讨极简珠宝如何通过减法美学，传递出比繁复装饰更深刻的品牌叙事。',
      content: `## 形式的纯粹

当代最具影响力的珠宝品牌，无一不在用材料的极度克制表达最大的感染力。一条细线，一个简洁的几何形态，或是一块未经雕琢的原石——这些看似简单的设计语言，背后承载着复杂的品牌哲学。

## 少，是一种立场

极简主义在珠宝领域的流行，折射出当代消费者对"真实"和"本质"的渴望。

> "最好的设计是看不见的设计。" — Dieter Rams

当一件珠宝剥去所有多余的装饰，留下的是设计师对材料本质的理解，是品牌对美学的核心判断。

## 极简背后的工艺复杂性

悖论在于：越是极简的设计，往往越是对工艺要求苛刻。一条完美的黄金细线，要求金属冶炼和拉伸工艺达到极高精度。一颗悬浮的钻石，背后是无数次关于结构与重力的计算。

## 品牌叙事的新语言

极简不是空洞。在真正优秀的极简珠宝品牌中，每一个设计细节都在诉说一个故事。空白是设计的一部分，沉默是叙事的手段。这正是极简主义珠宝的迷人之处——它要求观者参与其中，用想象力填补那些"留白"。`,
    },
    en: {
      title: 'The Minimalist Jewellery Language: When Less Is More',
      excerpt: 'In contemporary jewellery design, minimalism is not merely an aesthetic choice — it is a philosophical stance. How minimal jewellery communicates deeper brand narratives through the aesthetics of subtraction.',
      content: `## The Purity of Form

The most influential contemporary jewellery brands share one quality: maximum emotional impact through maximum restraint of materials. A delicate line, a clean geometric form, or an uncut raw stone — these apparently simple design languages carry complex brand philosophies within them.

## Less Is a Stance

The rise of minimalism in jewellery reflects a contemporary consumer desire for authenticity and essence.

> "The best design is invisible design." — Dieter Rams

When a piece of jewellery strips away all superfluous decoration, what remains is the designer's understanding of material essence — the brand's core aesthetic judgment.

## The Hidden Complexity Behind Minimalism

The paradox: the more minimal the design, the more demanding its craft requirements. A perfect fine gold line requires extreme precision in metal drawing. A suspended diamond is the result of countless calculations about structure and gravity.

## A New Language of Brand Narrative

Minimalism is not emptiness. In truly excellent minimal jewellery brands, every design detail tells a story. Negative space is part of the design; silence is a narrative device.`,
    },
  },
  {
    slug: 'cartier-love-cultural-symbol',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=1200&q=85',
    category: 'culture',
    reading_time: 6,
    featured: false,
    zh: {
      title: 'Cartier 的"爱"：一枚戒指如何成为文化符号',
      excerpt: '1969年，Aldo Cipullo 设计了一只需要螺丝刀才能打开的手镯。半个世纪后，它成为了奢侈品历史上最成功的单品之一。这背后，是品牌如何将一个简单的概念变成永恒叙事的故事。',
      content: `## 一个不可能被取下的承诺

1969年，纽约。年轻的意大利设计师 Aldo Cipullo 受命为 Cartier 创作一件全新作品。他的灵感来自中世纪的贞操带——用约束表达爱情，用不便彰显承诺。

Love 手镯由此诞生。

## 稀缺性的设计

这只手镯需要专用螺丝刀才能佩戴和取下。这一设计看似不便，却制造了一种独特的仪式感：佩戴 Love，意味着将一枚"锁"交到爱人手中。

> 当你佩戴它，你在告诉世界：我选择了这份爱，并以此为荣。

## 名人效应的起点

Cartier 的高明之处在于，它将最初的几对手镯免费赠送给了当时最耀眼的情侣——包括 Elizabeth Taylor 和 Richard Burton。这一决定改变了一切。

## 从产品到文化图腾

五十年过去，Love 手镯的黄金版价格超过万元，却依然供不应求。它早已超越了珠宝的范畴，成为一代人对于爱情、忠诚与品味的集体表达。

这正是顶级珠宝品牌与普通奢侈品的本质区别：**它们贩卖的不是产品，而是一种活着的神话。**`,
    },
    en: {
      title: "Cartier's Love: How a Ring Became a Cultural Symbol",
      excerpt: "In 1969, Aldo Cipullo designed a bracelet that required a screwdriver to open. Half a century later, it became one of the most successful single pieces in luxury history — a story of how a brand transforms a simple concept into eternal narrative.",
      content: `## A Promise That Cannot Be Removed

New York, 1969. Young Italian designer Aldo Cipullo was commissioned to create a new piece for Cartier. His inspiration came from medieval chastity belts — using constraint to express love, using inconvenience to signify commitment.

The Love bracelet was born.

## The Design of Scarcity

This bracelet requires a proprietary screwdriver to put on and take off. This seemingly inconvenient design created a unique ritual: wearing Love means handing a "key" to your beloved.

> When you wear it, you tell the world: I chose this love, and I am proud of it.

## The Celebrity Effect

Cartier's genius was gifting the first few pairs to the most luminous couples of the era — including Elizabeth Taylor and Richard Burton. This decision changed everything.

## From Product to Cultural Totem

Fifty years on, the gold Love bracelet costs over ten thousand dollars and remains in perpetual demand. It has long transcended jewellery, becoming a generation's collective expression of love, loyalty, and taste.

This is the essential difference between a top jewellery brand and ordinary luxury goods: **they sell not products, but a living mythology.**`,
    },
  },
  {
    slug: 'bvlgari-design-philosophy',
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=1200&q=85',
    category: 'profiles',
    reading_time: 7,
    featured: false,
    zh: {
      title: 'BVLGARI 设计哲学：古罗马建筑与现代奢华的对话',
      excerpt: '没有哪个珠宝品牌比 BVLGARI 更坚定地将建筑美学注入首饰设计。从罗马万神殿的穹顶到蛇形手镯的流线，品牌百年 DNA 中藏着一部意大利文明史。',
      content: `## 罗马，永恒之城的馈赠

BVLGARI 创立于1884年的罗马。这座城市不仅是品牌的发源地，更是其设计语言的终身源泉。

创始人 Sotirio Bulgari 从希腊移民至此，他的眼睛里看见的罗马是：弧形的拱券、饱满的半球穹顶、精确的几何比例，以及那种穿越两千年而不衰的建筑自信。

## 色彩，作为建筑材料

如果说其他珠宝品牌以克制著称，BVLGARI 则以大胆的色彩组合独树一帜。

祖母绿配红宝石，蓝宝石配黄玉——这种看似冒险的搭配，实际上有着严谨的美学逻辑：它模仿的是罗马马赛克的镶嵌艺术，用色彩的对比制造视觉张力。

## Serpenti：一个符号的进化史

蛇形系列 Serpenti 诞生于1940年代，至今仍是 BVLGARI 最具辨识度的符号。

蛇在古罗马文化中象征智慧与永恒，盘绕的形态既是建筑中螺旋柱式的映射，也是对生命循环的隐喻。

> 当你佩戴一条 Serpenti，你携带的是两千年的文明记忆。

## 当代性与历史感的平衡

BVLGARI 的设计挑战始终在于：如何在不重复历史的前提下汲取历史养分。这需要设计师既是考古学家，又是预言家。`,
    },
    en: {
      title: 'BVLGARI Design Philosophy: A Dialogue Between Ancient Rome and Modern Luxury',
      excerpt: 'No jewellery brand has more consistently channelled architectural aesthetics into jewellery design than BVLGARI. From the Pantheon dome to the Serpenti bracelet, the brand\'s century-old DNA contains a history of Italian civilisation.',
      content: `## Rome: The Gift of the Eternal City

BVLGARI was founded in Rome in 1884. This city is not only the brand's birthplace but the lifelong source of its design language.

Founder Sotirio Bulgari, a Greek immigrant, saw in Rome: arched vaults, full hemispherical domes, precise geometric proportions, and an architectural confidence that had transcended two thousand years.

## Colour as Architectural Material

If other jewellery brands are known for restraint, BVLGARI stands apart with bold colour combinations. Emerald with ruby, sapphire with topaz — these seemingly audacious pairings follow a rigorous aesthetic logic, mimicking the mosaic art of Rome, creating visual tension through colour contrast.

## Serpenti: The Evolution of a Symbol

The Serpenti series was born in the 1940s and remains BVLGARI's most recognisable symbol. In ancient Roman culture, the snake symbolises wisdom and eternity. Its coiling form reflects both the spiral columns of architecture and a metaphor for the cycles of life.

> When you wear a Serpenti, you carry two thousand years of civilisational memory.

## Balancing Contemporaneity and Historical Depth

BVLGARI's perpetual design challenge: how to draw nourishment from history without repeating it. This requires the designer to be simultaneously archaeologist and prophet.`,
    },
  },
  {
    slug: 'lab-grown-diamonds-rise',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1200&q=85',
    category: 'forecast',
    reading_time: 5,
    featured: false,
    zh: {
      title: '实验室培育钻石的崛起：技术与奢侈品的博弈',
      excerpt: '当一颗与天然钻石在化学、物理上完全相同的钻石，以十分之一的价格出现时，奢侈品行业的定价逻辑面临根本性挑战。这不仅仅是关于钻石的故事。',
      content: `## 钻石的本质是什么？

化学式：C。纯碳，在极端温度和压力下形成的晶体结构。

天然钻石需要数十亿年在地球深处生长。实验室培育钻石（Lab-grown Diamond）则在数周内在受控环境中完成同样的过程。两者在化学成分、晶体结构、光学性质上，没有任何区别。

## 奢侈品的"稀缺性幻觉"

传统珠宝行业的定价逻辑建立在稀缺性之上。然而，当技术打破了稀缺性的壁垒，这套逻辑开始松动。

LVMH 旗下的多个珠宝品牌至今拒绝使用培育钻石，理由是"缺乏自然形成的独特性"。但消费者，尤其是年轻一代，越来越质疑这一叙事。

## 可持续性的新叙事

培育钻石的崛起不仅仅是价格竞争，更是一种价值观的转移。不开矿、不破坏生态——这对于Z世代消费者而言，本身就是一种奢侈。

## 行业的选择

接受还是抵制？这是奢侈品珠宝行业在未来十年必须作出的回答。无论哪条路，都将深刻改写"珠宝"这个词的定义。`,
    },
    en: {
      title: 'The Rise of Lab-Grown Diamonds: Technology vs. Luxury',
      excerpt: 'When a diamond chemically and physically identical to a natural diamond appears at one-tenth of the price, the pricing logic of the luxury industry faces a fundamental challenge. This is not only a story about diamonds.',
      content: `## What Is the Essence of a Diamond?

Chemical formula: C. Pure carbon, a crystal structure formed under extreme temperature and pressure. Natural diamonds require billions of years to grow deep within the earth. Lab-grown diamonds complete the same process in weeks in a controlled environment. The two are identical in chemical composition, crystal structure, and optical properties.

## The "Scarcity Illusion" of Luxury

Traditional jewellery industry pricing is built on scarcity. But when technology breaches the scarcity barrier, the logic begins to crack. Several LVMH jewellery brands still refuse to use lab-grown diamonds, citing "lack of naturally-formed uniqueness." But consumers — especially younger generations — are increasingly questioning this narrative.

## A New Narrative of Sustainability

The rise of lab-grown diamonds is not merely price competition — it is a shift in values. No mining, no ecological destruction: for Gen Z consumers, this is itself a form of luxury.

## The Industry's Choice

Accept or resist? This is the question the luxury jewellery industry must answer in the next decade. Either path will profoundly rewrite the definition of "jewellery."`,
    },
  },
  {
    slug: 'japanese-aesthetics-jewellery',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=85',
    category: 'culture',
    reading_time: 6,
    featured: false,
    zh: {
      title: '珠宝中的物哀：日本美学如何重塑当代首饰',
      excerpt: '物哀（もののあわれ）——对事物无常之美的感知——如何从平安时代的文学传统渗透进当代珠宝设计，并在全球范围内引发共鸣？',
      content: `## 不完美的美学

西方珠宝传统追求完美的切割、无瑕的宝石、对称的结构。而日本美学恰恰相反：它在缺陷中寻找美，在不完整中发现完整。

这种差异在当代珠宝设计中愈发显著。

## 侘寂（Wabi-sabi）的首饰语言

侘寂的核心是接受事物的无常与不完美。在珠宝中，这意味着：
- 保留金属的锤痕与纹理
- 使用非对称的设计结构
- 选择有包裹体的"不完美"宝石
- 拥抱材料的自然老化

日本设计师 Yoko Takirai 说："当我设计一件首饰，我希望它在十年后看起来比今天更美。"

## 物哀与珠宝的时间性

物哀（Mono no aware）是日本人对美与哀愁共存的独特感知。落樱之所以美，恰在于它转瞬即逝。

当代珠宝设计师开始将这种"时间性"融入设计：使用会氧化变色的铜、银，设计随佩戴而改变形态的活动结构。

## 全球共鸣

在过度消费与追求永恒的市场环境中，日本美学提供了另一种可能：接受失去，拥抱过程，在无常中寻找意义。

这，或许正是当代珠宝最缺失的灵魂。`,
    },
    en: {
      title: 'Mono no Aware in Jewellery: How Japanese Aesthetics Reshape Contemporary Adornment',
      excerpt: 'Mono no aware — the perception of the transient beauty of things — how does this literary tradition from the Heian period permeate contemporary jewellery design and resonate globally?',
      content: `## The Aesthetics of Imperfection

Western jewellery traditions pursue perfect cuts, flawless stones, symmetrical structures. Japanese aesthetics are precisely the opposite: finding beauty in flaws, discovering wholeness in incompleteness.

## The Jewellery Language of Wabi-sabi

The essence of wabi-sabi is accepting the impermanence and imperfection of things. In jewellery, this means:
- Preserving the hammer marks and textures of metal
- Using asymmetric design structures
- Choosing "imperfect" stones with inclusions
- Embracing the natural ageing of materials

Japanese designer Yoko Takirai says: "When I design a piece of jewellery, I want it to look more beautiful in ten years than it does today."

## Mono no Aware and the Temporality of Jewellery

Mono no aware is a uniquely Japanese perception of the coexistence of beauty and melancholy. Cherry blossoms are beautiful precisely because they are fleeting.

Contemporary jewellery designers are beginning to incorporate this "temporality" into design: using copper and silver that oxidise and change colour, designing kinetic structures that transform with wearing.

## Global Resonance

In a market environment of overconsumption and the pursuit of the eternal, Japanese aesthetics offer another possibility: accepting loss, embracing process, finding meaning in impermanence.

Perhaps this is the soul that contemporary jewellery most lacks.`,
    },
  },
  {
    slug: 'jewellery-brand-storytelling',
    image: 'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=1200&q=85',
    category: 'profiles',
    reading_time: 8,
    featured: false,
    zh: {
      title: '品牌叙事的艺术：顶级珠宝品牌如何构建情感帝国',
      excerpt: '一个顶级珠宝品牌的价值，有多少来自产品本身，又有多少来自它所讲述的故事？从 Tiffany 的蓝色到 Van Cleef 的幸运草，品牌叙事如何创造无可替代的情感价值。',
      content: `## 故事的价格

一颗钻石的价值，理论上可以用4C来衡量。但为什么同样品质的钻石，镶嵌在 Cartier 的戒托上，就比无名品牌贵出数倍？

答案不在钻石里，在故事里。

## Tiffany 蓝：一种颜色如何成为欲望的代名词

1837年。Charles Lewis Tiffany 为他的第一本珠宝目录选择了一种特别的蓝色——知更鸟蛋的蓝。这个决定的影响持续了近两百年。

今天，Tiffany Blue（Pantone 1837C）是版权所有的颜色。那只蓝色盒子本身，就是一件奢侈品。

## Van Cleef & Arpels：将自然变成永恒

VCA 的设计哲学是将自然界中最美的瞬间凝固为珠宝：蝴蝶、牡丹、四叶草。

四叶草（Alhambra）系列自1968年诞生，将一个简单的幸运符号转化为品牌最耀眼的符号语言。它的成功在于：每个人都能理解幸运的含义，但只有 VCA 的 Alhambra 让你感觉幸运触手可及。

## 叙事的护城河

顶级珠宝品牌真正的壁垒不是工艺（工艺可以学习），不是材料（材料可以购买），而是**数十年积累的叙事资产**。

这种叙事资产一旦建立，几乎无法复制。`,
    },
    en: {
      title: 'The Art of Brand Narrative: How Top Jewellery Brands Build Emotional Empires',
      excerpt: "How much of a top jewellery brand's value comes from the product itself, and how much from the story it tells? From Tiffany's blue to Van Cleef's lucky clover, how does brand narrative create irreplaceable emotional value?",
      content: `## The Price of a Story

A diamond's value can theoretically be measured by the 4Cs. But why does the same quality diamond, set in a Cartier ring, cost several times more than an unknown brand?

The answer is not in the diamond. It is in the story.

## Tiffany Blue: How a Colour Became Synonymous with Desire

1837. Charles Lewis Tiffany chose a particular blue for his first jewellery catalogue — the blue of a robin's egg. This decision has lasted nearly two hundred years. Today, Tiffany Blue (Pantone 1837C) is a trademarked colour. The blue box itself is a luxury good.

## Van Cleef & Arpels: Transforming Nature into Eternity

VCA's design philosophy is to crystallise the most beautiful moments of the natural world into jewellery: butterflies, peonies, four-leaf clovers.

The Alhambra series, born in 1968, transforms a simple lucky charm into the brand's most luminous symbolic language. Its success lies in this: everyone understands the meaning of luck, but only VCA's Alhambra makes you feel that luck is within reach.

## The Narrative Moat

Top jewellery brands' real barrier is not craftsmanship (which can be learned), not materials (which can be purchased), but **decades of accumulated narrative assets**.

Once established, this narrative asset is almost impossible to replicate.`,
    },
  },
];

// ────────────────────────────────
// 主程序
// ────────────────────────────────
async function seed() {
  console.log('\n🌱 开始种子数据写入...\n');

  // ── 1. 创建分类 ──
  console.log('📁 创建分类...');
  const CATS = [
    { slug: 'forecast', zh: '趋势预测', en: 'Forecast' },
    { slug: 'profiles', zh: '人物',    en: 'Profiles' },
    { slug: 'culture',  zh: '文化',    en: 'Culture'  },
  ];
  const catIds = {};
  for (const cat of CATS) {
    try {
      const res = await api.post('/categories', { data: { name: cat.zh, slug: cat.slug, locale: 'zh' } });
      catIds[cat.slug] = res.data.data.documentId;
      console.log(`  ✓ ${cat.zh} (${res.data.data.documentId})`);
      // 英文本地化
      await api.post(`/categories/${res.data.data.documentId}/localizations`, { data: { name: cat.en, locale: 'en' } }).catch(() => {});
    } catch {
      // 已存在，查询
      const existing = await api.get('/categories', { params: { 'filters[slug][$eq]': cat.slug, locale: 'zh' } });
      if (existing.data.data.length > 0) {
        catIds[cat.slug] = existing.data.data[0].documentId;
        console.log(`  ~ ${cat.zh} 已存在`);
      }
    }
  }

  // ── 2. 创建文章 ──
  console.log('\n📝 创建文章（含图片上传）...');
  for (const article of ARTICLES) {
    console.log(`\n  → ${article.zh.title}`);
    let imageId = null;
    try {
      imageId = await uploadImage(article.image, `seed-${article.slug}.jpg`);
      console.log(`  ✓ 图片上传 ID: ${imageId}`);
    } catch (e) {
      console.log(`  ✗ 图片上传失败: ${e.message}`);
    }

    try {
      const zhData = {
        title: article.zh.title,
        slug: article.slug,
        excerpt: article.zh.excerpt,
        content: article.zh.content,
        reading_time: article.reading_time,
        featured: article.featured,
        locale: 'zh',
        publishedAt: new Date().toISOString(),
        ...(catIds[article.category] && { category: catIds[article.category] }),
        ...(imageId && { cover_image: imageId }),
      };

      const zhRes = await api.post('/articles', { data: zhData });
      const docId = zhRes.data.data.documentId;
      console.log(`  ✓ 中文文章创建 (${docId})`);

      // 英文本地化
      await api.post(`/articles/${docId}/localizations`, {
        data: {
          title: article.en.title,
          excerpt: article.en.excerpt,
          content: article.en.content,
          locale: 'en',
          publishedAt: new Date().toISOString(),
        },
      });
      console.log(`  ✓ 英文本地化创建`);
    } catch (e) {
      console.log(`  ✗ 文章创建失败: ${e.response?.data?.error?.message || e.message}`);
    }
  }

  // ── 3. 配置首页区块 ──
  console.log('\n🏠 配置首页布局...');
  const homepageSections = [
    {
      __component: 'sections.hero',
      eyebrow: '珠宝 · 品牌 · 设计',
      title_line1: 'Magician',
      title_line2: 'in Jewellery',
      subtitle: '解码珠宝设计的语言——品牌策略、创意愿景，以及那些宝石背后的故事。',
      cta_text: '探索洞察',
      cta_link: '/insights',
    },
    {
      __component: 'sections.intro',
      label: '关于平台',
      heading_zh: '工艺与品牌智识的交汇',
      heading_en: 'Where craft meets brand intelligence',
      body: 'Magician in Jewellery 是一个专注于珠宝设计、品牌身份与文化叙事交汇地带的编辑平台。我们研究世界上最令人信服的珠宝品牌是如何被打造出来的——而不仅仅是被佩戴。',
      link_text: '了解更多 →',
      link_url: '/about',
      background_image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=85',
    },
    {
      __component: 'sections.featured-article',
      label: '精选文章',
    },
    {
      __component: 'sections.article-grid',
      title_prefix: '最新',
      title_highlight: '洞察',
      article_count: 3,
      view_all_text: '查看全部',
    },
    {
      __component: 'sections.contact-band',
      heading_line1: '来聊聊',
      heading_line2: '珠宝。',
      description: '欢迎洽谈合作、联合编辑，或是探讨珠宝设计的未来。',
      email: 'hello@magicianinjewellery.com',
      instagram: '@magicianinjewellery',
      wechat: 'MagicianInJewellery',
    },
  ];

  try {
    await api.put('/homepage?locale=zh', {
      data: { sections: homepageSections, publishedAt: new Date().toISOString() },
    });
    console.log('  ✓ 中文首页布局配置完成');
  } catch (e) {
    console.log(`  ✗ 首页配置失败: ${e.response?.data?.error?.message || e.message}`);
  }

  console.log('\n✅ 种子数据写入完成！\n');
  console.log('下一步：');
  console.log('  1. Strapi admin → Settings → Roles → Public → 开放 Homepage find 权限');
  console.log('  2. 刷新 http://localhost:3000\n');
}

seed().catch(console.error);
