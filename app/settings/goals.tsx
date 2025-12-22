import React, { useState, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

export default function GoalsScreen() {
  const [goals, setGoals] = useState({
    dailyGoal: '3',
    weeklyGoal: '10',
    monthlyGoal: '30',
  });

  const handleSave = useCallback(() => {
    Keyboard.dismiss();
    Alert.alert('Success', 'Your goals have been updated!');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>
            Set your goals to stay motivated and track your progress.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals</Text>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="star-outline" size={24} color="#F59E0B" />
                <Text style={styles.goalTitle}>Daily Goal</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.dailyGoal}
                  onChangeText={(text) =>
                    setGoals({ ...goals, dailyGoal: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="3"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>items</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>Set a daily target</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
                <Text style={styles.goalTitle}>Weekly Goal</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.weeklyGoal}
                  onChangeText={(text) =>
                    setGoals({ ...goals, weeklyGoal: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="10"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>items</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>Set a weekly target</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="trophy-outline" size={24} color="#F59E0B" />
                <Text style={styles.goalTitle}>Monthly Goal</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.monthlyGoal}
                  onChangeText={(text) =>
                    setGoals({ ...goals, monthlyGoal: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>items</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>Set a monthly target</Text>
            </View>

          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Goals</Text>
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
