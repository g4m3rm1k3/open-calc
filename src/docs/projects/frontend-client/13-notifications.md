# Frontend Client — Lesson 13 — Notifications

## What You Will Build

A small toast — "Logged in successfully," "Article published," "Failed to favorite
article" — appears in the corner of the screen after key actions, then disappears on
its own a few seconds later. The part worth paying attention to: the code that
triggers a toast from inside `AuthForm`, `NewArticleForm`, and `ArticleCard` never
imports any of those toasts' rendering logic — it calls one function, from anywhere,
and the notification simply appears.

---

## What You Need to Know First

Every component built so far — `ArticleCard`, `AuthForm`, `NewArticleForm`,
`CommentList` — follows the same shape from lesson 04: data in, one element out, no
knowledge of where it is placed. This lesson introduces something with a different
shape entirely.

---

## Concept: A Service Is Not a Component

Every component this project has built answers the question "given this data, what
element represents it?" Notifications do not fit that question at all: a toast is
not a rendering of some data the rest of the app already has — it is triggered by an
*event* (a login succeeding, a favorite failing), needs to appear *somewhere fixed on
the page regardless of which route is active*, and must disappear on a timer with no
further input from anyone.

This is a **service**: a piece of functionality with its own internal state and
behaviour, callable from anywhere in the project, that does not return an element
the way a component does. A service may still have *a* component associated with it
— something has to actually render the toasts — but the service itself is the part
that anything else in the project is allowed to depend on directly.

---

## Step 1 — Build the Notification Service

**The problem:** Something needs to hold a list of currently-visible notifications,
let any part of the app add one, automatically remove it after a delay, and tell
whatever is responsible for rendering that the list has changed.

Create `src/services/NotificationService.ts`:

```typescript
export interface Notification {
  id: number;
  message: string;
  kind: "success" | "error";
}

type Listener = (notifications: Notification[]) => void;

let notifications: Notification[] = [];
let nextId = 0;
const listeners: Listener[] = [];

function notifyListeners(): void {
  for (const listener of listeners) {
    listener(notifications);
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  listener(notifications);

  return function unsubscribe(): void {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

export function notify(message: string, kind: "success" | "error" = "success"): void {
  const notification: Notification = { id: nextId++, message, kind };
  notifications = [...notifications, notification];
  notifyListeners();

  setTimeout(() => {
    notifications = notifications.filter((existing) => existing.id !== notification.id);
    notifyListeners();
  }, 4000);
}
```

**Walkthrough:** `notifications`, `nextId`, and `listeners` are module-level state —
unlike lesson 12's decision to move similar state *out* of module scope and into a
page's closure, this state genuinely belongs at module scope: notifications are not
specific to any one page or component instance; they are a single, shared,
project-wide list, by design.

`notify(message, kind = "success")` creates a new notification with a unique,
ever-incrementing `id` (`nextId++`, the **postfix increment operator** — it returns
the current value and *then* increases it, the mirror image of lesson 11's prefix
`++latestRequestId`, which increases first and returns the new value; either works
here, since the returned value is only used to label this one notification).
`notifications = [...notifications, notification]` builds a *new* array containing
everything in the old one plus the new entry, rather than calling `.push()` on the
existing array directly. This matters for the same reason lesson 09 favoured
`textContent = ""` and rebuilding over selectively mutating: anything that captured
a reference to the *previous* `notifications` array (a listener that ran a moment
ago, say) still sees the old, unmodified list — nothing is silently changed out from
under code that has not been told to look again.

`setTimeout(() => { ...; notifyListeners(); }, 4000)` is the same API from lesson
11's debounce, used here for its most literal purpose: run this once, after this
many milliseconds. After four seconds, this specific notification is filtered out by
its `id`, and every listener is told again.

**CS lens — the observer pattern.** `subscribe(listener)` adds a function to
`listeners`; `notifyListeners()` calls every one of them whenever the underlying
state changes. This is the **observer pattern**: one piece of code (the *subject* —
here, the notification list) maintains a list of interested parties (*observers*)
and calls each of them whenever something worth knowing about happens, without the
subject needing to know anything about what any individual observer actually does
with that information. `window.addEventListener("hashchange", ...)` since lesson 06,
and `input.addEventListener("input", ...)` since lesson 11, are both the browser's
own built-in implementations of this exact same pattern — you have been using
observers since lesson 06 without the name; this is the first one built by hand,
from scratch, in this project.

`subscribe` returns an **unsubscribe function** — calling `subscribe` a second time
with the same listener would add a duplicate entry unless something can later
remove it; returning a small function that does exactly that (`listeners.splice(index,
1)`, removing one element at the found position) is a common, minimal way to hand
back "undo whatever this call just did" without requiring the caller to keep track
of anything except the value they were already given.

---

## Step 2 — Build the Toast Container

**The problem:** Something needs to actually render the current notification list
as visible elements, and stay correct every time the service's state changes.

Create `src/components/ToastContainer.ts`:

```typescript
import { subscribe } from "../services/NotificationService.ts";

export function createToastContainer(): HTMLElement {
  const container = document.createElement("div");
  container.className = "toast-container";

  subscribe((notifications) => {
    container.textContent = "";
    for (const notification of notifications) {
      const toast = document.createElement("div");
      toast.className = `toast toast-${notification.kind}`;
      toast.textContent = notification.message;
      container.appendChild(toast);
    }
  });

  return container;
}
```

Add to `src/style.css`:

```css
.toast-container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.toast {
  padding: 10px 16px;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
}

.toast-success {
  background-color: #16a34a;
}

.toast-error {
  background-color: #dc2626;
}
```

**Walkthrough:** `createToastContainer` calls `subscribe` once, immediately when it
is created, and never calls it again — the callback given to `subscribe` is what
runs every time afterward, whenever `notify` (or the automatic four-second removal)
changes the list. This is `createToastContainer`'s *entire* job: translate "the
current list of notifications" into "the current DOM." Notice this container never
calls `notify` itself, and the service never imports this file — the direction of
dependency only ever points one way: `ToastContainer` depends on
`NotificationService`, never the reverse. Anything could subscribe to this same
service — a browser notification, a sound effect, a log sent to a server — without
`NotificationService.ts` changing at all.

`position: fixed` takes the toast container out of the normal page layout entirely
and positions it relative to the browser window itself, so it stays in the
bottom-right corner regardless of scrolling or which route is currently rendered
inside `#app`. `z-index: 1000` ensures it renders above everything else on the page —
a high `z-index` value wins when elements would otherwise overlap.

---

## Step 3 — Mount It Once, Use It From Anywhere

**The problem:** The toast container needs to exist on the page from the start, not
per-route (a toast must survive a navigation, since a "New Article" success message
should still show up after redirecting to the new article's page).

Update `index.html`:

```html
<body>
  <h1>Frontend Client</h1>
  <nav id="nav-bar"></nav>
  <div id="app">Loading…</div>
  <div id="toast-root"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

Add near the bottom of `src/main.ts`, alongside the other one-time startup calls:

```typescript
import { createToastContainer } from "./components/ToastContainer.ts";

document.getElementById("toast-root")?.appendChild(createToastContainer());
renderNavBar();
renderRoute();
```

Now call `notify` from a few real places. In `src/components/AuthForm.ts`'s success
path:

```typescript
import { notify } from "../services/NotificationService.ts";

// inside the submit handler, after a successful login/register:
onSuccess(user);
notify(mode === "login" ? "Logged in successfully." : "Account created successfully.");
```

In `src/components/NewArticleForm.ts`:

```typescript
import { notify } from "../services/NotificationService.ts";

// after a successful publish:
onSuccess(article);
notify("Article published.");
```

In `src/components/ArticleCard.ts`'s `handleFavoriteClick`:

```typescript
import { notify } from "../services/NotificationService.ts";

// on success, after updating the button:
notify("Article favorited.");

// in the catch block, instead of only setting button text:
notify("You must be logged in to like articles.", "error");
```

Save and reload. Log in: a green toast confirms it. Try to like an article while
logged out: a red toast explains why nothing happened, disappearing on its own after
four seconds.

**Walkthrough:** `document.getElementById("toast-root")?.appendChild(...)` uses
**optional chaining** (`?.`) — if `getElementById` returns `null`, the expression
short-circuits to `undefined` instead of throwing, the same protective idea as the
`if (element)` checks used since lesson 02, written more compactly for a
one-off call where there is nothing further to do either way.

**SE lens — this is what "callable from anywhere" actually means in practice.**
`AuthForm.ts`, `NewArticleForm.ts`, and `ArticleCard.ts` each import `notify` and
call it directly — none of them import `ToastContainer`, know that a fixed-position
element exists in the corner of the screen, or care how notifications are rendered
at all. If a future lesson replaced toasts entirely with, say, a notification bell
icon and a dropdown, every one of these three files would need zero changes — only
`ToastContainer.ts` (or its replacement) would need to change, because the service
boundary is exactly where it should be: at "here is something worth telling the
user," not at "here is how to tell them."

---

## Connect the Pieces

```
src/services/NotificationService.ts   Subject: holds state, notifies subscribed listeners (observer pattern)
src/components/ToastContainer.ts      The one observer: renders the current notification list
src/main.ts                           Mounts the toast container once, outside the router
AuthForm.ts, NewArticleForm.ts,       Call notify() directly — no import of ToastContainer at all
ArticleCard.ts
```

`services/` is this project's second top-level folder alongside `components/` — the
same reasoning as lesson 05's `components/` folder applies here: it exists because
there are now genuinely two different *kinds* of thing in this project (pieces of UI,
and standalone capabilities), and separating them by folder makes that distinction
visible without reading any file's contents first.

---

## What Breaks Without This

**Without returning a new array in `notify`'s `[...notifications, notification]`
(mutating with `.push()` instead):** In most cases nothing looks different, because
`notifyListeners()` is still called right after — but any future code that compared
"the array I have" against "the array just passed to me" by reference (a common,
efficient shortcut for detecting change) would wrongly conclude nothing changed,
since `.push()` modifies the array in place rather than producing a new one.

**Without the observer pattern (importing `ToastContainer` directly into `AuthForm.ts`
and calling a render function on it instead of a service):** `AuthForm.ts` would now
need to know a `ToastContainer` exists, where to find it, and how to call it —
coupling a login form to one specific way of displaying a message. Every other place
that wants to show a toast would need the same direct coupling, repeated.

---

## Definition of Done

- [ ] Logging in or registering successfully shows a green success toast
- [ ] Publishing an article shows a success toast, even after navigating to the new article's page
- [ ] Attempting to favorite an article while logged out shows a red error toast
- [ ] Toasts disappear on their own after a few seconds
- [ ] No component that calls `notify()` imports `ToastContainer`
- [ ] You can explain the difference between a component and a service in this project's terms
- [ ] You can explain the observer pattern using `subscribe`/`notifyListeners` as the example
- [ ] You can name one browser API this project has already used that is also an implementation of the observer pattern
- [ ] You can explain why `notifications = [...notifications, notification]` is preferred over mutating the array in place
- [ ] Run:
      ```
      git add src/services src/components/ToastContainer.ts src/components/AuthForm.ts src/components/NewArticleForm.ts src/components/ArticleCard.ts src/main.ts index.html src/style.css
      git commit -m "Add a notification service and toast UI, decoupled via the observer pattern"
      ```

---

*Next: Lesson 14 — Caching. Opening an article you have already viewed still
refetches everything from the network, every single time. This lesson adds a cache —
a map with a real question attached to it: how do you know when a cached value is no
longer trustworthy?*
