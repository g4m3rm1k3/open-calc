# Frontend Client — Lesson 10 — Creating a Post

## What You Will Build

A "New Article" link appears in the nav bar — but only while logged in. Filling out
its form and submitting creates a real, permanent article on Conduit's server,
visible to anyone who loads the article list afterward, including a stranger halfway
across the world running this exact same project. This is the first time this
project writes new data into the world instead of only reading what already exists.

---

## What You Need to Know First

Lesson 09 left `src/auth.ts` (`getToken`, `isLoggedIn`, `setToken`, `clearToken`),
authenticated requests via `authHeaders()` in `api.ts`, and a nav bar in `main.ts`
that already reflects login state.

---

## Step 1 — Add `createArticle` to `api.ts`

**The problem:** Creating an article is a `POST` with a body, exactly like
registration in lesson 09 — but this one requires the `Authorization` header, since
Conduit needs to know which user is authoring it.

```typescript
interface CreateArticleResponse {
  article: ArticleDetail;
}

export async function createArticle(
  title: string,
  description: string,
  body: string,
  tagList: string[],
): Promise<ArticleDetail> {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ article: { title, description, body, tagList } }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(formatApiErrors(data.errors));
  }
  return (data as CreateArticleResponse).article;
}
```

**Walkthrough:** `{ "Content-Type": "application/json", ...authHeaders() }` combines
two headers using the **spread operator** (`...`) inside an object literal —
`authHeaders()` returns either `{}` or `{ Authorization: "Token ..." }`, and
spreading it here copies whatever properties it has directly into this larger
object, alongside `Content-Type`. This is a common pattern for building a request's
full headers from several independent, optional pieces without needing to write
conditional logic by hand.

`createArticle` returns `Promise<ArticleDetail>` — not `Article` — because Conduit's
create-article response includes the full article, `body` included, exactly like
the single-article endpoint from lesson 06. Returning the richest available type
means the calling code (Step 3) can immediately navigate to the new article's detail
view using data it already has, without a second request to re-fetch what was just
created.

---

## Step 2 — Build the New Article Form

**The problem:** The form needs a title, a short description, a body (longer than a
single-line input can comfortably hold), and tags — entered as one comma-separated
line, since there is no reason to build a more complex tag-entry widget yet.

Create `src/components/NewArticleForm.ts`:

```typescript
import { createArticle, type ArticleDetail } from "../api.ts";

export function createNewArticleForm(onSuccess: (article: ArticleDetail) => void): HTMLElement {
  const form = document.createElement("form");

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Article title";
  titleInput.required = true;

  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.placeholder = "Short description";
  descriptionInput.required = true;

  const bodyInput = document.createElement("textarea");
  bodyInput.placeholder = "Write your article…";
  bodyInput.required = true;

  const tagsInput = document.createElement("input");
  tagsInput.type = "text";
  tagsInput.placeholder = "Tags, comma separated";

  const errorMessage = document.createElement("p");
  errorMessage.className = "error-message";

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Publish Article";

  form.appendChild(titleInput);
  form.appendChild(descriptionInput);
  form.appendChild(bodyInput);
  form.appendChild(tagsInput);
  form.appendChild(errorMessage);
  form.appendChild(submitButton);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";

    const tagList = tagsInput.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      const article = await createArticle(
        titleInput.value,
        descriptionInput.value,
        bodyInput.value,
        tagList,
      );
      onSuccess(article);
    } catch (error) {
      errorMessage.textContent = error instanceof Error ? error.message : "Something went wrong.";
    }
  });

  return form;
}
```

**Walkthrough:** `document.createElement("textarea")` creates a multi-line text
input — the correct element whenever the expected input is longer than a single
line, as opposed to `<input type="text">`. `titleInput.required = true` sets the
HTML5 `required` attribute: the browser refuses to fire the `submit` event at all if
a required field is empty, showing its own built-in validation message instead. This
is **client-side validation** — instant feedback with zero network round-trip.

`tagsInput.value.split(",").map((tag) => tag.trim()).filter((tag) => tag.length >
0)` turns a raw string like `"javascript, beginners,  "` into a clean array:
`.split(",")` breaks the string into pieces wherever a comma appears, producing
`["javascript", " beginners", "  "]`. `.map((tag) => tag.trim())` removes leading and
trailing whitespace from each piece: `["javascript", "beginners", ""]`.
`.filter((tag) => tag.length > 0)` keeps only the pieces that still have content
after trimming, discarding the empty one left behind by a trailing comma:
`["javascript", "beginners"]`. Each of these three array methods does one narrow
job; chaining them reads, left to right, as a description of the whole
transformation.

**SE lens — client-side validation is a courtesy, not a security boundary.**
`required = true` prevents an honest user from accidentally submitting an empty
title by mistake — a real usability improvement. It does nothing to stop a request
built by hand, bypassing the browser entirely, from sending an empty title directly
to Conduit's API. **Server-side validation** — checks the server itself performs,
regardless of what any client claims to have already validated — is the only
validation that can actually be trusted, because the client is not something the
server controls. This project's `try`/`catch`, displaying whatever `formatApiErrors`
produces from a real server rejection, is what actually handles an invalid
submission correctly; the `required` attribute only makes that path less likely to
be needed for an honest mistake.

---

## Step 3 — Wire Up the Route and the Nav Bar

**The problem:** `#/new` needs a page, and the nav bar needs to offer it only when
logged in.

Update `renderNavBar` in `src/main.ts`:

```typescript
function renderNavBar(): void {
  const navElement = document.getElementById("nav-bar");
  if (!navElement) return;

  navElement.textContent = "";

  if (isLoggedIn()) {
    const newArticleLink = document.createElement("a");
    newArticleLink.href = "#/new";
    newArticleLink.textContent = "New Article";

    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Log Out";
    logoutButton.addEventListener("click", () => {
      clearToken();
      renderNavBar();
      location.hash = "#/";
    });

    navElement.appendChild(newArticleLink);
    navElement.appendChild(logoutButton);
  } else {
    const loginLink = document.createElement("a");
    loginLink.href = "#/login";
    loginLink.textContent = "Log In";

    const registerLink = document.createElement("a");
    registerLink.href = "#/register";
    registerLink.textContent = "Register";

    navElement.appendChild(loginLink);
    navElement.appendChild(registerLink);
  }
}
```

Add the route:

```typescript
import { createNewArticleForm } from "./components/NewArticleForm.ts";

type Route =
  | { name: "list" }
  | { name: "detail"; slug: string }
  | { name: "login" }
  | { name: "register" }
  | { name: "new" };

function parseRoute(hash: string): Route {
  if (hash === "#/login") return { name: "login" };
  if (hash === "#/register") return { name: "register" };
  if (hash === "#/new") return { name: "new" };
  if (hash.startsWith(DETAIL_ROUTE_PREFIX)) {
    return { name: "detail", slug: hash.slice(DETAIL_ROUTE_PREFIX.length) };
  }
  return { name: "list" };
}

function renderNewArticlePage(appElement: HTMLElement): void {
  if (!isLoggedIn()) {
    location.hash = "#/login";
    return;
  }

  appElement.textContent = "";
  appElement.appendChild(
    createNewArticleForm((article) => {
      location.hash = `#/articles/${article.slug}`;
    }),
  );
}
```

Add the branch inside `renderRoute`:

```typescript
async function renderRoute(): Promise<void> {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  const route = parseRoute(location.hash);

  if (route.name === "detail") {
    await renderArticleDetailPage(appElement, route.slug);
  } else if (route.name === "login" || route.name === "register") {
    renderAuthPage(appElement, route.name);
  } else if (route.name === "new") {
    renderNewArticlePage(appElement);
  } else {
    await renderArticleListPage(appElement);
  }
}
```

Save and reload. While logged in, "New Article" appears in the nav bar. Fill out the
form and publish: you land on the new article's real detail page, and it now appears
in the article list, permanently, for anyone.

**Walkthrough:** `renderNewArticlePage` checks `isLoggedIn()` itself and redirects to
`#/login` if false, rather than trusting the nav bar to have hidden the only way to
reach this route. **This distinction matters:** the nav bar controls what a user is
*invited* to click; it does not control what URL they could type in directly, or
reach through a saved link. A route that requires being logged in must check that for
itself — the same "do not trust the client's own restraint" principle from Step 2's
server-side validation, applied to navigation instead of form submission. (Conduit's
own server-side check — the same 401 from lesson 08 — is still the final, real
enforcement; this redirect is a courtesy that avoids showing a user a form doomed to
fail.)

`onSuccess: (article) => { location.hash = ... }` sets `location.hash` directly in
code, rather than through a clicked `<a>` tag — this is the same mechanism, just
triggered programmatically. Setting `location.hash` fires the same `hashchange`
event a real click would, so the router reacts identically either way, landing on
the freshly created article's own detail page.

---

## Connect the Pieces

```
src/api.ts                        createArticle() added — the project's first authenticated write of new data
src/components/NewArticleForm.ts  New component, same shape as AuthForm: fields, an onSuccess callback
src/main.ts                       #/new route, guarded by isLoggedIn(); nav bar shows it conditionally
```

`renderNewArticlePage`'s success handler reuses the exact same
`#/articles/${article.slug}` pattern `ArticleCard.ts` has used since lesson 06 — the
same URL shape, whether reached by clicking a list item or by just having created
the thing it points to.

---

## What Breaks Without This

**Without the `isLoggedIn()` guard inside `renderNewArticlePage`:** A signed-out
visitor who directly types `#/new` into the address bar (or has an old bookmark from
before logging out) sees a fully working-looking form. Submitting it reaches
`createArticle`, which sends the request without a valid token, and Conduit responds
with the same `401` from lesson 08 — reachable, but confusing, since nothing on the
page explained in advance why it would fail.

**Without `.filter((tag) => tag.length > 0)` on the parsed tags:** Typing
`"javascract, beginners,"` (note the trailing comma) produces `["javascript",
"beginners", ""]` after `.split` and `.trim` — an empty string silently becomes a
real tag on the published article, visible to everyone, for no reason a user would
understand.

---

## Definition of Done

- [ ] "New Article" appears in the nav bar only while logged in
- [ ] Submitting the form creates a real article, visible afterward in the article list
- [ ] Publishing navigates directly to the new article's own detail page
- [ ] Typing `#/new` into the address bar while logged out redirects to `#/login` instead of showing the form
- [ ] Trailing or extra commas in the tags field never produce an empty tag
- [ ] You can explain the difference between client-side and server-side validation, and which one is ever actually trustworthy
- [ ] You can explain what the spread operator does in `{ "Content-Type": ..., ...authHeaders() }`
- [ ] You can explain why a route that requires login must check for it itself, not just rely on the nav bar hiding a link
- [ ] Run:
      ```
      git add src/api.ts src/components/NewArticleForm.ts src/main.ts
      git commit -m "Allow logged-in users to publish real articles to Conduit"
      ```

---

*Next: Lesson 11 — Search and Tags. A search box filters the article list by tag as
you type — introducing debouncing, loading states, and the first real race condition
this project has to defend against: what happens when a slow response for an old
search arrives after a newer one already did.*
