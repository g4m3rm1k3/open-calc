export const lesson = {
  id: 'sicp-2-6',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.3.3–2.3.4  Sets and Huffman Encoding',
  checkpoints: [
    { id: 'cp-sets',    label: 'Sets' },
    { id: 'cp-huffman', label: 'Huffman Trees' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 2.3.3 uses sets to illustrate a key lesson: the same abstract type (a set) can be implemented in multiple ways with very different performance. Section 2.3.4 then builds a Huffman encoder — a data compression algorithm that constructs an optimal code for a given set of symbols. Both sections reinforce the abstraction barrier principle: the operations define the type; the representation is a separate concern.',
      code: null,
    },

    // ── Terminology: Sets ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'set-vocab',
      text: 'A set is an unordered collection with no duplicates. Its interface has four operations: element_of_set(x, s) tests membership; adjoin_set(x, s) adds an element (if not present); intersection_set(s1, s2) returns elements in both; union_set(s1, s2) returns all elements from either. The same four operations can be backed by an unordered list, an ordered list, or a balanced binary tree — with Θ(n), Θ(log n), and Θ(log n) membership costs respectively.',
      code: null,
    },

    // ── Set as unordered list ─────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'set-unordered',
      text: 'The simplest representation: a set is a list with no duplicates. element_of_set scans the list linearly. adjoin_set checks first, then prepends. This is Θ(n) for all operations — slow for large sets, but easy to understand.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction element_of_set(x, s) {\n  if (is_null(s)) return false;\n  if (x === head(s)) return true;\n  return element_of_set(x, tail(s));\n}\n\nfunction adjoin_set(x, s) {\n  return element_of_set(x, s) ? s : pair(x, s);\n}\n\nfunction intersection_set(s1, s2) {\n  if (is_null(s1) || is_null(s2)) return null;\n  if (element_of_set(head(s1), s2))\n    return pair(head(s1), intersection_set(tail(s1), s2));\n  return intersection_set(tail(s1), s2);\n}\n\nconst s = adjoin_set(3, adjoin_set(2, adjoin_set(1, null)));\nconsole.log(element_of_set(2, s)); // true\nconsole.log(element_of_set(5, s)); // false\nconsole.log(JSON.stringify(intersection_set(list(1,2,3), list(2,3,4))));',
    },

    // ── Set as ordered list ────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'set-ordered-vocab',
      text: 'The ordered-list representation stores elements in ascending order. This allows early termination: if the current element is larger than x, x cannot appear later. More importantly, intersection_set can scan both lists in parallel — when the heads match, both advance; when they differ, the smaller advances. This reduces intersection from Θ(n²) to Θ(n).',
      code: null,
    },
    {
      type: 'narration',
      id: 'set-ordered',
      text: 'Here is intersection_set on ordered lists. Two pointers scan simultaneously — no quadratic scanning needed.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction element_of_ordered_set(x, s) {\n  if (is_null(s)) return false;\n  if (x === head(s)) return true;\n  if (x < head(s)) return false;   // early exit: x would have appeared before this\n  return element_of_ordered_set(x, tail(s));\n}\n\nfunction intersection_ordered(s1, s2) {\n  if (is_null(s1) || is_null(s2)) return null;\n  const h1 = head(s1), h2 = head(s2);\n  if (h1 === h2) return pair(h1, intersection_ordered(tail(s1), tail(s2)));\n  if (h1 < h2)   return intersection_ordered(tail(s1), s2);\n  return intersection_ordered(s1, tail(s2));\n}\n\nconsole.log(JSON.stringify(intersection_ordered(list(1,2,3,4,5), list(2,4,6)))); // [2,[4,null]]',
    },
    {
      type: 'challenge',
      id: 'challenge-union-ordered',
      text: 'Write union_ordered(s1, s2) for ordered sets. When both are null, return null. When both have the same head, include it once and advance both. When heads differ, take the smaller head and advance only that list. union_ordered(list(1,3,5), list(2,3,4)) should give (1 2 3 4 5).',
      expectedOutput: '(1 2 3 4 5)',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return `(${items.join(\' \')})` ;\n}\n\n// Write union_ordered(s1, s2)\nfunction union_ordered(s1, s2) {\n  // your code here\n}\n\nconsole.log(display(union_ordered(list(1,3,5), list(2,3,4)))); // (1 2 3 4 5)\n',
      hint: 'function union_ordered(s1, s2) {\n  if (is_null(s1)) return s2;\n  if (is_null(s2)) return s1;\n  const h1 = head(s1), h2 = head(s2);\n  if (h1 === h2) return pair(h1, union_ordered(tail(s1), tail(s2)));\n  if (h1 < h2)   return pair(h1, union_ordered(tail(s1), s2));\n  return pair(h2, union_ordered(s1, tail(s2)));\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
${code}
const r=union_ordered(list(1,3,5),list(2,3,4));
return typeof union_ordered==='function'&&head(r)===1&&head(tail(r))===2&&head(tail(tail(r)))===3&&head(tail(tail(tail(r))))===4&&head(tail(tail(tail(tail(r)))))===5`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-sets',
    },

    // ── Huffman Trees ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'huffman-vocab',
      text: 'Huffman encoding is a data compression algorithm that assigns shorter bit strings to more frequent symbols and longer bit strings to rarer ones. Unlike fixed-length codes (ASCII uses 8 bits per character always), Huffman codes are variable-length. A Huffman code is also a prefix code: no code is a prefix of another, so the decoder can always tell where one symbol ends and the next begins. A Huffman tree is a binary tree where leaves are symbols, and the bit string for each symbol is given by the path from root to leaf (left = 0, right = 1).',
      code: null,
    },
    {
      type: 'narration',
      id: 'huffman-structure',
      text: 'A Huffman tree is either a leaf (a symbol with its frequency) or an internal node (with left child, right child, a list of all symbols beneath it, and the combined weight). Here are the constructors and selectors.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\n// Leaf: { type: \'leaf\', symbol, weight }\nfunction make_leaf(symbol, weight) { return { type: \'leaf\', symbol, weight }; }\nfunction is_leaf(x)   { return x && x.type === \'leaf\'; }\nfunction symbol_leaf(x) { return x.symbol; }\nfunction weight_leaf(x) { return x.weight; }\n\n// Internal node: { type: \'node\', left, right, symbols, weight }\nfunction make_code_tree(left, right) {\n  return {\n    type: \'node\',\n    left, right,\n    weight: weight(left) + weight(right),\n  };\n}\nfunction left_branch(tree)  { return tree.left; }\nfunction right_branch(tree) { return tree.right; }\nfunction weight(tree) {\n  return is_leaf(tree) ? tree.weight : tree.weight;\n}\n\nconst leaf_a = make_leaf(\'A\', 8);\nconst leaf_b = make_leaf(\'B\', 3);\nconst node   = make_code_tree(leaf_b, leaf_a);\nconsole.log(weight(node));              // 11\nconsole.log(is_leaf(leaf_a));           // true\nconsole.log(is_leaf(node));             // false',
    },
    {
      type: 'narration',
      id: 'huffman-decode',
      text: 'Decoding: start at the root. If the current bit is 0, go left; if 1, go right. When you reach a leaf, output its symbol and restart from the root. This recursion walks the tree guided by the bit string.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction make_leaf(s, w) { return { type: \'leaf\', symbol: s, weight: w }; }\nfunction is_leaf(x) { return x && x.type === \'leaf\'; }\nfunction make_code_tree(l, r) { return { type: \'node\', left: l, right: r, weight: l.weight + r.weight }; }\nfunction left_branch(t) { return t.left; }\nfunction right_branch(t) { return t.right; }\n\nfunction decode(bits, tree) {\n  function decode_1(bits, current_branch) {\n    if (is_null(bits)) return null;\n    const next = head(bits) === 0 ? left_branch(current_branch)\n                                  : right_branch(current_branch);\n    if (is_leaf(next))\n      return pair(next.symbol, decode_1(tail(bits), tree));\n    return decode_1(tail(bits), next);\n  }\n  return decode_1(bits, tree);\n}\n\n// Simple tree: A=0, B=10, C=11\nconst leaf_a = make_leaf(\'A\', 4);\nconst leaf_b = make_leaf(\'B\', 2);\nconst leaf_c = make_leaf(\'C\', 1);\nconst t = make_code_tree(leaf_a, make_code_tree(leaf_b, leaf_c));\n\nconst msg = list(0, 1, 0, 1, 1); // A B C\nconsole.log(JSON.stringify(decode(msg, t))); // A, B, C',
    },
    {
      type: 'codelens',
      id: 'codelens-decode',
      text: 'Open CodeLens on decode. Watch how decode_1 navigates the tree one bit at a time — going left on 0, right on 1. When it hits a leaf, it emits the symbol and restarts from the root. This is how all prefix codes work: the tree structure ensures the decoder is never ambiguous.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction make_leaf(s, w) { return { type: \'leaf\', symbol: s, weight: w }; }\nfunction is_leaf(x) { return x && x.type === \'leaf\'; }\nfunction make_code_tree(l, r) { return { type: \'node\', left: l, right: r }; }\nfunction left_branch(t) { return t.left; }\nfunction right_branch(t) { return t.right; }\n\nfunction decode(bits, tree) {\n  function decode_1(bits, branch) {\n    if (is_null(bits)) return null;\n    const next = head(bits) === 0 ? left_branch(branch) : right_branch(branch);\n    if (is_leaf(next)) return pair(next.symbol, decode_1(tail(bits), tree));\n    return decode_1(tail(bits), next);\n  }\n  return decode_1(bits, tree);\n}\n\nconst t = make_code_tree(make_leaf(\'A\', 4), make_code_tree(make_leaf(\'B\', 2), make_leaf(\'C\', 1)));\nconsole.log(JSON.stringify(decode(list(0, 1, 0, 1, 1), t)));',
    },
    {
      type: 'checkpoint',
      id: 'cp-huffman',
    },
  ],
}
