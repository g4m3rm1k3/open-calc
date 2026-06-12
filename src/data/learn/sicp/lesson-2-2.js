export const lesson = {
  id: 'sicp-2-2',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.1  Sequences and Lists',
  checkpoints: [
    { id: 'cp-list-structure', label: 'List Structure' },
    { id: 'cp-list-ops',       label: 'List Operations' },
    { id: 'cp-map',            label: 'Map' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // Introduction
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'A pair holds two things. That is useful but limited. What if you need to store ten things? Or a hundred? Or a number you do not know until runtime? The answer is already in your hands: a pair can hold another pair. A chain of pairs — each holding one value and pointing to the next — is a list. Lists are not a new data type built into the language; they are just pairs used in a particular pattern.\n\nThis lesson builds that pattern from scratch and then shows the single most important operation on lists: map.',
      code: null,
    },

    // ══════════════════════════════════════════════════════════════════════════
    // Building a list
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'list-primitives',
      text: 'Start with the four list primitives. pair, head, and tail are familiar. is_null tests whether something is the empty list (null — the terminator at the end of every list).',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }`,
    },
    {
      type: 'narration',
      id: 'list-manual',
      text: 'Build the list [1, 2, 3] manually from pairs. The first pair holds 1 and points to the next pair. The second holds 2 and points to the third. The third holds 3 and points to null — the empty list, the terminator.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }

const nums = pair(1, pair(2, pair(3, null)));

// Navigate the chain
console.log(head(nums));              // 1
console.log(head(tail(nums)));        // 2
console.log(head(tail(tail(nums))));  // 3
console.log(is_null(tail(tail(tail(nums)))));  // true — end of list`,
    },
    {
      type: 'narration',
      id: 'list-shorthand-vocab',
      text: 'Writing pair(1, pair(2, pair(3, null))) for every list is tedious. The list() constructor takes any number of arguments and builds the pair chain for you. It uses reduceRight to fold from the right — building pair(3, null) first, then pair(2, ...), then pair(1, ...).',
      code: null,
    },
    {
      type: 'narration',
      id: 'list-constructor',
      text: 'Add list() and a display helper. display converts the pair chain back into readable "(1 2 3)" notation.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }

function list(...args) {
  return args.reduceRight((acc, x) => pair(x, acc), null);
}

function display(x) {
  if (x === null) return 'nil';
  if (!is_pair(x)) return String(x);
  const items = [];
  let cur = x;
  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }
  return cur === null ? \`(\${items.join(' ')})\` : \`(\${items.join(' ')} . \${cur})\`;
}`,
    },
    {
      type: 'narration',
      id: 'list-use',
      text: 'Test list() with different arguments.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function display(x) {
  if(x===null)return'nil';if(!is_pair(x))return String(x);
  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}
  return \`(\${a.join(' ')})\`;
}

console.log(display(list(1, 2, 3, 4, 5)));  // (1 2 3 4 5)
console.log(display(list('a', 'b', 'c')));  // (a b c)
console.log(display(list())));               // nil  — empty list`,
    },
    { type: 'checkpoint', id: 'cp-list-structure' },

    // ══════════════════════════════════════════════════════════════════════════
    // The two-case recursive pattern
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'recursive-pattern-vocab',
      text: 'Every list operation follows the same two-case pattern. Memorise this before writing any list code — it is the template for length, append, map, filter, and everything else:\n\n  Base case:     if the list is null, return the appropriate empty result\n  Recursive case: compute something from head, then combine it with the result of recursing on tail\n\nOnce you see this pattern, writing any list function is just filling in two blanks:\n  1. What should I return for an empty list?\n  2. How do I combine the head with the recursive result?',
      code: null,
    },

    // ── length ────────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'length-intro',
      text: 'length follows the pattern directly. For an empty list, the length is 0. For a non-empty list, the length is 1 plus the length of the tail.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function length(lst) {
  if (is_null(lst)) return 0;       // base case: empty list has length 0
  return 1 + length(tail(lst));     // recursive case: 1 + length of tail
}

console.log(length(list(1, 2, 3)));  // 3
console.log(length(list()));          // 0
console.log(length(list(99)));        // 1`,
    },

    // ── list_ref ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'list-ref-code',
      text: 'list_ref returns the nth element (0-indexed). When n is 0, we have arrived — return head. When n > 0, skip the head and look n-1 positions into the tail.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function list_ref(lst, n) {
  if (n === 0) return head(lst);           // arrived at position 0
  return list_ref(tail(lst), n - 1);       // skip one, look n-1 deeper
}

const squares = list(1, 4, 9, 16, 25);
console.log(list_ref(squares, 0));  // 1
console.log(list_ref(squares, 2));  // 9
console.log(list_ref(squares, 4));  // 25`,
    },

    // ── append ────────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'append-code',
      text: 'append joins two lists. Base case: if list1 is null, the result is list2 (nothing to prepend). Recursive case: put the head of list1 at the front of the appended result.',
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

function append(list1, list2) {
  if (is_null(list1)) return list2;                         // base case
  return pair(head(list1), append(tail(list1), list2));     // recursive
}

console.log(display(append(list(1,2), list(3,4,5)))); // (1 2 3 4 5)
console.log(display(append(list(), list(7,8))));      // (7 8)`,
    },
    {
      type: 'codelens',
      id: 'codelens-length',
      text: 'Open CodeLens on length(list(1,2,3)). Watch the two-phase pattern: the call stack grows as the recursion reaches null (3 frames → base case), then the additions 1+1+1+0 resolve on the way back. This is the linear recursive process shape from lesson 1-3, applied to list structure instead of numbers.',
      code: `function pair(x, y) { return [x, y]; }
function head(p) { return p[0]; }
function tail(p) { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function length(lst) {
  if (is_null(lst)) return 0;
  return 1 + length(tail(lst));
}

console.log(length(list(1, 2, 3)));`,
    },
    { type: 'checkpoint', id: 'cp-list-ops' },

    {
      type: 'challenge',
      id: 'challenge-last',
      text: 'Write last_element(lst) that returns the last element of a non-empty list. Base case: when the tail is null, the head IS the last element. Recursive case: recurse on the tail. last_element(list(1,2,3)) = 3.',
      expectedOutput: '3\n42\n99',
      startCode: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

// last_element: base case is_null(tail(lst)) → return head(lst)
//               recursive case: last_element(tail(lst))
function last_element(lst) {
  // your code
}

console.log(last_element(list(1, 2, 3)));  // 3
console.log(last_element(list(42)));        // 42
console.log(last_element(list(10, 99)));    // 99
`,
      hint: 'function last_element(lst) {\n  if (is_null(tail(lst))) return head(lst);\n  return last_element(tail(lst));\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nreturn typeof last_element === 'function' && last_element(list(1,2,3))===3 && last_element(list(42))===42`)
          return fn() === true
        } catch { return false }
      },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // Map — the most important list operation
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'map-vocab',
      text: 'Map is the most important higher-order list operation. It takes a function f and a list, applies f to every element, and returns a new list of the results. The output has exactly the same length as the input — only the values change.\n\nSICP emphasises map not just as a convenience but as an abstraction: it separates the pattern "do something to every element" from the specific "something." Code that uses map says WHAT it computes; code that manually recurses says HOW to iterate. The what is clearer and easier to reason about.',
      code: null,
    },
    {
      type: 'narration',
      id: 'map-build',
      text: 'Map follows the two-case pattern. An empty list maps to an empty list. For a non-empty list: apply f to the head, then pair the result with map applied to the tail.',
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

function map(f, lst) {
  if (is_null(lst)) return null;                         // base case
  return pair(f(head(lst)), map(f, tail(lst)));          // recursive
}`,
    },
    {
      type: 'narration',
      id: 'map-demo',
      text: 'Apply map with different functions. Each call transforms all elements without changing the structure.',
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
function map(f, lst) {
  return is_null(lst) ? null : pair(f(head(lst)), map(f, tail(lst)));
}

const nums = list(1, 2, 3, 4, 5);

console.log(display(map(x => x * x,  nums)));  // (1 4 9 16 25)
console.log(display(map(x => x + 10, nums)));  // (11 12 13 14 15)
console.log(display(map(x => x % 2 === 0, nums))); // (false true false true false)`,
    },
    {
      type: 'narration',
      id: 'map-vs-manual',
      text: 'Compare map to a manual recursive version that squares each element. Both produce identical output. The map version says: "square every element." The manual version says: "if the list is empty do this, otherwise do that." The map version describes the computation at a higher level of abstraction.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function map(f,lst) { return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst))); }

const nums = list(1, 2, 3, 4, 5);

// Manual recursion: describes HOW to iterate
function square_list_manual(lst) {
  if (is_null(lst)) return null;
  return pair(head(lst) * head(lst), square_list_manual(tail(lst)));
}

// Map: describes WHAT to compute
const square_list_map = lst => map(x => x * x, lst);

console.log(JSON.stringify(square_list_manual(nums)));
console.log(JSON.stringify(square_list_map(nums)));
// Identical output — very different clarity`,
    },
    {
      type: 'codelens',
      id: 'codelens-map',
      text: 'Open CodeLens on map(x => x*x, list(1,2,3)). Watch the call stack grow as the recursion walks to the end of the list, then unwind as each pair is built on the way back — the result list is assembled from right to left. The heap at peak has both the input list and the partially-built output list simultaneously.',
      code: `function pair(x, y) { return [x, y]; }
function head(p) { return p[0]; }
function tail(p) { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function map(f, lst) {
  if (is_null(lst)) return null;
  return pair(f(head(lst)), map(f, tail(lst)));
}

console.log(JSON.stringify(map(x => x * x, list(1, 2, 3))));`,
    },
    { type: 'checkpoint', id: 'cp-map' },

    {
      type: 'challenge',
      id: 'challenge-scale-list',
      text: 'Write scale_list(lst, factor) using map. Multiply every element by factor. scale_list(list(1,2,3), 10) should give a list equal to list(10,20,30). Then write reverse(lst) that returns a new list in reversed order. Use append: append(reverse(tail), list(head)). reverse(list(1,2,3)) = (3 2 1).',
      expectedOutput: '(10 20 30)\n(3 2 1)',
      startCode: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function map(f,lst) { return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst))); }
function append(l1,l2){ return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2)); }
function display(x) {
  if(x===null)return'nil';if(!is_pair(x))return String(x);
  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return\`(\${a.join(' ')})\`;
}

// scale_list: use map with a lambda
function scale_list(lst, factor) {
  return map(/* x => ??? */, lst);
}

// reverse: base is_null(lst) → null
//          recursive: append(reverse(tail(lst)), list(head(lst)))
function reverse(lst) {
  // your code
}

console.log(display(scale_list(list(1, 2, 3), 10)));  // (10 20 30)
console.log(display(reverse(list(1, 2, 3))));         // (3 2 1)
`,
      hint: 'function scale_list(lst, factor) {\n  return map(x => x * factor, lst);\n}\nfunction reverse(lst) {\n  if (is_null(lst)) return null;\n  return append(reverse(tail(lst)), list(head(lst)));\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst r=reverse(list(1,2,3));return head(r)===3&&head(tail(r))===2&&head(tail(tail(r)))===1`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
