// All canvas snippet references — concept snippets + project walkthroughs.
// These are reference examples, not guided tutorials.
// Real tutorials (step-by-step guided projects) live in canvasTutorialSeries.js

import { TUTORIALS as conceptSnippets } from './canvasTutorialSnippets.js'
import { TUTORIALS as projectSnippets  } from './canvasTutorials.js'

// conceptSnippets = [canvas-fundamentals (4 steps), boxes-and-arrows (3 steps)]
// projectSnippets[0..2] = [logic-gate (4), bubble-sort (2), sine-wave (3)]
// projectSnippets[3..4] are duplicates of conceptSnippets — skip them

export const SNIPPETS = [
  ...conceptSnippets,
  ...projectSnippets.slice(0, 3),
]
