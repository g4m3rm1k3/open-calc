export const EXTRA_PROBLEMS = [
  {
    id: 13,
    expression: "x^4 \\cos(x)",
    difficulty: "medium",
    conceptTag: "Product rule",
    preview: "x^4 cos(x)",
    finalAnswer: "4x^3\\cos x - x^4\\sin x",
    mcSteps: [
      {
        id: "mc1",
        question: "For x^4 cos(x), which outer rule do you apply first?",
        options: [
          { id: "A", label: "Chain rule" },
          { id: "B", label: "Product rule" },
          { id: "C", label: "Quotient rule" },
          { id: "D", label: "Power rule only" }
        ],
        correct: "B",
        feedback: {
          A: { verdict: "wrong", message: "x^4 cos(x) is not a composition; it is a multiplication of two functions. Start with product rule, then differentiate each factor.", reviewConcept: "Outermost Structure", reviewTip: "Ask what the final operation is: here, multiplication." },
          C: { verdict: "wrong", message: "No division appears, so quotient rule does not apply.", reviewConcept: "Rule Identification", reviewTip: "Quotient rule requires f/g." },
          D: { verdict: "partial", message: "Power rule applies only to x^4 as one factor, not to the whole product. The full expression needs product rule first.", reviewConcept: "Product Rule Assembly", reviewTip: "Whole expression first, subparts second." }
        },
        correctFeedback: "Correct. Let f=x^4 and g=cos(x). Then (fg)' = f'g + fg'."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Product rule assembly",
        prefix: "\\frac{d}{dx}[x^4\\cos x] = ",
        suffix: "",
        answer: "4x^3\\cos x - x^4\\sin x",
        acceptedForms: ["4x^3cosx-x^4sinx", "4x^3 cos x - x^4 sin x"],
        hint: "Use f'=4x^3 and g'=-sin(x). Then f'g + fg'.",
        explanation: "f'g = 4x^3 cos(x). fg' = x^4(-sin x). Add them: 4x^3 cos(x) - x^4 sin(x).",
        reviewConcept: "Product Rule"
      }
    ]
  },
  {
    id: 14,
    expression: "\\ln(\\sin x)",
    difficulty: "medium",
    conceptTag: "Chain rule",
    preview: "ln(sin x)",
    finalAnswer: "\\frac{\\cos x}{\\sin x}",
    mcSteps: [
      {
        id: "mc1",
        question: "ln(sin x) uses which structure?",
        options: [
          { id: "A", label: "Direct ln(x) formula only" },
          { id: "B", label: "Chain rule with outer ln and inner sin(x)" },
          { id: "C", label: "Product rule" },
          { id: "D", label: "Quotient rule" }
        ],
        correct: "B",
        feedback: {
          A: { verdict: "partial", message: "d/dx[ln x]=1/x is only direct when inner is x. Here inner is sin(x), so chain rule is required.", reviewConcept: "Direct Formula vs Chain", reviewTip: "If argument is not x, multiply by inner derivative." },
          C: { verdict: "wrong", message: "No multiplication of separate factors; sin(x) is the argument of ln.", reviewConcept: "Composition vs Product", reviewTip: "f(g(x)) means chain rule." },
          D: { verdict: "wrong", message: "No fraction structure at outer level.", reviewConcept: "Rule Identification", reviewTip: null }
        },
        correctFeedback: "Correct. (ln u)' = u'/u with u=sin(x)."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Chain on logarithm",
        prefix: "\\frac{d}{dx}[\\ln(\\sin x)] = ",
        suffix: "",
        answer: "\\frac{\\cos x}{\\sin x}",
        acceptedForms: ["cosx/sinx", "cotx", "\\frac{cosx}{sinx}"],
        hint: "Use u'/u with u=sin(x).",
        explanation: "u=sin(x), u'=cos(x). So derivative = cos(x)/sin(x).",
        reviewConcept: "Chain Rule on Log"
      }
    ]
  },
  {
    id: 15,
    expression: "\\frac{x^2+1}{x-1}",
    difficulty: "medium",
    conceptTag: "Quotient rule",
    preview: "(x^2+1)/(x-1)",
    finalAnswer: "\\frac{x^2-2x-1}{(x-1)^2}",
    mcSteps: [
      {
        id: "mc1",
        question: "For (x^2+1)/(x-1), what is the safest first method?",
        options: [
          { id: "A", label: "Quotient rule" },
          { id: "B", label: "Chain rule" },
          { id: "C", label: "Power rule only" },
          { id: "D", label: "Trig identity" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "This is not a composition at the outermost level; it's a ratio of two functions.", reviewConcept: "Outermost Structure", reviewTip: "f/g suggests quotient rule." },
          C: { verdict: "wrong", message: "Power rule applies to terms but cannot differentiate a quotient by itself.", reviewConcept: "Quotient Rule", reviewTip: null },
          D: { verdict: "wrong", message: "No trig expression is present.", reviewConcept: "Rule Identification", reviewTip: null }
        },
        correctFeedback: "Correct. Use (f'g - fg')/g^2 with f=x^2+1 and g=x-1."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Quotient assembly",
        prefix: "\\frac{d}{dx}\\left[\\frac{x^2+1}{x-1}\\right] = ",
        suffix: "",
        answer: "\\frac{x^2-2x-1}{(x-1)^2}",
        acceptedForms: ["(x^2-2x-1)/(x-1)^2", "\\frac{x^2-2x-1}{(x-1)^2}"],
        hint: "Numerator is (2x)(x-1) - (x^2+1)(1).",
        explanation: "(2x)(x-1)=2x^2-2x. Subtract x^2+1 gives x^2-2x-1. Denominator is (x-1)^2.",
        reviewConcept: "Quotient Rule"
      }
    ]
  },
  {
    id: 16,
    expression: "(3x-2)^5",
    difficulty: "medium",
    conceptTag: "Chain rule",
    preview: "(3x-2)^5",
    finalAnswer: "15(3x-2)^4",
    mcSteps: [
      {
        id: "mc1",
        question: "(3x-2)^5 is best seen as:",
        options: [
          { id: "A", label: "Power rule with chain multiplier" },
          { id: "B", label: "Product rule" },
          { id: "C", label: "Quotient rule" },
          { id: "D", label: "Log derivative" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "No multiplication of separate functions; this is one powered expression.", reviewConcept: "Power + Chain", reviewTip: null },
          C: { verdict: "wrong", message: "No division appears.", reviewConcept: "Rule Identification", reviewTip: null },
          D: { verdict: "wrong", message: "No logarithm appears.", reviewConcept: "Rule Identification", reviewTip: null }
        },
        correctFeedback: "Correct. Differentiate outer power then multiply by derivative of inner (3x-2)."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Power + chain",
        prefix: "\\frac{d}{dx}[(3x-2)^5] = ",
        suffix: "",
        answer: "15(3x-2)^4",
        acceptedForms: ["15(3x-2)^4", "5(3x-2)^4*3"],
        hint: "Outer derivative gives 5(3x-2)^4 and inner derivative is 3.",
        explanation: "Apply chain rule: 5(3x-2)^4 * 3 = 15(3x-2)^4.",
        reviewConcept: "Chain Rule"
      }
    ]
  },
  {
    id: 17,
    expression: "e^x\\ln x",
    difficulty: "medium",
    conceptTag: "Product rule",
    preview: "e^x ln(x)",
    finalAnswer: "e^x\\ln x + \\frac{e^x}{x}",
    mcSteps: [
      {
        id: "mc1",
        question: "e^x ln x requires which first step?",
        options: [
          { id: "A", label: "Product rule" },
          { id: "B", label: "Quotient rule" },
          { id: "C", label: "Chain rule only" },
          { id: "D", label: "Power rule" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "There is no outer fraction.", reviewConcept: "Rule Identification", reviewTip: null },
          C: { verdict: "partial", message: "Individual factors may use direct formulas, but the outer structure is product.", reviewConcept: "Outermost Structure", reviewTip: null },
          D: { verdict: "wrong", message: "Not a pure power expression.", reviewConcept: "Rule Identification", reviewTip: null }
        },
        correctFeedback: "Correct: (fg)' = f'g + fg' with f=e^x, g=ln x."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Product assembly",
        prefix: "\\frac{d}{dx}[e^x\\ln x] = ",
        suffix: "",
        answer: "e^x\\ln x + \\frac{e^x}{x}",
        acceptedForms: ["e^xlnx+e^x/x", "e^x(lnx+1/x)"],
        hint: "(e^x)'=e^x and (ln x)'=1/x.",
        explanation: "f'g = e^x ln x and fg' = e^x(1/x). Sum gives e^x ln x + e^x/x.",
        reviewConcept: "Product Rule"
      }
    ]
  },
  {
    id: 18,
    expression: "\\tan(x^2)",
    difficulty: "medium",
    conceptTag: "Chain rule",
    preview: "tan(x^2)",
    finalAnswer: "2x\\sec^2(x^2)",
    mcSteps: [
      {
        id: "mc1",
        question: "For tan(x^2), what is the outer derivative before inner multiplier?",
        options: [
          { id: "A", label: "sec^2(x^2)" },
          { id: "B", label: "sec(x^2)" },
          { id: "C", label: "cos(x^2)" },
          { id: "D", label: "2x" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "Derivative of tan is sec^2, not sec.", reviewConcept: "Trig Derivatives", reviewTip: null },
          C: { verdict: "wrong", message: "cos is not derivative of tan.", reviewConcept: "Trig Derivatives", reviewTip: null },
          D: { verdict: "partial", message: "2x is the inner derivative, not the outer derivative.", reviewConcept: "Chain Rule Layers", reviewTip: "Outer derivative first, inner derivative second." }
        },
        correctFeedback: "Correct. d/dx[tan(u)] = sec^2(u) * u'."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Chain multiplier",
        prefix: "\\frac{d}{dx}[\\tan(x^2)] = ",
        suffix: "",
        answer: "2x\\sec^2(x^2)",
        acceptedForms: ["2xsec^2(x^2)", "sec^2(x^2)*2x"],
        hint: "Multiply sec^2(x^2) by derivative of x^2.",
        explanation: "Inner derivative is 2x, so final derivative is 2x sec^2(x^2).",
        reviewConcept: "Chain Rule"
      }
    ]
  },
  {
    id: 19,
    expression: "(\\sin x)^2",
    difficulty: "medium",
    conceptTag: "Chain rule",
    preview: "(sin x)^2",
    finalAnswer: "2\\sin x\\cos x",
    mcSteps: [
      {
        id: "mc1",
        question: "(sin x)^2 should be treated as:",
        options: [
          { id: "A", label: "u^2 with u=sin x (chain)" },
          { id: "B", label: "sin(x^2)" },
          { id: "C", label: "Quotient" },
          { id: "D", label: "Constant" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "(sin x)^2 is not sin(x^2); squaring happens after evaluating sin(x).", reviewConcept: "Notation Precision", reviewTip: null },
          C: { verdict: "wrong", message: "No division structure.", reviewConcept: "Rule Identification", reviewTip: null },
          D: { verdict: "wrong", message: "Expression depends on x.", reviewConcept: "Constant Rule", reviewTip: null }
        },
        correctFeedback: "Correct. Differentiate u^2 to 2u and multiply by u' where u=sin x."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Chain with trig inner",
        prefix: "\\frac{d}{dx}[(\\sin x)^2] = ",
        suffix: "",
        answer: "2\\sin x\\cos x",
        acceptedForms: ["2sinxcosx", "2sin(x)cos(x)"],
        hint: "Derivative of sin(x) is cos(x).",
        explanation: "2(sin x)*(cos x) by chain rule.",
        reviewConcept: "Chain Rule"
      }
    ]
  },
  {
    id: 20,
    expression: "\\frac{x}{1+x^2}",
    difficulty: "medium",
    conceptTag: "Quotient rule",
    preview: "x/(1+x^2)",
    finalAnswer: "\\frac{1-x^2}{(1+x^2)^2}",
    mcSteps: [
      {
        id: "mc1",
        question: "x/(1+x^2) derivative numerator after quotient rule is:",
        options: [
          { id: "A", label: "1+x^2-2x^2" },
          { id: "B", label: "1+x^2+2x^2" },
          { id: "C", label: "x(1+x^2)" },
          { id: "D", label: "2x" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "Second term is subtraction f g', not addition.", reviewConcept: "Quotient Sign", reviewTip: null },
          C: { verdict: "wrong", message: "That is part of f'g, but you also must subtract fg'.", reviewConcept: "Quotient Assembly", reviewTip: null },
          D: { verdict: "wrong", message: "2x is only derivative of denominator subpart, not full numerator.", reviewConcept: "Quotient Rule", reviewTip: null }
        },
        correctFeedback: "Correct. f'=1, g=1+x^2, g'=2x gives numerator (1)(1+x^2)-x(2x)=1-x^2."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Quotient simplification",
        prefix: "\\frac{d}{dx}\\left[\\frac{x}{1+x^2}\\right] = ",
        suffix: "",
        answer: "\\frac{1-x^2}{(1+x^2)^2}",
        acceptedForms: ["(1-x^2)/(1+x^2)^2", "\\frac{1-x^2}{(1+x^2)^2}"],
        hint: "Simplify 1+x^2-2x^2.",
        explanation: "Numerator becomes 1-x^2 and denominator remains (1+x^2)^2.",
        reviewConcept: "Quotient Rule"
      }
    ]
  },
  {
    id: 21,
    expression: "\\arccos(x^2)",
    difficulty: "hard",
    conceptTag: "Inverse trig + chain",
    preview: "arccos(x^2)",
    finalAnswer: "-\\frac{2x}{\\sqrt{1-x^4}}",
    mcSteps: [
      {
        id: "mc1",
        question: "Which formula starts arccos(x^2)?",
        options: [
          { id: "A", label: "(arccos u)' = -u'/sqrt(1-u^2)" },
          { id: "B", label: "(arcsin u)' = u'/sqrt(1-u^2)" },
          { id: "C", label: "(arctan u)' = u'/(1+u^2)" },
          { id: "D", label: "(ln u)' = u'/u" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "arcsin has positive sign; arccos has negative sign.", reviewConcept: "Inverse Trig Derivatives", reviewTip: null },
          C: { verdict: "wrong", message: "That formula belongs to arctan.", reviewConcept: "Inverse Trig Derivatives", reviewTip: null },
          D: { verdict: "wrong", message: "No logarithm here.", reviewConcept: "Rule Identification", reviewTip: null }
        },
        correctFeedback: "Correct. Use u=x^2 and u'=2x in -u'/sqrt(1-u^2)."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Inverse trig chain",
        prefix: "\\frac{d}{dx}[\\arccos(x^2)] = ",
        suffix: "",
        answer: "-\\frac{2x}{\\sqrt{1-x^4}}",
        acceptedForms: ["-2x/sqrt(1-x^4)", "-(2x)/sqrt(1-x^4)"],
        hint: "u=x^2 so u^2=x^4.",
        explanation: "-u'/sqrt(1-u^2) = -2x/sqrt(1-x^4).",
        reviewConcept: "Inverse Trig + Chain"
      }
    ]
  },
  {
    id: 22,
    expression: "(x^2+1)e^x",
    difficulty: "medium",
    conceptTag: "Product rule",
    preview: "(x^2+1)e^x",
    finalAnswer: "e^x(x^2+2x+1)",
    mcSteps: [
      {
        id: "mc1",
        question: "After product rule, which equivalent simplified answer is correct?",
        options: [
          { id: "A", label: "2xe^x + (x^2+1)e^x = e^x(x^2+2x+1)" },
          { id: "B", label: "2xe^x + e^x = e^x(2x+1)" },
          { id: "C", label: "(x^2+1)e^x only" },
          { id: "D", label: "2x + x^2+1" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "You dropped the x^2 term from (x^2+1)e^x.", reviewConcept: "Algebraic Collection", reviewTip: null },
          C: { verdict: "wrong", message: "Missing f'g term 2xe^x.", reviewConcept: "Product Rule", reviewTip: null },
          D: { verdict: "wrong", message: "e^x factor was lost, changing the function family.", reviewConcept: "Factor Preservation", reviewTip: null }
        },
        correctFeedback: "Correct. Combine both product terms and factor e^x."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Product simplification",
        prefix: "\\frac{d}{dx}[(x^2+1)e^x] = ",
        suffix: "",
        answer: "e^x(x^2+2x+1)",
        acceptedForms: ["e^x(x^2+2x+1)", "2xe^x+(x^2+1)e^x"],
        hint: "f'=2x and g'=e^x.",
        explanation: "Derivative is 2xe^x + (x^2+1)e^x = e^x(x^2+2x+1).",
        reviewConcept: "Product Rule"
      }
    ]
  },
  {
    id: 23,
    expression: "\\frac{\\ln x}{x}",
    difficulty: "hard",
    conceptTag: "Quotient rule",
    preview: "ln(x)/x",
    finalAnswer: "\\frac{1-\\ln x}{x^2}",
    mcSteps: [
      {
        id: "mc1",
        question: "In (ln x)/x with quotient rule, numerator becomes:",
        options: [
          { id: "A", label: "(1/x)x - ln(x)" },
          { id: "B", label: "(1/x)+ln(x)" },
          { id: "C", label: "ln(x) - x" },
          { id: "D", label: "1/x^2" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "Quotient numerator is f'g - fg', not sum.", reviewConcept: "Quotient Sign", reviewTip: null },
          C: { verdict: "wrong", message: "f'g is (1/x)x = 1, not ln(x).", reviewConcept: "Quotient Setup", reviewTip: null },
          D: { verdict: "wrong", message: "That is not the full numerator expression.", reviewConcept: "Quotient Rule", reviewTip: null }
        },
        correctFeedback: "Correct. (1/x)x - ln(x) = 1 - ln(x)."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Quotient simplification",
        prefix: "\\frac{d}{dx}\\left[\\frac{\\ln x}{x}\\right] = ",
        suffix: "",
        answer: "\\frac{1-\\ln x}{x^2}",
        acceptedForms: ["(1-lnx)/x^2", "\\frac{1-\\ln x}{x^2}"],
        hint: "Simplify f'g - fg' first to 1-ln(x).",
        explanation: "Numerator is 1-ln(x), denominator is x^2.",
        reviewConcept: "Quotient Rule"
      }
    ]
  },
  {
    id: 24,
    expression: "(x^3+1)^4\\cos x",
    difficulty: "very hard",
    conceptTag: "Product + chain",
    preview: "(x^3+1)^4 cos(x)",
    finalAnswer: "12x^2(x^3+1)^3\\cos x-(x^3+1)^4\\sin x",
    mcSteps: [
      {
        id: "mc1",
        question: "What must happen before differentiating cos(x) in this product?",
        options: [
          { id: "A", label: "Differentiate (x^3+1)^4 by chain rule" },
          { id: "B", label: "Use quotient rule" },
          { id: "C", label: "Treat (x^3+1)^4 as constant" },
          { id: "D", label: "No rule needed" }
        ],
        correct: "A",
        feedback: {
          B: { verdict: "wrong", message: "No division at outer level.", reviewConcept: "Rule Identification", reviewTip: null },
          C: { verdict: "wrong", message: "(x^3+1)^4 depends on x, so it is not constant.", reviewConcept: "Constant Rule", reviewTip: null },
          D: { verdict: "wrong", message: "Both product and chain rules are required.", reviewConcept: "Multi-rule Assembly", reviewTip: null }
        },
        correctFeedback: "Correct. Use product rule; first factor derivative needs chain rule: 4(x^3+1)^3 * 3x^2."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Product + chain assembly",
        prefix: "\\frac{d}{dx}[(x^3+1)^4\\cos x] = ",
        suffix: "",
        answer: "12x^2(x^3+1)^3\\cos x-(x^3+1)^4\\sin x",
        acceptedForms: ["12x^2(x^3+1)^3cosx-(x^3+1)^4sinx"],
        hint: "f' = 12x^2(x^3+1)^3 and g'=-sin(x).",
        explanation: "f'g + fg' = 12x^2(x^3+1)^3 cos(x) + (x^3+1)^4(-sin x).",
        reviewConcept: "Product + Chain"
      }
    ]
  },
  {
    id: 101,
    expression: "\\sqrt{1 - \\sin^2(x)}",
    difficulty: "medium",
    conceptTag: "Chain + simplification",
    preview: "sqrt(1 - sin^2(x))",
    finalAnswer: "-\\sin(x)",
    mcSteps: [
      {
        id: "mc1",
        question: "What is the BEST first step?",
        options: [
          { id: "A", label: "Apply chain rule directly" },
          { id: "B", label: "Rewrite using trig identity" },
          { id: "C", label: "Expand the square root" },
          { id: "D", label: "Convert to exponential form" }
        ],
        correct: "B",
        feedback: {
          A: {
            verdict: "partial",
            message: "You can chain it, but you're missing a major simplification that makes this trivial.",
            reviewConcept: "Trig identities",
            reviewTip: "Always look for identities before differentiating"
          },
          C: {
            verdict: "wrong",
            message: "Square roots don't expand like polynomials.",
            reviewConcept: "Algebra rules"
          },
          D: {
            verdict: "wrong",
            message: "No exponentials are present here.",
            reviewConcept: "Function recognition"
          }
        },
        correctFeedback: "1 - sin^2(x) = cos^2(x), so this becomes sqrt(cos^2(x))."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Trig identity simplification",
        prefix: "\\sqrt{1 - \\sin^2(x)} = ",
        suffix: "",
        answer: "\\cos(x)",
        acceptedForms: ["cos(x)", "cosx"],
        hint: "Recall the Pythagorean identity.",
        explanation: "1 - sin^2(x) = cos^2(x), so sqrt(cos^2(x)) = cos(x) (ignoring absolute value for now).",
        reviewConcept: "Trig identities"
      },
      {
        id: "b2",
        conceptTested: "Derivative of cosine",
        prefix: "\\frac{d}{dx}[\\cos(x)] = ",
        suffix: "",
        answer: "-\\sin(x)",
        acceptedForms: ["-sin(x)", "-sinx"],
        hint: "Derivative of cos is negative sin.",
        explanation: "Once simplified, this is a basic derivative.",
        reviewConcept: "Basic trig derivatives"
      }
    ]
  },
  {
    id: 102,
    expression: "x^x",
    difficulty: "hard",
    conceptTag: "Log differentiation",
    preview: "x^x",
    finalAnswer: "x^x(\\ln(x)+1)",
    mcSteps: [
      {
        id: "mc1",
        question: "Why can't we use the standard power rule?",
        options: [
          { id: "A", label: "Because the exponent is not constant" },
          { id: "B", label: "Because x is negative" },
          { id: "C", label: "Because it's exponential" },
          { id: "D", label: "Because the base is constant" }
        ],
        correct: "A",
        feedback: {
          B: {
            verdict: "wrong",
            message: "No restriction like that is given here.",
            reviewConcept: "Function domain"
          },
          C: {
            verdict: "partial",
            message: "Close, but the key issue is the variable exponent.",
            reviewConcept: "Exponential vs power"
          },
          D: {
            verdict: "wrong",
            message: "The base is not constant.",
            reviewConcept: "Power rule"
          }
        },
        correctFeedback: "Power rule only works when exponent is constant. Use log differentiation."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Log step",
        prefix: "\\ln(y) = ",
        suffix: "",
        answer: "x\\ln(x)",
        acceptedForms: ["x ln(x)", "xln(x)", "x*ln(x)"],
        hint: "Take ln of both sides.",
        explanation: "ln(x^x) = x ln(x).",
        reviewConcept: "Log properties"
      },
      {
        id: "b2",
        conceptTested: "Product rule",
        prefix: "\\frac{d}{dx}[x\\ln(x)] = ",
        suffix: "",
        answer: "\\ln(x) + 1",
        acceptedForms: ["ln(x)+1", "1+ln(x)"],
        hint: "Product rule: derivative of x is 1.",
        explanation: "Derivative = 1*ln(x) + x*(1/x).",
        reviewConcept: "Product rule"
      }
    ]
  },
  {
    id: 103,
    expression: "x e^x \\sin(x)",
    difficulty: "hard",
    conceptTag: "Product + Chain",
    preview: "x * e^x * sin(x)",
    finalAnswer: "e^x\\sin(x) + x e^x\\sin(x) + x e^x\\cos(x)",
    mcSteps: [
      {
        id: "mc1",
        question: "How many terms will the derivative have?",
        options: [
          { id: "A", label: "2" },
          { id: "B", label: "3" },
          { id: "C", label: "1" },
          { id: "D", label: "4" }
        ],
        correct: "B",
        feedback: {
          A: {
            verdict: "wrong",
            message: "That's for a two-factor product.",
            reviewConcept: "Product rule"
          },
          C: {
            verdict: "wrong",
            message: "This is not a simple function.",
            reviewConcept: "Function structure"
          },
          D: {
            verdict: "wrong",
            message: "Each factor contributes exactly once.",
            reviewConcept: "Product rule"
          }
        },
        correctFeedback: "Three factors produce three terms."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Structure recognition",
        prefix: "\\frac{d}{dx}[x e^x \\sin(x)] = ",
        suffix: "",
        answer: "e^x\\sin(x) + x e^x\\sin(x) + x e^x\\cos(x)",
        acceptedForms: ["e^x sin(x) + x e^x sin(x) + x e^x cos(x)", "e^xsinx+xe^xsinx+xe^xcosx"],
        hint: "Differentiate one factor at a time.",
        explanation: "Each term is derivative of one factor times the other two unchanged.",
        reviewConcept: "Product rule"
      }
    ]
  },
  {
    id: 104,
    expression: "\\arcsin(\\cos(x))",
    difficulty: "hard",
    conceptTag: "Chain × 3 layers",
    preview: "arcsin(cos(x))",
    finalAnswer: "\\frac{-\\sin(x)}{\\sqrt{1-\\cos^2(x)}}",
    mcSteps: [
      {
        id: "mc1",
        question: "What is the OUTER function?",
        options: [
          { id: "A", label: "cos(x)" },
          { id: "B", label: "arcsin" },
          { id: "C", label: "x" },
          { id: "D", label: "sin(x)" }
        ],
        correct: "B",
        feedback: {
          A: {
            verdict: "wrong",
            message: "That's the inner function.",
            reviewConcept: "Chain rule"
          },
          C: {
            verdict: "wrong",
            message: "x is deeply inside.",
            reviewConcept: "Function layers"
          },
          D: {
            verdict: "wrong",
            message: "Not present.",
            reviewConcept: "Function recognition"
          }
        },
        correctFeedback: "Start from the outside, then peel inward."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Derivative of arcsin",
        prefix: "\\frac{d}{dx}[\\arcsin(u)] = ",
        suffix: "",
        answer: "\\frac{1}{\\sqrt{1-u^2}}",
        acceptedForms: ["1/sqrt(1-u^2)", "1/\\sqrt(1-u^2)"],
        hint: "Use the standard inverse trig derivative.",
        explanation: "(arcsin u)' = 1/sqrt(1-u^2).",
        reviewConcept: "Inverse trig derivatives"
      },
      {
        id: "b2",
        conceptTested: "Chain completion",
        prefix: "\\frac{d}{dx}[\\arcsin(\\cos(x))] = ",
        suffix: "",
        answer: "\\frac{-\\sin(x)}{\\sqrt{1-\\cos^2(x)}}",
        acceptedForms: ["-sin(x)/sqrt(1-cos^2(x))", "(-sinx)/sqrt(1-cos^2x)"],
        hint: "Multiply outer derivative by derivative of cos(x).",
        explanation: "Outer derivative at cos(x), then multiply by -sin(x).",
        reviewConcept: "Chain rule"
      }
    ]
  },
  {
    id: 105,
    expression: "\\frac{x^2 + x}{x}",
    difficulty: "medium",
    conceptTag: "Chain + simplification",
    preview: "(x^2 + x)/x",
    finalAnswer: "1",
    mcSteps: [
      {
        id: "mc1",
        question: "What is the BEST strategy?",
        options: [
          { id: "A", label: "Use quotient rule" },
          { id: "B", label: "Simplify first" },
          { id: "C", label: "Use product rule" },
          { id: "D", label: "Use chain rule" }
        ],
        correct: "B",
        feedback: {
          A: {
            verdict: "partial",
            message: "You can, but it's inefficient compared to simplifying first.",
            reviewConcept: "Strategy"
          },
          C: {
            verdict: "wrong",
            message: "Not in product form yet.",
            reviewConcept: "Function form"
          },
          D: {
            verdict: "wrong",
            message: "No composition here.",
            reviewConcept: "Chain rule"
          }
        },
        correctFeedback: "Always simplify before applying heavy rules when possible."
      }
    ],
    blanks: [
      {
        id: "b1",
        conceptTested: "Simplification",
        prefix: "\\frac{x^2 + x}{x} = ",
        suffix: "",
        answer: "x + 1",
        acceptedForms: ["x+1"],
        hint: "Divide each term by x.",
        explanation: "x^2/x + x/x = x + 1.",
        reviewConcept: "Algebra"
      },
      {
        id: "b2",
        conceptTested: "Final derivative",
        prefix: "\\frac{d}{dx}[x+1] = ",
        suffix: "",
        answer: "1",
        acceptedForms: ["1"],
        hint: "Derivative of x is 1.",
        explanation: "Constant term disappears.",
        reviewConcept: "Basic derivatives"
      }
    ]
  }
]
