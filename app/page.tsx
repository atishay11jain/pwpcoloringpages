import Hero from '@/components/Hero';
import TrustStatsBar from '@/components/TrustStatsBar';
import BrowseByCategoryGrid from '@/components/BrowseByCategoryGrid';
import TrendingCarousel from '@/components/TrendingCarousel';
import RecentlyAddedSection from '@/components/RecentlyAddedSection';
import AgeAudienceNav from '@/components/AgeAudienceNav';
import SeasonalSpotlight from '@/components/SeasonalSpotlight';
import EditorialSEOBlock from '@/components/EditorialSEOBlock';
import HomeFAQSection from '@/components/HomeFAQSection';
import NewsletterSection from '@/components/NewsletterSection';
// import AdUnit from '@/components/AdUnit'; // TEMP: disabled until AdSense approval
import { getPopularPages } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

// Fallback static data shown when no pages have is_popular = 1 in the database
const FALLBACK_TRENDING = [
  { title: 'Spiderman Coloring Pages', imageUrl: 'https://placehold.co/400x533/dc2626/ffffff?text=Spiderman', href: '/coloring-pages/spiderman' },
  { title: 'Pokemon Coloring Pages', imageUrl: 'https://placehold.co/400x533/eab308/ffffff?text=Pokemon', href: '/coloring-pages/pokemon' },
  { title: 'Thanksgiving Coloring Pages', imageUrl: 'https://placehold.co/400x533/f97316/ffffff?text=Thanksgiving', href: '/coloring-pages/thanksgiving' },
  { title: 'Mermaid Coloring Pages', imageUrl: 'https://placehold.co/400x533/8b5cf6/ffffff?text=Mermaid', href: '/coloring-pages/mermaid' },
  { title: 'Butterfly Coloring Pages', imageUrl: 'https://placehold.co/400x533/ec4899/ffffff?text=Butterfly', href: '/coloring-pages/butterfly' },
  { title: 'Kitty Coloring Pages', imageUrl: 'https://placehold.co/400x533/be185d/ffffff?text=Kitty', href: '/coloring-pages/kitty' },
  { title: 'Cute Coloring Pages', imageUrl: 'https://placehold.co/400x533/f59e0b/ffffff?text=Cute', href: '/coloring-pages/cute' },
];

export default async function Home() {
  // Fetch pages marked as popular (is_popular = 1) from the database
  let trendingItems = FALLBACK_TRENDING;

  try {
    const popularPages = await getPopularPages(7);

    if (popularPages.length > 0) {
      trendingItems = popularPages.map((page) => ({
        title: page.title,
        imageUrl: page.bw_preview
          ? getPublicUrl(page.bw_preview)
          : `https://placehold.co/400x533/8b5cf6/ffffff?text=${encodeURIComponent(page.title)}`,
        href: `/${page.slug}`,
      }));
    }
  } catch {
    // DB unavailable — fallback data is already set above
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* 1. Hero */}
      <Hero />
    
      {/* 2. Trending Carousel */}
      <TrendingCarousel items={trendingItems} />

      {/* 3. Trust / Stats Bar */}
      <TrustStatsBar />

      {/* 4. Browse by Category Grid */}
      <BrowseByCategoryGrid />

      {/* Ad: Homepage Mid-Page — Placement E — TEMP: disabled until AdSense approval */}
      {/*
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <AdUnit
          slot="REPLACE_WITH_SLOT_ID_HOME_MID"
          format="auto"
          reservedHeight={90}
          lazy={true}
        />
      </div>
      */}

      {/* 5. Recently Added */}
      <RecentlyAddedSection />

      {/* 6. Age / Audience Navigation */}
      <AgeAudienceNav />

      {/* 7. Seasonal Spotlight */}
      <SeasonalSpotlight />

      {/* 8. Editorial SEO Text Block */}
      <EditorialSEOBlock />

      {/* Ad: Homepage Pre-FAQ — Placement F — TEMP: disabled until AdSense approval */}
      {/*
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdUnit
          slot="REPLACE_WITH_SLOT_ID_HOME_FAQ"
          format="fluid"
          layout="in-article"
          reservedHeight={280}
          lazy={true}
        />
      </div>
      */}

      {/* 9. FAQ Section */}
      <HomeFAQSection />

      {/* 10. Newsletter CTA */}
      <NewsletterSection />
    </main>
  );
}
