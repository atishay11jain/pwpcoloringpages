import Link from 'next/link';
import type { ReactNode } from 'react';

interface Audience {
  label: string;
  icon: ReactNode;
  ageRange: string;
  gradient: string;
  glow: string;
  description: string;
}

const AUDIENCES: Audience[] = [
  {
    label: 'Toddlers',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    ageRange: 'toddler',
    gradient: 'from-yellow-400 via-orange-400 to-pink-400',
    glow: 'group-hover:shadow-orange-500/30',
    description: 'Ages 1–3 · Easy toddler coloring pages',
  },
  {
    label: 'Kids',
    icon: (
      <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    ),
    ageRange: 'kids',
    gradient: 'from-green-400 via-cyan-400 to-blue-400',
    glow: 'group-hover:shadow-cyan-500/30',
    description: 'Ages 4–12 · Free printable coloring pages for kids',
  },
  {
    label: 'Teens',
    icon: (
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    ),
    ageRange: 'teens',
    gradient: 'from-purple-400 via-pink-400 to-fuchsia-400',
    glow: 'group-hover:shadow-pink-500/30',
    description: 'Ages 13–17 · Detailed printable art',
  },
  {
    label: 'Adults',
    icon: (
      <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.636 5.636l2.121 2.121M16.243 16.243l2.121 2.121M5.636 18.364l2.121-2.121M16.243 7.757l2.121-2.121" />
      </>
    ),
    ageRange: 'adults',
    gradient: 'from-rose-400 via-red-400 to-orange-400',
    glow: 'group-hover:shadow-rose-500/30',
    description: 'All ages · Coloring pages for adults PDF',
  },
];

export default function AgeAudienceNav() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/4 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-fredoka mb-4">
            Free Coloring Pages for Every Age Group
          </h2>
          <p className="text-white/60 font-dm-sans text-base sm:text-lg max-w-xl mx-auto">
            Free printable coloring pages for toddlers, kids, teens, and adults — easy bold designs for beginners to detailed coloring pages for adults PDF-ready.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {AUDIENCES.map((audience) => (
            <Link
              key={audience.ageRange}
              href={`/free-coloring-pages?ageRange=${audience.ageRange}`}
              className={`group relative rounded-2xl p-6 sm:p-8 text-center border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${audience.glow} bg-[#12121a] overflow-hidden`}
            >
              {/* Gradient top bar */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${audience.gradient}`} />

              {/* Gradient glow blob */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${audience.gradient} rounded-2xl`}
              />

              <div className="relative">
                {/* Icon badge */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${audience.gradient} flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {audience.icon}
                  </svg>
                </div>

                <h3
                  className={`text-xl sm:text-2xl font-bold font-fredoka mb-1 bg-gradient-to-r ${audience.gradient} bg-clip-text text-transparent`}
                >
                  {audience.label}
                </h3>
                <p className="text-white/50 text-xs sm:text-sm font-dm-sans">
                  {audience.description}
                </p>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs font-dm-sans text-white/40 group-hover:text-white/60 transition-colors">
                  Browse pages
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
