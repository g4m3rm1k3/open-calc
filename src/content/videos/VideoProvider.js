import { VIDEO_DATABASE } from './videoDatabase.js';
import { VIDEO_PLACEMENT_MAP } from './videoPlacementMap.js';

/**
 * Utility to fetch and format videos for a lesson and section.
 * 
 * @param {string} lessonId - Unique identifier for the lesson (e.g. 'ch2-002b')
 * @param {string} section - One of 'hook', 'intuition', 'math', 'rigor'
 * @param {string} exampleId - Optional ID for a specific example
 * 
 * @returns {Array|null} - Array of video objects or null if none found
 */
export function getVideosForLesson(lessonId, section, exampleId = null) {
  if (!lessonId) return null;

  const placement = VIDEO_PLACEMENT_MAP[lessonId];
  if (!placement) return null;

  let videoIds = [];
  if (exampleId && placement.examples && placement.examples[exampleId]) {
    videoIds = placement.examples[exampleId];
  } else if (placement[section]) {
    videoIds = placement[section];
  }

  if (!videoIds || videoIds.length === 0) return null;

  // Map IDs to full metadata from the database
  return videoIds
    .map((vidId) => VIDEO_DATABASE[vidId])
    .filter(Boolean); // Filter out missing videos
}

/**
 * Formats video list into a compatible visualization object.
 * 
 * @param {Array} videos - Array of video objects from getVideosForLesson
 * @param {string} lessonId - Current lesson context
 * @returns {Object|null} - Visualization object for VizFrame
 */
export function formatAsVisualization(videos, lessonId) {
  return null;
  if (!videos || videos.length === 0) return null;

  return {
    id: 'VideoLauncher',
    title: 'Video Tutorial',
    props: {
      lessonId,
      videos: videos.map((v) => ({
        url: v.url,
        title: v.title,
        source: v.source,
      })),
    },
  };
}
