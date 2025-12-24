/**
 * Add Book Screen
 * Form to add a new book to the library
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, Book } from '../../src/stores/appStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { isAtLimit } from '../../src/config/premiumFeatures';

export default function AddBookScreen() {
  const router = useRouter();
  const { books, addBook, isLoading } = useAppStore();
  const { isPremium } = useSubscriptionStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<Book['status']>('to_read');

  const categories = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Thriller',
    'Biography',
    'Self-Help',
    'Business',
    'History',
    'Science',
    'Other',
  ];

  const handleSave = useCallback(async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a book title');
      return;
    }
    if (!author.trim()) {
      Alert.alert('Required', 'Please enter the author name');
      return;
    }
    if (!totalPages || parseInt(totalPages, 10) <= 0) {
      Alert.alert('Required', 'Please enter the total number of pages');
      return;
    }

    // Check book limit for free users
    if (!isPremium && isAtLimit('books', books.length, isPremium)) {
      Alert.alert(
        'Book Limit Reached',
        'You\'ve reached the maximum number of books for the free plan. Upgrade to Premium for unlimited books!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }

    const newBook = await addBook({
      title: title.trim(),
      author: author.trim(),
      total_pages: parseInt(totalPages, 10),
      current_page: 0,
      isbn: isbn.trim() || undefined,
      category: category || undefined,
      status,
    });

    if (newBook) {
      Alert.alert('Success', 'Book added to your library!', [
        { text: 'View Book', onPress: () => router.replace(`/book/${newBook.id}`) },
        { text: 'Add Another', onPress: () => {
          setTitle('');
          setAuthor('');
          setTotalPages('');
          setIsbn('');
          setCategory('');
          setStatus('to_read');
        }},
      ]);
    } else {
      Alert.alert('Error', 'Failed to add book. Please try again.');
    }
  }, [title, author, totalPages, isbn, category, status, isPremium, books.length, addBook, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Book</Text>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            accessibilityLabel="Save book"
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Book limit warning for free users */}
          {!isPremium && (
            <View style={styles.limitBanner}>
              <Ionicons name="information-circle" size={20} color="#D97706" />
              <Text style={styles.limitText}>
                {10 - books.length} books remaining on free plan
              </Text>
              <TouchableOpacity onPress={() => router.push('/subscription')}>
                <Text style={styles.upgradeLink}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter book title"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          {/* Author */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
              placeholder="Enter author name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          {/* Total Pages */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Pages *</Text>
            <TextInput
              style={styles.input}
              value={totalPages}
              onChangeText={(text) => setTotalPages(text.replace(/[^0-9]/g, ''))}
              placeholder="Number of pages"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>

          {/* ISBN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ISBN (Optional)</Text>
            <TextInput
              style={styles.input}
              value={isbn}
              onChangeText={setIsbn}
              placeholder="ISBN number"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(category === cat ? '' : cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reading Status</Text>
            <View style={styles.statusContainer}>
              {(['to_read', 'reading', 'finished'] as Book['status'][]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    status === s && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Ionicons
                    name={
                      s === 'to_read'
                        ? 'bookmark-outline'
                        : s === 'reading'
                        ? 'book-outline'
                        : 'checkmark-circle-outline'
                    }
                    size={24}
                    color={status === s ? '#F59E0B' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === s && styles.statusOptionTextActive,
                    ]}
                  >
                    {s === 'to_read' ? 'To Read' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  limitText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
  },
  upgradeLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FEF3C7',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#D97706',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  statusOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 8,
  },
  statusOptionTextActive: {
    color: '#D97706',
  },
  spacer: {
    height: 40,
  },
});
