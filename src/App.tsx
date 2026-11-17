import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { StatsSection } from './components/StatsSection';
import { Footer } from './components/Footer';
import { AssetsViewer } from './components/tools/AssetsViewer';
import { ReminiEnhancer } from './components/tools/ReminiEnhancer';
import { ImageUpscaler } from './components/tools/ImageUpscaler';
import { OBTracker } from './components/tools/OBTracker';
import { ExternalEmbedModal } from './components/tools/ExternalEmbedModal';
import { TOOLS } from './data/tools';
import { ToolItem } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [externalToolModal, setExternalToolModal] = useState<ToolItem | null>(null);

  // Sync with browser URL / hash if user visits direct path
  useEffect(() => {
    const handleUrl = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('asset')) {
        setActiveView('assets');
      } else if (path.includes('enhance')) {
        setActiveView('enhance');
      } else if (path.includes('hd') || path.includes('upscale')) {
        setActiveView('hd');
      } else if (path.includes('ob')) {
        setActiveView('ob');
      }
    };
    handleUrl();
    window.addEventListener('popstate', handleUrl);
    return () => window.removeEventListener('popstate', handleUrl);
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const q = searchQuery.toLowerCase();
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleOpenInternal = (toolId: string) => {
    setActiveView(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenExternal = (tool: ToolItem) => {
    setExternalToolModal(tool);
  };

  const handleExploreScroll = () => {
    setActiveView('home');
    setTimeout(() => {
      const el = document.getElementById('tools');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background decorations */}
      <div className="bg-mesh" />
      <div className="grid-pattern" />

      {/* Navigation */}
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 relative z-10">
        {activeView === 'home' && (
          <>
            <Hero
              onExplore={handleExploreScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Featured Utilities ({filteredTools.length})
                </h2>
                {searchQuery && (
                  <span className="text-xs text-cyan-400">
                    Showing results for &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </div>
              <ToolGrid
                tools={filteredTools}
                onOpenInternal={handleOpenInternal}
                onOpenExternal={handleOpenExternal}
              />
            </div>
            <StatsSection />
          </>
        )}

        {activeView === 'assets' && (
          <AssetsViewer onBack={() => setActiveView('home')} />
        )}

        {activeView === 'enhance' && (
          <ReminiEnhancer onBack={() => setActiveView('home')} />
        )}

        {activeView === 'hd' && (
          <ImageUpscaler onBack={() => setActiveView('home')} />
        )}

        {activeView === 'ob' && (
          <OBTracker onBack={() => setActiveView('home')} />
        )}
      </main>

      {/* External Tool Modal Preview */}
      <ExternalEmbedModal
        tool={externalToolModal}
        onClose={() => setExternalToolModal(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
