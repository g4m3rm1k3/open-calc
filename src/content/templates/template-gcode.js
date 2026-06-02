// ═══════════════════════════════════════════════════════════════════════════
// CNC / G-CODE LESSON TEMPLATE
// Use for: CNC-1 — machining, G-code programming, machine setup
//
// HOW TO FILL THIS IN:
//   1. Replace every value in UPPER_CASE with your content
//   2. GcodeNotebook cells contain G-code in startCode
//   3. Use CNCLab for full machine simulation cells
//   4. semantics.core: define all key terms used in the lesson
//
// SUBMIT: email your completed file to m1k3ymcl34n@gmail.com
//         subject: [Lesson Submission] YOUR TITLE
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // ── Identity ──────────────────────────────────────────────────────────────
  // id format: cnc-CHAPTER-ORDER-SLUG
  // Examples: 'cnc-1-005-g02-arc-moves'  |  'cnc-1-010-canned-cycles'
  id: 'cnc-CHAPTER-ORDER-SLUG',
  slug: 'url-friendly-slug',
  chapter: 'cnc-1',
  order: 5,
  title: 'YOUR LESSON TITLE',
  subtitle: 'One sentence: what skill or concept this lesson teaches.',
  tags: ['CNC', 'G-code', 'KEYWORD'],
  aliases: 'SPACE SEPARATED SEARCH KEYWORDS for this topic',
  timeToComplete: 30,   // estimated minutes
  coreConcept: `THE KEY IDEA in one sentence.`,
  prerequisites: [],    // array of lesson slugs that should be completed first

  // ── Key terms ─────────────────────────────────────────────────────────────
  // Define every term a student needs to know for this lesson.
  semantics: {
    core: [
      {
        symbol: 'G-CODE OR TERM',
        meaning: `FULL DEFINITION. Be specific — include units, default values, and what happens if omitted.`,
      },
      {
        symbol: 'ANOTHER TERM',
        meaning: `FULL DEFINITION.`,
      },
      {
        symbol: 'ANOTHER TERM',
        meaning: `FULL DEFINITION.`,
      },
    ],
    rulesOfThumb: [
      `PRACTICAL RULE 1 — e.g. "Always specify F (feed rate) on the first motion block; controllers have no sensible default."`,
      `PRACTICAL RULE 2`,
      `PRACTICAL RULE 3`,
      `PRACTICAL RULE 4`,
    ],
  },

  // ── Hook ──────────────────────────────────────────────────────────────────
  hook: {
    question: `MOTIVATING QUESTION — what goes wrong without this knowledge?`,
    realWorldContext: `WHERE THIS G-CODE CONCEPT APPEARS IN REAL MACHINING. What does getting it wrong cost?`,
  },

  // ── Intuition ─────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      `**The machine's perspective.** EXPLAIN THE CONCEPT FROM HOW THE CONTROLLER INTERPRETS IT.`,

      `**What the code does step by step.** Walk through a minimal example block by block: \`G CODE EXAMPLE\` — this tells the controller WHAT IT DOES.`,

      `**Before writing code, predict:** if you change PARAMETER from VALUE to VALUE, what would the tool path look like?`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'CNC Lesson X',
        body: `**Previous:** PREVIOUS LESSON\n**This:** THIS LESSON\n**Next:** NEXT LESSON`,
      },
      {
        type: 'procedure',
        title: 'Using CONCEPT in a program',
        body: `1. STEP 1\n2. STEP 2\n3. STEP 3\n4. SAFETY CHECK: WHAT TO VERIFY BEFORE RUNNING`,
      },
      {
        type: 'warning',
        title: 'COMMON MISTAKE',
        body: `DESCRIBE WHAT GOES WRONG AND WHY. Include the consequences (broken tool, scrapped part, machine crash).`,
      },
    ],
    visualizations: [
      // ── GcodeNotebook — G-code editor + simulation ──────────────────────
      {
        id: 'GcodeNotebook',
        title: 'G-code Lab',
        props: {
          lesson: {
            title: 'LAB TITLE',
            subtitle: 'LAB SUBTITLE',
            sequential: true,
            cells: [

              // Cell 1 — Introduce the G-code
              {
                type: 'gcode',
                instruction: `**TASK 1.** WHAT TO OBSERVE IN THE TOOLPATH PREVIEW. Try changing PARAMETER and re-running.`,
                startCode: `; COMMENT DESCRIBING WHAT THIS PROGRAM DOES
; Material: MATERIAL, Tool: TOOL DESCRIPTION
O0001

G17 G21 G90     ; XY plane, mm, absolute positioning
G54             ; work offset
T1 M6           ; tool change
S1200 M3        ; spindle 1200 rpm, clockwise

G0 Z5.          ; rapid to safe height
G0 X0. Y0.      ; rapid to start

; YOUR TOOLPATH HERE
G1 Z-1. F100    ; plunge
G1 X50. F200    ; linear move
G1 Y50.
G1 X0.
G1 Y0.

G0 Z5.          ; retract
M5              ; spindle off
M30             ; program end`,
              },

              // Cell 2 — Modify and practice
              {
                type: 'gcode',
                instruction: `**TASK 2.** WHAT TO MODIFY. WHAT TO ACHIEVE. Describe success criteria.`,
                startCode: `; STARTER CODE FOR SECOND EXERCISE
; Modify this program to ACHIEVE TASK 2
O0002

G17 G21 G90
G54
T1 M6
S1200 M3

G0 Z5.
G0 X0. Y0.

; YOUR CODE HERE

G0 Z5.
M5
M30`,
              },

              // Cell 3 — Challenge
              {
                type: 'gcode',
                instruction: `**Challenge: WRITE THIS PROGRAM FROM SCRATCH.**\n\nRequirements:\n- REQUIREMENT 1\n- REQUIREMENT 2\n- REQUIREMENT 3`,
                startCode: `; Write your program here
O0003

G17 G21 G90
G54
T1 M6
S1200 M3

; Your toolpath here

M5
M30`,
              },

            ],
          },
        },
      },
    ],
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  examples: [
    {
      title: 'Example 1: DESCRIBE THE MACHINING OPERATION',
      steps: [
        {
          expression: `GCODE BLOCK`,
          annotation: `EXPLAIN WHAT THIS BLOCK DOES AND WHY IT MUST COME IN THIS ORDER.`,
        },
        {
          expression: `GCODE BLOCK`,
          annotation: `ANNOTATION`,
        },
      ],
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option A text',   // ← copy-paste from options exactly
      hints: [`HINT`],
      reviewSection: 'intuition',
    },
    {
      id: 'q2',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option B text',
      hints: [`HINT`],
      reviewSection: 'intuition',
    },
    {
      id: 'q3',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option C text',
      hints: [`HINT`],
      reviewSection: 'intuition',
    },
  ],
}
