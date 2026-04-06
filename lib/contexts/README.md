# Categories Context - Performance Optimization

## Problem Solved
Previously, every time a user navigated between category pages (e.g., `/free-coloring-pages` → `/spiderman-coloring-pages`), the application would fetch the categories list from the API again. This resulted in:
- Unnecessary API calls
- Slower page transitions
- Increased server load
- Poor user experience

## Solution
Implemented a **React Context + localStorage caching strategy** that:
1. Fetches categories ONCE per session (or every 5 minutes)
2. Caches the result in localStorage with a timestamp
3. Reuses cached data across all page navigations
4. Automatically invalidates after 5 minutes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User visits /free-coloring-pages                           │
│  ↓                                                           │
│  CategoriesProvider checks localStorage                     │
│  ↓                                                           │
│  CACHE MISS → Fetch from /api/categories → Store in cache   │
│  CACHE HIT  → Use cached data (skip API call)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  User navigates to /spiderman-coloring-pages                │
│  ↓                                                           │
│  CategoriesProvider checks localStorage                     │
│  ↓                                                           │
│  CACHE HIT → Use cached data (NO API CALL!)                 │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### In Components
```typescript
import { useCategories } from '@/lib/contexts/CategoriesContext';

function MyComponent() {
  const { categories, loading, totalCount, refetch, clearCache } = useCategories();

  // Categories are automatically cached
  // No need to fetch manually!

  return (
    <div>
      {categories.map(cat => (
        <div key={cat.id}>{cat.name} ({cat.count})</div>
      ))}
    </div>
  );
}
```

### In Admin Operations
After creating, updating, or deleting a category, clear the cache:

```typescript
import { useCategories } from '@/lib/contexts/CategoriesContext';

function AdminCategoryForm() {
  const { clearCache, refetch } = useCategories();

  const handleSave = async (data) => {
    await fetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Clear cache and refetch
    clearCache();
    await refetch();
  };

  return <form onSubmit={handleSave}>...</form>;
}
```

## Cache Invalidation

### Automatic (Time-based)
- Cache expires after **5 minutes**
- Next access will fetch fresh data

### Manual
```typescript
const { clearCache, refetch } = useCategories();

// Just clear cache (next access will fetch)
clearCache();

// Clear and immediately refetch
clearCache();
await refetch();
```

## Performance Benefits

### Before Optimization
```
/free-coloring-pages        → API call to /api/categories
/spiderman-coloring-pages   → API call to /api/categories
/animals-coloring-pages     → API call to /api/categories
Total: 3 API calls
```

### After Optimization
```
/free-coloring-pages        → API call to /api/categories (cached)
/spiderman-coloring-pages   → Use cache (0 API calls)
/animals-coloring-pages     → Use cache (0 API calls)
Total: 1 API call (66% reduction!)
```

## API Response Caching

The categories API also has server-side caching:
```typescript
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

This creates a **two-layer cache**:
1. **Client-side (localStorage)**: 5 minutes
2. **CDN/Server (HTTP cache)**: 5 minutes

Even when client cache expires, the CDN may serve cached data, making it even faster!

## Storage Details

**Cache Key**: `coloring_pages_categories`

**Cache Structure**:
```json
{
  "categories": [...],
  "timestamp": 1704067200000
}
```

**Cache Size**: ~5-10 KB (typical for 20-30 categories)

## When to Clear Cache

1. ✅ After admin creates a category
2. ✅ After admin updates a category
3. ✅ After admin deletes a category
4. ✅ After admin publishes/unpublishes a category
5. ❌ DO NOT clear on every page navigation
6. ❌ DO NOT clear when fetching coloring pages

## Future Enhancements

Consider implementing:
1. **IndexedDB** for larger datasets
2. **Service Worker** caching for offline support
3. **React Query** or **SWR** for more sophisticated caching
4. **Cache versioning** to force updates on deployment
5. **Stale-while-revalidate** pattern for instant UX
