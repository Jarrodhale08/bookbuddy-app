/**
 * Premium Features Configuration - BookBuddy
 * Defines what features are available in free vs premium tiers
 */

export interface PremiumFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  freeLimit?: number | string;
  premiumLimit?: number | string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited_books',
    icon: '📚',
    title: 'Unlimited Books',
    description: 'Track unlimited books in your library',
    freeLimit: '10 books',
    premiumLimit: 'Unlimited',
  },
  {
    id: 'notes_highlights',
    icon: '📝',
    title: 'Notes & Highlights',
    description: 'Save unlimited notes and highlights from your reading',
    freeLimit: '5 per book',
    premiumLimit: 'Unlimited',
  },
  {
    id: 'reading_stats',
    icon: '📊',
    title: 'Advanced Statistics',
    description: 'Detailed reading analytics, trends, and insights',
    freeLimit: 'Basic stats only',
    premiumLimit: 'Full analytics',
  },
  {
    id: 'cloud_sync',
    icon: '☁️',
    title: 'Cloud Sync',
    description: 'Sync your library across all your devices',
    freeLimit: 'Local only',
    premiumLimit: 'Full sync',
  },
  {
    id: 'export_data',
    icon: '📤',
    title: 'Export Data',
    description: 'Export your reading history, notes, and statistics',
    freeLimit: 'Not available',
    premiumLimit: 'CSV, JSON, PDF',
  },
  {
    id: 'custom_shelves',
    icon: '🗂️',
    title: 'Custom Bookshelves',
    description: 'Create unlimited custom collections and shelves',
    freeLimit: '3 shelves',
    premiumLimit: 'Unlimited',
  },
  {
    id: 'reading_goals',
    icon: '🎯',
    title: 'Reading Goals',
    description: 'Set and track yearly, monthly, and custom reading goals',
    freeLimit: 'Yearly only',
    premiumLimit: 'All goal types',
  },
  {
    id: 'ad_free',
    icon: '🚫',
    title: 'Ad-Free Experience',
    description: 'Enjoy BookBuddy without any advertisements',
    freeLimit: 'Ads shown',
    premiumLimit: 'No ads',
  },
];

export const FREE_TIER_LIMITS = {
  maxBooks: 10,
  notesPerBook: 5,
  highlightsPerBook: 5,
  maxShelves: 3,
  cloudSync: false,
  exportEnabled: false,
  advancedStats: false,
  allGoalTypes: false,
  adsEnabled: true,
};

export const PREMIUM_TIER_LIMITS = {
  maxBooks: Infinity,
  notesPerBook: Infinity,
  highlightsPerBook: Infinity,
  maxShelves: Infinity,
  cloudSync: true,
  exportEnabled: true,
  advancedStats: true,
  allGoalTypes: true,
  adsEnabled: false,
};

export function getFeatureLimit<K extends keyof typeof FREE_TIER_LIMITS>(
  feature: K,
  isPremium: boolean
): typeof FREE_TIER_LIMITS[K] {
  return isPremium ? PREMIUM_TIER_LIMITS[feature] : FREE_TIER_LIMITS[feature];
}

export function canAccessFeature(featureId: string, isPremium: boolean): boolean {
  if (isPremium) return true;

  // Free tier restricted features
  const restrictedFeatures = [
    'cloud_sync',
    'export_data',
    'advanced_stats',
    'custom_shelves_unlimited',
    'all_goal_types',
  ];

  return !restrictedFeatures.includes(featureId);
}

export function isAtLimit(
  feature: 'books' | 'notes' | 'highlights' | 'shelves',
  currentCount: number,
  isPremium: boolean
): boolean {
  if (isPremium) return false;

  const limits: Record<string, number> = {
    books: FREE_TIER_LIMITS.maxBooks,
    notes: FREE_TIER_LIMITS.notesPerBook,
    highlights: FREE_TIER_LIMITS.highlightsPerBook,
    shelves: FREE_TIER_LIMITS.maxShelves,
  };

  return currentCount >= (limits[feature] || Infinity);
}

export function getRemainingCount(
  feature: 'books' | 'notes' | 'highlights' | 'shelves',
  currentCount: number,
  isPremium: boolean
): number | 'unlimited' {
  if (isPremium) return 'unlimited';

  const limits: Record<string, number> = {
    books: FREE_TIER_LIMITS.maxBooks,
    notes: FREE_TIER_LIMITS.notesPerBook,
    highlights: FREE_TIER_LIMITS.highlightsPerBook,
    shelves: FREE_TIER_LIMITS.maxShelves,
  };

  return Math.max(0, (limits[feature] || 0) - currentCount);
}
