import React from 'react';
import { Youtube, Send, Facebook, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 pt-8 pb-12 border-t border-white/5 text-center">
      <div className="max-w-6xl mx-auto px-4">
        <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">
          Follow Shah G Creator
        </h4>

        {/* Social Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <a
            href="https://www.youtube.com/@ShahGCreator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-xs font-semibold transition"
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube</span>
          </a>

          <a
            href="https://t.me/ShahGCreator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-sky-500/10 text-slate-300 hover:text-sky-400 border border-white/5 hover:border-sky-500/20 text-xs font-semibold transition"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>Telegram</span>
          </a>

          <a
            href="https://facebook.com/@ShahGCreator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 border border-white/5 hover:border-blue-500/20 text-xs font-semibold transition"
          >
            <Facebook className="w-4 h-4 text-blue-500" />
            <span>Facebook</span>
          </a>

          <a
            href="https://instagram.com/ShahGCreator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-pink-500/10 text-slate-300 hover:text-pink-400 border border-white/5 hover:border-pink-500/20 text-xs font-semibold transition"
          >
            <Instagram className="w-4 h-4 text-pink-500" />
            <span>Instagram</span>
          </a>
        </div>

        {/* Copy */}
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()}{' '}
          <a
            href="https://www.youtube.com/@ShahGCreator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition underline underline-offset-4"
          >
            Shah G Creator
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};
