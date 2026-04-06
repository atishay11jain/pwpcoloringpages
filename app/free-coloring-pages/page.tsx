import type { Metadata } from 'next';
import CategoryColoringPages from '@/components/CategoryColoringPages';

export const metadata: Metadata = {
  title: 'Free Printable Coloring Pages for Kids & Adults — All Categories',
  description: '500+ free printable coloring pages for kids, toddlers, and adults. Easy coloring pages for beginners to detailed designs for adults. Download PDF instantly — no sign-up.',
  keywords: [
    'free printable coloring pages',
    'coloring pages for kids',
    'coloring pages for adults printable',
    'easy coloring pages for kids',
    'coloring pages for toddlers',
    'coloring pages for adults PDF',
    'free coloring sheets printable',
    'coloring pages PDF download',
  ],
  alternates: {
    canonical: 'https://pwpcoloringpages.com/free-coloring-pages',
  },
  openGraph: {
    title: 'Free Printable Coloring Pages for Kids & Adults | Paint With Purpose',
    description: '500+ free printable coloring pages — easy designs for toddlers & kids, detailed pages for adults. Download as PDF instantly. No sign-up.',
    url: 'https://pwpcoloringpages.com/free-coloring-pages',
    type: 'website',
  },
};

interface Props {
  searchParams: Promise<{ ageRange?: string }>;
}

export default async function FreeColoringPages({ searchParams }: Props) {
  const { ageRange } = await searchParams;
  return <CategoryColoringPages selectedCategorySlug={null} ageRange={ageRange ?? null} />;
}
