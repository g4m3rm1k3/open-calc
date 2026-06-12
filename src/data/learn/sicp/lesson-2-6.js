export const lesson = {
  id: 'sicp-2-6',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.3.3–2.3.4  Sets and Huffman Encoding',
  checkpoints: [
    { id: 'cp-sets-unordered',  label: 'Unordered Sets' },
    { id: 'cp-sets-ordered',    label: 'Ordered Sets' },
    { id: 'cp-huffman',         label: 'Huffman Trees' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Sections 2.3.3 and 2.3.4 use sets and Huffman encoding to drive home a recurring lesson: the same abstract type can be implemented in very different ways, with very different performance characteristics. The set type has a four-operation interface: test membership, add an element, intersect two sets, union two sets. We will see three implementations — unordered list, ordered list, and binary tree — where the same abstract interface runs at Θ(n²), Θ(n), and Θ(log n) respectively. Then Huffman encoding shows a beautiful application of trees to data compression.',
      code: null,
    },

    // ── Terminology: Sets ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'set-vocab',
      text: 'A set is an unordered collection with no duplicate elements. The word "unordered" matters: {1, 2, 3} and {3, 1, 2} are the same set — position is irrelevant. "No duplicates" also matters: {1, 1, 2} is not a valid set. The four operations that define the set interface are: element_of_set(x, s) — true if x is in s; adjoin_set(x, s) — add x to s if not already present; intersection_set(s1, s2) — elements in both; union_set(s1, s2) — elements in either or both. Any data structure satisfying these four contracts is a valid set implementation.',
      code: null,
    },

    // ── Unordered list representation ─────────────────────────────────────────────
    {
      type: 'narration',
      id: 'set-unordered-vocab',
      text: 'The simplest representation: a set is a list with no duplicates. element_of_set scans the list from front to back looking for x. In the worst case it reads every element — Θ(n). adjoin_set calls element_of_set first, so it is also Θ(n). intersection_set calls element_of_set for every element of the first list — Θ(n²). This is slow for large sets, but it is the easiest implementation to understand.',
      code: null,
    },
    {
      type: 'narration',
      id: 'element-of-set-code',
      text: 'Here is element_of_set. It is a linear scan: check the head, recurse on the tail, return false when the list is empty.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction element_of_set(x, s) {\n  if (is_null(s)) return false;\n  if (x === head(s)) return true;\n  return element_of_set(x, tail(s));\n}\n\nconst s = list(1, 3, 5, 7);\nconsole.log(element_of_set(3, s)); // true\nconsole.log(element_of_set(4, s)); // false',
    },
    {
      type: 'narration',
      id: 'adjoin-intersection-code',
      text: 'adjoin_set and intersection_set both call element_of_set internally. adjoin_set checks first to prevent duplicates. intersection_set keeps only elements that appear in both sets.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction element_of_set(x,s){if(is_null(s))return false;if(x===head(s))return true;return element_of_set(x,tail(s));}\n\nfunction adjoin_set(x, s) {\n  return element_of_set(x, s) ? s : pair(x, s);\n}\n\nfunction intersection_set(s1, s2) {\n  if (is_null(s1)) return null;\n  if (element_of_set(head(s1), s2))\n    return pair(head(s1), intersection_set(tail(s1), s2));\n  return intersection_set(tail(s1), s2);\n}\n\nconst a = list(1, 2, 3, 4);\nconst b = list(2, 4, 6);\nconsole.log(JSON.stringify(intersection_set(a, b))); // [2,[4,null]]',
    },
    {
      type: 'checkpoint',
      id: 'cp-sets-unordered',
    },

    // ── Ordered list representation ───────────────────────────────────────────────
    {
      type: 'narration',
      id: 'ordered-set-vocab',
      text: 'A critical observation: if we store elements in sorted order, we can stop early. Searching for 4 in {1, 3, 5, 7} — we reach 5 (greater than 4) and know 4 cannot appear later. This halves the average search time and reduces intersection from Θ(n²) to Θ(n). The trick for intersection: advance through both lists simultaneously. When two heads match, include the element and advance both. When they differ, advance the smaller one. This scans each list at most once.',
      code: null,
    },
    {
      type: 'narration',
      id: 'element-of-ordered-code',
      text: 'element_of_set on an ordered list: if we find an element larger than x before finding x itself, x is not in the set.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction element_of_ordered_set(x, s) {\n  if (is_null(s)) return false;\n  if (x === head(s)) return true;\n  if (x < head(s)) return false;   // early exit — x would have come before this\n  return element_of_ordered_set(x, tail(s));\n}\n\nconst s = list(1, 3, 5, 7, 9);\nconsole.log(element_of_ordered_set(5, s)); // true\nconsole.log(element_of_ordered_set(4, s)); // false — exits at 5, not end',
    },
    {
      type: 'narration',
      id: 'intersection-ordered-code',
      text: 'The parallel-scan intersection. Two pointers scan simultaneously. When both heads match, the element is in the intersection and both advance. When heads differ, the smaller one advances (it cannot appear in the other list at any later position, since the lists are sorted).',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction intersection_ordered(s1, s2) {\n  if (is_null(s1) || is_null(s2)) return null;\n  const h1 = head(s1), h2 = head(s2);\n  if (h1 === h2)  return pair(h1, intersection_ordered(tail(s1), tail(s2)));\n  if (h1 < h2)   return intersection_ordered(tail(s1), s2); // h1 can\'t be in s2\n  return intersection_ordered(s1, tail(s2));               // h2 can\'t be in s1\n}\n\nconsole.log(JSON.stringify(\n  intersection_ordered(list(1,2,3,5,7), list(2,4,5,6,7))\n)); // [2,[5,[7,null]]]',
    },
    {
      type: 'challenge',
      id: 'challenge-union-ordered',
      text: 'Write union_ordered(s1, s2) for sorted sets. When both lists are null, return null. When both have the same head, include it once and advance both. When heads differ, take the smaller and advance only that list. union_ordered(list(1,3,5), list(2,3,4)) should give a sorted list (1 2 3 4 5).',
      expectedOutput: '(1 2 3 4 5)',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction display(x){\n  if(x===null)return\'nil\';\n  if(!is_pair(x))return String(x);\n  const a=[];let c=x;\n  while(is_pair(c)){a.push(c[0]);c=c[1];}\n  return`(${a.join(\' \')})` ;\n}\n\nfunction union_ordered(s1, s2) {\n  // your code here\n}\n\nconsole.log(display(union_ordered(list(1,3,5), list(2,3,4)))); // (1 2 3 4 5)\n',
      hint: 'function union_ordered(s1, s2) {\n  if (is_null(s1)) return s2;\n  if (is_null(s2)) return s1;\n  const h1=head(s1), h2=head(s2);\n  if (h1===h2) return pair(h1, union_ordered(tail(s1),tail(s2)));\n  if (h1<h2) return pair(h1, union_ordered(tail(s1),s2));\n  return pair(h2, union_ordered(s1,tail(s2)));\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function is_null(x){return x===null;}function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
${code}
const r=union_ordered(list(1,3,5),list(2,3,4));
return head(r)===1&&head(tail(r))===2&&head(tail(tail(r)))===3&&head(tail(tail(tail(r))))===4&&head(tail(tail(tail(tail(r)))))===5`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-sets-ordered',
    },

    // ── Huffman Trees ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'huffman-motivation-vocab',
      text: 'ASCII uses 8 bits per character, always. "aaaaabbbcc" takes 80 bits regardless of how often each letter appears. But if "a" appears 5 times and "c" appears only twice, we could use a shorter code for "a" and a longer one for "c" — and come out ahead on average. This is the idea behind variable-length coding: frequent symbols get short codes, rare symbols get long codes. Huffman encoding finds the optimal such code for a given set of frequencies. The resulting code is a prefix code — no code is a prefix of any other, which makes decoding unambiguous.',
      code: null,
    },
    {
      type: 'narration',
      id: 'huffman-tree-vocab',
      text: 'A Huffman tree is a binary tree. Leaves are symbols with their frequencies. Internal nodes have a combined frequency equal to the sum of their children. The code for a symbol is the path from the root to its leaf: left edge = 0, right edge = 1. To build the optimal tree, start with the individual symbols as singleton trees, sorted by frequency. Repeatedly merge the two lowest-frequency trees into a new tree whose frequency is their sum. Repeat until one tree remains.',
      code: null,
    },
    {
      type: 'narration',
      id: 'huffman-data-structures',
      text: 'Here are the leaf and internal node constructors. Leaves store a symbol and weight. Internal nodes store left child, right child, and total weight.',
      code: 'function make_leaf(symbol, weight) {\n  return { type: \'leaf\', symbol, weight };\n}\nfunction is_leaf(x) { return x && x.type === \'leaf\'; }\n\nfunction make_code_tree(left, right) {\n  return {\n    type: \'node\',\n    left, right,\n    weight: weight(left) + weight(right),\n  };\n}\nfunction left_branch(t)  { return t.left; }\nfunction right_branch(t) { return t.right; }\nfunction weight(t) { return t.weight; }\n\nconst leaf_a = make_leaf(\'A\', 4);\nconst leaf_b = make_leaf(\'B\', 2);\nconst node   = make_code_tree(leaf_b, leaf_a); // B on left, A on right\n\nconsole.log(weight(node));    // 6\nconsole.log(is_leaf(leaf_a)); // true\nconsole.log(is_leaf(node));   // false',
    },
    {
      type: 'narration',
      id: 'huffman-decode',
      text: 'Decoding: start at the root with the bit string. Bit 0 → go left, bit 1 → go right. When a leaf is reached, output its symbol and restart from the root with the remaining bits. This works because the prefix property ensures the decoder is never ambiguous — reaching a leaf means the code for that symbol is complete.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction make_leaf(s,w){return{type:\'leaf\',symbol:s,weight:w};}\nfunction is_leaf(x){return x&&x.type===\'leaf\';}\nfunction make_code_tree(l,r){return{type:\'node\',left:l,right:r,weight:l.weight+r.weight};}\nfunction left_branch(t){return t.left;}\nfunction right_branch(t){return t.right;}\n\nfunction decode(bits, tree) {\n  function decode_1(bits, branch) {\n    if (is_null(bits)) return null;\n    const next = head(bits) === 0 ? left_branch(branch)\n                                  : right_branch(branch);\n    if (is_leaf(next))\n      return pair(next.symbol, decode_1(tail(bits), tree)); // restart\n    return decode_1(tail(bits), next);\n  }\n  return decode_1(bits, tree);\n}\n\n// Tree: A=0, B=10, C=11\nconst t = make_code_tree(\n  make_leaf(\'A\', 4),\n  make_code_tree(make_leaf(\'B\', 2), make_leaf(\'C\', 1)));\n\nconst msg = list(0, 1, 0, 1, 1); // A B C\nconst decoded = decode(msg, t);\nconst arr = [];\nlet cur = decoded; while(cur!==null){arr.push(cur[0]);cur=cur[1];}\nconsole.log(arr.join(\', \')); // A, B, C',
    },
    {
      type: 'codelens',
      id: 'codelens-decode',
      text: 'Open CodeLens on decode. Step through it and watch decode_1 navigate the tree: bit 0 goes left (to A leaf), outputs "A", restarts. Bit 1 goes right to an internal node, then bit 0 goes left to B leaf, outputs "B", restarts. Bit 1 then bit 1 — right then right — reaches C. The prefix code ensures each restart is unambiguous.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction make_leaf(s,w){return{type:\'leaf\',symbol:s,weight:w};}\nfunction is_leaf(x){return x&&x.type===\'leaf\';}\nfunction make_code_tree(l,r){return{type:\'node\',left:l,right:r};\n}\nfunction left_branch(t){return t.left;}\nfunction right_branch(t){return t.right;}\nfunction decode(bits,tree){function d(bits,branch){if(is_null(bits))return null;const next=head(bits)===0?left_branch(branch):right_branch(branch);if(is_leaf(next))return pair(next.symbol,d(tail(bits),tree));return d(tail(bits),next);}return d(bits,tree);}\n\nconst t=make_code_tree(make_leaf(\'A\',4),make_code_tree(make_leaf(\'B\',2),make_leaf(\'C\',1)));\nconsole.log(JSON.stringify(decode(list(0,1,0,1,1),t)));',
    },
    {
      type: 'challenge',
      id: 'challenge-encode',
      text: 'Write encode(symbols, tree) that takes a list of symbols and a Huffman tree, and returns the encoded bit list. For each symbol, find the path from the root to its leaf: going left adds a 0, going right adds a 1. encode(list("A","B","C"), t) should return the bits list(0,1,0,1,1).',
      expectedOutput: '(0 1 0 1 1)',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}\nfunction make_leaf(s,w){return{type:\'leaf\',symbol:s,weight:w};}\nfunction is_leaf(x){return x&&x.type===\'leaf\';}\nfunction make_code_tree(l,r){return{type:\'node\',left:l,right:r};}\nfunction left_branch(t){return t.left;}\nfunction right_branch(t){return t.right;}\n\nfunction display(x){if(x===null)return\'nil\';if(!is_pair(x))return String(x);const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return`(${a.join(\' \')})`;}\n\n// encode_symbol(sym, tree): find path from root to sym\n// returns a list of bits, or null if not found\nfunction encode_symbol(sym, tree) {\n  // your code here\n}\n\n// encode(symbols, tree): encode each symbol and append the bits\nfunction encode(symbols, tree) {\n  if (is_null(symbols)) return null;\n  return append(encode_symbol(head(symbols), tree),\n                encode(tail(symbols), tree));\n}\n\nconst t = make_code_tree(make_leaf(\'A\',4), make_code_tree(make_leaf(\'B\',2),make_leaf(\'C\',1)));\nconsole.log(display(encode(list(\'A\',\'B\',\'C\'), t))); // (0 1 0 1 1)\n',
      hint: 'function encode_symbol(sym, tree) {\n  if (is_leaf(tree)) return tree.symbol === sym ? null : null;\n  function search(branch, bits) {\n    if (is_leaf(branch)) return branch.symbol === sym ? bits : null;\n    const left = search(left_branch(branch), append(bits, list(0)));\n    if (left !== null) return left;\n    return search(right_branch(branch), append(bits, list(1)));\n  }\n  return search(tree, null);\n}',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.includes('0 1 0 1 1')),
    },
    {
      type: 'checkpoint',
      id: 'cp-huffman',
    },
  ],
}
