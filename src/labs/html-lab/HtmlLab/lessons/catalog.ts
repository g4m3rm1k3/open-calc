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
import { cssGridFundamentals } from "./cssGridFundamentals";
import { cssResponsiveDesign } from "./cssResponsiveDesign";
import { jsFoundationsVariables } from "./jsFoundationsVariables";
import { jsConditionalsLoops } from "./jsConditionalsLoops";
import { jsArraysObjects } from "./jsArraysObjects";
import { jsDomElements } from "./jsDomElements";
import { jsFormsValidation } from "./jsFormsValidation";
import { jsFirstClickHandler } from "./jsFirstClickHandler";
import { htmlFormsDeepDive } from "./htmlFormsDeepDive";
import { htmlAccessibilityBasics } from "./htmlAccessibilityBasics";
import { cssTransitionsAnimations } from "./cssTransitionsAnimations";
import { htmlDocumentHeadMeta } from "./htmlDocumentHeadMeta";
import { jsFetchApisBasics } from "./jsFetchApisBasics";
import type { Lesson } from "./lessonTypes";

// The full lesson catalog — flat list, grouped by `topic`/`unit` for display
// in LessonCatalog.tsx (unit order within a topic = first-occurrence order in
// this array, so a track's units must be listed in teaching order: earliest
// foundation first).
//
// Authoring pattern for a new lesson:
//   1. Pick a `topic` and a `unit` label (reuse an existing one to grow that
//      section, or introduce a new one — but place it after whichever
//      lesson it assumes the student has already done).
//   2. Continue the previous lesson's page: seed the first step's patch with
//      `foldToPatch(computeSolvedFoldAtStep(earlierLesson, lastIndex))` (see
//      any lesson below) — lessons chain into one growing project within a
//      track, they don't restart cold every time. Always use `foldToPatch`
//      for this, never hand-pick `elements`/`javascript` fields — it's what
//      correctly carries forward the running JS/CSS block bookkeeping too
//      (see point 3).
//   3. For JavaScript with more than one handler, use `jsBlocks` (and
//      `cssBlocks` for CSS with more than one rule) — NOT the `javascript`/
//      `customCss` string fields. Each block is independent and named; a
//      step that changes one handler supplies just that one block, and the
//      engine re-joins everything automatically. This replaced an earlier
//      version of this file that hand-typed the ENTIRE accumulated script
//      as one string per step — a real incident where a single edit dumped
//      ~100 unrelated, unchanged lines back at a learner with zero
//      explanation, because there was no way to tell "new" from "already
//      there" without literally diffing text. With named blocks there is
//      nothing to diff: the patch only ever lists what actually changed.
//   4. One idea per step. If an instruction sentence defines or names more
//      than one new term, tag, or API, split it into more than one step —
//      "5 short sentences" covering 3 unfamiliar concepts does not teach
//      anything; each concept earns its own explanation before being
//      combined with anything else.
//   5. Prefer more than one small challenge per lesson over one big one.
//   6. Remember `effectivePatch` MERGES a challenge's scaffold `patch.elements`
//      /`jsBlocks`/`cssBlocks` into `solutionPatch` automatically
//      (lessonEngine.ts) — a challenge's solutionPatch only needs to
//      describe what CHANGES to solve it, not re-list what the scaffold
//      already added.
//
// ROADMAP (zero → DOM mastery — built so far vs. planned):
//   HTML: [x] Foundations (tags/elements, div/span/attributes)
//         [x] Semantic Structure, Lists & Forms, Text & Inline Semantics, Tables & Media
//         [x] Forms Deep Dive (select/textarea/checkboxes/fieldset/validation)
//         [x] Accessibility Basics (aria, focus order, landmarks review)
//         [x] Document Head & Meta (title/meta/viewport/favicon)
//   CSS:  [x] Foundations (what CSS is, rules, class selectors, box model)
//         [x] Flexbox & Layout (fundamentals, then applying it to a real page)
//         [x] CSS Grid (grid-template-columns, fr units, gap)
//         [x] Responsive Design (mobile-first, media queries)
//         [x] Transitions & Animations
//   JS:   [x] Foundations (let/const, functions, addEventListener, if/else,
//             comparisons, for loops, arrays, objects)
//         [x] The DOM (querySelector/createElement/appendChild/remove,
//             then real form input + validation)
//         [x] Events & the DOM (a standalone second click-handler lesson)
//         [x] Fetch & APIs Basics
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
  cssGridFundamentals,
  cssResponsiveDesign,
  jsFoundationsVariables,
  jsConditionalsLoops,
  jsArraysObjects,
  jsDomElements,
  jsFormsValidation,
  jsFirstClickHandler,
  htmlFormsDeepDive,
  htmlAccessibilityBasics,
  cssTransitionsAnimations,
  htmlDocumentHeadMeta,
  jsFetchApisBasics,
];
