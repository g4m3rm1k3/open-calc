export const lesson = {
  id: 'sicp-2-5',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.3.1–2.3.2  Symbolic Data and Differentiation',
  checkpoints: [
    { id: 'cp-symbolic-expressions', label: 'Symbolic Expressions' },
    { id: 'cp-interface',            label: 'The Interface' },
    { id: 'cp-deriv',                label: 'Differentiation' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'Every computation so far has been numerical. square(5) evaluates and returns 25 — the arithmetic is done. But consider what Wolfram Alpha does when you type "differentiate x² + 3x": it does NOT evaluate x² + 3x. It manipulates the expression symbolically — treating it as a tree structure, applying differentiation rules, and returning the new expression 2x + 3.\n\nThis lesson builds exactly that system. The key insight: an algebraic expression is DATA — a tree structure you can walk and transform. The derivative rules are CODE that walks the tree and produces a new tree. This is code as data.',
      code: null,
    },

    // ── What a symbolic expression looks like ────────────────────────────────

    {
      type: 'narration',
      id: 'expression-tree-vocab',
      text: 'An algebraic expression has a natural tree structure:\n\n  x + 2  is a tree with root "+" and children ["x", 2]\n  x * x  is a tree with root "*" and children ["x", "x"]\n  x² + 3 is a tree with root "+", left child is the "*" tree, right child is 3\n\nIn SICP, this tree is represented using lists. Each compound expression is a list whose first element is the operator. Atoms (numbers and variable names) are leaves. We represent variable names as JavaScript strings so they are distinct from numbers.',
      code: null,
    },
    {
      type: 'narration',
      id: 'list-primitives',
      text: 'The pair/list infrastructure we built in Chapter 2.2.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_pair(e) { return Array.isArray(e); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }`,
    },
    {
      type: 'narration',
      id: 'expression-representation',
      text: 'Represent algebraic expressions as lists. Run this to see how they look as data structures.',
      code: `function pair(x, y) { return [x, y]; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

const x_plus_2    = list('+', 'x', 2);           // x + 2
const x_times_x   = list('*', 'x', 'x');         // x * x
const x_sq_plus_3 = list('+', list('*','x','x'), 3); // x² + 3

console.log(JSON.stringify(x_plus_2));
console.log(JSON.stringify(x_times_x));
console.log(JSON.stringify(x_sq_plus_3));`,
    },

    // ── The interface: predicates and selectors ───────────────────────────────

    {
      type: 'narration',
      id: 'wishful-thinking-here',
      text: 'Before writing the differentiator, define the interface — the predicates and selectors that hide the list representation. The differentiator will use only these names and never touch pair/head/tail directly. This is the same wishful thinking technique from Chapter 2.1.',
      code: null,
    },
    {
      type: 'narration',
      id: 'predicates',
      text: 'The predicates identify what kind of expression we have.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_pair(e) { return Array.isArray(e); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function is_number(e)   { return typeof e === 'number'; }
function is_variable(e) { return typeof e === 'string'; }
function is_sum(e)      { return is_pair(e) && head(e) === '+'; }
function is_product(e)  { return is_pair(e) && head(e) === '*'; }

console.log(is_number(5));                     // true
console.log(is_variable('x'));                 // true
console.log(is_sum(list('+', 'x', 2)));       // true
console.log(is_product(list('*', 'x', 'y'))); // true`,
    },
    {
      type: 'narration',
      id: 'selectors',
      text: 'The selectors extract components. For list("+", u, v), addend returns u (second element) and augend returns v (third element).',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function addend(e)       { return head(tail(e)); }          // 2nd element
function augend(e)       { return head(tail(tail(e))); }    // 3rd element
function multiplier(e)   { return head(tail(e)); }
function multiplicand(e) { return head(tail(tail(e))); }

const sum = list('+', 'x', 2);
console.log(addend(sum));   // x  — the left operand
console.log(augend(sum));   // 2  — the right operand`,
    },
    { type: 'checkpoint', id: 'cp-symbolic-expressions' },

    // ── Constructors with simplification ─────────────────────────────────────

    {
      type: 'narration',
      id: 'constructors-vocab',
      text: 'The derivative rules produce new expressions. We need constructors make_sum and make_product. But naive constructors produce verbose output: differentiating x gives list("+", 1, 0) rather than just 1. The constructors simplify obvious cases: adding 0 returns the other term; multiplying by 1 returns the other term; multiplying by 0 returns 0; two numbers are computed immediately.',
      code: null,
    },
    {
      type: 'narration',
      id: 'make-sum',
      text: 'make_sum with simplification.',
      code: `function pair(x, y) { return [x, y]; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function make_sum(a1, a2) {
  if (a1 === 0) return a2;                            // 0 + x = x
  if (a2 === 0) return a1;                            // x + 0 = x
  if (typeof a1 === 'number' && typeof a2 === 'number')
    return a1 + a2;                                  // both numbers: compute
  return list('+', a1, a2);                           // leave symbolic
}

console.log(make_sum(0, 'x'));       // x
console.log(make_sum('x', 0));       // x
console.log(make_sum(3, 4));         // 7
console.log(JSON.stringify(make_sum('x', 'y'))); // ["+","x","y"]`,
    },
    {
      type: 'narration',
      id: 'make-product',
      text: 'make_product with simplification.',
      code: `function pair(x, y) { return [x, y]; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function make_product(m1, m2) {
  if (m1 === 0 || m2 === 0) return 0;                // x * 0 = 0
  if (m1 === 1) return m2;                            // 1 * x = x
  if (m2 === 1) return m1;                            // x * 1 = x
  if (typeof m1 === 'number' && typeof m2 === 'number')
    return m1 * m2;
  return list('*', m1, m2);
}

console.log(make_product(0, 'x'));  // 0
console.log(make_product(1, 'x'));  // x
console.log(make_product(2, 3));    // 6
console.log(JSON.stringify(make_product('x', 2))); // ["*","x",2]`,
    },
    { type: 'checkpoint', id: 'cp-interface' },

    // ── Building deriv case by case ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'derivative-rules-vocab',
      text: 'The four derivative rules:\n\n  d/dx c = 0               (constant: no x-dependence)\n  d/dx x = 1               (the variable itself)\n  d/dx y = 0               (different variable: treated as constant)\n  d/dx (u+v) = d/dx u + d/dx v    (sum rule)\n  d/dx (u*v) = u*(d/dx v) + v*(d/dx u)  (product rule)\n\nThe rules are recursive — the derivative of a compound expression is defined in terms of the derivatives of its sub-expressions. The recursion bottoms out at the base cases (constant or variable).',
      code: null,
    },
    {
      type: 'narration',
      id: 'deriv-base-cases',
      text: 'Start with the two base cases.',
      code: `function is_number(e)   { return typeof e === 'number'; }
function is_variable(e) { return typeof e === 'string'; }

function deriv(exp, x) {
  if (is_number(exp))   return 0;            // d/dx c = 0
  if (is_variable(exp)) return exp === x ? 1 : 0; // d/dx x = 1, d/dx y = 0
  throw new Error('Unknown: ' + JSON.stringify(exp));
}

console.log(deriv(5,   'x'));  // 0 — constant
console.log(deriv('x', 'x'));  // 1 — the variable
console.log(deriv('y', 'x'));  // 0 — different variable`,
    },
    {
      type: 'narration',
      id: 'deriv-sum-rule',
      text: 'Add the sum rule: deriv each sub-expression and combine with make_sum.',
      code: `function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function is_pair(e){return Array.isArray(e);}
function is_number(e){return typeof e==='number';}
function is_variable(e){return typeof e==='string';}
function is_sum(e){return is_pair(e)&&head(e)==='+';}
function addend(e){return head(tail(e));}
function augend(e){return head(tail(tail(e)));}
function make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1==='number'&&typeof a2==='number')return a1+a2;return list('+',a1,a2);}

function deriv(exp, x) {
  if (is_number(exp))   return 0;
  if (is_variable(exp)) return exp === x ? 1 : 0;
  if (is_sum(exp))
    return make_sum(deriv(addend(exp), x),
                    deriv(augend(exp),  x));
  throw new Error('Unknown: ' + JSON.stringify(exp));
}

// d/dx (x + 3) = 1 + 0 = 1
console.log(deriv(list('+', 'x', 3), 'x'));     // 1
// d/dx (x + y) with respect to x = 1 + 0 = 1
console.log(deriv(list('+', 'x', 'y'), 'x'));   // 1`,
    },
    {
      type: 'narration',
      id: 'deriv-product-rule',
      text: 'Add the product rule. The full deriv is now complete for sums and products.',
      code: `function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function is_pair(e){return Array.isArray(e);}
function is_number(e){return typeof e==='number';}
function is_variable(e){return typeof e==='string';}
function is_sum(e){return is_pair(e)&&head(e)==='+';}
function is_product(e){return is_pair(e)&&head(e)==='*';}
function addend(e){return head(tail(e));}
function augend(e){return head(tail(tail(e)));}
function multiplier(e){return head(tail(e));}
function multiplicand(e){return head(tail(tail(e)));}
function make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1==='number'&&typeof a2==='number')return a1+a2;return list('+',a1,a2);}
function make_product(m1,m2){if(m1===0||m2===0)return 0;if(m1===1)return m2;if(m2===1)return m1;if(typeof m1==='number'&&typeof m2==='number')return m1*m2;return list('*',m1,m2);}

function deriv(exp, x) {
  if (is_number(exp))   return 0;
  if (is_variable(exp)) return exp === x ? 1 : 0;
  if (is_sum(exp))
    return make_sum(deriv(addend(exp), x), deriv(augend(exp), x));
  if (is_product(exp))
    return make_sum(
      make_product(multiplier(exp),   deriv(multiplicand(exp), x)),
      make_product(multiplicand(exp), deriv(multiplier(exp),   x)));
  throw new Error('Unknown: ' + JSON.stringify(exp));
}

// d/dx (x*x) = x*1 + x*1 = x+x
console.log(JSON.stringify(deriv(list('*','x','x'), 'x')));
// d/dx (x*x + 3*x) — chain through sum and product rules
console.log(JSON.stringify(deriv(list('+', list('*','x','x'), list('*',3,'x')), 'x')));`,
    },
    {
      type: 'codelens',
      id: 'codelens-deriv',
      text: 'Open CodeLens on deriv of x*y with respect to x. Step through — deriv recognises is_product, extracts multiplier x and multiplicand y, then makes two recursive calls. Each bottoms out at a variable or number. Watch the tree be walked and rebuilt. This is symbolic computation: the same pattern as count_leaves walking a data tree.',
      code: `function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function is_pair(e){return Array.isArray(e);}function is_number(e){return typeof e==='number';}function is_variable(e){return typeof e==='string';}
function is_sum(e){return is_pair(e)&&head(e)==='+';}function is_product(e){return is_pair(e)&&head(e)==='*';}
function addend(e){return head(tail(e));}function augend(e){return head(tail(tail(e)));}
function multiplier(e){return head(tail(e));}function multiplicand(e){return head(tail(tail(e)));}
function make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1==='number'&&typeof a2==='number')return a1+a2;return list('+',a1,a2);}
function make_product(m1,m2){if(m1===0||m2===0)return 0;if(m1===1)return m2;if(m2===1)return m1;return list('*',m1,m2);}
function deriv(exp,x){if(is_number(exp))return 0;if(is_variable(exp))return exp===x?1:0;if(is_sum(exp))return make_sum(deriv(addend(exp),x),deriv(augend(exp),x));if(is_product(exp))return make_sum(make_product(multiplier(exp),deriv(multiplicand(exp),x)),make_product(multiplicand(exp),deriv(multiplier(exp),x)));throw new Error("Unknown");}
console.log(JSON.stringify(deriv(list('*','x','y'),'x')));`,
    },
    { type: 'checkpoint', id: 'cp-deriv' },

    {
      type: 'challenge',
      id: 'challenge-power-rule',
      text: 'Extend deriv with the power rule: d/dx (x^n) = n * x^(n-1). Represent x^n as list("^", x_expr, n). Add is_power(e), base(e), exponent(e), and make_power(b, n). Then add the power case to deriv. deriv(list("^","x",3), "x") should give a result equivalent to 3*x^2.',
      expectedOutput: 'has power rule',
      startCode: `function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function is_pair(e){return Array.isArray(e);}function is_number(e){return typeof e==='number';}function is_variable(e){return typeof e==='string';}
function is_sum(e){return is_pair(e)&&head(e)==='+';}function is_product(e){return is_pair(e)&&head(e)==='*';}
function addend(e){return head(tail(e));}function augend(e){return head(tail(tail(e)));}
function multiplier(e){return head(tail(e));}function multiplicand(e){return head(tail(tail(e)));}
function make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1==='number'&&typeof a2==='number')return a1+a2;return list('+',a1,a2);}
function make_product(m1,m2){if(m1===0||m2===0)return 0;if(m1===1)return m2;if(m2===1)return m1;if(typeof m1==='number'&&typeof m2==='number')return m1*m2;return list('*',m1,m2);}

// Add is_power, base, exponent, make_power

function deriv(exp, x) {
  if (is_number(exp))   return 0;
  if (is_variable(exp)) return exp === x ? 1 : 0;
  if (is_sum(exp))     return make_sum(deriv(addend(exp),x), deriv(augend(exp),x));
  if (is_product(exp)) return make_sum(
    make_product(multiplier(exp), deriv(multiplicand(exp),x)),
    make_product(multiplicand(exp), deriv(multiplier(exp),x)));
  // Add power case: d/dx (base^exp) = exp * base^(exp-1) * d/dx base
  throw new Error('Unknown: ' + JSON.stringify(exp));
}

try {
  const r = deriv(list('^', 'x', 3), 'x');
  console.log(r !== undefined ? 'has power rule' : 'failed');
} catch(e) { console.log('missing'); }
`,
      hint: 'function is_power(e){return is_pair(e)&&head(e)===\'^\';}\nfunction base(e){return head(tail(e));}\nfunction exponent(e){return head(tail(tail(e)));}\nfunction make_power(b,n){if(n===0)return 1;if(n===1)return b;return list(\'^\',b,n);}\n// power case:\nif(is_power(exp)) return make_product(\n  exponent(exp),\n  make_product(make_power(base(exp), exponent(exp)-1), deriv(base(exp), x)));',
      validate: ({ logs }) => logs.some(l => l.includes('has power rule')),
    },
  ],
}
