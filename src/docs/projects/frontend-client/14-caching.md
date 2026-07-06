# Frontend Client — Lesson 14 — Caching

## What You Will Build

Opening an article you have already viewed shows it instantly, with no network
request at all — visible in the Network tab as an article detail request that simply
does not happen the second time. The harder half of this lesson is not building the
cache; it is deciding exactly when a cached value can no longer be trusted, and
proving that decision with a real, visible bug you create and then fix.

---

## What You Need to Know First

Lesson 13 introduced `src/services/`, containing `NotificationService.ts`. Lesson 06
built `fetchArticleBySlug(slug)` in `src/api.ts`, called every time
`renderArticleDetailPage` runs.

---

## Concept: Why Caching Is Never "Just" Storing a Value

There is a well-known engineering joke, worth knowing because it is not really a
joke: "There are only two hard things in computer science: cache invalidation and
naming things." Storing a value the first time it is fetched, so a second request
for it can skip the network, is the easy half — five lines of code. The hard half is
knowing when a stored value has become **stale**: no longer an accurate reflection
of the real, current state of the world. A cache with no answer to that question is
not a performance optimisation; it is a bug that shows old data as if it were new.

---

## Step 1 — Build the Article Cache

**The problem:** Every visit to an article's detail page refetches everything, even
seconds after the same article was already fully loaded.

Create `src/services/ArticleCache.ts`:

```typescript
import type { ArticleDetail } from "../api.ts";

interface CacheEntry {
  article: ArticleDetail;
  cachedAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

export function getCachedArticle(slug: string): ArticleDetail | null {
  const entry = cache.get(slug);
  if (!entry) {
    return null;
  }

  const age = Date.now() - entry.cachedAt;
  if (age > CACHE_TTL_MS) {
    cache.delete(slug);
    return null;
  }

  return entry.article;
}

export function setCachedArticle(slug: string, article: ArticleDetail): void {
  cache.set(slug, { article, cachedAt: Date.now() });
}

export function invalidateArticle(slug: string): void {
  cache.delete(slug);
}
```

**Walkthrough:** `new Map<string, CacheEntry>()` creates a **`Map`** — a built-in
data structure pairing keys to values, distinct from a plain `{}` object in a way
that matters here: a `Map`'s keys are never coerced or confused with anything else,
while a plain object secretly inherits properties like `toString` and `constructor`
from its prototype. If this cache used a plain object and an article's slug
happened to be `"constructor"` — an entirely plausible slug, generated automatically
from a title like "Constructor Pattern in JavaScript" — `cache["constructor"]` would
return `Object`'s built-in constructor function, not `undefined`, silently
corrupting a lookup with no error at any point. `Map` has no such inherited
properties to collide with; `cache.get("constructor")` correctly returns `undefined`
if nothing was ever stored under that exact key.

`CACHE_TTL_MS` stands for **time to live**, in milliseconds: how long a cached value
is trusted before it is treated as stale automatically, without needing anything to
explicitly invalidate it. `Date.now()` returns the current time as the number of
milliseconds elapsed since a fixed reference point (00:00:00 UTC on 1 January 1970).
Subtracting the time a value was cached from the current time gives its **age**;
comparing that age against the TTL is how `getCachedArticle` decides, on every call,
whether the stored value is still good enough to use, deleting it and returning
`null` the moment it is not.

`invalidateArticle(slug)` removes one specific entry immediately, regardless of its
age — for the case where something is *known* to have changed, rather than merely
*possibly* stale after enough time has passed. Step 3 uses this.

---

## Step 2 — Use the Cache

**The problem:** `renderArticleDetailPage` needs to check the cache first, and only
fall back to a real fetch on a miss.

Update `src/main.ts`:

```typescript
import { getCachedArticle, setCachedArticle } from "./services/ArticleCache.ts";

async function loadArticle(slug: string): Promise<ArticleDetail> {
  const cached = getCachedArticle(slug);
  if (cached) {
    return cached;
  }

  const article = await fetchArticleBySlug(slug);
  setCachedArticle(slug, article);
  return article;
}

async function renderArticleDetailPage(appElement: HTMLElement, slug: string): Promise<void> {
  try {
    const [article, comments] = await Promise.all([
      loadArticle(slug),
      fetchCommentsBySlug(slug),
    ]);

    // ... rendering unchanged from lesson 07, plus one new line:
    const favoritesElement = document.createElement("p");
    favoritesElement.textContent = `♥ ${article.favoritesCount}`;

    // append favoritesElement alongside the title, body, and comments heading
  } catch (error) {
    console.error("Could not load article:", error);
    appElement.textContent = "Something went wrong loading this article.";
  }
}
```

Save and reload. Open an article, go back, open it again: the Network tab shows no
second request to `/articles/:slug` — only the first visit ever reached the network.
Comments still refetch every time; this cache deliberately covers only article
details, not comments.

**Walkthrough:** `loadArticle` is declared `async`, so even its `return cached;`
branch — which runs entirely synchronously, with no `await` inside it at all — is
automatically wrapped in an already-resolved `Promise`, because every `async`
function always returns a `Promise`, whether or not it ever actually awaits
anything. This is why `Promise.all([loadArticle(slug), fetchCommentsBySlug(slug)])`
still works identically whether the article comes from cache or from a real network
round trip: both branches produce a `Promise<ArticleDetail>`, and `Promise.all` does
not know or care how quickly either one resolves.

**SE lens — why comments are not cached here.** Comments are more likely to change
between visits (someone else could comment while you are away) and this project
already fetches them concurrently with negligible added cost via `Promise.all`. The
article's own body and title, by contrast, change far less often once published, and
their content — the bulk of the payload — is what actually makes skipping the
network worthwhile. Caching everything indiscriminately is not automatically better;
what to cache is a real decision, made per piece of data based on how often it
changes and how expensive it is to refetch.

---

## Step 3 — Prove Staleness, Then Fix It

**The problem:** Right now, favoriting an article from the list, then opening its
cached detail view, shows the *old* favorites count — a real, visible bug this
cache just introduced.

**See the bug first.** Open an article's detail view (caching it, along with its
current favorites count). Go back to the list. Favorite that same article — its
count increases on the list. Click into its detail view again: the count shown is
the *stale*, cached one from before you favorited it, because the cache has no idea
anything changed.

**Fix it** by invalidating the cached entry the moment a favorite actually changes
it. Update `handleFavoriteClick` in `src/components/ArticleCard.ts`:

```typescript
import { invalidateArticle } from "../services/ArticleCache.ts";

async function handleFavoriteClick(article: Article, button: HTMLButtonElement): Promise<void> {
  try {
    const updated = await toggleFavorite(article.slug, article.favorited);
    article.favorited = updated.favorited;
    article.favoritesCount = updated.favoritesCount;
    button.textContent = `♥ ${updated.favoritesCount}`;
    invalidateArticle(article.slug);
    notify("Article favorited.");
  } catch (error) {
    console.error("Could not toggle favorite:", error);
    button.textContent = "Log in to like articles";
    notify("You must be logged in to like articles.", "error");
  }
}
```

Reload, repeat the same steps: favorite an article from the list, open its detail
view. The correct, current count shows immediately — `loadArticle` finds no cache
entry (it was just deleted), fetches fresh, and re-caches the now-accurate result.

**Walkthrough:** `invalidateArticle(article.slug)` runs immediately after a
successful favorite toggle — the exact moment this project knows, with certainty,
that the cached copy of this specific article is now wrong. This is **targeted
invalidation**: removing exactly the one entry known to be affected, rather than
clearing the entire cache (which would also discard perfectly valid data for every
other article) or doing nothing (which is the bug just demonstrated).

---

## Connect the Pieces

```
src/services/ArticleCache.ts      get/set/invalidate, backed by a Map, with a TTL
src/main.ts                       loadArticle() checks cache before fetching
src/components/ArticleCard.ts     Invalidates the one entry a favorite toggle actually changes
```

`ArticleCache.ts` sits alongside `NotificationService.ts` in `src/services/` — two
modules with real internal state, callable from anywhere, neither one a component.

---

## What Breaks Without This

**Without a TTL (caching forever, with no expiry at all):** An article edited by its
author on the server (a feature this project has not built, but Conduit's API
supports) would show its old, unedited content indefinitely to anyone who had
visited it even once before the edit — with no path back to fresh data short of
reloading the whole page, since this project's cache never expires anything on its
own.

**Without Step 3's `invalidateArticle` call:** The favorites-count bug demonstrated
above is exactly what ships — a cache that is measurably faster and measurably
wrong at the same time, which is worse than no cache at all, because a wrong,
confident answer is harder to notice and debug than a slow, correct one.

---

## Definition of Done

- [ ] Revisiting an already-viewed article shows it with no new network request in the Network tab
- [ ] Favoriting an article from the list, then opening its detail view, shows the correct, current favorites count — not a stale one
- [ ] Comments still refetch on every visit to a detail view
- [ ] You can explain what makes a cached value "stale" and how this cache decides
- [ ] You can explain what a TTL is and why 60 seconds is a choice, not the only correct answer
- [ ] You can explain why `Map` was chosen over a plain object here, using the `"constructor"` slug scenario
- [ ] You can reproduce the favorites-count bug on purpose (by temporarily removing `invalidateArticle`) and explain exactly why it happens
- [ ] Run:
      ```
      git add src/services/ArticleCache.ts src/main.ts src/components/ArticleCard.ts
      git commit -m "Cache article details with a TTL; invalidate on favorite to prevent showing stale counts"
      ```

---

*Next: Lesson 15 — Performance and Deployment. The project is built for production,
measured, and published to a real public URL — the last lesson, and the first time
this project is something you can send a link to.*
