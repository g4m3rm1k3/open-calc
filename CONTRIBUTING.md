# Contributing to open-calc

Thanks for helping improve open-calc. This guide covers everything you need to add a lesson, a visualization, or fix a bug — including the pitfalls that are easy to miss.

---

## Development workflow

1. Fork the repository and create a feature branch from `main`.
2. Make focused changes with clear commit messages.
3. Run `npm run build` locally — a clean build confirms content indexing and no import errors.
4. Open a pull request with a clear summary. For UI or visualization changes, include a screenshot or GIF.

---

## 1. Adding a new lesson

All lesson content lives in `src/content/chapter-X/`. Each file exports a single JS object. Here is the complete format with every supported field:

```javascript
export default {
  // ── Identity ────────────────────────────────────────────────────────────
  id: 'ch2-001',                         // unique, used for cross-refs
  slug: 'differentiation-rules',         // URL segment
  chapter: 2,
  order: 1,
  title: 'Differentiation Rules',
  subtitle: 'One-line teaser shown in the chapter index',
  tags: ['power rule', 'product rule'],  // for search
  aliases: 'alternate search terms',     // extra search index terms

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: 'The motivating question shown at the top of the lesson.',
    realWorldContext: 'Why this matters in the real world.',
    previewVisualizationId: 'PowerRulePattern', // shown in chapter index card
  },

  // ── Intuition ───────────────────────────────────────────────────────────
  intuition: {
    prose: [
      // Array of paragraph strings. Supports inline math with $...$
      // e.g. 'The derivative of $x^n$ is $nx^{n-1}$.'
    ],
    callouts: [
      {
        type: 'insight',   // insight | warning | definition | theorem | mnemonic | proof-map
        title: 'Title',
        body: '\\LaTeX expression',
      },
    ],
    visualizations: [
      {
        id: 'PowerRulePattern',           // must exist in VizFrame.jsx
        title: 'Power Rule Pattern',
        mathBridge: 'Connects $f(x)=x^n$ to its derivative $nx^{n-1}$ visually.',
        caption: 'Short caption under the visualization.',
        props: {},                         // optional: initial props to pass
      },
    ],
  },

  // ── Math ────────────────────────────────────────────────────────────────
  math: {
    prose: [ /* same format as intuition.prose */ ],
    callouts: [ /* same format */ ],
    visualizationId: 'DifferentiationRulesDemo', // single legacy field (still works)
    visualizationProps: {},                       // props for the above
    visualizations: [ /* same array format as intuition.visualizations */ ],
  },

  // ── Rigor ───────────────────────────────────────────────────────────────
  rigor: {
    prose: [ /* optional */ ],
    callouts: [ /* optional */ ],
    visualizationId: 'MyProofViz',  // syncs currentStep with proofSteps below
    visualizationProps: {},
    visualizations: [ /* additional vizzes shown below the proof */ ],
    proofSteps: [
      {
        expression: '\\frac{d}{dx}[x^n] = nx^{n-1}',
        annotation: 'Explanation shown in the sidebar for this step.',
      },
    ],
    title: 'Optional title for the proof block',
  },

  // ── Examples ────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch2-001-ex1',                   // REQUIRED — must be unique
      title: 'Differentiating a Polynomial',
      problem: '\\text{Find } f\'(x) \\text{ for } f(x) = 5x^4 - 3x^2.',
      steps: [
        {
          expression: "f'(x) = 20x^3 - 6x",
          annotation: 'Apply the power rule to each term.',
        },
      ],
      conclusion: 'One-sentence takeaway.',
      visualizations: [
        {
          id: 'PowerRulePattern',
          title: 'Power Rule Pattern',
          caption: 'Caption connecting the visualization to this specific example.',
        },
      ],
      // Legacy alternative — also works:
      // visualizationId: 'PowerRulePattern',
      // params: {},
    },
  ],

  // ── Challenges ──────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch2-001-ch1',
      difficulty: 'easy',           // easy | medium | hard
      problem: '\\text{Differentiate } f(x) = x^7.',
      hint: 'Apply the power rule: bring the exponent down as a coefficient.',
      walkthrough: [
        {
          expression: "f'(x) = 7x^6",
          annotation: 'Power rule: exponent 7 drops down, new exponent is 6.',
        },
      ],
      answer: "f'(x) = 7x^6",
    },
  ],
}
```

### Content writing rules

- **Prose strings** support mixed math using `$...$` for inline expressions: `'The derivative of $x^n$ is $nx^{n-1}$.'`
- **LaTeX in expression fields** is rendered as a centered block. Escape backslashes as `\\` inside JS strings: `'\\frac{d}{dx}[x^n] = nx^{n-1}'`
- Every `examples` entry **must have an `id`** field (format: `ch{chapter}-{lesson_order}-ex{N}`).
- Keep notation consistent with neighboring lessons — check what symbols they use for the same concepts.
- Do not add a `visualizations` entry whose ID is not registered in `VizFrame.jsx`. The lesson will silently show nothing.

---

## 2. Adding a new visualization

### Step 1 — Create the component

Add a `.jsx` file in:
- `src/components/viz/d3/` for 2D D3 visualizations
- `src/components/viz/three/` for 3D Three.js visualizations
- `src/components/viz/react/` for pure React visualizations (sliders, interactive proofs, games)

### Step 2 — Component API

Every visualization receives a `params` prop. For proof-synced visualizations, `params.currentStep` is automatically incremented as the user steps through the proof.

```jsx
export default function MyViz({ params = {} }) {
  const { currentStep = 0 } = params

  // D3 pattern — use a ResizeObserver so the viz is responsive
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const draw = () => {
      const W = containerRef.current?.clientWidth || 500
      // ... D3 drawing using W and currentStep
    }
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [currentStep /*, other deps */])

  return (
    <div ref={containerRef}>
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}
```

### Step 3 — Dark mode

**All D3 visualizations must support dark mode.** Check the current theme at the start of your `draw()` function and use a color token object:

```javascript
const draw = () => {
  const isDark = document.documentElement.classList.contains('dark')
  const C = {
    bg:     isDark ? '#0f172a' : '#f8fafc',
    text:   isDark ? '#e2e8f0' : '#1e293b',
    axis:   isDark ? '#334155' : '#cbd5e1',
    // ... add tokens for every color you use
  }
  // use C.bg, C.text etc. — never hardcode color strings
}
```

Pure React visualizations should use Tailwind's `dark:` variants (`dark:bg-slate-900`, `dark:text-slate-200`, etc.).

### Step 4 — Register it

Add a lazy import to the `VIZ_REGISTRY` object in `src/components/viz/VizFrame.jsx`:

```javascript
const VIZ_REGISTRY = {
  // ... existing entries
  MyViz: lazy(() => import('./d3/MyViz.jsx')),
}
```

The key is the string ID you will use in content files.

---

## 3. Common pitfalls

These mistakes are silent — they produce no error but the lesson looks wrong or broken.

### Duplicate keys in a JS object
JavaScript silently overwrites earlier values when an object has two keys with the same name. This is the most common cause of broken proof play buttons.

```javascript
// BUG — second visualizationId silently overwrites the first
rigor: {
  visualizationId: 'ProofViz',    // this gets overwritten and ignored
  proofSteps: [...],
  visualizationId: 'OtherViz',   // this is the one that runs — but ignores currentStep
}

// FIX — use the visualizations array for the second viz
rigor: {
  visualizationId: 'ProofViz',   // syncs with proofSteps
  proofSteps: [...],
  visualizations: [{ id: 'OtherViz', title: '...' }],  // shown below the proof
}
```

### KaTeX — `\left` and `\right` must be in the same expression
KaTeX requires `\left[` and its matching `\right]` to appear in a single `expression` string. Splitting them across two separate `<KatexInline>` calls will fail silently.

```javascript
// BUG — \left[ and \right] in different KatexInline calls
<KatexInline expr="\left[" />
<KatexInline expr="..." />
<KatexInline expr="\right]" />

// FIX — use \bigl[ and \bigr] which are self-contained (no pairing required)
<KatexInline expr="\bigl[ ... \bigr]" />
// OR put the whole expression in one call
<KatexInline expr="\left[ ... \right]" />
```

### Missing visualization ID in VizFrame
If you reference a visualization ID in a content file but forget to register it in `VizFrame.jsx`, the component renders nothing with no error message. Always add both.

### Hardcoded colors in D3
If you draw with `stroke="#ccc"` or `fill="white"`, those colors will be invisible or wrong in the opposite theme. Always use the color token pattern described above.

### ResizeObserver missing
Without `ResizeObserver`, a D3 visualization freezes at its initial size and breaks when the panel is resized or the screen rotates. Use the pattern shown in Step 2 above.

---

## 4. UI components reference

| Component | Location | Key props |
|---|---|---|
| `ExampleBlock` | `lesson/ExampleBlock.jsx` | `example` object, `number` |
| `DynamicProof` | `lesson/DynamicProof.jsx` | `steps`, `visualizationId`, `title` |
| `ChallengeBlock` | `lesson/ChallengeBlock.jsx` | `challenge` object |
| `KatexBlock` | `math/KatexBlock.jsx` | `expr` — centered block LaTeX |
| `KatexInline` | `math/KatexInline.jsx` | `expr` — inline LaTeX |
| `VizFrame` | `viz/VizFrame.jsx` | `id`, `initialProps`, `title` |

---

## 5. Pull request checklist

- [ ] `npm run build` completes without errors
- [ ] Every new `visualizationId` / `visualizations[].id` exists in `VizFrame.jsx`
- [ ] Every new `examples` entry has a unique `id` field
- [ ] D3 visualizations handle dark mode via color tokens, not hardcoded colors
- [ ] D3 visualizations use `ResizeObserver`
- [ ] No duplicate keys in any JS content object
- [ ] LaTeX `\left`/`\right` pairs are in the same expression string
- [ ] New cross-references point to real lesson slugs
- [ ] Written math is accurate and notation matches neighboring lessons

---

## Code style

- Follow the existing file organization and naming conventions.
- Avoid unrelated refactors in feature PRs — one concern per PR.
- Keep changes focused and reviewable.
