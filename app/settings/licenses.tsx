import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface License {
  name: string;
  version: string;
  license: string;
  repository?: string;
  description: string;
}

const licenses: License[] = [
  {
    name: 'React Native',
    version: '0.81.4',
    license: 'MIT',
    repository: 'https://github.com/facebook/react-native',
    description: 'A framework for building native apps using React',
  },
  {
    name: 'Expo',
    version: '54.0.0',
    license: 'MIT',
    repository: 'https://github.com/expo/expo',
    description: 'Platform for making universal native apps with React',
  },
  {
    name: 'Expo Router',
    version: '6.0.10',
    license: 'MIT',
    repository: 'https://github.com/expo/router',
    description: 'File-based routing for React Native and web',
  },
  {
    name: 'Zustand',
    version: '5.0.3',
    license: 'MIT',
    repository: 'https://github.com/pmndrs/zustand',
    description: 'Small, fast and scalable bearbones state-management',
  },
  {
    name: '@supabase/supabase-js',
    version: '2.47.10',
    license: 'MIT',
    repository: 'https://github.com/supabase/supabase-js',
    description: 'Isomorphic JavaScript client for Supabase',
  },
  {
    name: 'React Native Purchases',
    version: '9.6.9',
    license: 'MIT',
    repository: 'https://github.com/RevenueCat/react-native-purchases',
    description: 'Cross-platform in-app purchases and subscriptions',
  },
  {
    name: '@tanstack/react-query',
    version: '5.74.4',
    license: 'MIT',
    repository: 'https://github.com/TanStack/query',
    description: 'Powerful data fetching and caching for React',
  },
  {
    name: 'Expo Notifications',
    version: '0.31.0',
    license: 'MIT',
    repository: 'https://github.com/expo/expo',
    description: 'Push notifications API for Expo',
  },
  {
    name: 'React Native Gesture Handler',
    version: '2.28.0',
    license: 'MIT',
    repository: 'https://github.com/software-mansion/react-native-gesture-handler',
    description: 'Native-driven gesture management APIs',
  },
  {
    name: 'React Native Reanimated',
    version: '4.1.1',
    license: 'MIT',
    repository: 'https://github.com/software-mansion/react-native-reanimated',
    description: 'React Native animation library',
  },
  {
    name: 'React Native SVG',
    version: '15.15.0',
    license: 'MIT',
    repository: 'https://github.com/react-native-svg/react-native-svg',
    description: 'SVG library for React Native',
  },
  {
    name: '@shopify/flash-list',
    version: '2.0.2',
    license: 'MIT',
    repository: 'https://github.com/Shopify/flash-list',
    description: 'Fast and performant React Native list component',
  },
  {
    name: 'NativeWind',
    version: '4.2.1',
    license: 'MIT',
    repository: 'https://github.com/marklawlor/nativewind',
    description: 'Use Tailwind CSS with React Native',
  },
  {
    name: 'Moti',
    version: '0.30.0',
    license: 'MIT',
    repository: 'https://github.com/nandorojo/moti',
    description: 'Declarative animations for React Native',
  },
  {
    name: 'React Hook Form',
    version: '7.56.1',
    license: 'MIT',
    repository: 'https://github.com/react-hook-form/react-hook-form',
    description: 'Performant form validation library',
  },
  {
    name: 'Zod',
    version: '3.24.3',
    license: 'MIT',
    repository: 'https://github.com/colinhacks/zod',
    description: 'TypeScript-first schema validation',
  },
  {
    name: 'Axios',
    version: '1.8.4',
    license: 'MIT',
    repository: 'https://github.com/axios/axios',
    description: 'Promise based HTTP client',
  },
  {
    name: '@expo/vector-icons',
    version: '15.0.2',
    license: 'MIT',
    repository: 'https://github.com/expo/vector-icons',
    description: 'Popular icon sets bundled as React Native components',
  },
  {
    name: 'AsyncStorage',
    version: '2.1.0',
    license: 'MIT',
    repository: 'https://github.com/react-native-async-storage/async-storage',
    description: 'Asynchronous key-value storage system',
  },
  {
    name: 'Expo Secure Store',
    version: '15.0.0',
    license: 'MIT',
    repository: 'https://github.com/expo/expo',
    description: 'Secure key-value storage using Keychain/Keystore',
  },
];

export default function LicensesScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const openRepository = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          BookBuddy is built with the following open source libraries. We are grateful to the
          maintainers and contributors of these projects.
        </Text>

        <View style={styles.licenseList}>
          {licenses.map((license, index) => (
            <View key={index} style={styles.licenseItem}>
              <TouchableOpacity
                style={styles.licenseHeader}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <View style={styles.licenseInfo}>
                  <Text style={styles.licenseName}>{license.name}</Text>
                  <View style={styles.licenseMeta}>
                    <Text style={styles.licenseVersion}>v{license.version}</Text>
                    <View style={styles.licenseBadge}>
                      <Text style={styles.licenseBadgeText}>{license.license}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {expandedIndex === index && (
                <View style={styles.licenseDetails}>
                  <Text style={styles.licenseDescription}>{license.description}</Text>
                  {license.repository && (
                    <TouchableOpacity
                      style={styles.repoButton}
                      onPress={() => openRepository(license.repository!)}
                    >
                      <Ionicons name="logo-github" size={18} color="#F59E0B" />
                      <Text style={styles.repoButtonText}>View Repository</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>MIT License</Text>
          <Text style={styles.footerText}>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this
            software and associated documentation files (the "Software"), to deal in the Software
            without restriction, including without limitation the rights to use, copy, modify,
            merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
            permit persons to whom the Software is furnished to do so, subject to the following
            conditions:
          </Text>
          <Text style={styles.footerText}>
            The above copyright notice and this permission notice shall be included in all copies
            or substantial portions of the Software.
          </Text>
          <Text style={styles.footerText}>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE AND NONINFRINGEMENT.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  intro: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  licenseList: {
    marginBottom: 24,
  },
  licenseItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  licenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  licenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  licenseVersion: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  licenseBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  licenseBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  licenseDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  licenseDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  repoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repoButtonText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 12,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
});
