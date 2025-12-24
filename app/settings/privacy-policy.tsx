import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LAST_UPDATED = 'December 24, 2024';
const COMPANY_NAME = 'BookBuddy';
const CONTACT_EMAIL = 'privacy@bookbuddy.app';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/settings')}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} ("we", "our", or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.subTitle}>Personal Information</Text>
          <Text style={styles.paragraph}>
            When you create an account, we may collect:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Email address</Text>
            <Text style={styles.bulletItem}>• Name and display name</Text>
            <Text style={styles.bulletItem}>• Profile picture (optional)</Text>
          </View>

          <Text style={styles.subTitle}>Reading Data</Text>
          <Text style={styles.paragraph}>
            To provide our services, we collect and store:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Books you add to your library</Text>
            <Text style={styles.bulletItem}>• Reading progress and page counts</Text>
            <Text style={styles.bulletItem}>• Book reviews and ratings</Text>
            <Text style={styles.bulletItem}>• Reading goals and statistics</Text>
            <Text style={styles.bulletItem}>• Custom shelves and collections</Text>
          </View>

          <Text style={styles.subTitle}>Usage Data</Text>
          <Text style={styles.paragraph}>
            We automatically collect certain information when you use the App:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Device type and operating system</Text>
            <Text style={styles.bulletItem}>• App usage patterns and features accessed</Text>
            <Text style={styles.bulletItem}>• Crash reports and error logs</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide and maintain the App's functionality</Text>
            <Text style={styles.bulletItem}>• Track your reading progress and statistics</Text>
            <Text style={styles.bulletItem}>• Sync your library across devices</Text>
            <Text style={styles.bulletItem}>• Send push notifications for reading reminders</Text>
            <Text style={styles.bulletItem}>• Improve and optimize the App</Text>
            <Text style={styles.bulletItem}>• Process subscription payments</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely using industry-standard encryption.
            We use Supabase for cloud storage with Row Level Security (RLS) policies to
            ensure your data is only accessible to you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your
            information only in the following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• With service providers who assist in operating the App</Text>
            <Text style={styles.bulletItem}>• To comply with legal obligations</Text>
            <Text style={styles.bulletItem}>• To protect our rights and prevent fraud</Text>
            <Text style={styles.bulletItem}>• With your consent</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.paragraph}>
            We use the following third-party services:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Supabase - Database and authentication</Text>
            <Text style={styles.bulletItem}>• RevenueCat - Subscription management</Text>
            <Text style={styles.bulletItem}>• Open Library / Google Books - Book metadata</Text>
            <Text style={styles.bulletItem}>• Expo - App development and push notifications</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Access your personal data</Text>
            <Text style={styles.bulletItem}>• Correct inaccurate data</Text>
            <Text style={styles.bulletItem}>• Request deletion of your data</Text>
            <Text style={styles.bulletItem}>• Export your reading data</Text>
            <Text style={styles.bulletItem}>• Opt-out of marketing communications</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} is not intended for use by individuals under the age of 13.
            We do not knowingly collect personal information from children.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of
            any changes by posting the new Privacy Policy on this page.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:
          </Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.link}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D5DB',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 4,
  },
  link: {
    fontSize: 15,
    color: '#F59E0B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
