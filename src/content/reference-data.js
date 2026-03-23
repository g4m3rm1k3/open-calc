// Reference sheet data: laws, identities, theorems
// Each entry: { id, name, latex, note? }

export const REFERENCE_CATEGORIES = [
  {
    id: 'algebra',
    label: 'Algebra',
    color: 'blue',
    entries: [
      { id: 'exp-product',   name: 'Product of Powers',      latex: 'a^m \\cdot a^n = a^{m+n}' },
      { id: 'exp-quotient',  name: 'Quotient of Powers',     latex: '\\dfrac{a^m}{a^n} = a^{m-n}' },
      { id: 'exp-power',     name: 'Power of a Power',       latex: '(a^m)^n = a^{mn}' },
      { id: 'exp-zero',      name: 'Zero Exponent',          latex: 'a^0 = 1 \\quad (a \\neq 0)' },
      { id: 'exp-neg',       name: 'Negative Exponent',      latex: 'a^{-n} = \\dfrac{1}{a^n}' },
      { id: 'exp-frac',      name: 'Fractional Exponent',    latex: 'a^{m/n} = \\sqrt[n]{a^m}' },
      { id: 'quadratic',     name: 'Quadratic Formula',      latex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', note: 'Roots of ax² + bx + c = 0' },
      { id: 'diff-squares',  name: 'Difference of Squares',  latex: 'a^2 - b^2 = (a+b)(a-b)' },
      { id: 'sum-cubes',     name: 'Sum of Cubes',           latex: 'a^3 + b^3 = (a+b)(a^2-ab+b^2)' },
      { id: 'diff-cubes',    name: 'Difference of Cubes',    latex: 'a^3 - b^3 = (a-b)(a^2+ab+b^2)' },
      { id: 'binomial',      name: 'Binomial Theorem',       latex: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k' },
      { id: 'log-product',   name: 'Log Product Rule',       latex: '\\log_b(xy) = \\log_b x + \\log_b y' },
      { id: 'log-quotient',  name: 'Log Quotient Rule',      latex: '\\log_b\\!\\left(\\tfrac{x}{y}\\right) = \\log_b x - \\log_b y' },
      { id: 'log-power',     name: 'Log Power Rule',         latex: '\\log_b(x^n) = n\\log_b x' },
      { id: 'log-change',    name: 'Change of Base',         latex: '\\log_b x = \\dfrac{\\ln x}{\\ln b}' },
    ],
  },

  {
    id: 'geometry',
    label: 'Geometry',
    color: 'green',
    entries: [
      { id: 'pythagorean',   name: 'Pythagorean Theorem',    latex: 'a^2 + b^2 = c^2' },
      { id: 'circle-eq',     name: 'Circle Equation',        latex: '(x-h)^2 + (y-k)^2 = r^2', note: 'Center (h, k), radius r' },
      { id: 'distance',      name: 'Distance Formula',       latex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}' },
      { id: 'midpoint',      name: 'Midpoint Formula',       latex: 'M = \\left(\\frac{x_1+x_2}{2},\\, \\frac{y_1+y_2}{2}\\right)' },
      { id: 'circle-area',   name: 'Circle Area',            latex: 'A = \\pi r^2' },
      { id: 'circle-circ',   name: 'Circumference',          latex: 'C = 2\\pi r' },
      { id: 'sphere-vol',    name: 'Sphere Volume',          latex: 'V = \\tfrac{4}{3}\\pi r^3' },
      { id: 'sphere-area',   name: 'Sphere Surface Area',    latex: 'A = 4\\pi r^2' },
      { id: 'cone-vol',      name: 'Cone Volume',            latex: 'V = \\tfrac{1}{3}\\pi r^2 h' },
    ],
  },

  {
    id: 'trig',
    label: 'Trigonometry',
    color: 'purple',
    entries: [
      { id: 'sohcahtoa',     name: 'SOH-CAH-TOA',           latex: '\\sin\\theta = \\tfrac{\\text{opp}}{\\text{hyp}},\\quad \\cos\\theta = \\tfrac{\\text{adj}}{\\text{hyp}},\\quad \\tan\\theta = \\tfrac{\\text{opp}}{\\text{adj}}' },
      { id: 'pyth-id',       name: 'Pythagorean Identity',   latex: '\\sin^2\\theta + \\cos^2\\theta = 1' },
      { id: 'pyth-id-2',     name: 'Pythagorean (tan)',      latex: '1 + \\tan^2\\theta = \\sec^2\\theta' },
      { id: 'pyth-id-3',     name: 'Pythagorean (cot)',      latex: '1 + \\cot^2\\theta = \\csc^2\\theta' },
      { id: 'angle-add-sin', name: 'Sine Addition',          latex: '\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B' },
      { id: 'angle-add-cos', name: 'Cosine Addition',        latex: '\\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B' },
      { id: 'double-sin',    name: 'Double Angle (sin)',     latex: '\\sin 2A = 2\\sin A\\cos A' },
      { id: 'double-cos',    name: 'Double Angle (cos)',     latex: '\\cos 2A = \\cos^2 A - \\sin^2 A = 1-2\\sin^2 A = 2\\cos^2 A-1' },
      { id: 'half-sin',      name: 'Half Angle (sin)',       latex: '\\sin^2 A = \\dfrac{1 - \\cos 2A}{2}' },
      { id: 'half-cos',      name: 'Half Angle (cos)',       latex: '\\cos^2 A = \\dfrac{1 + \\cos 2A}{2}' },
      { id: 'polar-conv',    name: 'Polar Conversion',       latex: 'x = r\\cos\\theta,\\quad y = r\\sin\\theta,\\quad r^2 = x^2+y^2' },
      { id: 'euler',         name: "Euler's Formula",        latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta' },
    ],
  },

  {
    id: 'limits',
    label: 'Limits',
    color: 'cyan',
    entries: [
      { id: 'limit-def',     name: 'Limit Definition',       latex: '\\lim_{x\\to a} f(x) = L \\iff \\forall\\varepsilon>0\\;\\exists\\delta>0: 0<|x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon' },
      { id: 'limit-sum',     name: 'Sum Law',                latex: '\\lim[f+g] = \\lim f + \\lim g' },
      { id: 'limit-prod',    name: 'Product Law',            latex: '\\lim[f\\cdot g] = \\lim f \\cdot \\lim g' },
      { id: 'limit-quot',    name: 'Quotient Law',           latex: '\\lim\\dfrac{f}{g} = \\dfrac{\\lim f}{\\lim g} \\quad (\\lim g \\neq 0)' },
      { id: 'squeeze',       name: 'Squeeze Theorem',        latex: 'g(x)\\le f(x)\\le h(x) \\text{ and } \\lim g = \\lim h = L \\Rightarrow \\lim f = L' },
      { id: 'lhopital',      name: "L'Hôpital's Rule",       latex: '\\lim\\dfrac{f}{g} = \\lim\\dfrac{f\'}{g\'} \\quad\\text{when } \\tfrac{0}{0} \\text{ or } \\tfrac{\\infty}{\\infty}' },
      { id: 'sinc',          name: 'Sinc Limit',             latex: '\\lim_{h\\to 0}\\dfrac{\\sin h}{h} = 1' },
      { id: 'e-limit',       name: 'Definition of e',        latex: '\\lim_{n\\to\\infty}\\left(1+\\dfrac{1}{n}\\right)^n = e' },
    ],
  },

  {
    id: 'derivatives',
    label: 'Derivatives',
    color: 'orange',
    entries: [
      { id: 'deriv-def',     name: 'Definition',             latex: "f'(x) = \\lim_{h\\to 0}\\dfrac{f(x+h)-f(x)}{h}" },
      { id: 'power-rule',    name: 'Power Rule',             latex: '\\dfrac{d}{dx}[x^n] = nx^{n-1}' },
      { id: 'const-rule',    name: 'Constant Rule',          latex: '\\dfrac{d}{dx}[c] = 0' },
      { id: 'sum-rule',      name: 'Sum / Difference Rule',  latex: '\\dfrac{d}{dx}[f \\pm g] = f\' \\pm g\'' },
      { id: 'product-rule',  name: 'Product Rule',           latex: '\\dfrac{d}{dx}[fg] = f\'g + fg\'' },
      { id: 'quotient-rule', name: 'Quotient Rule',          latex: '\\dfrac{d}{dx}\\!\\left[\\dfrac{f}{g}\\right] = \\dfrac{f\'g - fg\'}{g^2}' },
      { id: 'chain-rule',    name: 'Chain Rule',             latex: '\\dfrac{d}{dx}[f(g(x))] = f\'(g(x))\\cdot g\'(x)' },
      { id: 'd-sin',         name: 'd/dx sin x',             latex: '\\dfrac{d}{dx}[\\sin x] = \\cos x' },
      { id: 'd-cos',         name: 'd/dx cos x',             latex: '\\dfrac{d}{dx}[\\cos x] = -\\sin x' },
      { id: 'd-tan',         name: 'd/dx tan x',             latex: '\\dfrac{d}{dx}[\\tan x] = \\sec^2 x' },
      { id: 'd-sec',         name: 'd/dx sec x',             latex: '\\dfrac{d}{dx}[\\sec x] = \\sec x\\tan x' },
      { id: 'd-ex',          name: 'd/dx eˣ',                latex: '\\dfrac{d}{dx}[e^x] = e^x' },
      { id: 'd-ax',          name: 'd/dx aˣ',                latex: '\\dfrac{d}{dx}[a^x] = a^x\\ln a' },
      { id: 'd-ln',          name: 'd/dx ln x',              latex: '\\dfrac{d}{dx}[\\ln x] = \\dfrac{1}{x}' },
      { id: 'd-arcsin',      name: 'd/dx arcsin x',          latex: '\\dfrac{d}{dx}[\\arcsin x] = \\dfrac{1}{\\sqrt{1-x^2}}' },
      { id: 'd-arctan',      name: 'd/dx arctan x',          latex: '\\dfrac{d}{dx}[\\arctan x] = \\dfrac{1}{1+x^2}' },
      { id: 'implicit',      name: 'Implicit Differentiation', latex: 'x^2+y^2=r^2 \\;\\Rightarrow\\; 2x+2y\\,\\dfrac{dy}{dx}=0 \\;\\Rightarrow\\; \\dfrac{dy}{dx}=-\\dfrac{x}{y}', note: 'Differentiate both sides; tag every y-term with dy/dx' },
    ],
  },

  {
    id: 'integrals',
    label: 'Integrals',
    color: 'emerald',
    entries: [
      { id: 'ftc-1',         name: 'FTC Part 1',             latex: '\\dfrac{d}{dx}\\int_a^x f(t)\\,dt = f(x)' },
      { id: 'ftc-2',         name: 'FTC Part 2',             latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)' },
      { id: 'int-power',     name: 'Power Rule',             latex: '\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C \\quad (n\\neq -1)' },
      { id: 'int-1x',        name: '∫ 1/x',                  latex: '\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C' },
      { id: 'int-ex',        name: '∫ eˣ',                   latex: '\\int e^x\\,dx = e^x + C' },
      { id: 'int-sin',       name: '∫ sin x',                latex: '\\int \\sin x\\,dx = -\\cos x + C' },
      { id: 'int-cos',       name: '∫ cos x',                latex: '\\int \\cos x\\,dx = \\sin x + C' },
      { id: 'int-sec2',      name: '∫ sec²x',                latex: '\\int \\sec^2 x\\,dx = \\tan x + C' },
      { id: 'u-sub',         name: 'U-Substitution',         latex: '\\int f(g(x))g\'(x)\\,dx = \\int f(u)\\,du,\\quad u=g(x)' },
      { id: 'by-parts',      name: 'Integration by Parts',   latex: '\\int u\\,dv = uv - \\int v\\,du' },
      { id: 'int-linearity', name: 'Linearity',              latex: '\\int [af(x) \\pm bg(x)]\\,dx = a\\int f\\,dx \\pm b\\int g\\,dx' },
    ],
  },

  {
    id: 'series',
    label: 'Series',
    color: 'rose',
    entries: [
      { id: 'geo-series',    name: 'Geometric Series',       latex: '\\sum_{n=0}^{\\infty} ar^n = \\dfrac{a}{1-r} \\quad (|r|<1)' },
      { id: 'p-series',      name: 'p-Series',               latex: '\\sum_{n=1}^{\\infty} \\dfrac{1}{n^p} \\text{ converges iff } p > 1' },
      { id: 'taylor',        name: 'Taylor Series',          latex: 'f(x) = \\sum_{n=0}^{\\infty}\\dfrac{f^{(n)}(a)}{n!}(x-a)^n' },
      { id: 'maclaurin-ex',  name: 'Maclaurin: eˣ',          latex: 'e^x = \\sum_{n=0}^{\\infty}\\dfrac{x^n}{n!} = 1+x+\\dfrac{x^2}{2!}+\\cdots' },
      { id: 'maclaurin-sin', name: 'Maclaurin: sin x',       latex: '\\sin x = x - \\dfrac{x^3}{3!} + \\dfrac{x^5}{5!} - \\cdots' },
      { id: 'maclaurin-cos', name: 'Maclaurin: cos x',       latex: '\\cos x = 1 - \\dfrac{x^2}{2!} + \\dfrac{x^4}{4!} - \\cdots' },
      { id: 'ratio-test',    name: 'Ratio Test',             latex: 'L = \\lim_{n\\to\\infty}\\left|\\dfrac{a_{n+1}}{a_n}\\right|: \\; L<1 \\Rightarrow \\text{conv.},\\; L>1 \\Rightarrow \\text{div.}' },
    ],
  },
]

export const ALL_ENTRIES = REFERENCE_CATEGORIES.flatMap(cat =>
  cat.entries.map(e => ({ ...e, category: cat.id, categoryLabel: cat.label, color: cat.color }))
)
