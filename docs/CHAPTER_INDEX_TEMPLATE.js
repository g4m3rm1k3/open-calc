/**
 * UpSkillOS Chapter Index Template
 * 
 * Copy this file when creating a new course or chapter.
 * This template enforces the Act-based narrative structure used in 
 * Calculus Chapters 2 & 3 (the gold standard).
 */

// 1. Import all lessons here
// import introduction from './00-introduction.js'
// import coreConcept from './01-core-concept.js'

export default {
  // ── Identity ──────────────────────────────────────────────
  id: 'coursekey-chapter-number',   // e.g., 'calc-chapter-4' or 'py-chapter-1'
  number: '1',                      // Integer for core math tracks, string ('1.1') for others
  title: 'Chapter Title Here',
  slug: 'chapter-slug',             // Lowercase, hyphenated URL segment
  description: 'One or two sentences explaining exactly what this chapter accomplishes and why it matters in the larger course.',
  color: 'blue',                    // Tailwind color name used for UI accents

  // ── Chapter Story Arc ─────────────────────────────────────
  // This chapter is a single coherent journey, not a collection of isolated
  // techniques. Explain the pedagogical arc here. This helps other contributors
  // (and AI agents) understand where a new lesson should go and why.
  //
  // ACT 1 — FOUNDATIONS (Lessons 0–1)
  //   What is the core problem? What basic tools do we introduce first?
  //
  // ACT 2 — THE TOOLKIT (Lessons 2–4)
  //   How do we formalize and expand those tools?
  //
  // ACT 3 — SYNTHESIS & APPLICATIONS (Lessons 5+)
  //   How do we use the toolkit to solve real problems?

  lessons: [
    // ── Act 1: Foundations ──────────────────────────────────
    // introduction,      // 0 — Hook and intuitive overview
    
    // ── Act 2: The Toolkit ──────────────────────────────────
    // coreConcept,       // 1 — The main technique formalized

    // ── Act 3: Synthesis ────────────────────────────────────
  ],
}
