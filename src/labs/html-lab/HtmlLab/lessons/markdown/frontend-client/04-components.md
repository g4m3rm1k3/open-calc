# Frontend Client — Lesson 04 — Components

## What You Will Build

Each article now shows its tags — small labelled pills like `javascript`,
`beginners`, `programming` — beneath the author line. That is the visible feature.
The real point of this lesson is what happens while building it: `createArticleElement`
starts doing two unrelated jobs in one function body, and splitting it back into two
functions gives you your first vocabulary word for a pattern you have already been
using since lesson 03 without naming it: **a component**.

When you finish, every article shows something like:

```
How to Learn JavaScript Efficiently
by johndoe
[beginners] [javascript] [programming] [webdev]
```

---

## What You Need to Know First

Lesson 03 left `src/main.ts` with a `createArticleElement(article: Article):
HTMLElement` function — built once per article, called in a loop inside `main()` —
and `src/api.ts` unchanged since lesson 02, exporting `fetchArticles` and the
`Article` interface (which already includes `tagList: string[]`, even though nothing
has rendered it yet).

---

## Step 1 — Render Tags Inline First

**The problem:** Tags need to appear. The smallest step is adding them directly
inside the function that already builds an article — even knowing, before writing
it, that this will make that function do more than one job. Feeling *why* that is a
problem is more convincing than being told in advance.

Extend `createArticleElement` in `src/main.ts`:

```typescript
function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleElement = document.createElement("h2");
  titleElement.textContent = article.title;

  const authorElement = document.createElement("p");
  authorElement.textContent = `by ${article.author.username}`;

  const tagsElement = document.createElement("div");
  for (const tag of article.tagList) {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "tag-pill";
    tagsElement.appendChild(tagElement);
  }

  container.appendChild(titleElement);
  container.appendChild(authorElement);
  container.appendChild(tagsElement);

  return container;
}
```

Add a small style so tags are visually distinct — open `src/style.css` (create it if
lesson 01's cleanup removed it; link it from `index.html`'s `<head>` with
`<link rel="stylesheet" href="/src/style.css" />` if it is not already there):

```css
.tag-pill {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 4px;
  border-radius: 999px;
  background-color: #e2e8f0;
  font-size: 0.75rem;
}
```

Save and reload. Tags now appear under every article.

**Walkthrough:** `tagElement.className = "tag-pill"` sets the element's CSS class —
`className` (not `class`, which is a reserved word in JavaScript/TypeScript and
cannot be used as a property name) is the DOM property that corresponds to the HTML
`class` attribute. `border-radius: 999px` on a short inline element produces a fully
rounded "pill" shape — a radius larger than half the element's height simply clips to
a perfect capsule.

**Why this code already feels different to write than Steps 1–2 of lesson 03:** The
function now contains three separate ideas glued together: building the article's own
elements, looping over an array to build a sub-list of *different* elements, and
assembling everything into one container. Nothing here is *wrong* — it runs, it is
correct, tests would pass against it. But reading it requires holding three unrelated
jobs in your head simultaneously, and the tag-rendering loop is now stuck inside a
function that has nothing to do with tags specifically — it happens to also render an
article.

---

## Step 2 — Extract the Tag List Into Its Own Function

**The problem:** The reason to extract this into its own function is not "it is too
long" as a vague rule — it is a specific, concrete one: **lesson 07's comment list
and lesson 11's tag filter will both need to render a list of small labelled items
again**, and duplicating this loop in three different places means fixing a bug (or
changing the pill style) three times, in three files, and hoping you find all of
them.

```typescript
function createTagList(tags: string[]): HTMLElement {
  const tagsElement = document.createElement("div");

  for (const tag of tags) {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "tag-pill";
    tagsElement.appendChild(tagElement);
  }

  return tagsElement;
}

function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleElement = document.createElement("h2");
  titleElement.textContent = article.title;

  const authorElement = document.createElement("p");
  authorElement.textContent = `by ${article.author.username}`;

  container.appendChild(titleElement);
  container.appendChild(authorElement);
  container.appendChild(createTagList(article.tagList));

  return container;
}
```

Save and reload. The page looks identical to Step 1 — this step changed *structure*,
not *behaviour*, which is exactly the point: nothing about what the user sees should
change when you are only reorganising code.

**Walkthrough:** `createTagList` takes a plain `string[]` — not an `Article`, not
anything specific to this project's articles — because rendering "a list of labelled
pills" has nothing to do with articles at all; it is a generic capability. This is
why the parameter type is as narrow and generic as the function's real job: a
function that only needs an array of strings should not ask for anything more, even
if the only caller today happens to have an `Article` lying around. `createArticleElement`
now calls `createTagList(article.tagList)` and appends whatever it returns, without
knowing or caring how tags are actually built.

**SE lens — parameterization is what makes reuse possible.** `createTagList` is
reusable *because* it does not know about articles — it only knows about
`string[]`. If it had been written to accept an `Article` and read `article.tagList`
internally, it would be secretly coupled to articles specifically, and reusing it for
comments (lesson 07) would mean either duplicating it with a different parameter type
or awkwardly forcing comment data to look like an article. Designing a function's
parameters around the smallest, most general shape it actually needs is what makes
"write once, use everywhere" actually work, instead of being a nice idea that
quietly fails the first time reuse is attempted.

---

## Concept: Naming the Pattern — What a Component Is

Both `createArticleElement` and `createTagList` now share an identical shape:

```
(data) => HTMLElement
```

A function that takes some data and returns a piece of UI, with no idea where that
UI will end up, how many times it will be called, or what else exists on the page
around it. This shape has a name, used across virtually every UI framework in
existence: a **component**.

**CS/SE lens — naming a pattern you already built:** You did not learn "what a
component is" and then apply it. You built two functions to solve two real problems
— rendering one article, rendering a list of tags — and they turned out to share a
shape, because that shape is simply what "a reusable piece of UI" looks like once
data and placement are kept separate. This is deliberate: frameworks like React
formalise this exact pattern (a component is, at its core, still "a function that
takes data — called *props* — and returns UI"), add features on top of it (automatic
re-rendering when data changes, a virtual DOM diffing algorithm to update the page
efficiently), but the core idea — data in, UI out, no side knowledge of placement —
is exactly what `createTagList` already does. Understanding this now, from first
principles, means a framework's component model will look like a formalisation of
something you already understand, not a new concept from nothing.

**The two properties that make something a component here:**

1. **It receives everything it needs as parameters** — `createTagList` does not
   reach out and read some global variable for tags; every input arrives explicitly.
   This makes it possible to reason about the function by reading its signature
   alone: given a `string[]`, you already know everything about what it can do.
2. **It does not decide where it goes** — `createTagList` returns an element; it
   never calls `document.body.appendChild` itself. The caller (`createArticleElement`)
   decides that. This means the same component works whether it ends up in an
   article, a sidebar, or a future feature nobody has designed yet.

---

## Connect the Pieces

```
src/main.ts     createTagList() — this project's second component, and the first one
                extracted specifically because it will be reused
                createArticleElement() — this project's first component (lesson 03),
                now composed from a smaller one instead of doing everything itself
```

`createArticleElement` calling `createTagList` is **composition** — building a larger
piece of UI out of smaller ones, each independently understandable. This is the same
relationship lesson 05 will extend: once a second genuinely separate component exists
(an author byline, not just a tag list), the project earns its first `components/`
folder — not because "that's where components go," but because there will be two
real files worth separating from `main.ts`.

---

## What Breaks Without This

**Without extracting `createTagList`:** Imagine lesson 07 needs to render a list of
comment authors' avatars in a similar pill style. Without a shared function, you copy
the six-line tag-rendering loop into the comments code, rename a variable or two, and
move on. Now imagine the pill design needs to change — larger font, different
padding. You have to remember there are two copies, find both, and update both
identically. Miss one, and the two lists visually disagree with no error message
anywhere — a bug you only notice by looking at the page carefully.

**Without parameterizing `createTagList` as `string[]` specifically:** If it had
instead accepted a full `Article` and reached into `article.tagList` itself, using it
to render, say, a list of category names unrelated to any article would require
constructing a fake `Article` object just to satisfy the parameter type — an obvious
sign the function's inputs were not designed around what it actually needs.

---

## Definition of Done

- [ ] Every article shows its tags as visually distinct pills beneath the author line
- [ ] `createTagList(tags: string[]): HTMLElement` exists as its own function, called by `createArticleElement`
- [ ] `createTagList` takes a plain `string[]`, not an `Article`
- [ ] The page's visible output is identical before and after Step 2's refactor
- [ ] You can explain, in your own words, what makes a function "a component" in this project's terms
- [ ] You can explain why `createTagList` accepts `string[]` instead of `Article`
- [ ] You can name one real UI framework's component model and how it relates to what you just built
- [ ] Run:
      ```
      git add src/main.ts src/style.css index.html
      git commit -m "Render article tags; extract createTagList as a reusable component"
      ```

---

*Next: Lesson 05 — A Second Component. Each article grows an author byline with an
avatar image — a second real component, distinct enough from `createTagList` and
`createArticleElement` that `main.ts` starts to feel crowded. This is the exact
moment the project earns a `components/` folder: not in advance, but because there
are finally two real files worth separating.*
