import React from 'react';
import { ArrowDown, Youtube, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, searchQuery, setSearchQuery }) => {
  return (
    <section className="relative pt-12 pb-8 md:pt-16 md:pb-12 text-center">
      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/[0.04] border border-white/10 text-cyan-400 mb-6 shadow-[0_0_20px_rgba(0,212,255,0.15)]">
        <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
        <span>ALL-IN-ONE PLATFORM</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
        Free Fire Tools{' '}
        <span className="block mt-1 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,212,255,0.3)]">
          Collection
        </span>
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed mb-8 px-4">
        Fast, reliable &amp; free utilities for Free Fire creators and players. Choose a tool below to get started,
        view CDN asset files, upscale photos, or track OB update schedules.
      </p>

      {/* Search Input Bar */}
      <div className="max-w-md mx-auto mb-8 px-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. Assets, Remini, OB, Maps)..."
            className="w-full pl-11 pr-4 py-3 bg-[#0d1322] border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white px-1.5 py-0.5 rounded-full bg-white/5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onExplore}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-[0_0_25px_rgba(0,212,255,0.35)] hover:shadow-[0_0_35px_rgba(0,212,255,0.55)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
        >
          <span>Explore Tools</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </button>

        <a
          href="https://www.youtube.com/@ShahGCreator"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 font-semibold text-sm hover:border-white/20 transition cursor-pointer"
        >
          <Youtube className="w-4 h-4 text-red-400" />
          <span>YouTube Channel</span>
        </a>
      </div>
    </section>
  );
};
