import type { Metadata } from 'next';
import { getAllColoringBooks } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';
import { getPublicUrl } from '@/lib/r2';
import ColoringBooksGrid from '@/components/ColoringBooksGrid';

const SITE_URL = 'https://pwpcoloringpages.com';

export const metadata: Metadata = {
  title: 'Best Coloring Books for Kids & Adults (2026) | Paint With Purpose',
  description:
    'Shop our hand-picked coloring books for kids, teens, and adults — all available on Amazon. Beautifully illustrated, high-quality designs for every age and skill level. Browse the full collection.',
  alternates: {
    canonical: `${SITE_URL}/coloring-books`,
  },
  openGraph: {
    title: 'Best Coloring Books for Kids & Adults (2026) | Paint With Purpose',
    description:
      'Shop our hand-picked coloring books for kids, teens, and adults — all available on Amazon. Beautifully illustrated, high-quality designs for every age and skill level.',
    type: 'website',
    url: `${SITE_URL}/coloring-books`,
    images: [
      {
        // TODO: replace with a 1200×630 collage image at /og-coloring-books.jpg
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: 'Best Coloring Books for Kids & Adults — Paint With Purpose Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Coloring Books for Kids & Adults (2026) | Paint With Purpose',
    description:
      'Shop our hand-picked coloring books for kids, teens, and adults — all available on Amazon.',
    // TODO: replace with /og-coloring-books.jpg once the 1200×630 image is created
    images: [`${SITE_URL}/logo.png`],
  },
};

export default async function ColoringBooksPage() {
  let books: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    amazonUrl: string | null;
    status: 'coming_soon' | 'available' | 'out_of_stock';
    sortOrder: number;
    rating: number | null;
    ratingCount: number | null;
    tags: string[];
  }[] = [];

  try {
    const rawBooks = await getAllColoringBooks();
    books = rawBooks.map((book) => ({
      id: book.id,
      title: book.title,
      description: book.description,
      imageUrl: book.cover_image_key ? getPublicUrl(book.cover_image_key) : null,
      amazonUrl: book.buy_url,
      status: book.status,
      sortOrder: book.sort_order,
      rating: book.rating,
      ratingCount: book.rating_count,
      tags: [],          // TODO: populate audience/category tags from DB
    }));
  } catch (error) {
    console.error('Failed to fetch coloring books:', error);
  }

  // ── JSON-LD: BreadcrumbList ──────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Coloring Books', item: `${SITE_URL}/coloring-books` },
    ],
  };

  // ── JSON-LD: ItemList ────────────────────────────────────────────────────
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best Coloring Books for Kids & Adults',
    description: 'Hand-picked coloring books curated by Paint With Purpose',
    url: `${SITE_URL}/coloring-books`,
    numberOfItems: books.length,
    itemListElement: books.map((book, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: book.title,
      url: `${SITE_URL}/coloring-books/${book.id}`,
    })),
  };

  // ── JSON-LD: Book + Product per book ────────────────────────────────────
  const bookSchemas = books.map((book) => ({
    '@context': 'https://schema.org',
    '@type': ['Book', 'Product'],
    name: book.title,
    description: book.description ?? 'A beautifully illustrated coloring book for kids and adults.',
    ...(book.imageUrl ? { image: book.imageUrl } : {}),
    audience: {
      '@type': 'Audience',
      audienceType: 'Children and Adults',
    },
    ...(book.rating && book.ratingCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: book.rating,
            reviewCount: book.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(book.amazonUrl
      ? {
          offers: {
            '@type': 'Offer',
            availability:
              book.status === 'available'
                ? 'https://schema.org/InStock'
                : book.status === 'coming_soon'
                ? 'https://schema.org/PreOrder'
                : 'https://schema.org/OutOfStock',
            url: book.amazonUrl,
            seller: { '@type': 'Organization', name: 'Amazon' },
          },
        }
      : {}),
  }));

  // ── JSON-LD: FAQPage ─────────────────────────────────────────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are these coloring books available as printable PDFs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our coloring books are physical and digital books sold on Amazon — not downloadable PDFs. For free printable coloring pages you can download and print at home, visit our Free Coloring Pages section.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best coloring book for beginners?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For beginners, we recommend books with larger designs, simple outlines, and fewer intricate details. Browse our collection and look for books labeled for kids or beginner-friendly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are these coloring books suitable for adults?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Our collection includes dedicated adult coloring books featuring intricate mandalas, nature patterns, and detailed illustrations designed for stress relief and mindfulness.',
        },
      },
      {
        '@type': 'Question',
        name: 'What age are these coloring books recommended for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We have books for all ages — from simple designs for toddlers and young children (ages 3–6) to complex patterns for teens and adults. Age recommendations are included in each book description.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why do you link to Amazon instead of selling directly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We partner with Amazon so you benefit from their trusted purchasing experience, fast shipping, easy returns, and customer reviews. We focus on hand-picking the best books; Amazon handles fulfillment.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often do you add new coloring books to the collection?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We review our collection regularly and add new titles as we discover high-quality books that meet our curation standards. New books are typically added monthly.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {bookSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ColoringBooksGrid books={books} />
    </>
  );
}
