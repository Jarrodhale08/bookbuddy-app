import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: December 22, 2024</Text>

        <Text style={styles.intro}>
          Welcome to BookBuddy. By using our app, you agree to these Terms of Service.
          Please read them carefully before using the app.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By downloading, installing, or using BookBuddy ("the App"), you agree to be bound
            by these Terms of Service ("Terms"). If you do not agree to these Terms, please do
            not use the App. We reserve the right to modify these Terms at any time, and your
            continued use of the App constitutes acceptance of any changes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.sectionText}>
            BookBuddy is a personal reading tracker and book management application that allows
            users to catalog their books, track reading progress, set reading goals, discover
            new books, and maintain reading statistics. The App provides both free and premium
            subscription features.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.sectionText}>
            To use certain features of the App, you must create an account. You are responsible
            for maintaining the confidentiality of your account credentials and for all activities
            that occur under your account. You must provide accurate, current, and complete
            information during registration. You must notify us immediately of any unauthorized
            use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.sectionText}>
            You retain ownership of any content you create within the App, including book reviews,
            reading notes, custom shelves, and personal reading lists. By submitting content, you
            grant us a non-exclusive, royalty-free license to use, store, and process this content
            solely for the purpose of providing and improving the App. You are responsible for
            ensuring your content does not violate any third-party rights.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Premium Subscriptions</Text>
          <Text style={styles.sectionText}>
            BookBuddy offers premium features through auto-renewable subscriptions. Subscription
            options include monthly and yearly plans. Payment will be charged to your App Store
            or Google Play account at confirmation of purchase. Subscriptions automatically renew
            unless cancelled at least 24 hours before the end of the current period. You can
            manage and cancel subscriptions in your device's account settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Free Trial</Text>
          <Text style={styles.sectionText}>
            We may offer a free trial period for premium features. If you do not cancel before
            the trial ends, you will be automatically charged for the subscription. Free trials
            are limited to one per user and cannot be combined with other offers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Book Data and ISBN Information</Text>
          <Text style={styles.sectionText}>
            Book metadata, cover images, and ISBN information displayed in the App may be sourced
            from third-party databases and APIs. We do not guarantee the accuracy, completeness,
            or availability of this information. Book covers and descriptions are the intellectual
            property of their respective publishers and rights holders.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Acceptable Use</Text>
          <Text style={styles.sectionText}>
            You agree not to use the App to: violate any applicable laws or regulations; infringe
            upon the intellectual property rights of others; upload malicious code or attempt to
            gain unauthorized access to the App; harass, abuse, or harm other users; use automated
            systems to access the App without permission; or interfere with the proper functioning
            of the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            The App, including its design, features, code, graphics, and content (excluding user
            content and third-party book data), is owned by BookBuddy and protected by copyright,
            trademark, and other intellectual property laws. You may not copy, modify, distribute,
            or create derivative works from any part of the App without our express written permission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Privacy</Text>
          <Text style={styles.sectionText}>
            Your use of the App is also governed by our Privacy Policy, which describes how we
            collect, use, and protect your personal information. By using the App, you consent
            to the practices described in the Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Disclaimers</Text>
          <Text style={styles.sectionText}>
            THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
            EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE,
            OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE DISCLAIM ALL WARRANTIES, INCLUDING
            IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
            DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE APP. OUR TOTAL LIABILITY SHALL NOT
            EXCEED THE AMOUNT YOU PAID FOR THE APP IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Termination</Text>
          <Text style={styles.sectionText}>
            We may suspend or terminate your access to the App at any time, with or without cause
            or notice. Upon termination, your right to use the App will immediately cease. You may
            request deletion of your account and associated data by contacting our support team.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Open Source Software</Text>
          <Text style={styles.sectionText}>
            This App uses open source software licensed under the MIT License, including
            React Native, Expo, Supabase, Zustand, and other libraries. Full license terms
            are available at opensource.org/licenses/MIT.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have any questions about these Terms of Service, please contact us at:{'\n\n'}
            Email: support@bookbuddy.app{'\n'}
            Website: https://bookbuddy.app/support
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using BookBuddy, you acknowledge that you have read, understood, and agree to
            be bound by these Terms of Service.
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
  lastUpdated: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  intro: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 24,
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
  sectionText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 24,
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
