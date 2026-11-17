import React from 'react';
import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { ToolItem } from '../types';

interface ToolGridProps {
  tools: ToolItem[];
  onOpenInternal: (toolId: string) => void;
  onOpenExternal: (tool: ToolItem) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, onOpenInternal, onOpenExternal }) => {
  const getColorStyles = (color: ToolItem['color']) => {
    switch (color) {
      case 'violet':
        return {
          iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20 group-hover:border-violet-500/40',
          glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]',
          badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
          arrow: 'text-violet-400 group-hover:translate-x-1',
        };
      case 'orange':
        return {
          iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20 group-hover:border-orange-500/40',
          glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]',
          badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
          arrow: 'text-orange-400 group-hover:translate-x-1',
        };
      case 'green':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40',
          glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          arrow: 'text-emerald-400 group-hover:translate-x-1',
        };
      case 'pink':
        return {
          iconBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20 group-hover:border-pink-500/40',
          glow: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]',
          badge: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
          arrow: 'text-pink-400 group-hover:translate-x-1',
        };
      case 'blue':
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:border-cyan-500/40',
          glow: 'group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          arrow: 'text-cyan-400 group-hover:translate-x-1',
        };
      case 'yellow':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:border-amber-500/40',
          glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          arrow: 'text-amber-400 group-hover:translate-x-1',
        };
    }
  };

  return (
    <div id="tools" className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      {tools.map((tool) => {
        const style = getColorStyles(tool.color);

        return (
          <div
            key={tool.id}
            onClick={() => {
              if (tool.isInternal) {
                onOpenInternal(tool.id);
              } else {
                onOpenExternal(tool);
              }
            }}
            className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#0a0f1d]/90 border border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer ${style.glow} hover:-translate-y-1`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all shrink-0 ${style.iconBg}`}
              >
                {tool.icon}
              </div>

              {/* Title & Desc */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition truncate">
                    {tool.name}
                  </h3>
                  {tool.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}
                    >
                      {tool.badge}
                    </span>
                  )}
                  {tool.isInternal && (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      APP
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition truncate mt-0.5">
                  {tool.desc}
                </p>
              </div>
            </div>

            {/* Arrow / Action */}
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] group-hover:bg-white/[0.08] transition ${style.arrow}`}
              >
                {tool.isInternal ? (
                  <ArrowRight className="w-4 h-4 transition-transform duration-300" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
