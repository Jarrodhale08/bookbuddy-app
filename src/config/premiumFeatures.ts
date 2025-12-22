/**
 * Premium Features Configuration
 * Defines what features are available in free vs premium tiers
 */

export interface PremiumFeature {
  icon: string;
  title: string;
  description: string;
  freeLimit?: number | string;
  premiumLimit?: number | string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    "icon": "🚫",
    "title": "Ad-Free Experience",
    "description": "Enjoy the app without any advertisements"
  },
  {
    "icon": "♾️",
    "title": "Unlimited Access",
    "description": "No daily limits or restrictions"
  },
  {
    "icon": "💾",
    "title": "Cloud Backup",
    "description": "Sync and backup your data across devices"
  },
  {
    "icon": "📚",
    "title": "Full Course Library",
    "description": "Access all courses and materials"
  },
  {
    "icon": "📝",
    "title": "Practice Tests",
    "description": "Unlimited practice exams and quizzes"
  },
  {
    "icon": "🏆",
    "title": "Certificates",
    "description": "Earn certificates of completion"
  }
];

export const FREE_TIER_LIMITS = {
  itemsPerDay: 5,
  savedItems: 10,
  historyDays: 7,
  exportEnabled: false,
  adsEnabled: true,
  customizationEnabled: false,
};

export const PREMIUM_TIER_LIMITS = {
  itemsPerDay: Infinity,
  savedItems: Infinity,
  historyDays: 365,
  exportEnabled: true,
  adsEnabled: false,
  customizationEnabled: true,
};

export function getFeatureLimit(feature: keyof typeof FREE_TIER_LIMITS, isPremium: boolean) {
  return isPremium ? PREMIUM_TIER_LIMITS[feature] : FREE_TIER_LIMITS[feature];
}

export function canAccessFeature(feature: string, isPremium: boolean): boolean {
  if (isPremium) return true;

  // Free tier restrictions
  const restrictedFeatures = [
    'export',
    'customization',
    'unlimited',
    'advanced',
    'analytics',
    'sync',
    'backup',
  ];

  return !restrictedFeatures.some(r => feature.toLowerCase().includes(r));
}
