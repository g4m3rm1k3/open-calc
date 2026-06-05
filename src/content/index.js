import { COURSES } from "./courses.js";
import ch0 from "./chapter-0/index.js";
import ch1 from "./chapter-1/index.js";
import ch2 from "./chapter-2/index.js";
import ch3 from "./chapter-3/index.js";
import ch4 from "./chapter-4/index.js";
import ch5 from "./chapter-5/index.js";
import ch6 from "./chapter-6/index.js";
import discrete1 from "./discrete-math/index.js";
import precalc1 from "./precalc/index.js";
import precalc2 from "./precalc-2/index.js";
import precalc3 from "./precalc-3/index.js";
import precalc4 from "./precalc-4/index.js";
import precalc5 from "./precalc-5/index.js";
import physics1Chapters from "./physics-1/index.js";
import geo1 from "./geometry-1/index.js";
import geo2 from "./geometry-2/index.js";
import geo3 from "./geometry-3/index.js";
import geo4 from "./geometry-4/index.js";
import geo5 from "./geometry-5/index.js";
import geo6 from "./geometry-6/index.js";
import web1 from "./web-1/index.js";
import linearAlgebra1 from "./linear-algebra/index.js";
import python1 from "./python-1/index.js";
import dataScience1 from "./data-science/index.js";
import javascriptCore1 from "./javascript-1/index.js";
import tetris1 from "./tetris-1/index.js";
import cs1 from "./cs-1/index.js";
import chemistry1 from "./chemistry-1/index.js";
import chemistry2 from "./chemistry-2/index.js";
import chemistry3 from "./chemistry-3/index.js";
import chemistry4 from "./chemistry-4/index.js";

import elec0 from "./elec-0/index.js";
import logic0 from "./logic-0/index.js";
import plc0 from "./plc-0/index.js";
import digitalFundamentals from "./digital-fundamentals/index.js";
import cnc1 from "./cnc-1/index.js";
import git0 from "./git-0/index.js";
import cli0 from "./cli-0/index.js";
import cpp0 from "./cpp-0/index.js";
import cpp1 from "./cpp-1/index.js";
import cpp2 from "./cpp-2/index.js";
import git1 from "./git-1/index.js";
import dsa1 from "./dsa-1/index.js";
import dp1 from "./dp-1/index.js";
import design1 from "./design-1/index.js";
import threejs1 from "./three-js-1/index.js";
import aiEngineering0 from "./ai-engineering-0/index.js";
import aiEngineering1 from "./ai-engineering-1/index.js";
import aiEngineering11 from "./ai-engineering-11/index.js";
import aiEngineering2 from "./ai-engineering-2/index.js";
import threeJs2 from "./three-js-2/index.js";
import canvas1 from "./canvas-1/index.js";
import gcodeParser1 from "./gcode-parser-1/index.js";
import sql0 from "./sql-0/index.js";
import sql1 from "./sql-1/index.js";
import nosql1 from "./nosql-1/index.js";
import appliedStatistics from "./applied-statistics/index.js";
import sim1 from "./sim-1/index.js";
import sim2 from "./sim-2/index.js"
import sim3 from "./sim-3/index.js";

const CALC_CURRICULUM = [ch0, ch1, ch2, ch3, ch4, ch5, ch6].map((ch) => ({
  ...ch,
  course: "calc",
}));
const DISCRETE_CURRICULUM = [discrete1].map((ch) => ({
  ...ch,
  course: "discrete",
}));
const PRECALC_CURRICULUM = [
  precalc1,
  precalc2,
  precalc3,
  precalc4,
  precalc5,
].map((ch) => ({ ...ch, course: "precalc" }));
const PHYSICS_CURRICULUM = physics1Chapters.map((ch) => ({
  ...ch,
  course: "physics-1",
}));
const GEOMETRY_CURRICULUM = [geo1, geo2, geo3, geo4, geo5, geo6].map((ch) => ({
  ...ch,
  course: "geometry",
}));
const WEB_CURRICULUM = web1.map((ch) => ({ ...ch, course: "web-1" }));
const LA_CURRICULUM = linearAlgebra1.map((ch) => ({
  ...ch,
  course: "linear-algebra",
}));
const PYTHON_CURRICULUM = python1.map((ch) => ({ ...ch, course: "python-1" }));
const DATA_SCIENCE_CURRICULUM = dataScience1.map((ch) => ({
  ...ch,
  course: "data-science-1",
}));
const JAVASCRIPT_CORE_CURRICULUM = javascriptCore1.map((ch) => ({
  ...ch,
  course: "javascript-core",
}));
const TETRIS_CURRICULUM = tetris1.map((ch) => ({ ...ch, course: "tetris" }));
const CS_CURRICULUM = cs1.map((ch) => ({ ...ch, course: "cs-1" }));
const CHEMISTRY_CURRICULUM = [
  ...chemistry1,
  ...chemistry2,
  ...chemistry3,
  ...chemistry4,
].map((ch) => ({ ...ch, course: "chemistry-1" }));
const ELEC0_CURRICULUM = elec0.map((ch) => ({ ...ch, course: "elec-0" }));
const LOGIC0_CURRICULUM = logic0.map((ch) => ({ ...ch, course: "logic-0" }));
const PLC0_CURRICULUM = plc0.map((ch) => ({ ...ch, course: "plc-0" }));
const DIGITAL_FUNDAMENTALS_CURRICULUM = digitalFundamentals.map((ch) => ({
  ...ch,
  course: "digital-fundamentals",
}));
const CNC_CURRICULUM = [cnc1].map((ch) => ({ ...ch, course: "cnc-logic" }));
const GIT0_CURRICULUM = [git0].map((ch) => ({ ...ch, course: "git-0" }));
const CLI0_CURRICULUM = [cli0].map((ch) => ({ ...ch, course: "cli-0" }));
const CPP0_CURRICULUM = [cpp0].map((ch) => ({ ...ch, course: "cpp" }));
const CPP1_CURRICULUM = [cpp1].map((ch) => ({ ...ch, course: "cpp" }));
const CPP2_CURRICULUM = [cpp2].map((ch) => ({ ...ch, course: "cpp" }));
const GIT_CURRICULUM = [git1].map((ch) => ({ ...ch, course: "git-logic" }));
const DSA_CURRICULUM = dsa1.map((ch) => ({ ...ch, course: "dsa-1" }));
const DP_CURRICULUM = dp1.map((ch) => ({ ...ch, course: "dp-1" }));
const DESIGN_CURRICULUM = design1.map((ch) => ({ ...ch, course: "design-1" }));
const THREEJS_CURRICULUM = threejs1.map((ch) => ({
  ...ch,
  course: "three-js-1",
}));
const THREEJS2 = threeJs2.map((ch) => ({ ...ch, course: "three-js-2" }));
const CANVAS_CURRICULUM = canvas1.map((ch) => ({ ...ch, course: "canvas-1" }));
const GCODE_PARSER_CURRICULUM = gcodeParser1.map((ch) => ({
  ...ch,
  course: "gcode-parser-1",
}));
const SQL0_CURRICULUM = [sql0].map((ch) => ({ ...ch, course: "sql-0" }));
const SQL1_CURRICULUM = [sql1].map((ch) => ({ ...ch, course: "sql-1" }));
const NOSQL1_CURRICULUM = [nosql1].map((ch) => ({ ...ch, course: "nosql-1" }));
const APPLIED_STATS_CURRICULUM = appliedStatistics.map((ch) => ({
  ...ch,
  course: "applied-statistics",
}));
const AI_ENGINEERING_CURRICULUM = [...aiEngineering0, ...aiEngineering1, ...aiEngineering2, ...aiEngineering11].map(
  (ch) => ({ ...ch, course: "ai-engineering" }),
);
const SIM1_CURRICULUM = sim1.map((ch) => ({ ...ch, course: "sim-1" }));
const SIM2_CURRICULUM = sim2.map((ch) => ({ ...ch, course: "sim-1" }));
const SIM3_CURRICULUM = sim3.map((ch) => ({ ...ch, course: "sim-1" }));

export const CURRICULUM = [
  ...PRECALC_CURRICULUM,
  ...GEOMETRY_CURRICULUM,
  ...CALC_CURRICULUM,
  ...DISCRETE_CURRICULUM,
  ...PHYSICS_CURRICULUM,
  ...WEB_CURRICULUM,
  ...LA_CURRICULUM,
  ...PYTHON_CURRICULUM,
  ...DATA_SCIENCE_CURRICULUM,
  ...JAVASCRIPT_CORE_CURRICULUM,
  ...TETRIS_CURRICULUM,
  ...CS_CURRICULUM,
  ...CHEMISTRY_CURRICULUM,
  ...ELEC0_CURRICULUM,
  ...LOGIC0_CURRICULUM,
  ...PLC0_CURRICULUM,
  ...DIGITAL_FUNDAMENTALS_CURRICULUM,
  ...CNC_CURRICULUM,
  ...GIT0_CURRICULUM,
  ...GIT_CURRICULUM,
  ...DSA_CURRICULUM,
  ...DP_CURRICULUM,
  ...DESIGN_CURRICULUM,
  ...THREEJS_CURRICULUM,
  ...AI_ENGINEERING_CURRICULUM,
  ...THREEJS2,
  ...CANVAS_CURRICULUM,
  ...GCODE_PARSER_CURRICULUM,
  ...SQL0_CURRICULUM,
  ...SQL1_CURRICULUM,
  ...NOSQL1_CURRICULUM,
  ...APPLIED_STATS_CURRICULUM,
  ...CLI0_CURRICULUM,
  ...CPP0_CURRICULUM,
  ...CPP1_CURRICULUM,
  ...CPP2_CURRICULUM,
  ...SIM1_CURRICULUM,
  ...SIM2_CURRICULUM,
  ...SIM3_CURRICULUM,
];

// Flat map for O(1) lookup by slug within chapter
export const LESSON_MAP = Object.fromEntries(
  CURRICULUM.flatMap((ch) =>
    ch.lessons.map((l) => [`${ch.number}/${l.slug}`, l]),
  ),
);

// All lessons as a flat array (useful for prev/next navigation)
export const ALL_LESSONS = CURRICULUM.flatMap((ch) =>
  ch.lessons.map((l) => ({
    ...l,
    chapterNumber: ch.number,
    chapterTitle: ch.title,
    course: l.course ?? ch.course,
  })),
);

export { COURSES };

// Dev-only: validate lesson.chapter fields match the chapter.number they live in
if (typeof import.meta.env !== "undefined" && import.meta.env.DEV) {
  const knownChapterNumbers = new Set(CURRICULUM.map((ch) => ch.number));
  for (const ch of CURRICULUM) {
    for (const lesson of ch.lessons) {
      if (lesson.chapter !== undefined && lesson.chapter !== ch.number) {
        console.warn(
          `[open-calc validator] Lesson chapter mismatch:\n` +
            `  lesson.id      = "${lesson.id}"\n` +
            `  lesson.chapter = ${lesson.chapter}  ← should be ${ch.number}\n` +
            `  chapter.title  = "${ch.title}"\n` +
            `  Fix: set chapter: ${ch.number} in ${lesson.id}.js`,
        );
      }
      if (
        lesson.chapter !== undefined &&
        !knownChapterNumbers.has(lesson.chapter)
      ) {
        console.warn(
          `[open-calc validator] Lesson references unknown chapter: "${lesson.id}" has chapter=${lesson.chapter} which does not match any chapter.number`,
        );
      }
    }
  }
}

// Cache bust 3
