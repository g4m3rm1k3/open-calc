# FlowBoard Masterclass — LAB 04 — Card List Layout (and Two Critical Fixes)

**Prerequisites:** LAB-03 complete.

**What this lab adds:**
- Fix 1: readable card text when cards have white backgrounds
- Fix 2: cleaner component usage with spread props
- A proper list container for cards
- Flexbox column layout with consistent spacing

**Time:** 45–60 minutes

---

## What You Will Build

At the end of this lab, the page shows a clear vertical card list:
- White cards with dark readable text
- Cards rendered from data with a clean call site
- A list section with predictable spacing

---

## Concept: Inherited Text Color and Contrast

**What it is:** Text color inherits from ancestors unless you override it. If the page body uses light text and a child element has a white background, inherited light text can become low-contrast and hard to read.

**The problem before:**
- Global body text color is light
- Card background is white
- Card text inherits light color

This is why the card can look washed out or unreadable.

**The solution:** Set an explicit dark text color at the card level so card content does not depend on page-level text color.

**Why it matters here:** You are now mixing dark-page layout with light surface cards. Contrast must be controlled intentionally.

### Step 1 — Make Card Text Contrast Explicit

In flowbard/src/Card.css, update the card styles so the card surface has explicit text color.

Add this property to the .card rule:
- color: #1f2937;

Optional clarity styles:
- .card-title with darker weight/color
- .card-label with a muted but still readable color

### CSS AND SEE

Save.

You should see:
- White cards remain white
- Card text is now clearly readable

Change something:
- Temporarily set card color to #e0e0e0 and observe readability drop
- Restore dark card text color

---

## Concept: Verbose Props vs Spread Props

**What it is:** When a component accepts many fields from the same object, listing each prop at call sites becomes repetitive. Spread props pass all object fields in one expression.

**The problem before:**
- Every field is repeated at every Card usage
- If a field is added, many call sites may need edits

**The solution:** Use spread props for fields that already match the component contract.

Verbose form:
- Card id={card.id} title={card.title} label={card.label} description={card.description}

Spread form:
- Card key={card.id} {...card}

**Why key stays separate:** key is special to React list reconciliation and is not passed through as a normal prop.

### Step 2 — Replace Verbose Card Props with Spread Props

In flowbard/src/App.tsx, inside the cards map rendering, replace verbose field mapping with:
- Card key={card.id} {...card}

### SAVE AND TRY

Save.

You should see:
- Same UI output as before
- Cleaner map call site

Change something:
- Add a new field to one card object in data
- Confirm spread still passes it to Card if the Card contract includes it

---

## Concept: Correct Conditional Rendering for Optional Description

**What it is:** For optional JSX blocks, use logical AND. Nullish coalescing is for value fallback, not rendering control.

Incorrect pattern:
- props.description ?? paragraph element

Correct pattern:
- props.description && paragraph element

**Why:**
- AND renders the element only when description is truthy
- Nullish coalescing returns the left value when present, which can output raw text instead of your intended JSX wrapper

### Step 3 — Fix Description Rendering Rule

In flowbard/src/Card.tsx, ensure optional description uses logical AND rendering.

### SAVE AND TRY

Save.

You should see:
- Description appears only for cards that have one
- Description is wrapped by the intended paragraph element

Change something:
- Remove description from one card object and verify no empty paragraph renders

---

## Concept: List Container as a First-Class Component

**What it is:** A list of cards should be wrapped in a dedicated list container so spacing and layout are controlled in one place, not distributed across individual cards.

**The problem before:** Margin on each card controls vertical gaps. This works for small demos but scales poorly.

**The solution:** Add a list wrapper element and control spacing with layout rules at the container level.

### Step 4 — Create a List Wrapper in App

In flowbard/src/App.tsx, wrap the map block in a container element, for example a div with class list-column.

Structure:
- app container
- heading elements
- list-column
- mapped Card components

### Step 5 — Style the List Wrapper with Flex Column and Gap

In flowbard/src/App.css, add list-column styles:
- display flex
- flex-direction column
- gap for vertical spacing
- margin-top to separate from header area

Then remove card-level margin-top from Card.css once spacing is controlled by the list container.

### CSS AND SEE

Save.

You should see:
- Consistent spacing between cards
- Layout control moved to the parent container
- Cleaner card styles with fewer layout responsibilities

---

## Challenge — Add a Second List Section

**Task:** Add a second list container below the first with a heading like Backlog and render a second array of cards.

**Goal:** Practice reusable layout without changing Card internals.

**Hint:** Reuse the same list-column class and map pattern.

---

## Final Check

- Card text remains readable on white backgrounds
- Card call site in map uses spread props
- Description rendering uses logical AND, not nullish fallback
- List spacing is controlled by parent container gap, not card margin
- Adding or removing cards only changes data arrays, not repeated JSX blocks

---

## End State Summary

**Files touched in this lab by the learner:**
- flowbard/src/Card.css
- flowbard/src/Card.tsx
- flowbard/src/App.tsx
- flowbard/src/App.css

**New concepts introduced:**
- CSS inheritance and contrast control on mixed light/dark surfaces
- Spread props for ergonomic component call sites
- Correct operator choice for optional JSX rendering
- Parent-controlled list layout with Flexbox gap

**What LAB-05 adds:**
- Dedicated List component file and typed list data structure
- Moving from one-page card list to board-like sections
