const SECTIONS = [
  {
    number: '01',
    accent: '#ea1974',
    title: 'Free Printable Coloring Pages — Download as PDF or JPEG Instantly',
    body: 'Every free coloring page on Paint With Purpose is available as a print-ready PDF or high-resolution JPEG, optimized for standard US Letter and A4 paper sizes. Click any page, choose your format, and download instantly — no sign-up, no cost. Our black-and-white line-art previews let you see exactly what you will get before you print.',
  },
  {
    number: '02',
    accent: '#bc25c4',
    title: 'Coloring Pages for Every Age & Skill Level',
    body: 'Our free printable coloring sheets are organized by difficulty and age range. Easy coloring pages for kids and toddlers feature bold outlines and simple shapes. Medium pages add more detail for school-age children. Hard designs — fine linework, intricate patterns, complex mandala art — are coloring pages for adults who want a creative challenge. Filter by age group or browse the category grid to find the right printable PDF for any skill level.',
  },
  {
    number: '03',
    accent: '#58b7da',
    title: 'New Free Coloring Pages Added Every Week',
    body: 'Our library of free printable coloring pages grows every week — covering seasonal holidays, trending characters, animals, nature, and more. Every new page is a clean black-and-white printable PDF ready for home, classroom, or therapy use. Subscribe to our newsletter to get fresh free coloring sheets delivered straight to your inbox and never run out of coloring inspiration.',
  },
];

const STATS = [
  { value: '500+', label: 'Free Pages',     accent: '#ea1974' },
  { value: 'Weekly', label: 'New Additions', accent: '#bc25c4' },
  { value: '100%',  label: 'Always Free',   accent: '#58b7da' },
];

export default function EditorialSEOBlock() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">

      {/* Ambient atmosphere */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full blur-[130px] opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #ea1974, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full blur-[110px] opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #58b7da, transparent 65%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] lg:gap-0">

          {/* ── LEFT COLUMN — sticky headline + intro ───────── */}
          <div className="lg:sticky lg:top-10 lg:self-start lg:pr-14 pb-12 lg:pb-0">

            {/* Headline — semantic H2 for SEO */}
            <h2
              className="font-fredoka font-bold leading-[0.88] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
            >
              <span
                className="block"
                style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.01em' }}
              >
                Free Printable
              </span>
              <span
                className="block text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(110deg, #ea1974 0%, #bc25c4 48%, #58b7da 100%)',
                  letterSpacing: '-0.01em',
                }}
              >
                Coloring Pages
              </span>
              <span
                className="block font-semibold tracking-normal"
                style={{
                  fontSize: '0.42em',
                  color: 'rgba(255,255,255,0.40)',
                  marginTop: '0.4em',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.02em',
                }}
              >
                for Kids and Adults
              </span>
            </h2>

            {/* Gradient rule */}
            <div
              className="h-px mb-7"
              style={{
                background: 'linear-gradient(to right, rgba(234,25,116,0.5), rgba(188,37,196,0.3), rgba(88,183,218,0.15), transparent)',
              }}
            />

            {/* Intro paragraph */}
            <p
              className="font-dm-sans text-white/50 mb-10"
              style={{ fontSize: '0.9375rem', lineHeight: '1.90' }}
            >
              Paint With Purpose offers 500+ free printable coloring pages you can download
              as a PDF or JPEG and print at home — no subscription, no sign-up required. Whether
              you are looking for simple black-and-white coloring sheets for toddlers, cartoon
              characters for kids, or intricate mandala designs for adults, our growing library of
              free coloring pages has something for everyone.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-5">
              {STATS.map((s) => (
                <div key={s.value} className="flex flex-col gap-0.5">
                  <span
                    className="font-fredoka font-bold leading-none"
                    style={{
                      fontSize: '1.4rem',
                      color: s.accent,
                    }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="font-dm-sans text-white/35"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN — numbered sections ────────────── */}
          <div
            className="space-y-10 sm:space-y-12 lg:pl-14"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}
          >
            {SECTIONS.map((s) => (
              <div key={s.number} className="relative">

                {/* Ghost watermark number */}
                <span
                  className="absolute -top-2 right-0 font-fredoka font-bold leading-none select-none pointer-events-none"
                  aria-hidden="true"
                  style={{
                    fontSize: 'clamp(4rem, 10vw, 6.5rem)',
                    color: 'transparent',
                    WebkitTextStroke: `1px ${s.accent}15`,
                    letterSpacing: '-0.04em',
                    zIndex: 0,
                  }}
                >
                  {s.number}
                </span>

                <div className="relative" style={{ zIndex: 1 }}>
                  {/* Number tag + fading rule */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="font-mono text-[10px] font-bold tracking-[0.32em] uppercase flex-shrink-0"
                      style={{ color: s.accent }}
                    >
                      {s.number}
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{
                        background: `linear-gradient(to right, ${s.accent}50, ${s.accent}10, transparent)`,
                      }}
                    />
                  </div>

                  {/* H3 */}
                  <h3
                    className="font-fredoka font-bold text-white leading-tight mb-3"
                    style={{ fontSize: 'clamp(1.25rem, 2.8vw, 1.65rem)' }}
                  >
                    {s.title}
                  </h3>

                  {/* Body */}
                  <p
                    className="font-dm-sans text-white/50"
                    style={{ fontSize: '0.9375rem', lineHeight: '1.90' }}
                  >
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
