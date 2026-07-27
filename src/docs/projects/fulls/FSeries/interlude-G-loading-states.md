# Interlude G: Loading/Error State as a Design Problem

**What you will build**
`FeedPage`, currently handling only the success case, extended to handle all three states every fetch genuinely has. The problem we're solving: F10's `FeedPage` renders an empty list while loading and would silently show nothing at all if `getFeed()` ever failed — both are real, user-visible gaps, not edge cases to worry about "later."

**What you need to know first**
F10 (`FeedPage`). F2 (`apiFetch<T>` throwing on failure).

**Exemption from the failing-test-first rule:** demonstrates a real UI gap directly, per this project's Interlude convention.

---

## Concept Unit: The Three States Every Fetch Actually Has

### Demonstrate the gap

Open F10's `FeedPage` and temporarily stop the backend server, then load `/feed` in the browser.

*What happens:* the page renders an empty `<div>` — no error, no loading indicator, nothing. `getFeed()`'s Promise rejected (F2's `apiFetch` throws on a failed `fetch`), and nothing in `FeedPage` ever catches it — the rejection is simply unhandled, and `posts` stays at its initial `useState([])` value forever, indistinguishable from "there are genuinely zero posts."

*What this proves:* every fetch, without exception, has three possible states — **loading** (in flight, not yet resolved), **error** (rejected), and **success** (resolved with real data) — and a UI that only ever renders the success case is silently, invisibly wrong in the other two, exactly the same "no crash, no error, just wrong" category as backend Lesson 19's missing `LEFT JOIN` and Interlude F's stale closure.

### The fix

```tsx
// src/pages/FeedPage.tsx — all three states handled explicitly
import { useState, useEffect } from "react";
import { getFeed } from "../../api/posts";
import FeedPostItem from "../FeedPostItem";
import type { FeedPost } from "../../types/api";

function FeedPage() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getFeed()
            .then(setPosts)
            .catch((err) => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading feed...</p>;
    if (error) return <p className="text-red-500">Failed to load feed: {error}</p>;
    if (posts.length === 0) return <p>No posts yet.</p>;

    return (
        <div className="flex flex-col gap-3 max-w-lg mx-auto p-4">
            {posts.map((post) => (
                <FeedPostItem key={post.id} post={post} />
            ))}
        </div>
    );
}

export default FeedPage;
```

### Mechanical walkthrough

1. `.finally(() => setLoading(false))`: (first appearance of `.finally()` on a Promise chain). Runs regardless of whether `.then()` or `.catch()` fired — the correct place to turn off a loading indicator, since it needs to happen on *either* outcome, not duplicated in both branches separately.
2. Four distinct return branches — `loading`, `error`, empty, and real data: (worth counting explicitly). This is actually a **fourth** state beyond the three named above: "succeeded, but with zero results" is meaningfully different from both "still loading" and "genuinely broke," and deserves its own explicit message rather than silently falling through to an empty `<div>`.

### CS Lens

**A fetch's lifecycle is itself a small state machine — pending, fulfilled, rejected (Interlude E's exact Promise states), now reflected explicitly in UI rather than left implicit.** Handling only the success case is equivalent to writing a `switch` statement with only one `case` and no `default` — technically valid, silently incomplete.

### SE Lens

**This is a design problem as much as a code problem — each state needs an intentional visual treatment, not just a code branch that happens to exist.** A generic browser-default error, an indefinite blank screen during loading, and an unstyled "no posts" message are all *technically* handling their state while still producing a genuinely bad experience — the code-level fix (three branches) is necessary but not sufficient; each branch deserves the same design attention F9's `shadcn` components already bring to the success case.

---

## Closing

**Connect the pieces**
Every fetch has (at minimum) three states — loading, error, success — plus, often, a meaningful fourth: success with no data. `FeedPage` now handles all of them explicitly, using `.finally()` to guarantee the loading indicator clears regardless of outcome, closing exactly the silent gap the backend-stopped demonstration exposed.

**What breaks without this**
An unhandled fetch failure produces a UI that looks broken with no indication why — the worst possible failure mode, since a user has no way to tell "this is temporarily loading," "something genuinely went wrong, maybe retry," and "this is correctly empty" apart from each other.

**Exercises**
1. Add a retry button to the error state, calling the same fetch logic again.
2. Apply this identical three(-plus-one)-state pattern to `MemberList` (F3), which currently only handles the success case, exactly like `FeedPage` did before this lesson.

**Definition of Done**
* [x] `FeedPage` explicitly handles loading, error, empty, and success states.
* [x] Directly observed the silent-failure gap by stopping the backend, before fixing it.
* [x] Commit: `fix: handle all fetch states explicitly in FeedPage, not just success`

---

## Context Snapshot (End of Interlude G)

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Fetch lifecycle states (loading/error/success/empty) | Interlude G | Every fetch has at least these outcomes; only handling success is silently incomplete |
| `.finally()` | Interlude G | Runs regardless of a Promise chain's outcome — correct place for cleanup like clearing a loading flag |

**Lesson Completion State:**
- Completed: F1-F12, Interludes E, F, G
- Next: F13 — Client-Side Caching (TanStack Query)
