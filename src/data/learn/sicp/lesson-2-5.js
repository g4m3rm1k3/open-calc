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

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'So far, every computation in this course has been numerical. square(5) runs code and returns 25. The arithmetic happens. But consider what a computer algebra system like Wolfram Alpha does when you type "differentiate x² + 3x": it does not evaluate x² + 3x for any specific value of x. It manipulates the expression symbolically — treating it as a tree structure, applying the derivative rules, and producing a new expression 2x + 3. This lesson builds exactly that: a program that differentiates algebraic expressions. The expression x² + 3x is data; the derivative rules are code that transforms that data.',
      code: null,
    },

    // ── Code as data ──────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'code-as-data-vocab',
      text: 'The key insight is that an algebraic expression is a tree. "x + 2" is a tree whose root is "+" and whose children are "x" and 2. "x * x" is a tree whose root is "*" and whose children are "x" and "x". "x * x + 3" is a tree whose root is "+" with children [x*x tree] and 3. We can represent this tree using the lists we built in the previous lessons. Each expression is either an atom (a number or variable name) or a combination (a list whose first element is the operator).',
      code: null,
    },
    {
      type: 'narration',
      id: 'symbolic-vocab',
      text: 'A symbol in this context is a name treated as data rather than as a variable to be looked up. We represent symbols as JavaScript strings. The string "x" is the symbol x — a placeholder in an expression, not a binding in our environment. A number is a number. An atom is either a number or a symbol. A compound expression is a list: list("+", "x", 2) represents x + 2, and list("*", "x", "x") represents x * x.',
      code: null,
    },

    // ── Representing expressions ──────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'expression-as-list',
      text: 'Here is how expressions look as lists. Run this — you are looking at the internal representation of algebraic expressions. What appears to be "x + 2" in mathematics is ["+", ["x", [2, null]]] as a pair chain in our system.',
      code: 'function pair(x,y){return[x,y];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nconst x_plus_2   = list(\'+\', \'x\', 2);         // x + 2\nconst x_times_x  = list(\'*\', \'x\', \'x\');       // x * x\nconst x_sq_plus_3 = list(\'+\', list(\'*\',\'x\',\'x\'), 3); // x² + 3\n\nconsole.log(JSON.stringify(x_plus_2));\nconsole.log(JSON.stringify(x_times_x));\nconsole.log(JSON.stringify(x_sq_plus_3));',
    },

    // ── Terminology: selectors and predicates ─────────────────────────────────────
    {
      type: 'narration',
      id: 'interface-vocab',
      text: 'Before writing the differentiator, we need an interface — a set of predicates and selectors that describe what we know about each kind of expression. This is the wishful thinking technique from Chapter 2.1. We define is_number, is_variable, is_sum, is_product; and selectors addend, augend, multiplier, multiplicand. The differentiator will be written entirely in terms of these names. The representation (pairs/lists) is hidden behind them.',
      code: null,
    },
    {
      type: 'narration',
      id: 'predicates-code',
      text: 'Here are the predicates. is_number tests for a JavaScript number. is_variable tests for a string. is_sum tests for a list whose first element is "+". is_product tests for "*". These four cases are all the expression types our differentiator will handle.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction is_pair(e){return Array.isArray(e);}\n\nfunction is_number(e)   { return typeof e === \'number\'; }\nfunction is_variable(e) { return typeof e === \'string\'; }\nfunction is_sum(e)      { return is_pair(e) && head(e) === \'+\'; }\nfunction is_product(e)  { return is_pair(e) && head(e) === \'*\'; }\n\nconsole.log(is_number(5));               // true\nconsole.log(is_variable(\'x\'));           // true\nconsole.log(is_sum(list(\'+\',\'x\',2)));    // true\nconsole.log(is_product(list(\'*\',\'x\',\'x\'))); // true',
    },
    {
      type: 'narration',
      id: 'selectors-code',
      text: 'Here are the selectors. For a sum like list("+", "x", 2), the addend is the second element ("x") and the augend is the third element (2). For a product, multiplier and multiplicand work the same way.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction addend(e)       { return head(tail(e)); }       // 2nd element\nfunction augend(e)       { return head(tail(tail(e))); } // 3rd element\nfunction multiplier(e)   { return head(tail(e)); }\nfunction multiplicand(e) { return head(tail(tail(e))); }\n\nconst sum = list(\'+\', \'x\', 2);\nconsole.log(addend(sum));   // x\nconsole.log(augend(sum));   // 2',
    },
    {
      type: 'checkpoint',
      id: 'cp-symbolic-expressions',
    },

    // ── Constructors with simplification ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'constructors-vocab',
      text: 'The derivative rules produce new expressions by combining sub-expressions. The constructors make_sum and make_product build those new expressions. But naive construction produces ugly results: the derivative of x is list("+", 1, 0) instead of just 1. To keep output readable, the constructors simplify: sum with 0 returns the other term; product with 0 returns 0; product with 1 returns the other term; sum of two numbers adds them. These simplifications only fire for obvious cases — the result is still symbolic, not numeric.',
      code: null,
    },
    {
      type: 'narration',
      id: 'make-sum-code',
      text: 'Here is make_sum with simplification. Run it and observe: adding 0 to x gives x, not list("+", 0, "x"). Adding two numbers gives a number. Everything else gives a list.',
      code: 'function pair(x,y){return[x,y];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction make_sum(a1, a2) {\n  if (a1 === 0) return a2;              // 0 + x = x\n  if (a2 === 0) return a1;              // x + 0 = x\n  if (typeof a1 === \'number\' && typeof a2 === \'number\') return a1 + a2; // compute\n  return list(\'+\', a1, a2);            // leave symbolic\n}\n\nconsole.log(make_sum(0, \'x\'));   // x — simplified\nconsole.log(make_sum(\'x\', 0));   // x — simplified\nconsole.log(make_sum(3, 4));     // 7 — computed\nconsole.log(JSON.stringify(make_sum(\'x\', \'y\'))); // ["+","x","y"]',
    },
    {
      type: 'narration',
      id: 'make-product-code',
      text: 'make_product simplifies multiplication by 0 and 1. These are the cases that arise most often in differentiation.',
      code: 'function pair(x,y){return[x,y];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction make_product(m1, m2) {\n  if (m1 === 0 || m2 === 0) return 0;   // x * 0 = 0\n  if (m1 === 1) return m2;              // 1 * x = x\n  if (m2 === 1) return m1;              // x * 1 = x\n  if (typeof m1 === \'number\' && typeof m2 === \'number\') return m1 * m2;\n  return list(\'*\', m1, m2);\n}\n\nconsole.log(make_product(0, \'x\'));   // 0\nconsole.log(make_product(1, \'x\'));   // x — simplified\nconsole.log(make_product(2, 3));     // 6\nconsole.log(JSON.stringify(make_product(\'x\', \'y\'))); // ["*","x","y"]',
    },
    {
      type: 'checkpoint',
      id: 'cp-interface',
    },

    // ── The derivative rules ──────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'derivative-rules-vocab',
      text: 'The derivative rules from calculus are exactly four cases: the derivative of a constant is 0; the derivative of a variable x with respect to x is 1, and with respect to any other variable is 0; the sum rule says the derivative of u + v is the derivative of u plus the derivative of v; the product rule says the derivative of u * v is u times the derivative of v plus v times the derivative of u. These rules are recursive — the derivative of a complex expression is defined in terms of the derivatives of its sub-expressions. The recursion bottoms out at the base cases (constant or variable).',
      code: null,
    },
    {
      type: 'narration',
      id: 'deriv-constant-variable',
      text: 'Here are the first two cases of deriv. A constant has no dependence on x, so its derivative is 0. A variable that IS x has derivative 1. Any other variable has derivative 0 (it is treated as a constant with respect to x).',
      code: 'function is_number(e) { return typeof e === \'number\'; }\nfunction is_variable(e){ return typeof e === \'string\'; }\n\nfunction deriv(exp, x) {\n  if (is_number(exp)) return 0;   // d/dx c = 0\n  if (is_variable(exp))\n    return exp === x ? 1 : 0;    // d/dx x = 1, d/dx y = 0\n  throw new Error(`Unknown: ${JSON.stringify(exp)}`);\n}\n\nconsole.log(deriv(5,   \'x\')); // 0 — constant\nconsole.log(deriv(\'x\', \'x\')); // 1 — the variable itself\nconsole.log(deriv(\'y\', \'x\')); // 0 — different variable',
    },
    {
      type: 'narration',
      id: 'deriv-sum-rule',
      text: 'The sum rule: d/dx (u + v) = d/dx u + d/dx v. In code: call deriv on each sub-expression, then combine with make_sum. The recursive calls will handle whatever kind of expressions u and v are.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction is_number(e){return typeof e===\'number\';}\nfunction is_variable(e){return typeof e===\'string\';}\nfunction is_pair(e){return Array.isArray(e);}\nfunction is_sum(e){return is_pair(e)&&head(e)===\'+\';}\nfunction addend(e){return head(tail(e));}\nfunction augend(e){return head(tail(tail(e)));}\nfunction make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1===\'number\'&&typeof a2===\'number\')return a1+a2;return list(\'+\',a1,a2);}\n\nfunction deriv(exp, x) {\n  if (is_number(exp))   return 0;\n  if (is_variable(exp)) return exp === x ? 1 : 0;\n  if (is_sum(exp))\n    return make_sum(deriv(addend(exp), x),  // d/dx u\n                    deriv(augend(exp),  x)); // d/dx v\n  throw new Error(`Unknown: ${JSON.stringify(exp)}`);\n}\n\n// d/dx (x + 3) = 1 + 0 = 1\nconsole.log(deriv(list(\'+\', \'x\', 3), \'x\')); // 1',
    },
    {
      type: 'narration',
      id: 'deriv-product-rule',
      text: 'The product rule: d/dx (u * v) = u * (d/dx v) + v * (d/dx u). In code, this is make_sum of two make_product calls. When we add the product case, deriv can now differentiate any expression built from numbers, variables, sums, and products.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction is_pair(e){return Array.isArray(e);}\nfunction is_number(e){return typeof e===\'number\';}\nfunction is_variable(e){return typeof e===\'string\';}\nfunction is_sum(e){return is_pair(e)&&head(e)===\'+\';}\nfunction is_product(e){return is_pair(e)&&head(e)===\'*\';}\nfunction addend(e){return head(tail(e));}\nfunction augend(e){return head(tail(tail(e)));}\nfunction multiplier(e){return head(tail(e));}\nfunction multiplicand(e){return head(tail(tail(e)));}\nfunction make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1===\'number\'&&typeof a2===\'number\')return a1+a2;return list(\'+\',a1,a2);}\nfunction make_product(m1,m2){if(m1===0||m2===0)return 0;if(m1===1)return m2;if(m2===1)return m1;if(typeof m1===\'number\'&&typeof m2===\'number\')return m1*m2;return list(\'*\',m1,m2);}\n\nfunction deriv(exp, x) {\n  if (is_number(exp))   return 0;\n  if (is_variable(exp)) return exp === x ? 1 : 0;\n  if (is_sum(exp)) return make_sum(deriv(addend(exp),x), deriv(augend(exp),x));\n  if (is_product(exp))  // product rule: u*v\' + v*u\'\n    return make_sum(\n      make_product(multiplier(exp),   deriv(multiplicand(exp), x)),\n      make_product(multiplicand(exp), deriv(multiplier(exp),   x)));\n  throw new Error(`Unknown: ${JSON.stringify(exp)}`);\n}\n\n// d/dx (x * x) = x*1 + x*1 = x + x\nconsole.log(JSON.stringify(deriv(list(\'*\',\'x\',\'x\'), \'x\'))); // ["+","x","x"]\n// d/dx (x*x + 3) = x + x + 0 = x + x\nconsole.log(JSON.stringify(deriv(list(\'+\',list(\'*\',\'x\',\'x\'),3), \'x\')));',
    },
    {
      type: 'codelens',
      id: 'codelens-deriv',
      text: 'Open CodeLens on deriv of x*y with respect to x. Step through it — deriv recognises a product, splits it, and calls itself recursively on multiplier(x*y)=x and multiplicand(x*y)=y. The product rule makes two recursive calls. Watch each one bottom out at the variable/constant base cases. This is symbolic computation: the expression tree is walked and rebuilt.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction is_pair(e){return Array.isArray(e);}\nfunction is_number(e){return typeof e===\'number\';}\nfunction is_variable(e){return typeof e===\'string\';}\nfunction is_sum(e){return is_pair(e)&&head(e)===\'+\';}\nfunction is_product(e){return is_pair(e)&&head(e)===\'*\';}\nfunction addend(e){return head(tail(e));}\nfunction augend(e){return head(tail(tail(e)));}\nfunction multiplier(e){return head(tail(e));}\nfunction multiplicand(e){return head(tail(tail(e)));}\nfunction make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1===\'number\'&&typeof a2===\'number\')return a1+a2;return list(\'+\',a1,a2);}\nfunction make_product(m1,m2){if(m1===0||m2===0)return 0;if(m1===1)return m2;if(m2===1)return m1;if(typeof m1===\'number\'&&typeof m2===\'number\')return m1*m2;return list(\'*\',m1,m2);}\nfunction deriv(exp,x){if(is_number(exp))return 0;if(is_variable(exp))return exp===x?1:0;if(is_sum(exp))return make_sum(deriv(addend(exp),x),deriv(augend(exp),x));if(is_product(exp))return make_sum(make_product(multiplier(exp),deriv(multiplicand(exp),x)),make_product(multiplicand(exp),deriv(multiplier(exp),x)));throw new Error("Unknown");}\n\nconsole.log(JSON.stringify(deriv(list(\'*\',\'x\',\'y\'),\'x\')));',
    },
    {
      type: 'challenge',
      id: 'challenge-power-rule',
      text: 'Extend deriv with the power rule: d/dx x^n = n * x^(n-1). Represent x^n as list("^", "x", n). Add is_power, base(e), exponent(e), and make_power(b, n) to your interface. Then add a power case to deriv. The derivative of list("^", "x", 3) with respect to "x" should produce a result equal to 3*x^2.',
      expectedOutput: 'has power rule',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction is_pair(e){return Array.isArray(e);}\nfunction is_number(e){return typeof e===\'number\';}\nfunction is_variable(e){return typeof e===\'string\';}\nfunction is_sum(e){return is_pair(e)&&head(e)===\'+\';}\nfunction is_product(e){return is_pair(e)&&head(e)===\'*\';}\nfunction addend(e){return head(tail(e));}\nfunction augend(e){return head(tail(tail(e)));}\nfunction multiplier(e){return head(tail(e));}\nfunction multiplicand(e){return head(tail(tail(e)));}\nfunction make_sum(a1,a2){if(a1===0)return a2;if(a2===0)return a1;if(typeof a1===\'number\'&&typeof a2===\'number\')return a1+a2;return list(\'+\',a1,a2);}\nfunction make_product(m1,m2){if(m1===0||m2===0)return 0;if(m1===1)return m2;if(m2===1)return m1;if(typeof m1===\'number\'&&typeof m2===\'number\')return m1*m2;return list(\'*\',m1,m2);}\n\n// Add: is_power, base, exponent, make_power\n\nfunction deriv(exp, x) {\n  if (is_number(exp))   return 0;\n  if (is_variable(exp)) return exp === x ? 1 : 0;\n  if (is_sum(exp)) return make_sum(deriv(addend(exp),x),deriv(augend(exp),x));\n  if (is_product(exp)) return make_sum(\n    make_product(multiplier(exp),   deriv(multiplicand(exp), x)),\n    make_product(multiplicand(exp), deriv(multiplier(exp),   x)));\n  // Add power case here\n  throw new Error(`Unknown: ${JSON.stringify(exp)}`);\n}\n\ntry {\n  const r = deriv(list(\'^\',\'x\',3), \'x\');\n  console.log(r !== undefined ? \'has power rule\' : \'failed\');\n} catch(e) { console.log(\'missing\'); }\n',
      hint: 'function is_power(e){return is_pair(e)&&head(e)===\'^\';}\nfunction base(e){return head(tail(e));}\nfunction exponent(e){return head(tail(tail(e)));}\nfunction make_power(b,n){if(n===0)return 1;if(n===1)return b;return list(\'^\',b,n);}\n// power case:\nif(is_power(exp)) return make_product(\n  exponent(exp),\n  make_product(make_power(base(exp),exponent(exp)-1), deriv(base(exp),x)));',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.includes('has power rule')),
    },
    {
      type: 'checkpoint',
      id: 'cp-deriv',
    },
  ],
}
