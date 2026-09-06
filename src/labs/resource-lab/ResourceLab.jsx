import { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink, LayoutTemplate, BookOpen, Link, ArrowLeft, Maximize2, Search, Star } from 'lucide-react';
import RESOURCES_DATA from './resources.json';

const INITIAL_RESOURCES = RESOURCES_DATA.map((resource, id) => ({ id, ...resource }));

export default function ResourceLab({ onClose, onBack }) {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  
  const [activeResourceId, setActiveResourceId] = useState(() => {
    try {
      const stored = localStorage.getItem('resourceLab_activeId');
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('resourceLab_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedUrls, setSavedUrls] = useState(() => {
    try {
      const stored = localStorage.getItem('resourceLab_savedUrls');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const sidebarRef = useRef(null);
  
  const [sidebarScrollPos] = useState(() => {
    try {
      const stored = localStorage.getItem('resourceLab_scrollPos');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleScroll = (e) => {
    localStorage.setItem('resourceLab_scrollPos', e.target.scrollTop.toString());
  };

  useEffect(() => {
    if (sidebarRef.current && sidebarScrollPos > 0) {
      sidebarRef.current.scrollTop = sidebarScrollPos;
    }
  }, [sidebarScrollPos]);

  useEffect(() => {
    let mounted = true;
    resources.forEach(async (resource) => {
      try {
        const res = await fetch(`/api/check-embed?url=${encodeURIComponent(resource.url)}&origin=${encodeURIComponent(window.location.origin)}`);
        const data = await res.json();
        if (mounted && data && typeof data.embeddable === 'boolean') {
          setResources(prev => prev.map(r => r.id === resource.id ? { ...r, embeddable: data.embeddable } : r));
        }
      } catch (err) {
        // Silently fail
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('resourceLab_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (activeResourceId !== null) {
      localStorage.setItem('resourceLab_activeId', activeResourceId.toString());
    } else {
      localStorage.removeItem('resourceLab_activeId');
    }
  }, [activeResourceId]);

  const activeResource = useMemo(
    () => resources.find((r) => r.id === activeResourceId),
    [resources, activeResourceId]
  );

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      if (showFavorites && !favorites.includes(r.id)) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [resources, showFavorites, favorites, searchQuery]);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleIframeLoad = (e) => {
    try {
      const currentUrl = e.target.contentWindow.location.href;
      if (currentUrl && currentUrl !== 'about:blank' && activeResourceId !== null) {
        setSavedUrls(prev => {
          if (prev[activeResourceId] === currentUrl) return prev;
          const next = { ...prev, [activeResourceId]: currentUrl };
          localStorage.setItem('resourceLab_savedUrls', JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      // Browser blocked access due to cross-origin policies.
    }
  };

  const resetUrl = () => {
    if (!activeResource) return;
    setSavedUrls(prev => {
      const next = { ...prev };
      delete next[activeResource.id];
      localStorage.setItem('resourceLab_savedUrls', JSON.stringify(next));
      return next;
    });
  };

  const displayUrl = activeResource ? (savedUrls[activeResource.id] || activeResource.url) : '';

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1e1e] flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-white/10 gap-3">
          <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen size={18} />
          </div>
          <h1 className="font-semibold text-lg flex-1">Resources</h1>
          <button 
            onClick={() => setShowFavorites(!showFavorites)}
            className={`p-1.5 rounded-md transition-colors ${showFavorites ? 'text-yellow-500 bg-yellow-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
            title="Toggle Favorites"
          >
            <Star size={18} fill={showFavorites ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="p-3 border-b border-slate-200 dark:border-white/10">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-[#252525] border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-1 focus:ring-indigo-500 transition-all text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div 
          ref={sidebarRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 space-y-2"
        >
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => setActiveResourceId(resource.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all border group relative ${
                activeResourceId === resource.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                  : 'bg-slate-50 dark:bg-[#252525] border-transparent hover:border-slate-300 dark:hover:border-white/10 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-medium pr-6 ${activeResourceId === resource.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                  {resource.title}
                </h3>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <button 
                    onClick={(e) => toggleFavorite(e, resource.id)}
                    className={`absolute top-3 right-3 p-1 rounded-full transition-opacity ${favorites.includes(resource.id) ? 'opacity-100 text-yellow-500' : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-yellow-500'}`}
                  >
                    <Star size={14} fill={favorites.includes(resource.id) ? "currentColor" : "none"} />
                  </button>
                  {resource.embeddable === false ? (
                    <ExternalLink size={16} className="text-slate-400 mt-6" />
                  ) : (
                    <LayoutTemplate size={16} className="text-slate-400 mt-6" />
                  )}
                </div>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {resource.description}
              </p>
              
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {resource.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-xs text-slate-600 dark:text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {filteredResources.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              No resources found.
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-100 dark:bg-[#121212] overflow-hidden relative">
        {activeResource ? (
          <>
            <div className="h-12 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1e1e] flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveResourceId(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-500 transition-colors hidden md:block"
                  title="Close viewer"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activeResource.title}</span>
                  <div className="flex items-center group/url">
                    <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 max-w-[300px] truncate" title={displayUrl}>
                      {displayUrl}
                    </span>
                    {savedUrls[activeResource.id] && savedUrls[activeResource.id] !== activeResource.url && (
                      <button 
                        onClick={resetUrl}
                        className="ml-2 text-xs text-slate-400 hover:text-indigo-500 opacity-0 group-hover/url:opacity-100 transition-opacity"
                        title="Reset to original URL"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-500 transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                  <span>Open</span>
                </a>
              </div>
            </div>
            <div className="flex-1 w-full bg-white dark:bg-[#121212] relative overflow-y-auto">
              {activeResource.embeddable === false ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#1a1a1a]">
                  <div className="text-5xl mb-6">😠</div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                    Embed Blocked
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
                    This page cannot be viewed directly inside the lab because the page author does not believe in free and open-source education. They have explicitly blocked this site from being embedded.
                  </p>
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Open Externally Anyway
                  </a>
                </div>
              ) : (
                <iframe
                  src={displayUrl}
                  onLoad={handleIframeLoad}
                  className="w-full h-full border-none absolute inset-0 bg-white"
                  title={activeResource.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-[#252525] flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 shadow-inner">
              <BookOpen size={32} />
            </div>
            <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">Select a Resource</h2>
            <p className="max-w-sm text-sm leading-relaxed">
              Choose a resource from the sidebar to view it here. Links marked with an external icon will open in a new tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
