import { useEffect, useState } from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link, useSegments, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import "../global.css";
import { useRevenueCatInit } from "../src/hooks/useRevenueCatInit";
import { useNotificationInit } from "../src/hooks/useNotificationInit";
import { useAuthStore } from "../src/stores/authStore";
import { useAppStore } from "../src/stores/appStore";
import { useSubscriptionStore } from "../src/stores/subscriptionStore";

const ONBOARDING_KEY = 'bookbuddy_onboarding_complete';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      onError: (error) => {
        if ("message" in error) {
          console.error(error.message);
        }
      },
    },
  },
});

interface DrawerLinkProps {
  href: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const DrawerLink = ({ href, label, icon, onPress }: DrawerLinkProps) => (
  <Link href={href as any} onPress={onPress} asChild>
    <TouchableOpacity style={styles.drawerItem}>
      <Ionicons name={icon} size={24} color="#F59E0B" style={styles.drawerIcon} />
      <Text style={styles.drawerLabel}>{label}</Text>
    </TouchableOpacity>
  </Link>
);

const RootLayout = () => {
  const segments = useSegments();
  const router = useRouter();
  const currentScreen = segments[segments.length - 1] || "Dashboard";
  const drawerTitle = currentScreen === "(tabs)" ? "Dashboard" :
    currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1);

  // Onboarding check state
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Initialize services
  const { initialize: initAuth, isInitialized: authInitialized } = useAuthStore();
  const { restoreSession } = useAppStore();
  const { isPremium } = useSubscriptionStore();
  useRevenueCatInit();
  useNotificationInit();

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.warn('Failed to check onboarding:', error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  // Initialize auth and restore session on mount
  useEffect(() => {
    initAuth();
    restoreSession();
  }, [initAuth, restoreSession]);

  // Handle onboarding routing
  useEffect(() => {
    if (isCheckingOnboarding || !authInitialized) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password';

    // New users should see onboarding first
    if (!hasCompletedOnboarding && !inOnboarding && !inAuth) {
      router.replace('/onboarding');
    }
  }, [isCheckingOnboarding, authInitialized, hasCompletedOnboarding, segments, router]);

  // Show loading while checking onboarding
  if (isCheckingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={client}>
      <Drawer
        drawerContent={(props) => {
          return (
            <DrawerContentScrollView {...props} style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Ionicons name="apps" size={40} color="#F59E0B" />
                <Text style={styles.appTitle}>BookBuddy</Text>
              </View>

              <View style={styles.drawerItems}>
                <DrawerLink
                  href="/(tabs)/index"
                  label="Home"
                  icon="home"
                  onPress={() => props.navigation.closeDrawer()}
                />
                <DrawerLink
                  href="/(tabs)/profile"
                  label="Profile"
                  icon="person"
                  onPress={() => props.navigation.closeDrawer()}
                />
                <DrawerLink
                  href="/(tabs)/settings"
                  label="Settings"
                  icon="settings"
                  onPress={() => props.navigation.closeDrawer()}
                />
              </View>
            </DrawerContentScrollView>
          );
        }}
        screenOptions={{
          title: drawerTitle,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
          drawerPosition: 'right',
          headerLeft: () => null,
        }}
      />
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  drawerItems: {
    paddingHorizontal: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerIcon: {
    marginRight: 16,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});

export default RootLayout;
