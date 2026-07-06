# Frontend Client — Lesson 11 — Search and Tags

## What You Will Build

A search box above the article list filters articles by tag as you type, without a
button to click. Typing quickly does not spam the server with a request per
keystroke, and — the subtle bug this lesson exists to prevent — a slow response for
something you stopped searching for two keystrokes ago can never overwrite the
result of what you are searching for now.

---

## What You Need to Know First

Lesson 10 left `renderArticleListPage` in `src/main.ts` fetching every article with
no filter and appending each one via `createArticleElement`. `fetchArticles()` in
`src/api.ts` takes no parameters.

---

## Step 1 — Let `fetchArticles` Filter by Tag

**The problem:** Conduit's article-list endpoint already supports a `tag` query
parameter — `GET /api/articles?tag=javascript` returns only articles carrying that
tag. `fetchArticles()` has never used it.

Update `src/api.ts`:

```typescript
export async function fetchArticles(tag?: string): Promise<Article[]> {
  const params = new URLSearchParams({ limit: "5" });
  if (tag) {
    params.set("tag", tag);
  }

  const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: ArticlesResponse = await response.json();
  return data.articles;
}
```

**Walkthrough:** `tag?: string` marks the parameter **optional** — a caller may omit
it entirely, in which case it is `undefined` inside the function. `URLSearchParams`
is a browser API for building a query string safely: `new URLSearchParams({ limit:
"5" })` creates an object representing `limit=5`; `params.set("tag", tag)` adds or
replaces the `tag` key; `params.toString()` produces the final query string. Building
this by hand with string concatenation (`` `?limit=5&tag=${tag}` ``) would break the
moment `tag` contained a character with special meaning in a URL, like `&` or a
space — `URLSearchParams` automatically **percent-encodes** any such characters,
converting them into a safe representation the server can decode correctly. This is
the same class of problem `encodeURIComponent`, mentioned in lesson 06, solves for a
single value; `URLSearchParams` solves it for a whole set of parameters at once.

`if (tag) { params.set("tag", tag); }` only adds the `tag` parameter when one was
actually provided — calling `fetchArticles()` with no argument still fetches every
article, exactly as before this lesson.

---

## Step 2 — Build a Debounced Search Box

**The problem:** Firing a network request on every single keystroke wastes
bandwidth and floods the server with requests for text a user is still in the middle
of typing.

Create `src/components/SearchBox.ts`:

```typescript
const DEBOUNCE_DELAY_MS = 300;

export function createSearchBox(onSearch: (tag: string) => void): HTMLElement {
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Filter by tag…";

  let debounceTimer: number | undefined;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onSearch(input.value.trim());
    }, DEBOUNCE_DELAY_MS);
  });

  return input;
}
```

**Walkthrough:** `input.type = "search"` is a specialised text input — most browsers
give it a small "clear" icon once it has content, at no extra cost. The `input`
event fires on every change to the field's value, including every single keystroke —
different from the `change` event, which only fires once the field loses focus. Live
filtering needs `input`; a field that only matters once you are done editing it (like
tabbing away) would use `change`.

`setTimeout(callback, delayMs)` is a browser API that schedules `callback` to run
once, after at least `delayMs` milliseconds have passed — it does not pause anything
in the meantime; the rest of the program keeps running. It returns a numeric handle
identifying that specific scheduled call. `clearTimeout(handle)` cancels a
previously scheduled call, if it has not fired yet — calling it with `undefined`
(the very first keystroke, before `debounceTimer` has ever been set) is harmless and
does nothing.

**CS lens — debouncing.** Every keystroke here does two things: cancel whatever
timer the *previous* keystroke started, and start a brand new one. As long as
keystrokes keep arriving faster than `DEBOUNCE_DELAY_MS`, every timer gets cancelled
before it fires — `onSearch` is never called while typing is still ongoing. Only once
300 milliseconds pass with no new keystroke does a timer finally survive long enough
to run. This pattern — **debouncing** — is the standard fix for "this event fires far
more often than the resulting action should actually run," used identically for
window-resize handlers, autosave, and exactly this kind of live search, in
production code everywhere.

---

## Step 3 — Guard Against Out-of-Order Responses

**The problem:** Even with debouncing, two searches can still overlap: type
`"javascript"`, pause long enough to fire a request, then quickly change it to
`"java"` before the first response has returned. If the network happens to deliver
the *second* request's response before the *first* one's — a real possibility, since
network timing is never guaranteed to preserve request order — the stale
`"javascript"` results could arrive last and silently overwrite the correct `"java"`
results already on screen. This is a **race condition**: the correct outcome depends
on timing that is not actually guaranteed.

Update `src/main.ts`:

```typescript
import { createSearchBox } from "./components/SearchBox.ts";

let latestRequestId = 0;

async function renderArticleResults(resultsElement: HTMLElement, tag: string): Promise<void> {
  const requestId = ++latestRequestId;
  resultsElement.textContent = "Loading…";

  try {
    const articles = await fetchArticles(tag || undefined);

    if (requestId !== latestRequestId) {
      return;
    }

    resultsElement.textContent = "";
    for (const article of articles) {
      resultsElement.appendChild(createArticleElement(article));
    }
  } catch (error) {
    if (requestId !== latestRequestId) return;
    console.error("Could not load articles:", error);
    resultsElement.textContent = "Something went wrong loading articles.";
  }
}

async function renderArticleListPage(appElement: HTMLElement): Promise<void> {
  appElement.textContent = "";

  const resultsElement = document.createElement("div");
  const searchBox = createSearchBox((tag) => {
    renderArticleResults(resultsElement, tag);
  });

  appElement.appendChild(searchBox);
  appElement.appendChild(resultsElement);

  await renderArticleResults(resultsElement, "");
}
```

Save and reload. Type a tag like `javascript` and pause — the list filters after a
brief moment, not on every keystroke.

**Walkthrough:** `let latestRequestId = 0;` lives at module scope, outside any
function, so its value persists across every call to `renderArticleResults` — it is
this project's first genuinely **shared mutable state** at the module level, rather
than state local to one function call or one component instance.

`const requestId = ++latestRequestId;` — `++latestRequestId` is the **prefix
increment operator**: it increases `latestRequestId` by one *and* evaluates to the
new value, in one step. Every call to `renderArticleResults` claims its own unique,
ever-increasing number the moment it starts, and remembers it locally as `requestId`.

When the `await fetchArticles(...)` finally resolves, `if (requestId !==
latestRequestId)` checks whether some *other*, later call has started in the
meantime, bumping the shared counter past this call's own number. If so, this
response is stale — a newer search has already superseded it — and the function
returns immediately, leaving whatever the newer call has already rendered (or is
about to render) untouched. Only the response belonging to the *most recently
started* request is ever allowed to update the page.

**Why this could not be solved by "just show the most recent response received"
instead:** Responses can arrive in a different order than requests were sent — that
is exactly what a race condition is. Tracking *when each request started* (via the
counter) rather than *when each response arrived* is what makes this reliable
regardless of network timing; comparing arrival order alone would not fix anything,
since arrival order is the very thing that is unpredictable.

`fetchArticles(tag || undefined)` passes `undefined` — meaning "no filter" — when
`tag` is an empty string (searching, then clearing the box). `"" || undefined`
evaluates to `undefined` because an empty string is one of JavaScript's **falsy**
values (values that behave as `false` in a boolean context) — `||` returns its
right-hand side whenever its left-hand side is falsy.

---

## Connect the Pieces

```
src/api.ts                      fetchArticles(tag?) — an optional parameter, backward compatible
src/components/SearchBox.ts     A debounced input; knows nothing about articles or fetching
src/main.ts                     latestRequestId guards every render against stale, out-of-order responses
```

`createSearchBox` never calls `fetchArticles` itself — it only calls the `onSearch`
callback it was given, exactly like `AuthForm` and `NewArticleForm` before it. The
component stays reusable for filtering anything by a text query; `main.ts` is the
only place that knows the query happens to be an article tag.

---

## What Breaks Without This

**Without debouncing:** Typing `"javascript"` (10 characters) fires up to 10 separate
requests, most of them for search terms the user never actually intended to search
for and abandoned within the same second — real, wasted load on a server this
project does not control.

**Without the `requestId` guard:** Search for `"javascript"`, then immediately clear
the box and search for `"java"`. If the network happens to deliver the `"javascript"`
response after the `"java"` response — entirely possible, since both requests are in
flight independently — the page ends up showing `"javascript"` results while the
search box still reads `"java"`, a confusing, silent mismatch between what the user
asked for and what they are looking at, with no error anywhere to explain it.

---

## Definition of Done

- [ ] Typing in the search box filters the article list by tag after a brief pause, not on every keystroke
- [ ] Clearing the search box returns to the full, unfiltered article list
- [ ] Rapidly changing the search term never results in a mismatched, stale result being shown
- [ ] You can explain what debouncing is and why `clearTimeout` is called on every keystroke, not just the last one
- [ ] You can explain what a race condition is, using this lesson's two-searches-in-flight scenario as the example
- [ ] You can explain why comparing "did a newer request start" is more reliable than comparing "which response arrived last"
- [ ] You can explain what `URLSearchParams` does and what problem it solves compared to building a query string by hand
- [ ] Run:
      ```
      git add src/api.ts src/components/SearchBox.ts src/main.ts
      git commit -m "Add debounced tag search with protection against out-of-order responses"
      ```

---

*Next: Lesson 12 — Pagination. A "Load More" button appends the next page of
articles beneath the current ones, using the same `limit`/`offset` query parameters
introduced conceptually back in lesson 03 — this time put to their actual use.*
