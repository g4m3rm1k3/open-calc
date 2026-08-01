# SE Masterclass — LAB-36 — Virtual DOM

**Language: TypeScript (Browser)** — closes out Module 2 of Phase 3.

**Prerequisites:** LAB-29 (raw DOM's "wipe and rebuild" cost, and the focus-loss bug from its Challenge — this lab fixes both) and LAB-06 (tree diffing is a tree traversal, same shape as everything since `preorder`).

**What this lab adds:**
- Representing UI as a lightweight, plain JavaScript object tree (a **virtual DOM**) instead of touching the real DOM directly
- A **diffing** algorithm: comparing an OLD vnode tree against a NEW one, finding the MINIMAL real-DOM changes needed
- Why this directly fixes LAB-29's focus-loss bug — unchanged elements are never recreated
- Keyed list diffing — matching items across renders by IDENTITY, not position

**Time:** 100–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-29's `list.innerHTML = ''` then rebuild is O(n) DOM operations for ANY change, even a one-character text edit. What would the IDEAL cost be for a one-character text edit?
> 2. If a virtual DOM tree is just plain JavaScript objects (no real DOM at all), why is comparing TWO of them cheaper than comparing two real DOM trees?
> 3. A list `[A, B, C]` becomes `[B, C, A]` (rotated). Diffing by POSITION alone (index 0 vs index 0, etc.) would see three "changed" slots. What would diffing by IDENTITY (a stable key per item) see instead?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, browser console output (DevTools) shows:

```
=== VNodes: A Tree of Plain Objects ===
{ tag: 'div', props: {}, children: [ { tag: 'span', props: {}, children: ['Hello'] } ] }

=== Mount: VNode Tree to Real DOM ===
mounted — check the browser page

=== Diff: Same Tag, Changed Text ===
old vnode text: "Count: 0"
new vnode text: "Count: 1"
patch applied: 1 real DOM operation (textContent update)
  ← NOT a full rebuild — only the changed text node was touched

=== Diff: Different Tag Entirely ===
old: <span>, new: <div>
patch applied: REPLACE (different tag — no safe way to patch in place)

=== Diff: Unkeyed List Reorder (the naive/wrong way) ===
[A, B, C] -> [B, C, A] compared by POSITION
index 0: A -> B (treated as CHANGED)
index 1: B -> C (treated as CHANGED)
index 2: C -> A (treated as CHANGED)
  ← 3 "changes" for what is really just a rotation — worst case, loses element identity

=== Diff: Keyed List Reorder (the correct way) ===
[A, B, C] -> [B, C, A] compared by KEY
A: moved, not recreated
B: moved, not recreated
C: moved, not recreated
  ← 0 elements recreated — only DOM positions changed, identity preserved
```

---

### Concept: A Virtual DOM Is Just a Tree of Plain Objects

**What it is:** A **virtual DOM (vDOM)** represents what the UI SHOULD look like as a lightweight, plain JavaScript object tree (LAB-06's tree, again) — NOT real DOM nodes, just cheap data describing tag names, props, and children. Comparing two of these plain-object trees is FAR cheaper than comparing two real DOM trees, because plain objects have none of the browser's internal bookkeeping (layout info, event listeners, style computation).

**The problem before:** LAB-29's `list.innerHTML = ''` then rebuild-everything approach is SIMPLE but wasteful — even a ONE-CHARACTER text change destroys and recreates every element, at real DOM cost (and, per LAB-29's Challenge, real UX cost: lost focus, lost scroll position).

**The solution:** Build the NEW desired UI as a cheap vnode tree first. Compare it against the PREVIOUS vnode tree (kept from the last render). Compute the MINIMAL set of real DOM operations needed to turn the old real DOM into the new desired shape — then apply ONLY those operations.

**Project Application (The "Why" here):** This is LAB-26's deep-clone recursion and LAB-14's graph-diffing instincts, combined: recursively walk TWO trees IN PARALLEL, comparing corresponding nodes, and act only where they actually differ.

---

## Step 1 — VNodes: A Tree of Plain Objects

```ts
// vdom.ts

export interface VNode {
  tag: string
  props: Record<string, any>
  children: (VNode | string)[]
}

export function h(tag: string, props: Record<string, any> = {}, children: (VNode | string)[] = []): VNode {
  return { tag, props, children }              // ← add: just a plain object — no real DOM created yet
}
```

```ts
// main.ts
import { h } from './vdom'

console.log('=== VNodes: A Tree of Plain Objects ===')
const tree = h('div', {}, [h('span', {}, ['Hello'])])
console.log(tree)
```

### SAVE AND TRY

Check DevTools console.

**Expected (shape):**
```
=== VNodes: A Tree of Plain Objects ===
{ tag: 'div', props: {}, children: [ { tag: 'span', props: {}, children: ['Hello'] } ] }
```

**Confirm nothing real exists yet:** No `document.createElement` was called anywhere in `h()` — this is PURE DATA, exactly like LAB-11's AST was pure data describing a computation before LAB-12 ever evaluated it. `h()` describes WHAT the UI should look like; it doesn't create it.

---

## Step 2 — Mount: VNode Tree to Real DOM

```ts
// Add to vdom.ts:
export function mount(vnode: VNode | string, container: HTMLElement): void {
  if (typeof vnode === 'string') {
    container.appendChild(document.createTextNode(vnode))    // ← add: text nodes — LAB-29's territory, reused
    return
  }

  const el = document.createElement(vnode.tag)                 // ← add: LAB-29's createElement, one time per real mount
  for (const [key, value] of Object.entries(vnode.props)) {
    if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value)     // onClick -> 'click'
    } else {
      el.setAttribute(key, value)
    }
  }
  for (const child of vnode.children) {
    mount(child, el)                                              // ← add: recurse — LAB-06's tree traversal, once more
  }
  container.appendChild(el)
}
```

Add to `main.ts`:

```ts
import { mount } from './vdom'

console.log('\n=== Mount: VNode Tree to Real DOM ===')
const app = document.querySelector<HTMLDivElement>('#app')!
mount(tree, app)
console.log('mounted — check the browser page')
```

### SAVE AND TRY

Save. Confirm "Hello" appears in the browser, wrapped correctly in a `<div><span>`.

**Confirm this is a FULL, real DOM tree** by inspecting it in DevTools' Elements panel — `mount` is a REAL, one-time construction, using exactly LAB-29's `createElement`/`appendChild` calls, just driven by walking the vnode tree recursively instead of writing them out by hand.

---

### Concept: Diffing — Comparing Old and New Trees

**What it is:** Instead of unmounting everything and re-mounting from scratch on every change, KEEP the previous vnode tree around, build a NEW vnode tree representing the desired next state, and **diff** them — walk BOTH trees in parallel (LAB-06's shape again), and only touch the REAL DOM where something actually differs.

**The core rules, in order of preference:**
1. Same tag, only text/props changed → **patch in place** (cheapest: one `textContent` write, or one attribute update)
2. Different tag entirely → **replace** (no safe way to patch a `<span>` into a `<div>` — too structurally different)
3. Same tag, different children → **recurse into children**, applying rules 1–3 to each

---

## Step 3 — Diff: Text and Prop Changes

```ts
// Add to vdom.ts:
export function patch(realNode: Node, oldVNode: VNode | string, newVNode: VNode | string): void {
  if (typeof oldVNode === 'string' && typeof newVNode === 'string') {
    if (oldVNode !== newVNode) {
      realNode.textContent = newVNode              // ← add: rule 1 — same "kind" (text), just update the content
      console.log('patch applied: 1 real DOM operation (textContent update)')
    }
    return
  }

  if (typeof oldVNode !== 'string' && typeof newVNode !== 'string' && oldVNode.tag !== newVNode.tag) {
    console.log(`patch applied: REPLACE (different tag — no safe way to patch in place)`)
    // a full implementation would unmount realNode and mount(newVNode) in its place — omitted here for clarity
    return
  }

  // (same-tag prop/children diffing — extended in the Challenge)
}
```

Add to `main.ts`:

```ts
import { patch } from './vdom'

console.log('\n=== Diff: Same Tag, Changed Text ===')
const oldText = 'Count: 0'
const newText = 'Count: 1'
console.log(`old vnode text: "${oldText}"`)
console.log(`new vnode text: "${newText}"`)
const textNode = document.createTextNode(oldText)
patch(textNode, oldText, newText)
console.log('  ← NOT a full rebuild — only the changed text node was touched')

console.log('\n=== Diff: Different Tag Entirely ===')
console.log('old: <span>, new: <div>')
patch(document.createElement('span'), h('span'), h('div'))
```

### SAVE AND TRY

**Expected:**
```
=== Diff: Same Tag, Changed Text ===
old vnode text: "Count: 0"
new vnode text: "Count: 1"
patch applied: 1 real DOM operation (textContent update)
  ← NOT a full rebuild — only the changed text node was touched

=== Diff: Different Tag Entirely ===
old: <span>, new: <div>
patch applied: REPLACE (different tag — no safe way to patch in place)
```

**Confirm the fundamental win over LAB-29:** For the text-change case, EXACTLY ONE real DOM operation happened (`realNode.textContent = newVNode`) — compare this to LAB-29's `list.innerHTML = ''` then full rebuild, which would have been MANY operations for the exact same visual result. This is the direct fix for LAB-29's Challenge (focus-loss bug) too: an `<input>` element that DIDN'T change tag is NEVER recreated by this patching approach — it stays the exact same real DOM node, keeping its focus, cursor position, and any other DOM-only state intact.

---

## 🎯 Challenge: Keyed List Diffing

**You know:** Diffing children POSITION-BY-POSITION (index 0 vs index 0, index 1 vs index 1...) works fine when items don't reorder — but a rotation or reorder makes EVERY position look "changed," even though the actual ITEMS are the same, just moved.

**Task:** Compare unkeyed (position-based) diffing against keyed (identity-based) diffing for the list `[A, B, C]` becoming `[B, C, A]`.

**Starting code:**

```ts
const oldList = ['A', 'B', 'C']
const newList = ['B', 'C', 'A']

console.log('\n=== Diff: Unkeyed List Reorder (the naive/wrong way) ===')
console.log('[A, B, C] -> [B, C, A] compared by POSITION')
for (let i = 0; i < Math.max(oldList.length, newList.length); i++) {
  if (oldList[i] !== newList[i]) {
    console.log(`index ${i}: ${oldList[i]} -> ${newList[i]} (treated as CHANGED)`)
  }
}
console.log('  ← 3 "changes" for what is really just a rotation — worst case, loses element identity')
```

<details>
<summary>▶ Show Solution</summary>

```ts
interface KeyedItem { key: string; value: string }

function diffKeyed(oldItems: KeyedItem[], newItems: KeyedItem[]): void {
  const oldByKey = new Map(oldItems.map(item => [item.key, item]))   // LAB-04's hash map — O(1) lookup by identity
  for (const newItem of newItems) {
    if (oldByKey.has(newItem.key)) {
      console.log(`${newItem.key}: moved, not recreated`)             // SAME underlying item — just repositioned
    } else {
      console.log(`${newItem.key}: newly created`)                     // genuinely new — no old item with this key existed
    }
  }
}

console.log('\n=== Diff: Keyed List Reorder (the correct way) ===')
console.log('[A, B, C] -> [B, C, A] compared by KEY')
const oldKeyed = [{ key: 'A', value: 'A' }, { key: 'B', value: 'B' }, { key: 'C', value: 'C' }]
const newKeyed = [{ key: 'B', value: 'B' }, { key: 'C', value: 'C' }, { key: 'A', value: 'A' }]
diffKeyed(oldKeyed, newKeyed)
console.log('  ← 0 elements recreated — only DOM positions changed, identity preserved')
```

**Key insight:** The KEY (a stable identifier per item, independent of its current POSITION in the array) is what lets the diff algorithm recognize "this is the SAME logical item, it just moved" instead of "everything from this point onward looks different." This is EXACTLY why React (and every serious vDOM implementation) requires a `key` prop on list items, and EXACTLY why using the array INDEX as the key (`key={i}`) defeats the whole purpose — the index changes when items reorder, which is precisely the case keyed diffing exists to handle correctly. A real key needs to be tied to the ITEM's identity (a database ID, a UUID), not its current POSITION.

</details>

### SAVE AND TRY

**Expected:**
```
=== Diff: Unkeyed List Reorder (the naive/wrong way) ===
[A, B, C] -> [B, C, A] compared by POSITION
index 0: A -> B (treated as CHANGED)
index 1: B -> C (treated as CHANGED)
index 2: C -> A (treated as CHANGED)
  ← 3 "changes" for what is really just a rotation — worst case, loses element identity

=== Diff: Keyed List Reorder (the correct way) ===
[A, B, C] -> [B, C, A] compared by KEY
A: moved, not recreated
B: moved, not recreated
C: moved, not recreated
  ← 0 elements recreated — only DOM positions changed, identity preserved
```

---

## Mental Model: Where This Shows Up

| This lab | React equivalent |
|---|---|
| `h(tag, props, children)` | `React.createElement` (what JSX compiles down to) |
| `mount()` | React's initial render |
| `patch()` | React's reconciliation — "diffing" |
| Keyed list diffing | React's `key` prop requirement on list items |
| Same-tag patch-in-place preserving DOM identity | Why a focused `<input>` in a React list survives a re-render, unlike LAB-29's raw approach |

**Module 2 (Framework Concepts) complete.** You've now built, from scratch, the four pillars every modern frontend framework rests on: **reactivity** (LAB-32), **components** (LAB-33), **state management** (LAB-34), and a **rendering/diffing pipeline** (LAB-35–36). React, Vue, SolidJS, and Svelte each make different trade-offs among these four pillars — but you now understand EXACTLY what problem each one is solving, because you built a working, if minimal, version of the solution yourself first.

**Where you will see this again:** Module 3's mini-projects (LAB-37 onward) put all four pillars to work together on real, substantial UIs.

---

## Final Check

| Feature | How to verify |
|---|---|
| `h()` produces a plain object tree, no real DOM created | Step 1 |
| `mount()` correctly converts a vnode tree into real, visible DOM | Step 2 |
| A text-only change patches with exactly ONE DOM operation | Step 3 |
| A tag change is detected and handled as a REPLACE, not a patch | Step 3 |
| Unkeyed list diffing treats a rotation as N changes | Challenge |
| Keyed list diffing correctly recognizes a rotation as 0 recreations | Challenge |
| You can explain, without notes, why using array index as a React key defeats keyed diffing | Challenge's key insight |

---

## Quick Check Answers

**1. Ideal cost for a one-character text edit?**

A SINGLE `textContent` (or even more granularly, a single character) update to exactly the ONE text node that changed — demonstrated directly in Step 3, where `patch()` correctly identified a text change and applied `realNode.textContent = newVNode` as its ONLY DOM operation, instead of LAB-29's O(n) full-list rebuild for the same one-character change.

**2. Why is comparing two vnode trees cheaper than comparing two real DOM trees?**

A vnode is a PLAIN JAVASCRIPT OBJECT (`{ tag, props, children }`) with none of the real DOM's internal machinery — no layout computation, no style resolution, no live event listener bookkeeping, no browser-internal rendering state. Comparing two plain objects (checking if `tag` strings match, iterating a `children` array) is ordinary, cheap JavaScript object traversal — LAB-06's tree comparison, essentially — while comparing real DOM nodes would mean querying and comparing actual browser-managed state, which is far more expensive to inspect and touch.

**3. `[A, B, C]` → `[B, C, A]` — position-based vs. identity-based diffing?**

Position-based diffing (comparing index 0 to index 0, etc.) sees THREE changes — every single slot's item is different from what it used to hold at that position, demonstrated in the Challenge's unkeyed output. Identity-based (keyed) diffing sees ZERO recreations — it recognizes that `A`, `B`, and `C` are the SAME underlying items, just at different POSITIONS now, and only needs to reposition them in the real DOM, never destroying and recreating their actual elements — which is exactly why a keyed, reordered list preserves things like input focus or CSS transition state that a position-based diff would lose.

---

*Module 2 (Framework Concepts) complete. Next: [LAB-37 — Reactive Spreadsheet](../module-03-mini-projects/LAB-37-reactive-spreadsheet.md) — TypeScript (Browser), Module 3 begins*
