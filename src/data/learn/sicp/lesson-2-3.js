export const lesson = {
  id: 'sicp-2-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.2  Hierarchical Structures and Trees',
  checkpoints: [
    { id: 'cp-trees',       label: 'Trees' },
    { id: 'cp-tree-ops',    label: 'Tree Operations' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'A list whose elements can themselves be lists forms a tree. Trees are everywhere in computer science: file systems, expression parsers, HTML documents, decision trees, and the call trees we saw in tree recursion. The pair structure of SICP lists naturally represents trees — a pair can hold either a leaf value or a sub-list (sub-tree) in any position.',
      code: null,
    },

    // ── Terminology: Trees ─────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'tree-vocab',
      text: 'In a tree built from lists: a leaf is any element that is not itself a pair — a number, string, or null. A branch (or internal node) is a pair whose head or tail may themselves be pairs. The depth of a node is how many levels down it sits from the root. A tree with only leaves at the bottom and pairs everywhere else is also called a deeply nested list. The function is_pair tests whether a value is a branch.',
      code: null,
    },

    // ── 2.2.2  Trees ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'tree-build',
      text: 'Here is a tree built from nested lists. The structure list(list(1, 2), list(3, 4)) represents a tree with two sub-lists at the top level. Running JSON.stringify shows the raw pair structure — pairs of pairs, all the way down.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nconst tree = list(list(1, 2), list(3, 4));\n\nconsole.log(is_pair(tree));          // true — it is a branch\nconsole.log(is_pair(head(tree)));    // true — first element is also a branch\nconsole.log(is_pair(head(head(tree)))); // false — 1 is a leaf',
    },

    // ── count_leaves ──────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'count-leaves-vocab',
      text: 'Processing trees requires a different recursive pattern from lists. For lists, there was one base case (null) and one recursive call (on the tail). For trees, there are two base cases and two recursive cases. Base case 1: null is zero leaves. Base case 2: a non-pair (a leaf) is one leaf. Recursive case 1: if the head is a pair (a sub-tree), count its leaves recursively. Recursive case 2: always recurse on the tail. This double recursion mirrors the branching structure of the tree.',
      code: null,
    },
    {
      type: 'narration',
      id: 'count-leaves',
      text: 'count_leaves implements the four-case pattern. Run it — the tree list(list(1,2), list(3,4)) has 4 leaves, and the nested list(list(1, list(2, 3)), list(4, 5)) has 5.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction count_leaves(x) {\n  if (is_null(x))  return 0;                          // base: empty\n  if (!is_pair(x)) return 1;                          // base: leaf\n  return count_leaves(head(x)) +                      // recurse into sub-tree at head\n         count_leaves(tail(x));                       // recurse on rest of list\n}\n\nconsole.log(count_leaves(list(list(1,2), list(3,4)))); // 4\nconsole.log(count_leaves(list(1, list(2, list(3, 4)), 5))); // 5',
    },
    {
      type: 'codelens',
      id: 'codelens-count-leaves',
      text: 'Open CodeLens on count_leaves of a small nested list. Watch the double recursion: when the head is a pair, count_leaves dives into it; it always also recurses on the tail. The call tree mirrors the data tree — that is the essential insight of tree processing.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p) { return p[0]; }\nfunction tail(p) { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction count_leaves(x) {\n  if (is_null(x))  return 0;\n  if (!is_pair(x)) return 1;\n  return count_leaves(head(x)) + count_leaves(tail(x));\n}\n\nconsole.log(count_leaves(list(list(1, 2), 3)));',
    },
    {
      type: 'checkpoint',
      id: 'cp-trees',
    },
    {
      type: 'challenge',
      id: 'challenge-tree-sum',
      text: 'Using the same four-case pattern as count_leaves, write sum_tree(x) that adds up all the leaf numbers in a tree. Base case null: return 0. Base case non-pair: return x (it is a number). Recursive case: sum_tree(head) + sum_tree(tail). sum_tree(list(1, list(2, 3), 4)) should return 10.',
      expectedOutput: '10\n15',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\n// sum_tree: same four-case pattern as count_leaves\nfunction sum_tree(x) {\n  // your code here\n}\n\nconsole.log(sum_tree(list(1, list(2, 3), 4)));      // 10\nconsole.log(sum_tree(list(list(1,2), list(3,4), 5))); // 15\n',
      hint: 'function sum_tree(x) {\n  if (is_null(x))  return 0;\n  if (!is_pair(x)) return x;\n  return sum_tree(head(x)) + sum_tree(tail(x));\n}',
      tests: [
        { call: 'sum_tree(list(1, list(2,3), 4))',         expected: 10 },
        { call: 'sum_tree(list(list(1,2), list(3,4), 5))', expected: 15 },
      ],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function is_pair(x){return Array.isArray(x);}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
${code}
return typeof sum_tree==='function'&&sum_tree(list(1,list(2,3),4))===10&&sum_tree(list(list(1,2),list(3,4),5))===15`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── tree_map ─────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'scale-tree',
      text: 'scale_tree multiplies every leaf of a tree by a factor, preserving the tree structure. It uses the same four-case pattern: null maps to null, a leaf multiplies by factor, a branch applies scale_tree recursively to both head and tail.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction scale_tree(tree, factor) {\n  if (is_null(tree))   return null;\n  if (!is_pair(tree))  return tree * factor;\n  return pair(scale_tree(head(tree), factor),\n              scale_tree(tail(tree), factor));\n}\n\nconsole.log(JSON.stringify(\n  scale_tree(list(1, list(2, list(3, 4), 5)), 10)\n)); // [10, [[20, [[30, [40, null]], [50, null]]], null]]',
    },
    {
      type: 'narration',
      id: 'tree-map-intro',
      text: 'Just as we abstracted list map from scale_list, we can abstract tree_map from scale_tree. tree_map takes a function f and applies it to every leaf, preserving structure. The pattern is the same — what varies is the leaf transformation.',
      code: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\n\nfunction tree_map(f, tree) {\n  if (is_null(tree))  return null;\n  if (!is_pair(tree)) return f(tree);           // leaf: apply f\n  return pair(tree_map(f, head(tree)),\n              tree_map(f, tail(tree)));\n}\n\n// scale_tree is now just tree_map with multiplication\nconst t = list(1, list(2, 3), 4);\nconsole.log(JSON.stringify(tree_map(x => x * 10, t)));\nconsole.log(JSON.stringify(tree_map(x => x * x,  t)));',
    },
    {
      type: 'challenge',
      id: 'challenge-flatten',
      text: 'Write flatten(tree) that returns a flat list of all the leaves of a tree in left-to-right order, discarding the structure. Use append to combine sub-results. Base case null: return null (empty list). Base case non-pair: return list(x) (a singleton list). Recursive case: append(flatten(head), flatten(tail)). flatten(list(1, list(2, 3), list(4, list(5, 6)))) should give (1 2 3 4 5 6).',
      expectedOutput: '(1 2 3 4 5 6)',
      startCode: 'function pair(x, y) { return [x, y]; }\nfunction head(p)    { return p[0]; }\nfunction tail(p)    { return p[1]; }\nfunction is_null(x) { return x === null; }\nfunction is_pair(x) { return Array.isArray(x); }\nfunction list(...a) { return a.reduceRight((acc, x) => pair(x, acc), null); }\nfunction append(l1, l2) {\n  return is_null(l1) ? l2 : pair(head(l1), append(tail(l1), l2));\n}\nfunction display(x) {\n  if (x === null) return \'nil\';\n  if (!is_pair(x)) return String(x);\n  const items = []; let cur = x;\n  while (is_pair(cur)) { items.push(cur[0]); cur = cur[1]; }\n  return `(${items.join(\' \')})` ;\n}\n\n// flatten: append(flatten(head), flatten(tail)), singleton list for leaves\nfunction flatten(tree) {\n  // your code here\n}\n\nconsole.log(display(flatten(list(1, list(2, 3), list(4, list(5, 6)))))); // (1 2 3 4 5 6)\n',
      hint: 'function flatten(tree) {\n  if (is_null(tree))  return null;\n  if (!is_pair(tree)) return list(tree);\n  return append(flatten(head(tree)), flatten(tail(tree)));\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}
function head(p){return p[0];}
function tail(p){return p[1];}
function is_null(x){return x===null;}
function is_pair(x){return Array.isArray(x);}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
function append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}
${code}
const t = list(1,list(2,3),list(4,list(5,6)));
const f = flatten(t);
return typeof flatten==='function'&&head(f)===1&&head(tail(f))===2&&head(tail(tail(tail(tail(tail(f))))))===6`)
          return fn() === true
        } catch { return false }
      },
    },
    {
      type: 'checkpoint',
      id: 'cp-tree-ops',
    },
  ],
}
