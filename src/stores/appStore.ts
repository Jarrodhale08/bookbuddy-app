/**
 * BookBuddy App Store
 * Sync-enabled Zustand store with Supabase backend and local caching
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { supabase, getCurrentUser, initializeAppContext } from '../services/supabase';
import * as db from '../services/database';

// ============================================================================
// TYPES
// ============================================================================

export interface Book {
  id: string;
  user_id?: string;
  title: string;
  author: string;
  isbn?: string;
  cover_url?: string;
  total_pages: number;
  current_page: number;
  progress: number;
  category?: string;
  rating?: number;
  status: 'to_read' | 'reading' | 'finished' | 'dnf';
  date_added: string;
  date_started?: string;
  date_finished?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  user_id?: string;
  book_id: string;
  content: string;
  page?: number;
  created_at: string;
  updated_at: string;
}

export interface Highlight {
  id: string;
  user_id?: string;
  book_id: string;
  text: string;
  page?: number;
  color: string;
  created_at: string;
}

export interface ReadingStreak {
  id?: string;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
}

export interface ReadingGoal {
  id?: string;
  year: number;
  target_books: number;
  target_pages?: number;
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

interface AppState {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;

  // Data
  books: Book[];
  notes: Note[];
  highlights: Highlight[];
  readingStreak: ReadingStreak;
  readingGoal: ReadingGoal | null;

  // Sync state
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingChanges: number;
  error: string | null;

  // Auth actions
  setUser: (user: User | null) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Book actions
  fetchBooks: () => Promise<void>;
  addBook: (book: Omit<Book, 'id' | 'user_id' | 'date_added' | 'progress' | 'created_at' | 'updated_at'>) => Promise<Book | null>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  updateBookProgress: (id: string, currentPage: number) => Promise<void>;

  // Note actions
  fetchNotes: (bookId?: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Note | null>;
  updateNote: (id: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Highlight actions
  fetchHighlights: (bookId?: string) => Promise<void>;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'user_id' | 'created_at'>) => Promise<Highlight | null>;
  deleteHighlight: (id: string) => Promise<void>;

  // Streak actions
  fetchStreak: () => Promise<void>;
  updateReadingStreak: () => Promise<void>;

  // Goal actions
  fetchGoal: (year?: number) => Promise<void>;
  setReadingGoal: (targetBooks: number, targetPages?: number) => Promise<void>;

  // Sync actions
  syncAll: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// SECURE STORE HELPERS
// ============================================================================

const saveToSecureStore = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn(`Failed to save ${key} to SecureStore:`, error);
  }
};

const loadFromSecureStore = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn(`Failed to load ${key} from SecureStore:`, error);
    return null;
  }
};

const deleteFromSecureStore = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`Failed to delete ${key} from SecureStore:`, error);
  }
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  isAuthenticated: false,
  user: null,
  books: [],
  notes: [],
  highlights: [],
  readingStreak: {
    current_streak: 0,
    longest_streak: 0,
    last_read_date: null,
  },
  readingGoal: null,
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  pendingChanges: 0,
  error: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // AUTH ACTIONS
      // ========================================

      setUser: async (user) => {
        if (user) {
          await saveToSecureStore('user_data', JSON.stringify(user));
          await initializeAppContext();
        } else {
          await deleteFromSecureStore('user_data');
        }
        set({ user, isAuthenticated: !!user });

        // Fetch data after login
        if (user) {
          get().syncAll();
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        await deleteFromSecureStore('auth_token');
        await deleteFromSecureStore('user_data');
        set(initialState);
      },

      restoreSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            display_name: session.user.user_metadata?.display_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          };
          set({ user, isAuthenticated: true });
          get().syncAll();
        }
      },

      // ========================================
      // BOOK ACTIONS
      // ========================================

      fetchBooks: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await db.fetchAll<Book>('books', {
            orderBy: { column: 'date_added', ascending: false }
          });

          if (error) throw error;
          set({ books: data || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addBook: async (bookData) => {
        set({ isLoading: true, error: null });
        try {
          const user = await getCurrentUser();
          if (!user) throw new Error('Not authenticated');

          const newBook: Partial<Book> = {
            ...bookData,
            user_id: user.id,
            current_page: bookData.current_page || 0,
            progress: 0,
            status: bookData.status || 'to_read',
            date_added: new Date().toISOString(),
          };

          const { data, error } = await db.create<Book>('books', newBook);
          if (error) throw error;

          if (data) {
            set((state) => ({
              books: [data, ...state.books],
              isLoading: false,
            }));
          }
          return data;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      updateBook: async (id, updates) => {
        try {
          const { error } = await db.update<Book>('books', id, updates);
          if (error) throw error;

          set((state) => ({
            books: state.books.map((book) =>
              book.id === id ? { ...book, ...updates } : book
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      deleteBook: async (id) => {
        try {
          const { error } = await db.remove('books', id);
          if (error) throw error;

          set((state) => ({
            books: state.books.filter((book) => book.id !== id),
            notes: state.notes.filter((note) => note.book_id !== id),
            highlights: state.highlights.filter((highlight) => highlight.book_id !== id),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      updateBookProgress: async (id, currentPage) => {
        const book = get().books.find(b => b.id === id);
        if (!book) return;

        const progress = Math.min(100, Math.round((currentPage / book.total_pages) * 100));
        const updates: Partial<Book> = {
          current_page: currentPage,
          progress,
        };

        if (progress === 100 && !book.date_finished) {
          updates.date_finished = new Date().toISOString();
          updates.status = 'finished';
        }
        if (!book.date_started && currentPage > 0) {
          updates.date_started = new Date().toISOString();
          updates.status = 'reading';
        }

        await get().updateBook(id, updates);
        await get().updateReadingStreak();
      },

      // ========================================
      // NOTE ACTIONS
      // ========================================

      fetchNotes: async (bookId) => {
        try {
          const options: db.QueryOptions = {
            orderBy: { column: 'created_at', ascending: false }
          };
          if (bookId) {
            options.filters = [{ column: 'book_id', operator: 'eq', value: bookId }];
          }
          const { data, error } = await db.fetchAll<Note>('notes', options);
          if (error) throw error;
          set({ notes: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      addNote: async (noteData) => {
        try {
          const user = await getCurrentUser();
          if (!user) throw new Error('Not authenticated');

          const newNote: Partial<Note> = {
            ...noteData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await db.create<Note>('notes', newNote);
          if (error) throw error;

          if (data) {
            set((state) => ({ notes: [data, ...state.notes] }));
          }
          return data;
        } catch (error: any) {
          set({ error: error.message });
          return null;
        }
      },

      updateNote: async (id, content) => {
        try {
          const { error } = await db.update<Note>('notes', id, {
            content,
            updated_at: new Date().toISOString(),
          });
          if (error) throw error;

          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === id
                ? { ...note, content, updated_at: new Date().toISOString() }
                : note
            ),
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      deleteNote: async (id) => {
        try {
          const { error } = await db.remove('notes', id);
          if (error) throw error;
          set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // ========================================
      // HIGHLIGHT ACTIONS
      // ========================================

      fetchHighlights: async (bookId) => {
        try {
          const options: db.QueryOptions = {
            orderBy: { column: 'created_at', ascending: false }
          };
          if (bookId) {
            options.filters = [{ column: 'book_id', operator: 'eq', value: bookId }];
          }
          const { data, error } = await db.fetchAll<Highlight>('highlights', options);
          if (error) throw error;
          set({ highlights: data || [] });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      addHighlight: async (highlightData) => {
        try {
          const user = await getCurrentUser();
          if (!user) throw new Error('Not authenticated');

          const newHighlight: Partial<Highlight> = {
            ...highlightData,
            user_id: user.id,
            created_at: new Date().toISOString(),
          };

          const { data, error } = await db.create<Highlight>('highlights', newHighlight);
          if (error) throw error;

          if (data) {
            set((state) => ({ highlights: [data, ...state.highlights] }));
          }
          return data;
        } catch (error: any) {
          set({ error: error.message });
          return null;
        }
      },

      deleteHighlight: async (id) => {
        try {
          const { error } = await db.remove('highlights', id);
          if (error) throw error;
          set((state) => ({
            highlights: state.highlights.filter((h) => h.id !== id)
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // ========================================
      // STREAK ACTIONS
      // ========================================

      fetchStreak: async () => {
        try {
          const { data, error } = await db.fetchAll<ReadingStreak & { id: string }>('reading_streaks', {
            limit: 1
          });
          if (error) throw error;

          if (data && data.length > 0) {
            set({ readingStreak: data[0] });
          }
        } catch (error: any) {
          console.warn('Failed to fetch streak:', error.message);
        }
      },

      updateReadingStreak: async () => {
        const today = new Date().toISOString().split('T')[0];
        const { readingStreak } = get();

        if (readingStreak.last_read_date === today) {
          return; // Already read today
        }

        let newStreak: ReadingStreak;
        const lastDate = readingStreak.last_read_date
          ? new Date(readingStreak.last_read_date)
          : null;
        const todayDate = new Date(today);

        if (!lastDate) {
          newStreak = {
            current_streak: 1,
            longest_streak: 1,
            last_read_date: today,
          };
        } else {
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            const currentStreak = readingStreak.current_streak + 1;
            newStreak = {
              current_streak: currentStreak,
              longest_streak: Math.max(currentStreak, readingStreak.longest_streak),
              last_read_date: today,
            };
          } else {
            newStreak = {
              current_streak: 1,
              longest_streak: readingStreak.longest_streak,
              last_read_date: today,
            };
          }
        }

        // Update in Supabase
        try {
          const user = await getCurrentUser();
          if (user) {
            await db.upsert('reading_streaks', {
              ...newStreak,
              user_id: user.id,
            }, { onConflict: 'user_id,app_id' });
          }
        } catch (error) {
          console.warn('Failed to sync streak:', error);
        }

        set({ readingStreak: newStreak });
      },

      // ========================================
      // GOAL ACTIONS
      // ========================================

      fetchGoal: async (year) => {
        const targetYear = year || new Date().getFullYear();
        try {
          const { data, error } = await db.fetchAll<ReadingGoal>('reading_goals', {
            filters: [{ column: 'year', operator: 'eq', value: targetYear }],
            limit: 1
          });
          if (error) throw error;
          set({ readingGoal: data?.[0] || null });
        } catch (error: any) {
          console.warn('Failed to fetch goal:', error.message);
        }
      },

      setReadingGoal: async (targetBooks, targetPages) => {
        try {
          const user = await getCurrentUser();
          if (!user) throw new Error('Not authenticated');

          const year = new Date().getFullYear();
          const goal: Partial<ReadingGoal> = {
            year,
            target_books: targetBooks,
            target_pages: targetPages,
          };

          const { data, error } = await db.upsert<ReadingGoal>('reading_goals', {
            ...goal,
            user_id: user.id,
          }, { onConflict: 'user_id,app_id,year' });

          if (error) throw error;
          set({ readingGoal: data });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // ========================================
      // SYNC ACTIONS
      // ========================================

      syncAll: async () => {
        set({ isSyncing: true, error: null });
        try {
          await Promise.all([
            get().fetchBooks(),
            get().fetchNotes(),
            get().fetchHighlights(),
            get().fetchStreak(),
            get().fetchGoal(),
          ]);
          set({
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            pendingChanges: 0,
          });
        } catch (error: any) {
          set({ isSyncing: false, error: error.message });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'bookbuddy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data for offline access
      partialize: (state) => ({
        books: state.books,
        notes: state.notes,
        highlights: state.highlights,
        readingStreak: state.readingStreak,
        readingGoal: state.readingGoal,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

export default useAppStore;
