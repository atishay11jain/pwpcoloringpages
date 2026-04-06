import Image from 'next/image';
import Link from 'next/link';


export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Full-bleed Background - extends under the header */}
      <div className="absolute inset-0  bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />

      {/* Animated Background Elements - Optimized */}
      <div className="absolute inset-0 -top-40 overflow-hidden pointer-events-none">
        {/* Crayons - Priority image for LCP */}
        <div
          className="absolute top-[72%] left-[2%] sm:left-[4%] lg:left-[6%] w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 animate-hero-float opacity-80"
        >
          <Image
            src="/item-background/crayons.png"
            alt=""
            fill
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, (max-width: 1024px) 80px, 96px"
            className="object-contain"
            loading="lazy"
          />
        </div>

        {/* Brush Bucket */}
        <div
          className="absolute top-[45%] left-[1%] sm:left-[3%] lg:left-[5%] w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 animate-hero-float-slow opacity-90"
        >
          <Image
            src="/item-background/brush_bucket-.png"
            alt=""
            fill
            sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 80px"
            className="object-contain"
            loading="lazy"
          />
        </div>

        {/* Paint Brush */}
        <div
          className="absolute top-[38%] right-[2%] sm:right-[4%] lg:right-[8%] w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 animate-hero-float-reverse opacity-85"
        >
          <Image
            src="/item-background/paint_brush-.png"
            alt=""
            fill
            sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 64px"
            className="object-contain"
            loading="lazy"
          />
        </div>

        {/* Color Palette */}
        <div
          className="absolute bottom-[15%] right-[3%] sm:right-[6%] lg:right-[10%] w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-hero-float opacity-85"
        >
          <Image
            src="/item-background/color_palattee-.png"
            alt=""
            fill
            sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 80px"
            className="object-contain"
            loading="lazy"
          />
        </div>

        {/* Small Stars - Hidden on mobile, lazy load */}
        <div
          className="hidden md:block absolute top-[28%] right-[22%] lg:right-[25%] w-5 h-5 md:w-6 md:h-6 animate-twinkle opacity-50"
        >
          <Image
            src="/item-background/star.png"
            alt=""
            fill
            sizes="24px"
            className="object-contain"
            loading="lazy"
          />
        </div>

        <div
          className="hidden lg:block absolute bottom-[25%] left-[15%] w-4 h-4 animate-twinkle opacity-40"
          style={{ animationDelay: '0.5s' }}
        >
          <Image
            src="/item-background/star.png"
            alt=""
            fill
            sizes="16px"
            className="object-contain"
            loading="lazy"
          />
        </div>

        {/* Gradient Orbs - Positioned lower to blend smoothly */}
        <div className="absolute top-[45%] left-[15%] w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[15%] right-[15%] w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight font-fredoka">
          Free Printable Coloring Pages for Kids and Adults
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed font-dm-sans px-2">
          Download and print hundreds of free coloring pages as PDF or JPEG — animals, nature, characters,
          mandalas, and more. Perfect for toddlers, kids, teens, and adults who love to color!</p>

        <Link
          href="/free-coloring-pages"
          className="group relative inline-block"
        >
          {/* Stacked paint swatch layers - creates artistic depth */}
          <div
            className="absolute -inset-1 translate-x-2 translate-y-2 rounded-2xl opacity-70
              transition-all duration-500 ease-out
              group-hover:translate-x-2.5 group-hover:translate-y-2.5"
            style={{
              background: '#58b7da',
              clipPath: 'polygon(1% 8%, 100% 2%, 98% 94%, 1% 98%)'
            }}
          />
          <div
            className="absolute -inset-1 translate-x-1 translate-y-1 rounded-2xl opacity-80
              transition-all duration-400 ease-out
              group-hover:translate-x-1.5 group-hover:translate-y-1.5"
            style={{
              background: '#E83C91',
              clipPath: 'polygon(0% 6%, 98% 4%, 99% 94%, 1% 97%)'
            }}
          />

          {/* Main button surface */}
          <div
            className="relative px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl overflow-hidden
              transition-all duration-300 ease-out
              group-hover:scale-[1.02] group-hover:-rotate-1"
            style={{
              background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)',
              clipPath: 'polygon(1% 5%, 99% 0%, 98% 95%, 0% 92%)'
            }}
          >
            {/* Organic paint texture overlay */}
            <div
              className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Sparkle accents */}
            <div className="absolute top-2 right-4 w-2 h-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              <svg viewBox="0 0 24 24" fill="white" className="w-full h-full animate-pulse">
                <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
              </svg>
            </div>
            <div className="absolute bottom-3 left-6 w-1.5 h-1.5 opacity-0 group-hover:opacity-80 transition-all duration-700 delay-200">
              <svg viewBox="0 0 24 24" fill="#fef08a" className="w-full h-full">
                <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
              </svg>
            </div>

            {/* Button content */}
            <span
              className="relative flex items-center gap-2.5 font-bold text-white text-sm sm:text-base tracking-wide drop-shadow-sm"
              style={{ fontFamily: "'Fredoka', 'Comic Sans MS', cursive" }}
            >
              {/* Paint brush icon */}
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 group-hover:rotate-[-15deg] group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" fill="rgba(255,255,255,0.3)"/>
                <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/>
                <path d="M14.5 17.5 4.5 15" className="opacity-60"/>
              </svg>

              <span className="relative">
                Browse Free Coloring Pages
                {/* Hand-drawn underline scribble */}
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 opacity-0 group-hover:opacity-100
                    transition-all duration-300 group-hover:translate-y-0 translate-y-1"
                  viewBox="0 0 120 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2,5 Q12,2 22,6 T42,4 T62,7 T82,3 T102,6 Q112,5 118,4"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              {/* Animated arrow */}
              <svg
                className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </span>
          </div>

          {/* Paint drip effects on hover */}
          <div className="absolute -bottom-3 left-6 flex gap-1.5 opacity-0 group-hover:opacity-100
            transition-all duration-500 group-hover:translate-y-1 pointer-events-none">
            <div
              className="w-2 h-4 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #ea1974, transparent)' }}
            />
            <div
              className="w-1.5 h-5 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #bc25c4, transparent)' }}
            />
            <div
              className="w-1 h-3 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #ea1974, transparent)' }}
            />
          </div>
          <div className="absolute -bottom-2 right-8 flex gap-1 opacity-0 group-hover:opacity-100
            transition-all duration-700 delay-150 group-hover:translate-y-1 pointer-events-none">
            <div
              className="w-1.5 h-3.5 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #58b7da, transparent)' }}
            />
            <div
              className="w-1 h-2.5 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #bc25c4, transparent)' }}
            />
          </div>
        </Link>

      </div>

      {/* Section divider — sits at the boundary between Hero and Trending */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-4 px-6 sm:px-12 md:px-24 translate-y-1/2 z-10">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #ea1974)' }} />
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ea1974' }} />
          <div className="w-2.5 h-2.5 rotate-45" style={{ background: 'linear-gradient(135deg, #ea1974, #bc25c4)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#58b7da' }} />
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #58b7da)' }} />
      </div>
    </section>
  );
}
