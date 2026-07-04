import type { LabElement, LabState, MediaQuery } from "../types";

// A step's HTML/CSS/JS content, expressed as a *patch* against the running
// state rather than a full snapshot — this is what makes lessons DRY (each
// step only declares what's new or changed, not the whole page again).
//
// Elements are upserted by id: an id that already exists (from an earlier
// step) gets replaced with the new definition; a new id is appended. Lesson
// authors choose stable, human-readable ids ("nav", "hero-heading") that
// never change across steps — deliberately NOT reusing INSERT_TEMPLATE's
// runtime id-generation, since that assigns a fresh id on every dispatch and
// a later step would have no way to reference "the heading from step 2" to
// restyle it. UPDATE_STYLE also only ever targets `state.selectedId`
// (labReducer.ts:604-616), not an arbitrary id, which would force every
// style-only step through a SELECT-then-UPDATE_STYLE dance for no benefit
// over just writing the target style straight into the patch.
// A single named, independent piece of JavaScript — one handler, one
// variable declaration, one function. `jsBlocks` are upserted by id exactly
// like `elements` (re-supplying an existing id's `code` replaces just that
// block; a new id is appended) and joined together to form the running
// script. This is what lets a step add or change ONE handler without ever
// having to hand-type the entire accumulated script as a single string —
// the engine assembles the final script, the same way it already assembles
// the page from independent elements instead of one hand-typed HTML blob.
export interface JsBlock {
  id: string;
  code: string;
}

export interface LessonPatch {
  elements?: LabElement[];
  removeElementIds?: string[];
  bodyStyles?: Record<string, string>;
  /** Prefer `jsBlocks` for anything with more than one handler/declaration —
   *  this wholesale-replaces the whole script and is only worth reaching for
   *  when a step's JS is a single, self-contained, one-off snippet. */
  javascript?: string;
  jsBlocks?: JsBlock[];
  /** Same idea as `jsBlocks`, for hand-written CSS rules (`customCss`) —
   *  prefer this over `customCss` the moment there's more than one rule. */
  cssBlocks?: JsBlock[];
  customCss?: string;
}

export interface ValidationResult {
  passed: boolean;
  feedback: string[];
}

// Structural expectation for an HTML/CSS challenge — checked against the
// student's actual `state.elements` by tag and a *subset* of style
// properties (not full equality; unrelated properties the student didn't
// touch shouldn't fail the check).
export interface ExpectedNode {
  tag: string;
  styles?: Record<string, string>;
  children?: ExpectedNode[];
}

// Behavioral expectation for a JS challenge — run in the real exported page
// inside a hidden iframe, not diffed as source text (equivalent JS can look
// completely different: a `for` loop and a `.forEach` both pass the same
// behavioral check but would fail a text diff).
export interface InteractionStep {
  selector: string;
  action: "click" | "input" | "change";
  value?: string; // for "input"/"change"
}
export interface Assertion {
  selector: string;
  property: "textContent" | "value" | "checked" | "className" | "style";
  expected: string;
  styleProp?: string; // when property === "style", which CSS property to read
}
export interface BehaviorScript {
  interactions: InteractionStep[];
  assertions: Assertion[];
}

export interface LessonStep {
  id: string;
  title: string;
  instructions: string;
  patch: LessonPatch;
  isChallenge?: boolean;
  hint?: string;
  /** Applied by "Skip to solution" — the patch that represents a correct answer. */
  solutionPatch?: LessonPatch;
  /** HTML/CSS structural check. Runs against the live state's elements. */
  expected?: ExpectedNode[];
  /** JS behavioral check. Runs against the live state's exported HTML/JS. */
  behavior?: BehaviorScript;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  /** Which catalog tab this lesson lives under. */
  topic: "html" | "css" | "js";
  /** Grouping label within a topic's lesson list, e.g. "Semantic Structure". */
  unit: string;
  steps: LessonStep[];
}

export type { LabElement, LabState, MediaQuery };
