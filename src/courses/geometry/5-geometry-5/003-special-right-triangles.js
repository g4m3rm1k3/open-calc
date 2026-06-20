export default {
  id: 'geo-5-3',
  slug: 'special-right-triangles',
  chapter: 'geometry-5',
  title: 'Special Right Triangles',
  subtitle: 'The 45-45-90 and 30-60-90 ratios — exact values that unlock all of trigonometry',
  tags: ['geometry', 'special-right-triangles', '45-45-90', '30-60-90', 'exact-values', 'trigonometry'],
  hook: {
    question: 'Why does a square\'s diagonal have length exactly $\\sqrt{2}$ times its side?',
    realWorldContext: 'Carpenters, tile-setters, and engineers constantly work with 45° and 60° angles. The exact values from special right triangles appear in trigonometry tables, electrical engineering (phase angles), and every architectural diagonal. Knowing these two triangles cold lets you skip the calculator for a huge class of problems.',
  },
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Two triangles worth memorizing.** Most right triangles require a calculator for exact side lengths. But two special cases produce side ratios that are clean surds (roots of integers), and they appear so often in mathematics and engineering that having them memorized is genuinely useful.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**The 45-45-90 triangle** comes from cutting a square in half along its diagonal. A square with side length $a$ has a diagonal of $a\\sqrt{2}$ (by Pythagoras: $a^2 + a^2 = 2a^2$, so $d = a\\sqrt{2}$). Since the square\'s angles are 90°, cutting along the diagonal gives two 45-45-90 triangles.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Legs: } a,\\ a \\qquad \\text{Hypotenuse: } a\\sqrt{2}',
        caption: '45-45-90 triangle — isosceles right triangle. Ratio: 1 : 1 : √2',
      },
      {
        type: 'prose',
        paragraphs: [
          'Given any one side, you can find the others:',
          '— If a **leg** is $a$: the other leg is $a$, hypotenuse is $a\\sqrt{2}$.',
          '— If the **hypotenuse** is $h$: each leg is $\\frac{h}{\\sqrt{2}} = \\frac{h\\sqrt{2}}{2}$ (rationalize the denominator).',
          'Common problem: a square has diagonal $10$. Side $= \\frac{10}{\\sqrt{2}} = 5\\sqrt{2}$.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**The 30-60-90 triangle** comes from cutting an equilateral triangle in half with its altitude. An equilateral triangle with side $2a$ has all angles $60°$. The altitude bisects the base (creating two $30-60-90$ right triangles with base $a$, hypotenuse $2a$) and has length $\\sqrt{(2a)^2 - a^2} = \\sqrt{3a^2} = a\\sqrt{3}$.',
        ],
      },
      {
        type: 'math',
        tex: '\\text{Short leg (opp. 30°): } a \\qquad \\text{Long leg (opp. 60°): } a\\sqrt{3} \\qquad \\text{Hypotenuse (opp. 90°): } 2a',
        caption: '30-60-90 triangle — half of an equilateral triangle. Ratio: 1 : √3 : 2',
      },
      {
        type: 'prose',
        paragraphs: [
          'Given any one side, you can find the others:',
          '— If the **short leg** (opposite 30°) is $a$: long leg is $a\\sqrt{3}$, hypotenuse is $2a$.',
          '— If the **long leg** (opposite 60°) is $b$: short leg is $\\frac{b}{\\sqrt{3}} = \\frac{b\\sqrt{3}}{3}$, hypotenuse is $\\frac{2b}{\\sqrt{3}} = \\frac{2b\\sqrt{3}}{3}$.',
          '— If the **hypotenuse** is $h$: short leg is $\\frac{h}{2}$, long leg is $\\frac{h\\sqrt{3}}{2}$.',
          'Common problem: an equilateral triangle has side $12$. Its altitude $= \\frac{12\\sqrt{3}}{2} = 6\\sqrt{3}$.',
        ],
      },
      {
        type: 'viz',
        id: 'G1_6_Pythagorean',
        title: 'Right Triangle Side Relationships',
        mathBridge: 'Set one leg to the other (equal legs) to see the 45-45-90 case: hypotenuse is always the leg times $\\sqrt{2}$. Then set the legs in ratio $1:\\sqrt{3}$ (e.g., 5 and 8.66) to see the 30-60-90 case: hypotenuse is exactly twice the short leg. These ratios lock in as soon as the angles are fixed — changing only the scale.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Why these triangles appear everywhere.** The exact values from these two triangles are the sine and cosine of the four most common angles in trigonometry:',
        ],
      },
      {
        type: 'math',
        tex: '\\sin 30°=\\tfrac{1}{2},\\; \\cos 30°=\\tfrac{\\sqrt{3}}{2} \\qquad \\sin 45°=\\tfrac{\\sqrt{2}}{2},\\; \\cos 45°=\\tfrac{\\sqrt{2}}{2} \\qquad \\sin 60°=\\tfrac{\\sqrt{3}}{2},\\; \\cos 60°=\\tfrac{1}{2}',
        caption: 'These six values come directly from the two special right triangles — no calculator needed',
      },
      {
        type: 'prose',
        paragraphs: [
          'Every trigonometry "special angle" value you will encounter is derived from one of these two triangles. The unit circle is just these triangles inscribed in a circle of radius 1.',
        ],
      },
    ],
  },
  mentalModel: [
    '45-45-90: legs a, a; hypotenuse a√2. From a square cut along its diagonal.',
    '30-60-90: short leg a, long leg a√3, hypotenuse 2a. From an equilateral triangle cut in half.',
    'Given any one side, you can find all three — multiply or divide by √2 (45-45-90) or use ×2 and ×√3 (30-60-90)',
    'The six trig values at 30°, 45°, 60° come directly from these triangles — they are the same numbers',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A 45-45-90 triangle has a leg of $9$. What is its hypotenuse?',
      options: ['$9\\sqrt{3}$', '$9\\sqrt{2}$', '$18$'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A 45-45-90 triangle has a hypotenuse of $8\\sqrt{2}$. What is each leg?',
      options: ['$4\\sqrt{2}$', '$8$', '$4$'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A square has side length $6$. What is the length of its diagonal?',
      options: ['$6\\sqrt{3}$', '$6\\sqrt{2}$', '$12$'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 30-60-90 triangle has a short leg (opposite 30°) of $7$. Its hypotenuse is…',
      options: ['$7\\sqrt{3}$', '$14$', '$7\\sqrt{2}$'],
      correct: 1,
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A 30-60-90 triangle has a hypotenuse of $20$. Its long leg (opposite 60°) is…',
      options: ['$10\\sqrt{3}$', '$10$', '$20\\sqrt{3}$'],
      correct: 0,
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'The 30-60-90 triangle is derived by cutting which shape in half?',
      options: ['A right isosceles triangle', 'An equilateral triangle', 'A rectangle'],
      correct: 1,
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'An equilateral triangle has side $16$. What is its altitude?',
      options: ['$8\\sqrt{3}$', '$8\\sqrt{2}$', '$8$'],
      correct: 0,
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'Which trig value equals $\\frac{\\sqrt{3}}{2}$?',
      options: ['$\\sin 45°$', '$\\cos 30°$ (and $\\sin 60°$)', '$\\cos 45°$'],
      correct: 1,
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'A 30-60-90 triangle has a long leg of $6\\sqrt{3}$. What is its short leg?',
      options: ['$6$', '$3\\sqrt{3}$', '$12$'],
      correct: 0,
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'Why are these called "special" right triangles?',
      options: [
        'They are the only right triangles that exist',
        'Their side ratios are exact surds that appear in trigonometry — every other right triangle requires a calculator',
        'They are only used in advanced mathematics',
      ],
      correct: 1,
    },
  ],
};
