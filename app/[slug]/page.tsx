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
  getPageFAQs,
  type ColoringPageAsset,
  type PageFAQ,
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
      coloringGuide: page.coloring_guide ?? null,
      colorPalette: (() => {
        if (!page.color_palette) return null;
        try { return JSON.parse(page.color_palette); } catch { return null; }
      })(),
      subjectInfo: page.subject_info ?? null,
      pageFaqs: [],
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pwpcoloringpages.com';
    let categoryFaqSchema: object | null = null;
    let collectionSchema: object | null = null;
    try {
      const category = await getCategoryWithCount(categorySlug);
      if (category) {
        collectionSchema = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Free ${category.name} Coloring Pages`,
          description: `Browse ${category.count}+ free printable ${category.name} coloring pages. Download as PDF or JPEG instantly. No sign-up required.`,
          url: `${baseUrl}/${categorySlug}-coloring-pages`,
          isAccessibleForFree: true,
          inLanguage: 'en-US',
          about: {
            '@type': 'Thing',
            name: category.name,
          },
        };

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
        {collectionSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
          />
        )}
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

  // Fetch DB-stored per-page FAQs (graceful fallback — derived FAQs always render)
  let dbPageFaqs: PageFAQ[] = [];
  try {
    dbPageFaqs = await getPageFAQs(pageData.id);
  } catch { /* DB unavailable — continue with derived FAQs only */ }

  const enrichedPageData = { ...pageData, pageFaqs: dbPageFaqs };

  // Derived FAQs — computed from existing fields, always rendered on every page
  const SUPPLIES_BY_DIFFICULTY: Record<string, string> = {
    Easy: 'Crayons, washable markers, or thick colored pencils work best. The large, simple areas are ideal for beginners and young children.',
    Medium: 'Colored pencils or fine-tipped markers work great. A set of 24+ colors gives you plenty of choices for the varied details.',
    Hard: 'Fine-tipped colored pencils or gel pens give you the control needed for intricate lines. Alcohol-based markers work well for a smoother, blended finish.',
  };
  const supplyAnswer = SUPPLIES_BY_DIFFICULTY[pageData.difficulty ?? ''] ?? SUPPLIES_BY_DIFFICULTY.Medium;

  const derivedFAQs = [
    {
      question: `Is this ${displayTitle} coloring page free?`,
      answer: `Yes — this ${displayTitle} coloring page is completely free to download and print. No account, no sign-up, and no hidden cost. Click the download button to get your copy as a high-resolution PDF or JPEG instantly.`,
    },
    {
      question: `What age is the ${displayTitle} coloring page suitable for?`,
      answer: pageData.ageRange
        ? `This coloring page is designed for children aged ${pageData.ageRange}. The line art complexity is matched to that age group, making it engaging without being frustrating.`
        : `This coloring page is suitable for a wide range of ages. Check the difficulty badge on the page for a specific recommendation.`,
    },
    {
      question: `How difficult is the ${displayTitle} coloring page?`,
      answer: pageData.difficulty === 'Easy'
        ? `This is an Easy difficulty coloring page with bold outlines and large areas — perfect for toddlers, preschoolers, and anyone who prefers a relaxed coloring experience.`
        : pageData.difficulty === 'Medium'
        ? `This is a Medium difficulty page with moderate detail, ideal for school-age children and adults who enjoy a gentle creative challenge.`
        : pageData.difficulty === 'Hard'
        ? `This is a Hard difficulty page with intricate linework. It is best suited for older children, teens, and adults who enjoy detailed, meditative coloring.`
        : `The difficulty of this page suits a range of colorists — check the difficulty badge displayed on the page for the specific rating.`,
    },
    {
      question: `What coloring supplies work best for this page?`,
      answer: supplyAnswer,
    },
    {
      question: `Can I use this coloring page in my classroom?`,
      answer: `Absolutely. All coloring pages on Paint With Purpose are free for personal and educational use. Teachers, homeschool parents, and therapists are welcome to print and distribute them in classrooms or therapy sessions at no cost. Please do not redistribute the files digitally or sell them.`,
    },
    {
      question: `What file formats can I download?`,
      answer: `You can download this coloring page as a high-resolution JPEG image or as a print-ready PDF. Both formats are optimized for standard US Letter (8.5×11") and A4 paper. PDF is best for printing at home; JPEG works great for digital use or if you want to adjust the image before printing.`,
    },
  ];

  // FAQPage JSON-LD — combines derived + DB-stored page FAQs
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...derivedFAQs,
      ...dbPageFaqs.map(f => ({ question: f.question, answer: f.answer })),
    ].map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <ColoringPageClient
          pageData={enrichedPageData}
          slug={slug}
          displayTitle={displayTitle}
          derivedFAQs={derivedFAQs}
        />
      </Suspense>
    </main>
  );
}
