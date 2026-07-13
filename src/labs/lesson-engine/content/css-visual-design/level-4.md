---
series: css-visual-design
level: 4
title: Contrast and Accessibility
lang: css
---

# Contrast and Accessibility

Pick a text color that "looks readable" by eye and you will fail some of your users. 1 in 12 men and 1 in 200 women have some form of color vision deficiency. Low-contrast text also fails in bright sunlight, on inexpensive screens, and for users affected by fatigue or medication.

WCAG (Web Content Accessibility Guidelines) makes "readable" measurable. The contrast ratio formula compares relative luminance — a mathematical measure of brightness — between foreground and background. WCAG defines minimum ratios for normal text (4.5:1) and large text (3:1), and enhanced ratios for AAA compliance.

By the end of this lesson you will understand WCAG contrast ratios and how to calculate them, know the AA vs AAA compliance thresholds, and be able to choose accessible text/background combinations and test them in browser devtools.

## WCAG contrast ratios

```html
<div class="contrast-demo">
  <div class="sample fail-bad">
    <span>Ratio 1.5:1 — Fail</span>
    <small>Very light grey on white. Invisible to many users.</small>
  </div>
  <div class="sample fail">
    <span>Ratio 3.0:1 — Fail AA body</span>
    <small>Passes for large text (18px+) but fails for normal body.</small>
  </div>
  <div class="sample pass-aa">
    <span>Ratio 4.5:1 — Pass AA</span>
    <small>Minimum for normal text. Most users can read this.</small>
  </div>
  <div class="sample pass-aaa">
    <span>Ratio 7.0:1 — Pass AAA</span>
    <small>Enhanced level. Legible for almost everyone.</small>
  </div>
</div>
```

```css
.contrast-demo { display: flex; flex-direction: column; gap: 0.75rem; font-family: system-ui, sans-serif; }
.sample { padding: 1rem 1.25rem; border-radius: 8px; background: white; border: 1px solid #e2e8f0; }
.sample span  { display: block; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem; }
.sample small { font-size: 0.8rem; }

.fail-bad span, .fail-bad small { color: #c8c8c8; }   /* ~1.5:1 ratio — bad */
.fail     span, .fail     small { color: #9ca3af; }   /* ~2.5:1 ratio — fail */
.pass-aa  span, .pass-aa  small { color: #6b7280; }   /* ~4.6:1 ratio — AA pass */
.pass-aaa span, .pass-aaa small { color: #374151; }   /* ~7.0:1 ratio — AAA pass */
```

**CS lens:** WCAG contrast ratio is calculated from relative luminance: `(L1 + 0.05) / (L2 + 0.05)` where L1 is the lighter colour's luminance. Luminance is a non-linear function of RGB: `L = 0.2126R + 0.7152G + 0.0722B` (after gamma correction). The formula weights green heavily because the human eye is most sensitive to green wavelengths. This is why yellow (#ffff00) has very high luminance even though it "feels" bright, and dark purple feels dark despite having some red and blue channels.

## Focus indicators

```html
<div class="focus-demo">
  <button class="bad-focus">Bad — no focus ring</button>
  <button class="good-focus">Good — clear focus ring</button>
  <a class="good-link" href="#">Good — link focus</a>
</div>
```

```css
.focus-demo { display: flex; gap: 1rem; align-items: center; padding: 1.5rem; background: #f8fafc; border-radius: 10px; flex-wrap: wrap; }

/* The wrong way — removing focus for aesthetics */
.bad-focus {
  padding: 0.5rem 1.25rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  outline: none;   /* ← WRONG: keyboard users cannot see where they are */
}

/* The right way — custom focus ring that looks good */
.good-focus {
  padding: 0.5rem 1.25rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  outline: none;
}
.good-focus:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;             /* gap between element and ring */
  box-shadow: 0 0 0 5px rgb(99 102 241 / 0.25);
}

.good-link { color: #4f46e5; font-weight: 600; text-decoration: underline; outline: none; }
.good-link:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
  border-radius: 2px;
}
```

## Color-blind safe palettes

```html
<div class="colorblind-demo">
  <div class="legend">
    <h4>Status — color only (bad)</h4>
    <div class="items">
      <div class="item bad-only green-dot">Active</div>
      <div class="item bad-only yellow-dot">Pending</div>
      <div class="item bad-only red-dot">Failed</div>
    </div>
  </div>
  <div class="legend">
    <h4>Status — color + shape + text (good)</h4>
    <div class="items">
      <div class="item good-combo success-badge">● Active</div>
      <div class="item good-combo warning-badge">▲ Pending</div>
      <div class="item good-combo danger-badge">✕ Failed</div>
    </div>
  </div>
</div>
```

```css
.colorblind-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; font-family: system-ui, sans-serif; }
.legend h4 { font-size: 0.8rem; font-weight: 600; color: #475569; margin: 0 0 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.items { display: flex; flex-direction: column; gap: 0.5rem; }
.item { font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
.green-dot::before  { content: '●'; color: #22c55e; }
.yellow-dot::before { content: '●'; color: #eab308; }
.red-dot::before    { content: '●'; color: #ef4444; }
.success-badge { color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 99px; width: fit-content; }
.warning-badge { color: #854d0e; background: #fef9c3; padding: 2px 8px; border-radius: 99px; width: fit-content; }
.danger-badge  { color: #991b1b; background: #fee2e2; padding: 2px 8px; border-radius: 99px; width: fit-content; }
```

**SE lens:** WCAG compliance is a legal requirement in many countries (EU, US federal, UK). The standard is WCAG 2.1 AA for most products. Failing it exposes the company to lawsuits (Target, Domino's, and others have settled). Beyond legal risk: approximately 8% of men have red-green color blindness. Building for accessibility by default reaches a larger audience and produces better design for everyone — high-contrast text is easier to read for all users, not just those with vision impairments.

**Common mistakes:**
- `outline: none` with no replacement — this makes keyboard navigation invisible. Use `:focus-visible` to show focus rings only for keyboard users while hiding them for mouse clicks.
- Relying on color alone to convey meaning — always add a secondary cue (shape, text, icon, pattern).

**Debug tip:** Chrome DevTools Accessibility panel shows the contrast ratio of any text element and flags WCAG failures. Lighthouse audit (DevTools → Lighthouse → Accessibility) catches low-contrast issues across the whole page.

**Next:** Dark mode with custom properties — theming that adapts to user preference.

## Challenge: accessible_button

Make a button that passes WCAG AA contrast and has a visible focus ring.

```html
<button id="a11y-btn">Submit Form</button>
```

```challenge css
#a11y-btn {
  padding: 0.6rem 1.5rem;
  background: #1d4ed8;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}
#a11y-btn:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgb(29 78 216 / 0.25);
}
```

```test
const btn = document.querySelector('#a11y-btn')
const style = getComputedStyle(btn)
assert style.backgroundColor !== 'transparent'
assert style.color === 'rgb(255, 255, 255)' || style.color.includes('255, 255, 255')
assert style.cursor === 'pointer'
assert style.fontSize !== ''
assert parseFloat(style.fontSize) >= 14
```
