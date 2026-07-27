# Lesson F10: Building the Feed UI

**What you will build**
A real feed page — `GET /feed` rendered as a scrollable list of styled post cards, each showing an avatar, author, content, and timestamp. The problem we're solving: everything built so far renders one thing (a member list). This is the first lesson combining routing (F6), data fetching (F2/F3), composition (F4), and the design system (F9) into one real, multi-part screen.

**What you need to know first**
F9 (`shadcn/ui`, Tailwind). F6 (`FeedPage` route already scaffolded). F4 (composition).

---

## Concept Unit: Layout Composition With Flexbox Utilities

### The Problem

A post needs an avatar and its content sitting *beside* each other, not stacked — nothing built so far has arranged two pieces of content horizontally with controlled spacing between them.

### Introduce the concept in isolation

```tsx
function FlexDemo() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <span>Beside the circle</span>
        </div>
    );
}
```

Render it — a gray circle and text sit side by side, vertically centered, with consistent gap between them.

*What this proves:* `flex` switches the container's layout model from the default (stacked, block-by-block) to horizontal arrangement; `items-center` vertically aligns children within that row; `gap-3` inserts consistent spacing between them — from Tailwind's same constrained scale as F9's `p-4`, not a hand-picked margin value.

### Explain the mechanism

**Flexbox** is CSS's layout model for arranging items in a single row or column, with built-in alignment and spacing control — Tailwind's `flex`/`items-*`/`gap-*` utilities are a direct, constrained interface onto it, following the identical "utility classes over hand-written CSS" idea from F9, now applied to layout instead of spacing/color.

### Discard the throwaway example

Delete it. Build the real feed post layout.

### Project Change

* **Files affected:** Create `src/FeedPostItem.tsx`, `api/posts.ts`, `src/pages/FeedPage.tsx` (real implementation, replacing F6's placeholder).
* **Change type:** Add + Modify.

### The New Code

```typescript
// api/posts.ts
import type { FeedPost } from "../types/api";
import { apiFetch } from "./client";

export function getFeed(limit = 20): Promise<FeedPost[]> {
    return apiFetch<FeedPost[]>(`/feed?limit=${limit}`);
}
```

```tsx
// src/FeedPostItem.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { FeedPost } from "../types/api";

function FeedPostItem({ post }: { post: FeedPost }) {
    return (
        <Card>
            <CardContent className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                    {post.username[0].toUpperCase()}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{post.username}</span>
                        <span className="text-gray-400 text-sm">{post.created_at}</span>
                    </div>
                    <p>{post.content}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default FeedPostItem;
```

```tsx
// src/pages/FeedPage.tsx
import { useState, useEffect } from "react";
import { getFeed } from "../../api/posts";
import FeedPostItem from "../FeedPostItem";
import type { FeedPost } from "../../types/api";

function FeedPage() {
    const [posts, setPosts] = useState<FeedPost[]>([]);

    useEffect(() => {
        getFeed().then(setPosts);
    }, []);

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

1. `post.username[0].toUpperCase()`: (already-established string indexing, real usage). A minimal placeholder avatar — the first letter of the username, in a colored circle, instead of a real image the backend doesn't provide.
2. `flex flex-col gap-1` nested inside `flex gap-3`: (already-established flex utilities, nested — a row containing a column). The outer row places the avatar beside the text block; the inner column stacks the author/timestamp line above the content itself.
3. `max-w-lg mx-auto`: (first appearance). Constrains the feed's width and centers it — a real, deliberate layout decision (a feed reads better at a bounded width than stretched full-screen), not left to accident.

### CS Lens

**This lesson is entirely composition (F4) applied at a larger scale — no new conceptual mechanism, only more pieces assembled together.** `FeedPage` composes `FeedPostItem`, which composes `shadcn`'s `Card`, which internally composes plain styled `div`s — the exact same nesting idea from F4's `Card`/`children` example, now three layers deep in a real screen.

### SE Lens

**A single-letter avatar is a deliberate, honest placeholder, not a cut corner left unexplained.** The backend has no avatar/image field anywhere in its schema — inventing a fake image URL would imply a capability that doesn't exist. Building an honest placeholder, and naming it as one, is preferable to a UI that silently implies more than the system actually supports.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

Navigating to `/feed` shows real posts from the backend, each as a styled card with an avatar circle, author, relative-looking timestamp (still the backend's raw ISO string for now), and content — visually coherent, built entirely from F1-F9's accumulated pieces.

---

## Closing

**Connect the pieces**
`getFeed()` (F2's pattern) fetches real data; `FeedPage` owns it via `useState`/`useEffect` (F3); `FeedPostItem` composes `shadcn`'s `Card` (F9) with Flexbox utilities arranging an avatar and content side by side — the first screen built from every prior lesson's pieces working together.

**What breaks without this**
Without Flexbox utilities, arranging an avatar beside text would require either default block-stacking (avatar above content, not beside it) or hand-written CSS `display: flex` rules duplicated per component — exactly the ad-hoc styling drift F9 exists to prevent.

**Exercises**
1. Format `created_at` into a more readable relative time ("2 minutes ago") using a small utility function, rather than the raw ISO string.
2. Make each `FeedPostItem` a `Link` (F6) to `/posts/:id`, in preparation for a real post detail page.

**Definition of Done**
* [x] `/feed` renders real backend data as styled, composed cards.
* [x] Avatar/content arranged with Flexbox utilities, not default block stacking.
* [x] Commit: `feat: real feed UI composing FeedPostItem cards with Flexbox layout`

---

## Context Snapshot (End of Lesson F10)

**Frontend File Tree:** adds `src/FeedPostItem.tsx`, `api/posts.ts`; implements `src/pages/FeedPage.tsx` for real

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Flexbox / `flex`, `items-*`, `gap-*` | F10 | CSS layout model for row/column arrangement with built-in alignment/spacing |

**Lesson Completion State:**
- Completed: F1-F10, Interludes E, F
- Next: F11 — Forms Done Well

**Maps to backend:** `getFeed()` consumes backend Lesson 5's `GET /feed?limit=` directly, first real UI built on a paginated endpoint.
