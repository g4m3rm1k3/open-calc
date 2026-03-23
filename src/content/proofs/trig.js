// Proof data for all trigonometry reference entries.

const S = {
  setup:    { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  key:      { bg: "#eff6ff", text: "#1e40af",  border: "#bfdbfe" },
  algebra:  { bg: "#fff7ed", text: "#9a3412",  border: "#fed7aa" },
  geo:      { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  limit:    { bg: "#fdf4ff", text: "#6b21a8",  border: "#e9d5ff" },
  conclude: { bg: "#f0fdf4", text: "#14532d",  border: "#86efac" },
  verify:   { bg: "#f0fdfa", text: "#134e4a",  border: "#99f6e4" },
}

export const TRIG_PROOFS = {

  'sohcahtoa': {
    title: "SOH-CAH-TOA",
    subtitle: "Where the right-triangle definitions of sin, cos, tan come from",
    category: "Trigonometry",
    problem: "\\sin\\theta = \\tfrac{\\text{opp}}{\\text{hyp}},\\quad \\cos\\theta = \\tfrac{\\text{adj}}{\\text{hyp}},\\quad \\tan\\theta = \\tfrac{\\text{opp}}{\\text{adj}}",
    preamble: "SOH-CAH-TOA summarizes how sin, cos, and tan are defined for angles in right triangles. These are ratios of side lengths — and crucially, they depend only on the angle, not on how big the triangle is.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "In a right triangle with acute angle θ: label the sides relative to θ. The hypotenuse is opposite the right angle (longest side).",
        math: "\\text{hyp} = c \\text{ (opposite 90°)},\\quad \\text{opp} = \\text{side opposite }\\theta,\\quad \\text{adj} = \\text{side adjacent to }\\theta",
        note: "The labels 'opposite' and 'adjacent' depend on which angle θ you're considering.",
        why: {
          tag: "Why do these ratios depend only on the angle, not the triangle size?",
          explanation: "Any two right triangles with the same angle θ are similar — one is just a scaled-up version of the other. In similar triangles, corresponding sides are proportional. So opp/hyp is the same ratio regardless of scale. If you double the triangle, both opp and hyp double, keeping the ratio constant. This is why sin θ = opp/hyp is a function of θ only.",
          why: {
            tag: "What does 'similar triangles' mean?",
            explanation: "Two triangles are similar if they have the same angles (in the same order). Similar triangles have proportional sides: if triangle 1 has sides a,b,c and triangle 2 has sides ka,kb,kc (scaled by k), all side ratios are preserved. In right triangles, having one matching acute angle θ makes them similar (since the other acute angle is 90°−θ, and all angles match).",
            why: null,
          },
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "On a unit circle (r=1), the angle θ corresponds to point (cos θ, sin θ). This unifies the right-triangle and unit-circle definitions.",
        math: "\\text{Unit circle: } (x,y) = (\\cos\\theta, \\sin\\theta) \\implies \\cos\\theta = \\frac{x}{1} = \\frac{\\text{adj}}{\\text{hyp}}, \\sin\\theta = \\frac{y}{1} = \\frac{\\text{opp}}{\\text{hyp}}",
        note: "For the unit circle right triangle: hyp=1 (radius), opp=y (height), adj=x (horizontal distance).",
        why: {
          tag: "How are the right-triangle and unit-circle definitions the same?",
          explanation: "Draw a right triangle inside the unit circle with the angle θ at the origin. The hypotenuse is the radius = 1. The adjacent side is the horizontal distance = x = cos θ. The opposite side is the vertical distance = y = sin θ. So cos θ = adj/hyp = x/1 = x, and sin θ = opp/hyp = y/1 = y. The unit circle definition (cos θ, sin θ) is just the right-triangle definition with hyp=1.",
          why: null,
        },
      },
      {
        id: 3, tag: "Verify", tagStyle: S.verify,
        instruction: "Verify at θ = 30°: sin 30° = 1/2, cos 30° = √3/2.",
        math: "\\text{30-60-90 triangle: sides } 1,\\sqrt{3},2 \\implies \\sin 30° = \\frac{1}{2},\\; \\cos 30° = \\frac{\\sqrt{3}}{2}",
        note: "30-60-90 triangle comes from bisecting an equilateral triangle of side 2.",
        why: {
          tag: "How do we know the sides of a 30-60-90 triangle?",
          explanation: "Start with an equilateral triangle (all sides=2, all angles=60°). Drop a perpendicular from one vertex to the opposite side. This bisects the triangle into two 30-60-90 triangles. The hypotenuse is 2 (original side). The base is 1 (half of 2). The height h: by Pythagorean theorem, h²+1²=2², so h=√3. The 30-60-90 triangle has sides 1:√3:2.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "SOH-CAH-TOA: sin=Opp/Hyp, cos=Adj/Hyp, tan=Opp/Adj.",
        math: "\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}},\\quad \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}},\\quad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = \\frac{\\text{opp}}{\\text{adj}}",
        note: "tan = sin/cos because (opp/hyp)/(adj/hyp) = opp/adj. Tangent is the ratio of the two non-hypotenuse sides.",
        why: null,
      },
    ],
  },

  'pyth-id': {
    title: "Pythagorean Identity",
    subtitle: "Why sin²θ + cos²θ = 1",
    category: "Trigonometry",
    problem: "\\sin^2\\theta + \\cos^2\\theta = 1",
    preamble: "This is the most fundamental trigonometric identity. It says that for any angle θ, the point (cos θ, sin θ) lies on the unit circle x²+y²=1. This is literally the definition.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "On the unit circle, every point is defined as (cos θ, sin θ) for some angle θ.",
        math: "\\text{Point on unit circle: }(x, y) = (\\cos\\theta, \\sin\\theta)",
        note: "The unit circle has equation x²+y²=1.",
        why: {
          tag: "What is the unit circle?",
          explanation: "The unit circle is the circle centered at the origin with radius 1. Its equation is x²+y²=1. The angle θ is measured counterclockwise from the positive x-axis. For each angle θ, the point where the terminal ray intersects the unit circle is defined to be (cos θ, sin θ). This is the definition of cos and sin for any angle — not just acute angles in right triangles.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Since (cos θ, sin θ) is on x²+y²=1, substitute directly.",
        math: "x^2 + y^2 = 1 \\implies \\cos^2\\theta + \\sin^2\\theta = 1",
        note: "That's it. The identity is a direct consequence of the definition.",
        why: {
          tag: "This seems too simple — is there more to it?",
          explanation: "For the unit circle definition, it really is that simple. But if you use the right-triangle definition (sin = opp/hyp, cos = adj/hyp): sin²θ + cos²θ = (opp/hyp)² + (adj/hyp)² = (opp² + adj²)/hyp². By the Pythagorean theorem: opp² + adj² = hyp². So the ratio = hyp²/hyp² = 1. Both approaches give the same result, showing the unit circle and right-triangle definitions are consistent.",
          why: {
            tag: "Why does opp² + adj² = hyp²?",
            explanation: "This is just the Pythagorean theorem! In the right triangle, opp and adj are the two legs, hyp is the hypotenuse. a²+b²=c² with a=opp, b=adj, c=hyp. So opp²+adj²=hyp², and (opp²+adj²)/hyp² = 1.",
            why: null,
          },
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "sin²θ + cos²θ = 1 for all angles θ.",
        math: "\\sin^2\\theta + \\cos^2\\theta = 1",
        note: "This works for ALL angles — not just 0° to 90°. For obtuse angles, the unit circle definition of sin and cos still satisfies this equation.",
        why: {
          tag: "Why is this the most important trig identity?",
          explanation: "It connects sin and cos, so if you know one, you can find the other (up to sign). It's used to: simplify trig expressions, prove derivative rules (d/dx[sin x] = cos x relies on this), evaluate integrals (∫sin²x dx uses sin²x = (1−cos 2x)/2, derived from this), and solve triangles. Most other trig identities are derived from it.",
          why: null,
        },
      },
    ],
  },

  'pyth-id-2': {
    title: "Pythagorean Identity (tan)",
    subtitle: "Why 1 + tan²θ = sec²θ",
    category: "Trigonometry",
    problem: "1 + \\tan^2\\theta = \\sec^2\\theta",
    preamble: "This identity follows from dividing the fundamental Pythagorean identity by cos²θ. It's essential in calculus for simplifying integrands involving tan and sec.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start from sin²θ + cos²θ = 1. Divide every term by cos²θ.",
        math: "\\frac{\\sin^2\\theta}{\\cos^2\\theta} + \\frac{\\cos^2\\theta}{\\cos^2\\theta} = \\frac{1}{\\cos^2\\theta}",
        note: "This requires cos θ ≠ 0 (θ ≠ 90° + n·180°).",
        why: {
          tag: "Why divide by cos²θ specifically?",
          explanation: "We want to get tan²θ into the equation. Since tan θ = sin θ/cos θ, we need sin²θ/cos²θ on the left. Dividing sin²θ+cos²θ=1 by cos²θ achieves this. The choice of what to divide by depends on which identity you want to derive.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Recognize the three fractions as tan², 1, and sec².",
        math: "\\tan^2\\theta + 1 = \\sec^2\\theta \\;\\Longleftrightarrow\\; 1 + \\tan^2\\theta = \\sec^2\\theta",
        note: "sin/cos = tan, so sin²/cos² = tan². And 1/cos = sec, so 1/cos² = sec².",
        why: {
          tag: "What is sec θ?",
          explanation: "sec θ = 1/cos θ. It's the reciprocal of cosine. The name 'secant' comes from the Latin 'secare' (to cut): in the unit circle, the secant line from the origin intersects the tangent line at a point whose distance from the origin is sec θ. In calculus, sec²θ appears as the derivative of tan θ.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "1 + tan²θ = sec²θ. Used in trig substitution: if x = tan θ, then 1+x² = sec²θ.",
        math: "1 + \\tan^2\\theta = \\sec^2\\theta",
        note: "In integration: ∫sec²θ dθ = tan θ + C, and trig substitution x = tan θ converts ∫1/(1+x²)dx into ∫(1/sec²θ)·sec²θ dθ = ∫dθ = θ + C = arctan(x) + C.",
        why: null,
      },
    ],
  },

  'pyth-id-3': {
    title: "Pythagorean Identity (cot)",
    subtitle: "Why 1 + cot²θ = csc²θ",
    category: "Trigonometry",
    problem: "1 + \\cot^2\\theta = \\csc^2\\theta",
    preamble: "By dividing sin²θ + cos²θ = 1 by sin²θ, we get the third Pythagorean identity.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start from sin²θ + cos²θ = 1. Divide every term by sin²θ.",
        math: "\\frac{\\sin^2\\theta}{\\sin^2\\theta} + \\frac{\\cos^2\\theta}{\\sin^2\\theta} = \\frac{1}{\\sin^2\\theta}",
        note: "Requires sin θ ≠ 0 (θ ≠ 0, π, 2π, ...).",
        why: {
          tag: "What are cot and csc?",
          explanation: "cot θ = cos θ / sin θ (cotangent = reciprocal of tangent). csc θ = 1/sin θ (cosecant = reciprocal of sine). So cos²/sin² = cot², and 1/sin² = csc². These reciprocal trig functions appear in integration: ∫csc²θ dθ = −cot θ + C, and in advanced substitutions.",
          why: null,
        },
      },
      {
        id: 2, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "1 + cot²θ = csc²θ.",
        math: "1 + \\cot^2\\theta = \\csc^2\\theta",
        note: "All three Pythagorean identities: sin²+cos²=1 (divide by 1), tan²+1=sec² (divide by cos²), cot²+1=csc² (divide by sin²).",
        why: null,
      },
    ],
  },

  'angle-add-sin': {
    title: "Sine Addition Formula",
    subtitle: "Why sin(A ± B) = sin A cos B ± cos A sin B",
    category: "Trigonometry",
    problem: "\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B",
    preamble: "The sine addition formula is one of the most important trig identities. It expresses the sine of a sum in terms of sines and cosines of the individual angles. We derive it using the unit circle and geometry.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "On the unit circle, points at angles A and B are P₁=(cos A, sin A) and P₂=(cos B, sin B).",
        math: "P_1 = (\\cos A,\\sin A),\\quad P_2 = (\\cos B, \\sin B)",
        note: "We want to find sin(A+B), the y-coordinate of the point at angle A+B.",
        why: {
          tag: "Why use the unit circle for this?",
          explanation: "The unit circle definition of sin and cos is the most general (works for all angles, not just acute ones). The point at angle θ on the unit circle has coordinates (cos θ, sin θ), so finding sin(A+B) means finding the y-coordinate of the point at angle A+B. The unit circle lets us use geometric distances and areas to derive the formula.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Use the rotation matrix approach: rotating the point (cos B, sin B) by angle A.",
        math: "\\begin{pmatrix}\\cos(A+B)\\\\\\sin(A+B)\\end{pmatrix} = \\begin{pmatrix}\\cos A & -\\sin A\\\\\\sin A & \\cos A\\end{pmatrix}\\begin{pmatrix}\\cos B\\\\\\sin B\\end{pmatrix}",
        note: "Rotating a point (x,y) by angle A gives (x cos A − y sin A, x sin A + y cos A).",
        why: {
          tag: "What is a rotation matrix and where does it come from?",
          explanation: "Rotating the point (1,0) by angle A gives (cos A, sin A). Rotating (0,1) by angle A gives (−sin A, cos A). Any point (x,y) = x·(1,0) + y·(0,1). By linearity of rotation: rotating (x,y) gives x·(cos A, sin A) + y·(−sin A, cos A) = (x cos A − y sin A, x sin A + y cos A). This is the rotation matrix applied to (x,y).",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Extract the y-component (sin(A+B)) from the matrix multiplication.",
        math: "\\sin(A+B) = \\sin A \\cos B + \\cos A \\sin B",
        note: "The x-component gives cos(A+B) = cos A cos B − sin A sin B (cosine addition formula).",
        why: {
          tag: "Where does sin(A−B) come from?",
          explanation: "Replace B with −B: sin(A+(−B)) = sin A cos(−B) + cos A sin(−B). Since cos(−B) = cos B (cosine is even) and sin(−B) = −sin B (sine is odd): sin(A−B) = sin A cos B − cos A sin B. The ± in the formula captures both cases.",
          why: {
            tag: "Why is cos(−B) = cos B and sin(−B) = −sin B?",
            explanation: "On the unit circle: angle −B reflects the point across the x-axis. So (cos(−B), sin(−B)) = (cos B, −sin B). This means cos is 'even' (reflection doesn't change it) and sin is 'odd' (reflection negates it). Geometrically: the x-coordinate doesn't change when you flip vertically, but the y-coordinate negates.",
            why: null,
          },
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "sin(A±B) = sin A cos B ± cos A sin B.",
        math: "\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B",
        note: "This is used to prove d/dx[sin x] = cos x (by computing sin(x+h)−sin(x) and taking h→0) and to derive double-angle and half-angle formulas.",
        why: {
          tag: "Full dependency chain",
          explanation: "sin(A+B) formula relied on:",
          steps: [
            { text: "sin(A+B) = sin A cos B + cos A sin B  ← the result" },
            { text: "↳ Unit circle definition of sin and cos" },
            { text: "↳ Rotation matrix (rotation preserves distances)" },
            { text: "↳ Linearity of rotation as a transformation" },
          ],
          why: null,
        },
      },
    ],
  },

  'angle-add-cos': {
    title: "Cosine Addition Formula",
    subtitle: "Why cos(A ± B) = cos A cos B ∓ sin A sin B",
    category: "Trigonometry",
    problem: "\\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B",
    preamble: "The cosine addition formula comes from the same rotation matrix approach as the sine addition formula — it's the x-component of the rotated point.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "From the rotation matrix, the x-component of rotating (cos B, sin B) by angle A gives cos(A+B).",
        math: "\\cos(A+B) = \\cos A \\cos B - \\sin A \\sin B",
        note: "The x-component: cos A · cos B + (−sin A) · sin B = cos A cos B − sin A sin B.",
        why: {
          tag: "Why the minus sign instead of plus?",
          explanation: "Rotating (x,y) by angle A gives x-coordinate: x·cos A − y·sin A. With x=cos B, y=sin B: cos(A+B) = cos A · cos B − sin A · sin B. The minus comes from the rotation matrix entry: rotating (0,1) by A gives (−sin A, cos A), contributing −sin A when y=sin B is involved.",
          why: null,
        },
      },
      {
        id: 2, tag: "Verify", tagStyle: S.verify,
        instruction: "Verify: cos(60°) = cos(30°+30°) = cos²30° − sin²30° = (3/4) − (1/4) = 1/2. ✓",
        math: "\\cos 60° = \\frac{1}{2}, \\quad \\cos^2 30° - \\sin^2 30° = \\frac{3}{4} - \\frac{1}{4} = \\frac{1}{2} \\;\\checkmark",
        note: null,
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "cos(A±B) = cos A cos B ∓ sin A sin B.",
        math: "\\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B",
        note: "Note the ∓: when the outer sign is +, the inner sign is −, and vice versa. This is opposite to the sine addition formula.",
        why: null,
      },
    ],
  },

  'double-sin': {
    title: "Double Angle (sin)",
    subtitle: "Why sin 2A = 2 sin A cos A",
    category: "Trigonometry",
    problem: "\\sin 2A = 2\\sin A\\cos A",
    preamble: "The double angle formula for sine follows directly from the sine addition formula with B = A.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Apply sin(A+B) with B = A.",
        math: "\\sin(A + A) = \\sin A\\cos A + \\cos A\\sin A = 2\\sin A\\cos A",
        note: "The two terms are identical: sin A cos A + cos A sin A = 2 sin A cos A.",
        why: {
          tag: "Is there a geometric interpretation of sin 2A = 2 sin A cos A?",
          explanation: "In a right triangle with hypotenuse 1 and angle A: the opposite side is sin A, adjacent is cos A. The area of the triangle is (1/2)·base·height = (1/2)·cos A·sin A. For a triangle inscribed in a unit circle, the full angle at the center is 2A, and the area of the corresponding triangle is (1/2)r²sin(2A) = (1/2)sin(2A). Setting these equal: (1/2)sin(2A) = 2·(1/2)cos A·sin A, giving sin(2A) = 2 sin A cos A.",
          why: null,
        },
      },
      {
        id: 2, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "sin 2A = 2 sin A cos A.",
        math: "\\sin 2A = 2\\sin A\\cos A",
        note: "Example: sin 90° = 2 sin 45° cos 45° = 2·(√2/2)·(√2/2) = 2·(1/2) = 1 ✓.",
        why: {
          tag: "Where is sin 2A = 2 sin A cos A used in calculus?",
          explanation: "It appears in integrals: ∫sin x cos x dx = (1/2)∫sin 2x dx = −cos(2x)/4 + C. Also in simplifying trig expressions and in physics (e.g., projectile range is proportional to sin 2θ, maximized at 45°).",
          why: null,
        },
      },
    ],
  },

  'double-cos': {
    title: "Double Angle (cos)",
    subtitle: "Why cos 2A = cos²A − sin²A = 1−2sin²A = 2cos²A−1",
    category: "Trigonometry",
    problem: "\\cos 2A = \\cos^2 A - \\sin^2 A = 1-2\\sin^2 A = 2\\cos^2 A-1",
    preamble: "The double angle formula for cosine has three equivalent forms, each useful in different contexts. All three follow from cos(A+A) using the Pythagorean identity.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Apply cos(A+B) with B = A.",
        math: "\\cos(A + A) = \\cos A\\cos A - \\sin A\\sin A = \\cos^2 A - \\sin^2 A",
        note: "This is the first form.",
        why: null,
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Use sin²A = 1 − cos²A to get the second form.",
        math: "\\cos^2 A - \\sin^2 A = \\cos^2 A - (1 - \\cos^2 A) = 2\\cos^2 A - 1",
        note: "Second form: cos 2A = 2cos²A − 1.",
        why: null,
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Use cos²A = 1 − sin²A to get the third form.",
        math: "\\cos^2 A - \\sin^2 A = (1 - \\sin^2 A) - \\sin^2 A = 1 - 2\\sin^2 A",
        note: "Third form: cos 2A = 1 − 2sin²A.",
        why: {
          tag: "Why three forms — when would I use each?",
          explanation: "Form 1 (cos²−sin²): use when you want to reduce a product of squares. Form 2 (2cos²−1): solve for cos²A = (1+cos 2A)/2 — the half-angle formula for cos. Form 3 (1−2sin²): solve for sin²A = (1−cos 2A)/2 — the half-angle formula for sin. In integration, forms 2 and 3 let you replace sin²x or cos²x with expressions involving cos 2x, which is integrable directly.",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "cos 2A = cos²A − sin²A = 2cos²A − 1 = 1 − 2sin²A.",
        math: "\\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A",
        note: "All three are equal by the Pythagorean identity sin²+cos²=1.",
        why: null,
      },
    ],
  },

  'half-sin': {
    title: "Half Angle (sin)",
    subtitle: "Why sin²A = (1 − cos 2A)/2",
    category: "Trigonometry",
    problem: "\\sin^2 A = \\dfrac{1 - \\cos 2A}{2}",
    preamble: "The half-angle formula for sin² is a rearrangement of the double-angle formula cos 2A = 1 − 2sin²A. It's essential for integrating sin²x.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start from the double angle formula: cos 2A = 1 − 2sin²A.",
        math: "\\cos 2A = 1 - 2\\sin^2 A",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Solve for sin²A: rearrange to isolate sin²A.",
        math: "2\\sin^2 A = 1 - \\cos 2A \\;\\Longrightarrow\\; \\sin^2 A = \\frac{1 - \\cos 2A}{2}",
        note: null,
        why: {
          tag: "How is this used to integrate sin²x?",
          explanation: "∫sin²x dx = ∫(1−cos 2x)/2 dx = (1/2)∫(1−cos 2x) dx = (1/2)[x − sin(2x)/2] + C = x/2 − sin(2x)/4 + C. Without this formula, integrating sin²x directly would require integration by parts (more work). The half-angle formula converts sin²x into something with a direct antiderivative.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "sin²A = (1 − cos 2A)/2.",
        math: "\\sin^2 A = \\frac{1 - \\cos 2A}{2}",
        note: "For the definite integral ∫₀^π sin²x dx: = ∫₀^π (1−cos 2x)/2 dx = [x/2 − sin(2x)/4]₀^π = π/2 − 0 = π/2.",
        why: null,
      },
    ],
  },

  'half-cos': {
    title: "Half Angle (cos)",
    subtitle: "Why cos²A = (1 + cos 2A)/2",
    category: "Trigonometry",
    problem: "\\cos^2 A = \\dfrac{1 + \\cos 2A}{2}",
    preamble: "The half-angle formula for cos² is a rearrangement of the double-angle formula cos 2A = 2cos²A − 1.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Start from the double angle formula: cos 2A = 2cos²A − 1.",
        math: "\\cos 2A = 2\\cos^2 A - 1",
        note: null,
        why: null,
      },
      {
        id: 2, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Solve for cos²A.",
        math: "2\\cos^2 A = 1 + \\cos 2A \\;\\Longrightarrow\\; \\cos^2 A = \\frac{1 + \\cos 2A}{2}",
        note: null,
        why: {
          tag: "How do sin²A and cos²A formulas relate?",
          explanation: "Both come from the same double-angle formula; they only differ in sign: sin²A = (1−cos 2A)/2 and cos²A = (1+cos 2A)/2. Note: sin²A + cos²A = (1−cos 2A)/2 + (1+cos 2A)/2 = 2/2 = 1. The Pythagorean identity is automatically satisfied — a good consistency check.",
          why: null,
        },
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "cos²A = (1 + cos 2A)/2.",
        math: "\\cos^2 A = \\frac{1 + \\cos 2A}{2}",
        note: "∫cos²x dx = ∫(1+cos 2x)/2 dx = x/2 + sin(2x)/4 + C.",
        why: null,
      },
    ],
  },

  'polar-conv': {
    title: "Polar Conversion",
    subtitle: "Converting between polar (r, θ) and Cartesian (x, y)",
    category: "Trigonometry",
    problem: "x = r\\cos\\theta,\\quad y = r\\sin\\theta,\\quad r^2 = x^2+y^2",
    preamble: "Polar coordinates describe position using distance from origin (r) and angle from the x-axis (θ). The conversions use the unit circle definition of sin and cos, scaled by r.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "A point P at distance r from the origin, at angle θ. Drop a perpendicular to the x-axis to form a right triangle.",
        math: "\\text{Horizontal leg} = x, \\quad \\text{Vertical leg} = y, \\quad \\text{Hypotenuse} = r",
        note: "The right triangle has hypotenuse r, angle θ at origin.",
        why: {
          tag: "What is the purpose of polar coordinates?",
          explanation: "Cartesian coordinates (x,y) work well for lines and polygons. Polar coordinates (r,θ) work naturally for circles (r=constant), spirals (r=kθ), and anything with circular symmetry. Example: a circle of radius a centered at origin is r=a in polar (trivial), but x²+y²=a² in Cartesian (less obvious). Polar coordinates are essential in physics (angular momentum, orbital mechanics) and calculus (integrating circular regions).",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Apply SOH-CAH-TOA with hypotenuse r.",
        math: "\\cos\\theta = \\frac{x}{r} \\implies x = r\\cos\\theta, \\quad \\sin\\theta = \\frac{y}{r} \\implies y = r\\sin\\theta",
        note: "This is the unit circle definition scaled by r.",
        why: null,
      },
      {
        id: 3, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Apply the Pythagorean theorem to get r² = x² + y².",
        math: "r^2 = x^2 + y^2, \\quad \\theta = \\arctan\\!\\left(\\frac{y}{x}\\right)",
        note: "Full conversion: (x,y) → (r,θ) using r=√(x²+y²) and θ=arctan(y/x) (adjusting quadrant as needed).",
        why: {
          tag: "Why do we need to adjust the quadrant for θ = arctan(y/x)?",
          explanation: "arctan returns values in (−π/2, π/2) — only the first and fourth quadrants. But points can be in any quadrant. Example: (−1, 1) should have θ = 135° (second quadrant), but arctan(1/(−1)) = arctan(−1) = −45°. To get the right quadrant, check the signs of x and y: if x < 0, add 180° (π) to the arctan result. This is why many programming languages have atan2(y, x) — it automatically handles all quadrants.",
          why: null,
        },
      },
    ],
  },

  'euler': {
    title: "Euler's Formula",
    subtitle: "Why e^(iθ) = cos θ + i sin θ",
    category: "Trigonometry",
    problem: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta",
    preamble: "Euler's formula connects the exponential function with trigonometry through the imaginary unit i = √(−1). It's often called the most beautiful equation in mathematics. The proof uses Taylor series.",
    steps: [
      {
        id: 1, tag: "Setup", tagStyle: S.setup,
        instruction: "Recall the Taylor series for eˣ, expanded at x = 0.",
        math: "e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\frac{x^4}{4!} + \\cdots",
        note: "This series converges for all real (and complex) x.",
        why: {
          tag: "What is a Taylor series and why does it work?",
          explanation: "The Taylor series expresses a smooth function as an infinite sum of powers of x. For eˣ: the nth derivative is always eˣ, so evaluated at x=0, all derivatives equal e⁰=1. The Taylor formula gives: eˣ = Σ f⁽ⁿ⁾(0)/n! · xⁿ = Σ 1/n! · xⁿ. The key fact: this infinite sum converges to eˣ for all x — verified by showing the remainder term goes to 0.",
          why: null,
        },
      },
      {
        id: 2, tag: "Key Move", tagStyle: S.key,
        instruction: "Substitute x = iθ and use i² = −1.",
        math: "e^{i\\theta} = 1 + i\\theta + \\frac{(i\\theta)^2}{2!} + \\frac{(i\\theta)^3}{3!} + \\frac{(i\\theta)^4}{4!} + \\cdots",
        note: "Powers of i cycle: i¹=i, i²=−1, i³=−i, i⁴=1, then repeats.",
        why: {
          tag: "What is i = √(−1) and is it 'real'?",
          explanation: "i is the imaginary unit, defined so that i² = −1. No real number squares to give −1, so i extends the real number system. Complex numbers a+bi (where a,b are real) form the complex number system. Despite being called 'imaginary,' complex numbers describe real phenomena: AC circuits, quantum mechanics, fluid dynamics, and signal processing all require complex numbers. They are as mathematically valid as negative numbers (which were once called 'fictitious').",
          why: null,
        },
      },
      {
        id: 3, tag: "Algebra", tagStyle: S.algebra,
        instruction: "Separate real and imaginary parts, using powers of i.",
        math: "e^{i\\theta} = \\left(1 - \\frac{\\theta^2}{2!} + \\frac{\\theta^4}{4!} - \\cdots\\right) + i\\left(\\theta - \\frac{\\theta^3}{3!} + \\frac{\\theta^5}{5!} - \\cdots\\right)",
        note: "Real part (even powers, with alternating signs) and imaginary part (odd powers, with alternating signs).",
        why: {
          tag: "How do the powers of i create this pattern?",
          explanation: "i⁰=1, i¹=i, i²=−1, i³=−i, i⁴=1, repeating. So: (iθ)² = i²θ² = −θ², (iθ)³ = i³θ³ = −iθ³, (iθ)⁴ = i⁴θ⁴ = +θ⁴. Even powers are real (±1), odd powers are imaginary (±i). Grouping: real terms are (1, −θ²/2!, +θ⁴/4!, ...); imaginary terms (with factor i) are (θ, −θ³/3!, +θ⁵/5!, ...).",
          why: null,
        },
      },
      {
        id: 4, tag: "Conclusion", tagStyle: S.conclude,
        instruction: "Recognize the Taylor series for cos θ and sin θ.",
        math: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta \\;\\checkmark",
        note: "The real part IS the Taylor series for cos θ = 1 − θ²/2! + θ⁴/4! − ..., and the imaginary part IS sin θ = θ − θ³/3! + θ⁵/5! − ...",
        why: {
          tag: "What is the most beautiful equation, and why?",
          explanation: "Euler's identity: e^(iπ) + 1 = 0. Set θ=π: e^(iπ) = cos π + i sin π = −1 + i·0 = −1. So e^(iπ) = −1, or e^(iπ) + 1 = 0. This single equation connects the five most important constants in mathematics: e (natural growth), i (imaginary unit), π (circle geometry), 1 (multiplicative identity), 0 (additive identity). Richard Feynman called it 'the most remarkable formula in mathematics.'",
          why: null,
        },
      },
    ],
  },
}
