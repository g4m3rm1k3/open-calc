import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Search, Video, ChevronRight, Play, Layout, Menu, Plus, Globe, Trash2 } from 'lucide-react';
import { useVideoPlayer } from '../../context/VideoPlayerContext.jsx';
import { VIDEO_PLACEMENT_MAP } from '../../content/videos/videoPlacementMap.js';
import { VIDEO_DATABASE } from '../../content/videos/videoDatabase.js';

export default function FloatingVideoPlayer() {
  const { 
    isOpen, isMinimized, currentVideo, lessonId, 
    searchQuery, setSearchQuery, 
    closePlayer, toggleMinimize, selectVideo,
    customVideos, addCustomVideo
  } = useVideoPlayer();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(550);

  // Group videos for the current lesson by section
  const currentLessonVideos = useMemo(() => {
    if (!lessonId) return null;
    const placement = VIDEO_PLACEMENT_MAP[lessonId] || {};
    const custom = customVideos[lessonId] || [];

    const categorized = {};

    if (custom.length > 0) {
      categorized['Your Videos'] = custom;
    }

    ['hook', 'intuition', 'math', 'rigor', 'examples'].forEach(section => {
      const ids = section === 'examples' 
        ? Object.values(placement[section] || {}).flat() 
        : (placement[section] || []);
      
      const vids = ids.map(id => ({ ...VIDEO_DATABASE[id], id })).filter(v => v.url);
      if (vids.length > 0) categorized[section] = vids;
    });
    return categorized;
  }, [lessonId, customVideos]);

  const allVideos = useMemo(() => {
    const list = Object.entries(VIDEO_DATABASE).map(([id, meta]) => ({ ...meta, id }));
    // Append all custom videos too
    Object.values(customVideos).flat().forEach(cv => list.push(cv));

    if (!searchQuery) return list;
    return list.filter(v => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, customVideos]);

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customUrl) {
      addCustomVideo(customUrl, customTitle);
      setCustomUrl('');
      setCustomTitle('');
      setShowAddForm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Minimized Dock Bar */}
      {isMinimized && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 right-8 z-[9999] bg-slate-900 border-x border-t border-slate-700 rounded-t-xl px-5 py-4 shadow-2xl flex items-center gap-6 cursor-pointer hover:bg-slate-800 transition-all border-b-4 border-b-brand-500 min-w-[300px]"
          onClick={toggleMinimize}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Play size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] leading-none mb-1.5">Tutorial Hub</p>
              <h4 className="text-sm font-bold text-white leading-none tracking-tight">
                {currentVideo?.title ? currentVideo.title : 'Videos & Tutorials'}
              </h4>
            </div>
          </div>
          <div className="flex-1" />
          <button className="text-slate-500 hover:text-white transition-colors">
            <Maximize2 size={18} />
          </button>
        </motion.div>
      )}

      {/* Main Player Window */}
      {!isMinimized && (
        <motion.div
          layoutId="video-player"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          drag
          dragMomentum={false}
          style={{ width, height }}
          className="fixed top-20 right-8 z-[9998] bg-white dark:bg-slate-900 rounded-2xl shadow-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col resize"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 cursor-move">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Video size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[400px]">
                {currentVideo?.title || 'Video Library'}
              </h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleMinimize}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"
                title="Minimize to Dock"
              >
                <Minus size={18} />
              </button>
              <button 
                onClick={closePlayer}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 rounded-lg text-slate-500 dark:text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar (Navigation) */}
            <div 
              className={`flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
                sidebarOpen ? 'w-72' : 'w-0'
              } overflow-hidden flex flex-col`}
            >
              {/* Tabs / Search area */}
              <div className="p-3 space-y-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search all videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-brand-500 hover:border-brand-500 transition-all"
                >
                  <Plus size={12} /> Add Custom Video
                </button>
              </div>

              {/* Add Custom Video Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddCustom}
                    className="p-3 bg-brand-50/50 dark:bg-brand-950/20 border-b border-brand-100 dark:border-brand-900/50 space-y-2 overflow-hidden"
                  >
                    <input 
                      type="text" 
                      placeholder="YouTube URL" 
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="w-full px-2 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Video Title (optional)" 
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-2 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                    <div className="flex gap-2">
                       <button type="submit" className="flex-1 bg-brand-600 text-white text-[10px] font-bold py-1.5 rounded hover:bg-brand-500 transition-colors">Add to Lesson</button>
                       <button type="button" onClick={() => setShowAddForm(false)} className="px-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={14} /></button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Video List */}
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {searchQuery ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">Search Results</p>
                    {allVideos.length === 0 && (
                      <p className="text-xs text-slate-500 px-2 py-4 italic text-center">No results found</p>
                    )}
                    {allVideos.map(vid => (
                      <VideoRow key={vid.id} video={vid} active={vid.id === currentVideo?.id} onClick={() => selectVideo(vid)} />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Current Lesson Context */}
                    {currentLessonVideos && Object.entries(currentLessonVideos).map(([section, vids]) => (
                      <div key={section} className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400 px-2 py-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Layout size={10} /> {section}</span>
                          <span className="text-[9px] opacity-60 bg-slate-100 dark:bg-slate-800 px-1 rounded">{vids.length}</span>
                        </p>
                        <div className="space-y-0.5">
                          {vids.map(vid => (
                            <VideoRow key={vid.id} video={vid} active={vid.id === currentVideo?.id} onClick={() => selectVideo(vid)} />
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Browse All (Paginated or categorized by chapter) */}
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">All Library Videos</p>
                      <div className="space-y-0.5">
                        {allVideos.slice(0, 15).map(vid => (
                          <VideoRow key={vid.id} video={vid} active={vid.id === currentVideo?.id} onClick={() => selectVideo(vid)} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative bg-black flex flex-col group">
              {/* Toggle Sidebar Button */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-4 h-20 bg-slate-800/80 hover:bg-slate-700 text-white rounded-r-lg flex items-center justify-center border-y border-r border-slate-700 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={14} className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
              </button>

              {currentVideo ? (
                <div className="flex-1 select-none pointer-events-auto">
                   <iframe
                      key={currentVideo.url}
                      className="w-full h-full"
                      src={currentVideo.url}
                      title={currentVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 mb-4 flex items-center justify-center text-slate-600">
                    <Video size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-400 mb-2">Tutorial Hub</h4>
                  <p className="text-sm max-w-sm">No video selected. Choose a section on the left or add a custom URL to help you study this topic.</p>
                </div>
              )}
            </div>
          </div>

          {/* Resize handle (Visual) */}
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center">
              <div className="w-1 h-1 bg-slate-400 rounded-full mb-1 mr-1" />
              <div className="w-1 h-1 bg-slate-400 rounded-full mb-1" />
              <div className="w-1 h-1 bg-slate-400 rounded-full mr-1" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VideoRow({ video, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-2 rounded-xl transition-all ${
        active 
          ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-800' 
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 py-1.5'
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-brand-100 dark:bg-brand-900' : 'bg-slate-200 dark:bg-slate-800'}`}>
        {active ? <Play size={14} fill="currentColor" /> : (video.isCustom ? <Globe size={14} /> : <Video size={14} />)}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[11px] font-semibold leading-tight mb-0.5 truncate w-full">{video.title}</p>
        <p className="text-[9px] text-slate-400 uppercase tracking-tighter flex items-center gap-1">
          {video.source}
          {video.isCustom && <span className="text-[8px] bg-brand-100 dark:bg-brand-900 px-1 rounded text-brand-600">Custom</span>}
        </p>
      </div>
    </button>
  );
}
