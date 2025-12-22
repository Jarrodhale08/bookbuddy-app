/**
 * Supabase Client Configuration
 * Multi-tenant architecture with app_id isolation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';

// ============================================================================
// CONFIGURATION - Loaded from environment variables
// ============================================================================
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Multi-tenant app identifier - CRITICAL for data isolation
export const APP_ID = process.env.EXPO_PUBLIC_APP_ID || 'bookbuddy';

// ============================================================================
// LAZY CLIENT INITIALIZATION
// ============================================================================

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

// For backwards compatibility - uses lazy getter
export const supabase: SupabaseClient = {
  get auth() { return getSupabase().auth; },
  get from() { return getSupabase().from.bind(getSupabase()); },
  get rpc() { return getSupabase().rpc.bind(getSupabase()); },
  get channel() { return getSupabase().channel.bind(getSupabase()); },
  get storage() { return getSupabase().storage; },
  get functions() { return getSupabase().functions; },
  get realtime() { return getSupabase().realtime; },
  get rest() { return getSupabase().rest; },
  get schema() { return getSupabase().schema.bind(getSupabase()); },
  removeChannel: (channel) => getSupabase().removeChannel(channel),
  removeAllChannels: () => getSupabase().removeAllChannels(),
  getChannels: () => getSupabase().getChannels(),
} as SupabaseClient;

// ============================================================================
// AUTO REFRESH MANAGEMENT
// ============================================================================

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function setupAutoRefresh(): void {
  if (appStateSubscription) return;

  appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      getSupabase().auth.startAutoRefresh();
    } else {
      getSupabase().auth.stopAutoRefresh();
    }
  });
}

export function cleanupAutoRefresh(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

// ============================================================================
// MULTI-TENANT HELPERS
// ============================================================================

/**
 * Initialize app context for the current user
 * Call this after successful login to register user with this app
 */
export async function initializeAppContext(): Promise<void> {
  const { data: { user } } = await getSupabase().auth.getUser();
  if (!user) return;

  try {
    // Upsert user_app_context record
    await getSupabase()
      .from('user_app_context')
      .upsert(
        {
          user_id: user.id,
          app_id: APP_ID,
          last_accessed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,app_id' }
      );

    // Ensure profile exists
    await getSupabase()
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
        },
        { onConflict: 'id' }
      );
  } catch (error) {
    console.warn('Failed to initialize app context:', error);
  }
}

/**
 * Get app-specific storage bucket name
 */
export function getAppBucket(bucketType: 'avatars' | 'covers' | 'uploads'): string {
  return `${APP_ID}-${bucketType}`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && SUPABASE_URL.length > 0 &&
         !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 0;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await getSupabase().auth.getUser();
  if (error) {
    return null;
  }
  return user;
}

export async function getCurrentSession() {
  const { data: { session }, error } = await getSupabase().auth.getSession();
  if (error) {
    return null;
  }
  return session;
}

/**
 * Get user's profile from the database
 */
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.warn('Failed to get user profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user's profile
 */
export async function updateUserProfile(updates: {
  display_name?: string;
  avatar_url?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: new Error('Not authenticated') };

  const { data, error } = await getSupabase()
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  return { data, error };
}

export default supabase;
