# FlowBoard Masterclass — Lab Prompt Template

**Instructions:** Paste this entire file at the start of ANY new AI session that will write or continue a FlowBoard lab. Do not skip steps. The session does not begin until all four reads are confirmed.

---

## Session Start Protocol

You are writing a lab for the **FlowBoard Masterclass** series. Before writing a single word of the lab, you must:

### Step 1 — Read the teaching spec
Read `LESSON-REQUIREMENTS-UNIVERSAL.md` in full.  
This governs every structural and quality decision. It overrides any other instinct about how to write a lesson.  
**Confirm:** "I have read LESSON-REQUIREMENTS-UNIVERSAL.md."

### Step 2 — Read the series spec
Read `flowboard-masterclass/SERIES-SPEC.md` in full.  
This defines the learner's starting knowledge, the drift prevention rules, the alternative implementation rule, the CSS mental model progression, and — critically — the **Complete Topic Coverage Master Checklist** which lists every CSS property, TypeScript feature, React concept, and database technique this series must cover.  
**Confirm:** "I have read SERIES-SPEC.md. The topics this lab will cover from the Master Checklist are: [list them]."

### Step 3 — Read the concept registry
Read `flowboard-masterclass/CONCEPT-REGISTRY.md`.  
Every concept already taught is listed here. You must NOT write a new concept block for anything already in this registry. Instead reference it: "First taught in LAB-XX."  
**Confirm:** "I have read CONCEPT-REGISTRY.md. The following concepts from this lab's plan are already taught: [list or 'none']."

### Step 3.5 — Read canonical app state (required)
Read `flowboard-masterclass/APP-STATE-CANON.md`.
This is the canonical implementation baseline (files, exports, class names, data shape, and current visible UI).
No lab may introduce snippets before reconciling with this state.
**Confirm:** "I have read APP-STATE-CANON.md and will adapt all snippets to this baseline."

### Step 4 — Answer the five drift check questions
Before writing the lab, answer all five out loud:

1. Does Step 1 of this lab produce something visible in the browser or terminal in under 5 minutes?
2. Is every concept that appears in this lab either (a) in the Concept Registry as already taught, or (b) given a full definition block before its first use in this lab?
3. Does every step introduce exactly one new concept or one new visible feature?
4. Does every step that changes visual appearance end with a CSS AND SEE block?
5. Does every step that changes behavior end with a SAVE AND TRY block that has: specific visible output, a console test, and a "change something" experiment?

If any answer is "no" or "I'm not sure" — resolve it before writing.

### Step 5 — Answer the abstraction transfer checks
Before writing the lab, answer all four out loud:

1. What is the abstraction this lab teaches (data, UI, architecture, algorithm, or protocol)?
2. What raw/broken version will the learner see first, before the abstraction is introduced?
3. What invariant does this abstraction protect that raw code does not?
4. Where else does this abstraction apply outside FlowBoard (at least two examples)?

If any answer is vague, the lab is not ready to write.

### Step 6 — Baseline Lock (required, no writing before this)
Before writing the lab, capture the learner's real code state and lock it as the baseline.

Required baseline snapshot:
1. Current files in `flowbard/src` (exact names)
2. Current component names and exports (exact names)
3. Current CSS class names already in use (exact names)
4. Current data shape used by the app (exact keys and optional fields)
5. Current visible UI state (what is on screen right now)

Then write a **Translation Map**:
- lesson snippet name -> learner baseline name
- example: `app` -> `app-container`
- example: `card-list` -> `list-column`

Hard rules:
- Do NOT ask the learner to rename working code just to match tutorial naming.
- Do NOT introduce a snippet that conflicts with baseline names unless you explicitly mark it as an intentional refactor.
- If refactor is intentional, provide a separate "Refactor Step" with verification before continuing.

**Confirm:** "Baseline locked. Translation Map created. Snippets will be adapted to baseline unless a refactor step is explicitly declared."

### Step 7 — Conflict Decision Tree (required)
If lesson text and learner code differ, apply this order:
1. Running learner code wins.
2. Preserve behavior and interfaces first.
3. Adapt snippet names/structure to baseline.
4. Only then consider refactor, and only as an explicit isolated step.

Any conflict must include this micro-block in the lesson:
- Conflict: [what differs]
- Decision: [adapt snippet or refactor]
- Why: [one sentence]
- Verify: [exact SAVE AND TRY expectation]

---

## Lab Context

Fill this in before writing:

**Lab number:** LAB-[NN]  
**Lab title:** [Title]  
**Previous lab:** LAB-[NN-1] — [Title]  
**What the learner has at the end of the previous lab:**  
[Describe the exact state — what is on screen, what files exist, what the app can do]

**What this lab adds (concrete, visible end state):**  
[Describe exactly what the learner will SEE when this lab is done]

**Concepts planned for this lab:**  
[List each one — check the registry for each before writing]

**Abstraction target for this lab:**  
[Name the main abstraction and why it exists in one sentence]

**Raw version first (required):**  
[Show the naive/broken approach the learner will run before the abstraction fix]

**Transfer targets outside FlowBoard (required):**  
[At least two domains where this exact abstraction applies]

**CSS this lab teaches:**  
[Specific properties, layout system, or model — reference which CSS phase from SERIES-SPEC.md]

**DB this lab teaches:**  
[Schema design decision, query type, or DB concept — or "none"]

**Alternative implementation note:**  
[If a library is used — what is the raw version taught first?]

**Baseline Lock Snapshot (required):**
- `src` files now: [list]
- Component/export names now: [list]
- CSS classes now: [list]
- Data shape now: [list]
- UI now: [what learner sees]

**Translation Map (required):**
- [lesson term] -> [learner baseline term]
- [lesson term] -> [learner baseline term]

**Compatibility risk check (required):**
- Risk 1: [possible mismatch]
- Risk 2: [possible mismatch]
- Mitigation per risk: [how lesson will avoid breakage]

---

## After the Lab Is Complete

Before closing the session:

1. Update `CONCEPT-REGISTRY.md` with every new concept block introduced in this lab
2. Update the "Concept Count by Lab" table in the registry
3. Record any naming decisions made in the "Naming Decisions Log"
4. In `SERIES-SPEC.md`, find every topic in the Master Checklist that this lab taught and change `[ ]` to `[LAB-NN]`
5. Write a one-paragraph "End State Summary" at the bottom of the lab file describing exactly what exists and what the app can do — this becomes the "previous lab" context for the next session
6. Add a final section named `Abstraction Transfer Check` with:
	- What this abstraction hides
	- Protected invariant
	- Two non-FlowBoard applications
	- One "misuse" example and why it fails
7. Update `APP-STATE-CANON.md` so the next lab starts from exact real code state

---

## The End State Summary Format

Every completed lab ends with this section (written by the session that wrote the lab):

```markdown
---

## End State Summary — LAB-[NN]

**Files that exist:**
- [list every file with a one-line description of its purpose]

**What the app does right now:**
[2–4 sentences. What the user sees, what they can interact with, what is hardcoded vs live]

**Concepts now in the registry from this lab:**
[bulleted list of canonical names added]

**Next lab will add:**
[one sentence — the concrete visible thing LAB-NN+1 introduces]
```

---

## Required End-of-Lab Block — Abstraction Transfer Check

Every completed lab must include this section after End State Summary:

```markdown
## Abstraction Transfer Check — LAB-[NN]

**Abstraction name:**
[canonical name]

**What it hides:**
[specific complexity hidden]

**Protected invariant:**
[the rule this abstraction enforces]

**Raw version pain recap:**
[what broke or became hard before introducing abstraction]

**Where this applies outside FlowBoard:**
- [example 1]
- [example 2]

**Misuse case:**
[one wrong use + visible failure symptom]
```
