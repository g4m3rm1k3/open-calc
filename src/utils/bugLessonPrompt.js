// Builds the downloadable prompt behind "Download agent prompt" on a bug
// row in the Help modal's Feedback & Bugs section. The deliverable it asks
// for is deliberately NOT a fix — it's a lesson-engine lesson (the format
// used by src/labs/lesson-engine/content/**, see contributor-series for
// real examples) that teaches a learner how to diagnose and fix this class
// of bug. That's the actual "lesson contract" for this app's lesson-engine
// content: YAML frontmatter + Markdown body, not the src/courses/ JS schema
// (which HelpModal's own AI Prompts section already covers separately, for
// math/CS course lessons — a different format for a different purpose).
const APP_CONTEXT = `UpSkillOS (repo folder name: open-calc) is a free, open-source, browser-native
STEM learning platform — React 18 + Vite + Tailwind, Firebase for auth/sync,
no paid backend. It teaches everything from calculus to CNC machining to web
development through interactive lessons, labs, and games.

One part of it is "the lesson engine" (src/labs/lesson-engine/) — a runtime
for short, code-forward lessons distinct from the platform's main math/CS
course lessons. Lesson-engine content is plain Markdown files with YAML
frontmatter, one file per "level," grouped into named "series" registered in
src/labs/lesson-engine/series.ts. A real example
(src/labs/lesson-engine/content/contributor-series/level-0.md):

---
series: contributor-series
level: 0
title: What Markdown Is
lang: javascript
---

# What Markdown Is

Plain prose paragraphs explaining the concept in plain English.

## A section heading

More prose. Triple-backtick fenced code blocks (\`\`\`javascript, \`\`\`python,
\`\`\`css, or \`\`\`text for diagrams/output) are how the lesson shows real code
or real output — this is the core teaching device, used constantly.
Bold (**text**) calls out key terms. "CS lens:" asides are used to connect a
concrete example to the underlying general concept.

RULES for a new lesson-engine file:
- Frontmatter fields are exactly: series (kebab-case id), level (integer,
  0-indexed, unique within that series), title, lang (the primary code
  language used in fenced blocks, e.g. javascript/python/css).
- Body is Markdown: # for the lesson title (matches frontmatter title), ##
  for sections, fenced code blocks with an explicit language tag.
- Teach from first principles — assume the reader has never seen this
  specific bug or this specific part of the codebase before.
- To register a new lesson, either add a new level to an existing series in
  src/labs/lesson-engine/series.ts (e.g. contributor-series already covers
  Markdown, Git, PRs, reading code, components, theming — a bug-fix lesson
  may fit there), or propose a new series id if none fits. Don't assume
  which — leave it to the maintainer reviewing the PR.`

export function buildBugLessonPrompt(bug) {
  return `You are being asked to write a LESSON, not a code fix.

A real bug was reported on UpSkillOS. Below is the app context you need,
followed by the bug report itself. Your job: investigate the codebase,
understand the root cause, and produce a lesson-engine Markdown lesson
(frontmatter + body, format specified below) that teaches a learner how to
find and fix this exact class of bug — the reasoning and the diagnostic
process, not just a diff. Assume the reader can read code but has never
seen this part of the codebase.

=== APP CONTEXT ===
${APP_CONTEXT}

=== BUG REPORT ===
Title: ${bug.title || '(no title)'}
Category: ${bug.category || 'bug'}
Reported: ${bug.createdAt?.toDate ? bug.createdAt.toDate().toISOString() : 'unknown'}

Description:
${bug.description || '(no description)'}

=== YOUR TASK ===
1. Find the relevant code for this bug.
2. Understand why it's broken — the actual root cause, not just symptoms.
3. Write a lesson-engine lesson (frontmatter + Markdown body, per the format
   above) that walks a learner through diagnosing and fixing this bug —
   what to look for, why the bug happens, and how the fix addresses the
   root cause. Include real code from this codebase in fenced blocks.
4. Suggest where it should live: an existing series in
   src/labs/lesson-engine/series.ts, or propose a new one — don't guess
   silently, say which and why in your PR description.
`
}
