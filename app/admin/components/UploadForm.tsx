'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  title: string;
  slug: string;
}

interface UploadFormProps {
  onSuccess?: () => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [bwFile, setBwFile] = useState<File | null>(null);
  const [bwPreview, setBwPreview] = useState<string | null>(null);
  const [colorFile, setColorFile] = useState<File | null>(null);
  const [colorPreview, setColorPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [possibleCategories, setPossibleCategories] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');
  const [ageRange, setAgeRange] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [printingTips, setPrintingTips] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [generatePdf, setGeneratePdf] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bwDragActive, setBwDragActive] = useState(false);
  const [colorDragActive, setColorDragActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const bwFileInputRef = useRef<HTMLInputElement>(null);
  const colorFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFileSelect = useCallback((selectedFile: File, type: 'bw' | 'color') => {
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError('Please select a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);

    if (type === 'bw') {
      setBwFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBwPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setColorFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setColorPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }

    // Auto-fill title and slug from filename
    if (!title && type === 'bw') {
      const name = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const formattedTitle = name.charAt(0).toUpperCase() + name.slice(1);
      setTitle(formattedTitle);

      // Generate slug from filename
      const generatedSlug = selectedFile.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'bw' | 'color') => {
    e.preventDefault();
    if (type === 'bw') {
      setBwDragActive(false);
    } else {
      setColorDragActive(false);
    }

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile, type);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent, type: 'bw' | 'color') => {
    e.preventDefault();
    if (type === 'bw') {
      setBwDragActive(true);
    } else {
      setColorDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, type: 'bw' | 'color') => {
    e.preventDefault();
    if (type === 'bw') {
      setBwDragActive(false);
    } else {
      setColorDragActive(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!bwFile && !colorFile) {
      setError('Please select at least one image file (B&W or Color)');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!slug.trim()) {
      setError('Please enter a slug');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      // Append both files if available
      if (bwFile) {
        formData.append('bw_file', bwFile);
      }
      if (colorFile) {
        formData.append('color_file', colorFile);
      }

      formData.append('title', title.trim());
      formData.append('slug', slug.trim());
      formData.append('category_id', categoryId);

      // Parse comma-separated category IDs
      const categoryIds = possibleCategories
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
      formData.append('possible_categories', JSON.stringify(categoryIds));

      formData.append('description', description.trim());
      formData.append('difficulty', difficulty);
      formData.append('age_range', ageRange.trim());
      formData.append('meta_title', metaTitle.trim());
      formData.append('meta_description', metaDescription.trim());
      formData.append('printing_tips', printingTips.trim());
      formData.append('is_popular', String(isPopular));
      formData.append('sort_order', String(sortOrder));
      formData.append('generatePdf', String(generatePdf));

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(`Successfully uploaded "${data.page.title}"`);

      // Reset form
      setBwFile(null);
      setBwPreview(null);
      setColorFile(null);
      setColorPreview(null);
      setTitle('');
      setSlug('');
      setCategoryId('');
      setPossibleCategories('');
      setDescription('');
      setDifficulty('');
      setAgeRange('');
      setMetaTitle('');
      setMetaDescription('');
      setPrintingTips('');
      setIsPopular(false);
      setSortOrder(0);

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = (type: 'bw' | 'color') => {
    if (type === 'bw') {
      setBwFile(null);
      setBwPreview(null);
      if (bwFileInputRef.current) {
        bwFileInputRef.current.value = '';
      }
    } else {
      setColorFile(null);
      setColorPreview(null);
      if (colorFileInputRef.current) {
        colorFileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
          Image Files
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Upload at least one image. Both will be processed into thumbnail, preview, JPEG, and PDF formats.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Black & White Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Black & White Image
            </label>

            {!bwPreview ? (
              <div
                onDrop={(e) => handleDrop(e, 'bw')}
                onDragOver={(e) => handleDragOver(e, 'bw')}
                onDragLeave={(e) => handleDragLeave(e, 'bw')}
                onClick={() => bwFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  bwDragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <svg
                  className="w-10 h-10 mx-auto text-gray-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 text-sm mb-1">
                  Drop B&W image or click
                </p>
                <p className="text-gray-500 text-xs">
                  JPEG, PNG, WebP (max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                  <Image
                    src={bwPreview}
                    alt="B&W Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => clearFile('bw')}
                  className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-center text-gray-400 mt-2 text-xs">
                  {bwFile?.name} ({((bwFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            <input
              ref={bwFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'bw')}
              className="hidden"
            />
          </div>

          {/* Color Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color Image
            </label>

            {!colorPreview ? (
              <div
                onDrop={(e) => handleDrop(e, 'color')}
                onDragOver={(e) => handleDragOver(e, 'color')}
                onDragLeave={(e) => handleDragLeave(e, 'color')}
                onClick={() => colorFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  colorDragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <svg
                  className="w-10 h-10 mx-auto text-gray-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 text-sm mb-1">
                  Drop color image or click
                </p>
                <p className="text-gray-500 text-xs">
                  JPEG, PNG, WebP (max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                  <Image
                    src={colorPreview}
                    alt="Color Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => clearFile('color')}
                  className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-center text-gray-400 mt-2 text-xs">
                  {colorFile?.name} ({((colorFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}

            <input
              ref={colorFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'color')}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
          Basic Information
        </h3>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter coloring page title"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g., unicorn-coloring-page (URL-friendly identifier)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            URL-friendly identifier (lowercase letters, numbers, and hyphens only)
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Primary Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
            Primary Category *
          </label>
          {loadingCategories ? (
            <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
              Loading categories...
            </div>
          ) : (
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Additional Categories */}
        <div>
          <label htmlFor="possibleCategories" className="block text-sm font-medium text-gray-300 mb-2">
            Additional Categorys (Optional)
          </label>
          <input
            type="text"
            id="possibleCategories"
            value={possibleCategories}
            onChange={(e) => setPossibleCategories(e.target.value)}
            placeholder="e.g., cat-id-1, cat-id-2, cat-id-3"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter comma-separated category IDs for cross-listing this page in multiple categories
          </p>
        </div>
      </div>

      {/* Page Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
          Page Details
        </h3>

        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-300 mb-2">
            Sort Order
          </label>
          <input
            type="number"
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            min={0}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Lower numbers appear first within a category. Pages with the same value are ordered by popularity and date.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Difficulty */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Not specified</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Age Range */}
          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-gray-300 mb-2">
              Age Range
            </label>
            <select
              id="ageRange"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">— Select age range —</option>
              <option value="toddler">Toddlers (Ages 1–3)</option>
              <option value="kids">Kids (Ages 4–12)</option>
              <option value="teens">Teens (Ages 13–17)</option>
              <option value="adults">Adults (All ages)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SEO Metadata Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
          SEO Metadata
        </h3>

        {/* Meta Title */}
        <div>
          <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-300 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Custom title for search engines (optional)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Meta Description */}
        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-300 mb-2">
            Meta Description
          </label>
          <textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Description for search engines (optional)"
            rows={2}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Printing Tips */}
        <div>
          <label htmlFor="printingTips" className="block text-sm font-medium text-gray-300 mb-2">
            Printing Tips (Optional)
          </label>
          <textarea
            id="printingTips"
            value={printingTips}
            onChange={(e) => setPrintingTips(e.target.value)}
            placeholder="Custom tips for printing this specific page. Leave blank to use the automatic template."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            Override the automatic printing tips template for this page.
          </p>
        </div>
      </div>

      {/* Options Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
          Options
        </h3>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
            />
            <span className="text-gray-300">Mark as Popular/Trending</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={generatePdf}
              onChange={(e) => setGeneratePdf(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
            />
            <span className="text-gray-300">Generate PDF</span>
          </label>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-300">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isUploading || (!bwFile && !colorFile)}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Coloring Page
          </>
        )}
      </button>
    </form>
  );
}
