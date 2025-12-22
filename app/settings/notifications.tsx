import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    reminders: true,
    achievements: true,
    weeklyReport: false,
    marketing: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>

          <View style={styles.option}>
            <Ionicons name="notifications-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Enable Notifications</Text>
              <Text style={styles.optionDescription}>Receive push notifications</Text>
            </View>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => toggleSetting('pushEnabled')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.pushEnabled ? '#F59E0B' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <View style={styles.option}>
            <Ionicons name="alarm-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Reminders</Text>
              <Text style={styles.optionDescription}>Daily activity reminders</Text>
            </View>
            <Switch
              value={settings.reminders}
              onValueChange={() => toggleSetting('reminders')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.reminders ? '#F59E0B' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="trophy-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Achievements</Text>
              <Text style={styles.optionDescription}>Goal completion alerts</Text>
            </View>
            <Switch
              value={settings.achievements}
              onValueChange={() => toggleSetting('achievements')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.achievements ? '#F59E0B' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="stats-chart-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Weekly Report</Text>
              <Text style={styles.optionDescription}>Weekly progress summary</Text>
            </View>
            <Switch
              value={settings.weeklyReport}
              onValueChange={() => toggleSetting('weeklyReport')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.weeklyReport ? '#F59E0B' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="megaphone-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Marketing</Text>
              <Text style={styles.optionDescription}>Tips and promotions</Text>
            </View>
            <Switch
              value={settings.marketing}
              onValueChange={() => toggleSetting('marketing')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.marketing ? '#F59E0B' : '#9CA3AF'}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 72,
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
