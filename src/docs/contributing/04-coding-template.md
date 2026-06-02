# Coding Lesson Template

Use this for Python or JavaScript lessons where the student writes and runs code in a notebook.

> **Download the template:** Go to the **Templates** tab and click Download next to **Python Coding** or **JavaScript / Web**.

---

## Python lesson template

Each Python lesson has 4 cells: **concept → visualization → application → challenge**.

- Cell 1 introduces the idea with minimal code
- Cell 2 plots something with matplotlib  
- Cell 3 applies it to a realistic problem
- Cell 4 is a blank-slate challenge

`startCode` runs immediately when the cell loads. Leave `...` where students fill in answers.  
`testCode` is optional — it runs after the student's code and can `assert` correct answers.

```js
export default {
  id: 'py-chapter-order-slug',   // e.g. 'py-1-3-for-loops'
  slug: 'descriptive-slug',
  chapter: 1.1,
  order: 3,
  title: 'Lesson Title',
  subtitle: 'One sentence description',
  tags: ['python', 'keyword1', 'keyword2'],

  hook: {
    question: `What problem does [this concept] solve?`,
    realWorldContext: `[Where this appears in real Python programs or data science work.]`,
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `**Context.** [One paragraph explaining the concept without code — the idea first, then we will implement it.]`,
      `**What you will build.** By the end of this lesson, you will be able to [concrete skill].`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter X, Lesson Y',
        body: `**Previous:** [previous lesson]\n**This lesson:** [this lesson]\n**Next:** [next lesson]`,
      },
    ],
  },

  visualizations: [
    {
      id: 'PythonNotebook',
      title: 'Python Lab',
      props: {
        initialCells: [
          // ── Cell 1 — Concept ───────────────────────────────────────────
          {
            type: 'python',
            instruction: `**[Concept name].** [Explain what this cell demonstrates. Connect directly to the intuition prose above. Tell students what to observe when they run it.]`,
            startCode: `# [What this cell computes]

# Example: create a [thing]
my_list = [1, 2, 3, 4, 5]

# Iterate using [concept]
for item in my_list:
    print(item)`,
          },

          // ── Cell 2 — Visualization ─────────────────────────────────────
          {
            type: 'python',
            instruction: `**Visualizing [concept].** [Explain what the plot shows. Describe what shape/pattern the student should see and why it makes sense mathematically.]`,
            startCode: `import matplotlib.pyplot as plt
import numpy as np

# Build the data
x = list(range(10))
y = [i ** 2 for i in x]   # [explain what this computes]

plt.figure(figsize=(7, 4))
plt.plot(x, y, 'o-', color='steelblue', linewidth=2, markersize=6)
plt.xlabel('[x axis label]')
plt.ylabel('[y axis label]')
plt.title('[Chart title]')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

print(f"The values are: {y}")`,
          },

          // ── Cell 3 — Application ───────────────────────────────────────
          {
            type: 'python',
            instruction: `**Application: [real task].** [Describe a realistic scenario from data science, scripting, or computation. Tell students what they need to write and what the expected output looks like.]`,
            startCode: `# Task: [problem statement in 1-2 sentences]
#
# Given this data:
data = [23, 45, 12, 67, 34, 89, 11, 56]
#
# Compute the [result] using [concept from this lesson]

result = ...  # write your solution here

print(f"Result: {result}")`,
            testCode: `assert result == EXPECTED_VALUE, f"Expected {EXPECTED_VALUE}, got {result}"`,
          },

          // ── Cell 4 — Challenge ─────────────────────────────────────────
          {
            type: 'python',
            instruction: `**Challenge: [problem title].** [A harder problem that requires combining this lesson's concept with something from a previous lesson. No starter code — student writes from scratch.]\n\n**Hint:** [one small hint]`,
            startCode: `# Your solution here\n`,
          },
        ],
      },
    },
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `[Question]`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
      hints: [`[hint]`],
      reviewSection: 'intuition',
    },
    // Add at least 2 more questions
  ],
}
```

---

## JavaScript / Web lesson template

JS lessons use `type: 'js'` cells. Each cell has `html`, `css`, and `startCode` fields. The output renders a live webpage in an iframe.

```js
export default {
  id: 'w1-chapter-order-slug',
  slug: 'descriptive-slug',
  chapter: 'w1',
  order: 1,
  title: 'Lesson Title',
  subtitle: 'One sentence description',
  tags: ['web', 'javascript', 'keyword'],

  hook: {
    question: `[Motivating question]`,
    realWorldContext: `[Where this appears in real web development.]`,
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      `[Context paragraph — explain the concept before showing any code]`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson X',
        body: `**Previous:** [previous]\n**This:** [this]\n**Next:** [next]`,
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Live Code Lab',
        caption: `[What students will build in this lab]`,
        props: {
          lesson: {
            title: '[Lab title]',
            subtitle: '[Lab subtitle]',
            sequential: true,
            cells: [
              {
                type: 'markdown',
                instruction: `[Explanation before the first code cell. Use markdown. Explain the concept with examples.]`,
              },
              {
                type: 'js',
                instruction: `[What the student is about to do. What to change. What to observe.]`,
                html: `<div id="output">
  <h2>Hello</h2>
  <p>Edit me</p>
</div>`,
                css: `body {
  background: #0f172a;
  color: #e2e8f0;
  font-family: sans-serif;
  padding: 20px;
}
h2 { color: #38bdf8; }`,
                startCode: `// [Comment: what this JS does]
const output = document.getElementById('output');
// Your code here`,
                outputHeight: 200,
              },
              {
                type: 'js',
                instruction: `[Second exercise. Build on the first cell.]`,
                html: `<!-- starter HTML -->`,
                css: `/* starter CSS */`,
                startCode: `// starter JS`,
                outputHeight: 250,
              },
            ],
          },
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `[Question]`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
      hints: [`[hint]`],
      reviewSection: 'intuition',
    },
  ],
}
```

---

## Tips for writing good code cells

**Do:**
- Make `startCode` runnable as-is so students see output immediately on load
- Use `...` as the placeholder where students fill in their answer
- Keep cells focused — one concept per cell
- Write `instruction` in second person ("You will...", "Try changing...")
- Include `testCode` for cells where there is one right answer

**Avoid:**
- Cells longer than ~30 lines of code
- Importing libraries that are not in the standard library (except numpy and matplotlib for Python, which are pre-installed)
- HTML/CSS in Python cells (use the JS notebook for visual output)
