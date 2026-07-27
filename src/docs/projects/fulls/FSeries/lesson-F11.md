# Lesson F11: Forms Done Well

**What you will build**
A create-post form using `zod` for real, runtime validation and `shadcn`'s form components — closing the loop on F1's central distinction between compile-time and runtime type checking. The problem we're solving: F5's login form has no validation at all beyond what the backend eventually rejects; a real form should give immediate feedback, without ever pretending that feedback replaces the backend's own enforcement.

**What you need to know first**
F1 (compile-time vs. runtime checking — directly revisited here). F5 (controlled inputs, form submission). Backend Lesson 4 (`Field(min_length=1)`, trust boundaries).

---

## Concept Unit: `zod` — Runtime Validation on the Frontend

### The Problem

F1 established, precisely, that TypeScript types vanish at runtime — a `content: string` type annotation does nothing to stop an empty string from being submitted. Backend Lesson 4's `Field(min_length=1)` solved this exact problem server-side, at runtime, via Pydantic. The frontend needs its own runtime check, for the same reason — to give a user immediate feedback before a round-trip to the server is even necessary.

### Introduce the concept in isolation

```bash
npm install zod
```

Create `frontend/src/lab/zod_demo.ts`:

```typescript
import { z } from "zod";

const PostSchema = z.object({
    content: z.string().min(1, "Content cannot be empty"),
});

const goodResult = PostSchema.safeParse({ content: "hello" });
console.log(goodResult.success);

const badResult = PostSchema.safeParse({ content: "" });
console.log(badResult.success);
if (!badResult.success) {
    console.log(badResult.error.issues[0].message);
}
```

Run it:

```bash
npx ts-node lab/zod_demo.ts
```

Output:

```text
true
false
Content cannot be empty
```

*What this proves — directly closing F1's loop:* `PostSchema.safeParse({content: ""})` was checked at **runtime**, on real data, not caught by `tsc` at compile time the way F1's `addTyped("2", "3")` type error was. This is the missing half F1 flagged: `zod` gives TypeScript projects the same runtime-enforcement capability Pydantic already gave the backend — a genuinely different mechanism from TypeScript's own compile-time-only types, existing specifically to check real, unpredictable data as it arrives.

### Explain the mechanism

`z.object({...})` defines a **schema** — a runtime-checkable description of a shape, directly analogous to a Pydantic `BaseModel`. `.safeParse(data)` checks arbitrary data against it, returning a result object rather than throwing, so both success and failure can be handled explicitly (`badResult.success` is `false`, with `.error.issues` describing exactly what failed) — the frontend equivalent of Pydantic automatically producing a structured `422` response.

### Discard the throwaway example

Delete `frontend/src/lab/zod_demo.ts`. Build the real create-post form.

### Project Change

* **Files affected:** Create `src/CreatePostForm.tsx`. Modify `api/posts.ts`.
* **Change type:** Add + Modify.

### The New Code

```typescript
// api/posts.ts — add
import type { PostRead } from "../types/api";

export function createPost(content: string): Promise<PostRead> {
    return apiFetch<PostRead>("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
}
```

```tsx
// src/CreatePostForm.tsx
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { createPost } from "../api/posts";

const PostSchema = z.object({
    content: z.string().min(1, "Post cannot be empty"),
});

function CreatePostForm({ onPosted }: { onPosted: () => void }) {
    const [content, setContent] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = PostSchema.safeParse({ content });
        if (!result.success) {
            setValidationError(result.error.issues[0].message);
            return;
        }
        setValidationError(null);
        setServerError(null);
        try {
            await createPost(content);
            setContent("");
            onPosted();
        } catch (err) {
            setServerError((err as Error).message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
                className="border rounded-md p-2"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
            />
            {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
            {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
            <Button type="submit">Post</Button>
        </form>
    );
}

export default CreatePostForm;
```

### Mechanical walkthrough

1. Two separate error states, `validationError` and `serverError`: (first appearance of deliberately distinguishing failure sources). A client-side `zod` failure never reaches the network at all; a `serverError` means the request *was* sent and the backend itself rejected it (e.g., an expired token, a genuine server-side issue `zod`'s local check couldn't have known about) — keeping them visually and logically separate makes clear which layer actually caught the problem.
2. `onPosted: () => void` prop: (already-established function-as-prop from F4's exercises). Lets the parent (a future feed page) know a post succeeded, so it can refresh the list — a child notifying a parent, the sanctioned direction per F4's unidirectional data flow rule.

### CS Lens

**`zod`'s runtime schema and TypeScript's compile-time type are two separate, complementary systems — not the same mechanism twice.** This is worth stating precisely: `PostSchema` and a hypothetical `interface PostContent { content: string }` look similar, but only `PostSchema` actually inspects data as it exists at runtime; the `interface` alone, per F1's core lesson, would silently accept anything the compiler couldn't prove otherwise about ahead of time. Real projects often use both together (`zod` schemas that also *generate* their corresponding TypeScript type), a natural next step this lesson doesn't build but is worth knowing exists.

### SE Lens

**Client-side validation is a UX improvement, never a substitute for the backend's own enforcement — the frontend restatement of backend Lesson 4's trust-boundary rule.** `PostSchema`'s check happens entirely inside the browser, fully bypassable by anyone calling the API directly (with `curl`, or a modified request) rather than through this form. The backend's `Field(min_length=1)` (Lesson 4) remains the actual, unbypassable enforcement; `zod` here exists purely to give faster feedback than a round-trip to the server would.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

Submitting an empty post shows `"Post cannot be empty"` instantly, with no network request made at all (visible in the browser's network tab: nothing fired). Submitting real content posts successfully, calling the real backend.

---

## Closing

**Connect the pieces**
`zod`'s `PostSchema` checks real data at runtime, closing exactly the gap F1 identified in TypeScript's own compile-time-only types — the frontend's structural equivalent of backend Lesson 4's `Field(min_length=1)`. `validationError` and `serverError` are kept explicitly distinct, since a `zod` failure never reaches the network, while a `serverError` means the backend itself was the one that rejected the request.

**What breaks without this**
Without `zod`, every validation rule would need to be either duplicated as ad-hoc `if` checks scattered through the submit handler, or skipped entirely client-side — losing the fast-feedback benefit and forcing every invalid submission through a full network round-trip just to learn what a local check could have caught instantly.

**Exercises**
1. Add a `.max(500, "Post is too long")` rule to `PostSchema`, matching a reasonable real-world post length limit not currently enforced by the backend at all — and note, in a sentence, that this creates a real mismatch: the frontend now enforces a rule the backend doesn't, which is a gap worth eventually closing on the backend side too.
2. Rebuild `LoginForm` (F5) using a `zod` schema requiring `password.length >= 8`, mirroring backend Lesson 13's `Field(min_length=8)` exactly.

**Definition of Done**
* [x] `zod` validates post content at runtime, client-side, before any network request.
* [x] Validation errors and server errors kept explicitly distinct.
* [x] Can explain, without notes, why `zod`'s check and a TypeScript `interface` are not the same protection.
* [x] Commit: `feat: create-post form with zod runtime validation`

---

## Context Snapshot (End of Lesson F11)

**Frontend File Tree:** adds `src/CreatePostForm.tsx`; modifies `api/posts.ts`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `zod` schema | F11 | Runtime-checkable shape description, the frontend counterpart to a Pydantic `BaseModel` |
| `.safeParse()` | F11 | Validates data, returning a success/failure result rather than throwing |
| Validation error vs. server error (distinguished) | F11 | Whether a failure was caught locally or by the backend after a real request |

**Lesson Completion State:**
- Completed: F1-F11, Interludes E, F — **Phase F4 complete**
- Next: F12 — `useEffect`'s Dependency Array, Fully Explained

**Maps to backend:** `PostSchema` mirrors backend Lesson 4's `PostCreate.content` validation exactly, client-side, closing F1's runtime-vs-compile-time gap for real application data for the first time.
