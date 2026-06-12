export const lesson = {
  id: 'sicp-2-4',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.3  Sequences as Conventional Interfaces',
  checkpoints: [
    { id: 'cp-filter',     label: 'filter' },
    { id: 'cp-accumulate', label: 'accumulate' },
    { id: 'cp-pipeline',   label: 'Pipelines' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'Section 2.2.3 is about seeing a pattern that was invisible. Look at "sum the squares of odd Fibonacci numbers up to fib(10)" and "find the even numbers in a list and multiply them together." They look completely different. But their structure is identical:\n\n  1. Generate a sequence (enumerate)\n  2. Keep some elements (filter)\n  3. Transform each kept element (map)\n  4. Combine the results (accumulate)\n\nIf you can see that structure, you can write both programs using the same four building blocks, just with different functions plugged in. Section 2.2.3 makes this structure explicit.',
      code: null,
    },

    // ── The problem without the pattern ───────────────────────────────────────

    {
      type: 'narration',
      id: 'before-pipeline',
      text: 'Here is sum_odd_squares written without the pipeline pattern — one tangled recursive function that mixes enumeration, filtering, squaring, and accumulation. It works but the structure is invisible.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

// All concerns tangled together
function sum_odd_squares(lst) {
  if (is_null(lst)) return 0;
  const h = head(lst);
  const rest = sum_odd_squares(tail(lst));
  return h % 2 !== 0 ? h * h + rest : rest;
}

console.log(sum_odd_squares(list(1, 2, 3, 4, 5)));  // 1 + 9 + 25 = 35`,
    },

    // ── filter ────────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'filter-vocab',
      text: 'The first pipeline stage is filter. filter takes a predicate and a list and returns only the elements that pass the test. The structure does not change (still a list); only the membership changes. Pattern: if null → null. If head passes → keep it. If head fails → skip it.',
      code: null,
    },
    {
      type: 'narration',
      id: 'filter-build',
      text: 'Build filter. Two recursive branches: include head vs skip head, both recursing on tail.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function display(x) {
  if(x===null)return'nil';if(!is_pair(x))return String(x);
  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return\`(\${a.join(' ')})\`;
}

function filter(pred, lst) {
  if (is_null(lst)) return null;
  if (pred(head(lst)))
    return pair(head(lst), filter(pred, tail(lst)));  // keep
  return filter(pred, tail(lst));                     // skip
}`,
    },
    {
      type: 'narration',
      id: 'filter-demo',
      text: 'Filter with different predicates.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function display(x){if(x===null)return'nil';if(!is_pair(x))return String(x);const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return\`(\${a.join(' ')})\`;}
function filter(pred, lst) {
  if (is_null(lst)) return null;
  if (pred(head(lst))) return pair(head(lst), filter(pred, tail(lst)));
  return filter(pred, tail(lst));
}

const nums = list(1, 2, 3, 4, 5, 6);
console.log(display(filter(x => x % 2 !== 0, nums)));  // (1 3 5)  — odd
console.log(display(filter(x => x > 3,       nums)));  // (4 5 6)  — >3`,
    },
    { type: 'checkpoint', id: 'cp-filter' },

    // ── accumulate ────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'accumulate-vocab',
      text: 'accumulate (also called fold or reduce in other languages) combines all elements of a list into a single value using a binary function and an initial value. accumulate(+, 0, list(1,2,3)) = 1 + 2 + 3 = 6. accumulate(*, 1, list(1,2,3,4)) = 1 * 2 * 3 * 4 = 24.',
      code: null,
    },
    {
      type: 'narration',
      id: 'accumulate-build',
      text: 'Build accumulate. Base case: when the list is null, return the initial value. Recursive case: combine the head with the result of accumulating the tail.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function accumulate(op, initial, lst) {
  if (is_null(lst)) return initial;
  return op(head(lst), accumulate(op, initial, tail(lst)));
}`,
    },
    {
      type: 'narration',
      id: 'accumulate-demo',
      text: 'Sum, product, and max using accumulate.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function accumulate(op, initial, lst) {
  return is_null(lst) ? initial : op(head(lst), accumulate(op, initial, tail(lst)));
}

const nums = list(1, 2, 3, 4, 5);

console.log(accumulate((x, y) => x + y, 0, nums));          // 15  — sum
console.log(accumulate((x, y) => x * y, 1, nums));          // 120 — product
console.log(accumulate((x, y) => x > y ? x : y, 0, nums));  // 5   — max`,
    },
    { type: 'checkpoint', id: 'cp-accumulate' },

    // ── The pipeline pattern ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'enumerate-intro',
      text: 'The last pipeline stage we need: enumerate. This generates the input sequence. For integer ranges: enumerate_interval(a, b) creates the list (a, a+1, ..., b).',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function enumerate_interval(low, high) {
  if (low > high) return null;
  return pair(low, enumerate_interval(low + 1, high));
}

function display(x) {
  if(x===null)return'nil';if(!Array.isArray(x))return String(x);
  const a=[];let c=x;while(Array.isArray(c)){a.push(c[0]);c=c[1];}return\`(\${a.join(' ')})\`;
}

console.log(display(enumerate_interval(1, 7)));  // (1 2 3 4 5 6 7)`,
    },
    {
      type: 'narration',
      id: 'pipeline-assembly',
      text: 'Now assemble all four stages. Define map (from lesson 2-2) as a helper, then build sum_odd_squares as a pipeline. Read it as: generate 1..n → keep odds → square each → add up.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function map(f,lst)       { return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst))); }
function filter(pred,lst) { return is_null(lst)?null:pred(head(lst))?pair(head(lst),filter(pred,tail(lst))):filter(pred,tail(lst)); }
function accumulate(op,init,lst){ return is_null(lst)?init:op(head(lst),accumulate(op,init,tail(lst))); }
function enumerate_interval(a,b){ return a>b?null:pair(a,enumerate_interval(a+1,b)); }

// Pipeline: enumerate → filter → map → accumulate
function sum_odd_squares(n) {
  return accumulate(
    (x, y) => x + y,      // step 4: sum
    0,
    map(
      x => x * x,         // step 3: square
      filter(
        x => x % 2 !== 0, // step 2: keep odds
        enumerate_interval(1, n)  // step 1: generate
      )
    )
  );
}

console.log(sum_odd_squares(5));  // 1 + 9 + 25 = 35
console.log(sum_odd_squares(7));  // 1 + 9 + 25 + 49 = 84`,
    },
    {
      type: 'narration',
      id: 'pipeline-insight',
      text: 'The pipeline version and the tangled version produce identical results. But the pipeline version reveals the structure of the computation: it is a sequence of transformations flowing through data. Each stage is independently understandable and reusable. The filter, map, and accumulate building blocks appear in many different pipelines — they are the SICP equivalent of SQL\'s SELECT, WHERE, and GROUP BY.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-pipeline',
      text: 'Open CodeLens on the pipeline version of sum_odd_squares(5). Watch the intermediate lists appear: enumerate produces (1 2 3 4 5), filter produces (1 3 5), map produces (1 9 25), accumulate folds to 35. At peak, two lists exist simultaneously on the heap — the filter output and the map output.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function map(f,l)   { return is_null(l)?null:pair(f(head(l)),map(f,tail(l))); }
function filter(p,l){ return is_null(l)?null:p(head(l))?pair(head(l),filter(p,tail(l))):filter(p,tail(l)); }
function accumulate(op,i,l){ return is_null(l)?i:op(head(l),accumulate(op,i,tail(l))); }
function enumerate_interval(a,b){ return a>b?null:pair(a,enumerate_interval(a+1,b)); }

function sum_odd_squares(n) {
  return accumulate((x,y) => x+y, 0, map(x => x*x, filter(x => x%2!==0, enumerate_interval(1,n))));
}

console.log(sum_odd_squares(5));`,
    },
    { type: 'checkpoint', id: 'cp-pipeline' },

    {
      type: 'challenge',
      id: 'challenge-pipelines',
      text: 'Using filter, map, accumulate, and enumerate_interval, write:\n(a) product_evens(n) — product of even numbers from 1 to n. product_evens(6) = 2×4×6 = 48.\n(b) count_divisible(lst, k) — count how many elements of lst are divisible by k. count_divisible(list(1..10), 3) = 3.',
      expectedOutput: '48\n3',
      startCode: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function map(f,l)   { return is_null(l)?null:pair(f(head(l)),map(f,tail(l))); }
function filter(p,l){ return is_null(l)?null:p(head(l))?pair(head(l),filter(p,tail(l))):filter(p,tail(l)); }
function accumulate(op,i,l){ return is_null(l)?i:op(head(l),accumulate(op,i,tail(l))); }
function enumerate_interval(a,b){ return a>b?null:pair(a,enumerate_interval(a+1,b)); }

// product_evens(n): product of even numbers 1..n
function product_evens(n) {
  // enumerate → filter evens → accumulate with *
}

// count_divisible(lst, k): count elements divisible by k
function count_divisible(lst, k) {
  // filter → accumulate to count (hint: accumulate((x,acc) => acc+1, 0, filtered))
}

console.log(product_evens(6));                          // 48
console.log(count_divisible(enumerate_interval(1,10), 3)); // 3
`,
      hint: 'function product_evens(n) {\n  return accumulate((x,y)=>x*y, 1, filter(x=>x%2===0, enumerate_interval(1,n)));\n}\nfunction count_divisible(lst, k) {\n  return accumulate((x,acc)=>acc+1, 0, filter(x=>x%k===0, lst));\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof product_evens === 'function' && product_evens(6) === 48`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
