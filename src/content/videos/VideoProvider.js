import { selectVideosByKeywords } from './videoSelector.js';

/**
 * Returns videos for a lesson using tag-based matching.
 * @param {string} lessonId - lesson id (used to look up tags from ALL_LESSONS)
 * @param {string[]} tags - lesson tags
 * @param {number} limit
 */
export function getVideosForLesson(tags = [], limit = 15) {
  if (!tags.length) return null;
  const results = selectVideosByKeywords({ keywords: tags, limit });
  return results.length > 0 ? results : null;
}
