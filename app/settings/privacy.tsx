import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAppStore from '../../src/stores/appStore';

const PRIVACY_SETTINGS_KEY = 'app_privacy_settings';

export default function PrivacyScreen() {
  const { pets: items, reset } = useAppStore();
  const [settings, setSettings] = useState({ analytics: true, crashReports: true, shareUsageData: false });

  useEffect(() => { loadSettings(); }, []);
  const loadSettings = async () => { try { const s = await AsyncStorage.getItem(PRIVACY_SETTINGS_KEY); if (s) setSettings(JSON.parse(s)); } catch {} };

  const toggleSetting = useCallback(async (key: keyof typeof settings) => {
    const n = { ...settings, [key]: !settings[key] };
    setSettings(n);
    try { await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(n)); } catch {}
  }, [settings]);

  const handleDeleteData = () => {
    Alert.alert('Delete All Data', 'This will permanently delete all your data.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { reset(); await AsyncStorage.clear(); Alert.alert('Deleted'); }}]
    );
  };

  const handleExportData = async () => {
    try { await Share.share({ message: JSON.stringify({ items, settings }, null, 2) }); } catch { Alert.alert('Export Failed'); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection</Text>

          <View style={styles.option}>
            <Ionicons name="analytics-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Analytics</Text>
              <Text style={styles.optionDescription}>Help improve the app with usage data</Text>
            </View>
            <Switch
              value={settings.analytics}
              onValueChange={() => toggleSetting('analytics')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.analytics ? '#F59E0B' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="bug-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Crash Reports</Text>
              <Text style={styles.optionDescription}>Send crash reports to fix bugs</Text>
            </View>
            <Switch
              value={settings.crashReports}
              onValueChange={() => toggleSetting('crashReports')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.crashReports ? '#F59E0B' : '#9CA3AF'}
            />
          </View>

          <View style={styles.option}>
            <Ionicons name="eye-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Personalized Ads</Text>
              <Text style={styles.optionDescription}>Show relevant advertisements</Text>
            </View>
            <Switch
              value={settings.personalizedAds}
              onValueChange={() => toggleSetting('personalizedAds')}
              trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
              thumbColor={settings.personalizedAds ? '#F59E0B' : '#9CA3AF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Ionicons name="download-outline" size={24} color="#F59E0B" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Export My Data</Text>
              <Text style={styles.optionDescription}>Download a copy of your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteData}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: '#EF4444' }]}>Delete All Data</Text>
              <Text style={styles.optionDescription}>Permanently remove your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
