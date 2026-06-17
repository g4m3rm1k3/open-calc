// Proof data for all algebra reference entries.

const S = {
  setup:    { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  key:      { bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  algebra:  { bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  geo:      { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  limit:    { bg: "#fdf4ff", text: "#6b21a8",  border: "#e9d5ff" },
  conclude: { bg: "#f0fdf4", text: "#14532d",  border: "#86efac" },
  verify:   { bg: "#f0fdfa", text: "#134e4a",  border: "#99f6e4" },
}

export const ALGEBRA_PROOFS = {

  'exp-product': {
    title: "Product of Powers",
    subtitle: "Why aᵐ · aⁿ = aᵐ⁺ⁿ",
    category: "Algebra",
    problem: "a^m \\cdot a^n = a^{m+n}",
    preamble: "When you multiply two powers of the same base, the exponents add. This follows directly from what an exponent means: repeated multiplication.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Recall the definition: aⁿ means multiply a by itself n times.",
        math: "a^m = \\underbrace{a \\cdot a \\cdots a}_{m \\text{ factors}}, \\quad a^n = \\underbrace{a \\cdot a \\cdots a}_{n \\text{ factors}}",
        note: "This is the whole story — once you accept this definition, everything follows.",
        why: {
          tag: "What does aⁿ mean if n isn't a whole number?",
          explanation: "The definition 'multiply a by itself n times' only works for positive whole numbers (positive integers). For fractions and negatives, we extend the definition by demanding the exponent laws still hold: a^(1/n) is defined to be the number whose nth power is a (the nth root). a^(−n) is defined to be 1/aⁿ. These extensions are chosen to be consistent with the integer case.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Write out the product: aᵐ · aⁿ is m factors of a followed by n factors of a.",
        math: "a^m \\cdot a^n = \\underbrace{a \\cdots a}_{m} \\cdot \\underbrace{a \\cdots a}_{n} = \\underbrace{a \\cdots a}_{m+n \\text{ total}}",
        note: "You're just counting: m factors plus n factors is m+n factors total.",
        why: {
          tag: "Is multiplication really just counting factors?",
          explanation: "Yes, for positive integer exponents. Multiplication is associative and commutative — the order doesn't matter, only the count. So aᵐ·aⁿ means 'a multiplied by itself, m times, then again n more times' — which is a multiplied by itself m+n times total. The middle dot just joins the two groups.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Check with numbers: 2³ · 2² = 8 · 4 = 32 = 2⁵. ✓",
        math: "2^3 \\cdot 2^2 = 8 \\cdot 4 = 32 = 2^{3+2} = 2^5 \\;\\checkmark",
        note: "Always verify a formula with a concrete example before trusting it.",
        why: {
          tag: "Does this work for any base, including fractions or negatives?",
          explanation: "Yes. For any base a: aᵐ·aⁿ = aᵐ⁺ⁿ holds whenever both sides are defined. Example with fraction: (1/3)² · (1/3)³ = (1/9)(1/27) = 1/243 = (1/3)⁵ ✓. Example with negative: (−2)² · (−2)³ = 4 · (−8) = −32 = (−2)⁵ ✓ (since (−2)⁵ = −32).",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "aᵐ · aⁿ = aᵐ⁺ⁿ: when multiplying same-base powers, add exponents.",
        math: "a^m \\cdot a^n = a^{m+n}",
        note: "Critical: the bases must be the same. 2³ · 3² ≠ 6⁵. The bases must match for exponents to combine.",
        why: {
          tag: "Why can't we add exponents from different bases?",
          explanation: "2³ · 3² = 8 · 9 = 72. But 6⁵ = 7776. Completely different! The rule aᵐ·aⁿ = aᵐ⁺ⁿ comes from counting copies of the same thing (a). When bases differ, you're counting copies of different things — there's no way to merge them into one base with a combined exponent.",
          why: null,
        },
      },
    ],
  },

  'exp-quotient': {
    title: "Quotient of Powers",
    subtitle: "Why aᵐ / aⁿ = aᵐ⁻ⁿ",
    category: "Algebra",
    problem: "\\frac{a^m}{a^n} = a^{m-n}",
    preamble: "When you divide two powers of the same base, the exponents subtract. This follows from cancellation of common factors.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Write aᵐ/aⁿ as a fraction of repeated factors.",
        math: "\\frac{a^m}{a^n} = \\frac{\\overbrace{a \\cdot a \\cdots a}^{m}}{\\underbrace{a \\cdot a \\cdots a}_{n}}",
        note: "Assume m ≥ n and a ≠ 0 for now.",
        why: {
          tag: "Why do we need a ≠ 0?",
          explanation: "Division by zero is undefined. If a = 0, then aⁿ = 0, and dividing by aⁿ = 0 is division by zero — undefined. The rule aᵐ/aⁿ = aᵐ⁻ⁿ only holds when a ≠ 0.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Cancel n factors of a from numerator and denominator.",
        math: "\\frac{\\cancel{a} \\cdots \\cancel{a} \\cdot a \\cdots a}{\\cancel{a} \\cdots \\cancel{a}} = a \\cdots a = a^{m-n}",
        note: "Each factor of a in the denominator cancels one factor in the numerator. After n cancellations, m−n factors remain.",
        why: {
          tag: "Why can we cancel like this — what justifies it?",
          explanation: "Cancellation uses the property a/a = 1 (for a ≠ 0). Each a in the denominator pairs with an a in the numerator: a/a = 1, and multiplying by 1 changes nothing. We're left with the m−n uncancelled factors in the numerator. Formally: aᵐ/aⁿ = (aⁿ · aᵐ⁻ⁿ)/aⁿ = (aⁿ/aⁿ) · aᵐ⁻ⁿ = 1 · aᵐ⁻ⁿ = aᵐ⁻ⁿ.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Check: 3⁵ / 3² = 243/9 = 27 = 3³ = 3⁵⁻². ✓",
        math: "\\frac{3^5}{3^2} = \\frac{243}{9} = 27 = 3^3 = 3^{5-2} \\;\\checkmark",
        note: null,
        why: {
          tag: "What if m < n? Does aᵐ⁻ⁿ still work with a negative exponent?",
          explanation: "Yes! aᵐ/aⁿ = aᵐ⁻ⁿ even when m < n. Example: 2³/2⁵ = 8/32 = 1/4 = 2⁻² = 2³⁻⁵ ✓. The negative exponent a⁻² = 1/a² handles it correctly. This is exactly why negative exponents are defined as a⁻ⁿ = 1/aⁿ — to make the quotient rule work consistently.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "aᵐ/aⁿ = aᵐ⁻ⁿ: dividing same-base powers, subtract exponents.",
        math: "\\frac{a^m}{a^n} = a^{m-n} \\quad (a \\neq 0)",
        note: "Combined with the product rule, these two laws do the heavy lifting in algebraic simplification.",
        why: {
          tag: "Full dependency chain",
          explanation: "aᵐ/aⁿ = aᵐ⁻ⁿ relied on:",
          steps: [
            { text: "aᵐ/aⁿ = aᵐ⁻ⁿ  ← the result" },
            { text: "↳ Definition: aⁿ = a × a × ... × a (n times)" },
            { text: "↳ Cancellation: a/a = 1 for a ≠ 0" },
            { text: "↳ Negative exponent: a⁻ⁿ = 1/aⁿ (by consistency)" },
          ],
          why: null,
        },
      },
    ],
  },

  'exp-power': {
    title: "Power of a Power",
    subtitle: "Why (aᵐ)ⁿ = aᵐⁿ",
    category: "Algebra",
    problem: "(a^m)^n = a^{mn}",
    preamble: "(aᵐ)ⁿ means take aᵐ and multiply it by itself n times. Since each aᵐ is m factors, you have n groups of m — a total of mn factors.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Expand (aᵐ)ⁿ as n copies of aᵐ.",
        math: "(a^m)^n = \\underbrace{a^m \\cdot a^m \\cdots a^m}_{n \\text{ copies}}",
        note: null,
        why: {
          tag: "What does it mean to raise a power to a power?",
          explanation: "(aᵐ)ⁿ means: take the quantity aᵐ and use it as a base, then raise it to the power n. So aᵐ plays the role that 'a' normally does: you multiply aᵐ by itself n times. Example: (2³)² = 2³ · 2³ = 8 · 8 = 64.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the product rule repeatedly: adding m each time we multiply.",
        math: "\\underbrace{a^m \\cdot a^m \\cdots a^m}_{n} = a^{\\underbrace{m+m+\\cdots+m}_{n}} = a^{mn}",
        note: "By the product law, each multiplication of aᵐ adds m to the exponent. Doing this n times adds m × n.",
        why: {
          tag: "Why is adding m, n times the same as m×n?",
          explanation: "Repeated addition is multiplication by definition: m + m + ... + m (n times) = n·m = mn. This is the fundamental relationship between addition and multiplication. Here: n copies of m in the exponent sum to mn.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Check: (2³)² = 64 = 2⁶ = 2^(3·2). ✓",
        math: "(2^3)^2 = 8^2 = 64 = 2^6 = 2^{3 \\times 2} \\;\\checkmark",
        note: null,
        why: {
          tag: "How does this relate to aᵐ·aⁿ = aᵐ⁺ⁿ?",
          explanation: "(aᵐ)ⁿ = aᵐ·aᵐ·...·aᵐ (n times). Applying aᵐ·aⁿ = aᵐ⁺ⁿ repeatedly: aᵐ·aᵐ = a^(2m), then a^(2m)·aᵐ = a^(3m), ..., after n steps: a^(nm). The power-of-a-power rule IS just the product rule applied n−1 times.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "(aᵐ)ⁿ = aᵐⁿ: a power raised to a power — multiply exponents.",
        math: "(a^m)^n = a^{mn}",
        note: "Don't confuse with aᵐ·aⁿ = aᵐ⁺ⁿ (same base, product → add). This rule is for nested exponents → multiply.",
        why: {
          tag: "How do I remember when to add vs multiply exponents?",
          explanation: "Add exponents when you're multiplying two powers of the same base: aᵐ·aⁿ = aᵐ⁺ⁿ. Multiply exponents when a power is raised to another power: (aᵐ)ⁿ = aᵐⁿ. Mnemonic: 'side-by-side powers → ADD; nested powers → MULTIPLY.' A quick check: (2²)³ — is it 2⁶=64 (multiply: 2×3) or 2⁵=32 (add: 2+3)? It's 64, because (4)³ = 64.",
          why: null,
        },
      },
    ],
  },

  'exp-zero': {
    title: "Zero Exponent",
    subtitle: "Why a⁰ = 1 for any a ≠ 0",
    category: "Algebra",
    problem: "a^0 = 1 \\quad (a \\neq 0)",
    preamble: "a⁰ = 1 might seem arbitrary, but it's forced by the quotient law. Any non-zero number divided by itself equals 1, and aⁿ/aⁿ = aⁿ⁻ⁿ = a⁰.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Any nonzero number divided by itself equals 1.",
        math: "\\frac{a^n}{a^n} = 1 \\quad (a \\neq 0)",
        note: "This is just the fact that x/x = 1 for any nonzero x.",
        why: {
          tag: "Why is x/x = 1, exactly?",
          explanation: "Division is defined as the inverse of multiplication: a/b = c means c·b = a. So x/x = c means c·x = x. Dividing both sides by x (valid since x≠0): c = 1. Therefore x/x = 1.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply the quotient rule to the same expression.",
        math: "\\frac{a^n}{a^n} = a^{n-n} = a^0",
        note: "The left-hand side equals 1. The right-hand side equals a⁰. Therefore a⁰ = 1.",
        why: {
          tag: "Isn't this circular? We're using the quotient rule to define a⁰.",
          explanation: "Not quite circular — we're using consistency as the definition. We want all the exponent laws (including aᵐ/aⁿ = aᵐ⁻ⁿ) to hold even when m=n. The only value for a⁰ that makes the rule consistent is a⁰=1. We could define a⁰ to be anything, but then the quotient law would break. Mathematics extends definitions to preserve existing patterns.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify with the pattern: 2³=8, 2²=4, 2¹=2, 2⁰=? Each step divides by 2.",
        math: "2^3=8,\\quad 2^2=4,\\quad 2^1=2,\\quad 2^0 = 2 \\div 2 = 1 \\;\\checkmark",
        note: "The pattern of dividing by 2 each time forces 2⁰ = 1.",
        why: {
          tag: "What about 0⁰ — is that also 1?",
          explanation: "0⁰ is a famous indeterminate form in mathematics. In combinatorics and many contexts, 0⁰ = 1 is conventionally used (because it makes formulas like the binomial theorem work at n=0). But in analysis (calculus), 0⁰ is left undefined because lim_{x→0⁺} x^x = 1 but lim_{x→0⁺} 0^x = 0, and these limits give different values depending on how 0⁰ is approached. This is why the rule says a⁰ = 1 only for a ≠ 0.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "a⁰ = 1 for all a ≠ 0. The zero exponent is the multiplicative identity.",
        math: "a^0 = 1 \\quad (a \\neq 0)",
        note: "Combined with negative exponents, the zero exponent completes the integer exponent system.",
        why: {
          tag: "Why does the zero exponent equal the multiplicative identity (1) specifically?",
          explanation: "Because aⁿ represents repeated multiplication. The 'empty product' — multiplying zero factors — equals 1 by convention, just as an empty sum equals 0 (the additive identity). When you start accumulating a product and add zero factors, you've done nothing, returning the identity element. 1 is the multiplicative identity because 1·x = x for all x.",
          why: null,
        },
      },
    ],
  },

  'exp-neg': {
    title: "Negative Exponent",
    subtitle: "Why a⁻ⁿ = 1/aⁿ",
    category: "Algebra",
    problem: "a^{-n} = \\frac{1}{a^n}",
    preamble: "Negative exponents represent reciprocals. This definition makes the product law aᵐ·aⁿ = aᵐ⁺ⁿ work for negative exponents too.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "For the product law to hold at m = −n: aⁿ · a⁻ⁿ must equal a⁰ = 1.",
        math: "a^n \\cdot a^{-n} = a^{n+(-n)} = a^0 = 1",
        note: "If the product law works, multiplying aⁿ and a⁻ⁿ gives 1.",
        why: {
          tag: "How does this tell us what a⁻ⁿ equals?",
          explanation: "aⁿ · a⁻ⁿ = 1. This means a⁻ⁿ is the multiplicative inverse (reciprocal) of aⁿ. The number that when multiplied by aⁿ gives 1 is 1/aⁿ. So a⁻ⁿ must equal 1/aⁿ — this is forced by consistency with the product law.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Therefore: a⁻ⁿ = 1/aⁿ.",
        math: "a^{-n} = \\frac{1}{a^n} \\quad (a \\neq 0)",
        note: null,
        why: {
          tag: "Can I verify this from the quotient rule directly?",
          explanation: "Yes: a⁰/aⁿ = a^(0−n) = a^(−n). But a⁰/aⁿ = 1/aⁿ. So a^(−n) = 1/aⁿ. This is another way to see it: negative exponents arise from the quotient law when numerator exponent < denominator exponent.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Check the pattern: 2², 2¹, 2⁰, 2⁻¹, 2⁻².",
        math: "2^2=4,\\; 2^1=2,\\; 2^0=1,\\; 2^{-1}=\\tfrac{1}{2},\\; 2^{-2}=\\tfrac{1}{4} \\;\\checkmark",
        note: "Each step divides by 2. This pattern extends naturally below zero.",
        why: {
          tag: "What about (a/b)⁻ⁿ — does it flip the fraction?",
          explanation: "Yes: (a/b)⁻ⁿ = 1/(a/b)ⁿ = bⁿ/aⁿ = (b/a)ⁿ. A negative exponent on a fraction flips numerator and denominator. Example: (2/3)⁻² = (3/2)² = 9/4.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "a⁻ⁿ = 1/aⁿ. Negative exponents mean reciprocals.",
        math: "a^{-n} = \\frac{1}{a^n} \\quad (a \\neq 0)",
        note: "Moving a factor across a fraction bar flips the sign of its exponent: x²/y³ = x²·y⁻³.",
        why: {
          tag: "Full dependency chain",
          explanation: "a⁻ⁿ = 1/aⁿ relied on:",
          steps: [
            { text: "a⁻ⁿ = 1/aⁿ  ← the definition (forced by consistency)" },
            { text: "↳ Product rule: aᵐ·aⁿ = aᵐ⁺ⁿ" },
            { text: "↳ Zero exponent: a⁰ = 1" },
            { text: "↳ Multiplicative inverse: x · (1/x) = 1" },
          ],
          why: null,
        },
      },
    ],
  },

  'exp-frac': {
    title: "Fractional Exponent",
    subtitle: "Why a^(m/n) = ⁿ√(aᵐ)",
    category: "Algebra",
    problem: "a^{m/n} = \\sqrt[n]{a^m}",
    preamble: "Fractional exponents encode roots. a^(1/n) is defined as the nth root of a — the number whose nth power is a. This makes the power-of-a-power rule work for fractions.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "What must a^(1/n) equal? Apply the power-of-a-power rule to get a¹.",
        math: "(a^{1/n})^n = a^{(1/n) \\cdot n} = a^1 = a",
        note: "For the rule (aᵐ)ⁿ = aᵐⁿ to work with m=1/n, we need a^(1/n) to be the nth root of a.",
        why: {
          tag: "What is a 'root' exactly?",
          explanation: "The nth root of a is the number x such that xⁿ = a. For example, the square root of 9 is 3 because 3² = 9. The cube root of 8 is 2 because 2³ = 8. So a^(1/n) is defined as this nth root: the number that when raised to the nth power gives a.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "For a^(m/n): write m/n = m × (1/n) and apply power rules.",
        math: "a^{m/n} = a^{m \\cdot (1/n)} = (a^m)^{1/n} = \\sqrt[n]{a^m}",
        note: "Alternatively: a^(m/n) = (a^(1/n))^m = (ⁿ√a)^m. Both are equivalent.",
        why: {
          tag: "Which form is better: ⁿ√(aᵐ) or (ⁿ√a)ᵐ?",
          explanation: "Both are equal: (aᵐ)^(1/n) = (a^(1/n))^m, since the power-of-a-power rule doesn't care about order. In practice: (ⁿ√a)ᵐ is easier to compute when n divides evenly into the numbers. For example, 8^(2/3): as (⁸√8)² = 2² = 4 (take cube root first, then square). As ∛(8²) = ∛64 = 4. Both give 4, but the first avoids working with large numbers.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Check: 8^(2/3) = ∛(8²) = ∛64 = 4. Verify: 4³ = 64 = 8². ✓",
        math: "8^{2/3} = \\sqrt[3]{8^2} = \\sqrt[3]{64} = 4 \\;\\checkmark \\quad (4^3 = 64 = 8^2)",
        note: null,
        why: {
          tag: "What if a is negative? Can we take fractional powers of negative numbers?",
          explanation: "It depends on n. If n is odd: (−8)^(1/3) = −2 because (−2)³ = −8. Odd roots of negative numbers exist and are negative. If n is even: (−4)^(1/2) = √(−4) — undefined in real numbers (no real number squared gives −4). This is why the domain restriction appears: fractional exponents with even denominators require a ≥ 0.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ. Fractional exponent = root.",
        math: "a^{m/n} = \\sqrt[n]{a^m} = \\left(\\sqrt[n]{a}\\right)^m",
        note: "In calculus: x^(1/2) = √x, so d/dx[√x] = d/dx[x^(1/2)] = (1/2)x^(−1/2) = 1/(2√x) — the power rule works on fractional exponents!",
        why: null,
      },
    ],
  },

  'quadratic': {
    title: "Quadratic Formula",
    subtitle: "Derive x = (−b ± √(b²−4ac)) / 2a by completing the square",
    category: "Algebra",
    problem: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    preamble: "The quadratic formula solves any ax² + bx + c = 0. We derive it by 'completing the square' — rewriting the left side as a perfect square trinomial (something)².",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start with the general quadratic equation and divide by a to simplify.",
        math: "ax^2 + bx + c = 0 \\;\\Longrightarrow\\; x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0",
        note: "Dividing by a (≠0) normalizes the leading coefficient to 1, making completing the square easier.",
        why: {
          tag: "Why divide by a? Can't we just work with ax²?",
          explanation: "You can, but it's messier. Completing the square works cleanly when the x² coefficient is 1. Dividing through by a gives x² + (b/a)x + c/a = 0. Now we can use the pattern: x² + 2kx = (x+k)² − k². We'll identify 2k = b/a, so k = b/(2a).",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Complete the square: add (b/2a)² to both sides to create a perfect square.",
        math: "x^2 + \\frac{b}{a}x + \\left(\\frac{b}{2a}\\right)^2 = \\left(\\frac{b}{2a}\\right)^2 - \\frac{c}{a}",
        note: "The left side is now (x + b/2a)². Adding the same thing to both sides preserves equality.",
        why: {
          tag: "Where does (b/2a)² come from? Why that specific number?",
          explanation: "Perfect square pattern: (x + k)² = x² + 2kx + k². We have x² + (b/a)x. Matching 2k = b/a gives k = b/(2a). So we need to add k² = (b/(2a))² = b²/(4a²) to create the perfect square. This is the 'completing the square' move: find the k that makes the quadratic a perfect square, then add k² to both sides.",
          why: {
            tag: "Verify the left side really is (x + b/2a)²",
            explanation: "Expand (x + b/(2a))²: = x² + 2·x·(b/(2a)) + (b/(2a))² = x² + (b/a)x + b²/(4a²). ✓ That matches what we have on the left side.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Rewrite the left side as a perfect square and simplify the right.",
        math: "\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2}{4a^2} - \\frac{c}{a} = \\frac{b^2 - 4ac}{4a^2}",
        note: "Right side: b²/(4a²) − c/a = b²/(4a²) − 4ac/(4a²) = (b²−4ac)/(4a²).",
        why: {
          tag: "How did c/a become 4ac/(4a²)?",
          explanation: "We need a common denominator to subtract the fractions: b²/(4a²) − c/a. Multiply c/a by (4a)/(4a) = 1: c/a = 4ac/(4a²). Then b²/(4a²) − 4ac/(4a²) = (b² − 4ac)/(4a²).",
          why: null,
        },
      },
      {
        id: 4, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Take the square root of both sides (±), then solve for x.",
        math: "x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{b^2-4ac}}{2a} \\;\\Longrightarrow\\; x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
        note: "The ± accounts for both square roots. Subtracting b/(2a) from both sides gives the formula.",
        why: {
          tag: "Why ± when taking a square root?",
          explanation: "If y² = k (for k > 0), then y = √k or y = −√k, because both (√k)² = k and (−√k)² = k. Taking the square root of both sides gives both possibilities. The ± in the quadratic formula represents exactly these two roots — the two x-values where the parabola crosses the x-axis.",
          why: null,
        },
      },
      {
        id: 5, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "x = (−b ± √(b²−4ac))/(2a). The discriminant b²−4ac tells us the number of real roots.",
        math: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        note: "Discriminant b²−4ac > 0: two real roots. = 0: one real root (double root). < 0: no real roots (complex).",
        why: {
          tag: "Why is b²−4ac called the 'discriminant'?",
          explanation: "It discriminates (distinguishes) between cases. b²−4ac > 0: √(b²−4ac) is real and positive, giving two distinct real solutions. b²−4ac = 0: √0 = 0, so ± gives the same value — one double root at x = −b/(2a). b²−4ac < 0: √(negative) is imaginary — no real solutions, the parabola doesn't cross the x-axis.",
          why: null,
        },
      },
    ],
  },

  'diff-squares': {
    title: "Difference of Squares",
    subtitle: "Why a² − b² = (a+b)(a−b)",
    category: "Algebra",
    problem: "a^2 - b^2 = (a+b)(a-b)",
    preamble: "The difference of squares identity lets you factor any expression of the form a² − b². The proof is a simple FOIL expansion.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Claim: (a+b)(a−b) = a² − b². Verify by expanding.",
        math: "(a+b)(a-b) = a^2 - ab + ab - b^2",
        note: "Use FOIL: First (a·a), Outer (a·(−b)), Inner (b·a), Last (b·(−b)).",
        why: {
          tag: "What is FOIL?",
          explanation: "FOIL is a mnemonic for expanding products of two binomials: (x+y)(u+v) = xu + xv + yu + yv. F=First terms (xu), O=Outer (xv), I=Inner (yu), L=Last (yv). It's just the distributive property applied twice: (x+y)(u+v) = x(u+v) + y(u+v) = xu + xv + yu + yv.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "The middle terms −ab + ab cancel.",
        math: "a^2 - ab + ab - b^2 = a^2 - b^2 \\;\\checkmark",
        note: "The cross-terms cancel precisely because one factor is (a+b) and the other is (a−b) — opposite signs on b.",
        why: {
          tag: "Why do the middle terms always cancel in difference of squares?",
          explanation: "The outer term is a·(−b) = −ab. The inner term is b·a = +ab. These are equal in magnitude but opposite in sign, so they always cancel. This happens specifically when one factor is (a+b) and the other is (a−b) — the b has opposite signs, guaranteeing cancellation. This is why it's called a 'difference' of squares and not a 'sum' of squares.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Check: 25 − 9 = 16. And (5+3)(5−3) = 8·2 = 16. ✓",
        math: "5^2 - 3^2 = 25 - 9 = 16 = (5+3)(5-3) = 8 \\cdot 2 \\;\\checkmark",
        note: "Useful in calculus for rationalizing expressions like (√(x+h) − √x)/h — multiply by (√(x+h) + √x).",
        why: {
          tag: "Where does difference of squares appear in calculus?",
          explanation: "Rationalizing: to simplify (√x − √a)/(x−a), note that x−a = (√x)² − (√a)² = (√x − √a)(√x + √a). Cancel (√x − √a): result is 1/(√x + √a). As x→a: → 1/(2√a). This is used in computing d/dx[√x] from first principles.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "a² − b² = (a+b)(a−b). Factor by pairing sum and difference.",
        math: "a^2 - b^2 = (a+b)(a-b)",
        note: null,
        why: null,
      },
    ],
  },

  'sum-cubes': {
    title: "Sum of Cubes",
    subtitle: "Why a³ + b³ = (a+b)(a²−ab+b²)",
    category: "Algebra",
    problem: "a^3 + b^3 = (a+b)(a^2-ab+b^2)",
    preamble: "The sum of cubes factors into a linear factor (a+b) and a quadratic (a²−ab+b²). We verify by expansion.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Expand (a+b)(a²−ab+b²) by distributing.",
        math: "(a+b)(a^2-ab+b^2) = a(a^2-ab+b^2) + b(a^2-ab+b^2)",
        note: "Distribute each term in (a+b) across (a²−ab+b²).",
        why: {
          tag: "How did someone discover this factoring in the first place?",
          explanation: "Polynomial long division: knowing (a+b) is a factor of a³+b³ (since a=−b gives (−b)³+(b)³=0), divide a³+b³ by (a+b). The result is a²−ab+b². Alternatively, you can guess the form (a+b)(a²+pab+b²) and solve for p using the condition that it equals a³+b³: expanding gives a³+(1+p)a²b+(p+1)ab²+b³ = a³+b³, so 1+p=0, meaning p=−1.",
          why: null,
        },
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Expand each part and collect terms.",
        math: "= a^3 - a^2b + ab^2 + a^2b - ab^2 + b^3",
        note: "From a(a²−ab+b²) = a³−a²b+ab². From b(a²−ab+b²) = a²b−ab²+b³.",
        why: {
          tag: "Why do the middle terms cancel?",
          explanation: "Terms: −a²b + a²b = 0. Terms: ab² − ab² = 0. These cancel by the same mechanism as difference of squares — the factor (a²−ab+b²) was specifically designed with alternating signs to cancel all the middle terms. Only a³ and b³ survive.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "= a³ + b³. ✓",
        math: "a^3 + b^3 = (a+b)(a^2-ab+b^2) \\;\\checkmark",
        note: "The quadratic a²−ab+b² has no real roots (discriminant = b²−4b² = −3b² < 0), so it doesn't factor further over the reals.",
        why: {
          tag: "Why doesn't a²−ab+b² factor further?",
          explanation: "Treating a²−ab+b² as a quadratic in a: discriminant = (−b)²−4(1)(b²) = b²−4b² = −3b² < 0. No real roots, so no real linear factors. This means a³+b³ has exactly one real linear factor (a+b) and a quadratic with no real roots.",
          why: null,
        },
      },
    ],
  },

  'diff-cubes': {
    title: "Difference of Cubes",
    subtitle: "Why a³ − b³ = (a−b)(a²+ab+b²)",
    category: "Algebra",
    problem: "a^3 - b^3 = (a-b)(a^2+ab+b^2)",
    preamble: "The difference of cubes factors into (a−b) and (a²+ab+b²). Note the sign pattern compared to sum of cubes: middle sign flips.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Expand (a−b)(a²+ab+b²) by distributing.",
        math: "(a-b)(a^2+ab+b^2) = a(a^2+ab+b^2) - b(a^2+ab+b^2)",
        note: null,
        why: {
          tag: "How does the sign pattern compare to sum of cubes?",
          explanation: "Sum: a³+b³ = (a+b)(a²−ab+b²). Difference: a³−b³ = (a−b)(a²+ab+b²). Pattern: change the sign of b in the linear factor → flip the sign of the ab term in the quadratic. Memory trick: 'SOAP': Same sign, Opposite sign, Always Positive → (a−b)(a²+ab+b²) and (a+b)(a²−ab+b²).",
          why: null,
        },
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Expand and cancel middle terms.",
        math: "= a^3 + a^2b + ab^2 - a^2b - ab^2 - b^3 = a^3 - b^3 \\;\\checkmark",
        note: "a²b terms cancel; ab² terms cancel. Only a³ − b³ remain.",
        why: {
          tag: "Why does a³−b³ have a factor (a−b) while a²−b² has (a+b) and (a−b)?",
          explanation: "A polynomial P(a) has (a−r) as a factor if and only if P(r)=0. For P(a) = a³−b³: P(b) = b³−b³ = 0, so (a−b) is a factor. For P(a) = a²−b²: P(b) = b²−b² = 0 (factor (a−b)) and P(−b) = b²−b² = 0 (factor (a+b)). For a³+b³: P(−b) = (−b)³+b³ = 0, giving factor (a+b). The structure of the factoring follows from which values make the polynomial zero.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "a³ − b³ = (a−b)(a²+ab+b²).",
        math: "a^3 - b^3 = (a-b)(a^2+ab+b^2)",
        note: "In calculus: used to compute lim_{x→a} (x³−a³)/(x−a) = 3a² by factoring x³−a³ = (x−a)(x²+ax+a²), canceling (x−a), then substituting x=a.",
        why: null,
      },
    ],
  },

  'binomial': {
    title: "Binomial Theorem",
    subtitle: "The expansion of (a+b)ⁿ using combinations",
    category: "Algebra",
    problem: "(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k",
    preamble: "The Binomial Theorem gives every term in the expansion of (a+b)ⁿ. The coefficients C(n,k) — 'n choose k' — count in how many ways you can pick which factors contribute a b.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Expand (a+b)ⁿ by multiplying out n factors of (a+b).",
        math: "(a+b)^n = \\underbrace{(a+b)(a+b)\\cdots(a+b)}_{n \\text{ factors}}",
        note: "Each term in the expansion comes from choosing one letter (a or b) from each factor.",
        why: {
          tag: "Why do we get terms like aⁿ⁻ᵏbᵏ?",
          explanation: "Each term is formed by picking a or b from each of the n factors. If you pick b from exactly k of the n factors (and a from the rest), you get a^(n−k)·b^k. The question is: how many ways can you choose which k factors contribute a b? That's exactly C(n,k).",
          why: {
            tag: "What is C(n,k) = 'n choose k'?",
            explanation: "C(n,k) = n!/(k!(n−k)!) counts the number of ways to choose k items from n items without regard to order. Here: choosing which k of the n factors give a b. Examples: C(4,2) = 6 (choose 2 from 4). This is why the coefficients of (a+b)⁴ are 1,4,6,4,1 — they are C(4,0), C(4,1), C(4,2), C(4,3), C(4,4).",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify n=2: (a+b)² = a² + 2ab + b².",
        math: "(a+b)^2 = \\binom{2}{0}a^2 + \\binom{2}{1}ab + \\binom{2}{2}b^2 = a^2 + 2ab + b^2 \\;\\checkmark",
        note: "C(2,0)=1, C(2,1)=2, C(2,2)=1.",
        why: {
          tag: "What is Pascal's Triangle, and how does it relate?",
          explanation: "Pascal's Triangle lists the binomial coefficients row by row: row n gives C(n,0), C(n,1), ..., C(n,n). Each entry is the sum of the two entries above it: C(n,k) = C(n−1,k−1) + C(n−1,k). This combinatorial identity reflects the fact that to choose k items from n, you either include item n (C(n−1,k−1) ways) or exclude it (C(n−1,k) ways).",
          why: null,
        },
      },
      {
        id: 3, tag: "Verification", tagStyle: S.verify,
        instruction: "Verify n=3: (a+b)³ = a³ + 3a²b + 3ab² + b³.",
        math: "(a+b)^3 = 1\\cdot a^3 + 3a^2b + 3ab^2 + 1\\cdot b^3 \\;\\checkmark",
        note: "Coefficients: C(3,0)=1, C(3,1)=3, C(3,2)=3, C(3,3)=1.",
        why: null,
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "(a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ. Every coefficient is a combination.",
        math: "(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k",
        note: "In calculus: the binomial theorem is used in the limit-definition proof of d/dx[xⁿ] = nxⁿ⁻¹. Expanding (x+h)ⁿ shows only the k=1 term survives as h→0.",
        why: {
          tag: "How does the binomial theorem prove d/dx[xⁿ] = nxⁿ⁻¹?",
          explanation: "d/dx[xⁿ] = lim_{h→0} [(x+h)ⁿ − xⁿ]/h. Expand (x+h)ⁿ = Σ C(n,k)xⁿ⁻ᵏhᵏ = xⁿ + nxⁿ⁻¹h + C(n,2)xⁿ⁻²h² + ... Subtract xⁿ: nxⁿ⁻¹h + h²·(terms). Divide by h: nxⁿ⁻¹ + h·(terms). As h→0: → nxⁿ⁻¹. Every term except the k=1 term vanishes because it has h as a factor.",
          why: null,
        },
      },
    ],
  },

  'log-product': {
    title: "Log Product Rule",
    subtitle: "Why log_b(xy) = log_b(x) + log_b(y)",
    category: "Algebra",
    problem: "\\log_b(xy) = \\log_b x + \\log_b y",
    preamble: "Logarithms convert multiplication into addition — this was their original purpose for doing arithmetic before calculators. The log product rule is the key property that makes this possible.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let p = log_b(x) and q = log_b(y). By definition of logarithm: x = bᵖ and y = bᵍ.",
        math: "x = b^p,\\quad y = b^q \\quad\\text{where } p = \\log_b x,\\; q = \\log_b y",
        note: "This step converts log language into exponent language, where we have rules to work with.",
        why: {
          tag: "What does log_b(x) = p mean exactly?",
          explanation: "log_b(x) = p means 'b to the power p equals x.' It's the answer to: 'What power do I raise b to in order to get x?' Example: log₂(8) = 3 because 2³ = 8. The logarithm and the exponential are inverse operations: log_b(bᵖ) = p, and b^(log_b x) = x.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Compute xy using the product-of-powers rule.",
        math: "xy = b^p \\cdot b^q = b^{p+q}",
        note: "The exponent law aᵐ·aⁿ = aᵐ⁺ⁿ is doing the work here.",
        why: null,
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Take log_b of both sides of xy = b^(p+q).",
        math: "\\log_b(xy) = \\log_b(b^{p+q}) = p + q = \\log_b x + \\log_b y \\;\\checkmark",
        note: "log_b(b^(p+q)) = p+q because log and exponent are inverses.",
        why: {
          tag: "Why does log_b(b^(p+q)) simplify to just p+q?",
          explanation: "log_b and b^(...) are inverse operations, like √ and squaring. log_b(b^n) = n always — you're asking 'what power of b gives bⁿ?' and the answer is obviously n. More formally: if log_b(bᵏ) = m, then by definition bᵐ = bᵏ, so m = k. Therefore log_b(b^(p+q)) = p+q.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "log_b(xy) = log_b(x) + log_b(y). Logs turn products into sums.",
        math: "\\log_b(xy) = \\log_b x + \\log_b y",
        note: "This is why slide rules worked: log tables converted multiplication (hard) into addition (easy).",
        why: {
          tag: "Full dependency chain",
          explanation: "Log product rule relied on:",
          steps: [
            { text: "log_b(xy) = log_b x + log_b y  ← the result" },
            { text: "↳ Definition: log_b(x) = p iff bᵖ = x" },
            { text: "↳ Product rule for exponents: bᵖ·bᵍ = b^(p+q)" },
            { text: "↳ Inverse property: log_b(bᵏ) = k" },
          ],
          why: null,
        },
      },
    ],
  },

  'log-quotient': {
    title: "Log Quotient Rule",
    subtitle: "Why log_b(x/y) = log_b(x) − log_b(y)",
    category: "Algebra",
    problem: "\\log_b\\!\\left(\\tfrac{x}{y}\\right) = \\log_b x - \\log_b y",
    preamble: "The log quotient rule converts division into subtraction. It follows from the same approach as the product rule, using the exponent quotient law.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let p = log_b(x) and q = log_b(y), so x = bᵖ and y = bᵍ.",
        math: "\\frac{x}{y} = \\frac{b^p}{b^q} = b^{p-q}",
        note: "Uses the quotient rule for exponents: bᵖ/bᵍ = b^(p−q).",
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Take log_b of both sides.",
        math: "\\log_b\\!\\left(\\frac{x}{y}\\right) = \\log_b(b^{p-q}) = p - q = \\log_b x - \\log_b y \\;\\checkmark",
        note: null,
        why: {
          tag: "Can I derive this from the product rule instead?",
          explanation: "Yes: log_b(x/y) = log_b(x · (1/y)) = log_b(x) + log_b(1/y) = log_b(x) + log_b(y⁻¹) = log_b(x) − log_b(y). (Using the log power rule: log_b(y⁻¹) = −1·log_b(y) = −log_b(y).) Both approaches give the same answer.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "log_b(x/y) = log_b(x) − log_b(y). Logs turn quotients into differences.",
        math: "\\log_b\\!\\left(\\frac{x}{y}\\right) = \\log_b x - \\log_b y",
        note: "Example: log₂(16/4) = log₂(16) − log₂(4) = 4 − 2 = 2. Check: 16/4 = 4 = 2². ✓",
        why: null,
      },
    ],
  },

  'log-power': {
    title: "Log Power Rule",
    subtitle: "Why log_b(xⁿ) = n · log_b(x)",
    category: "Algebra",
    problem: "\\log_b(x^n) = n\\log_b x",
    preamble: "The log power rule moves an exponent down to a coefficient. Combined with the product and quotient rules, it makes any expression with logs or exponents computable.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let p = log_b(x), so x = bᵖ.",
        math: "x^n = (b^p)^n = b^{pn}",
        note: "Uses the power-of-a-power rule: (bᵖ)ⁿ = b^(pn).",
        why: null,
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Take log_b of both sides.",
        math: "\\log_b(x^n) = \\log_b(b^{pn}) = pn = n\\log_b x \\;\\checkmark",
        note: null,
        why: {
          tag: "Why does this let us solve exponential equations?",
          explanation: "To solve 2ˣ = 100: take log of both sides: x·log(2) = log(100), so x = log(100)/log(2) ≈ 6.64. The log power rule moved x from the exponent to a coefficient, making it solvable. Without this rule, solving for x in the exponent would be very difficult.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "log_b(xⁿ) = n · log_b(x). Exponents become multipliers.",
        math: "\\log_b(x^n) = n \\log_b x",
        note: "Extends to fractional and negative n: log_b(√x) = (1/2)log_b(x); log_b(1/x) = −log_b(x).",
        why: null,
      },
    ],
  },

  'log-change': {
    title: "Change of Base Formula",
    subtitle: "Why log_b(x) = ln(x)/ln(b)",
    category: "Algebra",
    problem: "\\log_b x = \\frac{\\ln x}{\\ln b}",
    preamble: "Most calculators only compute ln (natural log, base e) and log₁₀. The change-of-base formula converts any log to a ratio of natural logs.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Let y = log_b(x). Then by definition: bʸ = x.",
        math: "y = \\log_b(x) \\;\\Longleftrightarrow\\; b^y = x",
        note: null,
        why: {
          tag: "What is the natural log specifically?",
          explanation: "The natural logarithm ln(x) = log_e(x) is the logarithm with base e ≈ 2.71828. It's 'natural' because in calculus, d/dx[ln x] = 1/x — no extra constants. For any other base b: d/dx[log_b x] = 1/(x·ln b). The factor ln b disappears only for b = e.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Take ln of both sides of bʸ = x.",
        math: "\\ln(b^y) = \\ln(x) \\;\\Longrightarrow\\; y\\ln(b) = \\ln(x)",
        note: "Log power rule: ln(bʸ) = y·ln(b).",
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Solve for y: y = ln(x)/ln(b). So log_b(x) = ln(x)/ln(b).",
        math: "\\log_b x = \\frac{\\ln x}{\\ln b}",
        note: "Example: log₂(10) = ln(10)/ln(2) ≈ 2.303/0.693 ≈ 3.32. Check: 2^3.32 ≈ 10 ✓.",
        why: {
          tag: "Why does this work with any base, not just ln?",
          explanation: "The derivation works with any logarithm, not just ln. If you take log_c of both sides: log_c(b^y) = log_c(x) → y·log_c(b) = log_c(x) → y = log_c(x)/log_c(b). So log_b(x) = log_c(x)/log_c(b) for any base c. The formula works with log₁₀ too: log_b(x) = log₁₀(x)/log₁₀(b).",
          why: null,
        },
      },
    ],
  },
}
