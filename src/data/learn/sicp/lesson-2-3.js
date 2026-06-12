export const lesson = {
  id: 'sicp-2-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.2  Hierarchical Structures and Trees',
  checkpoints: [
    { id: 'cp-tree-structure',  label: 'Trees' },
    { id: 'cp-count-leaves',    label: 'Tree Recursion' },
    { id: 'cp-tree-operations', label: 'Tree Operations' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'In the previous lesson, a list was a chain of pairs where every element was a simple value — a number or string. Hierarchical structures break that restriction: an element can itself be a list. A list of lists is a tree. Trees are not a special data structure — they are just the pair structure we already have, interpreted differently. This reinterpretation unlocks a huge amount: file systems are trees, HTML documents are trees, algebraic expressions are trees, and the call graphs we saw in tree recursion are trees. The pair-chain model handles all of them without any new syntax.',
      code: null,
    },

    // ── What a tree looks like ────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'tree-structure-vocab',
      text: 'In a tree built from lists, every node is either a leaf or a branch. A leaf is any element that is not itself a pair — a number, a string, null. A branch is a pair whose head or tail may themselves be pairs. The depth of a node is the number of levels above it. The root is the outermost pair; leaves are at the bottom. The function is_pair distinguishes branches from leaves. The function is_null marks the end of a chain.',
      code: null,
    },
    {
      type: 'narration',
      id: 'tree-build',
      text: 'Here is a tree as nested lists. list(list(1,2), list(3,4)) has two branches at the top level, each containing two leaves. Run it and look at the raw pair structure — every branch is [element, [element, ...]], every leaf is a plain number.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nconst tree = list(list(1,2), list(3,4));\n\nconsole.log(is_pair(tree));             // true — root is a branch\nconsole.log(is_pair(head(tree)));       // true — first child is a branch\nconsole.log(is_pair(head(head(tree)))); // false — 1 is a leaf\nconsole.log(head(head(tree)));          // 1',
    },
    {
      type: 'narration',
      id: 'tree-navigation',
      text: 'To navigate a tree you still use head and tail. But now you must also check whether each element is a pair before treating it as a sub-list. This check — is_pair — is what separates tree processing from list processing.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\n// Deeply nested: list(1, list(2, list(3, 4)), 5)\nconst t = list(1, list(2, list(3,4)), 5);\n\nconsole.log(head(t));                          // 1 — first leaf\nconsole.log(head(head(tail(t))));              // 2 — first leaf of branch\nconsole.log(head(head(tail(head(tail(t)))))); // 3 — nested two levels',
    },
    {
      type: 'checkpoint',
      id: 'cp-tree-structure',
    },

    // ── The four-case pattern ─────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'four-case-vocab',
      text: 'Processing lists needed two cases: null (empty list) and non-null (one element plus the rest). Processing trees needs four cases. Null is still zero contributions. But now a non-null element has two sub-cases: is it a leaf (not a pair) or a branch (a pair that is a sub-tree)? And there is still the "rest of the list" case. The complete pattern: (1) null → base case, (2) non-pair → leaf case, (3) pair at head → recurse into head, (4) always → recurse on tail. Every tree operation follows this structure.',
      code: null,
    },
    {
      type: 'narration',
      id: 'count-leaves-code',
      text: 'count_leaves is the simplest example of the four-case pattern. An empty list has 0 leaves. A non-pair element IS a leaf — count 1. A branch means: count the leaves under the head, then add the count from the tail. Run it — note that list(list(1,2),list(3,4)) has 4 leaves and the more deeply nested example has 5.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction count_leaves(x) {\n  if (is_null(x))  return 0;  // end of chain\n  if (!is_pair(x)) return 1;  // a leaf\n  return count_leaves(head(x)) + count_leaves(tail(x)); // branch\n}\n\nconsole.log(count_leaves(list(list(1,2), list(3,4)))); // 4\nconsole.log(count_leaves(list(1, list(2, list(3,4)), 5))); // 5',
    },
    {
      type: 'codelens',
      id: 'codelens-count-leaves',
      text: 'Open CodeLens on count_leaves of list(list(1,2), 3). Watch the double recursion unfold: the call visits the outer pair\'s head (list(1,2) — a sub-tree) and recurses into it, then visits the outer pair\'s tail (pair(3,null)) and recurses into that. When it hits a non-pair element, it returns 1. When it hits null, it returns 0. The call tree mirrors the data tree exactly.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction count_leaves(x) {\n  if (is_null(x))  return 0;\n  if (!is_pair(x)) return 1;\n  return count_leaves(head(x)) + count_leaves(tail(x));\n}\n\nconsole.log(count_leaves(list(list(1,2), 3)));',
    },
    {
      type: 'checkpoint',
      id: 'cp-count-leaves',
    },
    {
      type: 'challenge',
      id: 'challenge-sum-tree',
      text: 'Using the four-case pattern, write sum_tree(x) that adds all leaf numbers in a tree. Null contributes 0. A non-pair x is a leaf — return x. A pair recurses on both head and tail. sum_tree(list(1, list(2,3), 4)) should be 10.',
      expectedOutput: '10\n15',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction sum_tree(x) {\n  // your code here — four cases: null, non-pair, is_pair\n}\n\nconsole.log(sum_tree(list(1, list(2,3), 4)));        // 10\nconsole.log(sum_tree(list(list(1,2), list(3,4), 5))); // 15\n',
      hint: 'function sum_tree(x) {\n  if (is_null(x))  return 0;\n  if (!is_pair(x)) return x;\n  return sum_tree(head(x)) + sum_tree(tail(x));\n}',
      tests: [],
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";
function pair(x,y){return[x,y];}function head(p){return p[0];}function tail(p){return p[1];}
function is_null(x){return x===null;}function is_pair(x){return Array.isArray(x);}
function list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}
${code}
return sum_tree(list(1,list(2,3),4))===10&&sum_tree(list(list(1,2),list(3,4),5))===15`)
          return fn() === true
        } catch { return false }
      },
    },

    // ── Tree operations ───────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'tree-map-vocab',
      text: 'map applied to a flat list transformed each element independently. tree_map applies a function to every leaf of a tree, leaving the structure unchanged. The four-case pattern applies: null maps to null, a leaf maps to f(leaf), a branch recurses into both head and tail and reassembles. The resulting tree has the same shape as the input but every leaf value is f(old_value). This is the tree analogue of flat map.',
      code: null,
    },
    {
      type: 'narration',
      id: 'tree-map-code',
      text: 'Here is tree_map. Run it — every leaf is squared, but the nesting structure is preserved.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\n\nfunction tree_map(f, x) {\n  if (is_null(x))  return null;\n  if (!is_pair(x)) return f(x);\n  return pair(tree_map(f, head(x)), tree_map(f, tail(x)));\n}\n\nconst t = list(1, list(2,3), list(4, list(5,6)));\nconsole.log(JSON.stringify(tree_map(x => x*x, t)));',
    },
    {
      type: 'narration',
      id: 'flatten-intro',
      text: 'flatten takes a tree and produces a flat list of all its leaves in left-to-right order. The structure is discarded; only the leaf values survive. flatten uses append to combine sub-results: the flattened head is appended to the flattened tail. For leaves, it produces a singleton list. This is perhaps the most useful tree operation — it undoes the nesting without losing any data.',
      code: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}\n\nfunction flatten(x) {\n  if (is_null(x))  return null;\n  if (!is_pair(x)) return list(x);            // leaf → singleton list\n  return append(flatten(head(x)),\n                flatten(tail(x)));            // combine sub-results\n}\n\nconst t = list(1, list(2,3), list(4, list(5,6)));\n// Flat: (1 2 3 4 5 6)\nconst flat = flatten(t);\nlet cur = flat, out = [];\nwhile (cur !== null) { out.push(cur[0]); cur = cur[1]; }\nconsole.log(out.join(\', \')); // 1, 2, 3, 4, 5, 6',
    },
    {
      type: 'challenge',
      id: 'challenge-deep-reverse',
      text: 'Write deep_reverse(tree) that reverses a list at every level of nesting simultaneously. deep_reverse(list(1, list(2,3), list(4,5))) should give (list(list(5,4), list(3,2), 1)). Hint: null maps to null, a non-pair is returned unchanged, a branch reverses the head recursively and then appends the reversed tail to a singleton list of the reversed head. Actually: deep_reverse(pair(h,t)) = append(deep_reverse(t), list(deep_reverse(h))).',
      expectedOutput: 'reversed',
      startCode: 'function pair(x,y){return[x,y];}\nfunction head(p){return p[0];}\nfunction tail(p){return p[1];}\nfunction is_null(x){return x===null;}\nfunction is_pair(x){return Array.isArray(x);}\nfunction list(...a){return a.reduceRight((acc,x)=>pair(x,acc),null);}\nfunction append(l1,l2){return is_null(l1)?l2:pair(head(l1),append(tail(l1),l2));}\n\nfunction deep_reverse(tree) {\n  // your code here\n}\n\nconst t = list(1, list(2,3));\nconst r = deep_reverse(t);\n// Should be: (list(3,2), 1)\n// Check: head is list(3,2), tail head is 1\nconst ok = is_pair(head(r)) && head(head(r))===3 && head(tail(r))===1;\nconsole.log(ok ? \'reversed\' : \'wrong\');\n',
      hint: 'function deep_reverse(tree) {\n  if (is_null(tree))  return null;\n  if (!is_pair(tree)) return tree;\n  return append(deep_reverse(tail(tree)),\n                list(deep_reverse(head(tree))));\n}',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.includes('reversed')),
    },
    {
      type: 'checkpoint',
      id: 'cp-tree-operations',
    },
  ],
}
