---
concept: 037-vertical-writing-layouts
name: Vertical Writing Layouts in CSS
category: Internationalization, Typography & Flow-Relative Layouts
difficulty: Intermediate to Advanced
tags: [css, writing-mode, text-orientation, text-combine-upright, logical-properties, internationalization, cjk, editorial-design, layout]
---

# 037: Vertical Writing Layouts in CSS

## Quick Reference Summary

**Name:** Vertical Writing Layouts  
**Category:** Internationalization, Typography & Flow-Relative Layouts  
**Difficulty:** 3/5  
**What it produces:** Robust, flow-relative vertical layout systems for East Asian typography (Japanese, Chinese, Korean, Mongolian), modern creative Western editorial layouts, space-efficient data table headers, book spine badges, side navigation rails, and data visualization axes without brittle CSS transforms (`transform: rotate(-90deg)`).  
**Why it works:** CSS Writing Modes Level 3 and 4 redefine the relationship between physical geometry (X/Y axes) and logical flow (Inline/Block axes). By applying `writing-mode: vertical-rl` or `vertical-lr`, the inline formatting context rotates 90 degrees, transforming horizontal text lines into vertical columns that naturally support line breaking, multi-line wrapping, vertical alignment, ruby annotations (`<ruby>`), Tate-chu-yoko (`text-combine-upright`), and CSS Logical Properties (`inline-size`, `block-size`).  
**Required CSS concepts:** `writing-mode`, `text-orientation`, `text-combine-upright`, CSS Logical Properties & Values, Flow-Relative Flexbox & Grid, Box Alignment Module Level 3, Stacking & Margin Collapsing in Vertical Block Flow.

### Quick HTML & CSS Snapshot

```html
<article class="vertical-editorial-card">
  <aside class="spine-rail">
    <span class="issue-number">VOL.<span class="tcy">42</span></span>
    <span class="category-tag">ARCHITECTURE</span>
  </aside>
  <div class="content-body">
    <h2>Vertical Space & Modern Grid Systems</h2>
    <p>Exploring fluid layout transformations using native CSS writing modes.</p>
  </div>
</article>
```

```css
.vertical-editorial-card {
  display: flex;
  background: #12141a;
  border-radius: 12px;
  overflow: hidden;
  color: #f1f5f9;
}

.spine-rail {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 1.5rem;
  padding-inline: 0.75rem;
  background: #1e2230;
  border-inline-end: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: 0.15em;
  font-weight: 700;
}

/* Tate-chu-yoko: Keep 2-digit number upright */
.tcy {
  text-combine-upright: digits 2;
}

.content-body {
  padding: 1.5rem;
}
```

---

## 0. PREAMBLE: Context & Prerequisites

### 0.1 Prerequisites
Before working with CSS writing modes, developers should understand:
* **The Box Model & Formatting Contexts:** Inline Formatting Contexts (IFC) and Block Formatting Contexts (BFC).
* **CSS Logical Properties:** The shift from physical dimensions (`width`, `height`, `top`, `bottom`, `left`, `right`) to flow-relative dimensions (`inline-size`, `block-size`, `inset-block`, `inset-inline`).
* **Flexbox & Grid Alignment:** How `justify-content` and `align-items` operate along the main and cross axes.

### 0.2 Learning Dependencies
* ✓ CSS Writing Modes Level 3 & Level 4 Specification
* ✓ CSS Logical Properties and Values Level 1
* ✓ CSS Box Alignment Module Level 3
* ✓ OpenType Vertical Metrics (`vert`, `vmtx`, `vrt2`)

### 0.3 Specification References
* **W3C Writing Modes:** [CSS Writing Modes Level 3](https://www.w3.org/TR/css-writing-modes-3/) & [Level 4](https://www.w3.org/TR/css-writing-modes-4/)
* **W3C Logical Properties:** [CSS Logical Properties and Values Level 1](https://www.w3.org/TR/css-logical-1/)
* **W3C Ruby Layout:** [CSS Ruby Layout Module Level 1](https://www.w3.org/TR/css-ruby-1/)

---

## 1. Mental Model: Physical vs. Logical Flow

### The Coordinate Transformation

In default horizontal text (`writing-mode: horizontal-tb`), lines flow from **left to right** along the horizontal X-axis, and blocks stack from **top to bottom** along the vertical Y-axis.

When switching to a vertical writing mode (`writing-mode: vertical-rl` or `vertical-lr`), the **inline axis** and **block axis** swap physical orientations:

```text
=============================================================================
1. DEFAULT HORIZONTAL (horizontal-tb)
=============================================================================
  Inline Axis (Horizontal X: Left -> Right) -------------->
+---------------------------------------------------------+ | Block Axis
| Line 1: The quick brown fox jumps over the lazy dog.    | | (Vertical Y:
| Line 2: Paragraph text flows left to right.             | |  Top -> Bottom)
| Line 3: New lines stack downward.                       | v
+---------------------------------------------------------+

=============================================================================
2. VERTICAL RIGHT-TO-LEFT (vertical-rl) - Traditional CJK & Editorial
=============================================================================
  <----------------- Block Axis (Horizontal -X: Right -> Left)
+---------------------------------------------------------+
| Line 3  | Line 2  | Line 1                              | | Inline Axis
|         |         |                                     | | (Vertical Y:
| N       | P       | T                                   | |  Top -> Bottom)
| e       | a       | h                                   | v
| w       | r       | e                                   |
|         | a       |                                     |
| l       | g       | q                                   |
| i       | r       | u                                   |
| n       | a       | i                                   |
| e       | p       | c                                   |
| s       | h       | k                                   |
+---------------------------------------------------------+

=============================================================================
3. VERTICAL LEFT-TO-RIGHT (vertical-lr) - Mongolian / Western Left Rails
=============================================================================
  Block Axis (Horizontal +X: Left -> Right) ----------------->
+---------------------------------------------------------+
| Line 1  | Line 2  | Line 3                              | | Inline Axis
|         |         |                                     | | (Vertical Y:
| T       | P       | N                                   | |  Top -> Bottom)
| h       | a       | e                                   | v
| e       | r       | w                                   |
|         | a       |                                     |
| q       | g       | l                                   |
| u       | r       | i                                   |
| i       | a       | n                                   |
| c       | p       | e                                   |
| k       | h       | s                                   |
+---------------------------------------------------------+
```

### Why `writing-mode` Beats `transform: rotate(-90deg)`

Developers frequently use CSS `transform: rotate(-90deg)` to orient text vertically. However, transforms have severe structural limitations compared to native writing modes:

| Feature | `transform: rotate(-90deg)` | `writing-mode: vertical-*` |
| :--- | :--- | :--- |
| **Document Layout Impact** | ❌ None (Original bounding box is preserved; requires hardcoded sizing and margins). | ✅ Native (Container dimensions, intrinsic sizing, and sibling flow calculate automatically). |
| **Multi-Line Text Wrapping** | ❌ Broken (Text wraps horizontally inside the original box before rotation). | ✅ Native (Text flows down vertically and wraps to next vertical column). |
| **Text Selection & Caret** | ❌ Rotated / Disoriented cursor movement. | ✅ Natural, intuitive vertical cursor navigation and text highlighting. |
| **Intrinsic Sizing (`min-content`)** | ❌ Sized against the unrotated horizontal bounding box. | ✅ Accurately computes vertical height and column width. |
| **CJK Typography & Mixed Scripts** | ❌ All characters rotated uniformly by 90°. | ✅ Mixed orientation: Kanji/Kana stay upright, Latin characters rotate or stack cleanly. |
| **Tate-chu-yoko & Ruby Support** | ❌ Impossible without complex manual inline-block hacks. | ✅ Native via `text-combine-upright` and `<ruby>`. |

---

## 2. Core CSS Properties in Depth

### 2.1 `writing-mode`

The `writing-mode` property defines whether lines of text are laid out horizontally or vertically, and the direction in which blocks progress.

```css
/* Syntax */
.element {
  writing-mode: horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr;
}
```

* **`horizontal-tb`** (Default): Top-to-bottom block progression, horizontal text lines.
* **`vertical-rl`**: Vertical lines running top-to-bottom. Blocks/lines progress from **right to left** (Standard for Japanese, Traditional Chinese, Korean literature, poetry, and right-aligned UI rails).
* **`vertical-lr`**: Vertical lines running top-to-bottom. Blocks/lines progress from **left to right** (Standard for Mongolian, Manchu, Phags-pa, and left-aligned UI rails).
* **`sideways-rl`**: Entire text runs vertically top-to-bottom with all characters rotated 90° clockwise. Blocks progress right-to-left.
* **`sideways-lr`**: Entire text runs vertically bottom-to-top with all characters rotated 90° counter-clockwise. Blocks progress left-to-right.

---

### 2.2 `text-orientation`

When `writing-mode` is vertical, `text-orientation` controls how individual glyphs are oriented within the vertical line.

```css
/* Syntax (Only applies when writing-mode is vertical) */
.element {
  writing-mode: vertical-rl;
  text-orientation: mixed | upright | sideways;
}
```

```text
+-----------------------+-----------------------+-----------------------+
| text-orientation:     | text-orientation:     | text-orientation:     |
| mixed (Default)       | upright               | sideways              |
+-----------------------+-----------------------+-----------------------+
|   東  (Upright CJK)    |   東  (Upright CJK)    |   [東 rotated 90°]    |
|   京  (Upright CJK)    |   京  (Upright CJK)    |   [京 rotated 90°]    |
|   2   (Rotated 90°)   |   2   (Upright digit) |   [2  rotated 90°]    |
|   0   (Rotated 90°)   |   0   (Upright digit) |   [0  rotated 90°]    |
|   2   (Rotated 90°)   |   2   (Upright digit) |   [2  rotated 90°]    |
|   6   (Rotated 90°)   |   6   (Upright digit) |   [6  rotated 90°]    |
|   U   (Rotated 90°)   |   U   (Upright Latin) |   [U  rotated 90°]    |
|   I   (Rotated 90°)   |   I   (Upright Latin) |   [I  rotated 90°]    |
+-----------------------+-----------------------+-----------------------+
```

1. **`mixed`** (Default):
   * Glyphs from horizontal scripts (Latin, Cyrillic, Greek, Arabic) and numbers rotate 90° clockwise.
   * Glyphs from vertical scripts (CJK ideographs, Kana, Hangul, punctuation) remain upright.
2. **`upright`**:
   * **All** glyphs (including Latin characters and numbers) are rendered upright, stacked one beneath the other.
   * Ideal for acronyms (e.g., `NASA`, `CSS`, `API`), badge tags, and decorative Western typographic columns.
3. **`sideways`**:
   * All glyphs (both CJK and Latin) are rotated 90° clockwise.

---

### 2.3 `text-combine-upright` (Tate-chu-yoko / 縦中横)

In East Asian vertical typesetting, short sequences of horizontal characters (such as 2-digit numbers, year abbreviations, or acronyms like "No.") are typeset horizontally inside the space of a single vertical character cell. This is known as **Tate-chu-yoko** (縦中横).

```css
/* Syntax */
.tcy {
  text-combine-upright: none | all | digits 2 | digits 3 | digits 4;
  -webkit-text-combine: horizontal; /* Legacy WebKit support */
}
```

```html
<p class="vertical-text">
  令和<span class="tcy">06</span>年<span class="tcy">12</span>月<span class="tcy">25</span>日
</p>
```

```text
Without Tate-chu-yoko:          With Tate-chu-yoko:
       令                              令
       和                              和
       0  (stacked)                   [06] (combined into single square)
       6                               年
       年                             [12] (combined into single square)
       1                               月
       2                              [25] (combined into single square)
       月                              日
```

---

### 2.4 Logical Properties Mapping Matrix

When using vertical writing modes, **always use CSS Logical Properties** rather than physical properties (`width`, `height`, `margin-top`, etc.) to build maintainable layouts that adapt across writing directions.

| Physical Property | `horizontal-tb` Equivalent | `vertical-rl` Equivalent | `vertical-lr` Equivalent |
| :--- | :--- | :--- | :--- |
| **`width`** | `inline-size` | `block-size` | `block-size` |
| **`height`** | `block-size` | `inline-size` | `inline-size` |
| **`min-width` / `max-width`** | `min/max-inline-size` | `min/max-block-size` | `min/max-block-size` |
| **`min-height` / `max-height`** | `min/max-block-size` | `min/max-inline-size` | `min/max-inline-size` |
| **`margin-top`** | `margin-block-start` | `margin-inline-start` | `margin-inline-start` |
| **`margin-bottom`** | `margin-block-end` | `margin-inline-end` | `margin-inline-end` |
| **`margin-left`** | `margin-inline-start` | `margin-block-end` | `margin-block-start` |
| **`margin-right`** | `margin-inline-end` | `margin-block-start` | `margin-block-end` |
| **`padding-inline`** | `padding-left & right` | `padding-top & bottom` | `padding-top & bottom` |
| **`padding-block`** | `padding-top & bottom` | `padding-left & right` | `padding-left & right` |
| **`border-inline-start`** | Left border | Top border | Top border |
| **`border-block-start`** | Top border | Right border | Left border |
| **`top: 0`** | `inset-block-start: 0` | `inset-inline-start: 0` | `inset-inline-start: 0` |
| **`right: 0`** | `inset-inline-end: 0` | `inset-block-start: 0` | `inset-block-end: 0` |

---

### 2.5 Interactions with Flexbox and CSS Grid

#### Flexbox in Vertical Writing Modes
In a container with `writing-mode: vertical-rl` or `vertical-lr`:
* `flex-direction: row` lays out flex items along the **inline axis** (physically vertical, top to bottom).
* `flex-direction: column` lays out flex items along the **block axis** (physically horizontal, right to left in `vertical-rl`).
* `justify-content` aligns items along the inline axis (top-to-bottom).
* `align-items` aligns items along the block axis (cross-axis).

#### CSS Grid in Vertical Writing Modes
* `grid-template-columns` defines **block tracks** (horizontal track widths).
* `grid-template-rows` defines **inline tracks** (vertical track heights).
* Grid line `1` starts at the **top-right** corner in `vertical-rl` and at the **top-left** in `vertical-lr`.

---

## 3. Production-Ready Practical Layout Patterns

---

### Pattern 1: High-End Editorial Magazine Layout with Vertical Rail

A modern editorial layout pairing a sleek vertical metadata spine with fluid horizontal article content. The vertical rail automatically switches to standard horizontal orientation on mobile viewports.

```
+-------------------------------------------------------------------------------+
| EDITORIAL COVER                                                               |
+----+--------------------------------------------------------------------------+
| V  |                                                                          |
| O  |  THE ARCHITECTURE OF SILENCE                                             |
| L  |                                                                          |
| .  |  Exploring structural minimalism in high-density urban environments.    |
| 4  |                                                                          |
| 2  |  Modern skyscrapers and private residential sanctuaries utilize light,   |
|    |  acoustic baffles, and sustainable stone materials to construct living  |
| 2  |  zones free from ambient audio pollution.                                |
| 0  |                                                                          |
| 2  |  [ READ ARTICLE -> ]                                                     |
| 6  |                                                                          |
+----+--------------------------------------------------------------------------+
```

#### HTML
```html
<article class="magazine-feature">
  <!-- Vertical Metadata Rail -->
  <aside class="editorial-rail" aria-label="Article Metadata">
    <div class="rail-brand">ARCHITECTURAL REVIEW</div>
    <div class="rail-edition">
      <span class="edition-label">ISSUE</span>
      <span class="edition-num">42</span>
    </div>
    <time class="rail-date" datetime="2026-08-15">AUTUMN 2026</time>
  </aside>

  <!-- Main Article Body -->
  <div class="editorial-content">
    <header class="editorial-header">
      <span class="kicker">Urban Design & Acoustics</span>
      <h1 class="headline">The Architecture of Silence</h1>
      <p class="lead">
        Exploring structural minimalism, dynamic acoustic deflection, and monolithic stone forms in modern metropolitan living spaces.
      </p>
    </header>

    <div class="editorial-body">
      <p>
        As metropolitan density expands, ambient noise pollution has evolved from an incidental nuisance into a primary structural challenge. Contemporary architects are abandoning uniform glass façades in favor of sculptured limestone fins and flow-relative spatial geometries.
      </p>
    </div>

    <footer class="editorial-footer">
      <a href="#read" class="btn-read">Read Full Essay &rarr;</a>
    </footer>
  </div>
</article>
```

#### CSS
```css
/* Container Box */
.magazine-feature {
  display: flex;
  max-width: 960px;
  margin: 2rem auto;
  background: #0f141c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
  color: #e2e8f0;
}

/* Vertical Metadata Rail */
.editorial-rail {
  /* Activate Vertical Writing Mode */
  writing-mode: vertical-rl;
  text-orientation: mixed;
  
  display: flex;
  flex-direction: row; /* In vertical writing mode, row aligns vertically */
  justify-content: space-between;
  align-items: center;
  
  padding-block: 2rem;       /* Top & Bottom padding */
  padding-inline: 1rem;      /* Left & Right padding */
  background: #18202f;
  border-inline-end: 1px solid rgba(255, 255, 255, 0.1);
  
  font-family: "Cinzel", "Times New Roman", serif;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #94a3b8;
}

.rail-brand {
  font-weight: 700;
  color: #f8fafc;
}

.rail-edition {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #38bdf8;
}

.edition-num {
  /* Tate-chu-yoko: keep the 2-digit number 42 upright and compact */
  text-combine-upright: digits 2;
  -webkit-text-combine: horizontal;
  font-weight: 800;
  color: #f8fafc;
}

.rail-date {
  color: #64748b;
}

/* Main Article Content */
.editorial-content {
  flex: 1;
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.kicker {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #38bdf8;
  margin-bottom: 0.75rem;
}

.headline {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  margin: 0 0 1.25rem 0;
}

.lead {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.editorial-body p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #94a3b8;
  margin: 0;
}

.editorial-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-read {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #38bdf8;
  color: #0f172a;
  text-decoration: none;
  font-weight: 700;
  border-radius: 8px;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.btn-read:hover {
  background: #7dd3fc;
  transform: translateX(4px);
}

/* Responsive Fallback: Reset to horizontal on mobile devices */
@media (max-width: 640px) {
  .magazine-feature {
    flex-direction: column;
  }
  
  .editorial-rail {
    writing-mode: horizontal-tb;
    flex-direction: row;
    padding-block: 0.75rem;
    padding-inline: 1.25rem;
    border-inline-end: none;
    border-block-end: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .editorial-content {
    padding: 1.5rem;
  }
  
  .headline {
    font-size: 1.75rem;
  }
}
```

---

### Pattern 2: Authentic East Asian (CJK) Poetry & Prose Reader

A traditional Japanese/Chinese literary layout featuring `writing-mode: vertical-rl`, `<ruby>` phonetic annotations (Furigana), Tate-chu-yoko for Western numbers, and smooth horizontal scrolling.

```
+-------------------------------------------------------------------------------+
| CJK LITERARY READER                                                           |
+-------------------------------------------------------------------------------+
|  (Scrolls Horizontally Right-to-Left <-------------------)                    |
|                                                                               |
|    三            二                    一                                     |
|                                                                               |
|    閑            春                    古                                     |
|    さ            眠                    池                                     |
|    や            暁                    や                                     |
|    岩            を                    蛙                                     |
|    に            覚                    飛                                     |
|    染            え                    び                                     |
|    み            ず                    こ                                     |
|    入                                  む                                     |
|    る            処                    水                                     |
|    蝉            処                    の                                     |
|    の            啼                    音                                     |
|    声            鳥                                                           |
|                  を                                                           |
|                  聞                                                           |
|                  く                                                           |
+-------------------------------------------------------------------------------+
```

#### HTML
```html
<section class="cjk-scroll-container">
  <div class="cjk-prose-wrapper" lang="ja">
    <!-- Chapter Header -->
    <header class="cjk-header">
      <span class="chapter-badge">第<span class="tcy">01</span>章</span>
      <h1 class="cjk-title">風の又三郎</h1>
      <span class="author-name">宮沢 賢治</span>
    </header>

    <!-- Vertical Body Paragraphs -->
    <div class="cjk-text-columns">
      <p class="cjk-paragraph">
        どっどど　どどうど　どどうど　どどう、青いくるみも吹きとばせ、すっぱいかりんも吹きとばせ、どっどど　どどうど　どどうど　どどう。
      </p>
      <p class="cjk-paragraph">
        谷川の岸の小さな学校に、学校の<ruby>宿直室<rt>しゅくちょくしつ</rt></ruby>の前の<ruby>桑<rt>くわ</rt></ruby>の木の下に、風が強く吹いて参りました。
      </p>
      <p class="cjk-paragraph">
        九月<span class="tcy">01</span>日の朝、教室には新しい生徒が一人入って居りました。黒い洋服を着て、赤い髪の毛をした、見たこともない奇妙な子供でございました。
      </p>
      <p class="cjk-paragraph">
        子供たちはみんな机によりかかって、だまってその子供を見て居りました。風は運動場のすみの栗の木をゆすぶり、ガラス戸をがたがた言わせました。
      </p>
    </div>
  </div>
</section>
```

#### CSS
```css
/* Scrollport Container */
.cjk-scroll-container {
  width: 100%;
  max-width: 900px;
  margin: 2rem auto;
  background: #fdfbf7; /* Traditional Washi paper tone */
  border: 1px solid #e7e0d3;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(44, 30, 15, 0.08);
  overflow-x: auto;
  overflow-y: hidden;
  /* Ensure horizontal scrollbars are styled cleanly */
  scrollbar-width: thin;
  scrollbar-color: #d1c7b7 #fdfbf7;
}

/* Vertical Prose Wrapper */
.cjk-prose-wrapper {
  /* Set Vertical Right-to-Left Writing Mode */
  writing-mode: vertical-rl;
  text-orientation: mixed;
  
  /* Logical Block Height constraint determines how long vertical lines run */
  block-size: auto;
  inline-size: 400px; /* Physical height of the vertical line columns */
  
  padding-block: 2.5rem;   /* Horizontal padding in vertical-rl */
  padding-inline: 2.5rem;  /* Vertical top/bottom padding in vertical-rl */
  
  font-family: "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif CJK JP", "Songti SC", serif;
  color: #2b2520;
  line-height: 2.1;
  letter-spacing: 0.12em;
  font-size: 1.05rem;
}

/* Chapter Header */
.cjk-header {
  margin-inline-end: 2.5rem; /* Margin to the left of the header column */
  border-inline-end: 1px solid #dcd3c4;
  padding-inline-end: 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.25rem;
}

.chapter-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8c2d19; /* Traditional vermilion seal color */
  border: 1px solid #8c2d19;
  padding-inline: 0.5rem;
  padding-block: 0.2rem;
  border-radius: 4px;
}

.cjk-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  color: #1a1614;
}

.author-name {
  font-size: 0.95rem;
  color: #6e645a;
  margin-block-start: auto; /* Pushes author name toward the bottom */
}

/* Text Paragraphs */
.cjk-text-columns {
  display: flex;
  flex-direction: column; /* Flows paragraphs right-to-left along the block axis */
  gap: 1.5rem;
}

.cjk-paragraph {
  margin: 0;
  text-indent: 1em; /* Standard East Asian paragraph indentation (1 full character) */
}

/* Ruby Annotations (Furigana) */
ruby {
  ruby-position: over; /* In vertical-rl, 'over' places ruby text to the right of the base glyph */
}

rt {
  font-size: 0.55em;
  color: #8c2d19;
  letter-spacing: 0;
}

/* Tate-chu-yoko for Western numbers */
.tcy {
  text-combine-upright: digits 2;
  -webkit-text-combine: horizontal;
}
```

---

### Pattern 3: Space-Efficient Data Table with Vertical Column Headers

In wide dashboard tables containing numerous boolean indicators, metrics, or checkbox columns, horizontal column headers force columns to be unnaturally wide. Applying vertical writing modes to table headers reduces table width by up to 70% while maintaining readability.

```
+------------------+----+----+----+----+----+----+-------------------+
| Feature Module   | A  | S  | G  | T  | R  | B  | Status            |
|                  | U  | S  | P  | E  | E  | A  |                   |
|                  | T  | L  | U  | S  | S  | C  |                   |
|                  | H  |    |    | T  | T  | K  |                   |
+------------------+----+----+----+----+----+----+-------------------+
| Auth Middleware  | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Active            |
| Realtime Sockets | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | Deploying         |
| WebAssembly Calc | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | Stable            |
+------------------+----+----+----+----+----+----+-------------------+
```

#### HTML
```html
<div class="table-container">
  <table class="compact-matrix-table">
    <thead>
      <tr>
        <th class="col-feature">Module Name</th>
        <th class="col-vertical"><span>Authentication</span></th>
        <th class="col-vertical"><span>SSL Encryption</span></th>
        <th class="col-vertical"><span>GPU Acceleration</span></th>
        <th class="col-vertical"><span>Telemetry</span></th>
        <th class="col-vertical"><span>REST API</span></th>
        <th class="col-vertical"><span>Backup Sync</span></th>
        <th class="col-status">Deployment Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="module-title">Edge Compute Gateway</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td><span class="badge active">Operational</span></td>
      </tr>
      <tr>
        <td class="module-title">Distributed Matrix Engine</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status neutral">&minus;</td>
        <td class="cell-status success">&check;</td>
        <td><span class="badge active">Operational</span></td>
      </tr>
      <tr>
        <td class="module-title">Session State Replicator</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status neutral">&minus;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status success">&check;</td>
        <td class="cell-status failure">&times;</td>
        <td><span class="badge warning">Degraded</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

#### CSS
```css
.table-container {
  max-width: 850px;
  margin: 2rem auto;
  background: #111827;
  border-radius: 12px;
  border: 1px solid #1f2937;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.compact-matrix-table {
  width: 100%;
  border-collapse: collapse;
  color: #e5e7eb;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;
}

.compact-matrix-table th,
.compact-matrix-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #1f2937;
}

.compact-matrix-table thead th {
  background: #1a2234;
  color: #9ca3af;
  font-weight: 600;
  vertical-align: bottom;
}

/* Vertical Table Column Headers */
.col-vertical {
  width: 48px;
  min-width: 48px;
  max-width: 48px;
  height: 140px; /* Gives room for vertical text height */
  padding: 0.75rem 0.25rem !important;
  text-align: center;
}

.col-vertical span {
  /* Apply Vertical Writing Mode */
  writing-mode: vertical-rl;
  text-orientation: mixed;
  
  /* Rotate 180deg so text reads upward from bottom to top (standard Western chart convention) */
  transform: rotate(180deg);
  
  display: inline-block;
  white-space: nowrap;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #cbd5e1;
}

.col-feature {
  text-align: left;
  font-weight: 700;
}

.module-title {
  font-weight: 600;
  color: #f3f4f6;
}

.cell-status {
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
}

.cell-status.success { color: #10b981; }
.cell-status.neutral { color: #6b7280; }
.cell-status.failure { color: #ef4444; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
```

---

### Pattern 4: Luxury Product Card with Vertical Taxonomy Spine

A high-fashion luxury product card where the brand taxonomy and product category run vertically down a stylized spine badge.

```
+----+-----------------------------------------------------+
|    |  +-----------------------------------------------+  |
| L  |  |                                               |  |
| I  |  |                 [PRODUCT IMAGE]               |  |
| M  |  |                                               |  |
| I  |  +-----------------------------------------------+  |
| T  |                                                     |
| E  |  MONOCHROME CHRONOGRAPH                            |
| D  |  Handcrafted titanium case with sapphire crystal.   |
|    |                                                     |
| E  |  $1,250 USD                         [ ADD TO CART ] |
| D  |                                                     |
+----+-----------------------------------------------------+
```

#### HTML
```html
<div class="product-card">
  <!-- Vertical Category Spine -->
  <div class="product-spine">
    <span class="spine-tag">LIMITED EDITION</span>
    <span class="spine-sku">SKU-<span class="tcy">09</span></span>
  </div>

  <!-- Product Main Details -->
  <div class="product-details">
    <div class="product-image-wrap">
      <div class="product-placeholder-graphic">
        <span class="watch-dial">⌚</span>
      </div>
    </div>
    
    <div class="product-info">
      <div class="category-kicker">Horology Collection</div>
      <h3 class="product-name">Monochrome Chronograph IV</h3>
      <p class="product-description">
        Precision engineered grade-5 titanium chassis with anti-reflective double-domed sapphire crystal.
      </p>
      
      <div class="product-action-row">
        <span class="price">$1,450 <span class="currency">USD</span></span>
        <button class="btn-purchase" type="button">Add to Bag</button>
      </div>
    </div>
  </div>
</div>
```

#### CSS
```css
.product-card {
  display: flex;
  max-width: 480px;
  margin: 2rem auto;
  background: #131722;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

/* Vertical Spine */
.product-spine {
  writing-mode: vertical-lr; /* Left-to-right vertical line flow */
  text-orientation: upright;  /* All letters stacked upright */
  
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  padding-block: 1.5rem;
  padding-inline: 0.65rem;
  background: linear-gradient(180deg, #1e2638 0%, #0d111a 100%);
  border-inline-end: 1px solid rgba(255, 255, 255, 0.06);
  
  font-family: monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: #38bdf8;
}

.spine-tag {
  color: #38bdf8;
}

.spine-sku {
  color: #64748b;
}

.spine-sku .tcy {
  text-combine-upright: digits 2;
}

/* Product Content */
.product-details {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.product-image-wrap {
  background: #1a202c;
  border-radius: 12px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.watch-dial {
  font-size: 4rem;
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.5));
}

.category-kicker {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.product-description {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #94a3b8;
  margin: 0 0 1.25rem 0;
}

.product-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #f8fafc;
}

.currency {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.btn-purchase {
  padding: 0.6rem 1.25rem;
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-purchase:hover {
  background: #7dd3fc;
}
```

---

### Pattern 5: Digital Audio Workstation (DAW) Channel Strip Layout

Hardware mixing consoles rely on vertical orientation for faders, meters, and channel labels. Using `writing-mode: vertical-rl`, we construct a high-performance audio mixer channel strip.

```
+-----------------------+
| MASTER BUS            |
+-----------------------+
| [M] [S] [REC]         |
+-----------------------+
| ||||||||||||||||||||| | <- Vertical Decibel Meter
| ||||||||||||||||||||| |
+----+------------------+
| D  |  [ ] +6 dB       |
| R  |  ---             |
| U  |  [#]  0 dB (Fader|
| M  |  ---             |
| S  |  [ ] -12 dB      |
+----+------------------+
| CH 01                 |
+-----------------------+
```

#### HTML
```html
<div class="daw-mixer-console">
  <!-- Channel 1 -->
  <div class="daw-channel-strip">
    <header class="channel-header">
      <span class="channel-num">01</span>
      <div class="channel-toggles">
        <button class="btn-toggle mute">M</button>
        <button class="btn-toggle solo">S</button>
      </div>
    </header>

    <div class="fader-section">
      <!-- Vertical Channel Name Rail -->
      <div class="channel-label-rail">
        <span class="channel-name">ANALOG DRUMS</span>
      </div>

      <!-- Vertical Slider Track -->
      <div class="fader-track">
        <div class="fader-scale">
          <span>+6</span>
          <span>0</span>
          <span>-6</span>
          <span>-18</span>
          <span>-inf</span>
        </div>
        <div class="fader-thumb-slider">
          <div class="fader-cap"></div>
        </div>
      </div>

      <!-- Meter -->
      <div class="level-meter">
        <div class="meter-bar active-level"></div>
      </div>
    </div>

    <footer class="channel-footer">
      <span class="pan-label">PAN: C</span>
    </footer>
  </div>
</div>
```

#### CSS
```css
.daw-mixer-console {
  display: flex;
  gap: 1rem;
  max-width: 320px;
  margin: 2rem auto;
  background: #11141d;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #1f2638;
}

.daw-channel-strip {
  flex: 1;
  background: #1a1f2c;
  border-radius: 8px;
  border: 1px solid #28324a;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  color: #cbd5e1;
  font-family: monospace;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #28324a;
}

.channel-num {
  font-weight: 700;
  color: #38bdf8;
}

.channel-toggles {
  display: flex;
  gap: 0.25rem;
}

.btn-toggle {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #94a3b8;
  font-size: 0.65rem;
  font-weight: bold;
  cursor: pointer;
}

.btn-toggle.mute:hover { background: #dc2626; color: #fff; }
.btn-toggle.solo:hover { background: #eab308; color: #000; }

.fader-section {
  display: flex;
  height: 220px;
  gap: 0.5rem;
  align-items: stretch;
  background: #121620;
  padding: 0.5rem;
  border-radius: 6px;
}

/* Vertical Channel Label Rail */
.channel-label-rail {
  writing-mode: vertical-rl;
  text-orientation: upright;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e2638;
  border-radius: 4px;
  padding-inline: 0.25rem;
  letter-spacing: 0.15em;
  font-size: 0.7rem;
  font-weight: bold;
  color: #38bdf8;
}

.fader-track {
  flex: 1;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
}

.fader-scale {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  font-size: 0.55rem;
  color: #64748b;
  margin-right: 0.25rem;
}

.fader-thumb-slider {
  width: 6px;
  height: 100%;
  background: #090c13;
  border-radius: 3px;
  position: relative;
}

.fader-cap {
  position: absolute;
  top: 35%; /* Set fader position at ~0dB */
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 14px;
  background: #e2e8f0;
  border-radius: 2px;
  border: 1px solid #94a3b8;
  box-shadow: 0 2px 5px rgba(0,0,0,0.8);
  cursor: grab;
}

.level-meter {
  width: 8px;
  height: 100%;
  background: #090c13;
  border-radius: 3px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.meter-bar.active-level {
  width: 100%;
  height: 68%;
  background: linear-gradient(to top, #10b981 0%, #eab308 80%, #ef4444 100%);
}

.channel-footer {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #28324a;
  text-align: center;
  font-size: 0.65rem;
  color: #94a3b8;
}
```

---

## 4. Edge Cases, Gotchas & Browser Quirks

### 4.1 Horizontal Scroll Direction in `vertical-rl`
In `writing-mode: vertical-rl`, the starting block boundary is at the **top-right** of the container.
* In standard-compliant browsers (Chromium, Firefox, Safari), the initial horizontal scroll position is `scrollLeft = 0` (or maximum right), and scrolling left moves into negative or increasing scroll offsets.
* When adding horizontal mousewheel interaction via JavaScript:
```javascript
const verticalScroller = document.querySelector('.cjk-scroll-container');
verticalScroller.addEventListener('wheel', (event) => {
  if (event.deltaY !== 0) {
    // In vertical-rl, scrolling down should translate to scrolling leftwards (into older content)
    event.preventDefault();
    verticalScroller.scrollLeft -= event.deltaY;
  }
}, { passive: false });
```

### 4.2 Margin Collapsing in Vertical Modes
In standard CSS, margin collapsing occurs along the **block axis**.
* In `horizontal-tb`: Top and bottom margins of adjacent block elements collapse.
* In `vertical-rl` and `vertical-lr`: Left and right margins (`margin-block-start` and `margin-block-end`) collapse along the horizontal block axis! Vertical top/bottom margins (`margin-inline-start/end`) **do not collapse**.

### 4.3 Form Controls & Interactive Inputs
Form inputs (`<input>`, `<select>`, `<button>`, `<textarea>`) have complex internal shadow DOM structures:
* Most browsers support `writing-mode: vertical-rl` on `<textarea>` and `<button>`.
* Single-line `<input type="text">` may behave inconsistently across legacy browsers if sized with physical dimensions. Always specify `inline-size` and `block-size`.

### 4.4 Font OpenType Feature Support
Vertical typesetting relies on dedicated OpenType vertical metric tables:
* `vhea` / `vmtx` (Vertical Header and Metrics)
* `vert` (Vertical Alternates for punctuation, parenthesis rotation, and glyph centering)
* `vrt2` (Vertical Alternates and Rotation)

When using custom web fonts for vertical CJK text, verify that the font includes vertical glyph tables (`vert` feature enabled by default in modern browser engines).

---

## 5. Accessibility (a11y) & SEO Considerations

1. **DOM Order vs. Visual Flow:**
   Screen readers parse the DOM in standard sequential tree order regardless of `writing-mode`. Ensure your DOM order matches logical reading hierarchy (e.g., Chapter Header &rarr; Section &rarr; Paragraph 1 &rarr; Paragraph 2).
2. **Language Attribute (`lang`):**
   Always declare the appropriate language tag on vertical elements (e.g., `<article lang="ja">` or `<article lang="zh-Hant">`). The browser's typographic engine uses the `lang` attribute to determine correct vertical punctuation glyph substitution and dictionary line-breaking rules.
3. **Screen Reader Behavior with Tate-chu-yoko:**
   Screen readers read `<span class="tcy">42</span>` as the number "forty-two" seamlessly. Tate-chu-yoko does not disrupt text-to-speech engines.
4. **Keyboard Focus Navigation:**
   Tab order follows DOM order, which naturally travels from right to left in `vertical-rl` when the markup is ordered sequentially.

---

## 6. Complete Self-Contained Interactive Showcase

Save the snippet below as an `.html` file and open it in any modern browser to test all vertical writing techniques interactively.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CSS Vertical Writing Modes Interactive Showcase</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #131b2e;
      --accent: #38bdf8;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --border: rgba(255, 255, 255, 0.1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 2rem 1rem;
      line-height: 1.5;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
    }

    header.showcase-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    h1 {
      font-size: 2.25rem;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .demo-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .demo-box h2 {
      font-size: 1.1rem;
      color: var(--accent);
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .vertical-frame {
      height: 240px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 1rem;
      overflow: auto;
    }

    /* Demonstration Classes */
    .mode-vertical-rl-mixed {
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }

    .mode-vertical-rl-upright {
      writing-mode: vertical-rl;
      text-orientation: upright;
    }

    .mode-vertical-lr {
      writing-mode: vertical-lr;
      text-orientation: mixed;
    }

    .tcy {
      text-combine-upright: digits 2;
      -webkit-text-combine: horizontal;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="showcase-header">
      <h1>Vertical Writing Modes in CSS</h1>
      <p style="color: var(--text-muted);">Comparing writing-mode, text-orientation, and Tate-chu-yoko in real time.</p>
    </header>

    <div class="demo-grid">
      <!-- Demo 1 -->
      <div class="demo-box">
        <h2>1. vertical-rl + mixed (Default)</h2>
        <div class="vertical-frame mode-vertical-rl-mixed">
          <p>
            東京 <span class="tcy">20</span><span class="tcy">26</span> — Modern Web Engine. Latin characters rotate 90°, CJK stays upright.
          </p>
        </div>
      </div>

      <!-- Demo 2 -->
      <div class="demo-box">
        <h2>2. vertical-rl + upright</h2>
        <div class="vertical-frame mode-vertical-rl-upright">
          <p>
            CSS <span class="tcy">42</span> GRID. All glyphs stand upright in a straight column.
          </p>
        </div>
      </div>

      <!-- Demo 3 -->
      <div class="demo-box">
        <h2>3. vertical-lr + mixed</h2>
        <div class="vertical-frame mode-vertical-lr">
          <p>
            Left-to-Right column flow. Line 1 starts on the left. Line 2 progresses to the right.
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 7. Cheat Sheet & Decision Matrix

```
                     IS YOUR TEXT RUNNING VERTICALLY?
                                   |
                   +---------------+---------------+
                   | YES                           | NO
                   v                               v
          CHOOSE WRITING MODE             writing-mode: horizontal-tb
          +-----------------------+
          |                       |
          v                       v
Traditional CJK / Western Right Rail     Mongolian / Western Left Rail
writing-mode: vertical-rl                writing-mode: vertical-lr
          |
          +--------------------------------------+
          |                                      |
          v                                      v
  Mixed Latin/CJK Glyphs?             Acronyms / Upright Latin?
  text-orientation: mixed             text-orientation: upright
          |
          v
  2-4 Digit Western Numbers in CJK?
  text-combine-upright: digits 2
```

### Key Rules of Thumb

1. **Always use CSS Logical Properties** (`inline-size`, `block-size`, `margin-block`, `padding-inline`) rather than physical properties (`width`, `height`, `margin-top`, etc.) when working with vertical writing modes.
2. **Never simulate vertical text with `transform: rotate(-90deg)`** when text wrapping, dynamic content, or internationalized typography is required.
3. **Always set `lang` tags** on vertical elements (`lang="ja"`, `lang="zh-Hant"`) so the browser selects the proper vertical punctuation glyphs and word-breaking tables.
4. **Use `text-combine-upright: digits 2`** for 2-digit dates, issue numbers, and chapter numbers in vertical East Asian text.
5. **Provide a responsive breakpoint** in Western editorial designs to switch back to `writing-mode: horizontal-tb` on narrow mobile screens.
