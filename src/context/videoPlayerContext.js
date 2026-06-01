import { createContext } from "react";

export const VideoPlayerContext = createContext({
  isOpen: false,
  isMinimized: true,
  currentVideo: null,
  lessonId: null,
  searchQuery: "",
  setSearchQuery: () => {},
  customVideos: {},
  openPlayer: () => {},
  closePlayer: () => {},
  toggleMinimize: () => {},
  selectVideo: () => {},
  setLessonId: () => {},
  togglePin: () => {},
  pinnedVideos: [],
  addCustomVideo: () => {},
});
