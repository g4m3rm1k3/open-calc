export default {
  id: 'ch3-trig-006',
  slug: 'solving-triangles',
  chapter: 'precalc-3',
  order: 5,
  title: 'Solving Triangles: Law of Sines, Law of Cosines, and the Ambiguous Case',
  subtitle: 'Every triangle can be solved — if you know which law to use and when',
  tags: ['law of sines', 'law of cosines', 'solving triangles', 'SSA', 'ambiguous case', 'AAS', 'ASA', 'SAS', 'SSS', 'oblique triangles'],
  aliases: 'law sines cosines SSA ambiguous case oblique triangle solve AAS ASA SAS SSS right triangle solving',

  hook: {
    question: "Given two sides of a triangle and an angle not between them (SSA), you might expect one answer. But you can get zero, one, or two valid triangles from the same information. Why — and how do you tell which case you're in?",
    realWorldContext: "Surveyors use the Law of Sines to compute distances they cannot measure directly. GPS systems use the Law of Cosines to compute positions from three known signal distances (trilateration). Ship navigation uses triangle solving to determine position from bearings. The ambiguous SSA case is not a mathematical curiosity — it appears whenever you're given a bearing and two distances but don't know which side the target is on.",
    previewVisualizationId: 'LawOfSinesViz',
  },

  intuition: {
    prose: [
      'Right triangle trig (SOH-CAH-TOA) only works when there is a right angle. For oblique triangles (no right angle), two laws extend the power of trig: the Law of Sines and the Law of Cosines.',
      'The Law of Sines says: in any triangle, the ratio of a side to the sine of its opposite angle is constant. $a/\\sin A = b/\\sin B = c/\\sin C$. This ratio is actually the diameter of the circumscribed circle. Use it when you know two angles and one side (AAS or ASA), or two sides and a non-included angle (SSA — but beware the ambiguous case).',
      'The Law of Cosines generalises the Pythagorean theorem to non-right triangles. $c^2 = a^2 + b^2 - 2ab\\cos C$. When $C = 90°$, $\\cos C = 0$ and it reduces to $a^2 + b^2 = c^2$ exactly. Use it when you know two sides and the included angle (SAS), or all three sides (SSS).',
    ],
    callouts: [
      {
        type: 'proof-map',
        title: 'Which law to use — decision tree',
        body: '\\text{Know two angles + any side (AAS/ASA)} \\to \\text{Law of Sines} \\\\ \\text{Know two sides + included angle (SAS)} \\to \\text{Law of Cosines} \\\\ \\text{Know all three sides (SSS)} \\to \\text{Law of Cosines} \\\\ \\text{Know two sides + non-included angle (SSA)} \\to \\text{Law of Sines + check ambiguous case}',
      },
      {
        type: 'theorem',
        title: 'Law of Sines',
        body: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R \\\\ \\text{where } R \\text{ is the circumradius (radius of circumscribed circle)}',
      },
      {
        type: 'theorem',
        title: 'Law of Cosines — three equivalent forms',
        body: 'a^2 = b^2 + c^2 - 2bc\\cos A \\\\ b^2 = a^2 + c^2 - 2ac\\cos B \\\\ c^2 = a^2 + b^2 - 2ab\\cos C',
      },
    ],
    visualizations: [
      {
        id: 'LawOfSinesViz',
        title: 'Law of Sines — Drag the Triangle',
        mathBridge: 'Drag any vertex. All three ratios $a/\\sin A$, $b/\\sin B$, $c/\\sin C$ update and stay equal. Watch how they all equal $2R$.',
        caption: 'The constant ratio is the diameter of the circumscribed circle — true for every triangle.',
      },
      { id: 'VideoEmbed', title: 'TR-26: Solving Right Triangles', props: { url: "" } },
      { id: 'VideoEmbed', title: 'TR-27: Triangle Types to Solve', props: { url: "" } },
      { id: 'VideoCarousel', title: 'The Law of Sines', props: { videos: [
          { url: "", title: 'TR-28 — Dennis F. Davis' },
          { url: "", title: 'Oblique Triangles — Kim' },
        ]},
      },
      { id: 'VideoCarousel', title: 'The Law of Cosines', props: { videos: [
          { url: "", title: 'TR-29 — Dennis F. Davis' },
          { url: "", title: 'TR-29Z — Proof of Law of Cosines' },
          { url: "", title: 'Law of Cosines — Kim' },
        ]},
      },
      { id: 'VideoEmbed', title: 'TR-30: SSA Triangles Overview', props: { url: "" } },
      { id: 'VideoEmbed', title: 'TR-31: Solving SSA Triangles', props: { url: "" } },
      { id: 'VideoEmbed', title: 'Solving Trigonometric Equations (5 Examples)', props: { url: "" } },
    ],
  },

  math: {
    prose: [
      'The ambiguous case (SSA) arises because the sine function is not one-to-one: $\\sin\\theta = \\sin(180°-\\theta)$. If you compute $\\sin B$ from the Law of Sines and get a value in $(0,1)$, there are two angles in $[0°, 180°]$ with that sine value — $B$ and $180°-B$. Both might produce a valid triangle, only one might, or neither might (if the computed sine exceeds 1).',
      'The ambiguous case conditions: given sides $a$, $b$ and angle $A$ (opposite to $a$): if $A$ is obtuse, there is either 0 or 1 triangle. If $A$ is acute, compare $a$ to the height $h = b\\sin A$: if $a < h$ there are 0 triangles, if $a = h$ there is exactly 1 (right triangle), if $h < a < b$ there are 2 triangles, if $a \\geq b$ there is 1 triangle.',
      "The area of any triangle can be computed from two sides and the included angle: $\\text{Area} = \\frac{1}{2}ab\\sin C$. This is because the height of the triangle with base $a$ is $b\\sin C$. Combined with Heron's formula for SSS triangles, you can always find the area once the triangle is solved.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'SSA ambiguous case — four outcomes',
        body: '\\text{Given } a, b, A \\text{ with } A \\text{ acute, } h = b\\sin A: \\\\ a < h: \\text{ NO triangle (side too short to reach)} \\\\ a = h: \\text{ ONE right triangle} \\\\ h < a < b: \\text{ TWO triangles} \\\\ a \\geq b: \\text{ ONE triangle}',
      },
      {
        type: 'theorem',
        title: 'Triangle area formulas',
        body: "\\text{Area} = \\tfrac{1}{2}bh = \\tfrac{1}{2}ab\\sin C \\\\ \\text{Heron's: } A = \\sqrt{s(s-a)(s-b)(s-c)}, \\; s = \\tfrac{a+b+c}{2}",
      },
      {
        type: 'warning',
        title: 'Law of Cosines for finding angles — use the rearranged form',
        body: '\\cos C = \\frac{a^2 + b^2 - c^2}{2ab} \\\\ \\text{Always compute the largest angle first (opposite the longest side).} \\\\ \\text{If } \\cos C < 0 \\text{, then } C \\text{ is obtuse — the other angles must both be acute.}',
      },
    ],
    visualizations: [
      {
        id: 'SSAAmbiguousViz',
        title: 'The Ambiguous Case — Watch the Triangle Count Change',
        mathBridge: 'Drag side $a$ shorter and longer. See it swing through 0, 1, and 2 valid triangles. The height $h = b\\sin A$ is the critical threshold.',
        caption: 'The same two sides and angle can produce 0, 1, or 2 triangles depending on the relative lengths.',
      },
    ],
  },

  rigor: {
    title: 'Proof of the Law of Cosines',
    visualizationId: 'LawOfSinesViz',
    proofSteps: [
      {
        expression: '\\text{Place triangle with } C \\text{ at origin, } B \\text{ at } (a, 0), \\text{ and } A \\text{ at } (b\\cos C, b\\sin C).',
        annotation: 'Coordinate setup: side $a = BC$, side $b = CA$, and angle $C$ at the origin.',
      },
      {
        expression: 'c^2 = |AB|^2 = (b\\cos C - a)^2 + (b\\sin C - 0)^2',
        annotation: 'Apply the distance formula to find side $c = AB$.',
      },
      {
        expression: '= b^2\\cos^2 C - 2ab\\cos C + a^2 + b^2\\sin^2 C',
        annotation: 'Expand both squares.',
      },
      {
        expression: '= b^2(\\cos^2 C + \\sin^2 C) + a^2 - 2ab\\cos C',
        annotation: 'Group the $b^2$ terms.',
      },
      {
        expression: 'c^2 = a^2 + b^2 - 2ab\\cos C \\qquad \\blacksquare',
        annotation: 'Pythagorean identity $\\cos^2+\\sin^2=1$ collapses the brackets. When $C=90°$, $\\cos C=0$ and we recover the Pythagorean theorem — Law of Cosines is a direct generalisation.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-trig-006-ex1',
      title: 'AAS triangle — Law of Sines',
      problem: '\\text{In } \\triangle ABC: A=35°, B=82°, a=9. \\text{ Find } b \\text{ and } c.',
      steps: [
        {
          expression: 'C = 180° - 35° - 82° = 63°',
          annotation: 'Find the third angle using the triangle angle sum.',
        },
        {
          expression: '\\frac{b}{\\sin 82°} = \\frac{9}{\\sin 35°} \\Rightarrow b = \\frac{9\\sin 82°}{\\sin 35°} \\approx \\frac{9(0.9903)}{0.5736} \\approx 15.53',
          annotation: 'Law of Sines: set up the ratio using the known side-angle pair $(a, A)$.',
        },
        {
          expression: 'c = \\frac{9\\sin 63°}{\\sin 35°} \\approx \\frac{9(0.8910)}{0.5736} \\approx 13.98',
          annotation: 'Same ratio, solve for $c$.',
        },
      ],
      conclusion: 'AAS: find the third angle first, then use Law of Sines twice. Always use the most accurate known pair $(a, A)$ as your reference ratio.',
    },
    {
      id: 'ch3-trig-006-ex2',
      title: 'SAS triangle — Law of Cosines',
      problem: '\\text{In } \\triangle ABC: a=7, b=10, C=52°. \\text{ Find } c, \\text{ then complete the triangle.}',
      steps: [
        {
          expression: 'c^2 = 7^2 + 10^2 - 2(7)(10)\\cos 52° = 49 + 100 - 140(0.6157) \\approx 149 - 86.2 = 62.8',
          annotation: 'Law of Cosines: the included angle C is opposite the unknown side c.',
        },
        {
          expression: 'c \\approx \\sqrt{62.8} \\approx 7.92',
          annotation: 'Take the square root.',
        },
        {
          expression: '\\sin A = \\frac{a\\sin C}{c} = \\frac{7\\sin 52°}{7.92} \\approx \\frac{7(0.7880)}{7.92} \\approx 0.696 \\Rightarrow A \\approx 44.0°',
          annotation: 'Now use Law of Sines for angle A. Since $a < c$, angle $A < C$ — no ambiguous case here.',
        },
        {
          expression: 'B = 180° - 52° - 44° = 84°',
          annotation: 'Third angle by subtraction.',
        },
      ],
      conclusion: 'SAS: Law of Cosines gives the unknown side, then switch to Law of Sines for angles. Find the smaller angle first to avoid the ambiguous case.',
    },
    {
      id: 'ch3-trig-006-ex3',
      title: 'SSA — the ambiguous case',
      problem: '\\text{In } \\triangle ABC: a=8, b=11, A=35°. \\text{ How many triangles exist? Solve all cases.}',
      steps: [
        {
          expression: 'h = b\\sin A = 11\\sin 35° \\approx 11(0.5736) \\approx 6.31',
          annotation: 'Compute the critical height.',
        },
        {
          expression: 'h \\approx 6.31 < a = 8 < b = 11 \\Rightarrow \\text{TWO triangles}',
          annotation: 'Check: $h < a < b$ — the side $a$ is long enough to reach but short enough that it swings to two positions.',
        },
        {
          expression: '\\sin B = \\frac{b\\sin A}{a} = \\frac{11\\sin 35°}{8} \\approx 0.7888 \\Rightarrow B_1 \\approx 52.0° \\text{ or } B_2 = 180°-52° = 128.0°',
          annotation: 'Two possible angles for $B$. Both are valid since both give a positive angle sum with $A=35°$.',
        },
        {
          expression: '\\text{Case 1: } B_1=52°, C_1=93°, c_1 = \\frac{8\\sin 93°}{\\sin 35°} \\approx 13.9',
          annotation: 'First triangle: $A+B_1+C_1 = 35+52+93 = 180°$ ✓',
        },
        {
          expression: '\\text{Case 2: } B_2=128°, C_2=17°, c_2 = \\frac{8\\sin 17°}{\\sin 35°} \\approx 4.1',
          annotation: 'Second triangle: $A+B_2+C_2 = 35+128+17 = 180°$ ✓',
        },
      ],
      conclusion: 'SSA with two triangles: solve for both possible angles B, check that each gives a positive C, then complete each triangle separately. Both answers are valid.',
    },
  ],

  challenges: [
    {
      id: 'ch3-trig-006-ch1',
      difficulty: 'medium',
      problem: '\\text{From a point } P \\text{, the angles of elevation to the top of two towers are } 38° \\text{ and } 54°. \\text{ The towers are 80 m apart and } P \\text{ is between them. Find the tower heights.}',
      hint: 'Each tower with point P forms a right triangle. You have one side (distance from P to each base) and the elevation angle.',
      walkthrough: [
        {
          expression: '\\text{Let } d_1 = \\text{distance to tower 1}, d_2 = \\text{distance to tower 2. Then } d_1 + d_2 = 80.',
          annotation: 'Set up: P is between the towers.',
        },
        {
          expression: 'h_1 = d_1\\tan 38°, \\quad h_2 = d_2\\tan 54°',
          annotation: 'Right triangle trig for each tower.',
        },
        {
          expression: '\\text{Need more info (or this is a two-equation system if the towers are equal height). As stated, we get a family of solutions.}',
          annotation: 'Without knowing one distance, the problem is underdetermined. In practice, a third measurement or equal tower assumption is needed — a good lesson in real-world problem setup.',
        },
      ],
      answer: '\\text{Problem requires additional constraint. With } d_1+d_2=80: \\; h_1 = d_1\\tan 38°, \\; h_2=(80-d_1)\\tan 54°.',
    },
    {
      id: 'ch3-trig-006-ch2',
      difficulty: 'hard',
      problem: '\\text{Prove the Law of Sines using the formula Area} = \\frac{1}{2}ab\\sin C.',
      hint: 'Express the area three different ways using three different angle-side pairs. Set them equal.',
      walkthrough: [
        {
          expression: '\\text{Area} = \\tfrac{1}{2}bc\\sin A = \\tfrac{1}{2}ac\\sin B = \\tfrac{1}{2}ab\\sin C',
          annotation: 'The area of a triangle equals $\\frac{1}{2} \\times \\text{two sides} \\times \\sin(\\text{included angle})$ — three equivalent expressions.',
        },
        {
          expression: '\\frac{1}{2}bc\\sin A = \\frac{1}{2}ac\\sin B \\Rightarrow \\frac{\\sin A}{a} = \\frac{\\sin B}{b}',
          annotation: 'Set first two equal, divide both sides by $\\frac{1}{2}abc$.',
        },
        {
          expression: '\\frac{\\sin A}{a} = \\frac{\\sin B}{b} = \\frac{\\sin C}{c} \\qquad \\blacksquare',
          annotation: 'Same argument with the second and third. The Law of Sines follows from the area formula — a clean, elegant proof.',
        },
      ],
      answer: '\\dfrac{\\sin A}{a} = \\dfrac{\\sin B}{b} = \\dfrac{\\sin C}{c}',
    },
  ],

  calcBridge: {
    teaser: 'The area formula $\\frac{1}{2}ab\\sin C$ appears in multivariable calculus as the magnitude of the cross product: $|\\mathbf{u} \\times \\mathbf{v}| = |\\mathbf{u}||\\mathbf{v}|\\sin\\theta$. The Law of Cosines is the algebraic form of the dot product distance formula. Both laws resurface as coordinate-free tools in vector calculus.',
    linkedLessons: ['trig-ratios-right-triangles', 'trig-identities-deep-dive'],
  },
}
