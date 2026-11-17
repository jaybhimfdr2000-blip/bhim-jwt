import React from 'react';
import { Sparkles, Youtube, ExternalLink, Flame } from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#050810]/80 border-b border-white/5 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 text-left group transition cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-orange-500 p-[1.5px] shadow-[0_0_20px_rgba(0,212,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] transition">
            <div className="w-full h-full bg-[#090d1a] rounded-[10px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-sm md:text-base text-white group-hover:text-cyan-400 transition">
                SHAH G CREATOR
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Free Fire Tools Portal</p>
          </div>
        </button>

        {/* View Switchers */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 text-xs font-medium">
          <button
            onClick={() => setActiveView('home')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeView === 'home'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            All Tools
          </button>
          <button
            onClick={() => setActiveView('assets')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'assets'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🧩</span> Assets Viewer
          </button>
          <button
            onClick={() => setActiveView('enhance')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'enhance'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🪄</span> Remini AI
          </button>
          <button
            onClick={() => setActiveView('hd')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'hd'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>✨</span> 4X HD
          </button>
          <button
            onClick={() => setActiveView('ob')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeView === 'ob'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🔆</span> OB Updates
          </button>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <a
            href="https://www.youtube.com/@ShahGCreator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-semibold transition"
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">YouTube</span>
          </a>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-white/5 bg-[#070b16]">
        <button
          onClick={() => setActiveView('home')}
          className={`shrink-0 px-2.5 py-1 text-xs rounded-md ${
            activeView === 'home' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          All Tools
        </button>
        <button
          onClick={() => setActiveView('assets')}
          className={`shrink-0 px-2.5 py-1 text-xs rounded-md flex items-center gap-1 ${
            activeView === 'assets' ? 'bg-orange-500/20 text-orange-300 font-medium' : 'text-slate-400'
          }`}
        >
          🧩 Assets
        </button>
        <button
          onClick={() => setActiveView('enhance')}
          className={`shrink-0 px-2.5 py-1 text-xs rounded-md flex items-center gap-1 ${
            activeView === 'enhance' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400'
          }`}
        >
          🪄 Remini
        </button>
        <button
          onClick={() => setActiveView('hd')}
          className={`shrink-0 px-2.5 py-1 text-xs rounded-md flex items-center gap-1 ${
            activeView === 'hd' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
          }`}
        >
          ✨ 4X HD
        </button>
        <button
          onClick={() => setActiveView('ob')}
          className={`shrink-0 px-2.5 py-1 text-xs rounded-md flex items-center gap-1 ${
            activeView === 'ob' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400'
          }`}
        >
          🔆 OB Dates
        </button>
      </div>
    </header>
  );
};
