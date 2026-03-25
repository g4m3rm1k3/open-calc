import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2, Search, Video, ChevronRight, Play, Layout, Menu, Plus, Globe, Trash2, BookOpen, ChevronLeft, Home, Layers, Compass, Sidebar as SidebarIcon } from 'lucide-react';
import { useVideoPlayer } from '../../context/VideoPlayerContext.jsx';
import { VIDEO_PLACEMENT_MAP } from '../../content/videos/videoPlacementMap.js';
import { VIDEO_DATABASE } from '../../content/videos/videoDatabase.js';
import { CURRICULUM, ALL_LESSONS } from '../../content/index.js';

import { useNavigate } from 'react-router-dom';

export default function FloatingVideoPlayer() {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);
  const { 
    isOpen, isMinimized, currentVideo, lessonId, 
    searchQuery, setSearchQuery, 
    closePlayer, toggleMinimize, selectVideo,
    customVideos, addCustomVideo, setLessonId,
    pinnedVideos, togglePin
  } = useVideoPlayer();

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navStack, setNavStack] = useState(['playlist']);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(550);
  const [windowDimensions, setWindowDimensions] = useState({ 
    w: window.innerWidth, 
    h: window.innerHeight 
  });

  // Sync Mobile & Viewport Check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowDimensions({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force sidebar open on mobile playlist view, or handle it
  useEffect(() => {
    if (isMobile && !currentVideo) setSidebarOpen(true);
  }, [isMobile, currentVideo]);

  const getCategorizedVideos = (id) => {
    if (!id) return null;
    const placement = VIDEO_PLACEMENT_MAP[id] || {};
    const custom = customVideos[id] || [];
    const categorized = {};
    if (custom.length > 0) categorized['Your Videos'] = custom;
    ['hook', 'intuition', 'math', 'rigor', 'examples'].forEach(section => {
      const ids = section === 'examples' ? Object.values(placement[section] || {}).flat() : (placement[section] || []);
      const vids = ids.map(id => ({ ...VIDEO_DATABASE[id], id })).filter(v => v.url);
      if (vids.length > 0) categorized[section] = vids;
    });
    return categorized;
  };

  const currentLessonVideos = useMemo(() => getCategorizedVideos(lessonId), [lessonId, customVideos]);

  const courseMetadata = {
    'precalc': { title: 'Pre-Calculus', icon: '📐' },
    'calc': { title: 'Calculus', icon: '∂' },
    'discrete': { title: 'Discrete Math', icon: '∴' },
    'physics-1': { title: 'Physics', icon: '🚀' },
  };

  const dynamicCourses = useMemo(() => {
    const ids = Array.from(new Set(CURRICULUM.map(c => c.course)));
    return ids.map(id => ({
      id,
      title: courseMetadata[id]?.title || id.charAt(0).toUpperCase() + id.slice(1),
      icon: courseMetadata[id]?.icon || '📚'
    }));
  }, []);

  const pushNav = (view, data = {}) => {
    if (view === 'chapters') setSelectedCourse(data.courseId);
    if (view === 'lessons') setSelectedChapter(data.chapter);
    if (view === 'playlist') { if (data.lessonId) setLessonId(data.lessonId); }
    setNavStack(prev => [...prev, view]);
    setSearchQuery('');
  };

  const popNav = () => { if (navStack.length > 1) setNavStack(prev => prev.slice(0, -1)); };
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
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, customVideos]);

  const getLessonInfo = (vidId) => {
    const lessonId = Object.entries(VIDEO_PLACEMENT_MAP).find(([lId, sections]) => {
      return Object.entries(sections).some(([sectionKey, content]) => {
        if (sectionKey === 'examples') {
          return Object.values(content).flat().includes(vidId);
        }
        return Array.isArray(content) && content.includes(vidId);
      });
    })?.[0];

    if (!lessonId) return null;
    const lesson = ALL_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return null;
    return { id: lessonId, title: lesson.title, chapter: lesson.chapterNumber };
  };

  const handleSearchSelect = (vid) => {
    const info = getLessonInfo(vid.id);
    selectVideo(vid);
    if (info) { 
      setLessonId(info.id); 
      setNavStack(['playlist']); 
    }
    setSearchQuery('');
  };

  const handlePinnedSelect = (vidId) => {
    const vid = VIDEO_DATABASE[vidId];
    if (vid) {
      selectVideo({ ...vid, id: vidId });
      const info = getLessonInfo(vidId);
      if (info) {
        setLessonId(info.id);
        setNavStack(['playlist']);
      }
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customUrl) return;
    addCustomVideo(customUrl, customTitle);
    setCustomUrl('');
    setCustomTitle('');
    setIsAddingCustom(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible constraint layer to keep player in viewport */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9997]" />

      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized-dock"
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 right-8 z-[9999] bg-slate-900 border-x border-t border-slate-700 rounded-t-2xl px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-all border-b-4 border-b-brand-500 min-w-[340px]"
            onClick={toggleMinimize}
          >
            <div className="flex items-center gap-4 truncate">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20"><Play size={20} fill="currentColor" /></div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] leading-none mb-1.5">Tutorial Hub</p>
                <h4 className="text-sm font-bold text-white leading-none tracking-tight truncate">{currentVideo?.title || 'Videos & Tutorials'}</h4>
              </div>
            </div>
            <Maximize2 size={18} className="text-slate-500 flex-shrink-0 ml-4" />
          </motion.div>
        ) : (
          <motion.div
             key="expanded-player"
             drag={!isMobile} 
           dragControls={dragControls}
           dragListener={false}
           dragMomentum={false}
           dragConstraints={{ 
             left: 10, 
             top: 10, 
             right: (windowDimensions?.w || 1024) - width - 10, 
             bottom: (windowDimensions?.h || 768) - height - 10 
           }}
           dragElastic={0}
           initial={isMobile ? { opacity: 0, y: 100 } : { 
             opacity: 0, 
             scale: 0.9, 
             x: (windowDimensions?.w || 1024) - width - 40, 
             y: (windowDimensions?.h || 768) - height - 40 
           }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9, y: isMobile ? 100 : 0 }}
           style={isMobile ? { width: '100%', height: '100%', top: 0, left: 0 } : { width, height }}
           className={`fixed top-0 left-0 z-[9998] bg-white dark:bg-slate-900 shadow-3xl overflow-hidden flex flex-col ${
             isMobile ? 'rounded-none' : 'rounded-2xl border border-slate-200 dark:border-slate-800'
           }`}
        >
          {/* Header - now the ONLY draggable area */}
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-3 truncate">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20"><Video size={16} /></div>
              <div className="truncate">
                <h3 className="text-xs font-bold text-white truncate leading-none mb-1">{currentVideo?.title || 'Tutorial Hub'}</h3>
                {lessonId && (
                  <p className="text-[9px] font-bold text-brand-400 uppercase tracking-widest leading-none opacity-80">
                    {ALL_LESSONS.find(l => l.id === lessonId)?.title || 'Curriculum'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-1">
              <button onClick={toggleMinimize} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Minimize">
                <Minus size={18} />
              </button>
              <button 
                onClick={closePlayer}
                className="p-1.5 hover:bg-red-900/40 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}>
            
            {/* Video Player Area */}
            <div className={`flex-1 bg-black relative group order-1 ${isMobile ? 'max-h-[40vh] min-h-[240px]' : ''}`}>
               {isMobile && !currentVideo && (
                 <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <Play size={40} className="text-brand-500 mb-4" />
                    <h4 className="text-white font-bold mb-2">Tutorial Library</h4>
                    <p className="text-xs text-slate-500">Select a section below to start watching</p>
                 </div>
               )}

               {currentVideo && (
                 <iframe key={currentVideo.url} className="w-full h-full" src={currentVideo.url} title={currentVideo.title} frameBorder="0" allowFullScreen />
               )}

               {/* Mobile sidebar toggle Overlay button */}
               {!isMobile && (
                 <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-4 h-20 bg-slate-800/80 text-white rounded-l-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-brand-500 transition-all shadow-xl"
                  title={sidebarOpen ? "Hide Library" : "Show Library"}
                 >
                    <ChevronRight size={14} className={sidebarOpen ? '' : 'rotate-180'} />
                 </button>
               )}
            </div>

            {/* Sidebar / List Area */}
            <div 
              className={`flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 transition-all order-2 flex flex-col ${
                isMobile 
                  ? 'flex-1 overflow-hidden' 
                  : `border-r h-full overflow-hidden ${sidebarOpen ? 'w-72' : 'w-0'}`
              }`}
            >
              <div className="flex-shrink-0 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                 {navStack.length > 1 ? (
                   <button onClick={popNav} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><ChevronLeft size={16} /></button>
                 ) : (
                   <button onClick={() => pushNav('courses')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><Compass size={16} /></button>
                 )}
                 <button 
                  onClick={() => {
                    const l = ALL_LESSONS.find(l => l.id === lessonId);
                    if (l) navigate(`/chapter/${l.chapterNumber}/${l.slug}`);
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-500 truncate flex-1 text-left transition-colors"
                 >
                    {currentView === 'playlist' && lessonId ? (
                      (() => {
                        const l = ALL_LESSONS.find(l => l.id === lessonId);
                        return l ? `Ch ${l.chapterNumber} › ${l.title}` : 'Playlist';
                      })()
                    ) : currentView}
                 </button>
              </div>

              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" placeholder="Search..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {searchQuery ? (
                  <div className="space-y-1">
                    {allFilteredVideos.map(vid => {
                      const lessonInfo = getLessonInfo(vid.id);
                      return (
                        <VideoRow 
                          key={vid.id} 
                          video={vid} 
                          active={vid.id === currentVideo?.id} 
                          onClick={() => handleSearchSelect(vid)} 
                          onPin={() => togglePin(vid.id)}
                          isPinned={pinnedVideos.includes(vid.id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {currentView === 'playlist' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="playlist">
                        {/* Pinned Section */}
                        {pinnedVideos.length > 0 && (
                           <div className="mb-6">
                              <p className="text-[9px] font-bold uppercase tracking-widest text-brand-500 px-2 mb-2 flex items-center gap-2">
                                <Plus size={10} className="rotate-45" /> Quick Access
                              </p>
                              <div className="space-y-1">
                                {pinnedVideos.map(vidId => {
                                   const vid = VIDEO_DATABASE[vidId];
                                   if (!vid) return null;
                                   return (
                                     <VideoRow 
                                       key={vidId} 
                                       video={{ ...vid, id: vidId }} 
                                       active={vidId === currentVideo?.id} 
                                       onClick={() => handlePinnedSelect(vidId)} 
                                       onPin={() => togglePin(vidId)}
                                       isPinned={true}
                                     />
                                   );
                                })}
                              </div>
                           </div>
                        )}

                        {/* Custom Video Form */}
                        <div className="mb-6 px-2">
                           <button 
                             onClick={() => setIsAddingCustom(!isAddingCustom)}
                             className="w-full py-2 px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-brand-500 hover:text-brand-500 transition-all"
                           >
                              <span>{isAddingCustom ? 'Cancel' : 'Add Custom Tutorial'}</span>
                              <Plus size={12} className={isAddingCustom ? 'rotate-45 transition-transform' : 'transition-transform'} />
                           </button>
                           
                           {isAddingCustom && (
                             <motion.form 
                               initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                               onSubmit={handleCustomSubmit} className="mt-3 space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                             >
                                <input 
                                  type="text" placeholder="Tutorial Title..." value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                />
                                <input 
                                  type="text" placeholder="YouTube URL..." value={customUrl} onChange={e => setCustomUrl(e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                />
                                <button type="submit" className="w-full py-2 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-brand-500/20">Save Tutorial</button>
                             </motion.form>
                           )}
                        </div>

                        {currentLessonVideos ? Object.entries(currentLessonVideos).map(([section, vids]) => (
                          <div key={section} className="mb-4">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-brand-500/60 px-2 mb-1">{section}</p>
                            {vids.map(vid => (
                               <VideoRow 
                                 key={vid.id} 
                                 video={vid} 
                                 active={vid.id === currentVideo?.id} 
                                 onClick={() => selectVideo(vid)} 
                                 onPin={() => togglePin(vid.id)}
                                 isPinned={pinnedVideos.includes(vid.id)}
                               />
                            ))}
                          </div>
                        )) : <div className="text-center py-6 text-xs text-slate-500">Browse courses for topics.</div>}
                         <button onClick={() => pushNav('courses')} className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg"><Compass size={12} /> Explore More Courses</button>
                      </motion.div>
                    )}
                    {currentView === 'courses' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="courses" className="space-y-1">
                         {dynamicCourses.map(course => (
                           <button onClick={() => pushNav('chapters', { courseId: course.id })} key={course.id} className="w-full flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">{course.icon}</div>
                             <div className="text-left"><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{course.title}</p></div>
                             <ChevronRight size={14} className="ml-auto text-slate-300" />
                           </button>
                         ))}
                      </motion.div>
                    )}
                    {currentView === 'chapters' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="chapters" className="space-y-1">
                        {filteredChapters.map(ch => (
                          <button onClick={() => pushNav('lessons', { chapter: ch })} key={ch.number} className="w-full text-left p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl">
                             <p className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mb-1">Chapter {ch.number}</p>
                             <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{ch.title}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                    {currentView === 'lessons' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="lessons" className="space-y-1">
                        {selectedChapter?.lessons.map(l => (
                          <button onClick={() => pushNav('playlist', { lessonId: l.id })} key={l.id} className="w-full text-left p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl flex items-center justify-between group">
                             <p className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-brand-500">{l.title}</p>
                             <ChevronRight size={14} className="text-slate-300" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VideoRow({ video, active, onClick, isPinned, onPin }) {
  return (
    <div className="group/row relative">
      <button 
        onClick={onClick} 
        className={`w-full flex items-start gap-3 p-2 rounded-xl transition-all ${
          active 
            ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-200 shadow-sm' 
            : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-brand-100 dark:bg-brand-900 text-brand-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {active ? <Play size={12} fill="currentColor" /> : <Video size={12} />}
        </div>
        
        <div className="flex-1 text-left min-w-0 pr-6">
          <p className="text-[11px] font-semibold leading-tight mb-0.5 truncate">{video.title}</p>
          <p className="text-[8px] text-slate-400 uppercase">{video.source}</p>
        </div>
      </button>

      {/* Pin Toggle */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPin?.(); }}
        className={`absolute right-2 top-3 p-1.5 rounded-lg transition-all ${
          isPinned 
            ? 'text-brand-500 opacity-100' 
            : 'text-slate-300 opacity-0 group-hover/row:opacity-100 hover:text-brand-400'
        }`}
        title={isPinned ? 'Remove Pin' : 'Pin Tutorial'}
      >
        <Plus size={14} className={isPinned ? 'rotate-45' : ''} />
      </button>
    </div>
  );
}
