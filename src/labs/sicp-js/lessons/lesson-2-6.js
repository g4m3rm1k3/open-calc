export const lesson = {
  id: 'sicp-2-6',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '2.3.3–2.3.4  Sets and Huffman Encoding',
  checkpoints: [
    { id: 'cp-sets-unordered', label: 'Unordered Sets' },
    { id: 'cp-sets-ordered',   label: 'Ordered Sets' },
    { id: 'cp-huffman',        label: 'Huffman Trees' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'Sections 2.3.3 and 2.3.4 make one point by repetition: the same abstract type, three different implementations, dramatically different performance.\n\nA set has four operations: element_of (membership test), adjoin (add an element), intersection, union. We define these for an ABSTRACT set type. Then we implement that type three ways — unordered list, ordered list, binary tree — and watch the cost of element_of drop from Θ(n) to Θ(n/2) to Θ(log n). Same interface. Different representation. Very different speed.\n\nThen Huffman encoding shows a beautiful real-world application: a binary tree that compresses data by using shorter codes for more frequent symbols.',
      code: null,
    },

    // ── Shared list infrastructure ────────────────────────────────────────────

    {
      type: 'narration',
      id: 'list-infra',
      text: 'All three set implementations use the pair/list infrastructure from lesson 2-2.',
      code: `function pair(x, y) { return [x, y]; }
function head(p)    { return p[0]; }
function tail(p)    { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }`,
    },

    // ── Unordered list sets ───────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'unordered-element-of',
      text: 'The simplest implementation: a set is an unordered list of elements with no duplicates. element_of scans the list from front to back.',
      code: `function pair(x, y) { return [x, y]; }
function head(p) { return p[0]; }
function tail(p) { return p[1]; }
function is_null(x) { return x === null; }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }

function element_of_set(x, set) {
  if (is_null(set)) return false;
  if (x === head(set)) return true;
  return element_of_set(x, tail(set));
}

const s = list(1, 3, 5, 7);
console.log(element_of_set(3, s));   // true
console.log(element_of_set(4, s));   // false`,
    },
    {
      type: 'narration',
      id: 'unordered-adjoin',
      text: 'adjoin adds x if it is not already in the set. It must check membership first — that is one full scan.',
      code: `function pair(x, y) { return [x, y]; }
function head(p) { return p[0]; }
function tail(p) { return p[1]; }
function is_null(x) { return x === null; }
function element_of_set(x, set) {
  if (is_null(set)) return false;
  if (x === head(set)) return true;
  return element_of_set(x, tail(set));
}

function adjoin_set(x, set) {
  if (element_of_set(x, set)) return set;  // already in — don't add
  return pair(x, set);                     // prepend
}

let s = null;
s = adjoin_set(3, s);
s = adjoin_set(1, s);
s = adjoin_set(3, s);  // duplicate — ignored
console.log(JSON.stringify(s));  // [1,[3,null]] or similar — 3 appears once`,
    },
    {
      type: 'narration',
      id: 'unordered-intersection',
      text: 'intersection returns elements in both sets. For each element in set1, check if it is in set2.',
      code: `function pair(x, y) { return [x, y]; }
function head(p) { return p[0]; }
function tail(p) { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function element_of_set(x, s) { return !is_null(s) && (x===head(s) || element_of_set(x,tail(s))); }
function display(x) { if(x===null)return'nil';if(!is_pair(x))return String(x);const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return\`(\${a.join(' ')})\`; }

function intersection_set(set1, set2) {
  if (is_null(set1)) return null;
  if (element_of_set(head(set1), set2))
    return pair(head(set1), intersection_set(tail(set1), set2));
  return intersection_set(tail(set1), set2);
}

console.log(display(intersection_set(list(1,2,3,4), list(2,4,6)))); // (2 4)`,
    },
    { type: 'checkpoint', id: 'cp-sets-unordered' },

    // ── Ordered list sets — faster! ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'ordered-intro',
      text: 'The unordered set scans the entire list on every lookup. We can do better: keep the list sorted. Then element_of can stop early — if the element we are looking for is smaller than the current head, it cannot be in the rest of the list (which is even larger). On average, this halves the search time. And intersection becomes Θ(n) instead of Θ(n²) because we can advance both lists together.',
      code: null,
    },
    {
      type: 'narration',
      id: 'ordered-element-of',
      text: 'Ordered element_of: compare x with head. If x < head, stop early — x is not in the sorted set. If x = head, found. If x > head, recurse on tail.',
      code: `function pair(x, y) { return [x, y]; }
function head(p) { return p[0]; }
function tail(p) { return p[1]; }
function is_null(x) { return x === null; }
function is_pair(x) { return Array.isArray(x); }
function list(...a) { return a.reduceRight((acc,x) => pair(x,acc), null); }
function display(x) { if(x===null)return'nil';if(!is_pair(x))return String(x);const a=[];let c=x;while(is_pair(c)){a.push(c[0]);c=c[1];}return\`(\${a.join(' ')})\`; }

function element_of_ordered(x, set) {
  if (is_null(set)) return false;
  const h = head(set);
  if (x === h) return true;
  if (x < h)  return false;   // ← early exit: x not in sorted remainder
  return element_of_ordered(x, tail(set));
}

const s = list(1, 3, 5, 7, 9);
console.log(element_of_ordered(5, s));  // true
console.log(element_of_ordered(4, s));  // false — stops when it sees 5 > 4`,
    },
    { type: 'checkpoint', id: 'cp-sets-ordered' },

    // ── Huffman Trees ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'huffman-motivation',
      text: 'Huffman encoding (1952) compresses data by using shorter bit codes for more frequent symbols and longer codes for rare ones. A 5-symbol alphabet with fixed-length codes needs 3 bits per symbol. Huffman encoding can do better if the frequencies vary: "a" (most frequent) might get 1 bit, while "e" (least frequent) gets 4 bits. The average bits per symbol can be much less than 3.\n\nThe encoding is built as a binary tree. Leaves are symbols with weights (frequencies). Internal nodes have combined weights. Frequent symbols are near the root (short path = short code). Rare symbols are near the leaves (long path = long code).',
      code: null,
    },
    {
      type: 'narration',
      id: 'huffman-tree-structure',
      text: 'A Huffman tree node is either a leaf (symbol + weight) or an internal node (left subtree + right subtree + combined weight). Build leaf and make_code_tree constructors.',
      code: `// Leaf: { type: 'leaf', symbol, weight }
function make_leaf(symbol, weight) { return { type: 'leaf', symbol, weight }; }
function is_leaf(node)              { return node.type === 'leaf'; }
function symbol_leaf(node)          { return node.symbol; }
function weight_leaf(node)          { return node.weight; }

// Internal node: { type: 'tree', left, right, symbols, weight }
function make_code_tree(left, right) {
  return {
    type: 'tree',
    left, right,
    symbols: [...symbols_of(left), ...symbols_of(right)],
    weight: weight_of(left) + weight_of(right),
  };
}

function symbols_of(node) { return node.type === 'leaf' ? [node.symbol] : node.symbols; }
function weight_of(node)  { return node.type === 'leaf' ? node.weight   : node.weight; }`,
    },
    {
      type: 'narration',
      id: 'huffman-encode',
      text: 'Encoding: to encode a symbol, traverse the tree. Left = 0, right = 1. Recursively search left and right subtrees.',
      code: `function make_leaf(s, w)    { return { type:'leaf', symbol:s, weight:w }; }
function is_leaf(n)         { return n.type==='leaf'; }
function symbols_of(n)      { return n.type==='leaf' ? [n.symbol] : n.symbols; }
function weight_of(n)       { return n.weight; }
function make_code_tree(l,r){ return{type:'tree',left:l,right:r,symbols:[...symbols_of(l),...symbols_of(r)],weight:weight_of(l)+weight_of(r)};}

function encode_symbol(sym, tree) {
  if (is_leaf(tree)) return [];
  if (symbols_of(tree.left).includes(sym))
    return [0, ...encode_symbol(sym, tree.left)];
  return [1, ...encode_symbol(sym, tree.right)];
}

// Build a sample Huffman tree: a(4) b(2) c(1) d(1)
const sample_tree = make_code_tree(
  make_leaf('a', 4),
  make_code_tree(
    make_leaf('b', 2),
    make_code_tree(make_leaf('c', 1), make_leaf('d', 1))
  )
);

console.log(encode_symbol('a', sample_tree));  // [0]      — most frequent
console.log(encode_symbol('b', sample_tree));  // [1, 0]
console.log(encode_symbol('c', sample_tree));  // [1, 1, 0]
console.log(encode_symbol('d', sample_tree));  // [1, 1, 1] — least frequent`,
    },
    {
      type: 'narration',
      id: 'huffman-decode',
      text: 'Decoding: read bits one at a time. 0 → go left, 1 → go right. When you reach a leaf, emit the symbol and restart from the root.',
      code: `function make_leaf(s, w)    { return { type:'leaf', symbol:s, weight:w }; }
function is_leaf(n)         { return n.type==='leaf'; }
function symbols_of(n)      { return n.type==='leaf' ? [n.symbol] : n.symbols; }
function make_code_tree(l,r){ return{type:'tree',left:l,right:r,symbols:[...symbols_of(l),...symbols_of(r)],weight:l.weight+r.weight};}

function decode(bits, tree) {
  function decode_1(bits, current_branch) {
    if (bits.length === 0) return [];
    const next = bits[0] === 0 ? current_branch.left : current_branch.right;
    if (is_leaf(next))
      return [next.symbol, ...decode_1(bits.slice(1), tree)];
    return decode_1(bits.slice(1), next);
  }
  return decode_1(bits, tree);
}

const t = make_code_tree(
  make_leaf('a', 4),
  make_code_tree(make_leaf('b', 2), make_code_tree(make_leaf('c',1),make_leaf('d',1)))
);
// Encode "a b a c" = [0, 1,0, 0, 1,1,0]
const bits = [0, 1,0, 0, 1,1,0];
console.log(decode(bits, t).join(''));  // abac`,
    },
    { type: 'checkpoint', id: 'cp-huffman' },

    {
      type: 'challenge',
      id: 'challenge-huffman',
      text: 'Build a Huffman tree from scratch for the alphabet {a:5, b:3, c:2, d:1, e:1}. Use these steps: (1) sort leaves by weight, (2) repeatedly merge the two lowest-weight nodes into a code_tree. Then encode the message "abcde" and compute the total bits used. Compare to 3-bit fixed-length encoding (which would need 3 × 5 = 15 bits).',
      expectedOutput: 'total bits: ',
      startCode: `function make_leaf(s, w) { return { type:'leaf', symbol:s, weight:w }; }
function is_leaf(n)      { return n.type==='leaf'; }
function symbols_of(n)   { return n.type==='leaf' ? [n.symbol] : n.symbols; }
function weight_of(n)    { return n.weight; }
function make_code_tree(l,r){ return{type:'tree',left:l,right:r,symbols:[...symbols_of(l),...symbols_of(r)],weight:weight_of(l)+weight_of(r)}; }
function encode_symbol(sym, tree) {
  if (is_leaf(tree)) return [];
  if (symbols_of(tree.left).includes(sym)) return [0,...encode_symbol(sym,tree.left)];
  return [1,...encode_symbol(sym,tree.right)];
}

// Build tree by merging two lowest-weight nodes at each step
function build_huffman(pairs) {
  // pairs = [{symbol:'a',weight:5}, ...]
  let nodes = pairs.map(({symbol,weight}) => make_leaf(symbol,weight));
  nodes.sort((a,b) => weight_of(a) - weight_of(b));
  while (nodes.length > 1) {
    nodes.sort((a,b) => weight_of(a) - weight_of(b));
    const [first, second, ...rest] = nodes;
    nodes = [make_code_tree(first, second), ...rest];
  }
  return nodes[0];
}

const tree = build_huffman([
  {symbol:'a',weight:5},{symbol:'b',weight:3},
  {symbol:'c',weight:2},{symbol:'d',weight:1},{symbol:'e',weight:1}
]);

const message = ['a','b','c','d','e'];
const encoded = message.flatMap(s => encode_symbol(s, tree));
console.log('total bits: ' + encoded.length);
console.log('3-bit fixed would need: ' + 3 * message.length + ' bits');
`,
      hint: 'The tree structure already works. Just run it and observe the compression.',
      validate: ({ logs }) => logs.some(l => l.includes('total bits:')),
    },
  ],
}
