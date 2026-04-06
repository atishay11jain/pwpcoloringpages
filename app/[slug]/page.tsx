import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CategoryColoringPages from '@/components/CategoryColoringPages';
import ColoringPageClient from '@/components/ColoringPageClient';
import type { SinglePageResponse } from '@/app/api/pages/[slug]/route';
import {
  getCategoryWithCount,
  getPublishedCategoryFAQs,
  getColoringPageWithAssets,
  getRelatedCategories,
  getCategoryById,
  type ColoringPageAsset,
} from '@/lib/db';
import { getPublicAssetUrl } from '@/lib/url-utils';

async function getColoringPage(slug: string): Promise<SinglePageResponse | null> {
  try {
    // Try slug as-is; if not found, strip trailing '-coloring-page' and retry
    let page = await getColoringPageWithAssets(slug);
    if (!page && slug.endsWith('-coloring-page')) {
      page = await getColoringPageWithAssets(slug.replace(/-coloring-page$/, ''));
    }
    if (!page) return null;

    let possibleCategoryIds: string[] = [];
    if (page.possible_categories) {
      try { possibleCategoryIds = JSON.parse(page.possible_categories); } catch { /* ignore */ }
    }

    const [primaryCategory, relatedCats] = await Promise.all([
      getCategoryById(page.category_id),
      possibleCategoryIds.length > 0 ? getRelatedCategories(possibleCategoryIds) : Promise.resolve([]),
    ]);

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      description: page.description,
      categoryId: page.category_id,
      categoryName: primaryCategory?.name ?? null,
      categorySlug: primaryCategory?.slug ?? null,
      possibleCategories: relatedCats.map(c => ({ name: c.name, slug: c.slug })),
      difficulty: page.difficulty,
      ageRange: page.age_range,
      assets: page.assets.map((asset: ColoringPageAsset) => ({
        mode: asset.mode,
        thumbnailUrl: asset.thumbnail_url ? getPublicAssetUrl(asset.thumbnail_url) : null,
        jpegUrl: asset.jpeg_url ? getPublicAssetUrl(asset.jpeg_url) : null,
        pdfUrl: asset.pdf_url ? getPublicAssetUrl(asset.pdf_url) : null,
      })),
      isPopular: Boolean(page.is_popular),
      ratingSum: page.rating_sum ?? 0,
      ratingCount: page.rating_count ?? 0,
      printingTips: page.printing_tips ?? null,
      meta: {
        title: page.meta_title,
        description: page.meta_description,
        keywords: page.meta_keywords,
      },
      updatedAt: page.updated_at,
    };
  } catch (error) {
    console.error('Error fetching coloring page:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Check if this is a category URL
  if (slug.endsWith('-coloring-pages')) {
    const categorySlug = slug.replace('-coloring-pages', '');
    const category = await getCategoryWithCount(categorySlug);

    if (!category) {
      const name = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
      return {
        title: `Free ${name} Coloring Pages — Printable & Free Download | Paint With Purpose`,
        description: `Download free printable ${name.toLowerCase()} coloring pages for kids and adults. Black & white sheets ready to print at home. Completely free, no sign-up required.`,
      };
    }

    const categoryTitle = category.meta_title || `Free ${category.name} Coloring Pages — Printable & Free Download | Paint With Purpose`;
    const categoryDescription = category.meta_description || `Download free printable ${category.name} coloring pages for kids and adults. Browse ${category.count}+ designs — black & white sheets ready to print at home. Completely free, no sign-up required.`;
    return {
      title: categoryTitle,
      description: categoryDescription,
      alternates: {
        canonical: `https://pwpcoloringpages.com/${slug}`,
      },
      openGraph: {
        title: `Free ${category.name} Coloring Pages — Printable & Free Download`,
        description: categoryDescription,
        type: 'website',
        url: `https://pwpcoloringpages.com/${slug}`,
      },
    };
  }

  // Fetch the coloring page data for metadata (API will handle the suffix removal)
  const pageData = await getColoringPage(slug);

  if (!pageData) {
    return {
      title: 'Coloring Page Not Found',
      description: 'The requested coloring page could not be found.',
    };
  }

  // Strip trailing "Coloring Page" from title to avoid duplication in meta title
  const cleanTitle = pageData.title.replace(/\s*coloring\s*page\s*$/i, '').trim();

  const metaTitle =
    pageData.meta.title ||
    `${cleanTitle} Coloring Page – Free Printable | Paint With Purpose`;

  const metaDescription =
    pageData.meta.description ||
    `Download this free printable ${cleanTitle} coloring page. Perfect for ${pageData.ageRange || 'all ages'}. Instant free download, no sign-up needed.`;

  // Prefer BW asset thumbnail for og:image
  const bwAsset = pageData.assets.find(a => a.mode === 'bw');
  const ogImage = bwAsset?.thumbnailUrl ?? bwAsset?.jpegUrl ?? undefined;

  const pageCanonical = `https://pwpcoloringpages.com/${slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: pageCanonical,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      url: pageCanonical,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

// Loading fallback with playful animation
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-24 h-24">
          {/* Rotating crayons */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                animation: 'spin-slow 3s linear infinite',
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <div
                className="w-6 h-20 rounded-full absolute top-0 left-1/2 -translate-x-1/2"
                style={{
                  background: ['linear-gradient(to bottom, #ef4444, #dc2626)', 'linear-gradient(to bottom, #3b82f6, #2563eb)', 'linear-gradient(to bottom, #10b981, #059669)'][i],
                  transform: `rotate(${i * 120}deg) translateY(-35px)`,
                  transformOrigin: 'center 50px',
                }}
              />
            </div>
          ))}
        </div>
        <p className="text-white/70 font-bold text-xl" style={{ fontFamily: 'Gochi Hand, cursive' }}>
          Loading your coloring page...
        </p>
      </div>
    </div>
  );
}

export default async function ColoringPageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Check if this is a category URL (e.g., "animals-coloring-pages")
  if (slug.endsWith('-coloring-pages')) {
    const categorySlug = slug.replace('-coloring-pages', '');

    // Fetch FAQs for FAQPage schema (non-blocking — empty array if none)
    let categoryFaqSchema: object | null = null;
    try {
      const category = await getCategoryWithCount(categorySlug);
      if (category) {
        const faqs = await getPublishedCategoryFAQs(category.id);
        if (faqs.length > 0) {
          categoryFaqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          };
        }
      }
    } catch {
      // DB unavailable — skip schema silently
    }

    return (
      <>
        {categoryFaqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryFaqSchema) }}
          />
        )}
        <CategoryColoringPages selectedCategorySlug={categorySlug} />
      </>
    );
  }

  // Check if this is a coloring page URL (e.g., "cute-mermaid-coloring-page")
  // The API will strip the suffix to get the database slug
  const pageData = await getColoringPage(slug);

  if (!pageData) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pwpcoloringpages.com';
  const pageUrl = `${baseUrl}/${slug}`;

  // Strip trailing "Coloring Page" from title to prevent H1 duplication
  const displayTitle = pageData.title.replace(/\s*coloring\s*page\s*$/i, '').trim();

  // BW thumbnail for structured data
  const bwAsset = pageData.assets.find(a => a.mode === 'bw');
  const thumbnailUrl = bwAsset?.thumbnailUrl ?? bwAsset?.jpegUrl ?? null;

  const ratingValue =
    pageData.ratingCount > 0
      ? Math.round((pageData.ratingSum / pageData.ratingCount) * 10) / 10
      : null;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Free Coloring Pages', item: `${baseUrl}/free-coloring-pages` },
          ...(pageData.categoryName && pageData.categorySlug
            ? [{
                '@type': 'ListItem',
                position: 3,
                name: `${pageData.categoryName} Coloring Pages`,
                item: `${baseUrl}/${pageData.categorySlug}-coloring-pages`,
              }]
            : []),
          {
            '@type': 'ListItem',
            position: pageData.categoryName ? 4 : 3,
            name: `${displayTitle} Coloring Page`,
            item: pageUrl,
          },
        ],
      },
      ...(thumbnailUrl
        ? [{
            '@type': 'ImageObject',
            contentUrl: thumbnailUrl,
            name: `${displayTitle} Coloring Page`,
            description: pageData.description ?? `Free printable ${displayTitle} coloring page`,
          }]
        : []),
      {
        '@type': 'CreativeWork',
        '@id': pageUrl,
        name: `${displayTitle} Coloring Page`,
        url: pageUrl,
        description: pageData.description ?? `Free printable ${displayTitle} coloring page`,
        ...(thumbnailUrl ? { image: thumbnailUrl } : {}),
        ...(pageData.ageRange ? { typicalAgeRange: pageData.ageRange } : {}),
        ...(pageData.difficulty ? { educationalLevel: pageData.difficulty } : {}),
        isAccessibleForFree: true,
        ...(ratingValue && pageData.ratingCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue,
                reviewCount: pageData.ratingCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <ColoringPageClient pageData={pageData} slug={slug} displayTitle={displayTitle} />
      </Suspense>
    </main>
  );
}
