export default {
  id: "ch0-rosetta",
  slug: "math-rosetta-stone",
  chapter: 0,
  order: 0,
  title: "The Mathematical Rosetta Stone",
  subtitle: "Every rule proved with numbers alongside letters — from PEMDAS to Calculus. Come back here whenever something looks like magic.",
  tags: [
    "prerequisites", "PEMDAS", "order of operations", "distributive property",
    "exponents", "factoring", "fractions", "identities", "algebra", "limits",
    "sigma notation", "reference", "Rosetta Stone", "how to think",
  ],

  hook: {
    question: "Why does calculus feel like magic? Because the algebra underneath it is invisible. When a textbook writes \\frac{x^2 - 9}{x - 3} = x + 3 and then cancels, it skips the step that makes it work. When it writes \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h} = 2x, it hides four lines of algebra in one arrow. This lesson makes every hidden step visible — by proving every rule twice: once with numbers you can verify on a calculator, and once with letters that work for everything.",
    realWorldContext: "Every field that uses mathematics eventually hits a wall where the algebra looks like sorcery. Engineers stare at \\frac{d}{dt}[e^{st}] = se^{st} and wonder why. Students cancel \\frac{2x}{2} = x correctly but then wrongly cancel \\frac{x+2}{2} = x+1. The Rosetta Stone approach — proving every rule with a specific number right next to the general letter — eliminates the gap between 'I memorized it' and 'I understand it.' Once you see that (10+3)² = 100 + 60 + 9 and (a+b)² = a² + 2ab + b² are the exact same computation, the formula stops being magic and starts being arithmetic.",
    previewVisualizationId: "RosettaStoneViz",
  },

  intuition: {
    prose: [
      "The single biggest source of confusion in calculus is not calculus — it is algebra. Specifically, it is the algebra steps that textbooks skip because 'students should already know this.' The goal of this lesson is to rebuild every skipped step from scratch, using a side-by-side proof: the left column uses a specific number (like 3 or 10), and the right column uses a letter (like x or a). Both columns do the exact same arithmetic. The number column is always checkable on a calculator. Once you trust the number column, the letter column stops looking like a trick.",
      "The 'Algebra Tax' is the name we give to the mandatory manipulation steps that appear before you can do any calculus. Before you can take a derivative of \\frac{x^2-9}{x-3}, you must pay the algebra tax: factor the numerator, cancel, simplify. Before you can evaluate \\lim_{h\\to 0} \\frac{\\sqrt{x+h}-\\sqrt{x}}{h}, you must pay the conjugate tax. These taxes are not calculus — they are arithmetic dressed in variables. This lesson catalogs every tax you will ever pay, with a receipt showing exactly what rule justifies each step.",
      "Order matters in mathematics for one reason: different operations undo each other at different speeds. Multiplication undoes addition faster than addition undoes itself. Exponents pack multiplication the way multiplication packs addition. Understanding why PEMDAS is ordered the way it is — not just that it is ordered that way — lets you read any expression and instantly see the order in which it wants to be simplified. This is the difference between a student who memorizes the rule and a student who sees the structure.",
      "Every algebraic identity is a shortcut for arithmetic you could always do the long way. (a+b)² = a²+2ab+b² is not a definition — it is the result of multiplying (a+b)(a+b) using the distributive property twice. The difference of squares a²-b² = (a-b)(a+b) is not a formula to memorize — it is what you get when you expand (a-b)(a+b) and watch the middle terms cancel. If you forget any identity, you can always re-derive it in 30 seconds by going back to the distributive property. That is the point: one rule (distributive property) generates all the others.",
      "The cancellation trap is the most common algebra error in calculus. Students cancel \\frac{6}{3} = 2 (correct: a factor of 3 cancels), then apply the same thinking to \\frac{x+6}{3} = x+2 (wrong: you cannot cancel a term, only a factor). The rule is: cancellation requires the thing you are canceling to be multiplied across the entire numerator and the entire denominator. A factor cancels; a term does not. Learning to tell factors from terms — instantly, by inspection — eliminates this entire class of error.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "The One Rule That Generates All Others",
        body: "Every algebraic identity in this lesson — difference of squares, perfect square trinomial, sum of cubes — is just the distributive property applied repeatedly. If you understand a(b+c) = ab+ac deeply, you can re-derive everything else. You only truly need to memorize one rule.",
      },
      {
        type: "warning",
        title: "The Cancellation Trap: Factors vs. Terms",
        body: "You can cancel FACTORS (things connected by multiplication), never TERMS (things connected by addition or subtraction). \\frac{3x}{3} = x because 3 is a factor of the whole numerator. But \\frac{3+x}{3} \\neq 1+x because 3 is only a term in the numerator, not a factor of all of it. Always ask: 'Is the thing I want to cancel multiplied across everything, or just added to something?'",
      },
      {
        type: "real-world",
        title: "The Algebra Tax in Calculus",
        body: "Before you differentiate \\frac{x^3-8}{x-2}, you must factor (algebra tax: difference of cubes). Before you differentiate \\sqrt{x+h} - \\sqrt{x}, you must rationalize (algebra tax: conjugate). Before you integrate \\frac{x^2+3x+2}{x+1}, you must factor and cancel (algebra tax: polynomial simplification). The calculus step itself is often one line. The algebra tax is the other five.",
      },
      {
        type: "geometric",
        title: "Side-by-Side Proof: Trust the Numbers First",
        body: "Every rule in this lesson is shown twice: with a number you can verify (like n=3), and with a letter that generalizes (like n). If the number version checks out on a calculator, the letter version is the same computation — just written for any value at once. Start with the number. Trust the letter.",
      },
      {
        type: "misconception",
        title: "√(a² + b²) ≠ a + b",
        body: "One of the most common errors: \\sqrt{9 + 16} \\neq 3 + 4. The left side is \\sqrt{25} = 5. The right side is 7. Radicals do NOT distribute over addition. This fails for the same reason (a+b)² \\neq a²+b²: there are cross terms. Square roots and squares are not linear operations.",
      },
      {
        type: "history",
        title: "Why Algebra Predates Calculus",
        body: "Newton and Leibniz invented calculus in the 1660s–1680s. But al-Khwarizmi wrote the first algebra textbook in 820 AD — 850 years earlier. Calculus is built on top of algebra the way algebra is built on top of arithmetic. Every calculus technique ultimately reduces to the algebraic tools described in this lesson.",
      },
    ],
    visualizations: [
      {
        id: "RosettaStoneViz",
        title: "Side-by-Side Proof Explorer",
        mathBridge: "Interactive: type any expression with a number on the left and a variable on the right. The visualizer evaluates both and shows they are identical operations, step by step.",
        caption: "Every identity proved numerically and algebraically simultaneously.",
      },
      {
        id: "DistributivePropertyViz",
        title: "The Distributive Property — Area Model",
        mathBridge: "A rectangle with width (a+b) and height (c+d) has area (a+b)(c+d) = ac + ad + bc + bd. The four sub-rectangles are the four terms. FOIL is just naming the four sub-rectangles.",
        caption: "Geometric proof of the distributive property — no algebra required.",
      },
      {
        id: "ExponentLawsViz",
        title: "Exponent Laws — Counting Dots",
        mathBridge: "x² · x³ = x⁵ because 2 dots times 3 dots = 5 dots when you count the xs being multiplied.",
        caption: "Each exponent law proved by counting multiplication steps.",
      },
    ],
  },

  math: {
    prose: [
      "Formal statement of the order of operations: In any expression, evaluate in this order — (1) expressions inside grouping symbols (parentheses, brackets, absolute value, fraction bars, radical signs) working from innermost outward; (2) exponents and roots; (3) multiplication and division, left to right; (4) addition and subtraction, left to right. The fraction bar acts as both a division sign AND a grouping symbol — the entire numerator is evaluated first, then the entire denominator, then the division.",
      "Factoring versus expanding: Expanding means applying the distributive property outward — (x+2)(x+3) → x²+5x+6. Factoring means finding the grouped form from the expanded form — x²+5x+6 → (x+2)(x+3). These are inverse operations. Calculus uses both: limits often require factoring to cancel, while derivatives often require expanding to differentiate term-by-term.",
      "Complete list of exponent laws: For any base a > 0 and real exponents m, n — (1) aᵐ·aⁿ = aᵐ⁺ⁿ, (2) aᵐ/aⁿ = aᵐ⁻ⁿ, (3) (aᵐ)ⁿ = aᵐⁿ, (4) (ab)ⁿ = aⁿbⁿ, (5) (a/b)ⁿ = aⁿ/bⁿ, (6) a⁰ = 1, (7) a⁻ⁿ = 1/aⁿ, (8) a^(m/n) = (ⁿ√a)ᵐ. Each of these follows from the definition of exponentiation as repeated multiplication.",
      "Complete factoring toolkit: (1) GCF — factor out the greatest common factor first, always. (2) Difference of squares — a²-b² = (a-b)(a+b). (3) Perfect square trinomial — a²+2ab+b² = (a+b)² and a²-2ab+b² = (a-b)². (4) Sum of cubes — a³+b³ = (a+b)(a²-ab+b²). (5) Difference of cubes — a³-b³ = (a-b)(a²+ab+b²). (6) Trinomial factoring — x²+bx+c = (x+p)(x+q) where p+q=b and pq=c. (7) Grouping — for four-term polynomials, factor pairs and extract common binomial.",
      "The conjugate technique: given an expression of the form a+√b or √a-√b in a denominator (or limit numerator), multiply numerator and denominator by the conjugate (same terms, opposite sign between them). The product (√a-√b)(√a+√b) = a-b eliminates the radical. This is a direct application of the difference of squares identity with a = √a and b = √b.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "The Distributive Property (Foundation of Everything)",
        body: "For all real numbers: a(b + c) = ab + ac. This single rule, applied repeatedly, generates every algebraic identity. FOIL, the binomial theorem, difference of squares, sum of cubes — all are instances of the distributive property applied two or more times.",
      },
      {
        type: "theorem",
        title: "The Difference of Squares Identity",
        body: "(a-b)(a+b) = a² - b². Proof: expand using distributive property: a·a + a·b - b·a - b·b = a² + ab - ab - b² = a² - b². The middle terms always cancel. This identity is used in rationalization, factoring, and the definition of the derivative for square root functions.",
      },
      {
        type: "theorem",
        title: "The Three Factoring Cubes",
        body: "a³ - b³ = (a-b)(a²+ab+b²) and a³ + b³ = (a+b)(a²-ab+b²). Memory trick: the first factor matches the sign of the original, the second factor has opposite middle sign, and the last term is always +b². These appear in limits like \\lim_{x\\to 2} \\frac{x^3-8}{x-2}.",
      },
      {
        type: "warning",
        title: "The Fraction Bar Is a Grouping Symbol",
        body: "\\frac{3+5}{4} means (3+5)/4 = 8/4 = 2, NOT 3 + (5/4). Everything in the numerator is grouped, everything in the denominator is grouped, before the division happens. This is why \\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] requires the quotient rule — the numerator is an entire function, not just one term.",
      },
      {
        type: "misconception",
        title: "You CANNOT Distribute Exponents Over Addition",
        body: "(a+b)² ≠ a²+b². Numerical proof: (3+4)² = 49 but 3²+4² = 9+16 = 25. The correct expansion is (a+b)² = a²+2ab+b². The '2ab' cross term is always missing when students distribute the exponent incorrectly. The same error appears as \\sqrt{a+b} \\neq \\sqrt{a}+\\sqrt{b}.",
      },
    ],
  },

  examples: [
    // ═══════════════════════════════════════════════════════
    // PHASE 1 — THE FOUNDATIONS
    // ═══════════════════════════════════════════════════════
    {
      id: "ch0-rosetta-ex01",
      title: "Phase 1 — Order of Operations: Why the Order Is What It Is",
      problem:
        "\\text{Evaluate } 2 + 3 \\times 4 \\text{ and explain why multiplication happens before addition. Then generalize to } a + b \\times c.",
      steps: [
        {
          expression: "2 + 3 \\times 4 = ?",
          annotation:
            "NUMBERS: If we add first: (2+3)×4 = 5×4 = 20. If we multiply first: 2+(3×4) = 2+12 = 14. These give different answers. The convention (multiply first) is chosen because multiplication is repeated addition — 3×4 means 'add 3 four times,' giving a single chunk of 12. The 2 is separate. LETTERS: In a + b×c, the b×c is a single chunk. Adding a to it last is the natural reading.",
        },
        {
          expression: "a + b \\times c = a + (b \\times c)",
          annotation:
            "NUMBERS: 2 + 3×4 = 2 + 12 = 14. LETTERS: a + bc means a + (bc). The multiplication binds tighter than addition because multiplication is the higher-level operation — it packs more arithmetic into one symbol. Order of operations is not arbitrary convention; it reflects the hierarchy of how operations are built on top of each other.",
        },
        {
          expression: "\\text{Fraction bar as grouping: } \\frac{2 + 6}{4} = \\frac{8}{4} = 2.",
          annotation:
            "NUMBERS: 2+6 = 8, then 8/4 = 2. NOT 2 + (6/4) = 2 + 1.5 = 3.5. The fraction bar groups the entire numerator before dividing. LETTERS: \\frac{a+b}{c} means (a+b)/c — the a+b is fully evaluated before the division. This matters enormously in calculus when numerators and denominators contain expressions.",
        },
        {
          expression: "\\text{Exponents before multiply: } 2 \\times 3^2 = 2 \\times 9 = 18, \\text{ not } 6^2 = 36.",
          annotation:
            "NUMBERS: 3² = 9 first, then 2×9 = 18. LETTERS: In 2x², the exponent applies only to x, not to the coefficient 2. So 2x² means 2·(x·x). If you want the coefficient included, write (2x)² = 4x². This distinction appears constantly when differentiating — the coefficient is never squared.",
        },
      ],
      conclusion:
        "PEMDAS is a hierarchy reflecting how operations build on each other: exponents pack multiplication, multiplication packs addition. Higher-level operations are evaluated first because they represent larger bundles of computation. Whenever you see an expression, ask: 'What is the biggest, outermost grouping?' That tells you the last operation to perform.",
    },

    {
      id: "ch0-rosetta-ex02",
      title: "Phase 1 — The Distributive Property: The One Rule That Generates Everything",
      problem:
        "\\text{Prove that } (10 + 2)(10 + 3) = 156 \\text{ using the distributive property. Then prove } (x+2)(x+3) = x^2 + 5x + 6 \\text{ using the exact same steps.}",
      steps: [
        {
          expression: "(10 + 2)(10 + 3)",
          annotation:
            "NUMBERS: We know this equals 12 × 13 = 156. Now watch how the distributive property reaches the same answer. LETTERS: (x+2)(x+3) — we'll expand using the same steps side-by-side.",
        },
        {
          expression: "= 10(10 + 3) + 2(10 + 3)",
          annotation:
            "NUMBERS: Distribute the first group over the second: 10(13) + 2(13) = 130 + 26 = 156. ✓ LETTERS: (x+2)(x+3) = x(x+3) + 2(x+3). This is the distributive property: (a+b)c = ac+bc where a=x, b=2, c=(x+3).",
        },
        {
          expression: "= 100 + 30 + 20 + 6 = 156.",
          annotation:
            "NUMBERS: 10×10=100, 10×3=30, 2×10=20, 2×3=6. Sum = 156. ✓ LETTERS: x·x + x·3 + 2·x + 2·3 = x² + 3x + 2x + 6 = x² + 5x + 6. Every single multiplication in the number version corresponds to one term in the polynomial. FOIL is just naming these four products: First (x²), Outer (3x), Inner (2x), Last (6).",
        },
        {
          expression: "(x+2)(x+3) = x^2 + 5x + 6.",
          annotation:
            "The middle term 5x comes from adding the outer and inner products: 3x + 2x = 5x. In numbers: 30 + 20 = 50, which is the '5 tens' in 156. The algebra and the arithmetic are identical — one just uses a variable instead of 10.",
        },
      ],
      conclusion:
        "The distributive property is the only rule you need. Every identity in algebra — difference of squares, perfect square trinomials, binomial theorem — is just repeated application of a(b+c) = ab+ac. If you ever forget a formula, expand it from the distributive property. The number version always checks out on a calculator.",
    },

    {
      id: "ch0-rosetta-ex03",
      title: "Phase 1 — Fractions: The Common Denominator Tax and the Cancellation Trap",
      problem:
        "\\text{(A) Add } \\frac{1}{3} + \\frac{1}{4}. \\text{ Then add } \\frac{1}{x} + \\frac{1}{y}. \\text{ (B) Simplify } \\frac{6x}{3} \\text{ and explain why } \\frac{6+x}{3} \\neq 2 + x.",
      steps: [
        {
          expression: "\\frac{1}{3} + \\frac{1}{4} = \\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}.",
          annotation:
            "NUMBERS: We multiply 1/3 by 4/4 = 1 (multiplying by 1 doesn't change the value, only the form), and 1/4 by 3/3 = 1. This is the Common Denominator Tax: you must 'buy' a common form before adding. LETTERS: 1/x + 1/y — the common denominator is xy, so multiply 1/x by y/y and 1/y by x/x.",
        },
        {
          expression: "\\frac{1}{x} + \\frac{1}{y} = \\frac{y}{xy} + \\frac{x}{xy} = \\frac{x+y}{xy}.",
          annotation:
            "NUMBERS (verify with x=3, y=4): 1/3 + 1/4 = 4/12 + 3/12 = 7/12. Formula gives (3+4)/(3×4) = 7/12. ✓ The letters are doing exactly what the numbers did. The common denominator tax: you pay by multiplying each fraction by a form of 1 to match denominators.",
        },
        {
          expression: "\\frac{6x}{3} = 2x \\quad \\text{(CORRECT: 3 is a FACTOR of the entire numerator)}.",
          annotation:
            "NUMBERS: Replace x=5. 6(5)/3 = 30/3 = 10 = 2(5). ✓ Why it works: 6x = 3·(2x), so 3 divides the entire numerator. The 3 in numerator and the 3 in denominator are a pair of matching FACTORS (connected by multiplication). Factors cancel across a fraction.",
        },
        {
          expression: "\\frac{6 + x}{3} \\neq 2 + x \\quad \\text{(WRONG: 3 is not a factor of } 6+x \\text{ unless } 3 \\mid x \\text{)}.",
          annotation:
            "NUMBERS: Replace x=1. (6+1)/3 = 7/3 ≈ 2.33. But 2+1 = 3. These are not equal. The 3 in the denominator cannot reach into the numerator and cancel only the 6 — it is not a factor of the whole expression 6+x (unless x happens to be divisible by 3). RULE: A term cancels only if the same factor multiplies EVERYTHING in numerator and denominator.",
        },
        {
          expression: "\\frac{x^2 - 9}{x - 3} = \\frac{(x-3)(x+3)}{x-3} = x + 3 \\quad (x \\neq 3).",
          annotation:
            "NUMBERS: With x=5: (25-9)/(5-3) = 16/2 = 8. And 5+3 = 8. ✓ The cancellation is valid because (x-3) is a FACTOR of the entire numerator after factoring. The factoring step is the algebra tax you pay before the cancellation is legal. This exact simplification appears in the definition of the derivative.",
        },
      ],
      conclusion:
        "Two rules govern all fraction algebra: (1) You can add fractions only after establishing a common denominator — the cost is multiplying each fraction by a form of 1. (2) You can cancel only FACTORS — things that multiply across the entire expression, never terms that are added. Every limit simplification in calculus uses rule (2) — factor first, then cancel.",
    },

    // ═══════════════════════════════════════════════════════
    // PHASE 2 — THE ALGEBRA OF CALCULUS
    // ═══════════════════════════════════════════════════════
    {
      id: "ch0-rosetta-ex04",
      title: "Phase 2 — Exponent Laws: Proved by Counting Multiplications",
      problem:
        "\\text{Prove each exponent law using small numbers, then state the general rule.}",
      steps: [
        {
          expression: "2^3 \\cdot 2^2 = 8 \\cdot 4 = 32 = 2^5. \\quad \\text{Law: } x^a \\cdot x^b = x^{a+b}.",
          annotation:
            "NUMBERS: 2³ = 2·2·2 (three 2s). 2² = 2·2 (two 2s). Product = 2·2·2·2·2 = 2⁵. Just count the 2s. LETTERS: xᵃ·xᵇ means (a copies of x)·(b copies of x) = (a+b copies of x) = xᵃ⁺ᵇ. The exponents add because you are counting copies.",
        },
        {
          expression: "\\frac{2^5}{2^3} = \\frac{32}{8} = 4 = 2^2. \\quad \\text{Law: } \\frac{x^a}{x^b} = x^{a-b}.",
          annotation:
            "NUMBERS: 2⁵/2³ = (2·2·2·2·2)/(2·2·2). Three 2s cancel top and bottom, leaving 2·2 = 2². LETTERS: xᵃ/xᵇ — b copies of x cancel, leaving a-b copies. The exponents subtract because you are un-counting copies.",
        },
        {
          expression: "(2^3)^2 = 8^2 = 64 = 2^6. \\quad \\text{Law: } (x^a)^b = x^{ab}.",
          annotation:
            "NUMBERS: (2³)² = 2³·2³ = 2³⁺³ = 2⁶. The exponent b tells you how many times to multiply xᵃ by itself — so you get a copies of x, repeated b times = a·b copies total. LETTERS: (xᵃ)ᵇ = xᵃ·xᵃ·...·xᵃ (b times) = xᵃᵇ.",
        },
        {
          expression: "2^0 = 1. \\quad \\text{Law: } x^0 = 1 \\text{ for any } x \\neq 0.",
          annotation:
            "PROOF: 2³/2³ = 1 (anything divided by itself). Also 2³/2³ = 2³⁻³ = 2⁰ by the quotient law. Therefore 2⁰ = 1. LETTERS: xⁿ/xⁿ = 1 = xⁿ⁻ⁿ = x⁰. The zero exponent means 'no multiplications,' which leaves the multiplicative identity: 1.",
        },
        {
          expression: "2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}. \\quad \\text{Law: } x^{-n} = \\frac{1}{x^n}.",
          annotation:
            "PROOF: 2³·2⁻³ = 2³⁺⁽⁻³⁾ = 2⁰ = 1. So 2⁻³ must equal 1/2³ (they multiply to 1 — they are reciprocals). LETTERS: xⁿ·x⁻ⁿ = 1, so x⁻ⁿ = 1/xⁿ. Negative exponents are not 'negative' — they mean reciprocal. The power rule for 1/x² = x⁻² is the same rule as for x². The negative exponent brings it to the numerator as a positive exponent.",
        },
        {
          expression: "4^{1/2} = \\sqrt{4} = 2. \\quad \\text{Law: } x^{1/n} = \\sqrt[n]{x}.",
          annotation:
            "PROOF: (4^{1/2})² = 4^{(1/2)·2} = 4¹ = 4. So 4^{1/2} is the number whose square is 4 — which is the definition of √4. LETTERS: (x^{1/n})ⁿ = x^{(1/n)·n} = x¹ = x. So x^{1/n} is the nth root of x. This is why the power rule d/dx[x^{1/2}] = (1/2)x^{-1/2} = 1/(2√x) — the fractional exponent and the root are the same thing.",
        },
      ],
      conclusion:
        "All seven exponent laws follow from one definition: xⁿ means 'multiply x by itself n times.' Addition of exponents = joining two lists of copies. Subtraction = canceling pairs. Multiplication = repeating a list. Zero = empty product = 1. Negative = reciprocal. Fractional = root. None of this needs to be memorized if you understand the counting argument.",
    },

    {
      id: "ch0-rosetta-ex05",
      title: "Phase 2 — Factoring Patterns: The Hidden Shapes in Every Expression",
      problem:
        "\\text{Prove the difference of squares, perfect square trinomial, and sum/difference of cubes — each with a number example alongside the formula.}",
      steps: [
        {
          expression: "100 - 9 = (10 - 3)(10 + 3). \\quad \\text{Identity: } a^2 - b^2 = (a-b)(a+b).",
          annotation:
            "NUMBERS: (10-3)(10+3) = 7·13 = 91 = 100-9. ✓ WHY: Expand (a-b)(a+b) = a²+ab-ab-b² = a²-b². The middle terms +ab and -ab cancel exactly. This is not a trick — it is what always happens when conjugate pairs multiply. Calculus uses this to simplify √(x+h)-√x after multiplying by the conjugate.",
        },
        {
          expression: "(10+3)^2 = 100 + 60 + 9 = 169. \\quad \\text{Identity: } (a+b)^2 = a^2 + 2ab + b^2.",
          annotation:
            "NUMBERS: 13² = 169. Via identity: 10²+2(10)(3)+3² = 100+60+9 = 169. ✓ The 2ab term (60) is always present — it is the cross-multiplication. Without it, you get 100+9=109, which is wrong. (a+b)² ≠ a²+b². Always write 2ab in the middle. The geometry: a square of side (a+b) has four pieces: a², ab, ab, b².",
        },
        {
          expression: "(10-3)^2 = 100 - 60 + 9 = 49 = 7^2. \\quad \\text{Identity: } (a-b)^2 = a^2 - 2ab + b^2.",
          annotation:
            "NUMBERS: 7² = 49. Via identity: 10²-2(10)(3)+3² = 100-60+9 = 49. ✓ The middle term is negative when the sign between a and b is negative. Memory: the middle term copies the sign. (a-b)² → -2ab. (a+b)² → +2ab.",
        },
        {
          expression: "10^3 - 2^3 = 992 = (10-2)(100+20+4). \\quad \\text{Identity: } a^3 - b^3 = (a-b)(a^2+ab+b^2).",
          annotation:
            "NUMBERS: (10-2)(100+20+4) = 8·124 = 992. And 1000-8 = 992. ✓ LETTERS: Expand (a-b)(a²+ab+b²) = a³+a²b+ab²-a²b-ab²-b³ = a³-b³ (all middle terms cancel in pairs). This is the algebra tax you pay before evaluating lim_{x→2}(x³-8)/(x-2) — factor as (x-2)(x²+2x+4) and cancel (x-2).",
        },
        {
          expression: "10^3 + 2^3 = 1008 = (10+2)(100-20+4). \\quad \\text{Identity: } a^3 + b^3 = (a+b)(a^2-ab+b^2).",
          annotation:
            "NUMBERS: 12·84 = 1008. And 1000+8 = 1008. ✓ Memory: SUM of cubes → (SAME sign)(OPPOSITE sign in middle)(ALWAYS +). DIFFERENCE of cubes → (SAME sign)(SAME sign)(ALWAYS +). The last term is always b² positive. The middle term of the trinomial copies the sign of the original. SOAP: Same, Opposite, Always Positive.",
        },
      ],
      conclusion:
        "All factoring patterns are the distributive property run backward. To verify any factoring formula: expand it forward and watch the cross terms cancel. The number columns here give you a calculator check for every formula. When in doubt: plug in numbers and verify before applying in a calculus problem.",
    },

    {
      id: "ch0-rosetta-ex06",
      title: "Phase 2 — Rationalization: The Conjugate Trick and Why It Works",
      problem:
        "\\text{Simplify } \\frac{1}{\\sqrt{2}} \\text{ by rationalizing. Then use the same technique on } \\lim_{h \\to 0} \\frac{\\sqrt{x+h} - \\sqrt{x}}{h}.",
      steps: [
        {
          expression:
            "\\frac{1}{\\sqrt{2}} = \\frac{1}{\\sqrt{2}} \\cdot \\frac{\\sqrt{2}}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2}.",
          annotation:
            "NUMBERS: √2 ≈ 1.414. So 1/√2 ≈ 0.707. And √2/2 ≈ 1.414/2 ≈ 0.707. ✓ WHY: We multiplied by √2/√2 = 1 — multiplying by 1 never changes the value, only the form. The goal: move the radical from the denominator to the numerator. Rational denominators are easier to work with algebraically.",
        },
        {
          expression:
            "\\frac{\\sqrt{x+h} - \\sqrt{x}}{h} \\cdot \\frac{\\sqrt{x+h} + \\sqrt{x}}{\\sqrt{x+h} + \\sqrt{x}}.",
          annotation:
            "Multiply numerator and denominator by the CONJUGATE of the numerator: (√(x+h) + √x). The conjugate changes only the sign between the two square-root terms. We again multiply by a form of 1 — value unchanged, form changed. The goal: eliminate the subtraction of radicals in the numerator, which is creating the 0/0 problem as h→0.",
        },
        {
          expression:
            "\\text{Numerator: } (\\sqrt{x+h})^2 - (\\sqrt{x})^2 = (x+h) - x = h.",
          annotation:
            "NUMBERS (x=4, h=1): (√5-√4)(√5+√4) = (√5)²-(√4)² = 5-4 = 1 = h. ✓ This is the difference of squares identity: (a-b)(a+b) = a²-b² with a=√(x+h), b=√x. The radicals square away. The entire numerator collapses to h — just one term.",
        },
        {
          expression:
            "\\frac{h}{h(\\sqrt{x+h} + \\sqrt{x})} = \\frac{1}{\\sqrt{x+h} + \\sqrt{x}}.",
          annotation:
            "NUMBERS (x=4, h=1): h/(h(√5+√4)) = 1/(√5+2) ≈ 1/4.236 ≈ 0.236. As h→0: 1/(√4+√4) = 1/(2·2) = 1/4. And d/dx[√x] at x=4 is 1/(2√4) = 1/4. ✓ The h cancels because it is now a FACTOR of both numerator and denominator. Calculus step: let h→0. Result: 1/(2√x). This is the power rule for x^{1/2} — derived from the conjugate trick.",
        },
      ],
      conclusion:
        "The conjugate trick is the difference of squares identity in disguise: (a-b)(a+b) = a²-b² eliminates radicals because squaring a square root gives back the original number. Every limit involving √(x+h)-√x requires this technique. The algebra tax paid here is: multiply by conjugate → apply difference of squares → cancel h → take limit.",
    },

    // ═══════════════════════════════════════════════════════
    // PHASE 3 — THE IDENTITY LIBRARY
    // ═══════════════════════════════════════════════════════
    {
      id: "ch0-rosetta-ex07",
      title: "Phase 3 — The Complete Algebraic Identity Library",
      problem:
        "\\text{A catalog of every identity that appears in Calculus 1 and 2, each with a numerical verification.}",
      steps: [
        {
          expression:
            "(a + b)^2 = a^2 + 2ab + b^2. \\quad \\textbf{Check: } (3+4)^2 = 49 = 9 + 24 + 16. \\checkmark",
          annotation:
            "Perfect square (sum). The 2ab middle term is the cross product — it appears twice because (a+b)(a+b) produces ab once from 'First outer' and once from 'inner last.' Missing this term is the single most common algebra error in all of calculus.",
        },
        {
          expression:
            "(a - b)^2 = a^2 - 2ab + b^2. \\quad \\textbf{Check: } (7-3)^2 = 16 = 49 - 42 + 9. \\checkmark",
          annotation:
            "Perfect square (difference). Middle term is negative. Note that (a-b)² is always ≥ 0 (it's a square). This identity is used in completing the square and in the proof that the variance of a probability distribution is non-negative.",
        },
        {
          expression:
            "a^2 - b^2 = (a-b)(a+b). \\quad \\textbf{Check: } 25 - 9 = 16 = (5-3)(5+3) = 2 \\cdot 8. \\checkmark",
          annotation:
            "Difference of squares. Requires subtraction (not sum — there is no 'sum of squares' factoring over the reals). Used in: limit simplifications, rationalization, trigonometric identities (sin²+cos²=1 rearranges to 1-sin²=cos², a difference of squares).",
        },
        {
          expression:
            "a^3 - b^3 = (a-b)(a^2+ab+b^2). \\quad \\textbf{Check: } 27 - 8 = 19 = (3-2)(9+6+4). \\checkmark",
          annotation:
            "Difference of cubes. The trinomial factor a²+ab+b² does not factor further over the reals (its discriminant is b²-4b² = -3b² < 0). Used in: limits like (x³-8)/(x-2), Riemann sum formulas involving Σi².",
        },
        {
          expression:
            "a^3 + b^3 = (a+b)(a^2-ab+b^2). \\quad \\textbf{Check: } 8 + 27 = 35 = (2+3)(4-6+9) = 5 \\cdot 7. \\checkmark",
          annotation:
            "Sum of cubes. Middle sign of trinomial is always negative (opposite the sign of the original). Last term is always positive. Memory: SOAP — Same, Opposite, Always Positive for the signs of the three parts.",
        },
        {
          expression:
            "(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3. \\quad \\textbf{Check: } (2+1)^3 = 27 = 8+12+6+1. \\checkmark",
          annotation:
            "Binomial cube. The coefficients 1,3,3,1 are from Pascal's triangle (row 3). This appears in the limit definition of the derivative for x³: (x+h)³ - x³ = 3x²h + 3xh² + h³, so [(x+h)³-x³]/h = 3x² + 3xh + h² → 3x² as h→0.",
        },
        {
          expression:
            "\\frac{1}{a} - \\frac{1}{b} = \\frac{b - a}{ab}. \\quad \\textbf{Check: } \\frac{1}{2} - \\frac{1}{3} = \\frac{1}{6} = \\frac{3-2}{6}. \\checkmark",
          annotation:
            "Fraction subtraction with unrelated denominators. Used in derivatives of 1/x using the limit definition: [(1/(x+h)) - (1/x)]/h = [x-(x+h)]/(x(x+h)h] = -h/(x(x+h)h) = -1/(x(x+h)) → -1/x² as h→0.",
        },
      ],
      conclusion:
        "This catalog covers every algebraic identity you will need in Calculus 1 and 2. Before applying any identity, run the number check: substitute small integers and verify the equation holds. If it does not, you have the wrong identity. If it does, apply it to the general form. The number check takes 10 seconds and prevents the most common algebraic errors.",
    },

    {
      id: "ch0-rosetta-ex08",
      title: "Phase 3 — Sigma Notation: Unpacking the Magic Symbol",
      problem:
        "\\text{Explain } \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} \\text{ by first writing out the sum for } n = 4, \\text{ then verifying the formula.}",
      steps: [
        {
          expression:
            "\\sum_{i=1}^{4} i = 1 + 2 + 3 + 4.",
          annotation:
            "The sigma symbol Σ means 'add up.' The i=1 below means 'start with i=1.' The 4 above means 'stop when i=4.' The expression to the right of Σ (here, just i) is the thing being added, with i replaced by each integer in turn. It is a compact notation for a long sum — nothing more.",
        },
        {
          expression:
            "1 + 2 + 3 + 4 = 10. \\quad \\text{Formula: } \\frac{4 \\cdot 5}{2} = \\frac{20}{2} = 10. \\checkmark",
          annotation:
            "VERIFY: The formula n(n+1)/2 gives the same answer as adding manually. For n=4: 4·5/2=10. For n=3: 3·4/2=6 = 1+2+3. ✓ For n=5: 5·6/2=15 = 1+2+3+4+5. ✓ This formula is used in Riemann sums when computing ∫₀ᵇ x dx — the sum of first n integers divided by n² approaches b²/2 as n→∞.",
        },
        {
          expression:
            "\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}. \\quad \\textbf{Check } n=3: \\quad 1+4+9=14, \\quad \\frac{3 \\cdot 4 \\cdot 7}{6} = 14. \\checkmark",
          annotation:
            "Sum of squares formula — used when computing Riemann sums for ∫x² dx. VERIFY: n=3: 1²+2²+3²=14. Formula: 3·4·7/6=84/6=14. ✓ n=4: 1+4+9+16=30. Formula: 4·5·9/6=180/6=30. ✓ Each formula can always be spot-checked before applying to an integral.",
        },
        {
          expression:
            "\\sum_{i=1}^{n} c = cn \\quad \\text{(constant times n terms)}.",
          annotation:
            "Adding the same constant c a total of n times gives cn. NUMBERS: Σ(i=1 to 5) of 3 = 3+3+3+3+3 = 15 = 3·5. ✓ This is used in Riemann sums for constant functions: every rectangle has the same height c, so total area = c·(b-a).",
        },
        {
          expression:
            "\\sum_{i=1}^{n} (a_i + b_i) = \\sum_{i=1}^{n} a_i + \\sum_{i=1}^{n} b_i.",
          annotation:
            "Sigma distributes over addition — the same way the integral distributes: ∫(f+g)dx = ∫f dx + ∫g dx. NUMBERS: (1+2)+(4+8)+(9+32) = 56. And (1+4+9)+(2+8+32) = 14+42 = 56. ✓ The Riemann sum inherits this linearity, and the integral inherits it from the Riemann sum.",
        },
      ],
      conclusion:
        "Sigma notation is shorthand for addition. Every property — linearity, constant multiples, splitting sums — mirrors the corresponding integral property, because the integral is defined as a limit of sigma sums. Understanding sigma notation is understanding how Riemann sums work, which is understanding why the integral has the properties it does.",
    },

    {
      id: "ch0-rosetta-ex09",
      title: "Phase 3 — The Limit: How Close Enough Becomes Exact",
      problem:
        "\\text{Evaluate } \\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} \\text{ by algebra, then explain why plugging in } x=3 \\text{ fails and how the algebra fixes it.}",
      steps: [
        {
          expression:
            "\\text{Direct substitution: } \\frac{3^2 - 9}{3 - 3} = \\frac{0}{0}. \\quad \\text{Indeterminate — undefined.}",
          annotation:
            "0/0 is not 0, not 1, not infinity — it is indeterminate: the form alone does not determine the value. But the LIMIT asks: what value is the expression APPROACHING as x gets close to 3 (but is not equal to 3)? The function may be undefined AT x=3 but still have a well-defined limit.",
        },
        {
          expression:
            "\\frac{x^2 - 9}{x - 3} = \\frac{(x-3)(x+3)}{x-3} = x + 3 \\quad (x \\neq 3).",
          annotation:
            "ALGEBRA TAX: Factor the numerator using the difference of squares identity. Then cancel (x-3) — this is legal because in the limit, x ≠ 3, so (x-3) ≠ 0, making the cancellation valid. NUMBERS: At x=2.9: (2.9²-9)/(2.9-3) = -0.59/-0.1 = 5.9. And 2.9+3 = 5.9. ✓ At x=3.1: 6.2/0.1 = 6.1. And 3.1+3 = 6.1. ✓",
        },
        {
          expression:
            "\\lim_{x \\to 3} (x + 3) = 3 + 3 = 6.",
          annotation:
            "After the algebra tax is paid and the cancellation is done, the simplified form x+3 is continuous at x=3, so direct substitution now works. The limit is 6. This is the pattern for every 0/0 limit: algebra simplifies the expression until the troublesome factor cancels, then substitute. The limit is the value the simplified expression approaches.",
        },
        {
          expression:
            "\\text{The derivative definition: } f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}.",
          annotation:
            "This is always a 0/0 form at h=0: numerator is f(x+0)-f(x)=0, denominator is 0. The algebra tax (expanding (x+h)ⁿ, factoring, or conjugating) always converts this into a non-indeterminate form before taking h→0. Every derivative computation you will ever do is this pattern: pay the algebra tax, cancel h, substitute h=0.",
        },
      ],
      conclusion:
        "A limit at a 0/0 indeterminate form is always solved by the same procedure: pay the algebra tax to cancel the offending factor, then substitute. The calculus (taking the limit) is one line. The algebra (factoring, conjugating, expanding) is the work. The limit is the value the simplified expression approaches — not the value it takes at the problematic point.",
    },

    // ═══════════════════════════════════════════════════════
    // PHASE 4 — HOW TO THINK
    // ═══════════════════════════════════════════════════════
    {
      id: "ch0-rosetta-ex10",
      title: "Phase 4 — Seeing Substitution: How to Recognize a 'Chunk'",
      problem:
        "\\text{Simplify } (x^2 + 1)^5 \\cdot 2x \\, dx \\text{ by recognizing the chunk. Derive the substitution rule for } \\int (x^2+1)^5 \\cdot 2x \\, dx.",
      steps: [
        {
          expression:
            "\\text{Let } u = x^2 + 1. \\quad \\text{Notice: } \\frac{du}{dx} = 2x, \\text{ so } du = 2x \\, dx.",
          annotation:
            "NUMBERS: If x=3, then u=10, du/dx=6. The expression (x²+1)⁵·2x dx with x=3 gives 10⁵·6. In terms of u: u⁵ du = 10⁵·6. Same thing. The substitution replaces the 'chunk' (x²+1) with u, and the leftover factor 2x dx turns out to be exactly du. This is not a coincidence — it is the chain rule running backward.",
        },
        {
          expression:
            "\\int (x^2+1)^5 \\cdot 2x \\, dx = \\int u^5 \\, du = \\frac{u^6}{6} + C.",
          annotation:
            "After substitution, the integral is a simple power rule: ∫uⁿ du = u^{n+1}/(n+1) + C. NUMBERS: At u=10 (x=3): 10⁶/6 ≈ 166667. LETTERS: Back-substitute u = x²+1: answer = (x²+1)⁶/6 + C. Check by differentiating: d/dx[(x²+1)⁶/6] = 6(x²+1)⁵·2x/6 = (x²+1)⁵·2x. ✓",
        },
        {
          expression:
            "\\text{How to SEE the chunk: look for a function and its derivative appearing together.}",
          annotation:
            "Pattern recognition checklist for u-substitution: (1) Is there a composite function (something raised to a power, inside a trig function, inside a log)? (2) Is there another factor that looks like the derivative of the inside? If both are yes: u = the inside, du = the derivative factor × dx. The 'leftover' factor must match du exactly — if it doesn't, u-substitution may not apply directly.",
        },
      ],
      conclusion:
        "u-substitution is 'seeing' the chain rule in reverse. The chain rule says d/dx[f(g(x))] = f'(g(x))·g'(x). u-substitution says: if you see a product of the form f'(g(x))·g'(x)dx, you can write it as f'(u)du where u=g(x). Training your eye to spot the chunk (g(x)) and its derivative (g'(x)) is the skill that u-substitution requires — not new rules, just pattern recognition.",
    },

    {
      id: "ch0-rosetta-ex11",
      title: "Phase 4 — The Forest vs. Trees Checklist: How to Start Any Problem",
      problem:
        "\\text{Given a calculus problem you have never seen before, what do you do first? Demonstrate on: } \\lim_{x \\to 0} \\frac{\\sin x}{x}, \\text{ a derivative of a product, and an integral requiring both algebra and substitution.}",
      steps: [
        {
          expression:
            "\\textbf{Step 1 — Identify the Goal.} \\text{ What is the problem actually asking for?}",
          annotation:
            "Before touching the algebra: read the problem and name the goal in one sentence. 'Find the limit.' 'Find dy/dx.' 'Compute the definite integral.' 'Maximize the area.' The goal determines which tools are relevant. Students who start computing before identifying the goal often compute the wrong thing correctly.",
        },
        {
          expression:
            "\\textbf{Step 2 — Strip the Calculus.} \\text{ What is the algebraic structure underneath?}",
          annotation:
            "Ask: if I replaced the limit/derivative/integral symbol with nothing, what algebra problem would remain? For lim_{x→0} sin(x)/x: the algebra is a fraction with a trig function. For d/dx[x²·eˣ]: the algebra is a product of two functions. For ∫(x²-1)/(x-1)dx: the algebra is a rational function — try dividing or factoring before integrating.",
        },
        {
          expression:
            "\\textbf{Step 3 — Pay the Tax.} \\text{ Factor, simplify, expand, or rationalize before applying calculus.}",
          annotation:
            "The three standard taxes: (A) FACTORING TAX — factor the numerator/denominator and cancel. Use when you see a polynomial fraction or a 0/0 limit. (B) CONJUGATE TAX — multiply by conjugate. Use when you see a difference of square roots. (C) EXPANSION TAX — expand (x+h)ⁿ using the binomial formula. Use when computing a derivative from the definition. Pay the tax first. Calculus step comes last.",
        },
        {
          expression:
            "\\textbf{Step 4 — Apply the Calculus.} \\text{ Now the expression is in simplest form — use the rule.}",
          annotation:
            "After the algebra tax is paid, the calculus step is usually mechanical: plug in h=0, apply power rule, evaluate at bounds. The difficulty was always in Step 3. Students who get stuck at calculus problems are usually stuck at the algebra tax, not at the calculus rule itself.",
        },
        {
          expression:
            "\\textbf{Step 5 — Verify with Numbers.} \\text{ Plug in a specific value and check.}",
          annotation:
            "Always sanity-check with numbers. If d/dx[x³] = 3x², check at x=2: derivative should be 12. Compute (2.001³-2³)/0.001 ≈ 12.006 ≈ 12. ✓ If ∫₀² x dx = 2, the area under y=x from 0 to 2 is a triangle with base 2 and height 2: area = ½·2·2 = 2. ✓ Numerical checks are the fastest way to catch algebra errors.",
        },
      ],
      conclusion:
        "Every calculus problem has the same four-step structure: identify goal, strip calculus, pay algebra tax, apply calculus rule, verify numerically. The calculus rule is almost always the easiest step. The algebra tax is where problems are won or lost. This lesson is a catalog of every possible algebra tax — use it as a reference whenever a step feels like magic.",
    },

    {
      id: "ch0-rosetta-ex12",
      title: "Phase 4 — The Three Unstuck Moves: What to Try When You Are Stuck",
      problem:
        "\\text{You are stuck on an algebra step inside a calculus problem. Here are the three universal moves — demonstrated on real examples from Calculus 1.}",
      steps: [
        {
          expression:
            "\\textbf{Move 1: Can I factor anything?}",
          annotation:
            "Whenever you see a polynomial expression, ask: is there a common factor? Can I use difference of squares, perfect square, or sum/difference of cubes? EXAMPLE: Stuck on lim_{x→2}(x²-4)/(x-2). Factor: x²-4 = (x-2)(x+2). Cancel (x-2). Result: x+2. Take limit: 4. The factoring was the entire problem.",
        },
        {
          expression:
            "\\textbf{Move 2: Can I combine or split fractions?}",
          annotation:
            "Whenever you see fractions being added/subtracted inside a larger expression: find the common denominator and combine. EXAMPLE: Stuck on lim_{h→0}[(1/(x+h)) - (1/x)]/h. Combine the numerator: [x-(x+h)]/(x(x+h)) = -h/(x(x+h)). Cancel h with denominator. Result: -1/(x(x+h)) → -1/x² as h→0. Fraction combination was the key.",
        },
        {
          expression:
            "\\textbf{Move 3: Can I substitute a chunk for a single letter?}",
          annotation:
            "Whenever you see a repeated complex expression inside something simpler: let u = that expression. EXAMPLE: Stuck on ∫x·√(x²+1)dx. Set u=x²+1, du=2x dx, so x dx = du/2. Integral becomes ∫√u · (du/2) = (1/2)·(2/3)u^{3/2}+C = (1/3)(x²+1)^{3/2}+C. The substitution made a hard integral easy.",
        },
        {
          expression:
            "\\textbf{Move 4 (Bonus): Can I multiply by a clever form of 1?}",
          annotation:
            "Multiplying by 1 never changes the value but can dramatically change the form. Forms of 1 that are useful: (conjugate/conjugate) for rationalization, (common denominator / common denominator) for combining fractions, (eˣ/eˣ) for L'Hôpital-free limit tricks, ((1/n)/(1/n)) for limits at infinity. EXAMPLE: lim_{x→∞}(3x+1)/(2x-5) — multiply numerator and denominator by 1/x: (3+1/x)/(2-5/x) → 3/2 as x→∞.",
        },
      ],
      conclusion:
        "When stuck: try (1) factor, (2) combine fractions, (3) substitute a chunk, (4) multiply by a clever form of 1. These four moves solve the algebra tax for every common situation in Calculus 1. The calculus step comes after — and is usually one line. Fluency in these four moves is the difference between a student who 'can't do calculus' and one who can.",
    },
  ],

  quiz: [
    {
      id: "ch0-rosetta-q1",
      type: "multiple-choice",
      question: "Evaluate \\frac{2 + 8}{5}. Which answer is correct, and why?",
      options: [
        "2 + \\frac{8}{5} = 3.6",
        "\\frac{10}{5} = 2",
        "\\frac{2}{5} + 8 = 8.4",
        "\\frac{2}{5} + \\frac{8}{5} = 2",
      ],
      answer: 1,
      explanation: "The fraction bar groups the entire numerator: (2+8)/5 = 10/5 = 2. The fraction bar is a grouping symbol — everything above the bar is evaluated first, then divided by everything below. Options A and C incorrectly split the numerator before adding.",
    },
    {
      id: "ch0-rosetta-q2",
      type: "multiple-choice",
      question: "Which cancellation is VALID?",
      options: [
        "\\frac{x + 6}{3} = x + 2",
        "\\frac{3(x+2)}{3} = x + 2",
        "\\frac{x^2 + 6}{x} = x + 6",
        "\\frac{x + 3}{x} = 3",
      ],
      answer: 1,
      explanation: "Only option B is valid: 3 is a factor of the entire numerator 3(x+2), so it cancels with the 3 in the denominator to give x+2. In option A, the 3 is only a denominator — it is not a factor of (x+6). In C, x divides x² but does not divide the constant 6. In D, x cancels with x but leaves only 3, losing the 1 term from (x+3)/x = 1 + 3/x.",
    },
    {
      id: "ch0-rosetta-q3",
      type: "multiple-choice",
      question: "What is (a + b)^2 fully expanded?",
      options: [
        "a^2 + b^2",
        "a^2 + ab + b^2",
        "a^2 + 2ab + b^2",
        "2a + 2b",
      ],
      answer: 2,
      explanation: "Expand (a+b)(a+b) using the distributive property: a·a + a·b + b·a + b·b = a² + ab + ab + b² = a² + 2ab + b². The cross term 2ab is always present. Check: (3+4)² = 49, and 9 + 2(12) + 16 = 49. ✓ Option A is wrong — it is missing the 2ab cross term.",
    },
    {
      id: "ch0-rosetta-q4",
      type: "multiple-choice",
      question: "Which identity is used to simplify \\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}?",
      options: [
        "Perfect square trinomial",
        "Sum of cubes",
        "Difference of squares",
        "Conjugate rationalization",
      ],
      answer: 2,
      explanation: "x²-9 = x²-3² = (x-3)(x+3) — the difference of squares identity with a=x, b=3. After factoring, (x-3) cancels with the denominator (since x≠3 in the limit), leaving x+3. The limit is 3+3=6. The difference of squares identity is the standard tool for this class of limit.",
    },
    {
      id: "ch0-rosetta-q5",
      type: "multiple-choice",
      question: "What does x^{-3} equal?",
      options: [
        "-x^3",
        "\\frac{-1}{x^3}",
        "\\frac{1}{x^3}",
        "\\frac{1}{x^{-3}}",
      ],
      answer: 2,
      explanation: "By the negative exponent law: x⁻ⁿ = 1/xⁿ. So x⁻³ = 1/x³. Proof: x³ · x⁻³ = x³⁺⁽⁻³⁾ = x⁰ = 1, so x⁻³ is the reciprocal of x³. Negative exponents are NOT negative values — they indicate reciprocals. Check: 2⁻³ = 1/8, not -8.",
    },
    {
      id: "ch0-rosetta-q6",
      type: "multiple-choice",
      question: "To evaluate \\lim_{h \\to 0} \\frac{\\sqrt{x+h} - \\sqrt{x}}{h}, which algebra tax must you pay?",
      options: [
        "Factor x+h as a perfect square",
        "Multiply by the conjugate \\frac{\\sqrt{x+h}+\\sqrt{x}}{\\sqrt{x+h}+\\sqrt{x}}",
        "Use the difference of cubes identity",
        "Substitute u = x + h",
      ],
      answer: 1,
      explanation: "Multiply numerator and denominator by the conjugate (√(x+h)+√x). The numerator becomes (√(x+h))²-(√x)² = (x+h)-x = h by the difference of squares identity. The h then cancels with the h in the denominator, leaving 1/(√(x+h)+√x) → 1/(2√x) as h→0. This is the derivative of √x.",
    },
  ],
}
