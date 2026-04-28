/**
 * 为已有中文文章添加英文本地化版本（Strapi 5 用 PUT ?locale=en）
 * 运行: node seed-en.js
 */

const axios = require('axios');

const TOKEN = 'a8b324a59e7e8a5f01ecb55daff6559cadcd2372da511a9685b299dd441ed8283216b2c03ee4ae842b0a296314e1a66ec1c95cdf1c9c63955e071a604e09db57095d3a2c10119aad40b931e7c8722d61fa939ea867bc86cf051c578ea86c144821ac81c598840cc3267b477e848d346a8a60b5e2b26db24f3936773e5f69882e';
const API_URL = 'http://localhost:1337';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  timeout: 15000,
});

// documentId => 从 seed.js 运行结果中获取
const EN_ARTICLES = [
  {
    documentId: 'ugw0cjv89yq7lf0zi25c5fgq',
    title: 'The Minimalist Jewellery Language: When Less Is More',
    excerpt: 'In contemporary jewellery design, minimalism is not merely an aesthetic choice — it is a philosophical stance. How minimal jewellery communicates deeper brand narratives through the aesthetics of subtraction.',
    content: `## The Purity of Form\n\nThe most influential contemporary jewellery brands share one quality: maximum emotional impact through maximum restraint of materials. A delicate line, a clean geometric form, or an uncut raw stone — these apparently simple design languages carry complex brand philosophies within them.\n\n## Less Is a Stance\n\nThe rise of minimalism in jewellery reflects a contemporary consumer desire for authenticity and essence.\n\n> "The best design is invisible design." — Dieter Rams\n\nWhen a piece of jewellery strips away all superfluous decoration, what remains is the designer's understanding of material essence — the brand's core aesthetic judgment.\n\n## The Hidden Complexity Behind Minimalism\n\nThe paradox: the more minimal the design, the more demanding its craft requirements. A perfect fine gold line requires extreme precision in metal drawing. A suspended diamond is the result of countless calculations about structure and gravity.\n\n## A New Language of Brand Narrative\n\nMinimalism is not emptiness. In truly excellent minimal jewellery brands, every design detail tells a story. Negative space is part of the design; silence is a narrative device.`,
  },
  {
    documentId: 'g7ykw1lqp4mypgmx6oeptwj9',
    title: "Cartier's Love: How a Ring Became a Cultural Symbol",
    excerpt: "In 1969, Aldo Cipullo designed a bracelet that required a screwdriver to open. Half a century later, it became one of the most successful single pieces in luxury history.",
    content: `## A Promise That Cannot Be Removed\n\nNew York, 1969. Young Italian designer Aldo Cipullo was commissioned to create a new piece for Cartier. His inspiration came from medieval chastity belts — using constraint to express love, using inconvenience to signify commitment.\n\nThe Love bracelet was born.\n\n## The Design of Scarcity\n\nThis bracelet requires a proprietary screwdriver to put on and take off. This seemingly inconvenient design created a unique ritual: wearing Love means handing a "key" to your beloved.\n\n> When you wear it, you tell the world: I chose this love, and I am proud of it.\n\n## The Celebrity Effect\n\nCartier's genius was gifting the first few pairs to the most luminous couples of the era — including Elizabeth Taylor and Richard Burton. This decision changed everything.\n\n## From Product to Cultural Totem\n\nFifty years on, the gold Love bracelet costs over ten thousand dollars and remains in perpetual demand. It has long transcended jewellery, becoming a generation's collective expression of love, loyalty, and taste.`,
  },
  {
    documentId: 'xblif6hrr6wlypku5pkugyqq',
    title: 'BVLGARI Design Philosophy: A Dialogue Between Ancient Rome and Modern Luxury',
    excerpt: "No jewellery brand has more consistently channelled architectural aesthetics into jewellery design than BVLGARI. From the Pantheon dome to the Serpenti bracelet, the brand's century-old DNA contains a history of Italian civilisation.",
    content: `## Rome: The Gift of the Eternal City\n\nBVLGARI was founded in Rome in 1884. This city is not only the brand's birthplace but the lifelong source of its design language.\n\n## Colour as Architectural Material\n\nIf other jewellery brands are known for restraint, BVLGARI stands apart with bold colour combinations. Emerald with ruby, sapphire with topaz — these seemingly audacious pairings follow a rigorous aesthetic logic, mimicking the mosaic art of Rome.\n\n## Serpenti: The Evolution of a Symbol\n\nThe Serpenti series was born in the 1940s and remains BVLGARI's most recognisable symbol.\n\n> When you wear a Serpenti, you carry two thousand years of civilisational memory.\n\n## Balancing Contemporaneity and Historical Depth\n\nBVLGARI's perpetual design challenge: how to draw nourishment from history without repeating it.`,
  },
  {
    documentId: 'unrjhf7fxf9lqsnom6kcw096',
    title: 'The Rise of Lab-Grown Diamonds: Technology vs. Luxury',
    excerpt: 'When a diamond chemically and physically identical to a natural diamond appears at one-tenth of the price, the pricing logic of the luxury industry faces a fundamental challenge.',
    content: `## What Is the Essence of a Diamond?\n\nChemical formula: C. Pure carbon, a crystal structure formed under extreme temperature and pressure. Natural diamonds require billions of years to grow deep within the earth. Lab-grown diamonds complete the same process in weeks in a controlled environment.\n\n## The "Scarcity Illusion" of Luxury\n\nTraditional jewellery industry pricing is built on scarcity. But when technology breaches the scarcity barrier, the logic begins to crack.\n\n## A New Narrative of Sustainability\n\nThe rise of lab-grown diamonds is not merely price competition — it is a shift in values. No mining, no ecological destruction: for Gen Z consumers, this is itself a form of luxury.\n\n## The Industry's Choice\n\nAccept or resist? This is the question the luxury jewellery industry must answer in the next decade.`,
  },
  {
    documentId: 'b2oocxp7l9z0lpznngki2cwq',
    title: 'Mono no Aware in Jewellery: How Japanese Aesthetics Reshape Contemporary Adornment',
    excerpt: 'Mono no aware — the perception of the transient beauty of things — how does this literary tradition from the Heian period permeate contemporary jewellery design?',
    content: `## The Aesthetics of Imperfection\n\nWestern jewellery traditions pursue perfect cuts, flawless stones, symmetrical structures. Japanese aesthetics are precisely the opposite: finding beauty in flaws, discovering wholeness in incompleteness.\n\n## The Jewellery Language of Wabi-sabi\n\nThe essence of wabi-sabi is accepting the impermanence and imperfection of things. In jewellery, this means preserving the hammer marks of metal, using asymmetric structures, choosing "imperfect" stones with inclusions.\n\n## Mono no Aware and the Temporality of Jewellery\n\nMono no aware is a uniquely Japanese perception of the coexistence of beauty and melancholy. Cherry blossoms are beautiful precisely because they are fleeting.\n\n## Global Resonance\n\nIn a market environment of overconsumption, Japanese aesthetics offer another possibility: accepting loss, embracing process, finding meaning in impermanence.`,
  },
  {
    documentId: 'hgumly221y7p7fimjj1vnbmv',
    title: 'The Art of Brand Narrative: How Top Jewellery Brands Build Emotional Empires',
    excerpt: "How much of a top jewellery brand's value comes from the product itself, and how much from the story it tells? From Tiffany's blue to Van Cleef's lucky clover.",
    content: `## The Price of a Story\n\nA diamond's value can theoretically be measured by the 4Cs. But why does the same quality diamond, set in a Cartier ring, cost several times more than an unknown brand?\n\nThe answer is not in the diamond. It is in the story.\n\n## Tiffany Blue: How a Colour Became Synonymous with Desire\n\n1837. Charles Lewis Tiffany chose a particular blue for his first jewellery catalogue — the blue of a robin's egg. Today, Tiffany Blue (Pantone 1837C) is a trademarked colour.\n\n## Van Cleef & Arpels: Transforming Nature into Eternity\n\nVCA's design philosophy is to crystallise the most beautiful moments of the natural world into jewellery. The Alhambra series, born in 1968, transforms a simple lucky charm into the brand's most luminous symbolic language.\n\n## The Narrative Moat\n\nTop jewellery brands' real barrier is not craftsmanship, not materials, but **decades of accumulated narrative assets**.`,
  },
];

async function addEnglishLocalizations() {
  console.log('\n🌐 添加英文本地化版本...\n');

  for (const article of EN_ARTICLES) {
    try {
      await api.put(`/articles/${article.documentId}?locale=en`, {
        data: {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          publishedAt: new Date().toISOString(),
        },
      });
      console.log(`  ✓ ${article.title.substring(0, 50)}...`);
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error?.message || e.message;
      console.log(`  ✗ [${status}] ${article.title.substring(0, 40)}: ${msg}`);
    }
  }

  // 也配置英文首页
  console.log('\n🏠 配置英文首页布局...');
  try {
    await api.put('/homepage?locale=en', {
      data: {
        sections: [
          { __component: 'sections.hero', eyebrow: 'Jewellery · Brand · Design', title_line1: 'Magician', title_line2: 'in Jewellery', subtitle: 'Decoding the language of jewellery design — brand strategy, creative vision, and the stories behind the stones.', cta_text: 'Explore Insights', cta_link: '/insights' },
          { __component: 'sections.intro', label: 'About', heading_zh: '工艺与品牌智识的交汇', heading_en: 'Where craft meets brand intelligence', body: 'Magician in Jewellery is an editorial platform focused on the intersection of jewellery design, brand identity and cultural narrative.', link_text: 'Learn More →', link_url: '/about', background_image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=85' },
          { __component: 'sections.featured-article', label: 'Featured' },
          { __component: 'sections.article-grid', title_prefix: 'Latest', title_highlight: 'Insights', article_count: 3, view_all_text: 'View All' },
          { __component: 'sections.contact-band', heading_line1: "Let's talk", heading_line2: 'jewellery.', description: 'Open to collaborations, co-editing, and conversations about the future of jewellery design.', email: 'hello@magicianinjewellery.com', instagram: '@magicianinjewellery', wechat: 'MagicianInJewellery' },
        ],
        publishedAt: new Date().toISOString(),
      },
    });
    console.log('  ✓ 英文首页布局配置完成');
  } catch (e) {
    console.log(`  ✗ 英文首页配置失败: ${e.response?.data?.error?.message || e.message}`);
  }

  console.log('\n✅ 完成！\n');
}

addEnglishLocalizations().catch(console.error);
