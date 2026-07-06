# Frontend Client — Lesson 08 — Likes

## What You Will Build

Every article gets a heart button showing its favorites count. Clicking it calls the
real Conduit API — and gets a real `401 Unauthorized` back, because the server
correctly refuses to record a favorite from a request it cannot attach to any user.
The button then shows "Log in to like articles" instead of crashing or silently
doing nothing.

This lesson does not "finish" likes. It cannot — Conduit will not let an anonymous
request favorite anything, by design, the same way no real social platform lets you
like a post while logged out. The honest, correctly-handled failure you build here is
the actual deliverable, and it is the direct reason lesson 09 exists.

---

## What You Need to Know First

Lesson 07 left `src/components/ArticleCard.ts` exporting `createArticleElement`,
composed from `createAuthorByline` and `createTagList`. `src/api.ts` exports
`fetchArticles`, `fetchArticleBySlug`, `fetchCommentsBySlug`, and the `Article`,
`ArticleDetail`, `Comment`, and `Author` interfaces — every `Article` already
includes `favorited: boolean` and `favoritesCount: number`, unused until now.

---

## Step 1 — Add `toggleFavorite` to `api.ts`

**The problem:** Favoriting and unfavoriting an article are two different HTTP
methods on the same URL — the first genuinely new REST verbs this project has used
beyond `GET`.

Add to `src/api.ts`:

```typescript
interface FavoriteResponse {
  article: Article;
}

export async function toggleFavorite(slug: string, isFavorited: boolean): Promise<Article> {
  const method = isFavorited ? "DELETE" : "POST";

  const response = await fetch(`${API_BASE_URL}/articles/${slug}/favorite`, { method });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: FavoriteResponse = await response.json();
  return data.article;
}
```

**Walkthrough:** Every earlier `fetch` call in this project passed only a URL,
because `fetch`'s method defaults to `GET` when nothing else is specified. `fetch(url,
{ method: "POST" })` passes a second argument — an **options object** — where
`method` explicitly chooses which HTTP verb to send. `POST` is the REST verb for
*creating* something; here, creating a favorite record linking this user to this
article. `DELETE` removes it. `isFavorited ? "DELETE" : "POST"` is a **ternary
expression** — `condition ? valueIfTrue : valueIfFalse` — a compact form of an
if/else that produces a value rather than running a statement; here, it decides
which verb to send based on the article's current state.

**Concept — idempotency.** An operation is **idempotent** if performing it multiple
times has the same effect as performing it exactly once. `GET` is idempotent by
definition: reading data never changes it, no matter how many times you read.
`DELETE` is designed to be idempotent too: deleting something that is already gone is
still "gone" either way. `POST`, in general, is *not* idempotent — calling it twice
can create two separate things. This matters concretely here: if a user double-clicks
a like button before the first request finishes, two `POST` requests could fire
before either response returns, and depending on how the server is built, that could
attempt to create the same favorite twice. This project does not yet guard against
that (a real fix — disabling the button until the request resolves — is a small,
worthwhile addition you can make once lesson 09 makes this button actually work).

---

## Step 2 — Add the Button to `ArticleCard`

**The problem:** Nothing on the page can trigger `toggleFavorite` yet.

Update `src/components/ArticleCard.ts`:

```typescript
import type { Article } from "../api.ts";
import { toggleFavorite } from "../api.ts";
import { createAuthorByline } from "./AuthorByline.ts";
import { createTagList } from "./TagList.ts";

async function handleFavoriteClick(article: Article, button: HTMLButtonElement): Promise<void> {
  try {
    const updated = await toggleFavorite(article.slug, article.favorited);
    article.favorited = updated.favorited;
    article.favoritesCount = updated.favoritesCount;
    button.textContent = `♥ ${updated.favoritesCount}`;
  } catch (error) {
    console.error("Could not toggle favorite:", error);
    button.textContent = "Log in to like articles";
  }
}

export function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleLink = document.createElement("a");
  titleLink.href = `#/articles/${article.slug}`;
  titleLink.textContent = article.title;

  const titleElement = document.createElement("h2");
  titleElement.appendChild(titleLink);

  const favoriteButton = document.createElement("button");
  favoriteButton.textContent = `♥ ${article.favoritesCount}`;
  favoriteButton.addEventListener("click", () => {
    handleFavoriteClick(article, favoriteButton);
  });

  container.appendChild(createAuthorByline(article.author));
  container.appendChild(titleElement);
  container.appendChild(favoriteButton);
  container.appendChild(createTagList(article.tagList));

  return container;
}
```

Save and reload. Every article shows a heart button with a real count. Click one:
after a short pause (a real network round trip), the button changes to "Log in to
like articles."

**Walkthrough:** `document.createElement("button")` creates a `<button>` element —
the correct element for anything clickable that performs an action on the current
page (as opposed to `<a>`, which navigates). `favoriteButton.addEventListener("click",
callback)` registers `callback` to run whenever this specific button is clicked. This
is the same `addEventListener` API lesson 06 used on `window` for `hashchange` —
every element in the DOM can listen for events the same way; only the event name and
the element differ.

The callback passed to `addEventListener` here is an arrow function,
`() => { handleFavoriteClick(article, favoriteButton); }`, that takes no parameters
and calls `handleFavoriteClick` with the specific `article` and `favoriteButton` this
component instance closed over. This is a **closure**: the arrow function
"remembers" the `article` and `favoriteButton` variables from the surrounding
`createArticleElement` call even after that function has returned — each article's
button click handler is permanently tied to that one article's data, because each
call to `createArticleElement` creates its own separate closure over its own
separate `article` and `favoriteButton`.

`handleFavoriteClick` is declared `async` and calls `toggleFavorite`, mutating the
local `article` object's `favorited` and `favoritesCount` fields on success (so the
component's in-memory state matches the server's), or setting an explanatory message
on failure. **This is exactly why the `catch` block matters here more than almost
anywhere else in this project so far:** the failure is not a rare edge case — it is
the *expected*, *correct* outcome for every single click, for as long as lesson 09
does not yet exist. A user experiencing this should see a clear reason ("log in"),
not a frozen button or a console-only error they will never see.

**SE lens — is this component still "pure"?** Lesson 04 defined a component as
something that receives everything it needs as parameters and does not decide where
it goes. Adding a click handler that calls a network function does not break either
rule: `createArticleElement` still receives its `article` as a parameter and still
returns an element without placing it anywhere. What changed is that the *returned
element* is now interactive — components producing interactive elements is normal
and expected; "purity" here was never about forbidding behaviour, only about
forbidding hidden inputs and self-placement.

---

## Concept: Reading the Real 401

Open the Network tab, click a heart button, and inspect the failed request. The
response body reads:

```json
{ "errors": { "token": [ "is missing" ] } }
```

This is Conduit's standard error shape: an `errors` object where each key names what
was wrong and each value is an array of specific messages about it. `"token": ["is
missing"]` means exactly what it says: the server expects an authentication token
identifying who is making the request, and this request did not include one. This is
not a bug — it is the server doing its job correctly. The fix is not "handle this
error better." The fix is "send a token" — which requires having one, which requires
logging in, which is lesson 09.

---

## Connect the Pieces

```
src/api.ts                      toggleFavorite() added — the project's first POST/DELETE calls
src/components/ArticleCard.ts   Every article now has a working (if not yet authorized) like button
```

`article.slug` and `article.favorited`, both present in the `Article` interface
since lesson 02 and 06, are what make `toggleFavorite` possible without any new data
— the API response shape anticipated this feature before this project used it.

---

## What Breaks Without This

**Without checking `response.ok` inside `toggleFavorite`:** The 401 response body is
still valid JSON (`{"errors": {...}}`), so `response.json()` would succeed and
return that error object *as if it were a successful `Article`*. `updated.favorited`
would be `undefined`, and the button would silently show `♥ undefined` instead of a
clear message — a wrong result with no indication anything failed.

**Without the `catch` block in `handleFavoriteClick`:** Clicking the button would
produce an **unhandled promise rejection** — visible only in the console, as a red
error most users will never see, with the button left in whatever state it was in
before the click, forever, no matter how many times they try again.

---

## Definition of Done

- [ ] Every article shows a heart button with its real favorites count
- [ ] Clicking it results in "Log in to like articles" after a real (failed) network request — not a crash, not silence
- [ ] The Network tab shows a real `401` response with an `errors` body when the button is clicked
- [ ] You can explain the difference between `POST` and `DELETE` and why this feature needs both
- [ ] You can explain what idempotency means and which of the two verbs here is meant to be idempotent
- [ ] You can explain what a closure is, using `handleFavoriteClick(article, favoriteButton)` as the example
- [ ] You can explain why this lesson's "broken" like button is the correct, intended state of the project right now
- [ ] Run:
      ```
      git add src/api.ts src/components/ArticleCard.ts
      git commit -m "Wire up the favorite button; a 401 Unauthorized surfaces cleanly, motivating authentication next"
      ```

---

*Next: Lesson 09 — Authentication. A login form appears. Submitting real credentials
returns a real JWT from Conduit, stored so every subsequent request — including the
like button this lesson just wired up — can finally identify who is asking.*
