-- Admin Users Table Migration
-- Run with: wrangler d1 execute coloring-pages-db --remote --file=./migrations/0002_admin_users.sql

-- Admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
