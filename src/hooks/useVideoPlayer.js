import { useContext } from "react";
import { VideoPlayerContext } from "../context/videoPlayerContext.js";

export function useVideoPlayer() {
  return useContext(VideoPlayerContext);
}
