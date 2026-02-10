// Brand Caption Templates Library
// Each template has variations for different platforms

export interface CaptionTemplate {
  id: string;
  name: string;
  category: 'product' | 'promotion' | 'engagement' | 'seasonal' | 'milestone' | 'educational';
  telegram: string;
  x: string;
  linkedin: string;
  hashtags: string[];
}

export const TEMPLATE_LIBRARY: CaptionTemplate[] = [
  // PRODUCT LAUNCHES
  {
    id: 'product-launch-1',
    name: 'New Product Drop',
    category: 'product',
    telegram: '🚀 Introducing our latest creation!\n\n[PRODUCT_NAME] is here to transform how you [BENEFIT]. Ready to experience the difference?\n\n[LINK]',
    x: '🚀 New drop: [PRODUCT_NAME]\n\nTransform your [BENEFIT] game.\n\n[LINK]',
    linkedin: '✨ Excited to announce the launch of [PRODUCT_NAME]!\n\nAfter months of development and testing, we are bringing you a solution that [BENEFIT].\n\nThis represents our commitment to [VALUE] and delivering real results for our community.\n\nWhat features would you love to see next? Drop your thoughts below! 👇\n\n[LINK]',
    hashtags: ['#productlaunch', '#innovation', '#newproduct', '#tech', '#solution'],
  },
  {
    id: 'product-feature-1',
    name: 'Feature Spotlight',
    category: 'product',
    telegram: '⚡ Feature Spotlight\n\nDid you know [PRODUCT] can [FEATURE]?\n\nHere is how it works:\n✓ [BENEFIT_1]\n✓ [BENEFIT_2]\n✓ [BENEFIT_3]\n\nTry it today!',
    x: '⚡ [PRODUCT] tip:\n\nUse [FEATURE] to [BENEFIT].\n\nGame changer. 🚀',
    linkedin: '⚡ Feature Spotlight: [FEATURE]\n\nOne of our favorite capabilities in [PRODUCT] is often overlooked—but it should not be.\n\nHere is why teams love it:\n\n✅ [BENEFIT_1]\n✅ [BENEFIT_2]\n✅ [BENEFIT_3]\n\nPro tip: [TIP]\n\nWhat is your favorite [PRODUCT] feature? Let us know in the comments!',
    hashtags: ['#productfeatures', '#howto', '#tips', '#productivity'],
  },
  
  // PROMOTIONS
  {
    id: 'sale-promo-1',
    name: 'Limited Time Offer',
    category: 'promotion',
    telegram: "🔥 FLASH SALE\n\n[DISCOUNT]% OFF everything!\n\n⏰ Ends in [TIME]\n🎁 Use code: [CODE]\n\nDo not miss out → [LINK]",
    x: "🔥 [DISCOUNT]% OFF flash sale\n\nCode: [CODE]\n⏰ Ends [TIME]\n\n[LINK]",
    linkedin: "🔥 Limited Time Opportunity\n\nWe are offering [DISCOUNT]% off [PRODUCT/SERVICE] for the next [TIME].\n\nWhy now?\n• [REASON_1]\n• [REASON_2]\n• [REASON_3]\n\nUse code [CODE] at checkout.\n\n[LINK]\n\nOffer ends soon—tag someone who needs to see this!",
    hashtags: ['#sale', '#discount', '#limitedtime', '#offer', '#save'],
  },
  {
    id: 'free-trial-1',
    name: 'Free Trial Offer',
    category: 'promotion',
    telegram: '🎁 Try before you buy!\n\nGet [DAYS] days of [PRODUCT] FREE. No credit card required.\n\n👉 [LINK]',
    x: '🎁 Free [DAYS]-day trial\n\nNo CC required.\n\nSee what [PRODUCT] can do.\n\n[LINK]',
    linkedin: "🎁 Experience [PRODUCT] Risk-Free\n\nWe are so confident you will love [PRODUCT] that we are offering [DAYS] days completely free.\n\nNo credit card. No obligations. Just results.\n\nReady to see what is possible?\n\n[LINK]",
    hashtags: ['#freetrial', '#trybeforeyoubuy', '#demo', '#saas'],
  },
  
  // ENGAGEMENT
  {
    id: 'question-1',
    name: 'Community Question',
    category: 'engagement',
    telegram: '💬 We want to hear from you!\n\n[QUESTION]\n\nDrop your thoughts below 👇',
    x: '💬 Quick question:\n\n[QUESTION]\n\nLet us know 👇',
    linkedin: '💬 Community Input Needed\n\n[QUESTION]\n\nWe are building [PRODUCT/FUTURE] with your needs in mind, and your insights matter.\n\nShare your experience in the comments—our team reads every single one.\n\nBest answer wins [PRIZE/FEATURE]! 🏆',
    hashtags: ['#community', '#feedback', '#question', '#engagement'],
  },
  {
    id: 'poll-1',
    name: 'This or That',
    category: 'engagement',
    telegram: '👇 This or That?\n\nA) [OPTION_A]\nB) [OPTION_B]\n\nVote in the comments!',
    x: 'This or that?\n\n[OPTION_A] vs [OPTION_B]\n\nVote below 👇',
    linkedin: '📊 Quick Poll: [OPTION_A] vs [OPTION_B]\n\nOur team is divided, and we need your input!\n\n👉 React with ❤️ for [OPTION_A]\n👉 React with 👍 for [OPTION_B]\n\nResults in 24 hours. Which side are you on?',
    hashtags: ['#poll', '#thisorthat', '#vote', '#community'],
  },
  
  // SEASONAL
  {
    id: 'new-month-1',
    name: 'New Month Fresh Start',
    category: 'seasonal',
    telegram: '🌟 Happy [MONTH]!\n\nNew month, new goals, new opportunities. What are you building this month?\n\n#newmonth #freshstart',
    x: '🌟 [MONTH] is here\n\nNew goals. New wins.\n\nWhat are you building? 👇',
    linkedin: '🌟 Welcome, [MONTH]!\n\nAs we turn the page to a new month, it is the perfect time to reflect and reset.\n\nOur team is focused on:\n• [GOAL_1]\n• [GOAL_2]\n• [GOAL_3]\n\nWhat are your priorities for [MONTH]? Share below—let us hold each other accountable! 💪',
    hashtags: ['#newmonth', '#goals', '#freshstart', '#motivation'],
  },
  {
    id: 'holiday-1',
    name: 'Holiday Greeting',
    category: 'seasonal',
    telegram: '🎄 Happy [HOLIDAY]!\n\nWishing you and yours a wonderful celebration.\n\nFrom all of us at [BRAND] 💚',
    x: '🎄 Happy [HOLIDAY]!\n\nWishing you joy and rest.\n\nFrom [BRAND] 💚',
    linkedin: "🎄 Season's Greetings from [BRAND]\n\nAs we celebrate [HOLIDAY], we want to express our gratitude for our incredible community, partners, and team.\n\nYour support drives everything we do.\n\nHere is to a prosperous [YEAR] ahead! 🥂",
    hashtags: ['#holiday', '#seasonsgreetings', '#celebration'],
  },
  
  // MILESTONES
  {
    id: 'milestone-1',
    name: 'Company Milestone',
    category: 'milestone',
    telegram: '🎉 [NUMBER] [MILESTONE]!\n\nThank you to everyone who has been part of this journey.\n\nHere is to the next chapter 🚀',
    x: '🎉 We hit [NUMBER] [MILESTONE]!\n\nCould not have done it without you.\n\nNext stop: bigger goals 🚀',
    linkedin: '🎉 [NUMBER] [MILESTONE] Achieved!\n\nToday marks a significant milestone for [BRAND], and we could not have done it without:\n\n• Our incredible team\n• Our loyal customers\n• Our supportive partners\n\nWhen we started [STORY], we never imagined [IMPACT].\n\nThank you for being part of our journey. The best is yet to come! 🚀',
    hashtags: ['#milestone', '#celebration', '#growth', '#thankyou'],
  },
  
  // EDUCATIONAL
  {
    id: 'tip-1',
    name: 'Quick Tip/Trick',
    category: 'educational',
    telegram: '💡 Quick Tip\n\n[TIP_CONTENT]\n\nSave this for later! 📌',
    x: '💡 [TIP_TITLE]\n\n[TIP_SHORT]\n\nRT to save 📌',
    linkedin: '💡 [TIP_TITLE]: A Strategy That Works\n\n[TIP_CONTENT]\n\nWhy this matters:\n✓ [BENEFIT_1]\n✓ [BENEFIT_2]\n✓ [BENEFIT_3]\n\nThe best part? It takes just [TIME/RESOURCE].\n\nHave you tried this? What is your experience?',
    hashtags: ['#tips', '#strategy', '#protips', '#education'],
  },
  {
    id: 'myth-1',
    name: 'Myth Buster',
    category: 'educational',
    telegram: '❌ MYTH: [MYTH]\n\n✅ TRUTH: [TRUTH]\n\nDo not fall for common misconceptions. Here is what you need to know 👇',
    x: '❌ Myth: [MYTH]\n✅ Truth: [TRUTH]\n\nStop believing this.\n\nHere is why 👇',
    linkedin: '❌ MYTH vs ✅ REALITY\n\nThere is a dangerous misconception in [INDUSTRY]:\n\n❌ "[MYTH]"\n\nThe reality?\n\n✅ [TRUTH]\n\nHere is the data that proves it:\n[EVIDENCE]\n\nWhat myths have you encountered? Let us debunk them together!',
    hashtags: ['#mythbusters', '#facts', '#truth', '#industry'],
  },
  
  // BEHIND THE SCENES
  {
    id: 'bts-1',
    name: 'Behind the Scenes',
    category: 'engagement',
    telegram: '🔧 Behind the scenes\n\n[CONTENT]\n\nThe work you do not usually see 🎬',
    x: '🔧 BTS:\n\n[CONTENT_SHORT]\n\nThe messy middle.',
    linkedin: '🔧 Behind the Scenes at [BRAND]\n\n[CONTENT]\n\nSuccess looks effortless from the outside, but here is what [ACTIVITY] actually looks like:\n\n• [DETAIL_1]\n• [DETAIL_2]\n• [DETAIL_3]\n\nThe result is worth every challenge. What is your process like?',
    hashtags: ['#behindthescenes', '#bts', '#process', '#transparency'],
  },
  
  // CUSTOMER SPOTLIGHT
  {
    id: 'testimonial-1',
    name: 'Customer Win',
    category: 'engagement',
    telegram: '💚 Customer Win\n\n"[TESTIMONIAL]"\n\n— [CUSTOMER_NAME], [CUSTOMER_TITLE]\n\nResults like these fuel our mission 🙏',
    x: '"[TESTIMONIAL_SHORT]"\n\n— [CUSTOMER_NAME]\n\nThis is why we do what we do. 💚',
    linkedin: '💚 Customer Success Story\n\n"[TESTIMONIAL]"\n\n— [CUSTOMER_NAME], [CUSTOMER_TITLE] at [COMPANY]\n\n[STORY_CONTEXT]\n\nThe results:\n📈 [RESULT_1]\n📈 [RESULT_2]\n\nWant similar results? Let us talk: [LINK]',
    hashtags: ['#testimonial', '#casestudy', '#success', '#socialproof'],
  },
];

// Get templates by category
export function getTemplatesByCategory(category: CaptionTemplate['category']) {
  return TEMPLATE_LIBRARY.filter(t => t.category === category);
}

// Get all categories
export function getCategories() {
  const cats = Array.from(new Set(TEMPLATE_LIBRARY.map(t => t.category)));
  return cats.sort();
}

// Fill template with values
export function fillTemplate(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
  }
  return result;
}