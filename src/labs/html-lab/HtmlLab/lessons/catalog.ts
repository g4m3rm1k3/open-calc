import { htmlFoundationsTags } from "./htmlFoundationsTags";
import { htmlFoundationsDivSpan } from "./htmlFoundationsDivSpan";
import { htmlBasics } from "./htmlBasics";
import { htmlListsForms } from "./htmlListsForms";
import { htmlTextSemantics } from "./htmlTextSemantics";
import { htmlTablesMedia } from "./htmlTablesMedia";
import { cssFoundationsIntro } from "./cssFoundationsIntro";
import { cssBoxModel } from "./cssBoxModel";
import { cssFlexboxFundamentals } from "./cssFlexboxFundamentals";
import { cssFlexboxMakeover } from "./cssFlexboxMakeover";
import { jsFoundationsVariables } from "./jsFoundationsVariables";
import { jsConditionalsLoops } from "./jsConditionalsLoops";
import { jsArraysObjects } from "./jsArraysObjects";
import { jsFirstClickHandler } from "./jsFirstClickHandler";
import type { Lesson } from "./lessonTypes";

// The full lesson catalog — flat list, grouped by `topic`/`unit` for display
// in LessonCatalog.tsx (unit order within a topic = first-occurrence order in
// this array, so a track's units must be listed in teaching order: earliest
// foundation first). Authoring pattern for a new lesson:
//   1. Pick a `topic` and a `unit` label (reuse an existing one to grow that
//      section, or introduce a new one — but place it after whichever
//      lesson it assumes the student has already done).
//   2. Continue the previous lesson's page: seed the first step with
//      `computeSolvedStateAtStep(earlierLesson, lastIndex).elements` (see
//      any lesson below for the pattern) — lessons chain into one growing
//      project within a track, they don't restart cold every time.
//   3. Use the shared `el()`/`lessonProgressKey()` helpers from
//      `./lessonHelpers`, not local copies.
//   4. Prefer more than one small challenge per lesson over one big one.
//
// ROADMAP (zero → DOM mastery — built so far vs. planned):
//   HTML: [x] Foundations (tags/elements, div/span/attributes)
//         [x] Semantic Structure, Lists & Forms, Text & Inline Semantics, Tables & Media
//         [ ] Forms Deep Dive (select/textarea/checkboxes/fieldset/validation)
//         [ ] Accessibility Basics (aria, focus order, landmarks review)
//         [ ] Document Head & Meta (title/meta/viewport/favicon)
//   CSS:  [x] Foundations (what CSS is, rules, class selectors, box model)
//         [x] Flexbox & Layout (fundamentals, then applying it to a real page)
//         [ ] CSS Grid Fundamentals
//         [ ] Responsive Design & Media Queries
//         [ ] Transitions & Animations
//   JS:   [x] Foundations (let/const, functions, addEventListener, if/else,
//             comparisons, for loops, arrays, objects)
//         [x] Events & the DOM (a second click-handler challenge lesson)
//         [ ] Selecting & Creating Elements (querySelector, createElement, appendChild)
//         [ ] Forms & Validation with JS
//         [ ] Fetch & APIs Basics
export const LESSONS: Lesson[] = [
  htmlFoundationsTags,
  htmlFoundationsDivSpan,
  htmlBasics,
  htmlListsForms,
  htmlTextSemantics,
  htmlTablesMedia,
  cssFoundationsIntro,
  cssBoxModel,
  cssFlexboxFundamentals,
  cssFlexboxMakeover,
  jsFoundationsVariables,
  jsConditionalsLoops,
  jsArraysObjects,
  jsFirstClickHandler,
];
