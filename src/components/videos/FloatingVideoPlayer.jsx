import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Search, Video, ChevronRight, Play, Layout, Menu, Plus, Globe, Trash2, BookOpen, ChevronLeft, Home, Layers, Compass, Sidebar as SidebarIcon } from 'lucide-react';
import { useVideoPlayer } from '../../context/VideoPlayerContext.jsx';
import { VIDEO_PLACEMENT_MAP } from '../../content/videos/videoPlacementMap.js';
import { VIDEO_DATABASE } from '../../content/videos/videoDatabase.js';
import { CURRICULUM } from '../../content/index.js';

export default function FloatingVideoPlayer() {
  const { 
    isOpen, isMinimized, currentVideo, lessonId, 
    searchQuery, setSearchQuery, 
    closePlayer, toggleMinimize, selectVideo,
    customVideos, addCustomVideo, setLessonId
  } = useVideoPlayer();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [navStack, setNavStack] = useState(['playlist']); // 'courses', 'chapters', 'lessons', 'playlist'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(550);

  // Group videos for the specific lesson Id
  const getCategorizedVideos = (id) => {
    if (!id) return null;
    const placement = VIDEO_PLACEMENT_MAP[id] || {};
    const custom = customVideos[id] || [];
    const categorized = {};

    if (custom.length > 0) categorized['Your Videos'] = custom;

    ['hook', 'intuition', 'math', 'rigor', 'examples'].forEach(section => {
      const ids = section === 'examples' 
        ? Object.values(placement[section] || {}).flat() 
        : (placement[section] || []);
      
      const vids = ids.map(id => ({ ...VIDEO_DATABASE[id], id })).filter(v => v.url);
      if (vids.length > 0) categorized[section] = vids;
    });
    return categorized;
  };

  const currentLessonVideos = useMemo(() => getCategorizedVideos(lessonId), [lessonId, customVideos]);

  // Derived course list
  const courses = useMemo(() => {
    const list = [
      { id: 'precalc', title: 'Pre-Calculus', icon: '📐' },
      { id: 'calc', title: 'Calculus', icon: '∂' },
      { id: 'discrete', title: 'Discrete Math', icon: '∴' },
      { id: 'physics-1', title: 'Physics', icon: '🚀' },
    ];
    return list;
  }, []);

  const pushNav = (view, data = {}) => {
    if (view === 'chapters') setSelectedCourse(data.courseId);
    if (view === 'lessons') setSelectedChapter(data.chapter);
    if (view === 'playlist') {
       if (data.lessonId) setLessonId(data.lessonId);
    }
    setNavStack(prev => [...prev, view]);
    setSearchQuery('');
  };

  const popNav = () => {
    if (navStack.length > 1) {
      setNavStack(prev => prev.slice(0, -1));
    }
  };

  const currentView = navStack[navStack.length - 1];

  const filteredChapters = useMemo(() => {
    if (!selectedCourse) return [];
    return CURRICULUM.filter(ch => ch.course === selectedCourse);
  }, [selectedCourse]);

  const allFilteredVideos = useMemo(() => {
    if (!searchQuery) return [];
    const list = Object.entries(VIDEO_DATABASE).map(([id, meta]) => ({ ...meta, id }));
    Object.values(customVideos).flat().forEach(cv => list.push(cv));

    return list.filter(v => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, customVideos]);

  const handleSearchSelect = (vid) => {
    // Find which lesson this video belongs to
    const targetLessonId = Object.entries(VIDEO_PLACEMENT_MAP).find(([lId, sections]) => {
       return Object.values(sections).flat().includes(vid.id);
    })?.[0];

    selectVideo(vid);
    if (targetLessonId) {
      setLessonId(targetLessonId);
      setNavStack(['playlist']);
    }
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Minimized Dock */}
      {isMinimized && (
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          className="fixed bottom-0 right-8 z-[9999] bg-slate-900 border-x border-t border-slate-700 rounded-t-xl px-5 py-4 shadow-2xl flex items-center gap-6 cursor-pointer hover:bg-slate-800 transition-all border-b-4 border-b-brand-500 min-w-[320px]"
          onClick={toggleMinimize}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20"><Play size={20} fill="currentColor" /></div>
            <div>
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] leading-none mb-1.5">Tutorial Hub</p>
              <h4 className="text-sm font-bold text-white leading-none tracking-tight">{currentVideo?.title || 'Videos & Tutorials'}</h4>
            </div>
          </div>
          <div className="flex-1" />
          <Maximize2 size={18} className="text-slate-500" />
        </motion.div>
      )}

      {/* Main Window */}
      {!isMinimized && (
        <motion.div
          layoutId="video-player"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
          drag dragMomentum={false} style={{ width, height }}
          className="fixed top-20 right-8 z-[9998] bg-white dark:bg-slate-900 rounded-2xl shadow-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col resize"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 cursor-move">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white"><Video size={16} /></div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[400px]">{currentVideo?.title || 'Tutorial Hub'}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleMinimize} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400"><Minus size={18} /></button>
              <button onClick={toggleMinimize} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 rounded-lg text-slate-500 dark:text-slate-400"><X size={18} /></button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className={`flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0'} overflow-hidden flex flex-col`}>
              
              {/* Sidebar Header / Breadcrumbs */}
              <div className="flex-shrink-0 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                 {navStack.length > 1 ? (
                   <button onClick={popNav} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><ChevronLeft size={16} /></button>
                 ) : (
                   <button onClick={() => pushNav('courses')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500" title="Home Library"><Compass size={16} /></button>
                 )}
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate flex-1">
                   {currentView === 'playlist' ? 'Current Playlist' : currentView}
                 </span>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" placeholder="Search entire library..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* View Controller */}
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {searchQuery ? (
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1">Search Results</p>
                    {allFilteredVideos.map(vid => (
                      <VideoRow key={vid.id} video={vid} active={vid.id === currentVideo?.id} onClick={() => handleSearchSelect(vid)} />
                    ))}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {currentView === 'playlist' && (
                      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} key="playlist">
                        {currentLessonVideos ? Object.entries(currentLessonVideos).map(([section, vids]) => (
                          <div key={section} className="mb-4">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-500 px-2 mb-1">{section}</p>
                            {vids.map(vid => <VideoRow key={vid.id} video={vid} active={vid.id === currentVideo?.id} onClick={() => selectVideo(vid)} />)}
                          </div>
                        )) : (
                          <div className="text-center py-10 px-4">
                            <Layers className="mx-auto text-slate-300 mb-3" />
                            <p className="text-xs text-slate-500">No tutorials mapped to this section.</p>
                            <button onClick={() => pushNav('courses')} className="mt-4 text-[10px] font-bold uppercase text-brand-600 hover:text-brand-500">Browse Full Library</button>
                          </div>
                        )}
                        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                           <button onClick={() => pushNav('courses')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-500 transition-colors">
                             <Compass size={12} /> Explore More Courses
                           </button>
                        </div>
                      </motion.div>
                    )}

                    {currentView === 'courses' && (
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="courses" className="space-y-1">
                         {courses.map(course => (
                           <button onClick={() => pushNav('chapters', { courseId: course.id })} key={course.id} className="w-full flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all group">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl group-hover:bg-brand-100 dark:group-hover:bg-brand-900 transition-colors">{course.icon}</div>
                             <div className="text-left"><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{course.title}</p><p className="text-[9px] text-slate-400">Video Tutorials</p></div>
                             <ChevronRight size={14} className="ml-auto text-slate-300" />
                           </button>
                         ))}
                      </motion.div>
                    )}

                    {currentView === 'chapters' && (
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="chapters" className="space-y-1">
                        {filteredChapters.map(ch => (
                          <button onClick={() => pushNav('lessons', { chapter: ch })} key={ch.number} className="w-full text-left p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                             <p className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mb-1">Chapter {ch.number}</p>
                             <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{ch.title}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {currentView === 'lessons' && (
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="lessons" className="space-y-1">
                        {selectedChapter?.lessons.map(l => (
                          <button onClick={() => pushNav('playlist', { lessonId: l.id })} key={l.id} className="w-full text-left p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
                             <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{l.title}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Video Player */}
            <div className="flex-1 bg-black relative group">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-4 h-20 bg-slate-800/80 text-white rounded-r-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={14} className={sidebarOpen ? 'rotate-180' : ''} /></button>
              {currentVideo ? (
                <iframe key={currentVideo.url} className="w-full h-full" src={currentVideo.url} title={currentVideo.title} frameBorder="0" allowFullScreen />
              ) : (
                <div className="flex-1 h-full flex flex-col items-center justify-center text-center bg-slate-950 p-10">
                  <Play size={48} className="text-slate-800 mb-4" />
                  <h4 className="text-xl font-bold text-slate-400 mb-2">Tutorial Hub</h4>
                  <p className="text-xs text-slate-600">Select a course, chapter, or search to start watching.</p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-slate-100 dark:bg-slate-800 rounded-tl-lg"><div className="w-1.5 h-1.5 border-r border-b border-slate-400" /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VideoRow({ video, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-start gap-2 p-1.5 rounded-lg transition-all ${active ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
      <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center ${active ? 'bg-brand-100 dark:bg-brand-900' : 'bg-slate-200 dark:bg-slate-800'}`}>{active ? <Play size={10} fill="currentColor" /> : <Video size={10} />}</div>
      <div className="flex-1 text-left min-w-0"><p className="text-[10.5px] font-semibold truncate leading-tight">{video.title}</p><p className="text-[8px] text-slate-400 uppercase">{video.source}</p></div>
    </button>
  );
}
