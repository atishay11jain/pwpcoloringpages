-- Coloring Pages Database Schema
-- Run with: wrangler d1 execute coloring-pages-db --remote --file=./migrations/0001_initial_schema.sql

-- Main coloring pages table
CREATE TABLE IF NOT EXISTS coloring_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Category relationship
  category_id TEXT NOT NULL,              -- Primary category (foreign key)
  possible_categories TEXT,               -- JSON array of additional category IDs for cross-listing

  -- Page details
  difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
  age_range TEXT,                         -- e.g., '3-5 years', '6-12 years', 'All ages'

  -- Preview images (R2 keys for thumbnails shown in listings)
  bw_preview TEXT,                        -- Black & white version preview thumbnail
  color_preview TEXT,                     -- Color version preview thumbnail

  is_popular BOOLEAN DEFAULT FALSE,       -- Popular/trending pages

  -- SEO metadata
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,                     -- Comma-separated keywords

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,

  -- Foreign key constraint
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Coloring books table
CREATE TABLE IF NOT EXISTS coloring_books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_key TEXT,                   -- R2 key for book cover
  buy_url TEXT,
  status TEXT CHECK(status IN ('coming_soon', 'available', 'out_of_stock')) DEFAULT 'coming_soon',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for coloring_pages performance
CREATE INDEX IF NOT EXISTS idx_pages_category ON coloring_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON coloring_pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_popular ON coloring_pages(is_popular);

CREATE INDEX IF NOT EXISTS idx_books_status ON coloring_books(status);


-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,              -- URL-friendly identifier (e.g., 'animals', 'disney')
  description TEXT,                       -- Category description for display
  title TEXT NOT NULL,                    -- Display title (can be different from name)

  -- SEO metadata
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT,

  -- Status and ordering
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,           -- For custom ordering in UI

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_published ON categories(is_published);
