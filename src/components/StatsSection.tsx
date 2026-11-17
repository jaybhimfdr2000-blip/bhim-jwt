import React, { useEffect, useState } from 'react';

export const StatsSection: React.FC = () => {
  const [toolsCount, setToolsCount] = useState(0);
  const [freePercent, setFreePercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setToolsCount((prev) => (prev < 10 ? prev + 1 : 10));
      setFreePercent((prev) => (prev < 100 ? prev + 5 : 100));
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="my-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1 */}
        <div className="p-6 rounded-2xl bg-[#0a0f1d]/80 border border-white/5 text-center relative overflow-hidden group hover:border-cyan-500/30 transition shadow-lg">
          <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-mono">
            {toolsCount}+
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-1">
            Tools Available
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-6 rounded-2xl bg-[#0a0f1d]/80 border border-white/5 text-center relative overflow-hidden group hover:border-emerald-500/30 transition shadow-lg">
          <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 font-mono">
            {freePercent}%
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-1">
            Free to Use
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-6 rounded-2xl bg-[#0a0f1d]/80 border border-white/5 text-center relative overflow-hidden group hover:border-orange-500/30 transition shadow-lg">
          <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-mono">
            24/7
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-1">
            Always Online
          </div>
        </div>
      </div>
    </section>
  );
};
