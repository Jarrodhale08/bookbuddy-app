/**
 * Supabase Client Configuration
 *
 * This file initializes the Supabase client for your app.
 * Replace the placeholder values with your actual Supabase project credentials.
 *
 * To get your credentials:
 * 1. Go to https://supabase.com and create a project
 * 2. Go to Project Settings > API
 * 3. Copy the "Project URL" and "anon public" key
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';

// ============================================================================
// CONFIGURATION - Loaded from environment variables (set by AppForge)
// ============================================================================
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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

export default supabase;
