// Sanity checks over every lesson in the catalog, not just one fixture —
// catches authoring mistakes (an `expected` array that doesn't match its own
// `solutionPatch`, a duplicated step/lesson id, a challenge missing both
// `expected` and `behavior`) automatically as the curriculum grows, instead
// of relying on a live Playwright pass to notice.

import { describe, it, expect } from "vitest";
import { LESSONS } from "./catalog";
import { computeSolvedStateAtStep, validateStructure, validatePageMeta } from "./lessonEngine";

describe("catalog", () => {
  it("has no duplicate lesson ids", () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const lesson of LESSONS) {
    describe(lesson.id, () => {
      it("has no duplicate step ids", () => {
        const ids = lesson.steps.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("every challenge step defines a structural, behavioral, or page-meta check", () => {
        for (const step of lesson.steps) {
          if (!step.isChallenge) continue;
          expect(step.expected || step.behavior || step.expectedPageTitle !== undefined || step.expectedFaviconUrl !== undefined).toBeTruthy();
        }
      });

      lesson.steps.forEach((step, i) => {
        if (!step.isChallenge || !step.expected) return;
        it(`step "${step.id}"'s own solutionPatch satisfies its expected structural check`, () => {
          const solved = computeSolvedStateAtStep(lesson, i);
          const result = validateStructure(solved.elements, step.expected!);
          expect(result.feedback).toEqual([]);
          expect(result.passed).toBe(true);
        });
      });

      lesson.steps.forEach((step, i) => {
        if (!step.isChallenge || (step.expectedPageTitle === undefined && step.expectedFaviconUrl === undefined)) return;
        it(`step "${step.id}"'s own solutionPatch satisfies its expected page-meta check`, () => {
          const solved = computeSolvedStateAtStep(lesson, i);
          const result = validatePageMeta(solved, step);
          expect(result.feedback).toEqual([]);
          expect(result.passed).toBe(true);
        });
      });
    });
  }
});
