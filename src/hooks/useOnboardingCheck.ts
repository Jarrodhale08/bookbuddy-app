/**
 * useOnboardingCheck Hook
 * Checks if user has completed onboarding and redirects appropriately
 */

import { useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../stores/authStore';

const ONBOARDING_KEY = 'bookbuddy_onboarding_complete';

export function useOnboardingCheck() {
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const { user, isInitialized: authInitialized } = useAuthStore();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.warn('Failed to check onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (!isReady || !authInitialized) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password';
    const inTabs = segments[0] === '(tabs)';

    // If not completed onboarding and not already on onboarding screen
    if (!hasCompletedOnboarding && !inOnboarding && !inAuth) {
      router.replace('/onboarding');
      return;
    }

    // If completed onboarding but on onboarding screen
    if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
      return;
    }
  }, [isReady, authInitialized, hasCompletedOnboarding, segments, router]);

  const markOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
  };

  return {
    isReady,
    hasCompletedOnboarding,
    markOnboardingComplete,
    resetOnboarding,
  };
}

export default useOnboardingCheck;
