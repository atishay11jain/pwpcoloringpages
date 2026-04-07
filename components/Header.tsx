'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { event as gaEvent } from '@/lib/gtag';

// Paint splatter SVG component for decorative accents
const PaintSplatter = ({ className, color }: { className?: string; color: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill={color}>
    <circle cx="50" cy="50" r="35" />
    <circle cx="25" cy="30" r="12" />
    <circle cx="75" cy="25" r="8" />
    <circle cx="80" cy="65" r="10" />
    <circle cx="20" cy="70" r="6" />
    <ellipse cx="50" cy="85" rx="15" ry="8" />
  </svg>
);

// Crayon-style scribble underline SVG
const CrayonScribble = ({ color, isHovered }: { color: string; isHovered: boolean }) => (
  <svg
    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-[120%] h-3 transition-all duration-500 ease-out ${
      isHovered ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
    }`}
    viewBox="0 0 120 12"
    preserveAspectRatio="none"
  >
    <path
      d="M5,6 Q15,2 25,7 T45,4 T65,8 T85,3 T105,6 Q110,7 115,5"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'url(#crayon-texture)' }}
    />
    <defs>
      <filter id="crayon-texture" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>
);

// Color configurations for each nav item
const navColors = {
  home: { accent: '#f97316', bg: 'from-orange-500/20 to-amber-500/10', scribble: '#fb923c' },
  coloring: { accent: '#ec4899', bg: 'from-pink-500/20 to-rose-500/10', scribble: '#f472b6' },
  about: { accent: '#06b6d4', bg: 'from-cyan-500/20 to-teal-500/10', scribble: '#22d3ee' },
};

// Navigation link - clean style with scribble underline
const NavLink = ({
  href,
  children,
  delay,
  colorKey,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  delay: number;
  colorKey: 'home' | 'coloring' | 'about';
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const colors = navColors[colorKey];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link
      href={href}
      className={`relative px-4 py-2 transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => { gaEvent('nav_click', { link_text: String(children), destination: href }); onClick?.(); }}
    >
      {/* Text */}
      <span
        className={`relative z-10 font-semibold tracking-wide transition-all duration-300
          ${isHovered ? 'text-white' : 'text-white/80'}
        `}
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: '0.95rem',
        }}
      >
        {children}
      </span>

      {/* Crayon scribble underline */}
      <CrayonScribble color={colors.scribble} isHovered={isHovered} />
    </Link>
  );
};

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Hide header on specific routes
  const hiddenRoutes: string[] = ['/coloring-books'];
  const shouldHideHeader = hiddenRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render header on hidden routes
  if (shouldHideHeader) {
    return null;
  }

  return (
    <header
      className={`top-0 left-0 right-0 z-50 transition-all duration-500`}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-22">

          {/* Logo Section with paint drip effect */}
          <Link
            href="/"
            className={`flex items-center gap-2 sm:gap-3 group relative transition-all duration-700 ${
              mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Paint With Purpose Logo"
                width={60}
                height={60}
                className="relative z-10 rounded-full object-contain w-11 h-11 sm:w-15 sm:h-15
                  transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              />

              {/* Paint drip effect on hover */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="w-0.5 h-2 bg-gradient-to-b from-pink-500 to-pink-500/0 rounded-full animate-drip-1" />
                <div className="w-1 h-2.5 bg-gradient-to-b from-purple-500 to-purple-500/0 rounded-full animate-drip-2" />
                <div className="w-0.5 h-1.5 bg-gradient-to-b from-cyan-500 to-cyan-500/0 rounded-full animate-drip-3" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm sm:text-lg font-bold text-white font-fredoka tracking-normal
                bg-gradient-to-r from-white via-white to-white/80 bg-clip-text
                group-hover:from-pink-200 group-hover:via-purple-200 group-hover:to-cyan-200
                transition-all duration-500">
                Paint With Purpose
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.2em] text-white/40 font-dm-sans
                group-hover:text-white/60 transition-colors duration-500">
                Free Printable Coloring Pages
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink href="/" delay={100} colorKey="home">Home</NavLink>
            <NavLink href="/free-coloring-pages" delay={200} colorKey="coloring">Coloring Pages</NavLink>
            <NavLink href="#footer" delay={300} colorKey="about">About Us</NavLink>

            {/* CTA Button - Stacked Paint Swatches Style */}
            <Link
              href="/coloring-books"
              className={`relative ml-6 group/btn transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '400ms' }}
              onClick={() => gaEvent('header_cta_click', { destination: '/coloring-books' })}
            >
              {/* Stacked paint swatch layers - creates depth */}
              <div className="absolute -inset-0 translate-x-2 translate-y-2 bg-cyan-400 rounded-xl
                transition-all duration-300 group-hover/btn:translate-x-3 group-hover/btn:translate-y-3
                opacity-80"
                style={{ clipPath: 'polygon(0 8%, 100% 0%, 98% 92%, 2% 100%)' }}
              />
              <div className="absolute -inset-0 translate-x-1 translate-y-1 bg-pink-400 rounded-xl
                transition-all duration-300 group-hover/btn:translate-x-1.5 group-hover/btn:translate-y-1.5
                opacity-90"
                style={{ clipPath: 'polygon(2% 5%, 98% 2%, 100% 95%, 0% 98%)' }}
              />

              {/* Main button surface */}
              <div className="relative px-5 lg:px-7 py-3
                rounded-xl overflow-hidden transition-all duration-300
                group-hover/btn:scale-[1.02] group-hover/btn:-rotate-1"
                style={{
                  clipPath: 'polygon(1% 3%, 99% 0%, 98% 97%, 0% 95%)',
                  background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)'
                }}
              >
                <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='crayon'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='3' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23crayon)' fill='%23fff'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Sparkle accents */}
                <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-white rounded-full opacity-0
                  group-hover/btn:opacity-100 group-hover/btn:animate-ping transition-opacity duration-300" />
                <div className="absolute bottom-2 left-4 w-1 h-1 bg-yellow-200 rounded-full opacity-0
                  group-hover/btn:opacity-80 transition-opacity duration-500 delay-100" />

                <span className="relative flex items-center gap-2.5 font-bold text-white
                  text-sm lg:text-base tracking-wide drop-shadow-sm"
                  style={{ fontFamily: "'Fredoka', 'Comic Sans MS', cursive" }}
                >
                  {/* Animated colored pencil icon */}
                  <svg
                    className="w-5 h-5 transition-all duration-500 group-hover/btn:-rotate-[20deg] group-hover/btn:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" fill="rgba(255,255,255,0.3)"/>
                    <path d="m15 5 4 4"/>
                    <path d="M12.5 7.5 19 14" className="opacity-50"/>
                  </svg>

                  {/* Text with slight stagger effect on hover */}
                  <span className="relative">
                    Coloring Books
                    {/* Underline scribble on hover */}
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-2 opacity-0 group-hover/btn:opacity-100
                        transition-all duration-300 group-hover/btn:translate-y-0 translate-y-1"
                      viewBox="0 0 100 8"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0,4 Q15,1 30,5 T60,3 T90,5 L100,4"
                        fill="none"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
              </div>

              {/* Paint drip accents on hover */}
              <div className="absolute -bottom-2 left-4 flex gap-1 opacity-0 group-hover/btn:opacity-100
                transition-all duration-500 group-hover/btn:translate-y-1">
                <div className="w-1.5 h-3 bg-gradient-to-b from-pink-400 to-pink-400/0 rounded-full"
                  style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-4 bg-gradient-to-b from-rose-400 to-rose-400/0 rounded-full"
                  style={{ animationDelay: '100ms' }} />
              </div>
              <div className="absolute -bottom-1 right-6 flex gap-0.5 opacity-0 group-hover/btn:opacity-100
                transition-all duration-700 delay-100 group-hover/btn:translate-y-1">
                <div className="w-1 h-2.5 bg-gradient-to-b from-cyan-400 to-cyan-400/0 rounded-full" />
              </div>
            </Link>
          </nav>

          {/* Mobile Menu Button - Artistic hamburger */}
          <button
            className={`md:hidden relative p-3 rounded-xl text-white
              hover:bg-white/10 transition-all duration-300 group/menu ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-6 h-5 flex flex-col justify-between">
              {/* Animated bars that transform into X */}
              <span className={`block h-0.5 rounded-full transition-all duration-300 origin-center
                ${isMobileMenuOpen
                  ? 'rotate-45 translate-y-2 bg-gradient-to-r from-pink-400 to-purple-400'
                  : 'bg-white group-hover/menu:bg-gradient-to-r group-hover/menu:from-pink-400 group-hover/menu:to-purple-400'
                }`}
              />
              <span className={`block h-0.5 rounded-full transition-all duration-300
                ${isMobileMenuOpen
                  ? 'opacity-0 scale-0'
                  : 'bg-white group-hover/menu:bg-gradient-to-r group-hover/menu:from-purple-400 group-hover/menu:to-cyan-400'
                }`}
              />
              <span className={`block h-0.5 rounded-full transition-all duration-300 origin-center
                ${isMobileMenuOpen
                  ? '-rotate-45 -translate-y-2 bg-gradient-to-r from-purple-400 to-cyan-400'
                  : 'bg-white group-hover/menu:bg-gradient-to-r group-hover/menu:from-cyan-400 group-hover/menu:to-pink-400'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Paint canvas style */}
      <div
        className={`md:hidden transition-all duration-500 ease-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="relative bg-[#0a0a0f]/98 backdrop-blur-2xl border-t border-white/10">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-pink-500/50 via-purple-500/50 to-cyan-500/50" />

          {/* Canvas texture background */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          <div className="relative px-6 py-6 space-y-3">
            {/* Mobile nav items with stagger animation */}
            {[
              { href: '/', label: 'Home', accent: '#f97316', bg: 'from-orange-500/15 to-amber-500/5' },
              { href: '/free-coloring-pages', label: 'Coloring Pages', accent: '#ec4899', bg: 'from-pink-500/15 to-rose-500/5' },
              { href: '#footer', label: 'About Us', accent: '#06b6d4', bg: 'from-cyan-500/15 to-teal-500/5' },
            ].map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block relative px-5 py-4 rounded-2xl
                  text-lg font-semibold transition-all duration-300 group
                  overflow-hidden ${
                  isMobileMenuOpen
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-8 opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 75}ms`,
                  fontFamily: "'Fredoka', sans-serif"
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {/* Swatch background */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.bg}
                    border border-white/5 transition-all duration-300
                    group-hover:scale-[1.02] group-hover:-rotate-1 group-hover:border-white/10`}
                  style={{
                    clipPath: 'polygon(1% 5%, 99% 0%, 100% 95%, 0% 98%)',
                  }}
                />

                {/* Color accent dot */}
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full
                    transition-all duration-300 group-hover:scale-125"
                  style={{ backgroundColor: item.accent }}
                />

                {/* Sparkle on hover */}
                <div className="absolute top-2 right-4 w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg viewBox="0 0 24 24" fill={item.accent} className="w-full h-full">
                    <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
                  </svg>
                </div>

                {/* Text */}
                <span className="relative z-10 pl-6 text-white/80 group-hover:text-white transition-colors duration-300">
                  {item.label}
                </span>

                {/* Scribble underline on hover */}
                <svg
                  className="absolute bottom-2 left-8 right-8 h-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,4 Q10,1 20,5 T40,3 T60,6 T80,2 T100,5"
                    fill="none"
                    stroke={item.accent}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </Link>
            ))}

            {/* Mobile CTA */}
            <Link
              href="/coloring-books"
              className={`block mt-4 relative rounded-2xl overflow-hidden transition-all duration-500 ${
                isMobileMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: '225ms' }}
              onClick={() => { setIsMobileMenuOpen(false); gaEvent('header_cta_click', { destination: '/coloring-books', source: 'mobile' }); }}
            >
              {/* Stacked swatch layers */}
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-cyan-400 rounded-2xl opacity-60"
                style={{ clipPath: 'polygon(0 8%, 100% 0%, 98% 92%, 2% 100%)' }}
              />
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-pink-400 rounded-2xl opacity-70"
                style={{ clipPath: 'polygon(2% 5%, 98% 2%, 100% 95%, 0% 98%)' }}
              />

              {/* Main surface */}
              <div className="relative px-6 py-4 rounded-2xl"
                style={{
                  clipPath: 'polygon(1% 3%, 99% 0%, 98% 97%, 0% 95%)',
                  background: 'linear-gradient(110deg, #ea1974, #bc25c4, #58b7da)'
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" fill="rgba(255,255,255,0.3)"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  <span className="font-bold text-lg text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    Explore Coloring Books
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
