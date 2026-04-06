/**
 * Cloudflare D1 Database Client
 *
 * This module provides a wrapper for interacting with Cloudflare D1 database
 * via the REST API. For production, consider using Cloudflare Workers bindings
 * for better performance.
 */

const D1_API_URL = 'https://api.cloudflare.com/client/v4/accounts';

interface D1Config {
  accountId: string;
  databaseId: string;
  apiToken: string;
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: {
    changes: number;
    duration: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
}

interface D1Response<T = Record<string, unknown>> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: D1Result<T>[];
}

function getConfig(): D1Config {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      'Missing Cloudflare D1 configuration. Required env vars: ' +
      'CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN'
    );
  }

  return { accountId, databaseId, apiToken };
}

/**
 * Execute a SQL query against D1
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const config = getConfig();
  const url = `${D1_API_URL}/${config.accountId}/d1/database/${config.databaseId}/query`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`D1 query failed: ${error}`);
  }

  const data: D1Response<T> = await response.json();

  if (!data.success) {
    throw new Error(`D1 query error: ${data.errors.map(e => e.message).join(', ')}`);
  }

  return data.result[0]?.results ?? [];
}

/**
 * Execute multiple SQL statements in a batch
 */
export async function batch(
  statements: Array<{ sql: string; params?: (string | number | boolean | null)[] }>
): Promise<D1Result[]> {
  const config = getConfig();
  const url = `${D1_API_URL}/${config.accountId}/d1/database/${config.databaseId}/batch`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statements.map(s => ({ sql: s.sql, params: s.params ?? [] }))),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`D1 batch failed: ${error}`);
  }

  const data: D1Response = await response.json();

  if (!data.success) {
    throw new Error(`D1 batch error: ${data.errors.map(e => e.message).join(', ')}`);
  }

  return data.result;
}

// ============================================================================
// Coloring Pages Queries
// ============================================================================

export interface ColoringPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string;
  possible_categories: string | null;  // JSON array of additional category IDs
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  age_range: string | null;
  bw_preview: string | null;
  color_preview: string | null;
  is_popular: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  rating_sum: number;
  rating_count: number;
  printing_tips: string | null;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  intro_text: string | null;
  related_categories: string | null;
  is_published: boolean;
  sort_order: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomeFAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonalSpotlight {
  id: string;
  heading: string;
  category_slug: string;
  page_ids: string; // JSON array string
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteStats {
  totalPages: number;
  totalCategories: number;
  totalDownloads: number;
}

export interface CategoryWithCount extends Category {
  count: number;
}

export interface ColoringBook {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_key: string | null;
  amazon_url: string | null;
  price: number | null;
  page_count: number | null;
  status: 'coming_soon' | 'available' | 'out_of_stock';
  is_featured: boolean;
  show_on_homepage: boolean;
  sort_order: number;
  rating: number | null;
  rating_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get paginated coloring pages with optional filters
 */
export async function getColoringPages(options: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  categorySlug?: string;
  type?: 'bw' | 'color';
  popular?: boolean;
  search?: string;
  ageRange?: string;
} = {}): Promise<PaginatedResult<ColoringPage>> {
  const {
    page = 1,
    pageSize = 12,
    categoryId,
    categorySlug,
    type,
    popular,
    search,
    ageRange,
  } = options;

  const offset = (page - 1) * pageSize;
  const conditions: string[] = [];
  const params: (string | number | boolean)[] = [];

  if (categoryId) {
    conditions.push('category_id = ?');
    params.push(categoryId);
  } else if (categorySlug) {
    // Join with categories table to filter by slug
    conditions.push('category_id IN (SELECT id FROM categories WHERE slug = ?)');
    params.push(categorySlug);
  }

  if (type) {
    // Filter based on which preview exists
    if (type === 'bw') {
      conditions.push('bw_preview IS NOT NULL');
    } else if (type === 'color') {
      conditions.push('color_preview IS NOT NULL');
    }
  }

  if (popular !== undefined) {
    conditions.push('is_popular = ?');
    params.push(popular ? 1 : 0);
  }

  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (ageRange) {
    conditions.push('age_range = ?');
    params.push(ageRange);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countSql = `SELECT COUNT(*) as total FROM coloring_pages ${whereClause}`;
  const countResult = await query<{ total: number }>(countSql, params);
  const total = countResult[0]?.total ?? 0;

  // Get paginated data — sort_order first (lower = earlier), then popular, then newest
  const dataSql = `
    SELECT * FROM coloring_pages
    ${whereClause}
    ORDER BY sort_order ASC, is_popular DESC, updated_at DESC
    LIMIT ? OFFSET ?
  `;
  const data = await query<ColoringPage>(dataSql, [...params, pageSize, offset]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a single coloring page by slug
 */
export async function getColoringPageBySlug(slug: string): Promise<ColoringPage | null> {
  const sql = `SELECT * FROM coloring_pages WHERE slug = ? LIMIT 1`;
  const results = await query<ColoringPage>(sql, [slug]);
  return results[0] ?? null;
}

// ============================================================================
// Coloring Page Assets Queries
// ============================================================================

export interface ColoringPageAsset {
  id: string;
  coloring_page_id: string;
  mode: 'bw' | 'color';
  thumbnail_url: string | null;
  jpeg_url: string | null;
  pdf_url: string | null;
}

export interface ColoringPageWithAssets extends ColoringPage {
  assets: ColoringPageAsset[];
}

/**
 * Get a single coloring page by slug with its assets
 */
export async function getColoringPageWithAssets(slug: string): Promise<ColoringPageWithAssets | null> {
  // First get the coloring page
  const page = await getColoringPageBySlug(slug);

  if (!page) {
    return null;
  }

  // Then get all assets for this page
  const assetsSql = `
    SELECT * FROM coloring_page_assets
    WHERE coloring_page_id = ?
    ORDER BY mode ASC
  `;
  const assets = await query<ColoringPageAsset>(assetsSql, [page.id]);

  return {
    ...page,
    assets,
  };
}

/**
 * Get all published categories from categories table with coloring page counts
 */
export async function getPublishedCategoriesWithCount(): Promise<CategoryWithCount[]> {
  const sql = `
    SELECT
      c.*,
      COUNT(cp.id) as count
    FROM categories c
    LEFT JOIN coloring_pages cp ON c.id = cp.category_id
    WHERE c.is_published = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `;
  return query<CategoryWithCount>(sql);
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const sql = `SELECT * FROM categories WHERE slug = ? AND is_published = 1 LIMIT 1`;
  const results = await query<Category>(sql, [slug]);
  return results[0] ?? null;
}

/**
 * Get a single published category by slug with its coloring page count
 */
export async function getCategoryWithCount(slug: string): Promise<CategoryWithCount | null> {
  const sql = `
    SELECT c.*, COUNT(cp.id) as count
    FROM categories c
    LEFT JOIN coloring_pages cp ON c.id = cp.category_id
    WHERE c.slug = ? AND c.is_published = 1
    GROUP BY c.id
    LIMIT 1
  `;
  const results = await query<CategoryWithCount>(sql, [slug]);
  return results[0] ?? null;
}

/**
 * Get related categories by their IDs (for Related Categories section)
 */
export async function getRelatedCategories(ids: string[]): Promise<CategoryWithCount[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(', ');
  const sql = `
    SELECT c.*, COUNT(cp.id) as count
    FROM categories c
    LEFT JOIN coloring_pages cp ON c.id = cp.category_id
    WHERE c.id IN (${placeholders}) AND c.is_published = 1
    GROUP BY c.id
    LIMIT 6
  `;
  return query<CategoryWithCount>(sql, ids);
}

/**
 * Get popular pages
 */
export async function getPopularPages(limit: number = 10): Promise<ColoringPage[]> {
  const sql = `
    SELECT * FROM coloring_pages
    WHERE is_popular = 1
    ORDER BY updated_at DESC
    LIMIT ?
  `;
  return query<ColoringPage>(sql, [limit]);
}

// ============================================================================
// Coloring Books Queries
// ============================================================================

/**
 * Get all coloring books
 */
export async function getColoringBooks(options: {
  homepage?: boolean;
  status?: 'coming_soon' | 'available' | 'out_of_stock';
} = {}): Promise<ColoringBook[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options.homepage !== undefined) {
    conditions.push('show_on_homepage = ?');
    params.push(options.homepage ? 1 : 0);
  }

  if (options.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT * FROM coloring_books
    ${whereClause}
    ORDER BY sort_order ASC, updated_at DESC
  `;
  return query<ColoringBook>(sql, params);
}

/**
 * Get a single coloring book by slug
 */
export async function getColoringBookBySlug(slug: string): Promise<ColoringBook | null> {
  const sql = `SELECT * FROM coloring_books WHERE slug = ? LIMIT 1`;
  const results = await query<ColoringBook>(sql, [slug]);
  return results[0] ?? null;
}

// ============================================================================
// Admin Queries
// ============================================================================

/**
 * Create a new coloring page
 */
export async function createColoringPage(page: {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category_id: string;
  possible_categories?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  age_range?: string;
  bw_preview?: string;
  color_preview?: string;
  is_popular?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}): Promise<void> {
  const sql = `
    INSERT INTO coloring_pages (
      id, title, slug, description, category_id,
      possible_categories, difficulty, age_range,
      bw_preview, color_preview, is_popular,
      meta_title, meta_description, meta_keywords
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query(sql, [
    page.id,
    page.title,
    page.slug,
    page.description ?? null,
    page.category_id,
    page.possible_categories ?? null,
    page.difficulty ?? null,
    page.age_range ?? null,
    page.bw_preview ?? null,
    page.color_preview ?? null,
    page.is_popular ? 1 : 0,
    page.meta_title ?? null,
    page.meta_description ?? null,
    page.meta_keywords ?? null,
  ]);
}

/**
 * Update a coloring page
 */
export async function updateColoringPage(
  id: string,
  updates: Partial<Omit<ColoringPage, 'id'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const sql = `UPDATE coloring_pages SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete a coloring page
 */
export async function deleteColoringPage(id: string): Promise<void> {
  await query('DELETE FROM coloring_pages WHERE id = ?', [id]);
}

/**
 * Create a new coloring book
 */
export async function createColoringBook(book: {
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image_key?: string;
  amazon_url?: string;
  price?: number;
  page_count?: number;
  status?: 'coming_soon' | 'available' | 'out_of_stock';
  is_featured?: boolean;
  show_on_homepage?: boolean;
  sort_order?: number;
}): Promise<void> {
  const sql = `
    INSERT INTO coloring_books (
      id, title, slug, description, cover_image_key, amazon_url,
      price, page_count, status, is_featured, show_on_homepage, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query(sql, [
    book.id,
    book.title,
    book.slug,
    book.description ?? null,
    book.cover_image_key ?? null,
    book.amazon_url ?? null,
    book.price ?? null,
    book.page_count ?? null,
    book.status ?? 'coming_soon',
    book.is_featured ? 1 : 0,
    book.show_on_homepage ? 1 : 0,
    book.sort_order ?? 0,
  ]);
}

/**
 * Update a coloring book
 */
export async function updateColoringBook(
  id: string,
  updates: Partial<Omit<ColoringBook, 'id' | 'created_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const sql = `UPDATE coloring_books SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete a coloring book
 */
export async function deleteColoringBook(id: string): Promise<void> {
  await query('DELETE FROM coloring_books WHERE id = ?', [id]);
}

// ============================================================================
// Categories Admin Queries
// ============================================================================

/**
 * Create a new category
 */
export async function createCategory(category: {
  id: string;
  name: string;
  slug: string;
  description?: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  is_published?: boolean;
  sort_order?: number;
}): Promise<void> {
  const sql = `
    INSERT INTO categories (
      id, name, slug, description, title,
      meta_title, meta_description, keywords,
      is_published, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query(sql, [
    category.id,
    category.name,
    category.slug,
    category.description ?? null,
    category.title,
    category.meta_title ?? null,
    category.meta_description ?? null,
    category.keywords ?? null,
    category.is_published !== false ? 1 : 0,
    category.sort_order ?? 0,
  ]);
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id' | 'created_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  await query('DELETE FROM categories WHERE id = ?', [id]);
}

/**
 * Get all categories (including unpublished) for admin
 */
export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const sql = `SELECT * FROM categories ORDER BY sort_order ASC, name ASC`;
  return query<Category>(sql);
}

/**
 * Get a single category by ID (for admin)
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const sql = `SELECT * FROM categories WHERE id = ? LIMIT 1`;
  const results = await query<Category>(sql, [id]);
  return results[0] ?? null;
}

// ============================================================================
// Admin Users Queries
// ============================================================================

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
}

/**
 * Get an admin user by username
 */
export async function getAdminUser(username: string): Promise<AdminUser | null> {
  const sql = `SELECT * FROM admin_users WHERE username = ? LIMIT 1`;
  const results = await query<AdminUser>(sql, [username]);
  return results[0] ?? null;
}

/**
 * Create a new admin user
 */
export async function createAdminUser(user: {
  id: string;
  username: string;
  password_hash: string;
}): Promise<void> {
  const sql = `
    INSERT INTO admin_users (id, username, password_hash)
    VALUES (?, ?, ?)
  `;
  await query(sql, [user.id, user.username, user.password_hash]);
}

/**
 * Update an admin user
 */
export async function updateAdminUser(
  id: string,
  updates: Partial<Omit<AdminUser, 'id'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return;

  values.push(id);

  const sql = `UPDATE admin_users SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete an admin user
 */
export async function deleteAdminUser(id: string): Promise<void> {
  await query('DELETE FROM admin_users WHERE id = ?', [id]);
}

/**
 * Get all admin users
 */
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const sql = `SELECT * FROM admin_users ORDER BY username ASC`;
  return query<AdminUser>(sql);
}

// ============================================================================
// Download Tracking
// ============================================================================

// ============================================================================
// Site Stats
// ============================================================================

/**
 * Get aggregate site statistics
 */
export async function getSiteStats(): Promise<SiteStats> {
  const rows = await query<{ totalPages: number; totalCategories: number }>(`
    SELECT
      (SELECT COUNT(*) FROM coloring_pages)                        AS totalPages,
      (SELECT COUNT(*) FROM categories WHERE is_published = 1)     AS totalCategories
  `);
  const row = rows[0];
  return {
    totalPages: Number(row?.totalPages ?? 0),
    totalCategories: Number(row?.totalCategories ?? 0),
    totalDownloads: 0,
  };
}

// ============================================================================
// Recently Added
// ============================================================================

/**
 * Get recently added/updated coloring pages
 */
export async function getRecentColoringPages(limit: number = 8): Promise<ColoringPage[]> {
  const sql = `
    SELECT * FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY updated_at DESC) AS rn
      FROM coloring_pages
      ORDER BY updated_at DESC
      LIMIT 40
    )
    WHERE rn <= 2
    ORDER BY updated_at DESC
    LIMIT ?
  `;
  return query<ColoringPage>(sql, [limit]);
}

// ============================================================================
// Home FAQs
// ============================================================================

/**
 * Get published home FAQs ordered by sort_order
 */
export async function getHomeFAQs(): Promise<HomeFAQ[]> {
  const sql = `
    SELECT * FROM home_faqs
    WHERE is_published = 1
    ORDER BY sort_order ASC
  `;
  return query<HomeFAQ>(sql);
}

/**
 * Get all home FAQs for admin
 */
export async function getAllHomeFAQsAdmin(): Promise<HomeFAQ[]> {
  const sql = `SELECT * FROM home_faqs ORDER BY sort_order ASC`;
  return query<HomeFAQ>(sql);
}

/**
 * Get a single home FAQ by ID
 */
export async function getHomeFAQById(id: string): Promise<HomeFAQ | null> {
  const results = await query<HomeFAQ>('SELECT * FROM home_faqs WHERE id = ? LIMIT 1', [id]);
  return results[0] ?? null;
}

/**
 * Create a home FAQ
 */
export async function createHomeFAQ(faq: {
  id: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_published?: boolean;
}): Promise<void> {
  await query(
    `INSERT INTO home_faqs (id, question, answer, sort_order, is_published) VALUES (?, ?, ?, ?, ?)`,
    [faq.id, faq.question, faq.answer, faq.sort_order ?? 0, faq.is_published !== false ? 1 : 0]
  );
}

/**
 * Update a home FAQ
 */
export async function updateHomeFAQ(
  id: string,
  updates: Partial<Omit<HomeFAQ, 'id' | 'created_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
    }
  });

  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await query(`UPDATE home_faqs SET ${fields.join(', ')} WHERE id = ?`, values);
}

/**
 * Delete a home FAQ
 */
export async function deleteHomeFAQ(id: string): Promise<void> {
  await query('DELETE FROM home_faqs WHERE id = ?', [id]);
}

// ============================================================================
// Seasonal Spotlights
// ============================================================================

/**
 * Get the active seasonal spotlight
 */
export async function getActiveSeasonalSpotlight(): Promise<SeasonalSpotlight | null> {
  const results = await query<SeasonalSpotlight>(
    'SELECT * FROM seasonal_spotlights WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 1'
  );
  return results[0] ?? null;
}

/**
 * Get all seasonal spotlights for admin
 */
export async function getAllSeasonalSpotlightsAdmin(): Promise<SeasonalSpotlight[]> {
  return query<SeasonalSpotlight>('SELECT * FROM seasonal_spotlights ORDER BY sort_order ASC');
}

/**
 * Get a single seasonal spotlight by ID
 */
export async function getSeasonalSpotlightById(id: string): Promise<SeasonalSpotlight | null> {
  const results = await query<SeasonalSpotlight>(
    'SELECT * FROM seasonal_spotlights WHERE id = ? LIMIT 1',
    [id]
  );
  return results[0] ?? null;
}

/**
 * Create a seasonal spotlight
 */
export async function createSeasonalSpotlight(spotlight: {
  id: string;
  heading: string;
  category_slug: string;
  page_ids: string;
  is_active?: boolean;
  sort_order?: number;
}): Promise<void> {
  await query(
    `INSERT INTO seasonal_spotlights (id, heading, category_slug, page_ids, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      spotlight.id,
      spotlight.heading,
      spotlight.category_slug,
      spotlight.page_ids,
      spotlight.is_active ? 1 : 0,
      spotlight.sort_order ?? 0,
    ]
  );
}

/**
 * Update a seasonal spotlight
 */
export async function updateSeasonalSpotlight(
  id: string,
  updates: Partial<Omit<SeasonalSpotlight, 'id' | 'created_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
    }
  });

  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await query(`UPDATE seasonal_spotlights SET ${fields.join(', ')} WHERE id = ?`, values);
}

/**
 * Delete a seasonal spotlight
 */
export async function deleteSeasonalSpotlight(id: string): Promise<void> {
  await query('DELETE FROM seasonal_spotlights WHERE id = ?', [id]);
}

/**
 * Get related coloring pages in the same category, excluding the current page
 */
export async function getRelatedColoringPages(
  categoryId: string,
  excludeId: string,
  limit: number = 6
): Promise<ColoringPage[]> {
  const sql = `
    SELECT * FROM coloring_pages
    WHERE category_id = ? AND id != ?
    ORDER BY is_popular DESC, updated_at DESC
    LIMIT ?
  `;
  return query<ColoringPage>(sql, [categoryId, excludeId, limit]);
}

/**
 * Submit a star rating for a coloring page (with duplicate-vote check via ip_hash)
 */
export async function submitPageRating(
  pageId: string,
  rating: number,
  ipHash: string
): Promise<{ isDuplicate: boolean; newSum: number; newCount: number }> {
  const existing = await query<{ id: string }>(
    'SELECT id FROM page_votes WHERE coloring_page_id = ? AND ip_hash = ? LIMIT 1',
    [pageId, ipHash]
  );

  if (existing.length > 0) {
    return { isDuplicate: true, newSum: 0, newCount: 0 };
  }

  const voteId = crypto.randomUUID();
  await query(
    'INSERT INTO page_votes (id, coloring_page_id, ip_hash, created_at) VALUES (?, ?, ?, ?)',
    [voteId, pageId, ipHash, new Date().toISOString()]
  );

  await query(
    'UPDATE coloring_pages SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE id = ?',
    [rating, pageId]
  );

  const updated = await query<{ rating_sum: number; rating_count: number }>(
    'SELECT rating_sum, rating_count FROM coloring_pages WHERE id = ? LIMIT 1',
    [pageId]
  );

  return {
    isDuplicate: false,
    newSum: updated[0]?.rating_sum ?? 0,
    newCount: updated[0]?.rating_count ?? 0,
  };
}

/**
 * Record a download event
 */
export async function recordDownload(
  coloringPageId: string,
  format: 'jpeg' | 'pdf',
  ipHash?: string,
  userAgent?: string,
  referer?: string
): Promise<void> {
  const sql = `
    INSERT INTO downloads (coloring_page_id, format, ip_hash, user_agent, referer)
    VALUES (?, ?, ?, ?, ?)
  `;
  await query(sql, [
    coloringPageId,
    format,
    ipHash ?? null,
    userAgent ?? null,
    referer ?? null,
  ]);
}

// ============================================================================
// Category FAQs (public read)
// ============================================================================

export interface PublicCategoryFAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

/**
 * Get published FAQs for a category (used for FAQPage JSON-LD schema)
 */
export async function getPublishedCategoryFAQs(categoryId: string): Promise<PublicCategoryFAQ[]> {
  const sql = `
    SELECT id, question, answer, sort_order
    FROM category_faqs
    WHERE category_id = ? AND is_published = 1
    ORDER BY sort_order ASC, id ASC
  `;
  return query<PublicCategoryFAQ>(sql, [categoryId]);
}
