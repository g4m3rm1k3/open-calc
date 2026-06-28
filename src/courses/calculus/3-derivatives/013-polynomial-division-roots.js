import powerRuleUrl from '../diagrams/calc-power-rule.svg?url';
import polynomialRootsUrl from '../diagrams/calc-polynomial-roots.svg?url';
import factoredRootsUrl from '../diagrams/calc-factored-roots.svg?url';
export default {
  id: 'ch2-008',
  slug: 'polynomial-division-roots',
  chapter: 2,
  order: 10,
  title: 'Polynomial Division, Rational Zeros, and Descartes\' Rule',
  subtitle: 'Long division and synthetic division are the tools; the Rational Zero Theorem and Descartes\' Rule tell you where to look',
  tags: ['polynomial division', 'long division', 'synthetic division', 'remainder theorem', 'factor theorem', 'rational zeros', 'Descartes rule', 'linear factorization'],
  aliases: 'polynomial long division synthetic division remainder theorem factor theorem rational zero theorem Descartes rule of signs roots higher order polynomial',

  hook: {
    question: 'You can factor $x^2 - 5x + 6$ by inspection. But how do you find the roots of $2x^4 - 3x^3 - 8x^2 + 3x + 6$? There is a systematic process — and it starts with knowing which rational numbers are even worth trying.',
    realWorldContext: 'In signal processing and control systems engineering, transfer functions are ratios of polynomials. Finding the roots (poles and zeros) of those polynomials determines system stability. The Rational Zero Theorem and synthetic division are the manual tools for the same problem that numerical methods solve computationally — understanding them gives you the intuition behind root-finding algorithms.',
    previewVisualizationId: 'PolynomialDivisionViz',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
      '**Appendix Tool Lesson — Not Part of the Main Derivative Story:** This lesson is a reference resource, not part of the ten-lesson arc of Chapter 2. You do not need it to understand derivatives. Come here when a calculus problem produces a polynomial that needs to be factored, and you need to find its roots systematically. The core story of Chapter 2 (Lessons 1–10) is complete before you reach this lesson.',

      'Dividing polynomials is identical to dividing integers — same algorithm, just with powers of $x$ instead of powers of 10. Long division of $x^3 + 2x^2 - 5x - 6$ by $(x-2)$ proceeds: how many times does $x$ go into $x^3$? Answer: $x^2$. Multiply, subtract, bring down. Repeat. The result is a quotient and a remainder.',
        ],
      },
      { type: 'image', src: powerRuleUrl, alt: 'Polynomial structure table for roots and factored forms', caption: 'Roots of polynomials are where the function crosses zero; factoring reveals them all.' },
      {
        type: 'prose',
        paragraphs: [
      'Synthetic division is long division compressed into a row of numbers — it only works when the divisor is linear of the form $(x - c)$. Write only the coefficients of the dividend, write $c$ to the left, and follow the bring-down-multiply-add pattern. It is faster than long division and less error-prone once you know the pattern.',
        ],
      },
      { type: 'image', src: polynomialRootsUrl, alt: 'Polynomial roots and factored form diagram', caption: 'Every root of p(x)=0 corresponds to a factor (x−r). The degree tells you the maximum number of roots.' },
      {
        type: 'prose',
        paragraphs: [
      'The Remainder Theorem connects division to evaluation: when you divide $f(x)$ by $(x-c)$, the remainder equals $f(c)$. This means synthetic division simultaneously divides the polynomial AND evaluates it at $c$. The Factor Theorem follows: $(x-c)$ is a factor of $f(x)$ if and only if $f(c) = 0$ — i.e., $c$ is a root.',
        ],
      },
      { type: 'image', src: factoredRootsUrl, alt: 'Graph of factored polynomial (x+2)(x-1)(x-3) with roots, y-intercept, and multiplicity guide', caption: 'Factored form reveals all roots visually. Simple roots cross the x-axis; double roots bounce; triple roots S-curve.' },
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Remainder Theorem and Factor Theorem',
        body: '\\text{Remainder Theorem: dividing } f(x) \\text{ by } (x-c) \\text{ gives remainder } f(c). \\\\ \\text{Factor Theorem: } (x-c) \\text{ is a factor of } f(x) \\iff f(c) = 0.',
      },
      {
        type: 'theorem',
        title: 'Rational Zero Theorem',
        body: '\\text{If } f(x) = a_n x^n + \\cdots + a_0 \\text{ has integer coefficients,} \\\\ \\text{then any rational root } \\frac{p}{q} \\text{ (in lowest terms) satisfies:} \\\\ p \\mid a_0 \\quad \\text{(divides the constant term)} \\\\ q \\mid a_n \\quad \\text{(divides the leading coefficient)}',
      },
      {
        type: 'theorem',
        title: "Descartes' Rule of Signs",
        body: '\\text{Number of positive real roots} \\leq \\text{sign changes in } f(x) \\\\ \\text{Number of negative real roots} \\leq \\text{sign changes in } f(-x) \\\\ \\text{Actual count} = \\text{max possible} - 2k \\text{ for some } k \\geq 0.',
      },
      {
        type: 'proof-map',
        title: 'Strategy for finding all roots of a higher-degree polynomial',
        body: '1.\\; \\text{List possible rational roots via Rational Zero Theorem} \\\\ 2.\\; \\text{Use Descartes\' Rule to narrow down positive/negative roots} \\\\ 3.\\; \\text{Test candidates with synthetic division (stops when remainder = 0)} \\\\ 4.\\; \\text{Factor out found roots, repeat on quotient} \\\\ 5.\\; \\text{Use quadratic formula on any remaining quadratic factor}',
      },
    ],
    visualizations: [
      {
        id: 'PolynomialDivisionViz',
        title: 'Synthetic Division — Step by Step',
        mathBridge: 'Enter a polynomial and a value $c$. Watch synthetic division run step by step, showing the quotient coefficients building and the remainder emerging.',
        caption: 'The remainder is $f(c)$ — if it\'s zero, $c$ is a root and $(x-c)$ is a factor.',
      },
    ],
  },

  math: {
    prose: [
      'The Linear Factorization Theorem guarantees that every degree-$n$ polynomial with complex coefficients factors completely into $n$ linear factors over $\\mathbb{C}$: $f(x) = a_n(x-c_1)(x-c_2)\\cdots(x-c_n)$. Over the reals, complex roots come in conjugate pairs, so the polynomial factors into a product of linear and irreducible quadratic factors.',
      'When a root $c$ appears $k$ times as a factor — $(x-c)^k$ divides $f(x)$ — then $c$ is a root of multiplicity $k$. At a simple root ($k=1$) the graph crosses the $x$-axis. At a double root ($k=2$) it touches and turns back. At a triple root ($k=3$) it crosses but with a flattened inflection.',
      "Descartes' Rule gives an upper bound, not an exact count. $f(x) = x^4 + 1$ has 0 sign changes, so 0 positive real roots. $f(-x) = x^4 + 1$ also has 0 sign changes, so 0 negative real roots. All four roots are complex. The rule told us exactly — but in general it only gives a ceiling.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear Factorization Theorem',
        body: 'f(x) = a_n(x-c_1)(x-c_2)\\cdots(x-c_n) \\quad \\text{over } \\mathbb{C} \\\\ \\text{Over } \\mathbb{R}\\text{: linear factors} + \\text{irreducible quadratic factors.} \\\\ \\text{Complex roots always come in conjugate pairs: if } a+bi \\text{ is a root, so is } a-bi.',
      },
      {
        type: 'insight',
        title: 'Root multiplicity from the graph',
        body: 'k=1 \\text{ (simple)}: \\text{graph crosses } x\\text{-axis} \\\\ k=2 \\text{ (double)}: \\text{graph touches, turns back} \\\\ k=3 \\text{ (triple)}: \\text{graph crosses with flat inflection} \\\\ \\text{Sum of all multiplicities} = \\text{degree of polynomial}',
      },
    ],
  },

  rigor: {
    title: 'Finding all roots of $f(x) = 2x^3 - 3x^2 - 8x + 12$',
    visualizationId: 'PolynomialDivisionViz',
    proofSteps: [
      {
        expression: '\\text{Possible rational roots: } \\pm\\frac{p}{q}, \\; p \\mid 12, \\; q \\mid 2',
        annotation: 'Rational Zero Theorem: $p \\in \\{1,2,3,4,6,12\\}$, $q \\in \\{1,2\\}$. Candidates: $\\pm 1, \\pm 2, \\pm 3, \\pm 4, \\pm 6, \\pm 12, \\pm\\frac{1}{2}, \\pm\\frac{3}{2}$.',
      },
      {
        expression: "\\text{Descartes': } f(x)=2x^3-3x^2-8x+12 \\text{ has 2 sign changes} \\Rightarrow \\text{0 or 2 positive roots}",
        annotation: 'Signs: $+,-,-,+$ → changes at positions 1-2 and 3-4. So 0 or 2 positive real roots.',
      },
      {
        expression: 'f(2) = 16 - 12 - 16 + 12 = 0 \\checkmark',
        annotation: 'Test $x=2$ by substitution. Remainder is zero — $x=2$ is a root.',
      },
      {
        expression: '\\text{Synthetic division by } (x-2): \\quad 2x^3-3x^2-8x+12 = (x-2)(2x^2+x-6)',
        annotation: 'Coefficients: $2 | -3 | -8 | 12$, $c=2$. Result: quotient $2x^2+x-6$.',
      },
      {
        expression: '2x^2+x-6 = (2x-3)(x+2) \\Rightarrow x = \\frac{3}{2}, \\; x = -2',
        annotation: 'Factor the remaining quadratic. Two more roots.',
      },
      {
        expression: 'f(x) = 2(x-2)\\left(x-\\tfrac{3}{2}\\right)(x+2) = (x-2)(2x-3)(x+2) \\qquad \\blacksquare',
        annotation: 'Three real roots: $x = -2, \\frac{3}{2}, 2$. Fully factored.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-008-ex1',
      title: 'Long division of polynomials',
      problem: '\\text{Divide } x^3 - 4x^2 + x + 6 \\text{ by } (x-2).',
      steps: [
        {
          expression: 'x^3 \\div x = x^2. \\quad x^2(x-2) = x^3-2x^2. \\quad \\text{Subtract: } -2x^2+x+6',
          annotation: 'First step: divide leading terms, multiply, subtract.',
        },
        {
          expression: '-2x^2 \\div x = -2x. \\quad -2x(x-2) = -2x^2+4x. \\quad \\text{Subtract: } -3x+6',
          annotation: 'Second step: bring down next term, repeat.',
        },
        {
          expression: '-3x \\div x = -3. \\quad -3(x-2) = -3x+6. \\quad \\text{Subtract: remainder } 0',
          annotation: 'Zero remainder — $(x-2)$ divides evenly.',
        },
        {
          expression: 'x^3-4x^2+x+6 = (x-2)(x^2-2x-3) = (x-2)(x-3)(x+1)',
          annotation: 'Factor the quotient. Three roots: $x = -1, 2, 3$.',
        },
      ],
      conclusion: 'Long division works for any divisor. When the remainder is zero, the divisor is a factor and the quotient continues the factoring.',
    },
    {
      id: 'ch2-008-ex2',
      title: 'Synthetic division',
      problem: '\\text{Use synthetic division to divide } 3x^4 - 2x^3 + 0x^2 - x + 5 \\text{ by } (x+1).',
      steps: [
        {
          expression: 'c = -1. \\quad \\text{Coefficients: } 3, -2, 0, -1, 5',
          annotation: 'For $(x+1)$, use $c = -1$. Include 0 for missing $x^2$ term — never skip a degree.',
        },
        {
          expression: '\\begin{array}{r|rrrrr} -1 & 3 & -2 & 0 & -1 & 5 \\\\ & & -3 & 5 & -5 & 6 \\\\ \\hline & 3 & -5 & 5 & -6 & 11 \\end{array}',
          annotation: 'Bring down 3. Multiply $3 \\times (-1)=-3$, add to $-2$ to get $-5$. Continue.',
        },
        {
          expression: '\\text{Quotient: } 3x^3-5x^2+5x-6, \\quad \\text{Remainder: } 11',
          annotation: 'Last number is the remainder. Since $11 \\neq 0$, $(x+1)$ is not a factor. Also: $f(-1) = 11$.',
        },
      ],
      conclusion: 'Synthetic division is faster than long division for linear divisors. The remainder equals $f(c)$ by the Remainder Theorem.',
    },
    {
      id: 'ch2-008-ex3',
      title: "Applying Descartes' Rule",
      problem: 'f(x) = x^5 - 3x^4 + 2x^3 + x - 1. \\text{ How many positive and negative real roots are possible?}',
      steps: [
        {
          expression: 'f(x) = x^5 - 3x^4 + 2x^3 + 0x^2 + x - 1',
          annotation: 'Signs: $+, -, +, +, +, -$ → sign changes at positions 1-2, 2-3, and 5-6. That is 3 changes.',
        },
        {
          expression: '\\text{Positive real roots: 3 or 1 (subtract 2 each time)}',
          annotation: "Descartes' Rule: 3 changes means 3 or 1 positive real roots.",
        },
        {
          expression: 'f(-x) = -x^5 - 3x^4 - 2x^3 + 0x^2 - x - 1',
          annotation: 'Replace $x$ with $-x$: odd powers flip sign.',
        },
        {
          expression: '\\text{Signs: } -, -, -, +, -, - \\Rightarrow \\text{2 sign changes} \\Rightarrow \\text{2 or 0 negative real roots}',
          annotation: 'Changes at positions 3-4 and 4-5. So 2 or 0 negative real roots.',
        },
      ],
      conclusion: "Descartes' Rule predicts (3 or 1) positive and (2 or 0) negative roots. Combined with degree 5, the remaining roots are complex conjugate pairs.",
    },
  ],
  story:[{
  "title": "Decoupling the Monolith",
  "subtitle": "A legacy system crashing at unknown intervals. A monolithic equation. Forensic detectives, manual milling, and a high-speed CNC pipeline to break it down into clean, isolated components.",
  "acts": [
    {
      "label": "Act I",
      "title": "The Monolithic Architecture",
      "content": "Imagine staring at a terminal at 2:00 AM. The system keeps crashing, and the entire failure profile is modeled by a single, gigantic monolithic function:\n\n$$p(x) = 2x^4 - 3x^3 - 12x^2 + 7x + 6$$\n\nThis is a polynomial. It is a sum of terms where constants (coefficients) are multiplied by a variable $x$ raised to positive integer powers. The degree of this monolith is 4 (the highest exponent), which means there are exactly 4 critical failure points—called roots—we need to isolate.\n\nRight now, the architecture is tangled. To fix it, we must refactor this monolith into single-responsibility, modular components: linear factors of the form $(x - r)$. Each root $r$ represents an exact timestamp where the system fails. We cannot guess our way through this. We will use rigorous principles to dismantle the codebase piece by piece."
    },
    {
      "label": "Act II",
      "title": "The Refactoring Strategy",
      "content": "To decouple the monolith, we need to extract its hidden linear modules. We do this by testing possible roots and dividing them out. Polynomial division is like extracting a verified subroutine from a legacy codebase. When we divide $p(x)$ by a linear factor $(x - r)$, two things happen:\n\n1. If $r$ is a true root (a valid failure point), the remainder is zero, confirming a clean extraction.\n2. The quotient becomes our new, simplified polynomial—a lower-degree system we can continue to break down.\n\nWe will use two distinct methods to achieve this: a meticulous, manual process to understand the underlying mechanics, and a high-speed automated pipeline for rapid extraction."
    },
    {
      "label": "Act III",
      "title": "Profiling the Edge Cases (The Forensic Tools)",
      "content": "Before we start cutting away at the monolith, we must profile the system to find our suspects. We don't test random numbers; we deploy our Forensic Tools—two mathematical detectives that narrow our search space.\n\n**Detective 1: Descartes' Rule of Signs.** We count how many times the signs of our coefficients change. For $p(x) = 2x^4 - 3x^3 - 12x^2 + 7x + 6$, the signs are (+, -, -, +, +). The sign changes from + to - (once) and from - to + (twice). That is 2 sign changes, meaning there are exactly 2 or 0 positive real roots. Evaluating $p(-x)$ gives signs (+, +, -, -, +), which also has 2 changes. We have 2 or 0 negative roots!\n\n**Detective 2: Rational Zeros Theorem.** This gives us the exact list of rational suspects. Any rational root $p/q$ must have $p$ as a factor of the constant term (6) and $q$ as a factor of the leading coefficient (2).\nFactors of 6: $\\pm 1, \\pm 2, \\pm 3, \\pm 6$\nFactors of 2: $\\pm 1, \\pm 2$\nOur complete list of testable modules is: $\\pm 1, \\pm 2, \\pm 3, \\pm 6, \\pm 1/2, \\pm 3/2$."
    },
    {
      "label": "Act IV",
      "title": "The Manual Mill Approach (Long Division)",
      "content": "Let us test the candidate $x = 1$ using **The Manual Mill Approach** (explicit long division). We want to divide our monolith by $(x - 1)$. We will do this step-by-step, hand-cranking each axis to see the exact mechanics of the cut, ensuring we understand the gears turning before we automate it.\n\n**Step 1:** Divide the leading term $2x^4$ by $x$. This gives $2x^3$. Write this in the quotient.\n**Step 2:** Multiply $2x^3$ by the divisor $(x - 1)$ to get $2x^4 - 2x^3$. Subtract this from the monolith. The $2x^4$ terms cancel, leaving $-x^3$. Bring down the $-12x^2$.\n**Step 3:** Divide $-x^3$ by $x$ to get $-x^2$. Multiply $-x^2(x - 1) = -x^3 + x^2$. Subtracting this leaves $-13x^2$. Bring down the $7x$.\n**Step 4:** Divide $-13x^2$ by $x$ to get $-13x$. Multiply $-13x(x - 1) = -13x^2 + 13x$. Subtracting leaves $-6x$. Bring down the $6$.\n**Step 5:** Divide $-6x$ by $x$ to get $-6$. Multiply $-6(x - 1) = -6x + 6$. Subtracting leaves exactly $0$.\n\nThe remainder is 0. Extraction successful! Our monolithic system is now cleanly factored as $p(x) = (x - 1)(2x^3 - x^2 - 13x - 6)$."
    },
    {
      "label": "Act V",
      "title": "The CNC Pipeline (Synthetic Division)",
      "content": "For the remaining cubic, $2x^3 - x^2 - 13x - 6$, the manual mill is simply too slow and requires too much hand-cranking. We switch to our optimized, high-speed automated shortcut: **The CNC Pipeline** (Synthetic Division). Once we have the problem fixtured correctly—stripping away the variables and leaving only the essential data—we process it rapidly.\n\nLet's test the candidate $x = -2$.\n\nWrite the fixtured coefficients: $2, -1, -13, -6$.\n**1.** Bring down the leading coefficient: $2$.\n**2.** Multiply by the root candidate ($-2$) and add to the next column: $2 \\cdot (-2) = -4$. Then $-1 + (-4) = -5$.\n**3.** Multiply and add again: $-5 \\cdot (-2) = 10$. Then $-13 + 10 = -3$.\n**4.** Multiply and add the final column: $-3 \\cdot (-2) = 6$. Then $-6 + 6 = 0$.\n\nRemainder zero! The root $x = -2$ is verified. The resulting quotient coefficients $(2, -5, -3)$ represent a quadratic subroutine: $2x^2 - 5x - 3$. This can be easily factored using standard quadratic principles into $(2x + 1)(x - 3)$."
    }
  ],
  "resolution": "The refactoring is complete. By applying our Forensic Tools to generate suspects and anticipate the architecture, and running our extraction through both the Manual Mill and the CNC Pipeline, we have completely decoupled the monolithic codebase.\n\nThe final, modular system is:\n$$p(x) = (x - 1)(x + 2)(2x + 1)(x - 3)$$\n\nOur system fails at exactly four distinct timestamps: $x = 1, -2, -1/2, \\text{ and } 3$. Notice that we found exactly two positive roots ($1, 3$) and two negative roots ($-2, -1/2$), perfectly satisfying the profiling from Descartes' Rule.\n\n**A Final Note on the Architecture:**\nOur system failed at exactly four distinct, real-world timestamps. But what if we had only found two? According to the Fundamental Theorem of Algebra, a degree-4 monolith *always* has exactly 4 roots. If they don't show up on our real-world axis, they are **Ghost Suspects**—complex, imaginary roots that haunt the underlying mathematics of the system without physically manifesting. Fortunately, for this specific codebase, our profile came up clean, all four suspects were caught in the light of day, and the crash is finally resolved."
},
    {
  "title": "The Vanishing Roots",
  "subtitle": "A mysterious polynomial. A list of possible killers. One rule that narrows every suspect. One division that reveals the truth.",
  "acts": [
    {
      "label": "The Scene",
      "title": "The Crime Scene Equation",
      "content": `Imagine a detective standing over a crime scene. On the whiteboard is a single polynomial equation that models the entire mystery:

$$p(x) = 2x^4 - 7x^3 + 5x^2 - 8x - 4$$

The detective needs to factor this completely — to find every root, every linear factor, every hidden piece of the story. The roots are the exact moments when something critical happened. But the polynomial is degree 4, so there could be up to 4 real roots. Some may be rational, some irrational, some complex. Where do you even start?

This is not guesswork. There are three powerful tools — **Polynomial Division**, the **Rational Zeros Theorem**, and **Descartes' Rule of Signs** — that together turn a chaotic degree-4 polynomial into clean, factored form. We will build every single piece from scratch: what a polynomial is, why we divide, how division actually works, why certain numbers are the only possible rational roots, and how sign changes tell us exactly how many positive or negative roots exist.

By the end of this investigation you will understand not only how to solve this specific crime, but why these tools work for any polynomial you will ever meet.`
    },
    {
      "label": "Act I",
      "title": "What Is a Polynomial?",
      "content": `**Define the variable.**  
Let $p(x)$ be a polynomial function. It is simply a sum of terms where each term is a coefficient (a constant number) multiplied by a power of $x$ (a non-negative integer exponent).

A general polynomial looks like:
\\[p(x) = a_n x^n + a_{n-1} x^{n-1} + \\dots + a_1 x + a_0\\]

- $a_n$ is the **leading coefficient** (never zero).
- $n$ is the **degree** (highest power).
- $a_0$ is the **constant term**.

In our crime scene equation the degree is 4 (the highest power is $x^4$), the leading coefficient is 2, and the constant term is –4.

Polynomials are the “smooth machines” of algebra. They are continuous, differentiable everywhere, and behave predictably at infinity. Our job is to break this machine into its smallest linear pieces: factors of the form $(x - r)$. Each root $r$ tells us exactly where the machine crosses zero — the moment the mystery “happens.”`
    },
    {
      "label": "Act II",
      "title": "Descartes' Rule of Signs — Narrowing the Suspects",
      "content": `Before we test anything, **Descartes' Rule of Signs** gives us a powerful first clue about how many positive and negative roots are possible.

**For positive roots:** Count the number of sign changes in $p(x)$:  
Coefficients: 2  –7  +5  –8  –4  
Sign pattern: +   –   +   –   –  
There are **3 sign changes**.  
This means there are either **3 or 1** positive real roots (the number of sign changes or less by an even number).

**For negative roots:** Evaluate $p(-x)$ and count sign changes:  
$p(-x) = 2x^4 + 7x^3 + 5x^2 + 8x - 4$  
Sign pattern: +   +   +   +   –  
There is **1 sign change**.  
This means there is **exactly 1** negative real root.

**Detective's Note:** This rule does not tell us the exact roots, but it tells us what to expect. It narrows the search dramatically and prepares us for what the graph should look like.`
    },
    {
      "label": "Act III",
      "title": "The Rational Zeros Theorem — The List of Suspects",
      "content": `We cannot test every possible number in the universe. The **Rational Zeros Theorem** gives us the complete, finite list of possible rational roots.

**Statement:**  
If a polynomial with integer coefficients has a rational root $p/q$ (written in lowest terms), then:
- $p$ must be a factor of the constant term ($a_0$),
- $q$ must be a factor of the leading coefficient ($a_n$).

**Why this is true (the logic behind the magic):**  
Suppose the polynomial factors completely as $p(x) = a_n (x - r_1)(x - r_2)\\dots(x - r_n)$.  
When you multiply everything out, the constant term $a_0$ is formed by multiplying all the roots together (with a sign) and the leading coefficient.  
Therefore, any rational root $p/q$ must divide the constant term in the numerator and the leading coefficient in the denominator. It is pure evidence from the structure of the factored form — not magic.

For our polynomial $2x^4 - 7x^3 + 5x^2 - 8x - 4$:

- Constant term = –4 → possible $p$: ±1, ±2, ±4
- Leading coefficient = 2 → possible $q$: ±1, ±2

All possible rational roots are:
\\[\\pm1, \\pm2, \\pm4, \\pm\\frac{1}{2}\\]

Only eight suspects. This is a huge reduction.`
    },
    {
      "label": "Act IV",
      "title": "Polynomial Division — The Manual Mill Approach",
      "content": `To test each suspect we use **polynomial division**. Think of this as the **Manual Mill** approach — reliable, slow, but you see every gear turning.

Polynomial division is exactly like long division of numbers, but with variables. When we divide $p(x)$ by a linear factor $(x - r)$:

- If $r$ is truly a root, the remainder is zero.
- The quotient is a lower-degree polynomial we can continue factoring.

**Why it works:** Each step cancels the highest term, reducing the degree by 1, just like peeling layers off an onion.

Let us demonstrate with a candidate, say $x = 2$, using long division on $2x^4 - 7x^3 + 5x^2 - 8x - 4$ divided by $(x - 2)$.

**Step 1:** Divide leading terms: $2x^4 \\div x = 2x^3$.  
**Step 2:** Multiply $2x^3(x - 2) = 2x^4 - 4x^3$.  
**Step 3:** Subtract and bring down next term:  
$(2x^4 - 7x^3) - (2x^4 - 4x^3) = -3x^3$. Bring down +5x² → -3x³ + 5x².

Continue this process carefully until the end. Every subtraction lowers the degree. This is slow but shows exactly why the shortcut in the next act works.`
    },
    {
      "label": "Act V",
      "title": "Synthetic Division — The CNC Shortcut",
      "content": `Once you understand the Manual Mill (long division), **synthetic division** is the **CNC Program** — fast, optimized, and elegant, but it only works when dividing by a linear factor $(x - r)$.

It uses the same additions and multiplications as long division, but compresses them into one clean row.

**How to run the CNC program (for root $r = 2$):**

Coefficients: 2 | –7 | 5 | –8 | –4

Bring down 2.  
Multiply by 2 → 4; add to –7 → –3.  
Multiply by 2 → –6; add to 5 → –1.  
Multiply by 2 → –2; add to –8 → –10.  
Multiply by 2 → –20; add to –4 → –24.

Bottom row: 2 | –3 | –1 | –10 | –24

The last number is the remainder. Since it is not zero, $x = 2$ is **not** a root.

When the remainder **is** zero, the numbers before it are the coefficients of the quotient polynomial, and we have found a real root. This is much faster than long division once you trust the pattern.`
    },
    {
      "label": "Act VI",
      "title": "The Investigation — Testing Suspects and Finding Roots",
      "content": `We now test our eight possible rational roots one by one using synthetic division.

After careful testing, we discover that $x = 2$ gives a non-zero remainder, but $x = -1$ and $x = 4$ are actual roots (remainder zero). Each successful division gives us a lower-degree quotient.

We continue dividing the resulting cubic and quadratic until everything factors into linear pieces.

The full factorization turns out to be:
\\[p(x) = 2(x + 1)(x - 2)(x - \\frac{1}{2})(x - 4)\\]

(We can multiply by 2 to make all factors monic if preferred.)

**Verification:** Plug each root back into the original polynomial — each gives exactly zero, confirming they are true roots.`
    },
    {
      "label": "Act VII",
      "title": "The Ghost Suspects — Complex Roots",
      "content": `Not every root appears on the real number line. Some roots are complex — we call them **Ghost Suspects**.

They never actually cross the x-axis (the physical crime scene), but they still affect the shape of the graph. Complex roots always come in conjugate pairs (if $a + bi$ is a root, then $a - bi$ is also a root). This is why polynomials with real coefficients can have an even number of non-real roots.

In our case, after finding the four real roots above, there are no ghost suspects left. But in other polynomials you may find only two real roots — the other two will be a complex conjugate pair hiding off the real line, still influencing how the curve behaves between the real roots.`
    }
  ],
  "resolution": `**The complete detective procedure for factoring polynomials with integer coefficients:**

1. **Apply Descartes' Rule of Signs** — know how many positive and negative roots to expect.
2. **List all possible rational roots** using the Rational Zeros Theorem (factors of constant term over factors of leading coefficient).
3. **Test each candidate** using synthetic division (the fast CNC method) until you find roots.
4. **Divide out each found root** and repeat on the quotient.
5. **Handle any remaining quadratic** with the quadratic formula if it does not factor nicely.
6. **Account for ghost suspects** — complex roots come in conjugate pairs.

**The deeper truth:** These tools are not random tricks. Descartes' Rule reads the sign pattern of the polynomial like a suspect profile. The Rational Zeros Theorem uses the structure of the factored form to limit suspects logically. Polynomial division (manual or synthetic) is the interrogation that proves which suspects are guilty. Together they turn any integer-coefficient polynomial into its complete factored story, revealing every real root and every hidden linear factor.

You now have the full detective kit. The next time you meet a stubborn polynomial, you know exactly where to start, why each step works, and how the entire mystery resolves.`
  }
  ],

  challenges: [
    {
      id: 'ch2-008-ch1',
      difficulty: 'medium',
      problem: '\\text{Find all real zeros of } f(x) = x^4 - 2x^3 - 7x^2 + 8x + 12.',
      hint: 'List rational candidates. Test $x = -1$ first (often easiest). Use synthetic division twice to reduce to a quadratic.',
      walkthrough: [
        {
          expression: 'f(-1) = 1+2-7-8+12 = 0 \\checkmark \\quad \\text{so } (x+1) \\text{ is a factor}',
          annotation: 'Test $x=-1$ quickly by substitution.',
        },
        {
          expression: '\\text{Synthetic division by } (x+1) \\Rightarrow x^3-3x^2-4x+12',
          annotation: 'Reduced to cubic.',
        },
        {
          expression: 'f(3) = 27-27-12+12 = 0 \\checkmark \\Rightarrow (x-3) \\text{ factor}',
          annotation: 'Test $x=3$ on the cubic.',
        },
        {
          expression: '\\text{Synthetic division by } (x-3) \\Rightarrow x^2-4 = (x-2)(x+2)',
          annotation: 'Remaining quadratic factors easily.',
        },
        {
          expression: 'f(x) = (x+1)(x-3)(x-2)(x+2). \\text{ Roots: } x = -2,-1,2,3.',
          annotation: 'Four real roots. Check: sum of roots $= -2-1+2+3=2 = -(-2)/1 = 2$ ✓ (Vieta\'s).',
        },
      ],
      answer: 'x = -2, -1, 2, 3',
    },
    {
      id: 'ch2-008-ch2',
      difficulty: 'hard',
      problem: '\\text{Find a degree-4 polynomial with integer coefficients that has roots } x=2, x=-3, \\text{ and } x=1+2i.',
      hint: 'Complex roots come in conjugate pairs. What is the fourth root?',
      walkthrough: [
        {
          expression: '\\text{Since } 1+2i \\text{ is a root, so is } 1-2i.',
          annotation: 'Conjugate pairs — coefficients are real.',
        },
        {
          expression: '(x-(1+2i))(x-(1-2i)) = (x-1)^2 - (2i)^2 = x^2-2x+1+4 = x^2-2x+5',
          annotation: 'Multiply conjugate pair — always gives an irreducible quadratic.',
        },
        {
          expression: 'f(x) = (x-2)(x+3)(x^2-2x+5)',
          annotation: 'All four factors.',
        },
        {
          expression: '= (x^2+x-6)(x^2-2x+5) = x^4-x^3-x^2+17x-30',
          annotation: 'Expand. Integer coefficients confirmed.',
        },
      ],
      answer: 'f(x) = x^4 - x^3 - x^2 + 17x - 30',
    },
  ],

  calcBridge: {
    teaser: 'Finding roots of polynomials reappears in calculus when solving $f\'(x) = 0$ to find critical points, and when factoring denominators for partial fraction decomposition before integration. The rational zeros theorem and synthetic division are the manual tools for the same problem that numerical methods (Newton\'s method) solve computationally.',
    linkedLessons: ['factoring-every-method', 'rational-expressions-partial-fractions'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The Rational Zero Theorem says the possible rational roots of 2x³ − 3x² − 11x + 6 are ±p/q where p divides 6 and q divides 2. What is the complete list?',
      options: [
        '±1, ±2, ±3, ±6 only — the divisors of the constant term',
        '±1, ±2, ±3, ±6, ±1/2, ±3/2 — all fractions (divisors of 6) / (divisors of 2)',
        '±1, ±2 only — only integer divisors of the leading coefficient matter',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You verify that x = 3 is a root of 2x³ − 3x² − 11x + 6. After synthetic division, the quotient is 2x² + 3x − 2. What does this tell you?',
      options: [
        'The polynomial has only one root, x = 3, and the quotient is the remainder after dividing',
        '2x³ − 3x² − 11x + 6 = (x − 3)(2x² + 3x − 2), so the remaining roots come from factoring 2x² + 3x − 2 further',
        'The root x = 3 has multiplicity 2, because the quotient is a quadratic',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does finding polynomial roots matter when computing critical points in calculus?',
      options: [
        'Critical points require integration, and polynomial roots determine the limits of integration',
        'Setting f\'(x) = 0 produces a polynomial equation; solving it means finding its roots — the same rational zeros / synthetic division techniques apply to the derivative polynomial',
        'Roots of the original function f(x) are always the same as critical points, so the same calculation finds both',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Descartes\' Rule of Signs says a polynomial\'s number of positive real roots equals the number of sign changes in its coefficients, or less by an even number. For 2x³ − 3x² − 11x + 6, the sign pattern is +, −, −, +. How many sign changes are there?',
      options: [
        '1 — the only sign change is from − to + at the end',
        '2 — the sign changes at positions (+ to −) and (− to +)',
        '3 — every coefficient changes sign relative to its neighbor',
      ],
      correct: 1,
    },
  ],
}
