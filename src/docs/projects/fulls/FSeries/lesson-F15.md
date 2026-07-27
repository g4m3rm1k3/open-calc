# Lesson F15: Mocking the API (MSW)

**What you will build**
A real test for `FeedPage` — which fetches data, unlike F14's `MemberItem` — using Mock Service Worker (MSW) to intercept the network call rather than hitting a real backend. The problem we're solving: F14's test worked because `MemberItem` never fetches anything itself; `FeedPage` does, and testing it needs to answer backend Lesson 18's exact question — real dependency, or a fake standing in for it — on the frontend side.

**What you need to know first**
F14 (`render`, `screen`). Backend Lesson 18 (`MagicMock`, unit vs. integration testing — directly mirrored here).

---

## Concept Unit: Intercepting Network Requests

### The Problem

Testing `FeedPage` by letting it call the real backend would mean tests depend on a running server, real seeded data, and network conditions — exactly the fragility backend Lesson 18's fixtures eliminated for the API's own test suite. We need `getFeed()`'s underlying `fetch` call intercepted and given a fake, controlled response instead.

### Introduce the concept in isolation

```bash
npm install -D msw
```

Create `frontend/src/lab/msw_demo.test.tsx`:

```tsx
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { beforeAll, afterEach, afterAll, test, expect } from "vitest";

const server = setupServer(
    http.get("http://localhost:8000/members", () => {
        return HttpResponse.json([{ id: 1, username: "fake-ada" }]);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("fetch is intercepted by MSW", async () => {
    const response = await fetch("http://localhost:8000/members");
    const data = await response.json();
    expect(data[0].username).toBe("fake-ada");
});
```

Run it:

```bash
npx vitest run
```

Output:

```text
✓ src/lab/msw_demo.test.tsx (1)
  ✓ fetch is intercepted by MSW

Test Files  1 passed (1)
```

*What this proves:* the real `fetch` call ran, and got back `"fake-ada"` — a value that exists nowhere in any real backend, only in the `http.get(...)` handler defined above. No actual network request left the test process; MSW intercepted it at the network layer itself, transparently to `fetch`'s own calling code.

### Explain the mechanism

MSW registers **handlers** — functions describing "when a request matching this URL/method arrives, respond with this" — and intercepts real network calls before they leave the process, returning the handler's fake response instead. This is meaningfully different from replacing `fetch` itself with a fake function (which F15's alternative, less realistic approach might have been) — the code under test calls the *real* `fetch`, completely unaware it's being intercepted, which means `apiFetch<T>`'s own logic (response.ok checks, error parsing, from F2) is genuinely exercised, not bypassed.

### Discard the throwaway example

Delete `frontend/src/lab/msw_demo.test.tsx`. Test `FeedPage` for real.

### Project Change

* **Files affected:** Create `src/pages/FeedPage.test.tsx`, `src/test/mswServer.ts`.
* **Change type:** Add.

### The New Code

```typescript
// src/test/mswServer.ts
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer(
    http.get("http://localhost:8000/feed", () => {
        return HttpResponse.json([
            { id: 1, content: "test post", username: "ada", created_at: "2026-01-01T00:00:00" },
        ]);
    })
);
```

```tsx
// src/pages/FeedPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeAll, afterEach, afterAll, test, expect } from "vitest";
import { server } from "../test/mswServer";
import FeedPage from "./FeedPage";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("renders posts fetched from the (mocked) backend", async () => {
    const queryClient = new QueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <FeedPage />
        </QueryClientProvider>
    );

    expect(screen.getByText("Loading feed...")).toBeDefined();
    await waitFor(() => expect(screen.getByText("test post")).toBeDefined());
});
```

### Mechanical walkthrough

1. `<QueryClientProvider client={queryClient}>` wrapping `<FeedPage />` in the test: (already-established F13 requirement, now needed inside a test too). `FeedPage` uses `useQuery`, which requires a `QueryClientProvider` ancestor to function at all — omitting it here would crash the test immediately, the same requirement as the real app.
2. `waitFor(() => expect(...).toBeDefined())`: (first appearance). Since fetching is genuinely asynchronous (Interlude E), the test can't assert on the fetched content immediately after `render` — `waitFor` retries the assertion until it passes or times out, correctly handling the real async gap between "component mounted" and "data arrived."
3. `expect(screen.getByText("Loading feed..."))` asserted *before* `waitFor`: (direct callback to Interlude G). This single test now verifies both states Interlude G insisted on handling explicitly — loading, then success — not just the final result.

### CS Lens

**MSW's request-interception is the frontend structural equivalent of backend Lesson 18's `dependency_overrides` — both replace a real dependency with a controlled fake at the exact boundary the code under test actually uses, rather than mocking at a boundary the code doesn't itself call through.** Backend Lesson 18 intercepted at `Depends(get_connection)`; here it's intercepted at the network layer `fetch` itself uses — in both cases, the code under test is unaware anything was substituted.

### SE Lens

**This closes the unit-vs-integration distinction on the frontend side, completing the parallel backend Lesson 18 established.** F14's `MemberItem` test was a true unit test — no network involved at all. This `FeedPage` test is closer to an integration test — real component tree, real `useQuery`, real `apiFetch`, only the actual network boundary faked — deliberately, since `FeedPage`'s entire job *is* orchestrating that fetch correctly, which a fully-mocked-away version of the test couldn't actually verify.

### Commands needed

```bash
npx vitest run
```

### Run it. Show the real output.

```text
✓ src/pages/FeedPage.test.tsx (1)
  ✓ renders posts fetched from the (mocked) backend

Test Files  1 passed (1)
```

---

## Closing

**Connect the pieces**
MSW intercepts real `fetch` calls at the network layer, letting `apiFetch<T>`'s own logic run genuinely, unmocked, against a fake but realistic response. `FeedPage`'s test verifies both the loading state (Interlude G) and the eventual real content, using `waitFor` to correctly handle the genuine async gap between the two — Phase F6 complete, with both the pure-component (F14) and network-involving (F15) testing strategies established, directly mirroring backend Lesson 18's unit/integration split.

**What breaks without this**
Without MSW, `FeedPage`'s test would either need a real running backend (fragile, slow, exactly what backend Lesson 18's fixtures eliminated) or would need `getFeed` itself mocked away entirely — which would prevent the test from ever catching a real bug in `apiFetch`'s own error-handling logic, since that code would never actually run.

**Exercises**
1. Add a second MSW handler simulating a `500` error for `/feed`, and write a test confirming `FeedPage` renders its error state (Interlude G) correctly.
2. Write a similar mocked test for `CreatePostForm` (F11), intercepting `POST /posts` and confirming the form clears after a successful, mocked submission.

**Definition of Done**
* [x] MSW installed and configured, intercepting real `fetch` calls in tests.
* [x] `FeedPage` tested through both its loading and success states against mocked network data.
* [x] Can explain, without notes, why this test exercises `apiFetch`'s real logic, unlike a test that mocked `getFeed` itself away entirely.
* [x] Commit: `test: mock network layer with MSW for FeedPage integration test`

---

## Context Snapshot (End of Lesson F15)

**Frontend File Tree:** adds `src/test/mswServer.ts`, `src/pages/FeedPage.test.tsx`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| MSW (Mock Service Worker) | F15 | Intercepts real network calls, returning fake responses transparently |
| Handler (MSW) | F15 | Defines the fake response for a matching request URL/method |
| `waitFor` | F15 | Retries an assertion until it passes or times out, for genuinely async outcomes |

**Lesson Completion State:**
- Completed: F1-F15, Interludes E, F, G — **Phase F6 complete**
- Next: F16 — Optimistic UI Updates

**Maps to backend:** direct structural parallel to backend Lesson 18's `dependency_overrides`/`MagicMock` split — same unit-vs-integration testing philosophy, applied at the network boundary instead of the database boundary.
