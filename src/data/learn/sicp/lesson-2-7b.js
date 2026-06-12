export const lesson = {
  id: 'sicp-2-7b',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.5.1  Generic Arithmetic',
  checkpoints: [
    { id: 'cp-numeric-tower',  label: 'The Numeric Tower' },
    { id: 'cp-generic-ops',    label: 'Generic Operations' },
    { id: 'cp-coercion',       label: 'Coercion' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 2.5 is the culmination of Chapter 2. We now apply the data-directed dispatch system from Section 2.4 to build a complete numeric tower: integers, rational numbers, real numbers, and complex numbers all using a single generic add, a single generic mul, and so on. The same + that works on integers also works on rationals, and adding a rational to a complex number coerces the rational up the tower before operating. This is how a full mathematical library is designed.',
      code: null,
    },

    // ── Terminology: The numeric tower ────────────────────────────────────────────
    {
      type: 'narration',
      id: 'tower-vocab',
      text: 'The numeric tower is a hierarchy of types where each type is a generalization of the one below it. Every integer is a rational number. Every rational is a real number. Every real is a complex number. This hierarchy is called a tower because you can always go up: promote an integer to a rational (n becomes n/1), a rational to a real (the decimal value), a real to a complex (add imaginary part 0). The generics system allows any operation to promote operands to the same level before operating.',
      code: null,
    },

    // ── The dispatch table infrastructure ─────────────────────────────────────────
    {
      type: 'narration',
      id: 'dispatch-setup',
      text: 'We reuse the dispatch table from Section 2.4.3. Each numeric package registers its operations. The generic operations look up the right implementation for the type at hand.',
      code: 'const table = {};\nfunction put(op, type, fn) {\n  if (!table[op]) table[op] = {};\n  table[op][type] = fn;\n}\nfunction get(op, type) {\n  return table[op] && table[op][type];\n}\n\n// A tagged datum: { tag, data }\nfunction tag(type, data) { return { tag: type, data }; }\nfunction type_tag(x) { return x.tag; }\nfunction contents(x) { return x.data; }\n\nfunction apply_generic(op, x, y) {\n  const fn = get(op, type_tag(x));\n  if (!fn) throw new Error(`No ${op} for ${type_tag(x)}`);\n  return fn(contents(x), y !== undefined ? contents(y) : undefined);\n}\n\nconsole.log(\'Dispatch table ready\');',
    },

    // ── Integer package ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'integer-package',
      text: 'The integer package is the simplest. It wraps JavaScript numbers with the tag "integer." Addition and multiplication just use JavaScript arithmetic. The make_integer constructor tags the value.',
      code: 'const table = {};\nfunction put(op,t,fn){if(!table[op])table[op]={};table[op][t]=fn;}\nfunction get(op,t){return table[op]&&table[op][t];}\nfunction tag(t,d){return{tag:t,data:d};}\nfunction type_tag(x){return x.tag;}\nfunction contents(x){return x.data;}\n\n// Integer package\nput(\'add\', \'integer\', (x, y_datum) => tag(\'integer\', x + contents(y_datum)));\nput(\'mul\', \'integer\', (x, y_datum) => tag(\'integer\', x * contents(y_datum)));\nput(\'to_string\', \'integer\', x => String(x));\n\nfunction make_integer(n) { return tag(\'integer\', n); }\n\nconst three = make_integer(3);\nconst four  = make_integer(4);\n\nconst add_result = get(\'add\', \'integer\')(3, four);\nconsole.log(add_result); // { tag: \'integer\', data: 7 }',
    },

    // ── Rational package ──────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'rational-package',
      text: 'The rational package installs rational arithmetic using the make_rat/numer/denom system from Section 2.1. It registers add, mul, and sub for the "rational" tag.',
      code: 'const table = {};\nfunction put(op,t,fn){if(!table[op])table[op]={};table[op][t]=fn;}\nfunction get(op,t){return table[op]&&table[op][t];}\nfunction tag(t,d){return{tag:t,data:d};}\nfunction type_tag(x){return x.tag;}\nfunction contents(x){return x.data;}\nfunction gcd(a,b){return b===0?a:gcd(b,a%b);}\n\n// Rational package — internal representation: {n, d}\nput(\'add\', \'rational\', (x, y_datum) => {\n  const y = contents(y_datum);\n  const n = x.n * y.d + y.n * x.d;\n  const d = x.d * y.d;\n  const g = gcd(Math.abs(n), Math.abs(d));\n  return tag(\'rational\', { n: n/g, d: d/g });\n});\nput(\'to_string\', \'rational\', x => `${x.n}/${x.d}`);\n\nfunction make_rational(n, d) {\n  const g = gcd(Math.abs(n), Math.abs(d));\n  return tag(\'rational\', { n: n/g, d: d/g });\n}\n\nconst half    = make_rational(1, 2);\nconst third   = make_rational(1, 3);\nconst sum_fn  = get(\'add\', \'rational\');\nconst result  = sum_fn(contents(half), third);\nconsole.log(get(\'to_string\', \'rational\')(contents(result))); // 5/6',
    },
    {
      type: 'checkpoint',
      id: 'cp-numeric-tower',
    },

    // ── Generic operations ────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'generic-add',
      text: 'With both packages installed, we write generic_add that looks up the right implementation based on the type tag of its first argument. The caller never needs to know which type they are operating on.',
      code: 'const table = {};\nfunction put(op,t,fn){if(!table[op])table[op]={};table[op][t]=fn;}\nfunction get(op,t){return table[op]&&table[op][t];}\nfunction tag(t,d){return{tag:t,data:d};}\nfunction type_tag(x){return x.tag;}\nfunction contents(x){return x.data;}\nfunction gcd(a,b){return b===0?a:gcd(b,a%b);}\n\nput(\'add\',\'integer\',(x,y)=>tag(\'integer\',x+contents(y)));\nput(\'to_str\',\'integer\',x=>String(x));\nput(\'add\',\'rational\',(x,y)=>{const yc=contents(y);const n=x.n*yc.d+yc.n*x.d,d=x.d*yc.d,g=gcd(Math.abs(n),Math.abs(d));return tag(\'rational\',{n:n/g,d:d/g});});\nput(\'to_str\',\'rational\',x=>`${x.n}/${x.d}`);\n\nfunction make_integer(n){return tag(\'integer\',n);}\nfunction make_rational(n,d){const g=gcd(Math.abs(n),Math.abs(d));return tag(\'rational\',{n:n/g,d:d/g});}\n\nfunction generic_add(x, y) {\n  const fn = get(\'add\', type_tag(x));\n  if (!fn) throw new Error(`No add for ${type_tag(x)}`);\n  return fn(contents(x), y);\n}\nfunction to_str(x) {\n  return get(\'to_str\', type_tag(x))(contents(x));\n}\n\nconsole.log(to_str(generic_add(make_integer(3), make_integer(4)))); // 7\nconsole.log(to_str(generic_add(make_rational(1,2), make_rational(1,3)))); // 5/6',
    },
    {
      type: 'checkpoint',
      id: 'cp-generic-ops',
    },

    // ── Coercion ──────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'coercion-vocab',
      text: 'What happens when we try to add an integer and a rational? The dispatch table only stores implementations for single types. To add a rational and an integer, we must coerce the integer up the tower to a rational first. A coercion function is a type-to-type converter: integer_to_rational converts make_integer(3) to make_rational(3, 1). The coercion table maps (from_type, to_type) to a conversion function.',
      code: null,
    },
    {
      type: 'narration',
      id: 'coercion-table-code',
      text: 'Here is the coercion table and a generic_add that tries coercion when a direct implementation is not found.',
      code: 'const table = {}, coerce_table = {};\nfunction put(op,t,fn){if(!table[op])table[op]={};table[op][t]=fn;}\nfunction get(op,t){return table[op]&&table[op][t];}\nfunction put_coerce(t1,t2,fn){if(!coerce_table[t1])coerce_table[t1]={};coerce_table[t1][t2]=fn;}\nfunction get_coerce(t1,t2){return coerce_table[t1]&&coerce_table[t1][t2];}\nfunction tag(t,d){return{tag:t,data:d};}\nfunction type_tag(x){return x.tag;}\nfunction contents(x){return x.data;}\nfunction gcd(a,b){return b===0?a:gcd(b,a%b);}\n\nput(\'add\',\'integer\',(x,y)=>tag(\'integer\',x+contents(y)));\nput(\'to_str\',\'integer\',x=>String(x));\nput(\'add\',\'rational\',(x,y)=>{const yc=contents(y);const n=x.n*yc.d+yc.n*x.d,d=x.d*yc.d,g=gcd(Math.abs(n),Math.abs(d));return tag(\'rational\',{n:n/g,d:d/g});});\nput(\'to_str\',\'rational\',x=>`${x.n}/${x.d}`);\n\nfunction make_integer(n){return tag(\'integer\',n);}\nfunction make_rational(n,d){const g=gcd(Math.abs(n),Math.abs(d));return tag(\'rational\',{n:n/g,d:d/g});}\n\n// Register coercions\nput_coerce(\'integer\',\'rational\', x => make_rational(x, 1));\n\nfunction generic_add(x, y) {\n  if (type_tag(x) === type_tag(y)) {\n    return get(\'add\', type_tag(x))(contents(x), y);\n  }\n  // try coercing x to y\'s type\n  const coerce = get_coerce(type_tag(x), type_tag(y));\n  if (coerce) return generic_add(coerce(contents(x)), y);\n  throw new Error(`Cannot add ${type_tag(x)} and ${type_tag(y)}`);\n}\nfunction to_str(x){return get(\'to_str\',type_tag(x))(contents(x));}\n\n// Mix integer and rational — integer gets coerced to rational first\nconsole.log(to_str(generic_add(make_integer(1), make_rational(1,2)))); // 3/2',
    },
    {
      type: 'challenge',
      id: 'challenge-complex-tower',
      text: 'Add a "real" type (a tagged wrapper around a JavaScript number) to the tower. Install add and to_str for "real". Then register a coercion from "rational" to "real" (use n/d to convert). Verify that generic_add(make_rational(1,2), make_real(1.5)) produces a real number equal to 2.',
      expectedOutput: '2',
      startCode: 'const table = {}, coerce_table = {};\nfunction put(op,t,fn){if(!table[op])table[op]={};table[op][t]=fn;}\nfunction get(op,t){return table[op]&&table[op][t];}\nfunction put_coerce(t1,t2,fn){if(!coerce_table[t1])coerce_table[t1]={};coerce_table[t1][t2]=fn;}\nfunction get_coerce(t1,t2){return coerce_table[t1]&&coerce_table[t1][t2];}\nfunction tag(t,d){return{tag:t,data:d};}\nfunction type_tag(x){return x.tag;}\nfunction contents(x){return x.data;}\nfunction gcd(a,b){return b===0?a:gcd(b,a%b);}\n\nput(\'add\',\'rational\',(x,y)=>{const yc=contents(y);const n=x.n*yc.d+yc.n*x.d,d=x.d*yc.d,g=gcd(Math.abs(n),Math.abs(d));return tag(\'rational\',{n:n/g,d:d/g});});\nput(\'to_str\',\'rational\',x=>`${x.n}/${x.d}`);\nfunction make_rational(n,d){const g=gcd(Math.abs(n),Math.abs(d));return tag(\'rational\',{n:n/g,d:d/g});}\n\n// Add "real" type and its coercion from rational here\nfunction make_real(n) { return tag(\'real\', n); }\n\nfunction generic_add(x,y){\n  if(type_tag(x)===type_tag(y))return get(\'add\',type_tag(x))(contents(x),y);\n  const c=get_coerce(type_tag(x),type_tag(y));\n  if(c)return generic_add(c(contents(x)),y);\n  const c2=get_coerce(type_tag(y),type_tag(x));\n  if(c2)return generic_add(x,c2(contents(y)));\n  throw new Error(`Cannot add ${type_tag(x)} and ${type_tag(y)}`);\n}\nfunction to_str(x){return get(\'to_str\',type_tag(x))(contents(x));}\n\n// After adding the real type:\nconsole.log(to_str(generic_add(make_rational(1,2), make_real(1.5)))); // 2\n',
      hint: 'put(\'add\', \'real\', (x, y) => tag(\'real\', x + contents(y)));\nput(\'to_str\', \'real\', x => String(x));\nput_coerce(\'rational\', \'real\', x => make_real(x.n / x.d));',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.trim() === '2'),
    },
    {
      type: 'checkpoint',
      id: 'cp-coercion',
    },
  ],
}
