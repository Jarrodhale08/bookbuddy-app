-- ============================================================================
-- BookBuddy Initial Schema
-- Multi-tenant architecture with app_id isolation
-- ============================================================================

-- ============================================================================
-- SHARED TABLES (no app_id - shared across all apps)
-- ============================================================================

-- App Registry - tracks all apps using the shared Supabase project
CREATE TABLE IF NOT EXISTS app_registry (
  app_id TEXT PRIMARY KEY,
  app_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User App Context - links users to apps they've accessed
CREATE TABLE IF NOT EXISTS user_app_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL REFERENCES app_registry(app_id),
  first_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Profiles - user profiles (shared across apps)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APP-ISOLATED TABLES (have app_id column for multi-tenant isolation)
-- ============================================================================

-- User Settings - per-app preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Books - user's book library
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  cover_url TEXT,
  total_pages INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  category TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'to_read' CHECK (status IN ('to_read', 'reading', 'finished', 'dnf')),
  date_added TIMESTAMPTZ DEFAULT NOW(),
  date_started TIMESTAMPTZ,
  date_finished TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Sessions - tracks reading activity
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  pages_read INTEGER NOT NULL,
  duration_minutes INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes - book notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Highlights - text highlights
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  page INTEGER,
  color TEXT DEFAULT '#FBBF24',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Goals - yearly/monthly goals
CREATE TABLE IF NOT EXISTS reading_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  target_books INTEGER DEFAULT 12,
  target_pages INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id, year)
);

-- Reading Streaks - daily reading tracking
CREATE TABLE IF NOT EXISTS reading_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Bookshelves - custom collections
CREATE TABLE IF NOT EXISTS bookshelves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookshelf Items - books in shelves (many-to-many)
CREATE TABLE IF NOT EXISTS bookshelf_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookshelf_id UUID REFERENCES bookshelves(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bookshelf_id, book_id)
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_books_user_app ON books(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(user_id, app_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_book ON notes(book_id);
CREATE INDEX IF NOT EXISTS idx_highlights_book ON highlights(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_app ON reading_sessions(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_bookshelves_user_app ON bookshelves(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_user_app_context_user ON user_app_context(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE app_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_app_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookshelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookshelf_items ENABLE ROW LEVEL SECURITY;

-- App Registry - anyone can read (for app validation)
CREATE POLICY "App registry is viewable by all" ON app_registry
  FOR SELECT USING (true);

-- User App Context - users can manage their own context
CREATE POLICY "Users can view own app context" ON user_app_context
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own app context" ON user_app_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own app context" ON user_app_context
  FOR UPDATE USING (auth.uid() = user_id);

-- Profiles - users can manage their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Settings - users can manage their own settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Books - users can manage their own books
CREATE POLICY "Users can manage own books" ON books
  FOR ALL USING (auth.uid() = user_id);

-- Reading Sessions - users can manage their own sessions
CREATE POLICY "Users can manage own reading sessions" ON reading_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Notes - users can manage their own notes
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

-- Highlights - users can manage their own highlights
CREATE POLICY "Users can manage own highlights" ON highlights
  FOR ALL USING (auth.uid() = user_id);

-- Reading Goals - users can manage their own goals
CREATE POLICY "Users can manage own reading goals" ON reading_goals
  FOR ALL USING (auth.uid() = user_id);

-- Reading Streaks - users can manage their own streaks
CREATE POLICY "Users can manage own reading streaks" ON reading_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Bookshelves - users can manage their own shelves
CREATE POLICY "Users can manage own bookshelves" ON bookshelves
  FOR ALL USING (auth.uid() = user_id);

-- Bookshelf Items - users can manage items in their shelves
CREATE POLICY "Users can manage own bookshelf items" ON bookshelf_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bookshelves
      WHERE bookshelves.id = bookshelf_items.bookshelf_id
      AND bookshelves.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_goals_updated_at BEFORE UPDATE ON reading_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_streaks_updated_at BEFORE UPDATE ON reading_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookshelves_updated_at BEFORE UPDATE ON bookshelves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REGISTER BOOKBUDDY APP
-- ============================================================================

INSERT INTO app_registry (app_id, app_name)
VALUES ('bookbuddy', 'BookBuddy')
ON CONFLICT (app_id) DO NOTHING;
