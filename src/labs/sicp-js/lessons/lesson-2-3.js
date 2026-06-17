export const lesson = {
  id: 'sicp-2-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.2.2  Hierarchical Structures and Trees',
  checkpoints: [
    { id: 'cp-tree-structure', label: 'Trees' },
    { id: 'cp-count-leaves',   label: 'Recursing on Trees' },
    { id: 'cp-tree-ops',       label: 'Tree Operations' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'In the previous lesson, every element of a list was a simple value — a number or string. But nothing in our pair structure prevents an element from being another list. When list elements can themselves be lists, the structure is no longer flat: it is hierarchical. It is a tree.\n\nTrees are everywhere: file systems (folders contain folders), HTML documents (elements contain elements), algebraic expressions (operators have operands that are themselves expressions), call graphs (functions call functions). The pair structure we already have handles all of these without any new syntax.',
      code: null,
    },

    // ── What a tree looks like ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'tree-vocab',
      text: 'Vocabulary for tree-structured data:\n\n  Leaf — an element that is not itself a pair. A number, a string, null. The "atoms" at the bottom of the structure.\n\n  Branch — a pair whose head or tail may themselves be pairs. Internal nodes of the tree.\n\n  Root — the outermost node. The entire list.\n\n  Depth — the number of levels from root to a node.\n\nThe predicate is_pair distinguishes branches from leaves. Everything that is not a pair is a leaf.',
      code: null,
    },
    {
      type: 'narration',
      id: 'tree-build',
      text: 'Build a simple tree: list(list(1,2), list(3,4)). The top level has two elements — each element is itself a list.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

const tree = list(list(1, 2), list(3, 4));

console.log(is_pair(tree));              // true — root is a branch
console.log(is_pair(head(tree)));        // true — first element is a branch
console.log(is_pair(head(head(tree)))); // false — 1 is a leaf
console.log(head(head(tree)));           // 1`,
    },
    {
      type: 'narration',
      id: 'tree-navigate',
      text: 'Navigate deeper. head goes to the first element; tail goes to everything else. With nested lists, you have to chain head and tail to reach leaves.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

// list(1, list(2, list(3, 4)), 5)
const t = list(1, list(2, list(3, 4)), 5);

console.log(head(t));                           // 1 — first leaf
console.log(head(head(tail(t))));              // 2 — into second branch
console.log(head(head(tail(head(tail(t))))));  // 3 — two levels deep`,
    },
    { type: 'checkpoint', id: 'cp-tree-structure' },

    // ── count_leaves ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'count-leaves-pattern',
      text: 'Recursive operations on trees follow a three-case pattern:\n\n  Case 1: is_null(tree) → base case for empty list (return 0 or null)\n  Case 2: !is_pair(tree) → it is a leaf — do the leaf operation\n  Case 3: is_pair(tree) → it is a branch — recurse on head AND tail\n\nThe third case recurses on BOTH head and tail. This is tree recursion on the data structure (distinct from the tree-recursive process of fib — here the tree shape is the data, not the process).',
      code: null,
    },
    {
      type: 'narration',
      id: 'count-leaves-build',
      text: 'count_leaves counts all the atomic elements (leaves) in a tree. Each leaf contributes 1; each branch contributes the sum of its children\'s leaf counts.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function count_leaves(tree) {
  if (is_null(tree))  return 0;                                    // empty
  if (!is_pair(tree)) return 1;                                    // leaf
  return count_leaves(head(tree)) + count_leaves(tail(tree));     // branch
}

console.log(count_leaves(list(list(1,2), list(3,4))));         // 4
console.log(count_leaves(list(1, list(2, list(3, 4)), 5)));    // 5
console.log(count_leaves(list()));                              // 0`,
    },
    {
      type: 'narration',
      id: 'count-leaves-insight',
      text: 'The structure of count_leaves mirrors the structure of the data. The function has three cases because the data has three cases: empty, leaf, or branch. This correspondence between data structure and function structure is the key insight for writing recursive tree operations.',
      code: null,
    },
    {
      type: 'codelens',
      id: 'codelens-count-leaves',
      text: 'Open CodeLens on count_leaves. Step through it on a two-level tree. Watch the recursive calls mirror the tree: count_leaves recurses on head(tree) (going into the first subtree) and tail(tree) (moving to the rest). The call tree of the function is isomorphic to the data tree being processed.',
      code: `function pair(x, y) { return [x, y]; }
function head(p) { return p[0]; }
function tail(p) { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function count_leaves(tree) {
  if (is_null(tree))  return 0;
  if (!is_pair(tree)) return 1;
  return count_leaves(head(tree)) + count_leaves(tail(tree));
}

console.log(count_leaves(list(list(1,2), list(3,4))));`,
    },
    { type: 'checkpoint', id: 'cp-count-leaves' },

    // ── Tree operations ───────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'tree-map-intro',
      text: 'Just as map applies a function to every element of a list, we can write tree_map that applies a function to every leaf of a tree, preserving the tree\'s structure. Internal nodes (branches) are recreated; only the leaf values change.',
      code: null,
    },
    {
      type: 'narration',
      id: 'tree-map-build',
      text: 'tree_map follows the three-case pattern. Empty → null. Leaf → apply f. Branch → rebuild with tree_map applied to both subtrees.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function tree_map(f, tree) {
  if (is_null(tree))  return null;
  if (!is_pair(tree)) return f(tree);                                    // leaf: apply f
  return pair(tree_map(f, head(tree)), tree_map(f, tail(tree)));       // branch: recurse
}`,
    },
    {
      type: 'narration',
      id: 'tree-map-demo',
      text: 'Apply tree_map to double every leaf. The tree structure is preserved exactly.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function tree_map(f, tree) {
  if (is_null(tree))  return null;
  if (!is_pair(tree)) return f(tree);
  return pair(tree_map(f, head(tree)), tree_map(f, tail(tree)));
}
function display(x) {
  if(x===null)return'nil';if(!is_pair(x))return String(x);
  const a=[];let c=x;while(is_pair(c)){a.push(Array.isArray(c[0])?'('+display(c[0]).slice(1):c[0]);c=c[1];}
  return\`(\${a.join(' ')})\`;
}

const t = list(list(1, 2), list(3, list(4, 5)));
console.log(JSON.stringify(tree_map(x => x * 2, t)));
// Leaves 1,2,3,4,5 become 2,4,6,8,10 — structure preserved`,
    },
    { type: 'checkpoint', id: 'cp-tree-ops' },

    {
      type: 'challenge',
      id: 'challenge-deep-reverse',
      text: 'Write deep_reverse(tree) that reverses a tree at every level, not just the top. For a flat list, it should behave like regular reverse. For a nested list: deep_reverse(list(list(1,2),list(3,4))) = ((4 3) (2 1)).\n\nPattern: if null → null. If leaf → leaf. If pair → pair(deep_reverse(tail), deep_reverse(head)).',
      expectedOutput: '(4 3)(2 1) at top level',
      startCode: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

// deep_reverse: null → null, leaf → leaf, pair → pair(dr(tail), dr(head))
function deep_reverse(tree) {
  if (is_null(tree))  return null;
  if (!is_pair(tree)) return tree;   // leaf — unchanged
  // branch: reverse by swapping head and tail, and recursing
}

const t = list(list(1, 2), list(3, 4));
const dr = deep_reverse(t);
// Should give ((4 3) (2 1))
console.log(JSON.stringify(deep_reverse(list(1, 2, 3))));       // [[3,[2,[1,null]]]]
console.log(head(head(deep_reverse(list(list(1,2),list(3,4)))))); // 4
`,
      hint: 'function deep_reverse(tree) {\n  if (is_null(tree))  return null;\n  if (!is_pair(tree)) return tree;\n  return pair(deep_reverse(tail(tree)), deep_reverse(head(tree)));\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function(`"use strict";\n${code}\nconst r=deep_reverse(list(list(1,2),list(3,4)));\nreturn head(head(r))===4&&head(head(tail(r)))===2`)
          return fn() === true
        } catch { return false }
      },
    },
  ],
}
