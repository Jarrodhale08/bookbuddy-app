import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL environment variable is required');
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  category: string;
  difficulty: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  order: number;
  duration: number;
  completed: boolean;
}

interface Note {
  id: string;
  bookId: string;
  chapterId: string;
  content: string;
  highlight: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface Progress {
  id: string;
  bookId: string;
  userId: string;
  chaptersCompleted: number;
  totalChapters: number;
  percentage: number;
  currentChapterId: string;
  lastAccessedAt: string;
  streakDays: number;
}

interface Reminder {
  id: string;
  userId: string;
  bookId?: string;
  title: string;
  message: string;
  scheduledAt: string;
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferences: {
    dailyGoal: number;
    reminderEnabled: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Token retrieval failed:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          try {
            await SecureStore.deleteItemAsync('auth_token');
          } catch (e) {
            console.warn('Failed to delete auth token:', e);
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const responseData = error.response.data as Record<string, unknown>;
      return {
        message: (responseData?.message as string) || error.message || 'An error occurred',
        code: (responseData?.code as string) || 'API_ERROR',
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        message: 'No response from server',
        code: 'NETWORK_ERROR',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'Request failed',
        code: 'REQUEST_ERROR',
        status: 0,
      };
    }
  }

  async getAll<T>(endpoint: string): Promise<T[]> {
    const response = await this.client.get<T[]>(endpoint);
    return response.data;
  }

  async getById<T>(endpoint: string, id: string): Promise<T> {
    const response = await this.client.get<T>(`${endpoint}/${id}`);
    return response.data;
  }

  async create<T>(endpoint: string, data: Partial<T>): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async update<T>(endpoint: string, id: string, data: Partial<T>): Promise<T> {
    const response = await this.client.put<T>(`${endpoint}/${id}`, data);
    return response.data;
  }

  async delete(endpoint: string, id: string): Promise<void> {
    await this.client.delete(`${endpoint}/${id}`);
  }

  async getPaginated<T>(endpoint: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  async getBooks(category?: string, difficulty?: string): Promise<Book[]> {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    
    const response = await this.client.get<Book[]>('/books', { params });
    return response.data;
  }

  async getBookById(id: string): Promise<Book> {
    return this.getById<Book>('/books', id);
  }

  async getChaptersByBook(bookId: string): Promise<Chapter[]> {
    const response = await this.client.get<Chapter[]>(`/books/${bookId}/chapters`);
    return response.data;
  }

  async getChapterById(bookId: string, chapterId: string): Promise<Chapter> {
    const response = await this.client.get<Chapter>(`/books/${bookId}/chapters/${chapterId}`);
    return response.data;
  }

  async markChapterComplete(bookId: string, chapterId: string): Promise<Progress> {
    const response = await this.client.post<Progress>(`/books/${bookId}/chapters/${chapterId}/complete`);
    return response.data;
  }

  async getProgress(bookId: string): Promise<Progress> {
    const response = await this.client.get<Progress>(`/progress/${bookId}`);
    return response.data;
  }

  async getAllProgress(): Promise<Progress[]> {
    const response = await this.client.get<Progress[]>('/progress');
    return response.data;
  }

  async getNotesByBook(bookId: string): Promise<Note[]> {
    const response = await this.client.get<Note[]>(`/books/${bookId}/notes`);
    return response.data;
  }

  async getNotesByChapter(bookId: string, chapterId: string): Promise<Note[]> {
    const response = await this.client.get<Note[]>(`/books/${bookId}/chapters/${chapterId}/notes`);
    return response.data;
  }

  async createNote(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const response = await this.client.post<Note>('/notes', data);
    return response.data;
  }

  async updateNote(id: string, data: Partial<Note>): Promise<Note> {
    return this.update<Note>('/notes', id, data);
  }

  async deleteNote(id: string): Promise<void> {
    return this.delete('/notes', id);
  }

  async getReminders(): Promise<Reminder[]> {
    const response = await this.client.get<Reminder[]>('/reminders');
    return response.data;
  }

  async createReminder(data: Omit<Reminder, 'id' | 'createdAt'>): Promise<Reminder> {
    const response = await this.client.post<Reminder>('/reminders', data);
    return response.data;
  }

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder> {
    return this.update<Reminder>('/reminders', id, data);
  }

  async deleteReminder(id: string): Promise<void> {
    return this.delete('/reminders', id);
  }

  async toggleReminder(id: string, enabled: boolean): Promise<Reminder> {
    const response = await this.client.patch<Reminder>(`/reminders/${id}/toggle`, { enabled });
    return response.data;
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/users/profile');
    return response.data;
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.client.put<UserProfile>('/users/profile', data);
    return response.data;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const response = await this.client.get<Book[]>('/books/search', {
      params: { q: query },
    });
    return response.data;
  }

  async uploadAvatar(imageData: string): Promise<{ avatarUrl: string }> {
    const response = await this.client.post<{ avatarUrl: string }>('/users/avatar', {
      image: imageData,
    });
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
