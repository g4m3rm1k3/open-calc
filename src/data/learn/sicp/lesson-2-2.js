export const lesson = {
  id: 'sicp-2-2',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.1  Sequences and Lists',
  checkpoints: [
    { id: 'cp-list-construction', label: 'Building Lists' },
    { id: 'cp-list-operations',   label: 'List Operations' },
    { id: 'cp-list-map',          label: 'Map' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 2.2 introduces sequences — ordered collections of items. The central data structure is the list, built from the pairs we saw in Chapter 2.1. Lists are the backbone of SICP\'s approach to data: simple enough to define from pairs, powerful enough to represent trees, tables, expression trees, and programs themselves.',
      code: null,
    },

    // ── Terminology: Sequences & Lists ────────────────────────────────────────────
    {
      type: 'narration',
      id: 'sequence-vocab',
      text: 'A sequence is an ordered collection of values where position matters. A list is SICP\'s representation of a sequence built from pairs. Each pair holds one element in its head, and a pointer to the rest of the list in its tail. The list ends with null — the empty list, also called nil. This is called a null-terminated linked list, or a cons cell chain. The predicate is_null(x) returns true when x is null, signalling the end of the list.',
      code: null,
    },

    // ── 2.2.1  Building lists ─────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'list-manual',
      text: 'Here is a list of three numbers built manually from pairs. Each pair holds one number and points to the next pair. The last pair\'s tail is null — the terminator. Run it and look at the raw structure: [1, [2, [3, null]]].',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\n\nconst ones = pair(1, pair(2, pair(3, null)));\n\nconsole.log(head(ones));             // 1\nconsole.log(head(tail(ones)));       // 2\nconsole.log(head(tail(tail(ones)))); // 3\nconsole.log(is_null(tail(tail(tail(ones))))); // true — end of list',
    },

    // ── Terminology: list() shorthand ────────────────────────────────────────────
    {
      type: 'narration',
      id: 'list-shorthand-vocab',
      text: 'Building lists with manual pair calls is verbose. The list() constructor takes any number of arguments and produces the equivalent chain of pairs. Internally it is just a loop of pair calls — but it lets us write list(1, 2, 3) instead of pair(1, pair(2, pair(3, null))). A display helper converts the pair chain back into a readable "(1 2 3)" format. We will include both in all list code going forward.',
      code: null,
    },
    {
      type: 'narration',
      id: 'list-shorthand',
      text: 'Here are list() and display() defined. list() uses reduceRight to fold from the right, building the chain from the last element inward. display() walks the chain left to right, collecting values. Run it to see the Lisp-style "(1 2 3)" output.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\n\nfunction list(...args) {\n  return args.reduceRight((acc, x) => pair(x, acc), null);\n}\n\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = [];\n  let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return cur === null ? `(${items.join(\' \')})` : `(${items.join(\' \')} . ${cur})`;\n}\n\nconst nums = list(1, 2, 3, 4, 5);\nconsole.log(display(nums));     // (1 2 3 4 5)\nconsole.log(display(list()));   // nil\nconsole.log(head(nums));        // 1\nconsole.log(display(tail(nums))); // (2 3 4 5)',
    },
    {
      type: 'checkpoint',
      id: 'cp-list-construction',
    },

    // ── List operations ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'list-pattern-vocab',
      text: 'Every recursive list operation follows the same two-case pattern. Base case: if the list is null, return the appropriate empty result. Recursive case: compute something from the head, then combine it with the result of recursing on the tail. Once you see this pattern, you can write almost any list operation by filling in the two blanks: what to do with an empty list, and how to combine head with the recursive result on the tail.',
      code: null,
    },
    {
      type: 'narration',
      id: 'length-op',
      text: 'Length follows the pattern exactly. An empty list has length 0. A non-empty list has length 1 more than the length of its tail.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction length(lst) {\n  if (is_null(lst)) return 0;          // base case: empty list\n  return 1 + length(tail(lst));        // recursive: head counts 1, recurse on tail\n}\n\nconsole.log(length(list(1, 2, 3)));  // 3\nconsole.log(length(list()));          // 0\nconsole.log(length(list(\'a\')));       // 1',
    },
    {
      type: 'narration',
      id: 'list-ref-op',
      text: 'list_ref returns the nth element (0-indexed). When n is 0, return the head — we have arrived. When n is greater than 0, skip the head and look n-1 steps into the tail.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction list_ref(lst, n) {\n  if (n === 0) return head(lst);              // arrived at the target index\n  return list_ref(tail(lst), n - 1);          // skip head, decrement index\n}\n\nconst squares = list(1, 4, 9, 16, 25);\nconsole.log(list_ref(squares, 0)); // 1\nconsole.log(list_ref(squares, 2)); // 9\nconsole.log(list_ref(squares, 4)); // 25',
    },
    {
      type: 'narration',
      id: 'append-op',
      text: 'append combines two lists into one. An empty first list means the result is just list2. A non-empty first list means: put the head of list1 at the front, then append the tail of list1 with list2. This walks all of list1 and builds a new chain with list2 at the end.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return cur === null ? `(${items.join(\' \')})` : `(${items.join(\' \')} . ${cur})`;\n}\n\nfunction append(list1, list2) {\n  if (is_null(list1)) return list2;\n  return pair(head(list1), append(tail(list1), list2));\n}\n\nconsole.log(display(append(list(1, 2), list(3, 4, 5)))); // (1 2 3 4 5)\nconsole.log(display(append(list(), list(1, 2))));         // (1 2)',
    },
    {
      type: 'codelens',
      id: 'codelens-length',
      text: 'Open CodeLens on length(list(1,2,3)). Step through it and watch the base-case/recursive-case pattern: the call stack grows as we recurse down to null, then the 1 + ... additions happen on the way back up. This is the same expand-then-contract shape as the recursive factorial.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction length(lst) {\n  if (is_null(lst)) return 0;\n  return 1 + length(tail(lst));\n}\n\nconsole.log(length(list(1, 2, 3)));',
    },
    {
      type: 'challenge',
      id: 'challenge-last-element',
      text: 'Using the same base-case/recursive pattern, write last_element(lst) that returns the last element of a non-empty list. Base case: when the tail is null, we are at the last element — return the head. Recursive case: recurse on the tail. last_element(list(1,2,3)) should return 3.',
      expectedOutput: '3\n42',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\n// last_element: base case when tail is null, recursive case on tail\nfunction last_element(lst) {\n  // your code here\n}\n\nconsole.log(last_element(list(1, 2, 3)));  // 3\nconsole.log(last_element(list(42)));        // 42\n',
      hint: 'function last_element(lst) {\n  if (is_null(tail(lst))) return head(lst);\n  return last_element(tail(lst));\n}',
      tests: [
        { call: 'last_element(list(1,2,3))',    expected: 3  },
        { call: 'last_element(list(42))',        expected: 42 },
        { call: 'last_element(list(10,20,30))',  expected: 30 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
${code}
return typeof last_element==='function'&&last_element(list(1,2,3))===3&&last_element(list(42))===42&&last_element(list(10,20,30))===30`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-list-operations',
    },

    // ── map ───────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'map-vocab',
      text: 'The map operation is the first truly higher-order list operation. map takes a function f and a list, and returns a new list where every element has been transformed by f. The result has the same structure as the input — same length, same positions — but each value is replaced by f(value). SICP emphasises that map is important not just as a utility but as an abstraction: it separates "transform each element" from "what the transformation is."',
      code: null,
    },
    {
      type: 'narration',
      id: 'map-op',
      text: 'map follows the same base-case/recursive pattern. An empty list maps to an empty list. A non-empty list maps by applying f to the head, then prepending that result to map of the tail.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return `(${items.join(\' \')})` ;\n}\n\nfunction map(f, lst) {\n  if (is_null(lst)) return null;              // empty list maps to empty list\n  return pair(f(head(lst)), map(f, tail(lst))); // apply f to head, recurse on tail\n}\n\nconsole.log(display(map(x => x * x, list(1, 2, 3, 4)))); // (1 4 9 16)\nconsole.log(display(map(x => x + 10, list(1, 2, 3))));   // (11 12 13)\nconsole.log(display(map(x => x * 2, list(5, 10, 15))));  // (10 20 30)',
    },
    {
      type: 'codelens',
      id: 'codelens-map',
      text: 'Open CodeLens on map(x => x*x, list(1,2,3)). Step through it and watch: each recursive call applies x*x to one head element, then the result is paired with the recursive result on the tail. The call stack grows to depth 3 (one per element), then unwinds building the new list from the back.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction map(f, lst) {\n  if (is_null(lst)) return null;\n  return pair(f(head(lst)), map(f, tail(lst)));\n}\n\nconsole.log(JSON.stringify(map(x => x * x, list(1, 2, 3))));',
    },
    {
      type: 'challenge',
      id: 'challenge-scale-list',
      text: 'Write scale_list(lst, factor) that multiplies every element in lst by factor, using map. scale_list(list(1,2,3), 10) should return a list equal to list(10,20,30).',
      expectedOutput: '(10 20 30)\n(2 4 6 8)',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return `(${items.join(\' \')})` ;\n}\nfunction map(f, lst) {\n  if (is_null(lst)) return null;\n  return pair(f(head(lst)), map(f, tail(lst)));\n}\n\n// Write scale_list(lst, factor) using map\n\n\nconsole.log(display(scale_list(list(1, 2, 3), 10)));   // (10 20 30)\nconsole.log(display(scale_list(list(1, 2, 3, 4), 2))); // (2 4 6 8)\n',
      hint: 'function scale_list(lst, factor) {\n  return map(x => x * factor, lst);\n}',
      tests: [
        { call: 'JSON.stringify(scale_list(list(1,2,3),10))', expected: JSON.stringify([10,[20,[30,null]]]) },
        { call: 'JSON.stringify(scale_list(list(1,2,3,4),2))', expected: JSON.stringify([2,[4,[6,[8,null]]]]) },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function map(f,lst){return is_null(lst)?null:pair(f(head(lst)),map(f,tail(lst)));}
${code}
const r1=scale_list(list(1,2,3),10);
const r2=scale_list(list(1,2,3,4),2);
return typeof scale_list==='function'&&head(r1)===10&&head(tail(r1))===20&&head(r2)===2&&head(tail(r2))===4`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-list-map',
    },
  ],
}
