import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { VIDEO_PLACEMENT_MAP } from '../content/videos/videoPlacementMap.js';
import { VIDEO_DATABASE } from '../content/videos/videoDatabase.js';

const VideoPlayerContext = createContext();

export function VideoPlayerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedVideos, setPinnedVideos] = useState(() => {
    const saved = localStorage.getItem('open-calc-pinned-videos');
    return saved ? JSON.parse(saved) : [];
  });
  const [customVideos, setCustomVideos] = useState(() => {
    const saved = localStorage.getItem('open-calc-custom-videos');
    return saved ? JSON.parse(saved) : {};
  });

  const openPlayer = useCallback((videoData, id = null) => {
    if (videoData) setCurrentVideo(videoData);
    if (id) setLessonId(id);
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closePlayer = useCallback(() => {
    setIsOpen(false);
    setCurrentVideo(null);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const selectVideo = useCallback((videoData) => {
    setCurrentVideo(videoData);
    setIsMinimized(false);
  }, []);

  const togglePin = useCallback((vidId) => {
    setPinnedVideos(prev => {
      let updated;
      if (prev.includes(vidId)) {
        updated = prev.filter(id => id !== vidId);
      } else {
        updated = [vidId, ...prev];
      }
      localStorage.setItem('open-calc-pinned-videos', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCustomVideo = useCallback((url, title) => {
    if (!lessonId) return;
    
    // Simple YouTube embed converter
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    }

    const newVid = {
      id: `custom-${Date.now()}`,
      title: title || 'Custom Video',
      url: embedUrl,
      source: 'User Custom',
      isCustom: true
    };

    setCustomVideos(prev => {
      const updated = {
        ...prev,
        [lessonId]: [...(prev[lessonId] || []), newVid]
      };
      localStorage.setItem('open-calc-custom-videos', JSON.stringify(updated));
      return updated;
    });

    setCurrentVideo(newVid);
    setIsMinimized(false);
  }, [lessonId]);

  // Sync current video from map when lessonId changes
  useEffect(() => {
    if (lessonId) {
      const placement = VIDEO_PLACEMENT_MAP[lessonId];
      const custom = customVideos[lessonId] || [];
      
      // If we have custom videos for this specific lesson, show them first
      if (custom.length > 0) {
        setCurrentVideo(custom[0]);
      } else if (placement) {
        // Pick first available video (hook -> intuition -> math -> rigor)
        const firstSec = ['hook', 'intuition', 'math', 'rigor'].find(s => placement[s]?.length > 0);
        if (firstSec) {
          const vidId = placement[firstSec][0];
          const video = VIDEO_DATABASE[vidId];
          if (video) {
            setCurrentVideo(video);
          }
        }
      } else {
        // If no videos for this lesson, reset current video so player doesn't show old lesson's video
        setCurrentVideo(null);
      }
    }
  }, [lessonId, customVideos]);

  return (
    <VideoPlayerContext.Provider
      value={{
        isOpen,
        isMinimized,
        currentVideo,
        lessonId,
        searchQuery,
        setSearchQuery,
        customVideos,
        openPlayer,
        closePlayer,
        toggleMinimize,
        selectVideo,
        setLessonId,
        togglePin,
        pinnedVideos,
        addCustomVideo,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
}
