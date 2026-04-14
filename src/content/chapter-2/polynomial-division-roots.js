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
    prose: [
      '**Appendix Tool Lesson — Not Part of the Main Derivative Story:** This lesson is a reference resource, not part of the ten-lesson arc of Chapter 2. You do not need it to understand derivatives. Come here when a calculus problem produces a polynomial that needs to be factored, and you need to find its roots systematically. The core story of Chapter 2 (Lessons 1–10) is complete before you reach this lesson.',

      'Dividing polynomials is identical to dividing integers — same algorithm, just with powers of $x$ instead of powers of 10. Long division of $x^3 + 2x^2 - 5x - 6$ by $(x-2)$ proceeds: how many times does $x$ go into $x^3$? Answer: $x^2$. Multiply, subtract, bring down. Repeat. The result is a quotient and a remainder.',
      'Synthetic division is long division compressed into a row of numbers — it only works when the divisor is linear of the form $(x - c)$. Write only the coefficients of the dividend, write $c$ to the left, and follow the bring-down-multiply-add pattern. It is faster than long division and less error-prone once you know the pattern.',
      'The Remainder Theorem connects division to evaluation: when you divide $f(x)$ by $(x-c)$, the remainder equals $f(c)$. This means synthetic division simultaneously divides the polynomial AND evaluates it at $c$. The Factor Theorem follows: $(x-c)$ is a factor of $f(x)$ if and only if $f(c) = 0$ — i.e., $c$ is a root.',
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
  story:{
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
      "title": "Why We Divide Polynomials",
      "content": `To factor $p(x)$ we need to discover its hidden linear factors. The fastest way is to test possible roots and divide them out.

**Polynomial division** is exactly like ordinary long division of numbers, but with variables. When we divide $p(x)$ by a linear factor $(x - r)$, two things happen:

1. If $r$ is truly a root, the remainder is zero and we get a cleaner, lower-degree polynomial.
2. The quotient becomes the new polynomial we can factor further.

We will use two versions: the old-school **long division** (to see why it works) and the shortcut **synthetic division** (once we understand the pattern). Both are based on the same idea: repeatedly multiply and subtract until the remainder is zero.`
    },
    {
      "label": "Act III",
      "title": "Long Division — Seeing the Machinery",
      "content": `Let us perform long division on our polynomial to see every step explicitly.

We will first test a possible root (we will find candidates in the next act). For now, suppose we test $x = 2$ as a possible root.

Set up the division of $2x^4 - 7x^3 + 5x^2 - 8x - 4$ by $(x - 2)$:

**Step 1:** Divide the leading term of the dividend by the leading term of the divisor:  
$2x^4 \\div x = 2x^3$. Write $2x^3$ above the line.

**Step 2:** Multiply $2x^3$ by the entire divisor $(x - 2)$:  
$2x^3(x - 2) = 2x^4 - 4x^3$.

**Step 3:** Subtract this from the original polynomial:  
$(2x^4 - 7x^3 + 5x^2 - 8x - 4) - (2x^4 - 4x^3) = -3x^3 + 5x^2 - 8x - 4$.

**Step 4:** Bring down the next term (already done) and repeat:  
$-3x^3 \\div x = -3x^2$. Multiply $-3x^2(x - 2) = -3x^3 + 6x^2$.  
Subtract: $(-3x^3 + 5x^2) - (-3x^3 + 6x^2) = -x^2$.

Continue this process until the end. Every subtraction cancels the leading term, lowering the degree by one each time.

This is tedious but crystal clear — it shows exactly why synthetic division works later.`
    },
    {
      "label": "Act IV",
      "title": "Synthetic Division — The Shortcut That Works",
      "content": `Once we understand long division, synthetic division is the same process compressed.

**Why it works:** it uses the fact that when dividing by $(x - r)$, every multiplication by $r$ and subtraction is exactly what the Remainder Theorem predicts.

For our polynomial and possible root $r = 2$:

Coefficients of $p(x)$: 2 | –7 | 5 | –8 | –4

Bring down the leading coefficient 2.

Multiply by 2 and add to the next coefficient:  
2 × 2 = 4; –7 + 4 = –3

Multiply by 2 and add:  
–3 × 2 = –6; 5 + (–6) = –1

Multiply by 2 and add:  
–1 × 2 = –2; –8 + (–2) = –10

Multiply by 2 and add:  
–10 × 2 = –20; –4 + (–20) = –24

The bottom row is the quotient coefficients (2, –3, –1, –10) and the last number is the remainder (–24). Since the remainder is not zero, $x = 2$ is **not** a root.

When the remainder **is** zero, the bottom row (except the last number) gives the coefficients of the quotient polynomial, and the last number confirms the root.`
    },
    {
      "label": "Act V",
      "title": "The Rational Zeros Theorem — The List of Suspects",
      "content": `We cannot test every possible number. The **Rational Zeros Theorem** gives us the complete, finite list of possible rational roots.

**Statement (why it is true):**  
If a polynomial has integer coefficients and a rational root $p/q$ (in lowest terms), then $p$ must be a factor of the constant term, and $q$ must be a factor of the leading coefficient.

For our polynomial $2x^4 - 7x^3 + 5x^2 - 8x - 4$:

- Constant term = –4 → possible $p$ values: ±1, ±2, ±4
- Leading coefficient = 2 → possible $q$ values: ±1, ±2

All possible rational roots are all combinations $p/q$:
\\[\\pm1, \\pm2, \\pm4, \\pm\\frac{1}{2}\\]

Only eight suspects. We test them one by one using synthetic division until we find a root that gives remainder zero.`
    },
    {
      "label": "Act VI",
      "title": "Descartes' Rule of Signs — Narrowing the Suspects",
      "content": `Before we test, **Descartes' Rule of Signs** tells us exactly how many positive and negative roots are possible.

**For positive roots:** count the number of sign changes in $p(x)$:  
Coefficients: 2  –7  +5  –8  –4  
Sign pattern: +   –   +   –   –  
Sign changes: from + to – (1), – to + (2), + to – (3).  
**3 sign changes** → possible 3 or 1 positive real roots.

**For negative roots:** evaluate $p(-x)$ and count sign changes:  
$p(-x) = 2x^4 + 7x^3 + 5x^2 + 8x - 4$  
Sign pattern: +   +   +   +   –  
**1 sign change** → exactly 1 negative real root.

This narrows the search dramatically and tells us what to expect when we factor.`
    },
    {
      "label": "Act VII",
      "title": "Solving the Mystery — Testing and Factoring",
      "content": `Now we test the eight possible rational roots using synthetic division.

After testing, we discover $x = 2$ is **not** a root (remainder –24), but $x = 4$ **is** a root (remainder 0). The quotient is $2x^3 - x^2 - 3x - 1$.

We repeat the process on the cubic until it factors completely into linear factors.

Each successful division lowers the degree and gives us one root. When we reach a quadratic, we can use the quadratic formula if needed, but in this case the remaining factors are also linear.

The full factorization is:
\\[p(x) = (x - 2)(x + 1)(2x - 1)(x - 4)\\]

(We verify by expanding or by plugging the roots back in — every root satisfies $p(r) = 0$.)`
    }
  ],
  "resolution": `**The complete procedure for any polynomial with integer coefficients:**

1. **Write the polynomial** in standard form.
2. **Apply Descartes' Rule of Signs** to know how many positive and negative roots to expect.
3. **List all possible rational roots** using the Rational Zeros Theorem (factors of constant term over factors of leading coefficient).
4. **Test each candidate** using synthetic division until you find a root that gives remainder zero.
5. **Repeat** on the quotient polynomial until it is fully factored into linear and quadratic factors.
6. **Solve any remaining quadratics** with the quadratic formula if they do not factor nicely.

**The deeper truth:** These three tools are not separate tricks — they are a single logical chain. Descartes' Rule narrows the search. The Rational Zeros Theorem gives the only numbers worth testing. Polynomial division (long or synthetic) proves which of those numbers are actually roots and peels away each linear factor. Together they turn any integer-coefficient polynomial into its complete factored form, revealing every root and every hidden linear piece.

You now have the full detective kit. The next time you meet a polynomial crime scene, you know exactly where to start, why each step works, and how the story ends.`
},

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
}
