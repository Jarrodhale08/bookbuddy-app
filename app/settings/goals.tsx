import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/stores/appStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';

export default function GoalsScreen() {
  const router = useRouter();
  const { readingGoal, setReadingGoal, books } = useAppStore();
  const { isPremium } = useSubscriptionStore();

  const currentYear = new Date().getFullYear();
  const finishedThisYear = books.filter(b => {
    if (!b.date_finished) return false;
    return new Date(b.date_finished).getFullYear() === currentYear;
  }).length;

  const [yearlyBooks, setYearlyBooks] = useState(
    readingGoal?.target_books?.toString() || '12'
  );
  const [yearlyPages, setYearlyPages] = useState(
    readingGoal?.target_pages?.toString() || ''
  );
  const [dailyPages, setDailyPages] = useState('30');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (readingGoal) {
      setYearlyBooks(readingGoal.target_books?.toString() || '12');
      setYearlyPages(readingGoal.target_pages?.toString() || '');
    }
  }, [readingGoal]);

  const handleSave = useCallback(async () => {
    Keyboard.dismiss();
    setIsSaving(true);

    try {
      const targetBooks = parseInt(yearlyBooks, 10) || 12;
      const targetPages = yearlyPages ? parseInt(yearlyPages, 10) : undefined;

      await setReadingGoal(targetBooks, targetPages);
      Alert.alert('Success', 'Your reading goals have been saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [yearlyBooks, yearlyPages, setReadingGoal]);

  const progress = readingGoal
    ? Math.min(100, Math.round((finishedThisYear / readingGoal.target_books) * 100))
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>
            Set your reading goals to stay motivated and track your progress throughout the year.
          </Text>

          {/* Progress Card */}
          {readingGoal && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>{currentYear} Progress</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {finishedThisYear} of {readingGoal.target_books} books read
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yearly Goals</Text>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="library-outline" size={24} color="#F59E0B" />
                <Text style={styles.goalTitle}>Books to Read</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={yearlyBooks}
                  onChangeText={(text) => setYearlyBooks(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="12"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>books</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>
                How many books do you want to finish this year?
              </Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="document-text-outline" size={24} color="#F59E0B" />
                <Text style={styles.goalTitle}>Pages to Read</Text>
                {!isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="star" size={12} color="#D97706" />
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </View>
                )}
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, !isPremium && styles.inputDisabled]}
                  value={yearlyPages}
                  onChangeText={(text) => setYearlyPages(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="5000"
                  placeholderTextColor="#9CA3AF"
                  editable={isPremium}
                />
                <Text style={styles.inputUnit}>pages</Text>
              </View>
              <Text style={styles.goalHint}>
                {isPremium
                  ? 'Optional: Set a total page count goal'
                  : 'Upgrade to Premium to set page goals'}
              </Text>
              {!isPremium && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => router.push('/subscription')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Target</Text>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="time-outline" size={24} color="#F59E0B" />
                <Text style={styles.goalTitle}>Daily Reading</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={dailyPages}
                  onChangeText={(text) => setDailyPages(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>pages/day</Text>
              </View>
              <Text style={styles.goalHint}>
                Suggested daily pages to reach your yearly goal
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Goals'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
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
  header: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minHeight: 50,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  inputUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 70,
  },
  doneButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
