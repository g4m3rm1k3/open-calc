// Builds the downloadable "Lesson Prompt" behind the Help modal's Feedback
// & Bugs rows — for BOTH bugs and suggestions. The contract itself lives at
// src/docs/BUG_LESSON_CONTRACT.md as a real, standalone document (not a
// condensed paraphrase) — it embeds the actual src/docs/LESSON_ENGINE_CONTRACT.md
// in full, plus what changes when the source is a real bug/suggestion taught
// by an AI with no file access. This file just appends the specific report's
// details to that contract; it does not restate or thin it.
import BUG_LESSON_CONTRACT from '../docs/BUG_LESSON_CONTRACT.md?raw'

export { BUG_LESSON_CONTRACT }

function bugTask(item) {
  return `=== BUG REPORT ===
Title: ${item.title || '(no title)'}
Category: ${item.category || 'bug'}
Reported: ${item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : 'unknown'}

Description:
${item.description || '(no description)'}

Apply "Applying this to a bug report" from the contract above to this
specific report.`
}

function suggestionTask(item) {
  return `=== SUGGESTION ===
Title: ${item.title || '(no title)'}
Suggested: ${item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : 'unknown'}

Description:
${item.description || '(no description)'}

Apply "Applying this to a suggestion" from the contract above to this
specific idea.`
}

export function buildLessonPrompt(item) {
  const task = item.kind === 'suggestion' ? suggestionTask(item) : bugTask(item)
  return `You do not need a paid AI coding agent for this — paste everything below
into any free AI chat (ChatGPT, Claude.ai, etc.).

${BUG_LESSON_CONTRACT}

=== YOUR TASK ===
${task}
`
}
