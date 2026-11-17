import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Globe, Sparkles } from 'lucide-react';
import { CountryTz } from '../../types';

interface OBTrackerProps {
  onBack: () => void;
}

const COUNTRIES: Record<string, CountryTz> = {
  BR: { timezone: 'America/Sao_Paulo', flag: '🇧🇷', name: 'Brazil (BR)', code: 'BR' },
  SAC: { timezone: 'America/Los_Angeles', flag: '🇺🇸', name: 'Sacramento (SAC)', code: 'SAC' },
  ID: { timezone: 'Asia/Jakarta', flag: '🇮🇩', name: 'Indonesia (ID)', code: 'ID' },
  NA: { timezone: 'Africa/Windhoek', flag: '🇳🇦', name: 'Namibia (NA)', code: 'NA' },
  US: { timezone: 'America/New_York', flag: '🇺🇸', name: 'USA (US)', code: 'US' },
  IND: { timezone: 'Asia/Kolkata', flag: '🇮🇳', name: 'India (IND)', code: 'IND' },
  SG: { timezone: 'Asia/Singapore', flag: '🇸🇬', name: 'Singapore (SG)', code: 'SG' },
  BD: { timezone: 'Asia/Dhaka', flag: '🇧🇩', name: 'Bangladesh (BD)', code: 'BD' },
  VN: { timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳', name: 'Vietnam (VN)', code: 'VN' },
  TH: { timezone: 'Asia/Bangkok', flag: '🇹🇭', name: 'Thailand (TH)', code: 'TH' },
  ME: { timezone: 'Europe/Podgorica', flag: '🇲🇪', name: 'Montenegro (ME)', code: 'ME' },
  RU: { timezone: 'Europe/Moscow', flag: '🇷🇺', name: 'Russia (RU)', code: 'RU' },
  EU: { timezone: 'Europe/Berlin', flag: '🇪🇺', name: 'Europe (EU)', code: 'EU' },
  PK: { timezone: 'Asia/Karachi', flag: '🇵🇰', name: 'Pakistan (PK)', code: 'PK' },
  TW: { timezone: 'Asia/Taipei', flag: '🇹🇼', name: 'Taiwan (TW)', code: 'TW' },
};

const OB_UPDATES = [
  {
    version: 'OB56',
    dateUtc: '2026-12-16T04:00:00Z',
    notes: 'Winter Patch · Next Major OB Update',
  },
  {
    version: 'OB57',
    dateUtc: '2027-03-17T04:00:00Z',
    notes: 'Spring Patch · Ranked Season Reset',
  },
  {
    version: 'OB58',
    dateUtc: '2027-06-16T04:00:00Z',
    notes: 'Summer Anniversary · Big Collaboration',
  },
];

export const OBTracker: React.FC<OBTrackerProps> = ({ onBack }) => {
  const [selectedTz, setSelectedTz] = useState<string>('Asia/Kolkata');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Auto-detect timezone
    try {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const matched = Object.values(COUNTRIES).find((c) => c.timezone === browserTz);
      if (matched) {
        setSelectedTz(matched.timezone);
      }
    } catch (e) {
      // fallback
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const diffParts = (ms: number) => {
    ms = Math.max(ms, 0);
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    return { d, h, m, s };
  };

  const getLocalizedTime = (dateStr: string, tz: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: tz,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative my-6 rounded-3xl bg-[#090e1c] border border-white/10 p-4 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔆</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Free Fire Update Tracker</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Live Timers
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live countdown and localized launch schedule • by ShahGCreator
            </p>
          </div>
        </div>

        {/* Current Version badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-xs">
          <span className="text-slate-400">Current Live Patch:</span>
          <span className="font-extrabold text-orange-400 text-sm">OB55</span>
        </div>
      </div>

      {/* Region Selector */}
      <div className="my-6 max-w-md mx-auto text-center space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>Select Your Region / Timezone</span>
        </label>
        <div className="relative">
          <select
            value={selectedTz}
            onChange={(e) => setSelectedTz(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#050810] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer shadow-inner"
          >
            {Object.values(COUNTRIES).map((c) => (
              <option key={c.timezone} value={c.timezone} className="bg-[#090e1c] text-white">
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Countdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
        {OB_UPDATES.map((item) => {
          const targetTime = new Date(item.dateUtc).getTime();
          const diff = targetTime - now;
          const { d, h, m, s } = diffParts(diff);
          const badgeText = d === 0 ? 'Today' : `In ${d} day${d === 1 ? '' : 's'}`;
          const localString = getLocalizedTime(item.dateUtc, selectedTz);

          return (
            <div
              key={item.version}
              className="relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-5 hover:border-amber-500/30 transition-all duration-300 group shadow-lg"
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {badgeText}
                </span>
                <Clock className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
              </div>

              {/* Version title */}
              <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition">
                {item.version}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-3">{item.notes}</p>

              {/* Local time */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/[0.02] p-2 rounded-lg border border-white/5 mb-4 font-mono">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{localString}</span>
              </div>

              {/* Countdown Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">
                    {pad(d)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">
                    Days
                  </span>
                </div>
                <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">
                    {pad(h)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">
                    Hours
                  </span>
                </div>
                <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">
                    {pad(m)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">
                    Min
                  </span>
                </div>
                <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">
                    {pad(s)}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-0.5">
                    Sec
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
