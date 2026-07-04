// Sanity checks over every lesson in the catalog, not just one fixture —
// catches authoring mistakes (an `expected` array that doesn't match its own
// `solutionPatch`, a duplicated step/lesson id, a challenge missing both
// `expected` and `behavior`) automatically as the curriculum grows, instead
// of relying on a live Playwright pass to notice.

import { describe, it, expect } from "vitest";
import { LESSONS } from "./catalog";
import { computeSolvedStateAtStep, validateStructure } from "./lessonEngine";

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

      it("every challenge step defines either a structural or behavioral check", () => {
        for (const step of lesson.steps) {
          if (!step.isChallenge) continue;
          expect(step.expected || step.behavior).toBeTruthy();
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
    });
  }
});
