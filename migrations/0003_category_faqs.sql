-- Category FAQs Schema
-- Run with: wrangler d1 execute coloring-pages-db --remote --file=./migrations/0003_category_faqs.sql

-- Category FAQs table (for category-specific questions and answers)
CREATE TABLE IF NOT EXISTS category_faqs (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Ordering and status
  sort_order INTEGER DEFAULT 0,           -- For ordering FAQs within a category
  is_published BOOLEAN DEFAULT TRUE,

  -- Foreign key constraint
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Indexes for category FAQs
CREATE INDEX IF NOT EXISTS idx_faqs_category ON category_faqs(category_id);
