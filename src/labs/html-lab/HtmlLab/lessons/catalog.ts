import { htmlBasics } from "./htmlBasics";
import { htmlListsForms } from "./htmlListsForms";
import { cssFlexboxMakeover } from "./cssFlexboxMakeover";
import { jsFirstClickHandler } from "./jsFirstClickHandler";
import type { Lesson } from "./lessonTypes";

// The full lesson catalog — flat list, grouped by `topic`/`unit` for display
// in LessonCatalog.tsx. Four lessons prove the pattern across every step
// type (element inserts, restyles, CSS text, JS text, structural and
// behavioral challenges, and one lesson seeded from another lesson's
// finished page). The rest of the ~20 HTML / ~20+ CSS / DOM-manipulation
// curriculum gets authored the same way, one `unit` at a time:
//   1. Pick a `topic` and a `unit` label (reuse an existing one to grow that
//      section, or introduce a new one).
//   2. Copy an existing lesson file's `el()` helper and step shape.
//   3. Each step's `patch` only needs what's NEW or CHANGED since the
//      previous step — `applyPatch` folds everything before it automatically.
//   4. Add the new lesson's import + entry to `LESSONS` below.
export const LESSONS: Lesson[] = [
  htmlBasics,
  htmlListsForms,
  cssFlexboxMakeover,
  jsFirstClickHandler,
];
