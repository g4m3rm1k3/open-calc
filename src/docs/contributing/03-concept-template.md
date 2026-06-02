# Concept Lesson Template

Use this for math, physics, linear algebra, calculus, discrete math — any lesson teaching a formula, theorem, or technique.

> **Download the template:** Go to the **Templates** tab (top of this page) and click Download next to **Concept Lesson**. You will get a ready-to-fill `.js` file.

The reference copy below explains every field in detail.

---

## Checklist before submitting

- [ ] `hook.question` is something a curious student would actually ask
- [ ] `hook.realWorldContext` names a real system or profession that uses this
- [ ] `intuition.prose` starts with a concrete example (numbers, a physical situation), builds to the pattern, then states the formula
- [ ] At least one `procedure` callout with numbered steps
- [ ] `math.prose` derives the formula using only ideas introduced in `intuition`
- [ ] `examples` has 3 entries: one easy, one medium, one hard
- [ ] Every example step has `annotation` explaining WHY (not just WHAT)
- [ ] `quiz` has 6 entries; every `answer` is copied exactly from the matching `options` entry
- [ ] `notebooks.python` has 4 cells: concept → visualization (matplotlib) → application → challenge

---

## Full template

```js
export default {
  // ── Identity ──────────────────────────────────────────────────────────────
  // id format: <course>-<chapter>-<order>-<slug>
  // Example: 'calc-2-001-power-rule' or 'la1-003-dot-product'
  id: 'course-chapter-order-slug',
  slug: 'descriptive-url-slug',     // lowercase, hyphens, no spaces
  chapter: '1.1',                   // matches the chapter group in index.js
  order: 1,                         // position within the chapter (integer)
  title: 'Lesson Title',
  subtitle: 'One sentence that completes: "This lesson teaches you to..."',
  tags: ['keyword1', 'keyword2'],   // used for video matching — be specific

  // ── Hook ──────────────────────────────────────────────────────────────────
  hook: {
    question: `Why does [concept] matter when solving real problems?`,
    realWorldContext: `In [real system], [concept] explains [phenomenon]. Without it, [consequence].`,
  },

  // ── Intuition ─────────────────────────────────────────────────────────────
  // Build the idea from scratch. Start with a concrete example, name the
  // pattern, then state the formula. The student should feel they could have
  // invented it themselves.
  intuition: {
    prose: [
      `**Start with a concrete example.** Take [specific numbers or situation]. Notice that [observation]. This is the seed of the idea.`,

      `**Find the pattern.** When we change [input] by [amount], [output] changes by [related amount]. The ratio [formula fragment] keeps appearing. That ratio is [concept name].`,

      `**Name it and state it.** The [concept] is defined as: [formula]. Every term in this formula corresponds to something we saw in the example above: [term] is [meaning], [term] is [meaning].`,

      `**Before reading on, predict:** if [scenario], what would [concept] equal? Write your guess, then check in the Math section.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter X, Lesson Y',
        body: `**Previous:** [previous lesson title]\n**This lesson:** [what this lesson covers]\n**Next:** [next lesson title]`,
      },
      {
        type: 'procedure',
        title: 'How to compute [concept]',
        body: `1. Identify [what to look for]\n2. Compute [intermediate step]\n3. Apply [formula]\n4. Check [sanity check]`,
      },
      {
        type: 'insight',
        title: 'The key geometric interpretation',
        body: `[Concept] has a visual meaning: [describe what it looks like geometrically or physically].`,
      },
    ],
    visualizations: [
      // Use a viz ID from the 07-visualizations guide, or remove this section
      {
        id: 'VizComponentName',
        title: 'Interactive: [what it shows]',
        caption: `[One sentence describing what to do and what to observe.]`,
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  // Derive or prove the main result. Use only ideas introduced in Intuition.
  // Write in full sentences, not just equations.
  math: {
    prose: [
      `**Setup.** Let [variables] represent [quantities]. We want to show [goal].`,

      `**Step 1.** Starting from [definition or previously known result]: $[equation]$. This is valid because [reason].`,

      `**Step 2.** Applying [operation]: $[equation]$.`,

      `**Result.** We arrive at $[formula]$. This matches our intuition because [connection to the example in Intuition].`,
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Common mistake: [what students get wrong]',
        body: `[Describe the mistake and why it happens. Show the wrong version vs. the right version.]`,
      },
    ],
  },

  // ── Rigor (optional but encouraged) ──────────────────────────────────────
  rigor: {
    prose: [
      `**Formal definition.** [State the formal epsilon-delta / set-theoretic / axiomatic definition.]`,

      `**What the definition requires.** The key condition is [condition]. Without it, [counterexample] would satisfy the formula but violate [property].`,

      `**Geometric interpretation revisited.** In [n]-dimensional space, [concept] corresponds to [geometric object]. This is why [surprising property] holds.`,

      `**Where this leads.** This result is the foundation for [next topic]. Specifically, [connection].`,
    ],
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  // Minimum 3 examples: easy, medium, hard.
  // Example 1 should walk every step. Later examples can go faster.
  examples: [
    {
      title: 'Example 1 (Easy): [specific problem statement]',
      steps: [
        {
          expression: `[starting expression]`,
          annotation: `We are given [input]. Our goal is [output]. We start by [first action].`,
        },
        {
          expression: `[after step 1]`,
          annotation: `Apply [rule/formula]. This works because [reason from Intuition section].`,
        },
        {
          expression: `[final answer]`,
          annotation: `This is the answer. A sanity check: [verify with units / limiting case / back-substitution].`,
        },
      ],
    },
    {
      title: 'Example 2 (Medium): [specific problem statement]',
      steps: [
        { expression: `...`, annotation: `...` },
        { expression: `...`, annotation: `...` },
      ],
    },
    {
      title: 'Example 3 (Hard): [specific problem statement]',
      steps: [
        { expression: `...`, annotation: `...` },
        { expression: `...`, annotation: `...` },
      ],
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────────────────
  // Minimum 6 questions. IMPORTANT: answer must be copied exactly from options.
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `[Question text]`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',  // must match one of the options above exactly
      hints: [`Think about [hint 1].`, `Recall that [hint 2].`],
      reviewSection: 'intuition',  // 'intuition' | 'math' | 'rigor' | 'examples'
    },
    {
      id: 'q2',
      type: 'choice',
      question: `[Question text]`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option B',
      hints: [`[hint]`],
      reviewSection: 'math',
    },
    // Add 4 more questions...
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      title: '[Challenge problem statement]',
      difficulty: 'medium',  // 'easy' | 'medium' | 'hard'
      walkthrough: [
        `Step 1: [what to do first and why]`,
        `Step 2: [next step]`,
        `Answer: [final result]`,
      ],
    },
  ],

  // ── Misconceptions ────────────────────────────────────────────────────────
  misconceptions: [
    {
      wrong: `[The thing students often believe incorrectly]`,
      correction: `[Why it is wrong and what is correct instead]`,
      correctionExample: `[A specific example that shows the correct reasoning]`,
    },
  ],

  // ── Transfer prompts ──────────────────────────────────────────────────────
  transferPrompts: [
    `[A question asking the student to apply this concept to a new domain]`,
    `[A question connecting this concept to something from a previous lesson]`,
  ],

  // ── Notebooks ─────────────────────────────────────────────────────────────
  notebooks: {
    python: {
      id: 'PythonNotebook',
      title: `[Lesson Title] — Python Lab`,
      subtitle: `Compute and visualize [concept] from scratch`,
      sequential: true,
      cells: [
        {
          type: 'python',
          instruction: `**Cell 1 — Concept.** [Explain what this cell demonstrates and how it connects to the lesson theory.]`,
          startCode: `# [Comment explaining what students will compute]
# Replace the ... with your answer

import numpy as np

# Define [quantity]
x = ...  # [what to fill in]

# Compute [result]
result = ...

print(f"Result: {result}")`,
          testCode: `assert abs(result - EXPECTED) < 1e-6, "Check your formula"`,
        },
        {
          type: 'python',
          instruction: `**Cell 2 — Visualization.** [Explain what the plot shows and what to look for.]`,
          startCode: `import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-3, 3, 300)
y = ...  # compute y from x using the formula from this lesson

plt.figure(figsize=(8, 4))
plt.plot(x, y, 'b-', linewidth=2, label='[label]')
plt.axhline(0, color='k', linewidth=0.5)
plt.axvline(0, color='k', linewidth=0.5)
plt.xlabel('x')
plt.ylabel('y')
plt.title('[What this plot shows]')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
        },
        {
          type: 'python',
          instruction: `**Cell 3 — Application.** [A realistic problem that uses the concept.]`,
          startCode: `import numpy as np

# Problem: [describe the real-world scenario]
# Given:
given_value = ...

# Your task: compute [what] using [formula from the lesson]
answer = ...

print(f"Answer: {answer:.4f}")`,
        },
        {
          type: 'python',
          instruction: `**Cell 4 — Challenge.** [A harder problem. No starter code — student must write it from scratch.]`,
          startCode: `# Challenge: [problem statement]
# Hint: [one hint]

# Your solution here:
`,
        },
      ],
    },
  },
}
```
