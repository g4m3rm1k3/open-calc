# Junior to Senior — T12·L19 — Navigation Patterns

**Prerequisites:** T12·L18 (Forms). You can build complete form components. This lesson
teaches the CSS for navigation — the component types that appear on every application:
top nav bar, sidebar, breadcrumbs, tabs, and the mobile hamburger menu.

**What this lab adds:**
- Top navigation bar: logo, links, user menu — the layout pattern
- Sidebar navigation: vertical, with active states and nesting
- Breadcrumbs: the separator technique with `::before`
- Tabs: horizontal tabs with `role="tablist"` and `:checked` state
- Mobile navigation: showing/hiding with CSS transitions
- Skip navigation: the accessibility requirement

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A top navbar has a logo on the left, links in the center, and user avatar on the right.
>    You use `justify-content: space-between`. But you have 4 links and want the links
>    group centered relative to the full width, not between logo and avatar. How?
> 2. Breadcrumb separators: `Home / Products / Laptops`. The `/` separators are not in
>    the HTML. How do you add them?
> 3. Tabs that work with keyboard navigation: Tab to move to the tab group, arrow keys
>    to switch tabs. What HTML attributes make this work WITHOUT JavaScript?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

Navigation is the most critical component on any page. If the user cannot figure out
where they are or how to get somewhere else, nothing else matters. The CSS for navigation
must communicate location (active state), hierarchy (nesting), and affordance (this is clickable).

---

## Step 1 — Top Navigation Bar

Create `navigation.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Navigation</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --color-primary: hsl(219, 79%, 60%);
      --color-nav-bg: hsl(220, 20%, 14%);
      --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem; --space-5: 1.5rem;
    }

    body { font-family: system-ui, sans-serif; margin: 0; background: #f5f5f5; }

    /* ── TOP NAV ──────────────────────────────── */
    .topnav {
      display: flex;
      align-items: center;
      padding: 0 var(--space-5);
      height: 56px;
      background: var(--color-nav-bg);
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topnav__logo {
      font-weight: 700;
      font-size: 1.125rem;
      color: white;
      text-decoration: none;
      flex-shrink: 0;
    }

    /* Center the links absolutely so they are always centered
       regardless of logo or avatar width: */
    .topnav__links {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: var(--space-4);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .topnav__link {
      color: hsl(0, 0%, 70%);
      text-decoration: none;
      font-size: 0.9rem;
      padding: var(--space-2) var(--space-3);
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }

    .topnav__link:hover           { color: white; background: hsl(0 0% 100% / 0.08); }
    .topnav__link[aria-current]   { color: white; font-weight: 600; }

    .topnav__actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <nav class="topnav" aria-label="Main navigation">
    <a class="topnav__logo" href="#">CNC·SIM</a>

    <ul class="topnav__links" role="list">
      <li><a class="topnav__link" href="#">Dashboard</a></li>
      <li><a class="topnav__link" href="#" aria-current="page">Jobs</a></li>
      <li><a class="topnav__link" href="#">Tools</a></li>
      <li><a class="topnav__link" href="#">Settings</a></li>
    </ul>

    <div class="topnav__actions">
      <span style="font-size: 0.875rem; color: #aaa;">v1.2.0</span>
      <div class="avatar" role="button" tabindex="0" aria-label="User menu">JD</div>
    </div>
  </nav>

  <main style="padding: var(--space-5);">
    <p>Page content below the navbar.</p>
  </main>

</body>
</html>
```

### CSS AND SEE

**You should see:** A dark navigation bar with:
- Logo pinned left
- Links precisely centered (not just space-between — truly centered on the page)
- Avatar on the right

**Why `position: absolute; left: 50%; transform: translateX(-50%)` for centered links:**

`justify-content: space-between` puts logo at far left and avatar at far right. The links
go in between — but "between" means centered on the remaining space, not the full page width.
If the logo is 100px and the avatar is 40px, "between" is shifted left. The absolute
centering technique removes the links from the flex row's alignment calculation entirely,
placing them at the mathematical center of the bar. The `topnav` must have `position: relative`
(or `sticky` as here) for the absolute to measure from it.

---

## Step 2 — Sidebar Navigation

Add to `navigation.html`:

```html
<div style="display: flex; min-height: calc(100vh - 56px); gap: 0;">   <!-- ← replace <main> -->

  <aside class="sidebar" aria-label="Sidebar navigation">
    <nav>
      <p class="sidebar__section-label">Workspace</p>
      <ul class="sidebar__list">
        <li><a class="sidebar__link" href="#">Dashboard</a></li>
        <li>
          <a class="sidebar__link sidebar__link--active" href="#" aria-current="page">Jobs</a>
          <!-- Nested items for active parent: -->
          <ul class="sidebar__nested">
            <li><a class="sidebar__link sidebar__link--nested" href="#">Active (3)</a></li>
            <li><a class="sidebar__link sidebar__link--nested" href="#">Completed</a></li>
            <li><a class="sidebar__link sidebar__link--nested" href="#">Cancelled</a></li>
          </ul>
        </li>
        <li><a class="sidebar__link" href="#">Tools</a></li>
      </ul>

      <p class="sidebar__section-label">Account</p>
      <ul class="sidebar__list">
        <li><a class="sidebar__link" href="#">Settings</a></li>
        <li><a class="sidebar__link" href="#">Help</a></li>
      </ul>
    </nav>
  </aside>

  <main style="flex: 1; padding: var(--space-5);">
    <p>Main content area.</p>
  </main>

</div>
```

Add CSS:

```css
/* ── SIDEBAR ──────────────────────────────── */
.sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e8e8e8;
  padding: var(--space-4) var(--space-3);
  flex-shrink: 0;
}

.sidebar__section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #aaa;
  margin: var(--space-4) 0 var(--space-1) var(--space-3);
  padding: 0;
}

.sidebar__section-label:first-child { margin-top: 0; }

.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__link {
  display: block;
  padding: var(--space-2) var(--space-3);
  border-radius: 5px;
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.1s, color 0.1s;
}

.sidebar__link:hover           { background: #f5f5f5; color: #222; }
.sidebar__link--active         { background: hsl(219 79% 60% / 0.1); color: hsl(219 79% 45%); font-weight: 600; }
.sidebar__link--active:hover   { background: hsl(219 79% 60% / 0.15); }

/* Nested items: indented */
.sidebar__nested {
  list-style: none;
  margin: 2px 0 2px var(--space-4);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__link--nested {
  font-size: 0.85rem;
  padding: var(--space-1) var(--space-3);
  color: #888;
}
.sidebar__link--nested:hover { color: #222; }
```

### CSS AND SEE

**You should see:** A sidebar with section labels, navigation items, and nested subitems
under the active item. Active item has a colored background and bolder text.

---

## Step 3 — Breadcrumbs

Add below the navbar and above the sidebar:

```html
<div style="padding: var(--space-3) var(--space-5); background: white; border-bottom: 1px solid #eee;">  <!-- ← add between nav and sidebar section -->
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumbs">
      <li class="breadcrumbs__item"><a class="breadcrumbs__link" href="#">Home</a></li>
      <li class="breadcrumbs__item"><a class="breadcrumbs__link" href="#">Jobs</a></li>
      <li class="breadcrumbs__item breadcrumbs__item--current" aria-current="page">Job #1742</li>
    </ol>
  </nav>
</div>
```

Add CSS:

```css
/* ── BREADCRUMBS ──────────────────────────── */
.breadcrumbs {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;
  font-size: 0.875rem;
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
}

/* Separator: added with ::before on every item except the first */
.breadcrumbs__item + .breadcrumbs__item::before {
  content: '/';
  color: #ccc;
  margin: 0 var(--space-2);
}

.breadcrumbs__link {
  color: hsl(219, 79%, 55%);
  text-decoration: none;
}
.breadcrumbs__link:hover { text-decoration: underline; }

.breadcrumbs__item--current { color: #444; }
```

### CSS AND SEE

**You should see:** `Home / Jobs / Job #1742` with `/` separators. The separators
are not in the HTML — they are added by `.breadcrumbs__item + .breadcrumbs__item::before`.

**Change something:** Change the separator from `'/'` to `'›'`.

**Expected:** The separators change everywhere instantly. Because the separator is in CSS,
changing it requires one edit.

---

## Step 4 — Tabs

Add after the breadcrumbs:

```html
<div style="padding: var(--space-4) var(--space-5) 0;">   <!-- ← add inside the flex layout section -->
  <div class="tabs" role="tablist" aria-label="Job tabs">
    <button class="tabs__tab tabs__tab--active" role="tab" aria-selected="true"  aria-controls="panel-overview">Overview</button>
    <button class="tabs__tab" role="tab" aria-selected="false" aria-controls="panel-output">Output</button>
    <button class="tabs__tab" role="tab" aria-selected="false" aria-controls="panel-log">Log</button>
  </div>
</div>
```

Add CSS:

```css
/* ── TABS ──────────────────────────────── */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e8e8e8;
}

.tabs__tab {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;        /* overlap the container's bottom border */
  font: inherit;
  font-size: 0.9rem;
  color: #888;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.tabs__tab:hover { color: #333; }

.tabs__tab--active,
.tabs__tab[aria-selected="true"] {
  color: hsl(219, 79%, 50%);
  border-bottom-color: hsl(219, 79%, 50%);
  font-weight: 600;
}

.tabs__tab:focus-visible {
  outline: 3px solid hsl(219 79% 60%);
  outline-offset: -3px;
  border-radius: 4px 4px 0 0;
}
```

### CSS AND SEE

**You should see:** Three tabs with a bottom border indicator on the active tab.
The `margin-bottom: -2px` trick makes the active tab's border appear on top of the
container's border, creating a seamless tab effect.

---

## 🎯 Challenge: Mobile Hamburger Navigation

**Task:** Add a mobile menu to the top navbar:

1. A hamburger button (three lines) replaces the nav links on small screens
2. Clicking opens a full-width dropdown menu
3. On desktop (768px+), the dropdown disappears and the inline links return
4. The open/close is CSS-only using a checkbox hack

---

<details>
<summary>▶ Show Solution</summary>

```html
<!-- Add inside .topnav, after logo: -->
<input type="checkbox" id="mobile-menu-toggle" class="mobile-menu__toggle" aria-hidden="true">
<label for="mobile-menu-toggle" class="mobile-menu__hamburger" aria-label="Open navigation menu">
  <span></span><span></span><span></span>
</label>

<!-- Mobile menu (hidden by default): -->
<div class="mobile-menu__panel">
  <ul style="list-style: none; padding: 0; margin: 0;">
    <li><a href="#" style="display: block; padding: 14px 20px; color: white; text-decoration: none; border-bottom: 1px solid hsl(0 0% 100% / 0.1);">Dashboard</a></li>
    <li><a href="#" style="display: block; padding: 14px 20px; color: white; text-decoration: none; border-bottom: 1px solid hsl(0 0% 100% / 0.1);">Jobs</a></li>
    <li><a href="#" style="display: block; padding: 14px 20px; color: white; text-decoration: none;">Settings</a></li>
  </ul>
</div>
```

```css
/* Hamburger is hidden on desktop: */
.mobile-menu__toggle  { display: none; }
.mobile-menu__hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: var(--space-2);
}
.mobile-menu__hamburger span {
  display: block; width: 22px; height: 2px; background: white; border-radius: 2px;
}

.mobile-menu__panel {
  position: fixed;
  top: 56px; left: 0; right: 0;
  background: var(--color-nav-bg);
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 99;
}

/* Show panel when checkbox is checked: */
#mobile-menu-toggle:checked ~ .mobile-menu__panel {
  transform: translateY(0);
  opacity: 1;
}

/* On mobile: show hamburger, hide inline links */
@media (max-width: 767px) {
  .topnav__links          { display: none; }
  .mobile-menu__hamburger { display: flex; }
}
```

**Key insight:** The checkbox hack: a hidden `<input type="checkbox">` provides the
open/closed state. The `<label>` triggers it visually. When checked, the adjacent sibling
selector `#mobile-menu-toggle:checked ~ .mobile-menu__panel` shows the panel.
This works because `<label>` does not need to be adjacent — it just needs the `for` attribute.
The panel IS a sibling of the checkbox, so the `~` combinator finds it.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Absolutely centered nav links | Logo wider than avatar — links stay perfectly centered |
| Active sidebar item | `.sidebar__link--active` has colored background |
| Breadcrumb separators | Separators appear between items without HTML; change CSS to change all |
| Tab indicator | Active tab has bottom border flush with container border |
| `margin-bottom: -2px` trick | Remove it — active tab border is separated from container border |

---

## Quick Check Answers

**1. Truly center nav links regardless of logo/avatar width. How?**

Position the links absolutely within the nav. The nav is `position: sticky` (or `relative`),
which creates a positioning context. Set `.links { position: absolute; left: 50%; transform: translateX(-50%); }`.
This takes the links OUT of the flex flow and centers them on the full width of the nav bar
mathematically — `left: 50%` places the left edge at center, `translateX(-50%)` pulls the element
back by half its own width, centering it. Logo width and avatar width have no effect.

**2. Breadcrumb separators — not in HTML. How to add them?**

The adjacent sibling combinator `+` with `::before` pseudo-element:

```css
.breadcrumbs__item + .breadcrumbs__item::before {
  content: '/';
}
```

`A + B` selects B when it immediately follows A. Every breadcrumb item that comes after
another item gets a `::before` pseudo-element with the separator. The first item has no
preceding sibling so it gets no separator. Change `content` to change all separators at once.

**3. Keyboard tabs without JavaScript — HTML attributes?**

`role="tablist"` on the container, `role="tab"` on each button, and `aria-selected="true/false"`.
Arrow key navigation between tabs (with `role="tablist"`) is built into some browsers'
accessibility implementations. For full keyboard support, JavaScript is typically still needed
to handle `ArrowLeft`/`ArrowRight` to move `aria-selected` and show the correct panel.
The pure CSS approach with checkboxes or `:focus-within` can approximate this but does not
satisfy the ARIA keyboard interaction pattern completely.
