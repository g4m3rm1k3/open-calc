# Concept Integration Map — Developer Social Network

Where each fundamental you were missing gets taught for real, inside the project, instead of as a separate detour. Some slot into existing lessons naturally; a few need a short standalone **Interlude** because the 24-lesson list is API/DB-shaped and doesn't have a natural home for them otherwise. Interludes follow the same schema (explain-before-name, failing test where applicable, terminology ledger) — they're not a break from the method, just not tied to a user story.

| Fundamental | Where it lives | Why it fits there |
|---|---|---|
| Type systems (why types, static vs dynamic) | Lesson 1 (Pydantic validation) | The first request/response cycle already forces the question "what shape is this data" |
| Stack vs heap, references vs values | **Interlude A** (after Lesson 1) | Nothing in Lesson 1-3 forces this naturally; needs to land before the tree/recursion lessons make sense |
| Data structures (trees, adjacency lists) | Lesson 9 (self-referencing follow relationships) | Same structure as the Nexus location tree — a real motivating case, not abstract |
| Hash maps under the hood | **Interlude B** (after Lesson 9) | Sessions/lookups in Lesson 14 need this; better taught once, deliberately, than assumed |
| Big-O, applied | Lesson 10 (search) and Lesson 12 (multi-table JOINs + EXPLAIN QUERY PLAN) | You'll see the cost of `LIKE` vs an index directly in query plans — Big-O with receipts |
| Software design (coupling/cohesion, SOLID, DI) | Lesson 16 (Repository/Service layers) | This lesson already exists to teach exactly this; just needs the explain-first treatment |
| Testing methodology (not just tools) | Structural, per the schema's Rule 3 — every lesson from Lesson 1 | No longer a topic, a mechanic |
| Debugging as method | **Interlude C** (after Lesson 6, first real bug-prone CRUD) | First point where something is likely to actually break in a non-trivial way |
| Memory model, GC vs manual | **Interlude D** (after Lesson 15, in-memory test DB) | Lesson 15 already touches `:memory:` — natural jumping-off point to contrast with C++ later |

**Sequence with interludes inserted:**
Lesson 1 → Interlude A (memory model) → Lessons 2-8 → Interlude C (debugging) → Lesson 9 → Interlude B (hash maps) → Lessons 10-15 → Interlude D (memory: GC vs manual) → Lessons 16-24

This becomes your standing reference — when you finish the project, this table tells you exactly which lesson to reopen for which concept, instead of re-searching a wall of lessons.
