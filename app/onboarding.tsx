/**
 * Onboarding Screen with 7-Day Free Trial
 * Shows premium features and trial offer before accessing the app
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isPremium?: boolean;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'book',
    title: 'Track Your Reading',
    description: 'Keep track of all your books in one place. Log your progress, set reading goals, and build your personal library.',
  },
  {
    id: '2',
    icon: 'flame',
    title: 'Build Reading Streaks',
    description: 'Stay motivated with daily reading streaks. Challenge yourself to read every day and watch your streak grow.',
  },
  {
    id: '3',
    icon: 'bookmark',
    title: 'Save Notes & Highlights',
    description: 'Capture your favorite quotes and thoughts. Never lose an important passage or idea from your reading.',
    isPremium: true,
  },
  {
    id: '4',
    icon: 'stats-chart',
    title: 'Track Your Progress',
    description: 'View detailed reading statistics. See how many books you\'ve read, pages completed, and your reading habits over time.',
    isPremium: true,
  },
  {
    id: '5',
    icon: 'cloud-upload',
    title: 'Sync Across Devices',
    description: 'Your reading data is securely backed up and synced across all your devices. Never lose your progress.',
    isPremium: true,
  },
];

const ONBOARDING_KEY = 'bookbuddy_onboarding_complete';

export default function OnboardingScreen() {
  const router = useRouter();
  const { checkSubscriptionStatus, isPremium } = useSubscriptionStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex]);

  const handleSkip = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  }, [router]);

  const handleStartTrial = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          Alert.alert(
            'Welcome to Premium!',
            'Your 7-day free trial has started. Enjoy all premium features!',
            [{ text: 'Get Started', onPress: () => completeOnboarding() }]
          );
          await checkSubscriptionStatus();
          break;
        case PAYWALL_RESULT.RESTORED:
          Alert.alert(
            'Restored!',
            'Your subscription has been restored.',
            [{ text: 'Continue', onPress: () => completeOnboarding() }]
          );
          await checkSubscriptionStatus();
          break;
        case PAYWALL_RESULT.CANCELLED:
          // User cancelled, stay on onboarding
          break;
        case PAYWALL_RESULT.ERROR:
          Alert.alert('Error', 'Something went wrong. Please try again.');
          break;
      }
    } catch (err) {
      console.error('Trial error:', err);
      Alert.alert('Error', 'Failed to start trial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [checkSubscriptionStatus]);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  }, [router]);

  const handleContinueFree = useCallback(async () => {
    Alert.alert(
      'Continue with Free Plan?',
      'You can upgrade to Premium anytime from Settings to unlock all features.',
      [
        { text: 'Start Trial', onPress: handleStartTrial },
        { text: 'Continue Free', onPress: completeOnboarding, style: 'cancel' },
      ]
    );
  }, [handleStartTrial, completeOnboarding]);

  const renderSlide = useCallback(({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, item.isPremium && styles.premiumIconContainer]}>
        <Ionicons name={item.icon} size={64} color={item.isPremium ? '#F59E0B' : '#1F2937'} />
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
      {item.isPremium && (
        <View style={styles.premiumTag}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.premiumTagText}>Premium Feature</Text>
        </View>
      )}
    </View>
  ), []);

  const renderPagination = useCallback(() => (
    <View style={styles.pagination}>
      {ONBOARDING_SLIDES.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  ), [scrollX]);

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />

      {renderPagination()}

      <View style={styles.footer}>
        {isLastSlide ? (
          <>
            <View style={styles.trialInfo}>
              <Ionicons name="gift" size={24} color="#F59E0B" />
              <View style={styles.trialTextContainer}>
                <Text style={styles.trialTitle}>Start Your 7-Day Free Trial</Text>
                <Text style={styles.trialSubtitle}>
                  Unlock all premium features. Cancel anytime.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.trialButton, isLoading && styles.buttonDisabled]}
              onPress={handleStartTrial}
              disabled={isLoading}
              accessibilityLabel="Start free trial"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="rocket" size={20} color="#FFFFFF" />
                  <Text style={styles.trialButtonText}>Start Free Trial</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueFree}
              accessibilityLabel="Continue with free plan"
            >
              <Text style={styles.continueButtonText}>Continue with Free Plan</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By starting a trial, you agree to our Terms of Service.
              Subscription auto-renews after trial unless cancelled.
            </Text>
          </>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            accessibilityLabel="Next slide"
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  skipButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  slide: {
    width,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  premiumIconContainer: {
    backgroundColor: '#FEF3C7',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  premiumTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 6,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  trialTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  trialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  trialSubtitle: {
    fontSize: 14,
    color: '#B45309',
    marginTop: 2,
  },
  trialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trialButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
