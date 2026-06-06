import { useState, useCallback, useEffect } from "react";
import { VideoPlayerContext } from "./videoPlayerContext.js";
import { selectVideosByKeywords } from "../content/videos/videoSelector.js";
import { getVideosForCourse } from "../content/autoLoader.js";
import { ALL_LESSONS } from "../content/index.js";

export function VideoPlayerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedVideos, setPinnedVideos] = useState(() => {
    const saved = localStorage.getItem("open-calc-pinned-videos");
    return saved ? JSON.parse(saved) : [];
  });
  const [customVideos, setCustomVideos] = useState(() => {
    const saved = localStorage.getItem("open-calc-custom-videos");
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
    setPinnedVideos((prev) => {
      let updated;
      if (prev.includes(vidId)) {
        updated = prev.filter((id) => id !== vidId);
      } else {
        updated = [vidId, ...prev];
      }
      localStorage.setItem("open-calc-pinned-videos", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCustomVideo = useCallback(
    (url, title) => {
      if (!lessonId) return;

      // Simple YouTube embed converter
      let embedUrl = url;
      if (url.includes("youtube.com/watch?v=")) {
        embedUrl = url.replace("watch?v=", "embed/");
      } else if (url.includes("youtu.be/")) {
        embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
      }

      const newVid = {
        id: `custom-${Date.now()}`,
        title: title || "Custom Video",
        url: embedUrl,
        source: "User Custom",
        isCustom: true,
      };

      setCustomVideos((prev) => {
        const updated = {
          ...prev,
          [lessonId]: [...(prev[lessonId] || []), newVid],
        };
        localStorage.setItem(
          "open-calc-custom-videos",
          JSON.stringify(updated),
        );
        return updated;
      });

      setCurrentVideo(newVid);
      setIsMinimized(false);
    },
    [lessonId],
  );

  // Sync current video when lessonId changes
  useEffect(() => {
    if (!lessonId) return;

    const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
    const courseId = lesson?.course ?? null;

    // Course-specific videos take priority over keyword search
    const vids = courseId ? getVideosForCourse(courseId) : [];
    setCourseVideos(vids);

    const custom = customVideos[lessonId] || [];
    if (custom.length > 0) {
      setCurrentVideo(custom[0]);
      return;
    }

    if (vids.length > 0) {
      setCurrentVideo(vids[0]);
      return;
    }

    // Fall back to keyword search for courses without dedicated videos
    const tags = lesson?.tags ?? [];
    const courseWords = (lesson?.course ?? '').replace(/-\d+$/, '').split('-').filter(Boolean);
    const keywords = [...new Set([...tags, ...courseWords])];
    if (keywords.length > 0) {
      const matched = selectVideosByKeywords({ keywords, limit: 1 });
      if (matched[0]) {
        setCurrentVideo(matched[0]);
        return;
      }
    }

    setCurrentVideo(null);
  }, [lessonId, customVideos]);

  return (
    <VideoPlayerContext.Provider
      value={{
        isOpen,
        isMinimized,
        currentVideo,
        lessonId,
        courseVideos,
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
