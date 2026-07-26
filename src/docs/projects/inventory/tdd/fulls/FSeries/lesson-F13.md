# Lesson F13: Client-Side Caching (TanStack Query)

**What you will build**
`FeedPage` rewritten on `TanStack Query`, replacing its hand-written `useState`/`useEffect`/loading/error pattern (F3, Interlude G) with a library purpose-built for exactly that pattern — plus real caching, avoiding refetching the same data unnecessarily. The problem we're solving: this is a direct, deliberate mirror of backend Lesson 23's `/trending` cache — recognizing that connection is the actual point of this lesson, more than the new syntax itself.

**What you need to know first**
Backend Lesson 23 (cache, TTL, staleness — the concepts this lesson reimplements client-side). Interlude G (the loading/error/success pattern this lesson centralizes).

---

## Concept Unit: `useQuery`

### The Problem

Every component fetching data (`MemberList`, `FeedPage`) has independently reimplemented the same shape: a loading flag, an error state, a data state, a `useEffect` calling the fetch once. Worse, navigating away from `/feed` and back currently refetches from scratch every time, even if the data hasn't meaningfully changed — exactly the wasted-recomputation problem backend Lesson 23 solved server-side for `/trending`.

### Introduce the concept in isolation

```bash
npm install @tanstack/react-query
```

Create `frontend/src/lab/QueryDemo.tsx`:

```tsx
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Members() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["members"],
        queryFn: () => fetch("http://localhost:8000/members").then((r) => r.json()),
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {(error as Error).message}</p>;
    return <ul>{data.map((m: any) => <li key={m.id}>{m.username}</li>)}</ul>;
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Members />
        </QueryClientProvider>
    );
}
```

Render it — the member list appears, `isLoading` and `error` already handled with no manual `useState` anywhere.

*What this proves:* `useQuery` returns `data`, `isLoading`, and `error` directly — exactly the three(-plus) states Interlude G taught you to handle explicitly by hand, now managed entirely by the library. `queryKey: ["members"]` names this specific query; calling `useQuery` again anywhere else in the app with the same key reuses the *same* cached result rather than refetching.

### Explain the mechanism

`QueryClientProvider` (using React Context, F8's exact mechanism) makes a shared cache available to any `useQuery` call anywhere in the tree. `queryKey` identifies *what* is being fetched — any two `useQuery` calls with the same key share the same cached data and loading/error state, automatically, with zero coordination code required between the components using them.

### Discard the throwaway example

Delete `frontend/src/lab/QueryDemo.tsx`. Rebuild `FeedPage` on `useQuery`.

### Project Change

* **Files affected:** `src/App.tsx`, `src/pages/FeedPage.tsx`.
* **Change type:** Modify.

### The New Code

```tsx
// src/App.tsx — add the provider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
// wrap existing <AuthProvider><BrowserRouter>...</BrowserRouter></AuthProvider> in <QueryClientProvider client={queryClient}>
```

```tsx
// src/pages/FeedPage.tsx — rebuilt on useQuery
import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../../api/posts";
import FeedPostItem from "../FeedPostItem";

function FeedPage() {
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ["feed"],
        queryFn: () => getFeed(),
        staleTime: 30_000,
    });

    if (isLoading) return <p>Loading feed...</p>;
    if (error) return <p className="text-red-500">Failed to load feed: {(error as Error).message}</p>;
    if (!posts || posts.length === 0) return <p>No posts yet.</p>;

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

1. `staleTime: 30_000`: (first appearance, direct callback). This is, precisely, backend Lesson 23's `TRENDING_CACHE_TTL_SECONDS = 30` — the same concept, the same value even, now client-side: for 30 seconds after a successful fetch, `useQuery` returns the cached result instantly instead of refetching, exactly the space-time tradeoff named in that lesson's CS Lens.
2. `queryFn: () => getFeed()`: (already-established `getFeed` from F10, now supplied to `useQuery` rather than called directly inside a `useEffect`). `TanStack Query` owns *when* to call it — on mount, when stale, when explicitly invalidated — rather than a hand-written dependency array deciding.

### CS Lens

**This is backend Lesson 23's cache, reimplemented client-side, with the identical underlying tradeoff.** `staleTime` is a TTL; a cache hit within that window skips the actual fetch, exactly as `_trending_cache` skipped the actual aggregation query. Recognizing "I already learned this exact shape, in a different layer of the same system" is the actual payoff of having built the backend cache first — the syntax is new, the concept is not.

### SE Lens

**Choosing a library over hand-written state management here is the same tradeoff as F9's `shadcn/ui` choice — a well-solved problem, reused rather than re-derived.** `TanStack Query` also handles cases this lesson doesn't build out explicitly — automatic background refetching, request deduplication when multiple components request the same key simultaneously, retry logic on failure — all "free," the same way `shadcn`'s accessible components came free compared to hand-rolling them.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

Navigating away from `/feed` and back within 30 seconds shows the feed instantly, with no loading flash — directly observable proof the cache is working, the same way backend Lesson 23's `/trending` response time dropped after caching.

---

## Closing

**Connect the pieces**
`useQuery`'s `queryKey` identifies a cached result, shared across any component requesting the same key. `staleTime: 30_000` is the exact same TTL concept as backend Lesson 23's `_trending_cache`, now protecting the client from redundant refetches the same way the backend cache protected it from redundant aggregation queries.

**What breaks without this**
Without any caching, navigating between pages that both display feed data would refetch identically on every single visit, even seconds apart — wasted network requests directly proportional to how often a user navigates, not to how often the underlying data actually changes, the identical waste backend Lesson 23 fixed server-side.

**Exercises**
1. Rebuild `MemberList` (F3) on `useQuery`, retiring its original hand-written `useState`/`useEffect` pattern.
2. Look up `TanStack Query`'s `invalidateQueries` and use it inside `CreatePostForm`'s `onPosted` callback (F11), so creating a new post correctly forces the feed to refetch immediately rather than waiting out `staleTime` — a real cache-invalidation decision, the client-side version of backend Lesson 23's SE Lens about cache invalidation being a genuinely hard problem.

**Definition of Done**
* [x] `FeedPage` rebuilt on `useQuery`, matching Interlude G's state-handling completeness.
* [x] `staleTime` set, directly named as the same concept as backend Lesson 23's TTL.
* [x] Can explain, without notes, why this lesson is "the same concept as Lesson 23, client-side" rather than a new idea.
* [x] Commit: `feat: TanStack Query caching for feed data, mirroring backend cache TTL`

---

## Context Snapshot (End of Lesson F13)

**Frontend File Tree:** modifies `src/App.tsx`, `src/pages/FeedPage.tsx`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `useQuery` | F13 | Manages fetch lifecycle (loading/error/data) and caching in one hook |
| `queryKey` | F13 | Identifies a cached result, shared across any component using the same key |
| `staleTime` | F13 | Client-side TTL — same concept as backend Lesson 23's cache expiration |

**Lesson Completion State:**
- Completed: F1-F13, Interludes E, F, G — **Phase F5 complete**
- Next: F14 — Vitest + React Testing Library

**Maps to backend:** direct conceptual mirror of backend Lesson 23's `/trending` caching — same tradeoff, same TTL value, opposite side of the network.
