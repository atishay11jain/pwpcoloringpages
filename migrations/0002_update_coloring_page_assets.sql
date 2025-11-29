-- Migration: Update coloring_page_assets table
-- Run with: wrangler d1 execute coloring-pages-db --remote --file=./migrations/0002_update_coloring_page_assets.sql

-- Drop the existing coloring_page_assets table and recreate with new schema
DROP TABLE IF EXISTS coloring_page_assets;

-- Recreate coloring page assets table (R2 storage links)
CREATE TABLE IF NOT EXISTS coloring_page_assets (
  id TEXT PRIMARY KEY,
  coloring_page_id TEXT NOT NULL,
  mode TEXT CHECK(mode IN ('bw', 'color')) NOT NULL,  -- Black & white or color version

  -- R2 storage URLs/keys
  thumbnail_url TEXT,                     -- Small thumbnail (e.g., 400px for cards)
  jpeg_url TEXT,                          -- High-quality JPEG for download
  pdf_url TEXT,                           -- PDF version for printing

  -- Foreign key constraint
  FOREIGN KEY (coloring_page_id) REFERENCES coloring_pages(id) ON DELETE CASCADE,

  -- Ensure one record per page per mode
  UNIQUE(coloring_page_id, mode)
);

-- Recreate index for coloring_page_assets
CREATE INDEX IF NOT EXISTS idx_assets_page ON coloring_page_assets(coloring_page_id);
