export const lesson = {
  id: 'sicp-2-4',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.3  Sequences as Conventional Interfaces',
  checkpoints: [
    { id: 'cp-filter-accumulate', label: 'filter & accumulate' },
    { id: 'cp-pipeline',          label: 'Signal Pipelines' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 2.2.3 makes a subtle but powerful point. Many programs that look different are secretly the same computation expressed in different ways — they enumerate a sequence, transform elements, filter some out, and combine the results. When we recognise this pattern, we can express any such program as a pipeline of three operations: map, filter, and accumulate. This is one of the most important conceptual contributions of SICP.',
      code: null,
    },

    // ── Terminology: Conventional Interfaces ──────────────────────────────────────
    {
      type: 'narration',
      id: 'conventional-interface-vocab',
      text: 'A conventional interface is a shared data format that lets modular pieces plug together. For list processing, that format is the sequence. map produces a sequence. filter produces a sequence. accumulate consumes a sequence. Because they all speak "sequence," you can chain them freely — the output of one is the input of the next. This is the pipeline metaphor: data flows through a series of transformations, each one focused on a single job.',
      code: null,
    },

    // ── filter ────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'filter-intro',
      text: 'filter takes a predicate and a list and returns a new list containing only the elements that satisfy the predicate. Like map, it follows the base-case/recursive pattern. If the head satisfies the predicate, include it; otherwise skip it. Always recurse on the tail.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return `(${items.join(\' \')})` ;\n}\n\nfunction filter(pred, lst) {\n  if (is_null(lst)) return null;\n  if (pred(head(lst)))                         // head passes the test\n    return pair(head(lst), filter(pred, tail(lst)));\n  return filter(pred, tail(lst));              // head fails — skip it\n}\n\nconsole.log(display(filter(x => x % 2 === 0, list(1,2,3,4,5,6)))); // (2 4 6)\nconsole.log(display(filter(x => x > 3,       list(1,2,3,4,5))));   // (4 5)',
    },

    // ── accumulate ────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'accumulate-vocab',
      text: 'Accumulate (also called fold or reduce) combines all elements of a list into a single value using a binary function and an initial value. It is the most general of the three operations: sum, product, max, append, and counting are all instances of accumulate with different combining functions. The initial value is returned when the list is empty. Each recursive step applies the combining function to the current head and the accumulated result of the tail.',
      code: null,
    },
    {
      type: 'narration',
      id: 'accumulate-op',
      text: 'Here is accumulate. When the list is null, return the initial value. Otherwise, combine the head with the accumulation of the tail. Run it — sum, product, and max are all one call each.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction accumulate(op, initial, lst) {\n  if (is_null(lst)) return initial;\n  return op(head(lst), accumulate(op, initial, tail(lst)));\n}\n\nconst nums = list(1, 2, 3, 4, 5);\n\nconsole.log(accumulate((x, y) => x + y, 0, nums));                   // 15  — sum\nconsole.log(accumulate((x, y) => x * y, 1, nums));                   // 120 — product\nconsole.log(accumulate((x, y) => x > y ? x : y, 0, nums));           // 5   — max\nconsole.log(accumulate((x, acc) => acc + 1,      0, nums));          // 5   — length!',
    },
    {
      type: 'codelens',
      id: 'codelens-accumulate',
      text: 'Open CodeLens on accumulate with addition. Watch how the recursion bottoms out at null returning 0, then the additions happen on the way back up: 5+(4+(3+(2+(1+0)))). This right-fold structure is why accumulate is also called fold-right.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction accumulate(op, initial, lst) {\n  if (is_null(lst)) return initial;\n  return op(head(lst), accumulate(op, initial, tail(lst)));\n}\n\nconsole.log(accumulate((x, y) => x + y, 0, list(1, 2, 3, 4, 5)));',
    },
    {
      type: 'challenge',
      id: 'challenge-filter-accumulate',
      text: 'Write sum_odd_squares(lst) that returns the sum of the squares of the odd numbers in lst. Use filter (to keep odds), then map (to square), then accumulate (to sum). sum_odd_squares(list(1,2,3,4,5)) should be 1+9+25 = 35.',
      expectedOutput: '35\n14',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction filter(pred, lst) {\n  if (is_null(lst)) return null;\n  return pred(head(lst)) ? pair(head(lst), filter(pred, tail(lst)))\n                         : filter(pred, tail(lst));\n}\nfunction map(f, lst) {\n  return is_null(lst) ? null : pair(f(head(lst)), map(f, tail(lst)));\n}\nfunction accumulate(op, initial, lst) {\n  return is_null(lst) ? initial : op(head(lst), accumulate(op, initial, tail(lst)));\n}\n\n// Write sum_odd_squares(lst) using filter → map → accumulate\nfunction sum_odd_squares(lst) {\n  // your code here\n}\n\nconsole.log(sum_odd_squares(list(1, 2, 3, 4, 5)));  // 35  (1+9+25)\nconsole.log(sum_odd_squares(list(1, 2, 3)));        // 10  (1+9)\n',
      hint: 'function sum_odd_squares(lst) {\n  return accumulate(\n    (x, y) => x + y, 0,\n    map(x => x * x,\n        filter(x => x % 2 !== 0, lst)));\n}',
      tests: [
        { call: 'sum_odd_squares(list(1,2,3,4,5))', expected: 35 },
        { call: 'sum_odd_squares(list(1,2,3))',      expected: 10 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function filter(pred,lst){return is_null(lst)?null:pred(head(lst))?pair(head(lst),filter(pred,tail(lst))):filter(pred,tail(lst));}
function map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}
function accumulate(op,init,lst){return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst)));}
${code}
return typeof sum_odd_squares==='function'&&sum_odd_squares(list(1,2,3,4,5))===35&&sum_odd_squares(list(1,2,3))===10`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-filter-accumulate',
    },

    // ── Signal pipelines ──────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'pipeline-vocab',
      text: 'The signal processing analogy helps clarify the pipeline idea. Think of the list as a signal — a stream of values flowing through a series of transducers. Each transducer is a function: map transforms every signal value, filter gates values on/off, accumulate collapses the stream into one value. Written in this style, the program reads like a description of the computation rather than a description of how to do it. The same problem expressed as nested loops looks nothing like what it is computing.',
      code: null,
    },
    {
      type: 'narration',
      id: 'pipeline-example',
      text: 'Here is the same computation expressed as a pipeline versus as a loop. Both sum the squares of even numbers from 1 to 10. The pipeline version reads left-to-right as a description. The loop version forces you to mentally trace state variables. This is why functional programmers prefer pipelines.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction filter(pred, lst) {\n  return is_null(lst) ? null :\n    pred(head(lst)) ? pair(head(lst), filter(pred, tail(lst)))\n                    : filter(pred, tail(lst));\n}\nfunction map(f, lst) {\n  return is_null(lst) ? null : pair(f(head(lst)), map(f, tail(lst)));\n}\nfunction accumulate(op, init, lst) {\n  return is_null(lst) ? init : op(head(lst), accumulate(op, init, tail(lst)));\n}\n\n// Build the range 1..10\nfunction range(a, b) {\n  return a > b ? null : pair(a, range(a + 1, b));\n}\n\n// Pipeline: enumerate → filter → map → accumulate\nconst pipeline_result =\n  accumulate((x, y) => x + y, 0,\n    map(x => x * x,\n      filter(x => x % 2 === 0, range(1, 10))));\n\nconsole.log(pipeline_result); // 220  (4+16+36+64+100)',
    },
    {
      type: 'challenge',
      id: 'challenge-flatmap',
      text: 'flatmap maps a function over a list and then flattens one level of nesting. It is often used to enumerate pairs or combinations. Define flatmap(f, lst) as accumulate(append, null, map(f, lst)). Then use it to list all pairs (i, j) where 1 ≤ j < i ≤ 3: flatmap(i => map(j => list(i, j), range(1, i-1)), range(1, 3)) should give ((2 1) (3 1) (3 2)).',
      expectedOutput: '(2 1)\n(3 1)\n(3 2)',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction append(l1, l2) {\n  return is_null(l1) ? l2 : pair(head(l1), append(tail(l1), l2));\n}\nfunction map(f, lst) {\n  return is_null(lst) ? null : pair(f(head(lst)), map(f, tail(lst)));\n}\nfunction accumulate(op, init, lst) {\n  return is_null(lst) ? init : op(head(lst), accumulate(op, init, tail(lst)));\n}\nfunction filter(pred, lst) {\n  return is_null(lst) ? null : pred(head(lst)) ? pair(head(lst), filter(pred, tail(lst))) : filter(pred, tail(lst));\n}\nfunction range(a, b) {\n  return a > b ? null : pair(a, range(a + 1, b));\n}\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return `(${items.join(\' \')})` ;\n}\n\n// flatmap: accumulate(append, null, map(f, lst))\nfunction flatmap(f, lst) {\n  // your code here\n}\n\nconst pairs = flatmap(i => map(j => list(i, j), range(1, i-1)), range(1, 3));\n\n// Print each pair on its own line\nlet cur = pairs;\nwhile (!is_null(cur)) {\n  console.log(display(head(cur)));\n  cur = tail(cur);\n}\n',
      hint: 'function flatmap(f, lst) {\n  return accumulate(append, null, map(f, lst));\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}
function map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}
function accumulate(op,init,lst){return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst)));}
function range(a,b){return a>b?null:pair(a,range(a+1,b));}
${code}
const result = flatmap(i=>map(j=>list(i,j),range(1,i-1)),range(1,3));
// should be ((2 1) (3 1) (3 2)) — 3 pairs
const h1=head(result); const h2=head(tail(result)); const h3=head(tail(tail(result)));
return typeof flatmap==='function'&&head(h1)===2&&head(tail(h1))===1&&head(h2)===3&&head(h3)===3&&head(tail(h3))===2`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-pipeline',
    },
  ],
}
