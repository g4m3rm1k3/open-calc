/**
 * The Attachment Map.
 * Maps Lesson IDs + Sections to Video IDs from the database.
 * 
 * Format:
 * [lessonId]: {
 *   hook: ['videoId'],
 *   intuition: ['videoId', 'videoId'],
 *   math: ['videoId'],
 *   rigor: ['videoId'],
 *   examples: {
 *     [exampleId]: ['videoId']
 *   }
 * }
 */
export const VIDEO_PLACEMENT_MAP = {
  // src/content/chapter-2/02-derivatives-of-inverse-functions.js
  'ch2-002b': {
    hook: ['prof-leonard-inverse-trig'],
    intuition: ['oct-inverse-trig-examples'],
    rigor: ['dennis-pythag-proof'],
  },

  // src/content/chapter-5/00-sequences.js
  'ch5-sequences': {
    hook: ['3b1b-essence-limits'],
    intuition: ['3b1b-derivative-visual'],
  },
};
