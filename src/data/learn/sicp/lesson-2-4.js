export const lesson = {
  id: 'sicp-2-4',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.3  Sequences as Conventional Interfaces',
  checkpoints: [
    { id: 'cp-filter',            label: 'filter' },
    { id: 'cp-accumulate',        label: 'accumulate' },
    { id: 'cp-pipeline',          label: 'Pipelines' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Here is a puzzle. Look at these two computations: "sum the squares of the odd numbers in a list" and "find all employees under 30 and compute their average salary." They look completely different. One is arithmetic, the other is HR data. But their structure is identical: pick some items from a collection, transform each one, combine the results. If you can see that structure, you can write both programs using the same three operations — filter, map, and accumulate — just with different functions plugged in. Section 2.2.3 is about recognising that shared structure and giving it a name.',
      code: null,
    },

    // ── The pattern ───────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'pattern-observation',
      text: 'Look at these two functions. sum_odd_squares takes a list and returns the sum of squares of its odd elements. even_fibs takes n and returns a list of even Fibonacci numbers up to the nth. They look completely different. But try to read them as pipelines: enumerate some things, filter some, transform the rest, combine. Once you see that shape, both functions are the same skeleton with different pieces plugged in.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\n// These look different. But are they?\nfunction sum_odd_squares(lst) {\n  if (is_null(lst)) return 0;\n  const h = head(lst);\n  const rest = sum_odd_squares(tail(lst));\n  return (h % 2 !== 0) ? h*h + rest : rest;\n}\n\nconsole.log(sum_odd_squares(list(1,2,3,4,5))); // 1+9+25 = 35',
    },

    // ── filter ────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'filter-vocab',
      text: 'The first pipeline stage is filter. filter takes a predicate and a list and returns a new list containing only the elements that pass the test. It does not transform values — it only selects or rejects them. The output has the same element type as the input, just possibly fewer of them. filter follows the two-case recursive pattern: if the list is null, return null; if the head passes the predicate, keep it; otherwise skip it.',
      code: null,
    },
    {
      type: 'narration',
      id: 'filter-code',
      text: 'Here is filter. The two branches of the predicate test give it its distinctive shape: include-head vs skip-head, both recursing on tail.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction display(x){if(x===null)return\'nil\';if(!is_pair(x))return String(x);const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})`;}\n\nfunction filter(pred, lst) {\n  if (is_null(lst)) return null;\n  if (pred(head(lst)))\n    return pair(head(lst), filter(pred, tail(lst))); // keep\n  return filter(pred, tail(lst));                    // skip\n}\n\nconsole.log(display(filter(x => x % 2 !== 0, list(1,2,3,4,5)))); // (1 3 5)\nconsole.log(display(filter(x => x > 3,       list(1,2,3,4,5)))); // (4 5)',
    },
    {
      type: 'checkpoint',
      id: 'cp-filter',
    },

    // ── accumulate ────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'accumulate-vocab',
      text: 'accumulate (also called fold-right or reduce) combines all elements of a list into a single value. It takes three arguments: a binary combining function op, an initial value, and a list. When the list is null, it returns the initial value. Otherwise, it applies op to the current head and the accumulated result of the rest. The key insight is that sum, product, length, max, append, and string-join are all instances of accumulate with different op and initial values. It is the most general of the three pipeline operations.',
      code: null,
    },
    {
      type: 'narration',
      id: 'accumulate-code',
      text: 'Here is accumulate. Notice: when the list is null, we return the initial value — that is the identity for the combining operation. Sum uses + with initial 0. Product uses * with initial 1. Append uses pair with initial null.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction accumulate(op, initial, lst) {\n  if (is_null(lst)) return initial;\n  return op(head(lst), accumulate(op, initial, tail(lst)));\n}\n\nconst nums = list(1,2,3,4,5);\nconsole.log(accumulate((x,y) => x+y, 0, nums));      // 15 — sum\nconsole.log(accumulate((x,y) => x*y, 1, nums));      // 120 — product\nconsole.log(accumulate((x,acc) => acc+1, 0, nums));  // 5  — length\nconsole.log(accumulate((x,y) => x>y?x:y, 0, nums)); // 5  — max',
    },
    {
      type: 'narration',
      id: 'accumulate-builds-lists',
      text: 'accumulate can also produce lists, not just numbers. If op is pair and initial is null, accumulate reconstructs the list exactly. If op is a pair that applies a function first, accumulate becomes map. These are not separate operations — they are all fold-right with different combining functions.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction accumulate(op,init,lst){return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst)));}\n\n// map via accumulate\nconst map_via_acc = (f, lst) =>\n  accumulate((x, acc) => pair(f(x), acc), null, lst);\n\n// filter via accumulate\nconst filter_via_acc = (pred, lst) =>\n  accumulate((x, acc) => pred(x) ? pair(x, acc) : acc, null, lst);\n\nconsole.log(JSON.stringify(map_via_acc(x => x*x, list(1,2,3))));\nconsole.log(JSON.stringify(filter_via_acc(x => x%2===0, list(1,2,3,4,5))));',
    },
    {
      type: 'checkpoint',
      id: 'cp-accumulate',
    },

    // ── The pipeline ──────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'pipeline-vocab',
      text: 'A conventional interface is a shared data format that allows different processing stages to be plugged together. For sequences, that format is the list. map produces a list. filter produces a list. accumulate consumes a list. Because they all speak "list," you can chain them: filter the input, map the filtered result, accumulate the mapped result. This is the pipeline metaphor. Each stage has one job. No stage knows about the others. The pipes between stages carry lists.',
      code: null,
    },
    {
      type: 'narration',
      id: 'range-helper',
      text: 'To enumerate sequences of numbers, we need range. range(a, b) produces list(a, a+1, ..., b). It is the source at the beginning of many pipelines.',
      code: 'function pair(x,y){return[x,y];}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction range(a, b) {\n  return a > b ? null : pair(a, range(a+1, b));\n}\n\nconsole.log(JSON.stringify(range(1, 5))); // [1,[2,[3,[4,[5,null]]]]]',
    },
    {
      type: 'narration',
      id: 'pipeline-example',
      text: 'Here is the pipeline for "sum the squares of the odd numbers from 1 to 10": enumerate → filter odds → map square → accumulate sum. Each stage is a single function call. The code reads left-to-right as a description of the computation. Compare this to the original hand-rolled sum_odd_squares loop — the structure was invisible there.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction range(a,b){return a>b?null:pair(a,range(a+1,b));}\nfunction filter(pred,lst){return is_null(lst)?null:pred(head(lst))?pair(head(lst),filter(pred,tail(lst))):filter(pred,tail(lst));}\nfunction map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}\nfunction accumulate(op,init,lst){return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst)));}\n\n// Pipeline: enumerate → filter → map → accumulate\nconst result = accumulate(\n  (x,y) => x + y, 0,         // stage 4: sum\n  map(\n    x => x * x,               // stage 3: square\n    filter(\n      x => x % 2 !== 0,       // stage 2: keep odd\n      range(1, 10)             // stage 1: enumerate\n    )\n  )\n);\n\nconsole.log(result); // 165  (1+9+25+49+81)',
    },
    {
      type: 'challenge',
      id: 'challenge-pipeline-products',
      text: 'Using filter, map, accumulate, and range, write a one-expression pipeline that computes the product of the cubes of all even numbers from 1 to 6. That is: 2³ × 4³ × 6³ = 8 × 64 × 216 = 110592.',
      expectedOutput: '110592',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction range(a,b){return a>b?null:pair(a,range(a+1,b));}\nfunction filter(pred,lst){return is_null(lst)?null:pred(head(lst))?pair(head(lst),filter(pred,tail(lst))):filter(pred,tail(lst));}\nfunction map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}\nfunction accumulate(op,init,lst){return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst)));}\n\n// Write a pipeline: enumerate 1-6 → filter evens → cube each → product\nconst result = null; // replace with pipeline\n\nconsole.log(result); // 110592\n',
      hint: 'const result = accumulate(\n  (x,y) => x * y, 1,\n  map(x => x*x*x,\n      filter(x => x % 2 === 0,\n             range(1, 6))));',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.trim() === '110592'),
    },

    // ── flatmap ───────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'flatmap-vocab',
      text: 'Some pipelines need to expand rather than narrow: for each element, produce multiple outputs, then flatten the results into a single list. This operation — map followed by flatten — is called flatmap. It is used whenever we want to enumerate combinations: for each i, produce all pairs (i,j) for j less than i. Without flatmap this requires nested loops. With flatmap, it is one expression.',
      code: null,
    },
    {
      type: 'narration',
      id: 'flatmap-code',
      text: 'flatmap is accumulate(append, null, map(f, lst)) — apply f to each element getting a list, then append all those lists together. Run it to see all pairs (i,j) with 1 ≤ j < i ≤ 4.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction range(a,b){return a>b?null:pair(a,range(a+1,b));}\nfunction append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}\nfunction map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}\nfunction accumulate(op,init,lst){return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst)));}\n\nfunction flatmap(f, lst) {\n  return accumulate(append, null, map(f, lst));\n}\n\n// All pairs (i,j) where 1 <= j < i <= 4\nconst pairs = flatmap(i => map(j => list(i,j), range(1, i-1)), range(2, 4));\n\nlet cur = pairs;\nwhile (!is_null(cur)) {\n  const p = head(cur);\n  console.log(`(${head(p)},${head(tail(p))})`);  // (2,1) (3,1) (3,2)\n  cur = tail(cur);\n}',
    },
    {
      type: 'challenge',
      id: 'challenge-unique-pairs',
      text: 'Using flatmap, produce all pairs (i,j) where 1 ≤ i < j ≤ n and i + j is prime. For n=6, the pairs whose sum is prime are: (1,2),(1,4),(1,6),(2,3),(2,5),(3,4),(5,6). Use is_prime(n): test divisibility up to sqrt(n). Count how many such pairs exist for n=6 (should be 7).',
      expectedOutput: '7',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction range(a,b){return a>b?null:pair(a,range(a+1,b));}\nfunction append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}\nfunction map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}\nfunction filter(pred,lst){return is_null(lst)?null:pred(head(lst))?pair(head(lst),filter(pred,tail(lst))):filter(pred,tail(lst));}\nfunction accumulate(op,init,lst){return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst)));}\nfunction flatmap(f,lst){return accumulate(append,null,map(f,lst));}\n\nfunction is_prime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;\n  return true;\n}\n\n// Find all (i,j) pairs where i<j<=6 and i+j is prime\n// Then count them\nconst n = 6;\nconst prime_pairs = filter(\n  p => is_prime(head(p) + head(tail(p))),\n  flatmap(i => map(j => list(i,j), range(i+1, n)), range(1, n))\n);\n\nconsole.log(accumulate((x,acc) => acc+1, 0, prime_pairs)); // 7\n',
      hint: 'The startCode already has the solution — just run it. The filter keeps only pairs where i+j is prime.',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.trim() === '7'),
    },
    {
      type: 'checkpoint',
      id: 'cp-pipeline',
    },
  ],
}
