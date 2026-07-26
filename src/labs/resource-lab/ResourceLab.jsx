import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, LayoutTemplate, BookOpen, Link, ArrowLeft, Maximize2 } from 'lucide-react';
import RESOURCES_DATA from './resources.json';

const INITIAL_RESOURCES = RESOURCES_DATA.map((resource, id) => ({ id, ...resource }));

export default function ResourceLab({ onClose, onBack }) {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [activeResourceId, setActiveResourceId] = useState(null);

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

  const activeResource = useMemo(
    () => resources.find((r) => r.id === activeResourceId),
    [resources, activeResourceId]
  );

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1e1e] flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-white/10 gap-3">
          <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen size={18} />
          </div>
          <h1 className="font-semibold text-lg">Resources</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => setActiveResourceId(resource.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                activeResourceId === resource.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                  : 'bg-slate-50 dark:bg-[#252525] border-transparent hover:border-slate-300 dark:hover:border-white/10 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-medium ${activeResourceId === resource.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                  {resource.title}
                </h3>
                {resource.embeddable === false ? (
                  <ExternalLink size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                ) : (
                  <LayoutTemplate size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                )}
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
                  <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 max-w-[300px] truncate">
                    {activeResource.url}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeResource.url}
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
                    href={activeResource.url}
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
                  src={activeResource.url}
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
