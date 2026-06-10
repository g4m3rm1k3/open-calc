# Junior to Senior — T12·L11 — Visual Hierarchy

**Prerequisites:** T12·L10 (Positioning). You can control layout with Flexbox, Grid,
and positioning. This lesson teaches visual hierarchy — how the eye naturally scans a
page, and the five CSS properties you control to guide it: size, weight, colour, space,
and contrast.

**What this lab adds:**
- What visual hierarchy is and why it matters before any other design decision
- How size creates dominance
- How weight (`font-weight`) creates emphasis without colour
- How colour draws attention (and how it can mislead)
- How space separates groups and creates belonging
- How contrast defines readability and importance
- Building a card that communicates hierarchy through CSS alone

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a page with a heading, a body paragraph, and a button. The user should read
>    the heading first, then the paragraph, then notice the button as the action. Name
>    three CSS properties that can encode this reading order without any JavaScript.
> 2. Two pieces of text are the same size and the same color. One is `font-weight: 400`,
>    the other is `font-weight: 700`. The heavier one draws the eye first. Why?
> 3. A page has eight different font sizes. A designer calls it "visually noisy."
>    What specific measurement system would fix this?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You lay out a card with a title, a description, a price, and a button. Everything looks the
same weight, the same size, the same shade of gray. It is readable, but it is flat —
there is no visual story. The user's eye does not know where to start or what is important.

Visual hierarchy is the solution. It is not decoration. It is communication. The CSS
you write must tell the user what to look at first.

---

## Step 1 — See a Flat Layout

Create `hierarchy.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Visual Hierarchy</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
      --space-5: 1.5rem; --space-6: 2rem;
    }

    body { font-family: sans-serif; max-width: 400px; margin: 60px auto; padding: 0 var(--space-4); }
  </style>
</head>
<body>
  <!-- Flat card — no hierarchy -->
  <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: var(--space-5);">
    <div>CNC Toolpath Generator</div>
    <div>Calculates optimal cutting paths for 2.5-axis machining operations.</div>
    <div>$299 / year</div>
    <div>Get Started</div>
  </div>
</body>
</html>
```

### CSS AND SEE

**You should see:** Four identical lines of text in a card. They all look the same.
There is no indication of which is the product name, which is the description, which is the
price, and which is the call to action. No visual story.

Now build it correctly — one property at a time.

---

## Concept: Size Creates Dominance

**What it is:** Larger elements attract the eye first. This is physiological — the visual
system allocates more processing to larger objects as potential threats or opportunities.

**In CSS:** `font-size` and element `width`/`height` are the primary size controls.
A heading at `2rem` dominates a paragraph at `1rem`. The user reads the larger thing first.

**The principle:** The most important element should be the largest. The least important
should be the smallest. Size is the strongest hierarchy signal.

**What to watch for:**

Equal sizes communicate equal importance. If your product name and your legal disclaimer
are the same size, you have told the user they are equally important — which is wrong.

---

## Step 2 — Apply Size Hierarchy

```html
<!-- Updated card — replace the previous card -->
<div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: var(--space-5);">
  <div style="font-size: 1.25rem; margin-bottom: var(--space-2);">CNC Toolpath Generator</div>
  <div style="font-size: 0.9rem; margin-bottom: var(--space-4);">Calculates optimal cutting paths for 2.5-axis machining operations.</div>
  <div style="font-size: 1.5rem; margin-bottom: var(--space-4);">$299 / year</div>
  <div>Get Started</div>
</div>
```

### CSS AND SEE

**You should see:** A clearer reading order emerging. The price at `1.5rem` is now the
largest element — but that might not be what we want. A product's name should dominate.
The hierarchy tells the story: price is the most important element right now. Is that
the intended message?

**This is the design insight:** Before writing CSS, decide what the user should read first.
The CSS must encode that decision.

---

## Concept: Weight and Contrast Create Emphasis

**What it is:** `font-weight: 700` (bold) draws the eye more than `font-weight: 400`
(regular) at the same size. This is because bold text has more ink per line — higher visual
contrast with the background.

**Why this matters alongside size:**

- A large, light (weight 300) heading can feel less important than a smaller, bold (weight 700) stat number.
- Use weight to differentiate elements that are the same size: a label (`font-weight: 500`, `color: #888`) next to a value (`font-weight: 700`, `color: #1a1a1a`)

**Colour contrast** also creates emphasis:
- Dark text on a white background: maximum contrast, maximum attention
- Light gray text on white (`color: #999`): low contrast, secondary information
- Colour (cornflowerblue, red) draws the eye even more strongly than weight

**The three-level text hierarchy:**

```
Primary   — large, heavy, dark:        heading, key number, CTA button label
Secondary — medium, regular, dark:     body text, descriptions
Tertiary  — small, regular, muted:     captions, metadata, timestamps
```

**You will see this again in:**
- Every design system has primary/secondary/tertiary text colour tokens
- Tailwind: `text-gray-900` (primary), `text-gray-600` (secondary), `text-gray-400` (tertiary)
- T12·L13 (Design Tokens): semantic text tokens encode these roles

---

## Step 3 — Apply Weight and Colour

Update the card:

```html
<div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: var(--space-5);">

  <!-- Primary: large, bold, dark -->
  <h3 style="
    font-size: 1.125rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 var(--space-2);
  ">CNC Toolpath Generator</h3>

  <!-- Tertiary: small, regular, muted -->
  <p style="
    font-size: 0.875rem;
    font-weight: 400;
    color: #666;
    margin: 0 0 var(--space-4);
    line-height: 1.5;
  ">Calculates optimal cutting paths for 2.5-axis machining operations.</p>

  <!-- Secondary: medium, emphasized, dark — the price is important -->
  <div style="
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: var(--space-1);
  ">$299</div>
  <div style="
    font-size: 0.75rem;
    color: #888;
    margin-bottom: var(--space-4);
  ">per year, billed annually</div>

  <!-- CTA button — colour draws action -->
  <button style="
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: cornflowerblue;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  ">Get Started</button>

</div>
```

### CSS AND SEE

**You should see:** A clear hierarchy. The eye goes:
1. **"CNC Toolpath Generator"** — largest visible heading (size + weight)
2. **"$299"** — bold and large (the important decision information)
3. **"Get Started"** — coloured button demands action
4. The description and "per year" are secondary — smaller, lighter, muted

This is the correct hierarchy for a pricing card. The message is: here is the product name,
here is the cost, here is how to proceed.

---

## Concept: Space Communicates Belonging

**What it is:** Elements close together are perceived as a group. Elements far apart are
perceived as separate. This is Gestalt's Law of Proximity — one of the most reliable
principles of visual perception.

**In CSS:** `margin` and `gap` control proximity. Elements with tight spacing belong to
the same group. Larger spacing separates groups.

**The rule for cards:**

```
Product name
Description              ← tight spacing: these belong together

Price
Per-year label           ← tighter: these are one thing (price + qualifier)

[CTA Button]             ← separate: action is distinct from information
```

**What to watch for:** When everything has the same spacing, everything looks equally
related. Vary the spacing intentionally: use `--space-2` for related elements and
`--space-5` or more for section breaks.

**You will see this again in:**
- Form design (T12·L18): labels are close to their input (belong together);
  groups of fields have more space between them (distinct sections)
- Navigation (T12·L19): related links cluster together; major sections are separated

---

## Step 4 — Space Communicates Groups

Add a second card that demonstrates spacing failures vs correct spacing:

```html
<h2 style="margin-top: var(--space-6);">Spacing comparison:</h2>   <!-- ← add -->

<!-- Bad spacing: everything equal -->
<div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: var(--space-5); margin-bottom: var(--space-4);">
  <p style="margin: 8px 0; font-weight: 700;">Product Name</p>
  <p style="margin: 8px 0; color: #666; font-size: 0.875rem;">Description text here.</p>
  <p style="margin: 8px 0; font-size: 1.25rem; font-weight: 700;">$99</p>
  <p style="margin: 8px 0; font-size: 0.75rem; color: #888;">per month</p>
  <button style="margin: 8px 0; padding: 8px 16px; background: cornflowerblue; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Buy Now</button>
</div>

<!-- Good spacing: groups communicate -->
<div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: var(--space-5);">
  <!-- Group: product identity -->
  <p style="margin: 0 0 var(--space-1); font-weight: 700;">Product Name</p>
  <p style="margin: 0 0 var(--space-5); color: #666; font-size: 0.875rem;">Description text here.</p>
  <!-- Group: pricing (tight) -->
  <p style="margin: 0 0 var(--space-1); font-size: 1.25rem; font-weight: 700;">$99</p>
  <p style="margin: 0 0 var(--space-5); font-size: 0.75rem; color: #888;">per month</p>
  <!-- Action: separated -->
  <button style="padding: 8px 16px; background: cornflowerblue; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Buy Now</button>
</div>
```

### CSS AND SEE

**You should see:** Both cards have the same information but the bottom card communicates
clearer groups. The product name and description belong together. The price and qualifier
belong together. The button is separated — it is an action, not information.

---

## 🎯 Challenge: Redesign a Flat Card

**Starting point:**

```html
<div style="background: white; padding: 20px; border: 1px solid #ccc;">
  <div>Status: Running</div>
  <div>Job ID: job-1742</div>
  <div>Started: 2 minutes ago</div>
  <div>Progress: 67%</div>
  <div>ETA: ~45 seconds</div>
  <div>Cancel</div>
</div>
```

**Requirements:**
1. "Progress: 67%" should be the most visually dominant element
2. "Job ID" and "Status: Running" should read as a group (title area)
3. "Started" and "ETA" are secondary metadata — muted, smaller
4. "Cancel" should look like a danger action (red outline button or text, not solid)
5. A visual progress bar (just a coloured bar, no JavaScript — use `width: 67%`)
6. Apply your full hierarchy toolkit: size, weight, colour, space, contrast

---

<details>
<summary>▶ Show Solution</summary>

```html
<div style="
  background: white;
  padding: var(--space-5);
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 360px;
">
  <!-- Title group: Job ID + Status -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
    <span style="font-weight: 600; color: #1a1a1a;">Job #1742</span>
    <span style="
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 99px;
    ">● Running</span>
  </div>

  <!-- Progress — dominant: large number + bar -->
  <div style="font-size: 2rem; font-weight: 700; color: #1a1a1a; margin-bottom: var(--space-2);">67%</div>
  <div style="background: #eee; border-radius: 99px; height: 8px; margin-bottom: var(--space-4); overflow: hidden;">
    <div style="width: 67%; height: 100%; background: cornflowerblue; border-radius: 99px;"></div>
  </div>

  <!-- Metadata: secondary -->
  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #888; margin-bottom: var(--space-5);">
    <span>Started 2 min ago</span>
    <span>~45s remaining</span>
  </div>

  <!-- Action: danger, separated -->
  <button style="
    width: 100%;
    padding: var(--space-2) var(--space-4);
    background: transparent;
    color: #c0392b;
    border: 1px solid #c0392b;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
  ">Cancel Job</button>
</div>
```

**Key insight:** The 67% is the most important information (the user wants to know how far
along the job is). Making it `2rem` bold immediately draws the eye there. The progress bar
reinforces it visually. The metadata (started/ETA) is small and muted because it is context,
not the primary concern. The cancel button uses a destructive style (red outline) that says
"this is available but be careful" — solid red would be too alarming for something the user
might accidentally click.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Size creates dominance | Heading is largest element; user reads it first |
| Weight creates emphasis | Bold `font-weight: 700` reads before regular at same size |
| Colour draws action | CTA button in accent colour stands out from all other elements |
| Muted text is secondary | Description in `#666` recedes vs dark heading |
| Spacing communicates groups | Price and qualifier have tight spacing; CTA has large margin-top |
| Progress bar | `width: 67%` coloured div inside a background track |

---

## Quick Check Answers

**1. Three CSS properties that encode reading order for heading → paragraph → button:**

`font-size` (heading is largest, draws eye first), `font-weight` (heading is bold, button is bold),
and `color` (button has accent colour, stands out from the text hierarchy).
Any three of: `font-size`, `font-weight`, `color`, `margin` (spacing to separate CTA), `background` (button fills).

**2. Why does heavier `font-weight` draw the eye before lighter, at the same size?**

Bold text has thicker strokes — more ink per line of text. This creates higher local contrast
against the background. The visual system is highly attuned to contrast edges (edges of shapes,
boundaries between light and dark). More contrast = more neural attention. Bold text provides
more edge contrast than light text, so the eye allocates more processing to it.

**3. Eight different font sizes — a "typographic scale" would fix it. What scale?**

A system where font sizes are multiples of a base unit — for example, a modular scale:
`0.75rem, 0.875rem, 1rem, 1.125rem, 1.25rem, 1.5rem, 1.875rem, 2.25rem`. Each step has a
consistent mathematical relationship (e.g., multiply by 1.25). With 8 arbitrary sizes,
each is an independent decision; with a scale, each is a named step in a system. The user's
eye perceives the ratios as intentional, not random. Tailwind uses this exact scale for its
font-size utilities.
