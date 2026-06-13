// DSA + Design Patterns — Lesson 36
// Segment Tree + Composite

export const lesson = {
  id: 'dsa-patterns-36',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '36. Segment Tree + Composite',
  checkpoints: [
    { id: 'cp-segtree',   label: 'Segment Tree' },
    { id: 'cp-query',     label: 'Range Query & Update' },
    { id: 'cp-composite', label: 'Composite Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'You have an array that changes over time and you need to answer questions like "what is the sum of elements from index 3 to index 9?" — thousands of times, with updates between queries. The prefix-sum trick answers range queries in O(1), but every update forces rebuilding the whole prefix array in O(n). Brute-force range iteration is O(n) per query. Neither approach scales when both queries and updates are frequent. You need a structure that handles both in O(log n). The same problem appears in stock price aggregators, game leaderboards, and database query engines.',
      code: null,
    },

    // ── Step 1: Segment tree structure ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-structure',
      text: 'A segment tree is a binary tree where each node stores an aggregate (sum, minimum, or maximum) for a contiguous subarray — a segment — of the original array. The root covers the entire array [0, n-1]. Its left child covers [0, mid] and its right child covers [mid+1, n-1]. Leaf nodes store individual elements. Internal nodes store the sum (or min/max) of their children. The tree has height ceil(log2(n)), so all operations touch at most O(log n) nodes. The tree is stored in a flat array of size 4n — node at index k has left child at 2k and right child at 2k+1 (1-indexed). This array-backed representation avoids pointer allocation overhead.',
      code: `// Segment tree stored in a flat array (1-indexed)
// For array of size n, allocate 4*n slots (safe upper bound)
// Node k covers some range [l, r]:
//   left child  = 2k   covers [l, mid]
//   right child = 2k+1 covers [mid+1, r]
//   leaf: l === r       stores arr[l] directly

function buildVisual(arr) {
  const n = arr.length
  const tree = new Array(4 * n).fill(0)

  function build(node, l, r) {
    if (l === r) {
      tree[node] = arr[l]        // leaf: store the element itself
      return
    }
    const mid = (l + r) >> 1   // >> 1 = floor(/ 2) — mid splits the range
    build(2 * node, l, mid)     // build left child
    build(2 * node + 1, mid + 1, r)  // build right child
    tree[node] = tree[2 * node] + tree[2 * node + 1]  // internal: sum of children
  }

  build(1, 0, n - 1)   // root is at index 1
  return tree
}

const arr = [1, 3, 5, 7, 9, 11]
const tree = buildVisual(arr)
console.log('tree[1] (root = total sum):', tree[1])   // 36
console.log('tree[2] (left half sum):', tree[2])      // 16  (1+3+5+7)
console.log('tree[3] (right half sum):', tree[3])     // 20  (9+11... wait, depends on split)
console.log('tree[4] (left quarter):', tree[4])       // 4   (1+3)`,
    },

    // ── Step 2: Build O(n) ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-build',
      text: 'The build step fills the tree bottom-up in O(n) time — each element is visited once as a leaf, and each internal node is filled from its two already-computed children in O(1). The total work is proportional to the number of nodes, which is at most 2n-1 in a full binary tree (n leaves and n-1 internal nodes), so O(n). We allocate 4n slots to safely handle all possible tree shapes when n is not a power of 2.',
      code: `class SegmentTree {
  constructor(arr) {
    this.n    = arr.length
    this.tree = new Array(4 * this.n).fill(0)   // ← NEW  flat array storage
    this._build(arr, 1, 0, this.n - 1)          // ← NEW  root at index 1
  }

  _build(arr, node, l, r) {                     // ← NEW
    if (l === r) {                              // ← NEW  leaf: single element
      this.tree[node] = arr[l]                 // ← NEW
      return                                   // ← NEW
    }
    const mid = (l + r) >> 1                   // ← NEW  integer mid-point
    this._build(arr, 2 * node, l, mid)         // ← NEW  recurse left
    this._build(arr, 2 * node + 1, mid+1, r)  // ← NEW  recurse right
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1]  // ← NEW  aggregate
  }
}

const st = new SegmentTree([1, 3, 5, 7, 9, 11])
console.log('root sum:', st.tree[1])   // 36 = 1+3+5+7+9+11
console.log('tree size used:', st.n)   // 6`,
    },

    // ── Step 3: Range query O(log n) ─────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-query',
      text: 'A range sum query [ql, qr] descends the tree from the root. At each node covering [l, r]: if the node\'s range is entirely inside [ql, qr], return tree[node] — no need to go deeper. If the node\'s range is entirely outside [ql, qr], return 0 (neutral element for sum). Otherwise, the ranges partially overlap — recurse into both children and add the results. At most 4 nodes are visited per level of the tree, so the total is O(4 log n) = O(log n). This is the key insight: many nodes are skipped entirely because their ranges are fully inside or fully outside the query.',
      code: `class SegmentTree {
  constructor(arr) {
    this.n = arr.length; this.tree = new Array(4 * this.n).fill(0)
    this._build(arr, 1, 0, this.n - 1)
  }
  _build(arr, node, l, r) {
    if (l === r) { this.tree[node] = arr[l]; return }
    const mid = (l + r) >> 1
    this._build(arr, 2*node, l, mid); this._build(arr, 2*node+1, mid+1, r)
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1]
  }

  // query sum of arr[ql..qr] (inclusive, 0-indexed)
  query(ql, qr) {                                          // ← NEW
    return this._query(1, 0, this.n - 1, ql, qr)          // ← NEW
  }

  _query(node, l, r, ql, qr) {                            // ← NEW
    if (qr < l || r < ql) return 0                        // ← NEW  fully outside: skip
    if (ql <= l && r <= qr) return this.tree[node]        // ← NEW  fully inside: use node
    const mid = (l + r) >> 1                              // ← NEW  partial overlap: split
    return this._query(2*node, l, mid, ql, qr)            // ← NEW  left child
         + this._query(2*node+1, mid+1, r, ql, qr)       // ← NEW  right child
  }
}

const st = new SegmentTree([1, 3, 5, 7, 9, 11])
console.log(st.query(0, 5))   // 36  (entire array)
console.log(st.query(1, 4))   // 24  (3+5+7+9) — 1-based indices 1..4 = 0-based 1..4
console.log(st.query(2, 2))   // 5   (single element at index 2)
console.log(st.query(0, 0))   // 1   (first element)`,
    },

    // ── Step 4: Point update O(log n) ────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-update',
      text: 'A point update changes arr[i] to val. Walk from root to the leaf at index i. At each internal node, descend into the child whose range contains i. When the leaf is reached, set tree[leaf] = val. On the way back up the recursion, recompute each internal node\'s aggregate from its two children (O(1) per node). The path from root to leaf has length O(log n), so the update touches O(log n) nodes total. This is why the segment tree beats prefix sums for mutable arrays: each update is O(log n) instead of O(n).',
      code: `class SegmentTree {
  constructor(arr) {
    this.n = arr.length; this.tree = new Array(4 * this.n).fill(0)
    this._build(arr, 1, 0, this.n - 1)
  }
  _build(arr, node, l, r) {
    if (l === r) { this.tree[node] = arr[l]; return }
    const mid = (l + r) >> 1
    this._build(arr, 2*node, l, mid); this._build(arr, 2*node+1, mid+1, r)
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1]
  }
  query(ql, qr) { return this._query(1, 0, this.n-1, ql, qr) }
  _query(node, l, r, ql, qr) {
    if (qr < l || r < ql) return 0
    if (ql <= l && r <= qr) return this.tree[node]
    const mid = (l+r)>>1
    return this._query(2*node,l,mid,ql,qr) + this._query(2*node+1,mid+1,r,ql,qr)
  }

  // Update arr[i] to val — O(log n)
  update(i, val) {                                         // ← NEW
    this._update(1, 0, this.n - 1, i, val)                // ← NEW
  }

  _update(node, l, r, i, val) {                           // ← NEW
    if (l === r) { this.tree[node] = val; return }        // ← NEW  leaf: set value
    const mid = (l + r) >> 1                              // ← NEW
    if (i <= mid)                                         // ← NEW  i is in left half?
      this._update(2*node, l, mid, i, val)               // ← NEW  go left
    else                                                  // ← NEW
      this._update(2*node+1, mid+1, r, i, val)           // ← NEW  go right
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1]  // ← NEW  recompute up
  }
}

const st = new SegmentTree([1, 3, 5, 7, 9, 11])
console.log('before update:', st.query(1, 4))   // 24  (3+5+7+9)
st.update(2, 10)                                // change index 2 from 5 to 10
console.log('after update:', st.query(1, 4))    // 29  (3+10+7+9)
console.log('total sum:', st.query(0, 5))       // 41  (1+3+10+7+9+11)`,
    },

    // ── Challenge 1: build and query ──────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-build-query',
      text: 'Build a SegmentTree on [1, 3, 5, 7, 9, 11] and query sum [1, 4] (0-indexed, inclusive). Expected answer: 3+5+7+9 = 24. Log the result labelled. Also log the total sum query(0, 5) = 36.',
      expectedOutput: null,
      startCode: `class SegmentTree {
  constructor(arr) {
    this.n = arr.length
    this.tree = new Array(4 * this.n).fill(0)
    this._build(arr, 1, 0, this.n - 1)
  }
  _build(arr, node, l, r) {
    if (l === r) { this.tree[node] = arr[l]; return }
    const mid = (l + r) >> 1
    this._build(arr, 2*node, l, mid)
    this._build(arr, 2*node+1, mid+1, r)
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1]
  }
  query(ql, qr) { return this._query(1, 0, this.n-1, ql, qr) }
  _query(node, l, r, ql, qr) {
    if (qr < l || r < ql) return 0
    if (ql <= l && r <= qr) return this.tree[node]
    const mid = (l+r)>>1
    return this._query(2*node,l,mid,ql,qr) + this._query(2*node+1,mid+1,r,ql,qr)
  }
}

// YOUR CODE HERE: build on [1,3,5,7,9,11], query [1,4] and [0,5]
`,
      hint: 'const st = new SegmentTree([1,3,5,7,9,11]); console.log("sum[1,4]:", st.query(1,4)); console.log("sum[0,5]:", st.query(0,5));',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(24) && nums.includes(36)
      },
    },

    { type: 'checkpoint', id: 'cp-segtree' },

    // ── Challenge 2: update then query ────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-update-query',
      text: 'Using the same SegmentTree on [1,3,5,7,9,11]: update index 2 (value 5) to 10, then query sum [1,4]. Expected: 3+10+7+9 = 29. Also update index 5 (value 11) to 1, then query the total sum [0,5]. Expected: 1+3+10+7+9+1 = 31. Log both results labelled.',
      expectedOutput: null,
      startCode: `class SegmentTree {
  constructor(arr) {
    this.n = arr.length; this.tree = new Array(4 * this.n).fill(0)
    this._build(arr, 1, 0, this.n - 1)
  }
  _build(arr, node, l, r) {
    if (l === r) { this.tree[node] = arr[l]; return }
    const mid = (l + r) >> 1
    this._build(arr, 2*node, l, mid); this._build(arr, 2*node+1, mid+1, r)
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1]
  }
  query(ql, qr) { return this._query(1, 0, this.n-1, ql, qr) }
  _query(node, l, r, ql, qr) {
    if (qr < l || r < ql) return 0
    if (ql <= l && r <= qr) return this.tree[node]
    const mid = (l+r)>>1
    return this._query(2*node,l,mid,ql,qr) + this._query(2*node+1,mid+1,r,ql,qr)
  }
  update(i, val) { this._update(1, 0, this.n-1, i, val) }
  _update(node, l, r, i, val) {
    if (l === r) { this.tree[node] = val; return }
    const mid = (l+r)>>1
    if (i <= mid) this._update(2*node, l, mid, i, val)
    else this._update(2*node+1, mid+1, r, i, val)
    this.tree[node] = this.tree[2*node] + this.tree[2*node+1]
  }
}

// YOUR CODE HERE: create tree, update twice, query twice with labelled output
`,
      hint: 'const st = new SegmentTree([1,3,5,7,9,11]); st.update(2,10); console.log("after first update:", st.query(1,4)); st.update(5,1); console.log("after second update:", st.query(0,5));',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(29) && nums.includes(31)
      },
    },

    { type: 'checkpoint', id: 'cp-query' },

    // ── Step 5: Composite pattern — introduction ──────────────────────────────

    {
      type: 'narration',
      id: 'step5-composite-intro',
      text: 'The Composite design pattern (Gang of Four structural pattern) allows individual objects and compositions of objects to be treated uniformly through a shared interface. The classic example is a file system: File and Directory both implement a "component" interface with size() and print(). A Directory contains Files and other Directories but the caller recursively calls size() on any component without knowing whether it is a leaf or a composite. The pattern eliminates the need for if-is-leaf branches in the client — the object itself knows how to handle the recursive call.',
      code: `// Classic Composite: file system sketch
class FileComponent {
  size()  { throw new Error('size() not implemented') }
  print() { throw new Error('print() not implemented') }
}

class File extends FileComponent {
  constructor(name, bytes) { super(); this.name = name; this.bytes = bytes }
  size()  { return this.bytes }
  print() { console.log('file: ' + this.name + ' (' + this.bytes + 'B)') }
}

class Directory extends FileComponent {
  constructor(name) { super(); this.name = name; this.children = [] }
  add(c)  { this.children.push(c) }
  size()  { return this.children.reduce((s, c) => s + c.size(), 0) }  // recursive
  print() {
    console.log('dir: ' + this.name + ' (' + this.size() + 'B)')
    this.children.forEach(c => c.print())
  }
}

const root = new Directory('root')
root.add(new File('readme.txt', 100))
const src = new Directory('src')
src.add(new File('main.js', 2000))
src.add(new File('utils.js', 800))
root.add(src)
root.print()   // uniform recursion — Directory and File share the same interface`,
    },

    // ── Step 6: Composite nodes for segment tree ──────────────────────────────

    {
      type: 'narration',
      id: 'step6-composite-segtree',
      text: 'The segment tree has exactly the Composite pattern structure: a LeafNode holds one array element, an InternalNode holds two children and their aggregate. Both implement query(ql, qr) and update(i, val) with the same signature. The InternalNode delegates to its children — identical recursion whether the child is a leaf or another internal node. This is the Composite pattern: the caller never needs to check if a node is a leaf. The flat-array implementation we built earlier is an optimised encoding of this structure — the Composite version makes the pattern explicit.',
      code: `// Composite segment tree — explicit node objects
// Leaf and InternalNode share the same interface: query(ql,qr) and update(i,val)

class LeafNode {
  constructor(index, value) {                   // ← NEW
    this.l = index; this.r = index             // ← NEW  covers single element
    this.sum = value                            // ← NEW
  }
  query(ql, qr) {                              // ← NEW
    if (ql > this.r || qr < this.l) return 0  // ← NEW  out of range
    return this.sum                            // ← NEW  in range: return element
  }
  update(i, val) {                             // ← NEW
    if (i === this.l) this.sum = val           // ← NEW  it's this element
  }
}

class InternalNode {
  constructor(left, right) {                   // ← NEW
    this.left  = left                          // ← NEW  left child (Leaf or Internal)
    this.right = right                         // ← NEW  right child
    this.l = left.l                            // ← NEW  cover start
    this.r = right.r                           // ← NEW  cover end
    this.sum = left.sum + right.sum            // ← NEW  aggregate
  }
  query(ql, qr) {                              // ← NEW  same interface as LeafNode
    if (ql > this.r || qr < this.l) return 0  // ← NEW  fully outside
    if (ql <= this.l && this.r <= qr) return this.sum  // ← NEW  fully inside
    return this.left.query(ql, qr) + this.right.query(ql, qr)  // ← NEW  partial
  }
  update(i, val) {                             // ← NEW  same interface as LeafNode
    if (i < this.left.r + 1) this.left.update(i, val)  // ← NEW  delegate left
    else this.right.update(i, val)             // ← NEW  delegate right
    this.sum = this.left.sum + this.right.sum  // ← NEW  recompute aggregate
  }
}

function buildComposite(arr, l, r) {
  if (l === r) return new LeafNode(l, arr[l])
  const mid = (l + r) >> 1
  return new InternalNode(
    buildComposite(arr, l, mid),
    buildComposite(arr, mid+1, r)
  )
}

const root = buildComposite([1, 3, 5, 7, 9, 11], 0, 5)
console.log('query [1,4]:', root.query(1, 4))   // 24
root.update(2, 10)
console.log('after update, query [1,4]:', root.query(1, 4))   // 29`,
    },

    // ── Meeting point ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-meeting-point',
      text: 'The meeting point: the segment tree\'s recursive structure IS the Composite pattern. Each internal node IS a composite of two children; each leaf IS a primitive. The query and update methods recurse identically — no if-is-leaf check in the client. The flat-array implementation (with 2k, 2k+1 indexing) is a space-optimised encoding of the same Composite tree that avoids object allocation. Choose the Composite object model when you need multiple aggregation types (sum, min, max) as polymorphic nodes; choose the flat array when performance is critical. Both express the same recursive decomposition.',
      code: `// Side-by-side: flat array vs Composite — same logic, different representation
// Flat array (fast, cache-friendly, no allocation overhead)
class SegTree {
  constructor(arr) { this.n=arr.length; this.t=new Array(4*this.n).fill(0); this._b(arr,1,0,this.n-1) }
  _b(a,k,l,r){if(l===r){this.t[k]=a[l];return}const m=(l+r)>>1;this._b(a,2*k,l,m);this._b(a,2*k+1,m+1,r);this.t[k]=this.t[2*k]+this.t[2*k+1]}
  query(ql,qr){return this._q(1,0,this.n-1,ql,qr)}
  _q(k,l,r,ql,qr){if(qr<l||r<ql)return 0;if(ql<=l&&r<=qr)return this.t[k];const m=(l+r)>>1;return this._q(2*k,l,m,ql,qr)+this._q(2*k+1,m+1,r,ql,qr)}
}

// Composite (explicit, extendable, readable)
class Leaf {constructor(i,v){this.l=this.r=i;this.sum=v}query(ql,qr){return(ql>this.r||qr<this.l)?0:this.sum}update(i,v){if(i===this.l)this.sum=v}}
class Node {constructor(a,b){this.a=a;this.b=b;this.l=a.l;this.r=b.r;this.sum=a.sum+b.sum}query(ql,qr){if(ql>this.r||qr<this.l)return 0;if(ql<=this.l&&this.r<=qr)return this.sum;return this.a.query(ql,qr)+this.b.query(ql,qr)}update(i,v){if(i<=this.a.r)this.a.update(i,v);else this.b.update(i,v);this.sum=this.a.sum+this.b.sum}}
function bc(arr,l,r){return l===r?new Leaf(l,arr[l]):new Node(bc(arr,l,(l+r)>>1),bc(arr,((l+r)>>1)+1,r))}

const arr = [1, 3, 5, 7, 9, 11]
const flat = new SegTree(arr)
const comp = bc(arr, 0, arr.length - 1)

console.log('flat query[1,4]:', flat.query(1, 4))   // 24
console.log('comp query[1,4]:', comp.query(1, 4))   // 24 — same result, same algorithm`,
    },

    // ── Challenge 3: composite query ──────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-composite',
      text: 'Use the Composite segment tree (buildComposite, LeafNode, InternalNode) on [1,3,5,7,9,11]. Query [0,5] (expect 36), update index 0 to 10, then query [0,2] (expect 10+3+5=18). Log all three results labelled.',
      expectedOutput: null,
      startCode: `class LeafNode {
  constructor(index, value) { this.l = index; this.r = index; this.sum = value }
  query(ql, qr) { return (ql > this.r || qr < this.l) ? 0 : this.sum }
  update(i, val) { if (i === this.l) this.sum = val }
}

class InternalNode {
  constructor(left, right) {
    this.left = left; this.right = right
    this.l = left.l; this.r = right.r
    this.sum = left.sum + right.sum
  }
  query(ql, qr) {
    if (ql > this.r || qr < this.l) return 0
    if (ql <= this.l && this.r <= qr) return this.sum
    return this.left.query(ql, qr) + this.right.query(ql, qr)
  }
  update(i, val) {
    if (i <= this.left.r) this.left.update(i, val)
    else this.right.update(i, val)
    this.sum = this.left.sum + this.right.sum
  }
}

function buildComposite(arr, l, r) {
  if (l === r) return new LeafNode(l, arr[l])
  const mid = (l + r) >> 1
  return new InternalNode(buildComposite(arr, l, mid), buildComposite(arr, mid+1, r))
}

// YOUR CODE HERE: build on [1,3,5,7,9,11], query [0,5], update index 0 to 10, query [0,2]
`,
      hint: 'const root = buildComposite([1,3,5,7,9,11], 0, 5); console.log("total:", root.query(0,5)); root.update(0,10); console.log("after update [0,2]:", root.query(0,2));',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(36) && nums.includes(18)
      },
    },

    { type: 'checkpoint', id: 'cp-composite' },

    // ── Step 8: Combined — range min with Composite ───────────────────────────

    {
      type: 'narration',
      id: 'step8-combined',
      text: 'The Composite pattern makes it trivial to change the aggregation function. To switch from sum to minimum, change only the aggregate computation in InternalNode — query and update logic stay identical. This polymorphism is a direct benefit of the Composite pattern: the tree structure and traversal are independent of the aggregation type. A GenericNode class parameterised by a combiner function enables sum trees, min trees, max trees, and gcd trees with zero code duplication.',
      code: `// Generic composite node — aggregation is a parameter
class GLeaf {
  constructor(i, v) { this.l = this.r = i; this.val = v }
  query(ql, qr, neutral) { return (ql > this.r || qr < this.l) ? neutral : this.val }
  update(i, v) { if (i === this.l) this.val = v }
}

class GNode {
  constructor(left, right, combine, neutral) {
    this.left = left; this.right = right
    this.l = left.l; this.r = right.r
    this.combine = combine; this.neutral = neutral
    this.val = combine(left.val, right.val)
  }
  query(ql, qr) {
    if (ql > this.r || qr < this.l) return this.neutral
    if (ql <= this.l && this.r <= qr) return this.val
    return this.combine(this.left.query(ql, qr, this.neutral), this.right.query(ql, qr, this.neutral))
  }
  update(i, v) {
    if (i <= this.left.r) this.left.update(i, v)
    else this.right.update(i, v)
    this.val = this.combine(this.left.val, this.right.val)
  }
}

function buildGeneric(arr, l, r, combine, neutral) {
  if (l === r) return new GLeaf(l, arr[l])
  const mid = (l + r) >> 1
  const left  = buildGeneric(arr, l, mid, combine, neutral)
  const right = buildGeneric(arr, mid+1, r, combine, neutral)
  return new GNode(left, right, combine, neutral)
}

const arr = [4, 2, 7, 1, 9, 3]
const sumTree = buildGeneric(arr, 0, 5, (a,b) => a + b, 0)
const minTree = buildGeneric(arr, 0, 5, (a,b) => Math.min(a,b), Infinity)

console.log('sum [0,5]:', sumTree.query(0, 5))   // 26
console.log('min [0,5]:', minTree.query(0, 5))   // 1
console.log('sum [1,3]:', sumTree.query(1, 3))   // 10  (2+7+1)
console.log('min [1,3]:', minTree.query(1, 3))   // 1`,
    },

    // ── Challenge 4: combined ─────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'ch-combined',
      text: 'Build a min segment tree using buildGeneric on [4,2,7,1,9,3]. Query min [0,5] (expect 1), min [2,5] (expect 1), and min [0,1] (expect 2). Then update index 3 to 10, and re-query min [0,5] (expect 2). Log all four results labelled.',
      expectedOutput: null,
      startCode: `class GLeaf {
  constructor(i, v) { this.l = this.r = i; this.val = v }
  query(ql, qr, neutral) { return (ql > this.r || qr < this.l) ? neutral : this.val }
  update(i, v) { if (i === this.l) this.val = v }
}
class GNode {
  constructor(left, right, combine, neutral) {
    this.left=left;this.right=right;this.l=left.l;this.r=right.r
    this.combine=combine;this.neutral=neutral;this.val=combine(left.val,right.val)
  }
  query(ql, qr) {
    if (ql > this.r || qr < this.l) return this.neutral
    if (ql <= this.l && this.r <= qr) return this.val
    return this.combine(this.left.query(ql,qr,this.neutral), this.right.query(ql,qr,this.neutral))
  }
  update(i, v) {
    if (i <= this.left.r) this.left.update(i,v); else this.right.update(i,v)
    this.val = this.combine(this.left.val, this.right.val)
  }
}
function buildGeneric(arr, l, r, combine, neutral) {
  if (l === r) return new GLeaf(l, arr[l])
  const mid = (l+r)>>1
  return new GNode(buildGeneric(arr,l,mid,combine,neutral), buildGeneric(arr,mid+1,r,combine,neutral), combine, neutral)
}

// YOUR CODE HERE: build min tree on [4,2,7,1,9,3], run four queries with updates
`,
      hint: 'const mt = buildGeneric([4,2,7,1,9,3],0,5,(a,b)=>Math.min(a,b),Infinity); console.log(mt.query(0,5)); console.log(mt.query(2,5)); console.log(mt.query(0,1)); mt.update(3,10); console.log(mt.query(0,5));',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim())).filter(n => !isNaN(n))
        return nums.includes(1) && nums.includes(2)
      },
    },

    // ── CodeLens setup ────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens and step through the segment tree build. Watch the recursion split the array in half repeatedly until reaching leaves. See each leaf get its value assigned. Then watch the return path: each internal node computes its sum from two children. Then trace a query: see how nodes outside the query range return 0 immediately, nodes fully inside return their stored value, and partial-overlap nodes split and recurse.',
      code: null,
    },

    {
      type: 'codelens',
      id: 'cl-segtree',
      text: 'Step through build, query, and update. Observe the recursion depth (O(log n) levels). See how query [1,4] visits only O(log n) nodes despite the array having 6 elements. Watch the update path: only the nodes on the path from root to the changed leaf are recomputed.',
      code: `class SegmentTree {
  constructor(arr){this.n=arr.length;this.tree=new Array(4*this.n).fill(0);this._build(arr,1,0,this.n-1)}
  _build(arr,node,l,r){if(l===r){this.tree[node]=arr[l];return}const mid=(l+r)>>1;this._build(arr,2*node,l,mid);this._build(arr,2*node+1,mid+1,r);this.tree[node]=this.tree[2*node]+this.tree[2*node+1]}
  query(ql,qr){return this._query(1,0,this.n-1,ql,qr)}
  _query(node,l,r,ql,qr){if(qr<l||r<ql)return 0;if(ql<=l&&r<=qr)return this.tree[node];const mid=(l+r)>>1;return this._query(2*node,l,mid,ql,qr)+this._query(2*node+1,mid+1,r,ql,qr)}
  update(i,val){this._update(1,0,this.n-1,i,val)}
  _update(node,l,r,i,val){if(l===r){this.tree[node]=val;return}const mid=(l+r)>>1;if(i<=mid)this._update(2*node,l,mid,i,val);else this._update(2*node+1,mid+1,r,i,val);this.tree[node]=this.tree[2*node]+this.tree[2*node+1]}
}
const st = new SegmentTree([1,3,5,7,9,11])
console.log(st.query(1,4))
st.update(2,10)
console.log(st.query(1,4))
console.log(st.query(0,5))`,
      lang: 'js',
    },

  ],
}
