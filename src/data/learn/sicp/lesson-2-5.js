export const lesson = {
  id: 'sicp-2-5',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.3.1–2.3.2  Symbolic Data and Differentiation',
  checkpoints: [
    { id: 'cp-symbols',     label: 'Symbolic Expressions' },
    { id: 'cp-deriv',       label: 'Differentiation' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'So far all our data has been numbers. Section 2.3 introduces symbolic data — programs that manipulate algebraic expressions as objects. The key idea: an expression like 3x² + 2x + 1 is a data structure, not a computation. We can represent it as a tree, walk that tree, and apply rules like the derivative rules from calculus — without ever evaluating the expression numerically.',
      code: null,
    },

    // ── Terminology: Symbols ──────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'symbolic-vocab',
      text: 'A symbol in SICP is a name treated as data rather than as a variable to be looked up. In Scheme, you quote a symbol to prevent evaluation. In JavaScript, we represent symbols as strings — the string "x" is a symbol for the variable x, not a variable binding. An atom is either a number or a symbol — something indivisible. A symbolic expression is built from atoms and combinations (lists of atoms and sub-expressions).',
      code: null,
    },

    // ── 2.3.2  Symbolic Differentiation ──────────────────────────────────────────
    {
      type: 'narration',
      id: 'expr-representation-vocab',
      text: 'The plan: represent algebraic expressions as lists. A sum like x + y becomes list("+", "x", "y"). A product like x * y becomes list("*", "x", "y"). A number is just a number. A variable is a string like "x". This representation is itself a tree — the same pair structure we have been using for lists, now interpreted as an expression tree.',
      code: null,
    },
    {
      type: 'narration',
      id: 'expr-selectors',
      text: 'Before writing deriv, we define the interface for reading expressions — the same wishful-thinking approach from Chapter 2.1. Predicates tell us what kind of expression we have. Selectors extract the parts. This interface insulates the derivative rules from the representation.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\n// Predicates\nfunction is_number(e)   { return typeof e === \'number\'; }\nfunction is_variable(e) { return typeof e === \'string\'; }\nfunction is_same_variable(e1, e2) { return is_variable(e1) && e1 === e2; }\nfunction is_sum(e)      { return is_pair(e) && head(e) === \'+\'; }\nfunction is_product(e)  { return is_pair(e) && head(e) === \'*\'; }\nfunction is_pair(e)     { return Array.isArray(e); }\n\n// Selectors\nfunction addend(e)      { return head(tail(e)); }    // second element\nfunction augend(e)      { return head(tail(tail(e))); } // third element\nfunction multiplier(e)  { return head(tail(e)); }\nfunction multiplicand(e){ return head(tail(tail(e))); }\n\n// Test\nconst expr = list(\'+\', \'x\', list(\'*\', 2, \'y\'));\nconsole.log(is_sum(expr));             // true\nconsole.log(is_variable(addend(expr))); // true — addend is "x"\nconsole.log(augend(expr));             // [*, 2, y] — the sub-expression',
    },
    {
      type: 'checkpoint',
      id: 'cp-symbols',
    },

    // ── Derivative rules ──────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'deriv-rules-vocab',
      text: 'The derivative rules from calculus tell us how to differentiate each kind of expression with respect to a variable x. Rule 1: d/dx of a number is 0. Rule 2: d/dx of x is 1; d/dx of any other variable is 0. Rule 3: d/dx of (u + v) is d/dx u + d/dx v. Rule 4: d/dx of (u * v) is u * (d/dx v) + v * (d/dx u). These rules define differentiation recursively — the derivative of a complex expression is defined in terms of derivatives of its sub-expressions.',
      code: null,
    },
    {
      type: 'narration',
      id: 'make-sum-product',
      text: 'The constructors make_sum and make_product build expressions. They also simplify: adding 0 returns the other term, multiplying by 0 returns 0, multiplying by 1 returns the other term. These simplifications prevent the output from growing uncontrollably.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction make_sum(a1, a2) {\n  if (a1 === 0) return a2;\n  if (a2 === 0) return a1;\n  if (typeof a1 === \'number\' && typeof a2 === \'number\') return a1 + a2;\n  return list(\'+\', a1, a2);\n}\n\nfunction make_product(m1, m2) {\n  if (m1 === 0 || m2 === 0) return 0;\n  if (m1 === 1) return m2;\n  if (m2 === 1) return m1;\n  if (typeof m1 === \'number\' && typeof m2 === \'number\') return m1 * m2;\n  return list(\'*\', m1, m2);\n}\n\nconsole.log(make_sum(0, \'x\'));       // x — simplified\nconsole.log(make_product(1, \'x\'));   // x — simplified\nconsole.log(JSON.stringify(make_sum(\'x\', \'y\'))); // ["+","x","y"]',
    },
    {
      type: 'narration',
      id: 'deriv-fn',
      text: 'Now the derivative function. deriv dispatches on the type of expression and applies the corresponding rule. It is a direct translation of the four calculus rules into code.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction is_pair(e) { return Array.isArray(e); }\nfunction is_number(e)   { return typeof e === \'number\'; }\nfunction is_variable(e) { return typeof e === \'string\'; }\nfunction is_same_variable(e1, e2) { return is_variable(e1) && e1 === e2; }\nfunction is_sum(e)     { return is_pair(e) && head(e) === \'+\'; }\nfunction is_product(e) { return is_pair(e) && head(e) === \'*\'; }\nfunction addend(e)      { return head(tail(e)); }\nfunction augend(e)      { return head(tail(tail(e))); }\nfunction multiplier(e)  { return head(tail(e)); }\nfunction multiplicand(e){ return head(tail(tail(e))); }\nfunction make_sum(a1, a2) {\n  if (a1===0) return a2; if (a2===0) return a1;\n  if (typeof a1===\'number\'&&typeof a2===\'number\') return a1+a2;\n  return list(\'+\',a1,a2);\n}\nfunction make_product(m1,m2) {\n  if (m1===0||m2===0) return 0; if (m1===1) return m2; if (m2===1) return m1;\n  if (typeof m1===\'number\'&&typeof m2===\'number\') return m1*m2;\n  return list(\'*\',m1,m2);\n}\n\nfunction deriv(exp, x) {\n  if (is_number(exp))   return 0;                          // d/dx c = 0\n  if (is_variable(exp)) return is_same_variable(exp, x) ? 1 : 0; // d/dx x = 1\n  if (is_sum(exp))                                         // d/dx (u+v) = u\' + v\'\n    return make_sum(deriv(addend(exp), x), deriv(augend(exp), x));\n  if (is_product(exp))                                     // d/dx (u*v) = u*v\' + v*u\'\n    return make_sum(\n      make_product(multiplier(exp), deriv(multiplicand(exp), x)),\n      make_product(multiplicand(exp), deriv(multiplier(exp), x)));\n  throw new Error(`Unknown expression type: ${JSON.stringify(exp)}`);\n}\n\n// d/dx (x*x) should give 2x, simplified to (+ x x)\nconsole.log(JSON.stringify(deriv(list(\'*\', \'x\', \'x\'), \'x\')));\n// d/dx (x*x + 3) should give 2x\nconsole.log(JSON.stringify(deriv(list(\'+\', list(\'*\', \'x\', \'x\'), 3), \'x\')));',
    },
    {
      type: 'codelens',
      id: 'codelens-deriv',
      text: 'Open CodeLens on deriv of x*y with respect to x. Step through it — deriv recognises a product, splits into two sub-expressions, and calls itself recursively on each. Watch the symbolic structure get walked and rebuilt according to the product rule. This is symbolic computation: the program manipulates the expression as data.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction is_pair(e) { return Array.isArray(e); }\nfunction is_number(e) { return typeof e === \'number\'; }\nfunction is_variable(e) { return typeof e === \'string\'; }\nfunction is_same_variable(e1, e2) { return is_variable(e1) && e1 === e2; }\nfunction is_sum(e) { return is_pair(e) && head(e) === \'+\'; }\nfunction is_product(e) { return is_pair(e) && head(e) === \'*\'; }\nfunction addend(e) { return head(tail(e)); }\nfunction augend(e) { return head(tail(tail(e))); }\nfunction multiplier(e) { return head(tail(e)); }\nfunction multiplicand(e) { return head(tail(tail(e))); }\nfunction make_sum(a1, a2) { return a1===0?a2:a2===0?a1:typeof a1===\'number\'&&typeof a2===\'number\'?a1+a2:list(\'+\',a1,a2); }\nfunction make_product(m1,m2) { return m1===0||m2===0?0:m1===1?m2:m2===1?m1:typeof m1===\'number\'&&typeof m2===\'number\'?m1*m2:list(\'*\',m1,m2); }\n\nfunction deriv(exp, x) {\n  if (is_number(exp)) return 0;\n  if (is_variable(exp)) return is_same_variable(exp, x) ? 1 : 0;\n  if (is_sum(exp)) return make_sum(deriv(addend(exp), x), deriv(augend(exp), x));\n  if (is_product(exp)) return make_sum(\n    make_product(multiplier(exp), deriv(multiplicand(exp), x)),\n    make_product(multiplicand(exp), deriv(multiplier(exp), x)));\n}\n\nconsole.log(JSON.stringify(deriv(list(\'*\', \'x\', \'y\'), \'x\')));',
    },
    {
      type: 'challenge',
      id: 'challenge-deriv-extend',
      text: 'Extend deriv with a power rule: d/dx (x^n) = n * x^(n-1). Represent x^3 as list("^", "x", 3). Add is_power, base, exponent selectors, and a make_power constructor. Then add a power case in deriv. deriv(list("^","x",3), "x") should give list("*", 3, list("^","x",2)), simplified or not.',
      expectedOutput: 'has power rule',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction is_pair(e) { return Array.isArray(e); }\nfunction is_number(e)    { return typeof e === \'number\'; }\nfunction is_variable(e)  { return typeof e === \'string\'; }\nfunction is_same_variable(e1, e2) { return is_variable(e1) && e1 === e2; }\nfunction is_sum(e)     { return is_pair(e) && head(e) === \'+\'; }\nfunction is_product(e) { return is_pair(e) && head(e) === \'*\'; }\nfunction addend(e)      { return head(tail(e)); }\nfunction augend(e)      { return head(tail(tail(e))); }\nfunction multiplier(e)  { return head(tail(e)); }\nfunction multiplicand(e){ return head(tail(tail(e))); }\nfunction make_sum(a1,a2) { return a1===0?a2:a2===0?a1:typeof a1===\'number\'&&typeof a2===\'number\'?a1+a2:list(\'+\',a1,a2); }\nfunction make_product(m1,m2) { return m1===0||m2===0?0:m1===1?m2:m2===1?m1:typeof m1===\'number\'&&typeof m2===\'number\'?m1*m2:list(\'*\',m1,m2); }\n\n// Add: is_power, base, exponent, make_power\n// Then add the power case to deriv\n\nfunction deriv(exp, x) {\n  if (is_number(exp))   return 0;\n  if (is_variable(exp)) return is_same_variable(exp, x) ? 1 : 0;\n  if (is_sum(exp)) return make_sum(deriv(addend(exp), x), deriv(augend(exp), x));\n  if (is_product(exp)) return make_sum(\n    make_product(multiplier(exp), deriv(multiplicand(exp), x)),\n    make_product(multiplicand(exp), deriv(multiplier(exp), x)));\n  // add power case here\n  throw new Error(`Unknown: ${JSON.stringify(exp)}`);\n}\n\nconst result = deriv(list(\'^\', \'x\', 3), \'x\');\nconsole.log(typeof result !== \'undefined\' ? \'has power rule\' : \'missing\');\n',
      hint: 'function is_power(e)  { return is_pair(e) && head(e) === \'^\'; }\nfunction base(e)      { return head(tail(e)); }\nfunction exponent(e)  { return head(tail(tail(e))); }\nfunction make_power(b, n) { return list(\'^\', b, n); }\n// In deriv:\nif (is_power(exp))\n  return make_product(exponent(exp),\n    make_product(make_power(base(exp), exponent(exp) - 1),\n                 deriv(base(exp), x)));',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function is_pair(e){return Array.isArray(e);}
function is_number(e){return typeof e==='number';}
function is_variable(e){return typeof e==='string';}
function is_same_variable(e1,e2){return is_variable(e1)&&e1===e2;}
function is_sum(e){return is_pair(e)&&head(e)==='+';}
function is_product(e){return is_pair(e)&&head(e)==='*';}
function addend(e){return head(tail(e));}
function augend(e){return head(tail(tail(e)));}
function multiplier(e){return head(tail(e));}
function multiplicand(e){return head(tail(tail(e)));}
function make_sum(a1,a2){return a1===0?a2:a2===0?a1:typeof a1==='number'&&typeof a2==='number'?a1+a2:list('+',a1,a2);}
function make_product(m1,m2){return m1===0||m2===0?0:m1===1?m2:m2===1?m1:typeof m1==='number'&&typeof m2==='number'?m1*m2:list('*',m1,m2);}
${code}
try {
  const r = deriv(list('^','x',3),'x');
  return r !== undefined;
} catch { return false; }`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-deriv',
    },
  ],
}
