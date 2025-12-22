import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  dateAdded: string;
  dateStarted?: string;
  dateFinished?: string;
  category: string;
  rating?: number;
}

interface Note {
  id: string;
  bookId: string;
  content: string;
  page: number;
  createdAt: string;
  updatedAt: string;
}

interface Highlight {
  id: string;
  bookId: string;
  text: string;
  page: number;
  color: string;
  createdAt: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  time: string;
  days: number[];
  enabled: boolean;
}

interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  books: Book[];
  notes: Note[];
  highlights: Highlight[];
  reminders: Reminder[];
  readingStreak: ReadingStreak;
  loading: boolean;
  error: string | null;

  setUser: (user: User | null) => Promise<void>;
  setBooks: (books: Book[]) => void;
  addBook: (book: Omit<Book, 'id' | 'dateAdded' | 'progress'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  updateBookProgress: (id: string, currentPage: number) => void;
  
  setNotes: (notes: Note[]) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  
  setHighlights: (highlights: Highlight[]) => void;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  deleteHighlight: (id: string) => void;
  
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  
  updateReadingStreak: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  reset: () => void;
}

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

const initialState = {
  isAuthenticated: false,
  user: null,
  books: [],
  notes: [],
  highlights: [],
  reminders: [],
  readingStreak: {
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null,
  },
  loading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: async (user) => {
        if (user) {
          await saveToSecureStore('user_data', JSON.stringify(user));
        } else {
          await deleteFromSecureStore('user_data');
        }
        set({ user, isAuthenticated: !!user });
      },

      setBooks: (books) => set({ books }),

      addBook: (book) => {
        const newBook: Book = {
          ...book,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          dateAdded: new Date().toISOString(),
          progress: 0,
        };
        set((state) => ({ books: [...state.books, newBook] }));
      },

      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id ? { ...book, ...updates } : book
          ),
        }));
      },

      deleteBook: (id) => {
        set((state) => ({
          books: state.books.filter((book) => book.id !== id),
          notes: state.notes.filter((note) => note.bookId !== id),
          highlights: state.highlights.filter((highlight) => highlight.bookId !== id),
        }));
      },

      updateBookProgress: (id, currentPage) => {
        set((state) => ({
          books: state.books.map((book) => {
            if (book.id === id) {
              const progress = Math.min(100, Math.round((currentPage / book.totalPages) * 100));
              const updates: Partial<Book> = {
                currentPage,
                progress,
              };
              if (progress === 100 && !book.dateFinished) {
                updates.dateFinished = new Date().toISOString();
              }
              if (!book.dateStarted && currentPage > 0) {
                updates.dateStarted = new Date().toISOString();
              }
              return { ...book, ...updates };
            }
            return book;
          }),
        }));
        get().updateReadingStreak();
      },

      setNotes: (notes) => set({ notes }),

      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
      },

      updateNote: (id, content) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, content, updatedAt: new Date().toISOString() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      setHighlights: (highlights) => set({ highlights }),

      addHighlight: (highlight) => {
        const newHighlight: Highlight = {
          ...highlight,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ highlights: [...state.highlights, newHighlight] }));
      },

      deleteHighlight: (id) => {
        set((state) => ({
          highlights: state.highlights.filter((highlight) => highlight.id !== id),
        }));
      },

      setReminders: (reminders) => set({ reminders }),

      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({ reminders: [...state.reminders, newReminder] }));
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, ...updates } : reminder
          ),
        }));
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        }));
      },

      toggleReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
          ),
        }));
      },

      updateReadingStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { readingStreak } = get();
        
        if (readingStreak.lastReadDate === today) {
          return;
        }

        const lastDate = readingStreak.lastReadDate
          ? new Date(readingStreak.lastReadDate)
          : null;
        const todayDate = new Date(today);

        if (!lastDate) {
          set({
            readingStreak: {
              currentStreak: 1,
              longestStreak: 1,
              lastReadDate: today,
            },
          });
          return;
        }

        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          const newStreak = readingStreak.currentStreak + 1;
          set({
            readingStreak: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, readingStreak.longestStreak),
              lastReadDate: today,
            },
          });
        } else if (diffDays > 1) {
          set({
            readingStreak: {
              currentStreak: 1,
              longestStreak: readingStreak.longestStreak,
              lastReadDate: today,
            },
          });
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      logout: async () => {
        await deleteFromSecureStore('auth_token');
        await deleteFromSecureStore('user_data');
        set(initialState);
      },

      restoreSession: async () => {
        const token = await loadFromSecureStore('auth_token');
        const userData = await loadFromSecureStore('user_data');
        if (token && userData) {
          set({ user: JSON.parse(userData), isAuthenticated: true });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'bookbuddy-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        books: state.books,
        notes: state.notes,
        highlights: state.highlights,
        reminders: state.reminders,
        readingStreak: state.readingStreak,
      }),
    }
  )
);

export default useAppStore;
