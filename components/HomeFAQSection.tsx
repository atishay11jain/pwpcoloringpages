import { getHomeFAQs } from '@/lib/db';
import HomeFAQAccordion from './HomeFAQAccordion';

const FALLBACK_FAQS = [
  { id: '1', question: 'Are all coloring pages really free?', answer: 'Yes — every coloring page on Paint With Purpose is completely free to download and print. No subscription, no sign-up, and no hidden fees. Just click, download, and start coloring.', sort_order: 1 },
  { id: '2', question: 'What format are the coloring pages?', answer: 'All pages are available as high-resolution PDF and JPEG files, optimized for standard US Letter (8.5×11") and A4 paper sizes. Both formats print cleanly on any home inkjet or laser printer.', sort_order: 2 },
  { id: '3', question: 'How do I print a coloring page?', answer: 'Click on any coloring page, then click the Download or Print button. Open the file in your PDF viewer or image viewer and select Print. For best results, choose "Fit to Page" and print in black and white to save ink.', sort_order: 3 },
  { id: '4', question: 'Are these coloring pages good for adults?', answer: 'Absolutely. We have a dedicated Adults section featuring intricate mandalas, detailed nature scenes, and complex patterns specifically designed for adult coloring. These designs provide a relaxing, mindful activity and are suitable for all skill levels.', sort_order: 4 },
  { id: '5', question: 'Can I use these coloring pages in a classroom?', answer: 'Yes! Our coloring pages are free for personal and educational use. Teachers and parents are welcome to print and distribute them in classrooms, homeschool settings, or therapy sessions at no cost.', sort_order: 5 },
  { id: '6', question: 'How often are new coloring pages added?', answer: 'We add fresh coloring pages every week, covering seasonal themes, trending characters, animals, holidays, and more. Subscribe to our newsletter to get new free printables delivered straight to your inbox.', sort_order: 6 },
];

export default async function HomeFAQSection() {
  // Fetch from DB server-side so the FAQPage schema is in the SSR'd HTML
  let faqs = FALLBACK_FAQS;
  try {
    const dbFaqs = await getHomeFAQs();
    if (dbFaqs.length > 0) faqs = dbFaqs;
  } catch {
    // DB unavailable — fallback data is already set above
  }

  const faqSchema = {
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

  return (
    <section className="relative py-12 sm:py-16 md:py-20">
      {/* FAQPage JSON-LD — server-rendered so crawlers see it immediately */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/4 to-transparent pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-fredoka mb-4">
            Frequently Asked Questions About Free Coloring Pages
          </h2>
          <p className="text-white/55 font-dm-sans text-base sm:text-lg">
            Everything you need to know about our free printable coloring pages.
          </p>
        </div>

        <HomeFAQAccordion faqs={faqs} />
      </div>
    </section>
  );
}
