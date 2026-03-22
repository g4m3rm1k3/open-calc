# Contributing to Open Calc

Thanks for helping improve Open Calc.

## Development workflow

1. Fork the repository.
2. Create a feature branch from `main`.
3. Make focused changes with clear commit messages.
4. Run checks locally before opening a PR.
5. Open a pull request with a clear summary and screenshots/GIFs for UI or visualization changes.

## Local checks

```bash
npm run build
```

A successful build confirms content indexing and Vite production compilation.

## Content guidelines

- Keep lessons intuition-first, then formalize rigor.
- Prefer concrete examples and physical interpretation where natural.
- Keep notation consistent with neighboring lessons.
- Ensure every new cross-reference points to a real lesson slug.
- Ensure every new visualization ID exists in `src/components/viz/VizFrame.jsx`.

## Pull request checklist

- [ ] All new content files use valid math walkthrough arrays.
- [ ] New visualizations are lazy-loaded in `VizFrame.jsx`.
- [ ] All `ChallengeBlock` references have at least one hint.
- [ ] Build executes without dynamic import errors.

---

# Open-Calc Contribution Guide: "How to Add Anything"

This guide explains the "Plug-and-Play" architecture. To add content, you typically only need to edit files in specific folders using standardized formats.

## 1. Adding a New Lesson (Text & Math)
All lesson content resides in `src/content/chapter-X/`. Each file exports a single JSON-like object.

### The Standard Format:
```javascript
export default {
  id: 'unique-id',
  slug: 'url-friendly-name',
  title: 'Lesson Title',
  // ... metadata (tags, chapter, order)
  
  hook: { /* Question & real-world context */ },
  intuition: { /* High-level overview + simple visualizations */ },
  math: { /* Formal definitions + core formulas */ },
  rigor: { 
    /* Step-by-step Animated Proofs */
    visualizationId: 'YourVizComponent', // Maps to src/components/viz/Registry
    proofSteps: [
      { expression: '\\\\LaTeX', annotation: 'Sidebar text explanation' }
    ]
  },
  examples: [
    {
      title: 'Example Name',
      problem: 'The Question',
      steps: [ { expression: '...', annotation: '...' } ]
    }
  ],
  challenges: [ 
    {
      problem: '...',
      hint: 'The conceptual nudge',
      walkthrough: [ /* Solution steps */ ]
    }
  ]
}
```

## 2. Adding a New Visualization (D3/React)
Visualizations are decoupled from the content.

1.  **Create the File**: Add a new React component in `src/components/viz/d3/` (for 2D) or `src/components/viz/three/` (for 3D).
2.  **Standard API**: Your component should accept a `params` prop:
    ```jsx
    export default function MyNewViz({ params = {} }) {
      const { currentStep = 0 } = params; // Syncs with rigor.proofSteps[i]
      // Use D3 or React to render based on currentStep
      return <svg>...drawings...</svg>;
    }
    ```
3.  **Register It**: You **MUST** add it to the registry in [src/components/viz/VizFrame.jsx](src/components/viz/VizFrame.jsx):
    ```javascript
    const VIZ_REGISTRY = {
      MyNewViz: lazy(() => import('./d3/MyNewViz.jsx')),
    };
    ```

## 4. UI Components & Styling
The project uses **Tailwind CSS**. You can use any Tailwind utility classes for custom styling. For consistent lesson elements, use these pre-built components from `src/components/ui/` and `src/components/lesson/`:

| Component | Purpose | Key Props |
| :--- | :--- | :--- |
| `Callout` | Highlights notes or warnings | `type="info|warning|tip"`, `title` |
| `ExampleBlock` | Standardized example container | `title`, `steps` |
| `ChallengeBlock` | Practice problems with hints | `problem`, `hint`, `walkthrough` |
| `Spoiler` | Click-to-reveal content | `label` |
| `KatexBlock` | Centered block-level LaTeX | `expression` |

### Adding a New UI Element:
1.  **Define it** in `src/components/ui/`.
2.  **Export it** for use in `LessonPage.jsx` or other layout components.
3.  **Style it** using utility classes (e.g., `<div className="p-4 bg-blue-50 rounded-lg">`).

## 5. How Everything Fits Together (The "Bridge")

1.  **The Content Layer** (`src/content/`): Defines the *what* (Text, LaTeX, Steps).
2.  **The Component Layer** (`src/components/`): Defines the *how* (UI, Layout, Viz).
3.  **The Registry** (`VizFrame.jsx`): This is the "Switchboard." It connects the `visualizationId` string in your content file to the actual React code.
4.  **The Layout** (`LessonPage.jsx`): Automatically handles the rendering. If you add a step to a proof in the content file, the layout automatically renders a "Next Step" button and passes the incremented index to your visualization.

## 4. Quick Checklist for Contributors
1.  **Add Text?** Edit the JS file in `src/content/`.
2.  **Add Image/Animation?** Create a `.jsx` in `src/components/viz/d3/`, then register it in `VizFrame.jsx`.
3.  **Add Math?** Use standard LaTeX strings (double-escaped: `\\\\frac{1}{2}`).
4.  **Add a Chapter?** Create the folder `chapter-N/`, add an `index.js`, and import it into `src/content/index.js`.


- [ ] Build passes locally.
- [ ] New links and cross-references resolve correctly.
- [ ] New visualizations are wired and render without console errors.
- [ ] Written explanations are mathematically accurate and age-appropriate for the chapter.

## Code style

- Follow existing style and file organization.
- Avoid unrelated refactors in feature PRs.
- Keep changes focused and reviewable.
