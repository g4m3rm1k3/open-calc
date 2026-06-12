export const lesson = {
  id: 'sicp-2-2',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.1  Sequences and Lists',
  checkpoints: [
    { id: 'cp-list-construction', label: 'Building Lists' },
    { id: 'cp-list-operations',   label: 'List Operations' },
    { id: 'cp-map',               label: 'Map' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Chapter 2.1 gave us pairs — two-slot data containers. But two slots is not very expressive. What if we want to store three things? Or ten? Or a number we do not know until runtime? The answer is already in our hands: a pair can hold another pair. A chain of pairs, each holding one element and pointing to the next, is a list. Lists are not a new data type built into the language — they are just pairs, used in a particular pattern. This lesson builds that pattern from scratch.',
      code: null,
    },

    // ── Building a list manually ──────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'list-as-pairs-vocab',
      text: 'A list of n elements is a chain of n pairs. The first pair holds the first element in its head and a pointer to the rest in its tail. The second pair holds the second element and a pointer to the rest. The last pair holds the last element and null in its tail. Null is the empty list — also called nil. It marks the end of the chain. The predicate is_null(x) returns true when x is null.',
      code: null,
    },
    {
      type: 'narration',
      id: 'list-manual-code',
      text: 'Here is a list of three numbers built from scratch with pair. Each pair holds one number and points to the next. The tail of the third pair is null — the terminator. Run it: the raw structure is [1, [2, [3, null]]] as JavaScript arrays.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\n\nconst nums = pair(1, pair(2, pair(3, null)));\n\nconsole.log(head(nums));              // 1\nconsole.log(head(tail(nums)));        // 2\nconsole.log(head(tail(tail(nums))));  // 3\nconsole.log(is_null(tail(tail(tail(nums))))); // true',
    },
    {
      type: 'narration',
      id: 'list-shorthand-vocab',
      text: 'Building lists with manual pair calls is verbose and error-prone. The list() constructor takes any number of arguments and produces the equivalent pair chain. Internally it uses reduceRight to fold from the right, building the chain inside-out. A display helper converts the raw pair chain back into a readable string like "(1 2 3)" — the traditional Lisp list notation.',
      code: null,
    },
    {
      type: 'narration',
      id: 'list-shorthand-code',
      text: 'Here are list() and display() defined. Try running them with different numbers of arguments — list() with no arguments gives null (the empty list).',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\n\nfunction list(...args) {\n  return args.reduceRight((acc, x) => pair(x, acc), null);\n}\n\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return cur === null ? `(${items.join(\' \')})` : `(${items.join(\' \')} . ${cur})`;\n}\n\nconsole.log(display(list(1, 2, 3, 4, 5))); // (1 2 3 4 5)\nconsole.log(display(list()));               // nil\nconsole.log(display(list(42)));             // (42)',
    },
    {
      type: 'checkpoint',
      id: 'cp-list-construction',
    },

    // ── The recursive list pattern ────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'recursive-pattern-vocab',
      text: 'Every list operation follows the same two-case recursive pattern. Stop and memorise this before writing any code: base case — if the list is null, return the appropriate empty result; recursive case — compute something from the head, then combine it with the result of recursing on the tail. Once you see this pattern, writing length, append, map, or any other list operation is just filling in the two blanks: "what do I do with an empty list?" and "how do I combine the head with the recursive result on the tail?"',
      code: null,
    },
    {
      type: 'narration',
      id: 'length-code',
      text: 'length follows the pattern directly. An empty list has length 0 (base case). A non-empty list has length 1 more than the length of its tail (recursive case). That is all.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction length(lst) {\n  if (is_null(lst)) return 0;         // base case\n  return 1 + length(tail(lst));       // recursive case\n}\n\nconsole.log(length(list(1, 2, 3)));  // 3\nconsole.log(length(list()));          // 0\nconsole.log(length(list(99)));        // 1',
    },
    {
      type: 'narration',
      id: 'list-ref-code',
      text: 'list_ref returns the element at position n (0-indexed). When n is 0, the answer is the head — we have arrived. When n is greater than 0, skip the head and look n-1 positions into the tail.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction list_ref(lst, n) {\n  if (n === 0) return head(lst);           // base case: arrived\n  return list_ref(tail(lst), n - 1);       // recursive case: skip one\n}\n\nconst squares = list(1, 4, 9, 16, 25);\nconsole.log(list_ref(squares, 0)); // 1\nconsole.log(list_ref(squares, 2)); // 9\nconsole.log(list_ref(squares, 4)); // 25',
    },
    {
      type: 'narration',
      id: 'append-code',
      text: 'append joins two lists. When the first list is null, the result is the second list (base case). When it is not, put the head of the first list at the front of the appended result (recursive case).',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items=[]; let cur=x;\n  while(is_pair(cur)){items.push(cur[0]);cur=cur[1];}\n  return `(${items.join(\' \')})` ;\n}\n\nfunction append(list1, list2) {\n  if (is_null(list1)) return list2;              // base case\n  return pair(head(list1), append(tail(list1), list2)); // recursive\n}\n\nconsole.log(display(append(list(1,2), list(3,4,5)))); // (1 2 3 4 5)\nconsole.log(display(append(list(), list(7,8))));      // (7 8)',
    },
    {
      type: 'codelens',
      id: 'codelens-length',
      text: 'Open CodeLens on length(list(1,2,3)). Watch the base/recursive pattern: the call stack grows as we recurse toward null, then the 1+ additions happen on the way back. This is the same expand-then-contract shape as the recursive factorial. The key difference: the input is a list structure, not a number.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction length(lst) {\n  if (is_null(lst)) return 0;\n  return 1 + length(tail(lst));\n}\n\nconsole.log(length(list(1, 2, 3)));',
    },
    {
      type: 'challenge',
      id: 'challenge-last-element',
      text: 'Write last_element(lst) that returns the last element of a non-empty list. Base case: when the tail is null, the head IS the last element. Recursive case: recurse on the tail. last_element(list(1,2,3)) should return 3.',
      expectedOutput: '3\n42\n99',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction last_element(lst) {\n  // base case: is_null(tail(lst)) → return head(lst)\n  // recursive case: last_element(tail(lst))\n}\n\nconsole.log(last_element(list(1, 2, 3))); // 3\nconsole.log(last_element(list(42)));       // 42\nconsole.log(last_element(list(10, 99)));   // 99\n',
      hint: 'function last_element(lst) {\n  if (is_null(tail(lst))) return head(lst);\n  return last_element(tail(lst));\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function is_null(x){return x===null;}function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
${code}
return last_element(list(1,2,3))===3&&last_element(list(42))===42&&last_element(list(10,99))===99`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-list-operations',
    },

    // ── Map ───────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'map-vocab',
      text: 'The map operation is the most important higher-order list operation. It takes a function f and a list, applies f to every element, and returns a new list of the results. The output list has exactly the same length and structure as the input — only the values change. SICP emphasises map not just as a convenience but as an abstraction: it separates the pattern "do something to every element" from the specific "something." code that uses map says what it computes; code that uses a manual loop says how to iterate. The what is clearer.',
      code: null,
    },
    {
      type: 'narration',
      id: 'map-code',
      text: 'map follows the base/recursive pattern. An empty list maps to an empty list. For a non-empty list: apply f to the head, then pair the result with map applied to the tail.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if(x===null)return\'nil\';if(!is_pair(x))return String(x);\n  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})` ;\n}\n\nfunction map(f, lst) {\n  if (is_null(lst)) return null;               // base case\n  return pair(f(head(lst)), map(f, tail(lst))); // recursive case\n}\n\nconsole.log(display(map(x => x * x, list(1, 2, 3, 4)))); // (1 4 9 16)\nconsole.log(display(map(x => x + 10, list(1, 2, 3))));   // (11 12 13)',
    },
    {
      type: 'narration',
      id: 'map-vs-loop',
      text: 'Here is the same computation written two ways. The loop version accumulates results in a while loop with an explicit cursor. The map version is one line. Both produce the same output. The map version reveals the structure of the computation; the loop version hides it behind iteration machinery.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}\n\nconst nums = list(1, 2, 3, 4, 5);\n\n// Loop version — how to compute\nfunction double_loop(lst) {\n  let result = null, cur = lst, arr = [];\n  while (!is_null(cur)) { arr.push(head(cur) * 2); cur = tail(cur); }\n  return arr.reduceRight((acc, x) => pair(x, acc), null);\n}\n\n// Map version — what to compute\nconst double_map = lst => map(x => x * 2, lst);\n\nconsole.log(JSON.stringify(double_loop(nums)));\nconsole.log(JSON.stringify(double_map(nums)));',
    },
    {
      type: 'codelens',
      id: 'codelens-map',
      text: 'Open CodeLens on map(x => x*x, list(1,2,3)). Step through it: each call applies the squaring function to one element, then recurses on the tail. The call stack grows to depth 3 (one per element), then unwinds — building the result list from back to front as each frame returns.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction map(f, lst) {\n  if (is_null(lst)) return null;\n  return pair(f(head(lst)), map(f, tail(lst)));\n}\n\nconsole.log(JSON.stringify(map(x => x * x, list(1, 2, 3))));',
    },
    {
      type: 'challenge',
      id: 'challenge-scale-list',
      text: 'Write scale_list(lst, factor) that multiplies every element of lst by factor. Use map — do not write a recursive function yourself. scale_list(list(1,2,3), 10) should produce a list equal to list(10,20,30).',
      expectedOutput: '(10 20 30)\n(2 4 6 8)',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if(x===null)return\'nil\';if(!is_pair(x))return String(x);\n  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})` ;\n}\nfunction map(f, lst) {\n  return is_null(lst) ? null : pair(f(head(lst)), map(f, tail(lst)));\n}\n\n// Write scale_list using map\nfunction scale_list(lst, factor) {\n  // one line\n}\n\nconsole.log(display(scale_list(list(1,2,3), 10)));   // (10 20 30)\nconsole.log(display(scale_list(list(1,2,3,4), 2)));  // (2 4 6 8)\n',
      hint: 'function scale_list(lst, factor) {\n  return map(x => x * factor, lst);\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function is_null(x){return x===null;}function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}
${code}
const r=scale_list(list(1,2,3),10);
return head(r)===10&&head(tail(r))===20&&head(tail(tail(r)))===30`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'challenge',
      id: 'challenge-reverse',
      text: 'Write reverse(lst) that returns a new list with the elements in reverse order. It can use append — pair the recursive reverse of the tail with a singleton list containing the head: append(reverse(tail), list(head)). reverse(list(1,2,3)) should return a list equal to list(3,2,1).',
      expectedOutput: '(3 2 1)\n(5 4 3 2 1)',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}\nfunction display(x) {\n  if(x===null)return\'nil\';if(!is_pair(x))return String(x);\n  const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})` ;\n}\n\nfunction reverse(lst) {\n  // base: is_null(lst) → null\n  // recursive: append(reverse(tail), list(head))\n}\n\nconsole.log(display(reverse(list(1,2,3))));    // (3 2 1)\nconsole.log(display(reverse(list(1,2,3,4,5)))); // (5 4 3 2 1)\n',
      hint: 'function reverse(lst) {\n  if (is_null(lst)) return null;\n  return append(reverse(tail(lst)), list(head(lst)));\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function is_null(x){return x===null;}function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}
${code}
const r=reverse(list(1,2,3));
return head(r)===3&&head(tail(r))===2&&head(tail(tail(r)))===1`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-map',
    },
  ],
}
