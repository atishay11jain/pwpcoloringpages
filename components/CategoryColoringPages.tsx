'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ColoringPageCard from '@/components/ColoringPageCard';
// import AdUnit from '@/components/AdUnit'; // TEMP: disabled until AdSense approval
import { useCategories } from '@/lib/contexts/CategoriesContext';

interface ColoringPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  ageRange: string | null;
  images: {
    bwPreview: string | null;
    colorPreview: string | null;
  };
  isPopular: boolean;
}

interface RelatedCategory {
  id: string;
  name: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  count: number;
}

type TabType = 'bw' | 'color';

const AGE_RANGE_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  toddler: { label: 'Toddlers', emoji: '🧸', description: 'Ages 1–3 · Easy toddler coloring pages' },
  kids:    { label: 'Kids',     emoji: '🎨', description: 'Ages 4–12 · Free printable coloring pages for kids' },
  teens:   { label: 'Teens',   emoji: '✨', description: 'Ages 13–17 · Detailed printable art' },
  adults:  { label: 'Adults',  emoji: '🌸', description: 'All ages · Coloring pages for adults PDF' },
};

interface CategoryColoringPagesProps {
  selectedCategorySlug?: string | null;
  ageRange?: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pwpcoloringpages.com';

const GRADIENT_PLACEHOLDERS = [
  'from-pink-500 to-rose-600',
  'from-purple-500 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-orange-500 to-amber-600',
  'from-green-500 to-emerald-600',
  'from-fuchsia-500 to-pink-600',
  'from-indigo-500 to-purple-600',
  'from-teal-500 to-cyan-600',
];

const CATEGORY_ICONS: Record<string, string> = {
  animals: '🦁',
  dinosaur: '🦕',
  unicorn: '🦄',
  princess: '👸',
  halloween: '🎃',
  cars: '🚗',
  cute: '🧸',
  'hello-kitty': '🐱',
  'k-pop': '🎤',
  spring: '🌷',
  summer: '☀️',
};

export default function CategoryColoringPages({ selectedCategorySlug = null, ageRange = null }: CategoryColoringPagesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, loading: categoriesLoading, totalCount } = useCategories();

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const t = searchParams.get('type');
    return t === 'color' ? 'color' : 'bw';
  });
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [relatedCategories, setRelatedCategories] = useState<RelatedCategory[]>([]);
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const [relatedCanScrollLeft, setRelatedCanScrollLeft] = useState(false);
  const [relatedCanScrollRight, setRelatedCanScrollRight] = useState(false);

  const updateRelatedScrollState = useCallback(() => {
    const el = relatedScrollRef.current;
    if (!el) return;
    setRelatedCanScrollLeft(el.scrollLeft > 4);
    setRelatedCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = relatedScrollRef.current;
    if (!el) return;
    updateRelatedScrollState();
    el.addEventListener('scroll', updateRelatedScrollState, { passive: true });
    const ro = new ResizeObserver(updateRelatedScrollState);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateRelatedScrollState); ro.disconnect(); };
  }, [relatedCategories, updateRelatedScrollState]);

  const scrollRelated = (dir: 'left' | 'right') => {
    const el = relatedScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategorySlug) return null;
    return categories.find(c => c.slug === selectedCategorySlug) || null;
  }, [selectedCategorySlug, categories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Fetch related categories when the selected category changes
  useEffect(() => {
    if (!selectedCategorySlug) {
      setRelatedCategories([]);
      return;
    }
    fetch(`/api/categories/${selectedCategorySlug}/related`)
      .then(res => res.json())
      .then(data => setRelatedCategories(data.relatedCategories || []))
      .catch(() => setRelatedCategories([]));
  }, [selectedCategorySlug]);

  const loadPages = useCallback(async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '6',
        type: activeTab,
      });
      if (selectedCategorySlug) {
        params.append('categorySlug', selectedCategorySlug);
      }
      if (ageRange) {
        params.append('ageRange', ageRange);
      }
      const response = await fetch(`/api/pages?${params.toString()}`);
      const data = await response.json();
      if (data.data) {
        if (append) {
          setPages(prev => [...prev, ...data.data]);
        } else {
          setPages(data.data);
        }
        setPagination({
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasMore: data.pagination.hasMore,
        });
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, selectedCategorySlug, ageRange]);

  useEffect(() => {
    loadPages(1);
  }, [loadPages]);

  const loadMore = () => {
    if (pagination.hasMore) {
      loadPages(pagination.page + 1, true);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPagination({ page: 1, total: 0, totalPages: 0, hasMore: false });
    // Persist the selection in the URL so it survives category navigation
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'bw') {
      params.delete('type');
    } else {
      params.set('type', tab);
    }
    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const handleCategorySelect = (categorySlug: string | null) => {
    // Carry the active tab across to the new category URL
    const qs = activeTab === 'color' ? '?type=color' : '';
    if (categorySlug === null) {
      router.push(`/free-coloring-pages${qs}`);
    } else {
      router.push(`/${categorySlug}-coloring-pages${qs}`);
    }
  };

  const pageTitle = selectedCategory
    ? selectedCategory.title
    : 'Browse All Free Printable Coloring Pages';

  const introText = selectedCategory
    ? (selectedCategory.intro_text || `Explore our collection of free printable ${selectedCategory.name} coloring pages — perfect for kids, teens, and adults. Download any design and print at home instantly.`)
    : 'Browse 500+ free printable coloring pages for kids, toddlers, and adults — animals, K-pop, unicorns, dinosaurs, holidays, and more. Easy designs for beginners, detailed sheets for adults. Download print-ready PDF coloring pages instantly. Free, forever — no sign-up required.';

  const faqData = [
    {
      question: selectedCategory
        ? `What are ${selectedCategory.name} coloring pages?`
        : 'What are free printable coloring pages?',
      answer: selectedCategory
        ? `Free printable ${selectedCategory.name} coloring pages are downloadable black-and-white designs featuring ${selectedCategory.name.toLowerCase()} themes. You can download them as a PDF or JPEG and print at home instantly — no sign-up required. Each page is available in both black & white (ready to color) and full color (reference) versions.`
        : 'Free printable coloring pages are downloadable black-and-white designs you can print at home and color with crayons, pencils, or markers. Our library offers 500+ pages across 11+ categories — animals, unicorns, dinosaurs, holidays, and more. Every page downloads as a print-ready PDF or JPEG, completely free.',
    },
    {
      question: 'How do I download and print free coloring pages?',
      answer: 'Click on any coloring page, then click the "Free Download" button. Choose PDF (best for printing on US Letter or A4 paper) or JPEG (best for digital use). Open the file and print on any standard home printer — no special paper or ink required. 100% free, no account needed.',
    },
    {
      question: 'Are these free coloring pages suitable for all ages?',
      answer: 'Yes — our free printable coloring pages cover every age group. We have simple bold-outline pages for toddlers (ages 2–5), fun character pages for kids (ages 6–12), detailed designs for teens, and intricate mandala and nature patterns for adults. Use the age filter on any category page to find the right difficulty level.',
    },
    {
      question: 'Can I use these coloring pages in my classroom or therapy practice?',
      answer: 'Yes — all coloring pages are free to print and use in personal, educational, and therapeutic settings. Teachers, homeschool parents, and therapists are welcome to print and distribute them at no cost. Please do not resell or redistribute the PDF files digitally.',
    },
    {
      question: selectedCategory
        ? `How often do you add new ${selectedCategory.name} coloring pages?`
        : 'How often are new free coloring pages added?',
      answer: selectedCategory
        ? `We add new free printable ${selectedCategory.name} coloring pages regularly. Subscribe to our newsletter to get notified when new ${selectedCategory.name.toLowerCase()} designs are added — delivered free to your inbox every week.`
        : 'We add fresh free printable coloring pages every week, covering seasonal themes, trending characters, animals, holidays, and more. Subscribe to our free newsletter to get new printables delivered to your inbox every Tuesday.',
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Free Coloring Pages', href: '/free-coloring-pages' },
    ...(selectedCategory
      ? [{ name: `${selectedCategory.name} Coloring Pages`, href: `/${selectedCategory.slug}-coloring-pages` }]
      : []),
  ];

  // JSON-LD schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: pageTitle,
    description: introText,
    url: selectedCategory
      ? `${BASE_URL}/${selectedCategory.slug}-coloring-pages`
      : `${BASE_URL}/free-coloring-pages`,
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* JSON-LD: BreadcrumbList + CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="relative pt-6 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm font-dm-sans">
            {breadcrumbItems.map((item, i) => (
              <li key={item.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {i === breadcrumbItems.length - 1 ? (
                  <span className="text-white/50" aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.href} className="text-[#ea1974]/80 hover:text-[#ea1974] transition-colors">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Page Header */}
      <section className="relative pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] h-[200px] bg-[#ea1974]/8 rounded-full blur-[80px]" />
          <div className="absolute top-0 right-1/4 w-[250px] h-[180px] bg-[#58b7da]/6 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-1 rounded-full bg-[#ea1974] opacity-70" style={{ transform: 'rotate(-2deg)' }} />
                <div className="w-5 h-1 rounded-full bg-[#bc25c4] opacity-60" />
                <div className="w-6 h-1 rounded-full bg-[#58b7da] opacity-65" style={{ transform: 'rotate(2deg)' }} />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-fredoka relative">
                <span className="text-white">{pageTitle}</span>
                <svg
                  className="absolute -top-2 -right-4 sm:-right-6 w-5 h-5 sm:w-6 sm:h-6 text-[#58b7da] opacity-70 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" />
                </svg>
              </h1>
            </div>

            {/* B&W / Color Toggle */}
            <div className="relative inline-flex p-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm self-start">
              <button
                onClick={() => handleTabChange('bw')}
                className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-dm-sans font-semibold text-xs sm:text-sm
                  transition-all duration-300 ${activeTab === 'bw'
                    ? 'text-white bg-gradient-to-r from-gray-600 to-gray-700'
                    : 'text-white/50 hover:text-white/70'}`}
              >
                <span className="relative flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
                  </svg>
                  B&W
                </span>
              </button>
              <button
                onClick={() => handleTabChange('color')}
                className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-dm-sans font-semibold text-xs sm:text-sm
                  transition-all duration-300 ${activeTab === 'color'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/70'}`}
                style={activeTab === 'color' ? { background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)' } : {}}
              >
                <span className="relative flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                  Color
                </span>
              </button>
            </div>
          </div>

          {/* Intro paragraph */}
          <p className="text-white/60 text-sm sm:text-base font-dm-sans max-w-3xl leading-relaxed mb-3">
            {introText}
          </p>

          {/* Active age filter badge */}
          {ageRange && AGE_RANGE_LABELS[ageRange] && (
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-dm-sans font-medium bg-white/10 border border-white/20 text-white">
                {AGE_RANGE_LABELS[ageRange].emoji} {AGE_RANGE_LABELS[ageRange].label}
                <span className="text-white/50 text-xs">· {AGE_RANGE_LABELS[ageRange].description}</span>
              </span>
              <button
                onClick={() => router.push('/free-coloring-pages')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-dm-sans text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
                Clear filter
              </button>
            </div>
          )}

          {/* Results count */}
          <p className="text-white/40 text-sm font-dm-sans">
            {loading ? 'Loading...' : `${pagination.total} printable sheets ready to download`}
            {selectedCategory && (
              <span className="ml-2">
                in <span className="text-[#ea1974]">{selectedCategory.name}</span>
              </span>
            )}
            {ageRange && AGE_RANGE_LABELS[ageRange] && (
              <span className="ml-2">
                for <span className="text-[#ea1974]">{AGE_RANGE_LABELS[ageRange].label}</span>
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Main Content - Sidebar + Grid */}
      <section className="relative py-4 sm:py-6">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Categories Sidebar */}
            <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-6 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h2 className="text-lg font-bold font-fredoka text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#ea1974]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                  </svg>
                  Categories
                </h2>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm
                      placeholder-white/30 font-dm-sans focus:outline-none focus:border-[#ea1974]/50 transition-all duration-300"
                  />
                  {categorySearch && (
                    <button
                      onClick={() => setCategorySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Categories List */}
                <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg font-dm-sans text-sm transition-all duration-200
                      ${selectedCategorySlug === null
                        ? 'bg-gradient-to-r from-[#ea1974]/20 to-[#bc25c4]/20 text-white border border-[#ea1974]/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        All Categories
                      </span>
                      <span className="text-xs text-white/40">{totalCount}</span>
                    </span>
                  </button>

                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg font-dm-sans text-sm transition-all duration-200
                        ${selectedCategorySlug === category.slug
                          ? 'bg-gradient-to-r from-[#ea1974]/20 to-[#bc25c4]/20 text-white border border-[#ea1974]/30'
                          : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-xs text-white/40">{category.count}</span>
                      </span>
                    </button>
                  ))}

                  {filteredCategories.length === 0 && categorySearch && (
                    <p className="text-center text-white/40 text-sm py-4 font-dm-sans">
                      No categories found
                    </p>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-white/50 font-dm-sans">Loading coloring pages...</p>
                </div>
              )}

              {!loading && pages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {pages.map((page, index) => {
                    const imageUrl = activeTab === 'bw' ? page.images.bwPreview : page.images.colorPreview;
                    return (
                      <React.Fragment key={page.id}>
                        <ColoringPageCard
                          title={page.title}
                          slug={page.slug}
                          imageUrl={imageUrl || '/placeholder.jpg'}
                          downloadUrl={`/api/download/${page.id}`}
                          delay={index * 0.1}
                          type={activeTab === 'bw' ? 'black-and-white' : 'color'}
                          categoryName={selectedCategory?.name || ''}
                        />
                        {/* Ad: In-Feed after 6th card — Placement C — TEMP: disabled until AdSense approval */}
                        {/*
                        {index === 5 && (
                          <div className="col-span-1 sm:col-span-2 xl:col-span-3">
                            <AdUnit
                              slot="REPLACE_WITH_SLOT_ID_CATEGORY_INFEED"
                              format="fluid"
                              layout="in-feed"
                              reservedHeight={200}
                              lazy={true}
                            />
                          </div>
                        )}
                        */}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {!loading && pagination.hasMore && (
                <div className="flex justify-center mt-14">
                  <button onClick={loadMore} disabled={loadingMore} className="group relative inline-block disabled:opacity-80 disabled:cursor-not-allowed">
                    <div
                      className="absolute -inset-1 translate-x-2 translate-y-2 rounded-xl opacity-50
                        transition-all duration-500 group-hover:translate-x-2.5 group-hover:translate-y-2.5"
                      style={{ background: '#58b7da', clipPath: 'polygon(1% 8%, 99% 1%, 97% 92%, 1% 98%)' }}
                    />
                    <div
                      className="absolute -inset-1 translate-x-1 translate-y-1 rounded-xl opacity-60
                        transition-all duration-400 group-hover:translate-x-1.5 group-hover:translate-y-1.5"
                      style={{ background: '#E83C91', clipPath: 'polygon(0% 6%, 100% 2%, 99% 94%, 1% 97%)' }}
                    />
                    <div
                      className="relative px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)',
                        clipPath: 'polygon(1% 5%, 99% 0%, 98% 95%, 0% 92%)',
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />
                      <span
                        className="relative flex items-center gap-3 font-bold text-white text-sm tracking-wide"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                      >
                        {loadingMore ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            Load More
                            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 left-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-y-1 pointer-events-none">
                      <div className="w-1.5 h-3 rounded-full" style={{ background: 'linear-gradient(to bottom, #ea1974, transparent)' }} />
                      <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #bc25c4, transparent)' }} />
                    </div>
                  </button>
                </div>
              )}

              {!loading && pages.length === 0 && (
                <div className="text-center py-20">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ea1974]/20 to-[#58b7da]/20 animate-pulse" />
                    <div className="absolute inset-2 rounded-full bg-[#0a0a0f] flex items-center justify-center">
                      <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white font-fredoka mb-2">No coloring pages found</h3>
                  <p className="text-white/50 font-dm-sans">
                    {selectedCategorySlug ? 'Try selecting a different category' : 'Check back soon for new content!'}
                  </p>
                  {selectedCategorySlug && (
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className="mt-4 px-4 py-2 text-sm text-[#ea1974] hover:text-white transition-colors font-dm-sans"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories Section */}
      {relatedCategories.length > 0 && (
        <section className="relative py-8 sm:py-10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header row with arrow buttons */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-bold font-fredoka text-white">
                Related Categories
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRelated('left')}
                  disabled={!relatedCanScrollLeft}
                  aria-label="Scroll left"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60
                    hover:bg-white/10 hover:border-white/30 hover:text-white
                    disabled:opacity-25 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollRelated('right')}
                  disabled={!relatedCanScrollRight}
                  aria-label="Scroll right"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60
                    hover:bg-white/10 hover:border-white/30 hover:text-white
                    disabled:opacity-25 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scroll track with edge fade masks */}
            <div className="relative">
              {/* Left fade */}
              <div
                className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to right, #0a0a0f, transparent)',
                  opacity: relatedCanScrollLeft ? 1 : 0,
                }}
              />
              {/* Right fade */}
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to left, #0a0a0f, transparent)',
                  opacity: relatedCanScrollRight ? 1 : 0,
                }}
              />

              {/* Cards row — scrollbar hidden via inline style */}
              <div
                ref={relatedScrollRef}
                className="flex gap-4 overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
              {relatedCategories.map((cat, index) => {
                const gradient = GRADIENT_PLACEHOLDERS[index % GRADIENT_PLACEHOLDERS.length];
                const icon = CATEGORY_ICONS[cat.slug] ?? cat.name.charAt(0).toUpperCase();
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}-coloring-pages`}
                    className="flex-shrink-0 w-40 sm:w-48 group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 bg-[#12121a]"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {cat.thumbnail_url ? (
                        <Image
                          src={cat.thumbnail_url}
                          alt={`${cat.name} Coloring Pages`}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <span className="text-5xl select-none drop-shadow-lg" role="img" aria-label={cat.name}>
                            {icon}
                          </span>
                        </div>
                      )}
                      {/* Overlay gradient for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {/* Page count badge */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold font-dm-sans bg-black/50 backdrop-blur-sm text-white border border-white/20">
                        {cat.count} pages
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="p-3">
                      <h3 className="text-white font-semibold font-fredoka text-base leading-tight group-hover:text-pink-300 transition-colors">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-white/50 text-xs font-dm-sans">
                        <span>Browse all</span>
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section (before FAQ) */}
      {selectedCategory && (
        <section className="relative py-6 sm:py-8">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14]">

              {/* Ambient glows */}
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[90px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(234,25,116,0.12) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-16 right-1/3 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(88,183,218,0.07) 0%, transparent 70%)' }} />

              {/* Left gradient accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                style={{ background: 'linear-gradient(to bottom, #ea1974, #bc25c4 50%, #58b7da)' }}
              />

              {/* Two-column layout */}
              <div className="relative flex flex-col lg:flex-row">

                {/* ── Left: text content ── */}
                <div className="flex-1 pl-8 sm:pl-10 pr-8 sm:pr-10 py-8 sm:py-10">

                  {/* Category label pill */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-dm-sans font-semibold mb-5 border"
                    style={{
                      background: 'rgba(234,25,116,0.08)',
                      borderColor: 'rgba(234,25,116,0.22)',
                      color: '#ea1974',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea1974] animate-pulse" />
                    {selectedCategory.name} · Free Coloring Pages
                  </div>

                  {/* Heading */}
                  <h2 className="text-2xl sm:text-3xl font-bold font-fredoka text-white mb-4 leading-tight">
                    About{' '}
                    <span
                      style={{
                        background: 'linear-gradient(100deg, #ea1974, #bc25c4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {selectedCategory.name}
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-white/60 text-sm sm:text-base font-dm-sans leading-relaxed">
                    {selectedCategory.description ||
                      `Explore our collection of free printable ${selectedCategory.name} coloring pages. Each design is carefully crafted for kids, teens, and adults alike. Download any page and print at home instantly — no sign-up required.`}
                  </p>
                </div>

                {/* Divider — horizontal on mobile, vertical on desktop */}
                <div className="lg:hidden mx-8 sm:mx-10 h-px bg-white/8" />
                <div className="hidden lg:block w-px self-stretch bg-white/8 my-8" />

                {/* ── Right: icon showcase + chips ── */}
                <div className="lg:w-72 xl:w-80 flex flex-col items-center justify-center gap-5 px-8 sm:px-10 py-8 sm:py-10">

                  {/* Large category icon inside gradient ring */}
                  <div className="relative flex items-center justify-center">
                    {/* Outer glow ring */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-40"
                      style={{ background: 'linear-gradient(135deg, #ea1974, #bc25c4, #58b7da)' }}
                    />
                    {/* Ring border */}
                    <div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center border-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(234,25,116,0.15), rgba(88,183,218,0.1))',
                        borderColor: 'rgba(234,25,116,0.3)',
                      }}
                    >
                      <span className="text-5xl select-none leading-none" role="img" aria-label={selectedCategory.name}>
                        {CATEGORY_ICONS[selectedCategory.slug] ?? selectedCategory.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Quick-fact chips — 2-column grid */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {[
                      { icon: '⬇️', label: 'Free Download' },
                      { icon: '🖨️', label: 'Print Ready' },
                      { icon: '👨‍👩‍👧', label: 'All Ages' },
                      { icon: '🔓', label: 'No Sign-up' },
                      { icon: '📄', label: 'PDF & JPEG' },
                      { icon: '✏️', label: 'High Quality' },
                    ].map(({ icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-dm-sans font-medium bg-white/5 border border-white/10 text-white/55 hover:text-white/80 hover:border-white/20 transition-colors duration-200"
                      >
                        <span className="text-sm leading-none">{icon}</span>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="relative py-12 sm:py-16">
        {/* JSON-LD: FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 left-1/3 w-[400px] h-[300px] bg-[#ea1974]/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 right-1/3 w-[350px] h-[250px] bg-[#58b7da]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-1 rounded-full bg-[#ea1974] opacity-70" />
              <div className="w-5 h-1 rounded-full bg-[#bc25c4] opacity-60" />
              <div className="w-6 h-1 rounded-full bg-[#58b7da] opacity-65" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-fredoka text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-white/60 text-sm sm:text-base font-dm-sans max-w-2xl mx-auto">
              {selectedCategory
                ? `Everything you need to know about ${selectedCategory.name} coloring pages`
                : 'Everything you need to know about our free coloring pages'}
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden
                  transition-all duration-300 hover:border-white/20"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4
                    transition-colors duration-200 hover:bg-white/5"
                >
                  <h3 className="text-base sm:text-lg font-semibold font-fredoka text-white pr-4">
                    {faq.question}
                  </h3>
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#ea1974] to-[#bc25c4]
                      flex items-center justify-center transition-transform duration-300"
                    style={{ transform: openFaqIndex === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openFaqIndex === index ? '500px' : '0px',
                    opacity: openFaqIndex === index ? 1 : 0,
                  }}
                >
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5 pt-0">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                    <p className="text-white/70 text-sm sm:text-base font-dm-sans leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad: After FAQ Section — Placement D — TEMP: disabled until AdSense approval */}
      {/*
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdUnit
            slot="REPLACE_WITH_SLOT_ID_CATEGORY_FOOTER"
            format="auto"
            reservedHeight={90}
            lazy={true}
          />
        </div>
      </section>
      */}
    </main>
  );
}
