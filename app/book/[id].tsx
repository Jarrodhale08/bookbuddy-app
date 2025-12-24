/**
 * Book Detail Screen
 * Shows book details, reading progress, notes, and highlights
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore, Book, Note, Highlight } from '../../src/stores/appStore';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { isAtLimit, getRemainingCount } from '../../src/config/premiumFeatures';

type TabType = 'overview' | 'notes' | 'highlights';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isPremium } = useSubscriptionStore();
  const {
    books,
    notes,
    highlights,
    fetchNotes,
    fetchHighlights,
    updateBook,
    updateBookProgress,
    deleteBook,
    addNote,
    deleteNote,
    addHighlight,
    deleteHighlight,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [newPageNumber, setNewPageNumber] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePage, setNewNotePage] = useState('');
  const [newHighlightText, setNewHighlightText] = useState('');
  const [newHighlightPage, setNewHighlightPage] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FBBF24');

  const book = useMemo(() => books.find(b => b.id === id), [books, id]);
  const bookNotes = useMemo(() => notes.filter(n => n.book_id === id), [notes, id]);
  const bookHighlights = useMemo(() => highlights.filter(h => h.book_id === id), [highlights, id]);

  const highlightColors = ['#FBBF24', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchNotes(id),
        fetchHighlights(id),
      ]);
    } catch (error) {
      console.error('Failed to load book data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [id]);

  const handleUpdateProgress = async () => {
    if (!book || !newPageNumber) return;

    const page = parseInt(newPageNumber, 10);
    if (isNaN(page) || page < 0 || page > book.total_pages) {
      Alert.alert('Invalid Page', `Please enter a number between 0 and ${book.total_pages}`);
      return;
    }

    await updateBookProgress(book.id, page);
    setShowProgressModal(false);
    setNewPageNumber('');
  };

  const handleAddNote = async () => {
    if (!book || !newNoteContent.trim()) return;

    // Check limits for free users
    if (!isPremium && isAtLimit('notes', bookNotes.length, isPremium)) {
      Alert.alert(
        'Limit Reached',
        'Upgrade to Premium for unlimited notes!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }

    await addNote({
      book_id: book.id,
      content: newNoteContent.trim(),
      page: newNotePage ? parseInt(newNotePage, 10) : undefined,
    });

    setShowNoteModal(false);
    setNewNoteContent('');
    setNewNotePage('');
  };

  const handleAddHighlight = async () => {
    if (!book || !newHighlightText.trim()) return;

    // Check limits for free users
    if (!isPremium && isAtLimit('highlights', bookHighlights.length, isPremium)) {
      Alert.alert(
        'Limit Reached',
        'Upgrade to Premium for unlimited highlights!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }

    await addHighlight({
      book_id: book.id,
      text: newHighlightText.trim(),
      page: newHighlightPage ? parseInt(newHighlightPage, 10) : undefined,
      color: selectedColor,
    });

    setShowHighlightModal(false);
    setNewHighlightText('');
    setNewHighlightPage('');
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNote(noteId) },
      ]
    );
  };

  const handleDeleteHighlight = (highlightId: string) => {
    Alert.alert(
      'Delete Highlight',
      'Are you sure you want to delete this highlight?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHighlight(highlightId) },
      ]
    );
  };

  const handleDeleteBook = () => {
    Alert.alert(
      'Delete Book',
      'Are you sure you want to delete this book? All notes and highlights will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBook(id!);
            router.back();
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus: Book['status']) => {
    if (!book) return;
    await updateBook(book.id, { status: newStatus });
  };

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="book-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorText}>Book not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const notesRemaining = getRemainingCount('notes', bookNotes.length, isPremium);
  const highlightsRemaining = getRemainingCount('highlights', bookHighlights.length, isPremium);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleDeleteBook}
          accessibilityLabel="Delete book"
        >
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview', 'notes', 'highlights'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'notes' && ` (${bookNotes.length})`}
              {tab === 'highlights' && ` (${bookHighlights.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F59E0B']}
            tintColor="#F59E0B"
          />
        }
      >
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            {/* Book Cover Placeholder */}
            <View style={styles.coverContainer}>
              {book.cover_url ? (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="book" size={48} color="#F59E0B" />
                </View>
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="book" size={48} color="#F59E0B" />
                </View>
              )}
            </View>

            {/* Book Info */}
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>by {book.author}</Text>

            {/* Status Badges */}
            <View style={styles.statusContainer}>
              {(['to_read', 'reading', 'finished', 'dnf'] as Book['status'][]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusBadge,
                    book.status === status && styles.statusBadgeActive,
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      book.status === status && styles.statusTextActive,
                    ]}
                  >
                    {status === 'to_read' ? 'To Read' :
                     status === 'dnf' ? 'DNF' :
                     status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>Reading Progress</Text>
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => {
                    setNewPageNumber(book.current_page.toString());
                    setShowProgressModal(true);
                  }}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${book.progress}%` }]} />
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.progressText}>
                  {book.current_page} / {book.total_pages} pages
                </Text>
                <Text style={styles.progressPercent}>{book.progress}%</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
                <Text style={styles.statLabel}>Added</Text>
                <Text style={styles.statValue}>
                  {new Date(book.date_added).toLocaleDateString()}
                </Text>
              </View>
              {book.date_started && (
                <View style={styles.statCard}>
                  <Ionicons name="play-circle-outline" size={24} color="#34D399" />
                  <Text style={styles.statLabel}>Started</Text>
                  <Text style={styles.statValue}>
                    {new Date(book.date_started).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {book.date_finished && (
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#60A5FA" />
                  <Text style={styles.statLabel}>Finished</Text>
                  <Text style={styles.statValue}>
                    {new Date(book.date_finished).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {book.rating && (
                <View style={styles.statCard}>
                  <Ionicons name="star" size={24} color="#FBBF24" />
                  <Text style={styles.statLabel}>Rating</Text>
                  <Text style={styles.statValue}>{book.rating}/5</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'notes' && (
          <View style={styles.notesContainer}>
            {/* Limit Warning for Free Users */}
            {!isPremium && (
              <View style={styles.limitBanner}>
                <Ionicons name="information-circle" size={20} color="#D97706" />
                <Text style={styles.limitText}>
                  {notesRemaining === 'unlimited'
                    ? 'Unlimited notes'
                    : `${notesRemaining} notes remaining`}
                </Text>
                {notesRemaining !== 'unlimited' && (
                  <TouchableOpacity onPress={() => router.push('/subscription')}>
                    <Text style={styles.upgradeLink}>Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNoteModal(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Note</Text>
            </TouchableOpacity>

            {bookNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Notes Yet</Text>
                <Text style={styles.emptyText}>
                  Capture your thoughts and insights as you read
                </Text>
              </View>
            ) : (
              bookNotes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    {note.page && (
                      <Text style={styles.notePage}>Page {note.page}</Text>
                    )}
                    <Text style={styles.noteDate}>
                      {new Date(note.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'highlights' && (
          <View style={styles.highlightsContainer}>
            {/* Limit Warning for Free Users */}
            {!isPremium && (
              <View style={styles.limitBanner}>
                <Ionicons name="information-circle" size={20} color="#D97706" />
                <Text style={styles.limitText}>
                  {highlightsRemaining === 'unlimited'
                    ? 'Unlimited highlights'
                    : `${highlightsRemaining} highlights remaining`}
                </Text>
                {highlightsRemaining !== 'unlimited' && (
                  <TouchableOpacity onPress={() => router.push('/subscription')}>
                    <Text style={styles.upgradeLink}>Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowHighlightModal(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Highlight</Text>
            </TouchableOpacity>

            {bookHighlights.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="color-wand-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Highlights Yet</Text>
                <Text style={styles.emptyText}>
                  Save your favorite quotes and passages
                </Text>
              </View>
            ) : (
              bookHighlights.map((highlight) => (
                <View
                  key={highlight.id}
                  style={[styles.highlightCard, { borderLeftColor: highlight.color }]}
                >
                  <View style={styles.highlightHeader}>
                    {highlight.page && (
                      <Text style={styles.highlightPage}>Page {highlight.page}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteHighlight(highlight.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.highlightText}>"{highlight.text}"</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Progress</Text>
            <Text style={styles.modalSubtitle}>
              Current page (out of {book.total_pages})
            </Text>
            <TextInput
              style={styles.modalInput}
              value={newPageNumber}
              onChangeText={setNewPageNumber}
              keyboardType="number-pad"
              placeholder="Enter page number"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowProgressModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleUpdateProgress}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              placeholder="Write your note..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.modalInput}
              value={newNotePage}
              onChangeText={setNewNotePage}
              keyboardType="number-pad"
              placeholder="Page number (optional)"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleAddNote}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Highlight Modal */}
      <Modal
        visible={showHighlightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHighlightModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Highlight</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={newHighlightText}
              onChangeText={setNewHighlightText}
              placeholder="Enter the highlighted text..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.modalInput}
              value={newHighlightPage}
              onChangeText={setNewHighlightPage}
              keyboardType="number-pad"
              placeholder="Page number (optional)"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.colorPicker}>
              <Text style={styles.colorLabel}>Color:</Text>
              {highlightColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowHighlightModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleAddHighlight}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#F59E0B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overviewContainer: {
    padding: 24,
    alignItems: 'center',
  },
  coverContainer: {
    marginBottom: 24,
  },
  coverPlaceholder: {
    width: 160,
    height: 240,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeActive: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusTextActive: {
    color: '#D97706',
  },
  progressSection: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  updateButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  notesContainer: {
    padding: 16,
  },
  highlightsContainer: {
    padding: 16,
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  noteCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notePage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  highlightCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  highlightPage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  highlightText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#374151',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
