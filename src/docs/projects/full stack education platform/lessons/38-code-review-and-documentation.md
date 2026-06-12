# Lesson 38 — Code Review and Documentation

## What You Will Build

Write pull request descriptions for three recent features, document the API with
OpenAPI/Swagger, and add JSDoc to the `checkOutput` and `calculateStreakUpdate` functions.
Practice reading code with fresh eyes — the skill behind effective code review.

---

## What You Need to Know First

- Lesson 21: `checkOutput`
- Lesson 22: `calculateStreakUpdate`
- Lesson 14: The lessons REST API

---

## The Lesson

### Step 1 — Why Code Review Exists

Code review is not about finding bugs. Automated tests, linters, and type checking find
most bugs faster than human review.

Code review exists for:
1. **Knowledge sharing:** Other engineers learn what changed and why.
2. **Alignment:** Does this change match the team's architecture, naming conventions, and goals?
3. **Second opinion:** "Is there a simpler approach?" — The author's first working solution may not be the best.
4. **Documentation:** The PR description is a permanent record of *why* the change was made.

The question to ask when reviewing code: **"Will a new team member understand why this code exists in six months?"**

### Step 2 — Writing Good PR Descriptions

A PR description has three audiences:
- **The reviewer:** What to look for, where to focus attention
- **Future developers:** Why this approach was chosen over alternatives
- **The author:** Clarity of thought — writing forces precision

**Template:**

```markdown
## What this does

One paragraph. The problem it solves, not what the code does.
The code shows what was done; the description explains why.

## How it works

Short summary of the approach. Mention non-obvious design decisions.

## What I considered but did not do

Alternative approaches and why they were rejected.
This is the most valuable part — it prevents reviewers from suggesting
approaches you already evaluated.

## Testing

How to verify the behavior. What cases are covered by tests.
What is NOT tested and why.

## Screenshots / before-after

For UI changes.
```

**Example PR description for the streak feature (Lesson 22):**

---

**Add streak tracking with atomic progress update**

*What this does:* Tracks consecutive daily completion and displays it on the Profile screen. Streaks break if a day is skipped. Solving the same lesson twice on the same day does not increment the streak.

*How it works:* `calculateStreakUpdate` is a pure function that handles the four possible cases (first activity, same-day, consecutive day, broken streak). It is called from the server-side `markLessonComplete` repository function. The progress record and streak fields are updated in a single `prisma.$transaction` to guarantee atomicity.

*What I considered but did not do:* Storing a full history of daily activity (like GitHub's contributions graph). Rejected: over-engineered for the current requirement; a single `lastActivityDate` field is sufficient for streak calculation. Can be added later if needed.

*Testing:* `calculateStreakUpdate` has unit tests for all four cases including the edge case where the user completes two lessons in one day. Integration test verifies the transaction rolls back correctly if the `user.update` fails.

---

### Step 3 — API Documentation with OpenAPI

**What OpenAPI is:**
OpenAPI (formerly Swagger) is a specification for describing REST APIs. An OpenAPI document
describes every endpoint: path, method, parameters, request body, response shape, authentication.
Tools generate interactive documentation (Swagger UI), client SDKs, and mock servers from it.

```bash
$ npm install @asteasolutions/zod-to-openapi swagger-ui-express
```

Using Zod schemas you already have (Lesson 14) to generate OpenAPI:
```typescript
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

const registry = new OpenAPIRegistry()

// Register the Lesson schema
const LessonSchema = registry.register('Lesson', z.object({
  id: z.number().openapi({ example: 1 }),
  title: z.string().openapi({ example: 'JavaScript Variables' }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  orderIndex: z.number(),
}))

// Register an endpoint
registry.registerPath({
  method: 'get',
  path: '/api/lessons/{id}',
  summary: 'Get a lesson by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().openapi({ example: '1' }) }),
  },
  responses: {
    200: {
      description: 'Lesson found',
      content: { 'application/json': { schema: LessonSchema } },
    },
    404: {
      description: 'Lesson not found',
    },
  },
})

// Generate the OpenAPI document and serve it
const generator = new OpenApiGeneratorV3(registry.definitions)
const document = generator.generateDocument({
  openapi: '3.0.0',
  info: { version: '1.0.0', title: 'Codex API' },
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document))
// Visit http://localhost:3000/api-docs for interactive documentation
```

**`@asteasolutions/zod-to-openapi` explained:**
This library extends Zod schemas with `.openapi({ ... })` metadata (examples, descriptions)
and generates OpenAPI schemas from Zod schemas. Since you already have Zod schemas for
all request/response types (Lesson 14), you generate documentation from the source of truth,
not a separate documentation file that can drift from the code.

**Why OpenAPI matters:**
- Frontend developers can explore the API without reading Express code
- Automatically generated TypeScript client (using `openapi-typescript`) provides typed
  API calls on the frontend — no manual `fetch` wrappers
- API contract testing: mock servers generated from the spec for isolated frontend testing

### Step 4 — Inline Documentation

**When to write comments:**
The lesson contract rule applies: write a comment only when the *why* is non-obvious.
Do not document what the code does — well-named identifiers do that.

**Good JSDoc for `checkOutput`:**
```typescript
/**
 * Compares actual code execution output against the expected output.
 * Normalizes both strings (trim, line endings) before comparing — this
 * prevents false negatives from trailing newlines in Python's print().
 *
 * Returns `matches: true` only when normalized strings are equal.
 * Never returns partial credit — all-or-nothing comparison is the intended behavior.
 */
export function checkOutput(actual: string, expected: string): DiffResult {
  const normalize = pipe(trimOutput, normalizeLineEndings, collapseEmptyLines)
  // ...
}
```

**Good JSDoc for `calculateStreakUpdate`:**
```typescript
/**
 * Pure function — no side effects, deterministic.
 *
 * The four cases handled:
 *   1. No prior activity    → streak = 1
 *   2. Same day             → unchanged (prevents double-counting same-day completions)
 *   3. Previous day         → streak + 1
 *   4. Gap of 2+ days       → streak = 1 (reset)
 *
 * Uses the caller's timezone for "today" and "yesterday" — the server passes the
 * timezone from the user's device, not UTC, to handle 11pm-midnight edge cases.
 */
export function calculateStreakUpdate(
  current: StreakData,
  activityDate: string,
  timeZone: string,
): StreakData {
```

**What makes these comments good:**
- They explain the *why* of the normalization decision ("prevents false negatives from Python's print()")
- They enumerate the non-obvious cases (same-day double-counting)
- They explain the timezone argument's purpose (not obvious from the signature alone)
- They do not restate what the code does — no "this function updates the streak"

### Step 5 — Reading Code as a Reviewer

**Effective code review checklist:**

For correctness:
- Does this handle the edge cases? List them explicitly.
- What happens when this fails? Is there a happy path but no error path?
- Does this match the specification (the PR description)?

For design:
- Is there a simpler approach? What would need to be true for the simpler approach to work?
- Will this be easy to change when requirements change?

For security (any PR touching auth, user input, or data access):
- Is user input validated before use?
- Are permissions checked on every data access path?
- Could this expose one user's data to another?

For performance:
- Will this scale with 10× the current data volume?
- Is there an N+1 query?

**Giving feedback:**
- **Nit:** Small style preference. The reviewer would accept it as-is.
- **Suggestion:** A potentially better approach, but not required.
- **Must change:** A bug, security issue, or architectural concern that blocks merge.

Labeling severity prevents "must fix" and "you could rename this variable" from feeling
equivalent. Both are technically "comments on the PR."

---

## Connect the Pieces

OpenAPI documentation generated from Zod schemas is the same single-source-of-truth
principle as the lesson data model (Lesson 21): lessons as data, one engine for all.
The Zod schema is the source of truth for both runtime validation and documentation.
The alternative — maintaining a separate `docs/api.md` alongside the Zod schemas — creates
two sources that drift apart.

The PR description's "What I considered but did not do" section is architectural decision
documentation. ADRs (Architecture Decision Records) are a formal version of this: a
directory of decision documents, each explaining a significant design choice and the
alternatives rejected. For teams, ADRs prevent re-litigating the same decisions as team
membership changes.

Code review is a social and technical process. The technical part (finding bugs) is easier;
the social part (giving feedback that improves code without damaging the relationship) is
harder. Labeling feedback severity (`nit:`, `suggestion:`, `must:`) is a convention that
reduces friction — it separates "I would do this differently" from "this breaks things."

---

## What Breaks Without This

Without OpenAPI documentation, a new frontend developer must read every Express route handler
to understand the API. For a 40-endpoint API, this takes hours. They make incorrect assumptions
about request/response shapes, write frontend code that fails at runtime, and ping the backend
developer for every question. Documentation is not a nicety — it is the interface contract
between teams.

Without the "why" in PR descriptions, a developer six months later reads `prisma.$transaction`
and wonders if it can be removed (it looks like an optimization). There is no record that
it was added specifically to prevent a streak/progress inconsistency bug found in QA. The
developer removes it. The bug reappears in production.

---

## Definition of Done

- [ ] Three PR descriptions are written for recent features (streak, WebSocket viewer count, file upload) using the template
- [ ] OpenAPI documentation is generated from Zod schemas and accessible at `/api-docs`
- [ ] JSDoc is added to `checkOutput` and `calculateStreakUpdate` explaining the non-obvious design decisions
- [ ] You performed a code review of one existing PR or recent commit and provided labeled feedback (nit/suggestion/must)
- [ ] You can answer: what is the primary purpose of code review (it is not bug-finding)?
- [ ] You can answer: what makes "What I considered but did not do" the most valuable PR section?
- [ ] You can answer: what is the advantage of generating OpenAPI docs from Zod schemas over a separate markdown file?
- [ ] You can answer: what is an ADR?
- [ ] `git commit` with a message explaining why — "Add OpenAPI documentation, JSDoc for core functions, and PR description templates"
