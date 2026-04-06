/**
 * Admin Database Queries for the new schema
 * Handles CRUD operations for Categories, Coloring Pages, and Coloring Books
 */

import { query, batch } from './db';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Type Definitions (matching the new schema)
// ============================================================================

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
  created_at: string;
  updated_at: string;
}

export interface ColoringPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string;
  possible_categories: string | null; // JSON array
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  age_range: string | null;
  bw_preview: string | null;
  color_preview: string | null;
  is_popular: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  printing_tips: string | null;
  updated_at: string;
}

export interface ColoringPageAsset {
  id: string;
  coloring_page_id: string;
  mode: 'bw' | 'color';
  thumbnail_url: string | null;
  jpeg_url: string | null;
  pdf_url: string | null;
}

export interface ColoringBook {
  id: string;
  title: string;
  description: string | null;
  cover_image_key: string | null;
  buy_url: string | null;
  status: 'coming_soon' | 'available' | 'out_of_stock';
  sort_order: number;
  rating: number | null;
  rating_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryFAQ {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

// ============================================================================
// Categories CRUD
// ============================================================================

export async function getAllCategories(): Promise<Category[]> {
  return query<Category>('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const results = await query<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  return results[0] || null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const results = await query<Category>('SELECT * FROM categories WHERE slug = ?', [slug]);
  return results[0] || null;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  intro_text?: string;
  related_categories?: string;
  is_published?: boolean;
  sort_order?: number;
}): Promise<Category> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await query(
    `INSERT INTO categories (
      id, name, slug, description, title, meta_title, meta_description,
      keywords, intro_text, related_categories, is_published, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.slug,
      data.description || null,
      data.title,
      data.meta_title || null,
      data.meta_description || null,
      data.keywords || null,
      data.intro_text || null,
      data.related_categories || null,
      data.is_published !== false ? 1 : 0,
      data.sort_order || 0,
      now,
      now,
    ]
  );

  return (await getCategoryById(id))!;
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteCategory(id: string): Promise<void> {
  // Check for linked coloring pages (ON DELETE RESTRICT in schema)
  const linked = await query<{ count: number }>(
    'SELECT COUNT(*) as count FROM coloring_pages WHERE category_id = ?',
    [id]
  );
  const pageCount = linked[0]?.count ?? 0;
  if (pageCount > 0) {
    throw new Error(
      `Cannot delete category: it has ${pageCount} coloring page${pageCount > 1 ? 's' : ''} assigned to it. Reassign or delete those pages first.`
    );
  }

  await query('DELETE FROM categories WHERE id = ?', [id]);
}

// ============================================================================
// Coloring Pages CRUD
// ============================================================================

export async function getAllColoringPages(options: {
  category_id?: string;
  is_popular?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<{ pages: ColoringPage[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];

  if (options.category_id) {
    conditions.push('category_id = ?');
    params.push(options.category_id);
  }

  if (options.is_popular !== undefined) {
    conditions.push('is_popular = ?');
    params.push(options.is_popular ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query<{ count: number }>(
    `SELECT COUNT(*) as count FROM coloring_pages ${whereClause}`,
    params
  );
  const total = countResult[0]?.count || 0;

  // Get pages
  let sql = `SELECT * FROM coloring_pages ${whereClause} ORDER BY sort_order ASC, updated_at DESC`;
  if (options.limit) {
    sql += ` LIMIT ? OFFSET ?`;
    params.push(options.limit, options.offset || 0);
  }

  const pages = await query<ColoringPage>(sql, params);

  return { pages, total };
}

export async function getColoringPageById(id: string): Promise<ColoringPage | null> {
  const results = await query<ColoringPage>('SELECT * FROM coloring_pages WHERE id = ?', [id]);
  return results[0] || null;
}

export async function getColoringPageBySlug(slug: string): Promise<ColoringPage | null> {
  const results = await query<ColoringPage>('SELECT * FROM coloring_pages WHERE slug = ?', [slug]);
  return results[0] || null;
}

export async function createColoringPage(data: {
  title: string;
  slug: string;
  description?: string;
  category_id: string;
  possible_categories?: string[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  age_range?: string;
  bw_preview?: string;
  color_preview?: string;
  is_popular?: boolean;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  printing_tips?: string;
}): Promise<ColoringPage> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await query(
    `INSERT INTO coloring_pages (
      id, title, slug, description, category_id, possible_categories,
      difficulty, age_range, bw_preview, color_preview, is_popular, sort_order,
      meta_title, meta_description, meta_keywords, printing_tips, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.slug,
      data.description || null,
      data.category_id,
      data.possible_categories ? JSON.stringify(data.possible_categories) : null,
      data.difficulty || null,
      data.age_range || null,
      data.bw_preview || null,
      data.color_preview || null,
      data.is_popular ? 1 : 0,
      data.sort_order ?? 0,
      data.meta_title || null,
      data.meta_description || null,
      data.meta_keywords || null,
      data.printing_tips || null,
      now,
    ]
  );

  return (await getColoringPageById(id))!;
}

export async function updateColoringPage(
  id: string,
  data: Partial<Omit<ColoringPage, 'id' | 'updated_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else if (key === 'possible_categories' && Array.isArray(value)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await query(`UPDATE coloring_pages SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteColoringPage(id: string): Promise<void> {
  // This will cascade delete assets due to foreign key constraint
  await query('DELETE FROM coloring_pages WHERE id = ?', [id]);
}

// ============================================================================
// Coloring Page Assets CRUD
// ============================================================================

export async function getAssetsByPageId(pageId: string): Promise<ColoringPageAsset[]> {
  return query<ColoringPageAsset>(
    'SELECT * FROM coloring_page_assets WHERE coloring_page_id = ?',
    [pageId]
  );
}

export async function getAssetByPageIdAndMode(
  pageId: string,
  mode: 'bw' | 'color'
): Promise<ColoringPageAsset | null> {
  const results = await query<ColoringPageAsset>(
    'SELECT * FROM coloring_page_assets WHERE coloring_page_id = ? AND mode = ?',
    [pageId, mode]
  );
  return results[0] || null;
}

export async function createOrUpdateAsset(data: {
  coloring_page_id: string;
  mode: 'bw' | 'color';
  thumbnail_url?: string;
  jpeg_url?: string;
  pdf_url?: string;
}): Promise<ColoringPageAsset> {
  const existing = await getAssetByPageIdAndMode(data.coloring_page_id, data.mode);

  if (existing) {
    // Update existing asset
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'coloring_page_id' && key !== 'mode') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      values.push(existing.id);
      await query(`UPDATE coloring_page_assets SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    return (await getAssetByPageIdAndMode(data.coloring_page_id, data.mode))!;
  } else {
    // Create new asset
    const id = uuidv4();

    await query(
      `INSERT INTO coloring_page_assets (
        id, coloring_page_id, mode, thumbnail_url, jpeg_url, pdf_url
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.coloring_page_id,
        data.mode,
        data.thumbnail_url || null,
        data.jpeg_url || null,
        data.pdf_url || null,
      ]
    );

    return (await getAssetByPageIdAndMode(data.coloring_page_id, data.mode))!;
  }
}

export async function deleteAsset(id: string): Promise<void> {
  await query('DELETE FROM coloring_page_assets WHERE id = ?', [id]);
}

// ============================================================================
// Coloring Books CRUD
// ============================================================================

export async function getAllColoringBooks(): Promise<ColoringBook[]> {
  return query<ColoringBook>('SELECT * FROM coloring_books ORDER BY sort_order ASC, updated_at DESC');
}

export async function getColoringBookById(id: string): Promise<ColoringBook | null> {
  const results = await query<ColoringBook>('SELECT * FROM coloring_books WHERE id = ?', [id]);
  return results[0] || null;
}

export async function createColoringBook(data: {
  title: string;
  description?: string;
  cover_image_key?: string;
  buy_url?: string;
  status?: 'coming_soon' | 'available' | 'out_of_stock';
  sort_order?: number;
}): Promise<ColoringBook> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await query(
    `INSERT INTO coloring_books (
      id, title, description, cover_image_key, buy_url, status, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.description || null,
      data.cover_image_key || null,
      data.buy_url || null,
      data.status || 'coming_soon',
      data.sort_order || 0,
      now,
      now,
    ]
  );

  return (await getColoringBookById(id))!;
}

export async function updateColoringBook(
  id: string,
  data: Partial<Omit<ColoringBook, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      // Convert boolean to 0/1 for SQLite
      if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    }
  });

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await query(`UPDATE coloring_books SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteColoringBook(id: string): Promise<void> {
  await query('DELETE FROM coloring_books WHERE id = ?', [id]);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return uuidv4();
}

// ============================================================================
// Category FAQs CRUD
// ============================================================================

export async function getCategoryFAQs(categoryId: string): Promise<CategoryFAQ[]> {
  return query<CategoryFAQ>(
    'SELECT * FROM category_faqs WHERE category_id = ? ORDER BY sort_order ASC, id ASC',
    [categoryId]
  );
}

export async function getAllCategoryFAQs(): Promise<(CategoryFAQ & { category_name: string })[]> {
  return query<CategoryFAQ & { category_name: string }>(
    `SELECT cf.*, c.name as category_name
     FROM category_faqs cf
     LEFT JOIN categories c ON cf.category_id = c.id
     ORDER BY c.name ASC, cf.sort_order ASC`
  );
}

export async function getCategoryFAQById(id: string): Promise<CategoryFAQ | null> {
  const results = await query<CategoryFAQ>('SELECT * FROM category_faqs WHERE id = ?', [id]);
  return results[0] || null;
}

export async function createCategoryFAQ(data: {
  category_id: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_published?: boolean;
}): Promise<CategoryFAQ> {
  const id = uuidv4();

  await query(
    `INSERT INTO category_faqs (
      id, category_id, question, answer, sort_order, is_published
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.category_id,
      data.question,
      data.answer,
      data.sort_order || 0,
      data.is_published !== false ? 1 : 0,
    ]
  );

  return (await getCategoryFAQById(id))!;
}

export async function updateCategoryFAQ(
  id: string,
  data: Partial<Omit<CategoryFAQ, 'id'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    }
  });

  if (fields.length === 0) return;

  values.push(id);

  await query(`UPDATE category_faqs SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteCategoryFAQ(id: string): Promise<void> {
  await query('DELETE FROM category_faqs WHERE id = ?', [id]);
}
