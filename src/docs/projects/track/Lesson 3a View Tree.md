# Lesson 3a: The View Tree

**What you will build:** No new code — a real Android layout example,
read directly. Nothing here compiles with plain `javac`.

**What you need to know first:** Lesson 2g's XML.

**Terms introduced in this lesson:**

- **View tree** — every Android screen is a tree of nested `View`
  objects, each one's size and position defined relative to its parent
  and siblings, never as an absolute pixel coordinate.

---

## Concept Unit: The View Tree

### The Problem

A screen full of visible elements needs some way to describe where
each one goes, relative to everything else — a plain, flat list of
absolute pixel coordinates would break the instant the same layout ran
on a different-sized screen, since nothing about it describes
*relationships* between elements, only fixed positions.

### Introduce the Concept in Isolation

A layout XML fragment, verified against the real Android layout schema:

```xml
<LinearLayout>
    <TextView android:text="Item Name" />
    <TextView android:text="Quantity" />
</LinearLayout>
```

This is a `view tree` — **first appearance**: every Android screen is a
tree of nested `View` objects, each one's size and position defined
relative to its parent and siblings, never as an absolute pixel
coordinate. The two `TextView` elements are children of `LinearLayout`;
neither declares an x/y coordinate anywhere — their position is
entirely determined by their place in this nested structure and the
layout rules their parent applies.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
layout XML.

### Mechanical Walkthrough

1. `<LinearLayout> ... </LinearLayout>` — **(b) reappearing** XML
   nesting shape from Lesson 2g, here specifically describing a UI
   structure rather than a Manifest or resource file.
2. `<TextView android:text="Item Name" />` and a second `TextView` —
   two children, nested inside `LinearLayout`, each positioned
   relative to the other by virtue of ordering and their parent's own
   layout behavior, never by any coordinate either one declares itself.

### CS Lens

A view tree is a real, concrete application of the general tree data
structure: `LinearLayout` is a parent node, the two `TextView`
elements are its children, and every visible element's actual
on-screen position is computed by walking this tree, applying each
parent's own layout rules recursively — never read directly off any
one element's own declaration.

Also recognized in: the DOM tree in a web browser (an almost identical
nested-element shape, also positioned relative to parent and siblings,
not absolute coordinates by default), any UI framework's own widget
hierarchy generally.

### SE Lens

The alternative — describing a screen as absolute x/y coordinates,
like drawing on a canvas — was not chosen because it would break the
moment screen size or orientation changed; a nested, relationship-based
structure is what lets the identical layout XML work correctly across
genuinely different screen sizes without being rewritten per device.

---

## Connect the Pieces

`<LinearLayout>`'s own nested `TextView` children establish position
purely through relationship, never absolute coordinates. The next
lesson (Constraint Satisfaction Layout) shows a more precise mechanism
for expressing exactly what those relationships should be.

## What Breaks Without This

Imagine describing this same screen as a flat list of absolute pixel
coordinates instead — on a differently-sized screen, every single
coordinate would need manual recalculation, since nothing in that
description expresses "this element sits below that one," only fixed
positions that happen to work for one specific screen size.

## Exercises

1. Add a third `TextView` to the tree and explain, in your own words,
   where it would appear relative to the existing two.
2. Explain, in your own words, why neither `TextView` declares an x/y
   coordinate.
3. Compare this view tree structure to a filesystem's own folder
   structure — name one similarity.

## Definition of Done

- [ ] You read the view-tree example and can explain why neither
      `TextView` declares an x/y coordinate.
- [ ] You completed Exercise 1 and Exercise 3.
- [ ] You can state, without looking back at this lesson, what
      determines a view's position in a view tree.
