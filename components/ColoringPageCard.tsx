'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ColoringPageCardProps {
  title: string;
  imageUrl: string;
  downloadUrl: string;
  delay?: number;
  slug?: string;
  type?: 'black-and-white' | 'color';
  categoryName?: string;
}

export default function ColoringPageCard({ title, imageUrl, downloadUrl, delay = 0, slug, type = 'black-and-white', categoryName = '' }: ColoringPageCardProps) {
  // Use provided slug or generate from title
  const pageSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const [isHovered, setIsHovered] = useState(false);

  // Category-based color palette for colorful pages
  const categoryColorMap: Record<string, { primary: string; secondary: string; tape: string }> = {
    // Animals — bunny/garden image: fresh mint-green border
    animal:     { primary: '#66BB6A', secondary: '#E8F5E9', tape: '#81C784' },
    wildlife:   { primary: '#66BB6A', secondary: '#E8F5E9', tape: '#81C784' },
    // Cute bear image: warm coral-peach tones, pastel star border
    pet:        { primary: '#FF8A65', secondary: '#FBE9E7', tape: '#FFAB91' },
    dog:        { primary: '#D4A017', secondary: '#FFF8E1', tape: '#E8B84B' },
    // Hello Kitty image: dominant slate-blue border (#6685A8), pink dress, red bow, sky-blue balloon
    'hello kitty': { primary: '#5B82A6', secondary: '#E4EEF7', tape: '#7A9BBF' },
    kitty:         { primary: '#5B82A6', secondary: '#E4EEF7', tape: '#7A9BBF' },
    cat:        { primary: '#E91E8C', secondary: '#FCE4EC', tape: '#F48FB1' },
    bird:       { primary: '#29B6F6', secondary: '#E1F5FE', tape: '#81D4FA' },
    // Spring image: butterfly is vivid orange-red
    butterfly:  { primary: '#F57C00', secondary: '#FFF3E0', tape: '#FFA726' },
    insect:     { primary: '#8BC34A', secondary: '#F1F8E9', tape: '#AED581' },
    fish:       { primary: '#0288D1', secondary: '#E1F5FE', tape: '#4FC3F7' },
    // Dinosaur image: deep forest-green border, baby green dino
    dinosaur:   { primary: '#2E7D32', secondary: '#E8F5E9', tape: '#4CAF50' },
    dragon:     { primary: '#C62828', secondary: '#FFEBEE', tape: '#EF5350' },
    // Nature
    flower:     { primary: '#E91E63', secondary: '#FCE4EC', tape: '#F06292' },
    plant:      { primary: '#43A047', secondary: '#E8F5E9', tape: '#66BB6A' },
    tree:       { primary: '#2E7D32', secondary: '#E8F5E9', tape: '#388E3C' },
    nature:     { primary: '#43A047', secondary: '#E8F5E9', tape: '#66BB6A' },
    garden:     { primary: '#7CB342', secondary: '#F1F8E9', tape: '#9CCC65' },
    forest:     { primary: '#2E7D32', secondary: '#E8F5E9', tape: '#388E3C' },
    ocean:      { primary: '#0277BD', secondary: '#E1F5FE', tape: '#0288D1' },
    sea:        { primary: '#0277BD', secondary: '#E1F5FE', tape: '#0288D1' },
    beach:      { primary: '#F9A825', secondary: '#FFFDE7', tape: '#FDD835' },
    // Fantasy & Characters
    // Princess image: purple-violet border — not hot-pink
    princess:   { primary: '#9C27B0', secondary: '#F3E5F5', tape: '#CE93D8' },
    fairy:      { primary: '#BA68C8', secondary: '#F3E5F5', tape: '#CE93D8' },
    // Unicorn image: soft pastel iridescent (pink, lavender, mint) — not dark magenta
    unicorn:    { primary: '#F06292', secondary: '#FCE4EC', tape: '#F48FB1' },
    mermaid:    { primary: '#00ACC1', secondary: '#E0F7FA', tape: '#26C6DA' },
    superhero:  { primary: '#C62828', secondary: '#FFEBEE', tape: '#EF5350' },
    space:      { primary: '#5C6BC0', secondary: '#E8EAF6', tape: '#7986CB' },
    galaxy:     { primary: '#6A1B9A', secondary: '#F3E5F5', tape: '#8E24AA' },
    robot:      { primary: '#607D8B', secondary: '#ECEFF1', tape: '#90A4AE' },
    // Cute / character (teddy bear pastel)
    cute:       { primary: '#FF8A80', secondary: '#FFF0F0', tape: '#FFAB91' },
    // Holidays & Seasons
    christmas:  { primary: '#C62828', secondary: '#FFEBEE', tape: '#EF5350' },
    // Halloween image: deep pumpkin-orange border, bats, ghost, jack-o-lanterns
    halloween:  { primary: '#E65100', secondary: '#FFF3E0', tape: '#FF6D00' },
    easter:     { primary: '#AB47BC', secondary: '#F3E5F5', tape: '#CE93D8' },
    valentine:  { primary: '#C62828', secondary: '#FFEBEE', tape: '#E91E63' },
    winter:     { primary: '#42A5F5', secondary: '#E3F2FD', tape: '#90CAF9' },
    // Summer image: bright golden-yellow smiling sun
    summer:     { primary: '#f7ce1b', secondary: '#FFFDE7', tape: '#fbeb5a' },
    // Spring image: sky-blue border with butterfly — not mint-green
    spring:     { primary: '#29B6F6', secondary: '#E1F5FE', tape: '#81D4FA' },
    autumn:     { primary: '#EF6C00', secondary: '#FFF3E0', tape: '#FFA726' },
    fall:       { primary: '#EF6C00', secondary: '#FFF3E0', tape: '#FFA726' },
    // Food & Objects
    food:       { primary: '#F9A825', secondary: '#FFFDE7', tape: '#FDD835' },
    fruit:      { primary: '#EF6C00', secondary: '#FFF3E0', tape: '#FF8F00' },
    cake:       { primary: '#F06292', secondary: '#FCE4EC', tape: '#EF5350' },
    vehicle:    { primary: '#1E88E5', secondary: '#E3F2FD', tape: '#64B5F6' },
    // Car image: red toy car reference, orange-amber racing border
    car:        { primary: '#db2d2b', secondary: '#FFEBEE', tape: '#f53535' },
    sport:      { primary: '#7CB342', secondary: '#F1F8E9', tape: '#9CCC65' },
    mandala:    { primary: '#8E24AA', secondary: '#F3E5F5', tape: '#AB47BC' },
    // Entertainment / Pop Culture — K-pop image: cobalt-blue border, yellow stars
    kpop:       { primary: '#3949AB', secondary: '#E8EAF6', tape: '#7986CB' },
    pop:        { primary: '#3949AB', secondary: '#E8EAF6', tape: '#7986CB' },
    music:      { primary: '#3949AB', secondary: '#E8EAF6', tape: '#7986CB' },
  };

  const getCategoryAccent = (name: string) => {
    const lower = name.toLowerCase();
    const match = Object.keys(categoryColorMap).find((key) => lower.includes(key));
    return match ? categoryColorMap[match] : null;
  };

  const greyscaleColors = [
    { primary: '#6B7280', secondary: '#D1D5DB', tape: '#9CA3AF' },
    { primary: '#4B5563', secondary: '#E5E7EB', tape: '#6B7280' },
    { primary: '#374151', secondary: '#F3F4F6', tape: '#9CA3AF' },
    { primary: '#52525B', secondary: '#E4E4E7', tape: '#A1A1AA' },
    { primary: '#71717A', secondary: '#D4D4D8', tape: '#A1A1AA' },
    { primary: '#3F3F46', secondary: '#F4F4F5', tape: '#71717A' },
    { primary: '#57534E', secondary: '#E7E5E4', tape: '#78716C' },
  ];

  const fallbackColorfulColors = [
    { primary: '#FF6B6B', secondary: '#FFE66D', tape: '#FF8E8E' },
    { primary: '#4ECDC4', secondary: '#FFE66D', tape: '#7EDCD6' },
    { primary: '#A78BFA', secondary: '#FDE68A', tape: '#C4B5FD' },
    { primary: '#F472B6', secondary: '#A7F3D0', tape: '#F9A8D4' },
    { primary: '#60A5FA', secondary: '#FCD34D', tape: '#93C5FD' },
    { primary: '#34D399', secondary: '#FBBF24', tape: '#6EE7B7' },
    { primary: '#FB923C', secondary: '#C4B5FD', tape: '#FDBA74' },
  ];

  const colorIndex = title.length % fallbackColorfulColors.length;
  const accent = type === 'black-and-white'
    ? greyscaleColors[colorIndex]
    : (getCategoryAccent(categoryName) ?? fallbackColorfulColors[colorIndex]);

  return (
    <Link
      href={`/${pageSlug}`}
      className="group card-wrapper block"
      style={{
        animationDelay: `${delay}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card - Paper Style */}
      <div
        className="relative transition-all duration-500 ease-out cursor-pointer"
        style={{
          transform: isHovered
            ? 'translateY(-12px) rotate(-1deg)'
            : 'translateY(0) rotate(0deg)',
        }}
      >
        {/* Paper Shadow - Multiple layers for depth */}
        <div
          className="absolute inset-0 rounded-lg transition-all duration-500"
          style={{
            background: 'rgba(0,0,0,0.15)',
            transform: isHovered
              ? 'translate(8px, 12px) rotate(1deg)'
              : 'translate(4px, 6px)',
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute inset-0 rounded-lg transition-all duration-500"
          style={{
            background: 'rgba(0,0,0,0.08)',
            transform: isHovered
              ? 'translate(4px, 6px) rotate(0.5deg)'
              : 'translate(2px, 3px)',
            filter: 'blur(4px)',
          }}
        />

        {/* Paper Card */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            background: `linear-gradient(145deg, #FEFEFE 0%, #F8F6F1 50%, #F3F0E8 100%)`,
            boxShadow: isHovered
              ? `0 0 0 3px ${accent.primary}40, inset 0 2px 4px rgba(255,255,255,0.8)`
              : 'inset 0 2px 4px rgba(255,255,255,0.8)',
          }}
        >
          {/* Paper Texture Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative Tape - Top */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 transition-transform duration-300"
            style={{
              width: '60px',
              height: '24px',
              background: type === 'color'
                ? `linear-gradient(180deg, ${accent.tape}ee 0%, ${accent.tape}cc 100%)`
                : `linear-gradient(180deg, ${accent.tape}ee 0%, ${accent.tape}cc 100%)`,
              transform: `translateX(-50%) rotate(${isHovered ? '-2deg' : '0deg'})`,
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {/* Tape texture lines */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
            }} />
          </div>

          {/* Image Container */}
          <div className="relative aspect-[4/5] overflow-hidden m-3 mb-0 rounded-md">
            {/* Sketchy Border Effect */}
            <div
              className="absolute inset-0 z-10 pointer-events-none rounded-md"
              style={{
                boxShadow: `inset 0 0 0 2px ${accent.primary}30`,
              }}
            />

            <Image
              src={imageUrl}
              alt={`Free ${title}${categoryName ? ` ${categoryName}` : ''} Coloring Page — Printable`}
              fill
              className="object-cover transition-all duration-700 ease-out"
              style={{
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              }}
            />

            {/* Soft vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
              }}
            />

            {/* Hover Overlay with Icon */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-300 z-10"
              style={{
                background: isHovered ? `${accent.primary}20` : 'transparent',
                backdropFilter: isHovered ? 'blur(2px)' : 'none',
              }}
            >
              <div
                className="transition-all duration-500 ease-out"
                style={{
                  transform: isHovered ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
                  opacity: isHovered ? 1 : 0,
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: accent.primary }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative p-4 pt-3">
            {/* Decorative line */}
            <div
              className="absolute top-0 left-4 right-4 h-[2px] rounded-full transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent.primary}40, transparent)`,
              }}
            />

            {/* Title - Hand-drawn style */}
            <h3
              className="text-lg sm:text-xl font-bold mb-3 transition-all duration-300 font-fredoka leading-tight"
              style={{
                color: '#2D2A32',
                textShadow: isHovered ? `1px 1px 0 ${accent.primary}30` : 'none',
              }}
            >
              {title.replace(/\s*coloring\s*page\s*$/i, '').trim()}
            </h3>

            {/* Download Button - Crayon/Marker Style */}
            <Link
              href={downloadUrl}
              className="relative block w-full py-3 px-4 rounded-xl font-bold text-center transition-all duration-300 overflow-hidden font-dm-sans text-sm sm:text-base"
              style={{
                background: isHovered
                  ? `linear-gradient(135deg, ${accent.primary} 0%, ${accent.primary}dd 100%)`
                  : `linear-gradient(135deg, ${accent.primary}ee 0%, ${accent.primary}cc 100%)`,
                color: 'white',
                boxShadow: isHovered
                  ? `0 6px 20px ${accent.primary}50, inset 0 -2px 0 rgba(0,0,0,0.15)`
                  : `0 4px 12px ${accent.primary}30, inset 0 -2px 0 rgba(0,0,0,0.1)`,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              {/* Button texture */}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Free Download
              </span>

              {/* Shine effect */}
              <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-500"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.3) 55%, transparent 60%)',
                  transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
                }}
              />
            </Link>

            {/* Small decorative dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: accent.primary,
                    opacity: isHovered ? 0.8 : 0.4,
                    transform: isHovered ? `scale(1.2) translateY(-${i}px)` : 'scale(1)',
                    transitionDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Corner fold effect */}
          <div
            className="absolute bottom-0 right-0 w-8 h-8 transition-all duration-300 z-20"
            style={{
              background: `linear-gradient(135deg, transparent 50%, #E8E4DB 50%, #DDD8CC 100%)`,
              boxShadow: '-2px -2px 4px rgba(0,0,0,0.05)',
              opacity: isHovered ? 1 : 0.6,
            }}
          />
        </div>
      </div>

    </Link>
  );
}
