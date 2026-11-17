import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Download, Copy, Check, Search, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { AssetCategory, AssetFile } from '../../types';

interface AssetsViewerProps {
  onBack: () => void;
}

export const AssetsViewer: React.FC<AssetsViewerProps> = ({ onBack }) => {
  const [serverType, setServerType] = useState<'live' | 'advance'>('live');
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<AssetCategory | null>(null);
  const [files, setFiles] = useState<AssetFile[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Icon helper matching original site
  const getCatIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('char') || n.includes('hero')) return '👤';
    if (n.includes('vfx') || n.includes('effect')) return '✨';
    if (n.includes('anim')) return '🎬';
    if (n.includes('ui')) return '🖥️';
    if (n.includes('map') || n.includes('scene')) return '🗺️';
    if (n.includes('audio') || n.includes('sound')) return '🔊';
    if (n.includes('shader')) return '🎨';
    if (n.includes('tex')) return '🖼️';
    if (n.includes('weapon') || n.includes('gun')) return '🔫';
    if (n.includes('vehicle')) return '🚗';
    return '📦';
  };

  // Load Categories for chosen server
  const loadCategories = async (type: 'live' | 'advance') => {
    setLoadingCats(true);
    setErrorMsg(null);
    setSelectedCat(null);
    setFiles([]);
    try {
      const res = await fetch(`/api/assets?type=${type}`);
      const data = await res.json();
      if (!data.remote_option_version) {
        throw new Error(data.error || 'No categories returned by server');
      }

      const parsed: AssetCategory[] = [];
      data.remote_option_version.split('|').forEach((item: string) => {
        if (!item.includes(':')) return;
        const [k, v] = item.split(':');
        if (v === '0') return;
        parsed.push({ k, v });
      });

      setCategories(parsed);
      if (parsed.length > 0) {
        // Auto select first category
        loadFiles(parsed[0], type);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not connect to assets server');
    } finally {
      setLoadingCats(false);
    }
  };

  // Load files for selected category
  const loadFiles = async (cat: AssetCategory, type: 'live' | 'advance' = serverType) => {
    setSelectedCat(cat);
    setLoadingFiles(true);
    setFileSearch('');
    try {
      const res = await fetch(
        `/api/assets/files?btype=${encodeURIComponent(type)}&cat=${encodeURIComponent(cat.k)}&ver=${encodeURIComponent(cat.v)}`
      );
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFiles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load asset files');
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadCategories(serverType);
  }, [serverType]);

  const filteredCats = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const q = catSearch.toLowerCase();
    return categories.filter((c) => c.k.toLowerCase().includes(q));
  }, [categories, catSearch]);

  const filteredFiles = useMemo(() => {
    if (!fileSearch.trim()) return files;
    const q = fileSearch.toLowerCase();
    return files.filter((f) => f.filename.toLowerCase().includes(q));
  }, [files, fileSearch]);

  const copyAllUrls = () => {
    if (!files.length) return;
    const urls = files.map((f) => f.url).join('\n');
    navigator.clipboard.writeText(urls).then(() => {
      showToast(`Copied ${files.length} URLs to clipboard!`);
    });
  };

  const copySingleUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      showToast('URL copied to clipboard!');
    });
  };

  return (
    <div className="relative my-6 rounded-3xl bg-[#090e1c] border border-white/10 p-4 sm:p-6 shadow-2xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 text-white font-medium text-xs shadow-2xl shadow-cyan-500/50 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
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
              <span className="text-xl">🧩</span>
              <h2 className="text-lg sm:text-xl font-bold text-white">Free Fire Asset Viewer</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                CDN Browser
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct access to live &amp; advance server asset bundles hosted on Garena CDN
            </p>
          </div>
        </div>

        {/* Server Type Selector */}
        <div className="flex items-center gap-2 bg-[#050810] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setServerType('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              serverType === 'live'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            LIVE SERVER
          </button>
          <button
            onClick={() => setServerType('advance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              serverType === 'advance'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            ADVANCE SERVER
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div className="my-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-red-300 mb-1">Server Connection Error</h4>
          <p className="text-xs text-slate-400 mb-4">{errorMsg}</p>
          <button
            onClick={() => loadCategories(serverType)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : (
        /* Main Two-Column Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
          {/* Categories Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                Categories ({categories.length})
              </span>
              <button
                onClick={() => loadCategories(serverType)}
                className="text-xs text-slate-400 hover:text-cyan-400 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCats ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Category Search */}
            <div className="relative">
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Filter categories..."
                className="w-full pl-8 pr-3 py-2 bg-[#050810] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>

            {/* Category Items List */}
            <div className="max-h-[500px] overflow-y-auto space-y-1 pr-1">
              {loadingCats ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading Categories...
                </div>
              ) : filteredCats.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No categories found</div>
              ) : (
                filteredCats.map((cat) => {
                  const isSelected = selectedCat?.k === cat.k;
                  return (
                    <button
                      key={cat.k}
                      onClick={() => loadFiles(cat)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/20 border border-orange-500/40 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.15)] font-semibold'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{getCatIcon(cat.k)}</span>
                        <div className="min-w-0">
                          <p className="text-xs truncate">{cat.k}</p>
                          <p className="text-[10px] text-slate-500">v{cat.v}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">›</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Files Browser */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-3">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#050810] p-3 rounded-2xl border border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{selectedCat?.k || 'Select a Category'}</span>
                  {selectedCat && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                      v{selectedCat.v} · {serverType.toUpperCase()}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {files.length} asset bundle files available
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search in files */}
                <div className="relative">
                  <input
                    type="text"
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    placeholder="Search file name..."
                    className="w-40 sm:w-56 pl-7 pr-3 py-1.5 bg-[#090e1c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>

                {/* Copy All Button */}
                {files.length > 0 && (
                  <button
                    onClick={copyAllUrls}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-semibold transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span className="hidden sm:inline">Copy All URLs</span>
                  </button>
                )}
              </div>
            </div>

            {/* Files List Table */}
            <div className="bg-[#050810] border border-white/10 rounded-2xl overflow-hidden min-h-[350px] max-h-[500px] flex flex-col">
              {loadingFiles ? (
                <div className="m-auto text-center py-16 text-slate-400 text-xs">
                  <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Fetching Asset Bundle URLs from CDN...
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="m-auto text-center py-16 text-slate-500 text-xs">
                  {files.length === 0 ? 'No files in this category' : 'No files match your search'}
                </div>
              ) : (
                <div className="overflow-y-auto overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-[#0d1322] border-b border-white/10 text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-slate-500 font-medium">#</th>
                        <th className="py-2.5 px-4 font-medium">File Name</th>
                        <th className="py-2.5 px-4 w-32 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredFiles.map((file, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.03] transition group">
                          <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-300 group-hover:text-cyan-300 transition break-all">
                            {file.filename}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => copySingleUrl(file.url)}
                                title="Copy URL"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={file.filename}
                                title="Download Asset Bundle"
                                className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 transition flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
