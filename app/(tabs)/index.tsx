import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, Book } from '../../src/stores/appStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { useAuthStore } from '../../src/stores/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isPremium } = useSubscriptionStore();
  const {
    books,
    readingStreak,
    readingGoal,
    isLoading: loading,
    error,
    fetchBooks,
    syncAll,
  } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  // Filter books by status
  const currentlyReading = books.filter(b => b.status === 'reading');
  const toRead = books.filter(b => b.status === 'to_read');
  const finishedThisYear = books.filter(b => {
    if (!b.date_finished) return false;
    return new Date(b.date_finished).getFullYear() === new Date().getFullYear();
  });

  const fetchData = useCallback(async () => {
    await fetchBooks();
  }, [fetchBooks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncAll();
    setRefreshing(false);
  }, [syncAll]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleCardPress = (id: string) => {
    router.push(`/book/${id}`);
  };

  const handleAddBook = () => {
    router.push('/book/add');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setLoading(true);
              fetchData();
            }}
            accessibilityLabel="Retry loading data"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F59E0B']}
            tintColor="#F59E0B"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>BookBuddy</Text>
          <Text style={styles.subtitle}>Your Reading Journey</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{readingStreak.current_streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="book" size={28} color="#60A5FA" />
            <Text style={styles.statValue}>{finishedThisYear.length}</Text>
            <Text style={styles.statLabel}>Books This Year</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="library" size={28} color="#34D399" />
            <Text style={styles.statValue}>{books.length}</Text>
            <Text style={styles.statLabel}>Total Books</Text>
          </View>
        </View>

        {/* Premium Banner for Free Users */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push('/subscription')}
          >
            <View style={styles.premiumBannerContent}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumBannerSubtitle}>Unlimited books, notes & more</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#D97706" />
          </TouchableOpacity>
        )}

        {/* Currently Reading Section */}
        {currentlyReading.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currently Reading</Text>
            {currentlyReading.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.card}
                onPress={() => handleCardPress(book.id)}
                accessibilityLabel={`${book.title} by ${book.author}`}
                accessibilityRole="button"
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${book.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{book.progress}%</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* To Read Section */}
        {toRead.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Up Next</Text>
            {toRead.slice(0, 3).map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.card}
                onPress={() => handleCardPress(book.id)}
                accessibilityLabel={`${book.title} by ${book.author}`}
                accessibilityRole="button"
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.cardAuthor} numberOfLines={1}>{book.author}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {books.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Books Yet</Text>
            <Text style={styles.emptyText}>Start your reading journey by adding your first book</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddBook}
              accessibilityLabel="Add your first book"
              accessibilityRole="button"
            >
              <Text style={styles.addButtonText}>Add Book</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating Add Button */}
        {books.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddBook}
            accessibilityLabel="Add a new book"
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  content: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 16 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 16, 
    color: '#EF4444', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  retryButton: { 
    backgroundColor: '#F59E0B', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  retryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  header: {
    marginBottom: 24
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24
  },
  addButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumBannerText: {
    marginLeft: 12,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  premiumBannerSubtitle: {
    fontSize: 14,
    color: '#B45309',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  cardsContainer: {
    gap: 12
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44
  },
  cardContent: {
    flex: 1,
    marginRight: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  cardAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 40,
    textAlign: 'right'
  }
});
