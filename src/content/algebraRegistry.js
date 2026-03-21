export const ALGEBRA_REGISTRY = {
  'difference-of-squares': {
    name: 'Difference of Squares',
    formula: 'a^2 - b^2 = (a - b)(a + b)',
    example: 'x^2 - 9 = x^2 - 3^2 = (x - 3)(x + 3)',
    description: 'A binomial that is the difference of two perfect squares can be factored into the product of the sum and difference of the squared terms.',
    chapterZeroSlug: 'algebraic-techniques',
  },
  'exponent-rules-multiply': {
    name: 'Multiplying Exponents',
    formula: 'x^a \\cdot x^b = x^{a+b}',
    example: 'x^2 \\cdot x^3 = x^5',
    description: 'When multiplying identical bases, you add the exponents. This represents accumulating factors.',
    chapterZeroSlug: 'real-numbers',
  },
  'exponent-rules-power': {
    name: 'Power of a Power',
    formula: '(x^a)^b = x^{a \\cdot b}',
    example: '(x^2)^3 = x^6',
    description: 'When raising a power to another power, multiply the exponents.',
    chapterZeroSlug: 'real-numbers',
  },
  'log-power-rule': {
    name: 'Log Power Rule',
    formula: '\\log(x^p) = p \\cdot \\log(x)',
    example: '\\ln(e^3) = 3\\ln(e) = 3(1) = 3',
    description: 'Exponents inside a logarithm can be pulled out as constant multipliers. This turns exponential growth into linear scaling.',
    chapterZeroSlug: 'exponentials',
  },
  'triangle-inequality': {
    name: 'Triangle Inequality',
    formula: '|a + b| \\leq |a| + |b|',
    example: '|(-3) + 4| \\leq |-3| + |4| \\implies |1| \\leq 3 + 4',
    description: 'The length of the sum of two vectors is never greater than the sum of their individual lengths. Opposite directions cancel.',
    chapterZeroSlug: 'inequalities',
  },
  'conjugate-multiplication': {
    name: 'Multiplying by the Conjugate',
    formula: '(\\sqrt{a} - \\sqrt{b})(\\sqrt{a} + \\sqrt{b}) = a - b',
    example: '(\\sqrt{x} - 2)(\\sqrt{x} + 2) = x - 4',
    description: 'By multiplying a radical binomial by its conjugate, you create a difference of squares that eliminates the square roots.',
    chapterZeroSlug: 'algebraic-techniques',
  },
  'fraction-split': {
    name: 'Splitting the Numerator',
    formula: '\\frac{a + b}{c} = \\frac{a}{c} + \\frac{b}{c}',
    example: '\\frac{x + 2}{x} = \\frac{x}{x} + \\frac{2}{x} = 1 + \\frac{2}{x}',
    description: 'A sum in the numerator can be split into separate fractions over the common denominator. (Warning: You CANNOT split a denominator!)',
    chapterZeroSlug: 'algebraic-techniques',
  },
  'factoring-fractional-powers': {
    name: 'Factoring Fractional Powers',
    formula: 'x^{3/2} + x^{1/2} = x^{1/2}(x^1 + 1)',
    example: '(x+1)^{3/2} - (x+1)^{1/2} = (x+1)^{1/2}[(x+1) - 1]',
    description: 'When an expression contains multiple fractional powers of the same base, always factor out the term with the smallest (or most negative) exponent to simplify.',
    chapterZeroSlug: 'algebraic-techniques',
  }
};
