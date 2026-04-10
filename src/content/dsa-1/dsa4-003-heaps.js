export default {
  id: 'dsa4-003',
  slug: 'heaps',
  chapter: 'dsa4',
  order: 3,
  title: 'Heaps & Priority Queues',
  subtitle: 'Always get the min (or max) in O(1). Insert and remove in O(log n). No sorting required.',
  tags: ['heap', 'min-heap', 'max-heap', 'priority queue', 'sift up', 'sift down', 'extractMin', 'insert', 'topK'],
  aliases: 'heap min heap max heap priority queue sift up sift down extract insert top k heapify',

  hook: {
    question: 'You need to repeatedly pull the smallest item from a collection while also inserting new items. A sorted array gives O(1) min but O(n) insert. A hash map gives O(1) insert but no ordering. What data structure gives you both efficiently?',
    realWorldContext: 'Dijkstra\'s shortest-path algorithm uses a priority queue to always process the next-closest node. OS task schedulers use heaps to pick the highest-priority runnable process. Merge k sorted streams (like log files) into one uses a heap — each stream\'s next element competes for the minimum. Finding the top-K elements in a stream, running medians, event-driven simulation — all use heaps. Python\'s heapq and Java\'s PriorityQueue are both min-heaps under the hood.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You\'ve built trees with arbitrary structure (binary trees) and ordered structure (BSTs). A heap is a third shape: a **complete binary tree** that satisfies the **heap property** — every parent is smaller than (or equal to) its children in a min-heap.',
      '**The heap is stored as a flat array.** No pointers needed. For a node at index i: its left child is at 2i+1, its right child is at 2i+2, its parent is at ⌊(i-1)/2⌋. The root (minimum) is always at index 0.',
      '**Insert: append, then sift up.** Add the new value to the end of the array (maintaining the complete tree shape). Then fix the heap property: while the new value is smaller than its parent, swap them and move up. At most O(log n) swaps because the height of the tree is log n.',
      '**Extract min: swap root with last, pop, then sift down.** The minimum is always the root. To remove it: swap it with the last element, pop the last element (saving the min), then fix the heap property by sifting down — repeatedly swap with the smaller child until the heap property holds.',
      '**Top-K elements in O(n log k).** Keep a min-heap of size K. For each new element: if it\'s larger than the heap minimum (i.e., the smallest of the K largest seen so far), pop the min and push the new element. After all n elements, the heap contains the K largest.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 4, Lesson 3: Heaps',
        body: '**Previous:** BSTs — sorted trees for search/insert/delete.\n**This lesson:** Heaps — array-backed trees for priority queues.\n**Next chapter:** Graphs — nodes with arbitrary connections.',
      },
      {
        type: 'insight',
        title: 'Why not just use a sorted array?',
        body: 'A sorted array gives O(1) min access but O(n) insert (shift elements). A heap gives O(1) min access and O(log n) insert — that tradeoff is why heaps dominate any problem that mixes insertions with priority queries.',
      },
      {
        type: 'strategy',
        title: 'Index math instead of pointers',
        body: 'parent(i) = ⌊(i-1)/2⌋\nleft(i)   = 2i + 1\nright(i)  = 2i + 2\n\nMemorize these three formulas. They replace all the pointer wiring you\'d need in a node-based tree.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Min-Heap: Array Layout and Sift Operations',
        mathBridge: 'Watch how insert appends to the array then swaps upward. Extract swaps the root to the end then swaps downward. Both operations touch at most O(log n) nodes.',
        caption: 'Three cells: the array-to-tree mapping, sift-up during insert, sift-down during extract.',
        props: {
          lesson: {
            title: 'How a Min-Heap Works',
            subtitle: 'A complete binary tree in an array — parent is always ≤ children',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Array Layout: Index Math Replaces Pointers',
                instruction: 'A min-heap is just an array. The tree structure is implicit — no pointers. Index formulas give you parent and children.\n\nFor node at index i:\n- Left child: 2i + 1\n- Right child: 2i + 2\n- Parent: ⌊(i-1)/2⌋',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const heap=[1,3,5,7,9,8,6];
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Min-Heap Array</h3><div style="display:flex;gap:6px;margin-bottom:16px;align-items:flex-end">';
heap.forEach((v,i)=>{html+='<div style="text-align:center"><div style="background:#1e3a5f;border:1px solid #60a5fa;border-radius:4px;padding:8px 12px;color:#e2e8f0;font-weight:bold">'+v+'</div><div style="color:#64748b;font-size:11px;margin-top:4px">i='+i+'</div></div>';});
html+='</div><table style="border-collapse:collapse;width:100%;font-size:13px"><tr style="color:#94a3b8"><th style="text-align:left;padding:4px 8px">i</th><th style="text-align:left;padding:4px 8px">val</th><th style="text-align:left;padding:4px 8px">parent</th><th style="text-align:left;padding:4px 8px">left child</th><th style="text-align:left;padding:4px 8px">right child</th></tr>';
heap.forEach((v,i)=>{const p=i===0?'—':Math.floor((i-1)/2);const l=2*i+1<heap.length?2*i+1:'—';const r=2*i+2<heap.length?2*i+2:'—';html+='<tr style="border-top:1px solid #334155"><td style="padding:4px 8px;color:#94a3b8">'+i+'</td><td style="padding:4px 8px;color:#e2e8f0;font-weight:bold">'+v+'</td><td style="padding:4px 8px;color:#f59e0b">'+p+'</td><td style="padding:4px 8px;color:#4ade80">'+l+'</td><td style="padding:4px 8px;color:#4ade80">'+r+'</td></tr>';});
html+='</table><p style="color:#94a3b8;margin-top:10px;font-size:13px">No pointers — parent/child relationship is computed from the index.</p>';
display.innerHTML=html;`,
                outputHeight: 320,
              },
              {
                type: 'js',
                title: 'Insert: Append then Sift Up',
                instruction: 'Inserting 2 into [1,3,5,7,9,8,6]. The new element is appended at the end, then swaps with its parent while it\'s smaller than the parent.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
function swap(arr,i,j){[arr[i],arr[j]]=[arr[j],arr[i]];}
function heapInsert(heap,val){
  heap.push(val);let i=heap.length-1;
  const steps=[{heap:[...heap],i,note:'Added '+val+' at end (index '+i+')'}];
  while(i>0){const p=Math.floor((i-1)/2);if(heap[i]<heap[p]){swap(heap,i,p);steps.push({heap:[...heap],i:p,note:heap[p]+' < parent '+heap[i]+' — swapped. Now at index '+p});i=p;}else{steps.push({heap:[...heap],i,note:heap[i]+' ≥ parent — heap property restored.'});break;}}
  if(i===0)steps.push({heap:[...heap],i:0,note:'Reached root — done.'});
  return steps;
}
const base=[1,3,5,7,9,8,6];const steps=heapInsert([...base],2);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Inserting 2 into ['+base.join(', ')+']</h3>';
steps.forEach((s,idx)=>{const arrStr=s.heap.map((v,i)=>i===s.i?'<b style="color:#f59e0b">'+v+'</b>':'<span style="color:#e2e8f0">'+v+'</span>').join(', ');html+='<div style="margin-bottom:6px;padding:8px;background:#1e293b;border-radius:4px"><div style="color:#94a3b8;font-size:12px;margin-bottom:4px">Step '+(idx+1)+': '+s.note+'</div><div style="font-family:monospace">['+arrStr+']</div></div>';});
display.innerHTML=html;`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: 'Extract Min: Swap Root with Last, Sift Down',
                instruction: 'The minimum is always at index 0. To remove it: swap with the last element, pop the last (saving the min), then sift down — repeatedly swap with the smaller child.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
function swap(arr,i,j){[arr[i],arr[j]]=[arr[j],arr[i]];}
function extractMin(heap){
  const min=heap[0];const last=heap.pop();const steps=[];
  if(!heap.length)return{min,steps};
  heap[0]=last;steps.push({heap:[...heap],i:0,note:'Moved last element ('+last+') to root'});
  let i=0;
  while(true){const l=2*i+1,r=2*i+2;let s=i;if(l<heap.length&&heap[l]<heap[s])s=l;if(r<heap.length&&heap[r]<heap[s])s=r;if(s!==i){swap(heap,i,s);steps.push({heap:[...heap],i:s,note:'Swapped down — now at index '+s});i=s;}else{steps.push({heap:[...heap],i,note:heap[i]+' ≤ both children — done.'});break;}}
  return{min,steps};
}
const heap=[1,3,5,7,9,8,6];const{min,steps}=extractMin([...heap]);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Extract min from ['+heap.join(', ')+'] → min = <b style="color:#4ade80">'+min+'</b></h3>';
steps.forEach((s,idx)=>{const arrStr=s.heap.map((v,i)=>i===s.i?'<b style="color:#f59e0b">'+v+'</b>':'<span style="color:#e2e8f0">'+v+'</span>').join(', ');html+='<div style="margin-bottom:6px;padding:8px;background:#1e293b;border-radius:4px"><div style="color:#94a3b8;font-size:12px;margin-bottom:4px">Step '+(idx+1)+': '+s.note+'</div><div style="font-family:monospace">['+arrStr+']</div></div>';});
display.innerHTML=html;`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build a MinHeap in JavaScript',
        caption: 'Implement insert with sift-up, extractMin with sift-down, then topK — then build everything from scratch.',
        props: {
          lesson: {
            title: 'Heaps in JavaScript',
            subtitle: 'Array-backed min-heap — no pointers.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — MinHeap class and insert()

Store the heap as a flat array. Formulas:
- \`_parent(i)\` = \`Math.floor((i-1)/2)\`
- \`_left(i)\` = \`2*i+1\`
- \`_right(i)\` = \`2*i+2\`

**\`_siftUp(i)\`:** while \`i > 0\` and \`heap[i] < heap[parent]\`, swap and move up.

**\`insert(val)\`:** push val, then call \`_siftUp\` on the last index.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class MinHeap {
  constructor() { this.heap = []; }

  _swap(i, j) { [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }
  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i)   { return 2 * i + 1; }
  _right(i)  { return 2 * i + 2; }

  _siftUp(i) {
    // TODO: while i > 0 and heap[i] < heap[parent(i)]: swap and move up
  }

  insert(val) {
    // TODO: push val, then _siftUp(last index)
  }

  min()  { return this.heap[0]; }
  size() { return this.heap.length; }
}

const h = new MinHeap();
[5,3,8,1,9,2].forEach(v => h.insert(v));

const out = document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('min', h.min(), 1);
test('size', h.size(), 6);
test('heap[0] is min', h.heap[0], 1);`,
                solutionCode: `class MinHeap{constructor(){this.heap=[];}
_swap(i,j){[this.heap[i],this.heap[j]]=[this.heap[j],this.heap[i]];}
_parent(i){return Math.floor((i-1)/2);}
_left(i){return 2*i+1;}_right(i){return 2*i+2;}
_siftUp(i){while(i>0&&this.heap[i]<this.heap[this._parent(i)]){this._swap(i,this._parent(i));i=this._parent(i);}}
insert(val){this.heap.push(val);this._siftUp(this.heap.length-1);}
min(){return this.heap[0];}size(){return this.heap.length;}}
const h=new MinHeap();[5,3,8,1,9,2].forEach(v=>h.insert(v));
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('min',h.min(),1);test('size',h.size(),6);test('heap[0] is min',h.heap[0],1);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Step 2 — extractMin() and _siftDown()

**\`_siftDown(i)\`:** find the smaller of i's two children. If the child is smaller than i, swap and continue down. Stop when i is smaller than both children.

**\`extractMin()\`:**
1. Save \`heap[0]\` as the min
2. Pop the last element
3. If the heap isn't empty: place last element at index 0, then sift down
4. Return min`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class MinHeap {
  constructor() { this.heap = []; }
  _swap(i,j){[this.heap[i],this.heap[j]]=[this.heap[j],this.heap[i]];}
  _parent(i){return Math.floor((i-1)/2);}
  _left(i){return 2*i+1;} _right(i){return 2*i+2;}
  _siftUp(i){while(i>0&&this.heap[i]<this.heap[this._parent(i)]){this._swap(i,this._parent(i));i=this._parent(i);}}

  _siftDown(i) {
    // TODO: let smallest = i
    // if left < size and heap[left] < heap[smallest]: smallest = left
    // if right < size and heap[right] < heap[smallest]: smallest = right
    // if smallest !== i: swap, then _siftDown(smallest)
  }

  insert(val) { this.heap.push(val); this._siftUp(this.heap.length - 1); }

  extractMin() {
    // TODO: if empty return null
    // save heap[0] as min
    // pop last — if heap is now empty return min
    // heap[0] = last, _siftDown(0), return min
  }

  min()  { return this.heap[0]; }
  size() { return this.heap.length; }
}

const h = new MinHeap();
[5,3,8,1,9,2,4].forEach(v => h.insert(v));
const sorted = [];
while (h.size()) sorted.push(h.extractMin());

const out = document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('heap sort', sorted, [1,2,3,4,5,8,9]);`,
                solutionCode: `class MinHeap{constructor(){this.heap=[];}
_swap(i,j){[this.heap[i],this.heap[j]]=[this.heap[j],this.heap[i]];}
_parent(i){return Math.floor((i-1)/2);}
_left(i){return 2*i+1;}_right(i){return 2*i+2;}
_siftUp(i){while(i>0&&this.heap[i]<this.heap[this._parent(i)]){this._swap(i,this._parent(i));i=this._parent(i);}}
_siftDown(i){let s=i;const l=this._left(i),r=this._right(i);if(l<this.heap.length&&this.heap[l]<this.heap[s])s=l;if(r<this.heap.length&&this.heap[r]<this.heap[s])s=r;if(s!==i){this._swap(i,s);this._siftDown(s);}}
insert(val){this.heap.push(val);this._siftUp(this.heap.length-1);}
extractMin(){if(!this.heap.length)return null;const min=this.heap[0];const last=this.heap.pop();if(this.heap.length){this.heap[0]=last;this._siftDown(0);}return min;}
min(){return this.heap[0];}size(){return this.heap.length;}}
const h=new MinHeap();[5,3,8,1,9,2,4].forEach(v=>h.insert(v));
const sorted=[];while(h.size())sorted.push(h.extractMin());
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('heap sort',sorted,[1,2,3,4,5,8,9]);`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Top K Elements

Maintain a min-heap of size K. For each element:
- If the heap has fewer than K items: insert it
- Else if the element is larger than the heap minimum: pop the min, insert the element

After all elements, the heap contains the K largest.

**Why this works:** the heap always evicts the smallest of the K best candidates, keeping only the largest K.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class MinHeap{constructor(){this.heap=[];}
_swap(i,j){[this.heap[i],this.heap[j]]=[this.heap[j],this.heap[i]];}
_parent(i){return Math.floor((i-1)/2);}
_left(i){return 2*i+1;}_right(i){return 2*i+2;}
_siftUp(i){while(i>0&&this.heap[i]<this.heap[this._parent(i)]){this._swap(i,this._parent(i));i=this._parent(i);}}
_siftDown(i){let s=i;const l=this._left(i),r=this._right(i);if(l<this.heap.length&&this.heap[l]<this.heap[s])s=l;if(r<this.heap.length&&this.heap[r]<this.heap[s])s=r;if(s!==i){this._swap(i,s);this._siftDown(s);}}
insert(val){this.heap.push(val);this._siftUp(this.heap.length-1);}
extractMin(){if(!this.heap.length)return null;const min=this.heap[0];const last=this.heap.pop();if(this.heap.length){this.heap[0]=last;this._siftDown(0);}return min;}
min(){return this.heap[0];}size(){return this.heap.length;}}

function topK(nums, k) {
  const h = new MinHeap();
  for (const num of nums) {
    // TODO: if h.size() < k → insert
    // else if num > h.min() → extractMin, then insert
  }
  // TODO: drain the heap and return result array
}

const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('topK 3', topK([3,1,5,12,2,11,7],3).sort((a,b)=>a-b), [7,11,12]);
test('topK 4', topK([9,3,2,6,1,8,4],4).sort((a,b)=>a-b),  [4,6,8,9]);`,
                solutionCode: `class MinHeap{constructor(){this.heap=[];}
_swap(i,j){[this.heap[i],this.heap[j]]=[this.heap[j],this.heap[i]];}
_parent(i){return Math.floor((i-1)/2);}
_left(i){return 2*i+1;}_right(i){return 2*i+2;}
_siftUp(i){while(i>0&&this.heap[i]<this.heap[this._parent(i)]){this._swap(i,this._parent(i));i=this._parent(i);}}
_siftDown(i){let s=i;const l=this._left(i),r=this._right(i);if(l<this.heap.length&&this.heap[l]<this.heap[s])s=l;if(r<this.heap.length&&this.heap[r]<this.heap[s])s=r;if(s!==i){this._swap(i,s);this._siftDown(s);}}
insert(val){this.heap.push(val);this._siftUp(this.heap.length-1);}
extractMin(){if(!this.heap.length)return null;const min=this.heap[0];const last=this.heap.pop();if(this.heap.length){this.heap[0]=last;this._siftDown(0);}return min;}
min(){return this.heap[0];}size(){return this.heap.length;}}
function topK(nums,k){const h=new MinHeap();for(const num of nums){if(h.size()<k)h.insert(num);else if(num>h.min()){h.extractMin();h.insert(num);}}const res=[];while(h.size())res.push(h.extractMin());return res;}
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('topK 3',topK([3,1,5,12,2,11,7],3).sort((a,b)=>a-b),[7,11,12]);test('topK 4',topK([9,3,2,6,1,8,4],4).sort((a,b)=>a-b),[4,6,8,9]);`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Challenge — Full MinHeap From Scratch

Empty shells. Write every method:
- \`constructor\`, \`_swap\`, \`_parent\`, \`_left\`, \`_right\`
- \`_siftUp(i)\`, \`_siftDown(i)\`
- \`insert(val)\`, \`extractMin()\`, \`min()\`, \`size()\`
- \`topK(nums, k)\`

6 tests verify everything.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `class MinHeap {
  constructor() { }
  _swap(i, j) { }
  _parent(i) { }
  _left(i) { }
  _right(i) { }
  _siftUp(i) { }
  _siftDown(i) { }
  insert(val) { }
  extractMin() { }
  min() { }
  size() { }
}

function topK(nums, k) { }

const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}\${p?'':' (want '+JSON.stringify(e)+')'}</div>\`;}
try {
  const h=new MinHeap();[5,3,8,1,9,2,4].forEach(v=>h.insert(v));
  test('min after inserts', h.min(), 1);
  test('size after inserts', h.size(), 7);
  const sorted=[];while(h.size())sorted.push(h.extractMin());
  test('heap sort', sorted, [1,2,3,4,5,8,9]);
  const h2=new MinHeap();h2.insert(10);
  test('extractMin single', h2.extractMin(), 10);
  test('topK 3', topK([3,1,5,12,2,11,7],3).sort((a,b)=>a-b), [7,11,12]);
  test('topK 4', topK([9,3,2,6,1,8,4],4).sort((a,b)=>a-b),  [4,6,8,9]);
  const all=results.every(Boolean);
  out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass. MinHeap built from scratch.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;
} catch(e){out.innerHTML+='<div class="fail">Error: '+e.message+'</div>';}`,
                solutionCode: `class MinHeap{constructor(){this.heap=[];}
_swap(i,j){[this.heap[i],this.heap[j]]=[this.heap[j],this.heap[i]];}
_parent(i){return Math.floor((i-1)/2);}
_left(i){return 2*i+1;}_right(i){return 2*i+2;}
_siftUp(i){while(i>0&&this.heap[i]<this.heap[this._parent(i)]){this._swap(i,this._parent(i));i=this._parent(i);}}
_siftDown(i){let s=i;const l=this._left(i),r=this._right(i);if(l<this.heap.length&&this.heap[l]<this.heap[s])s=l;if(r<this.heap.length&&this.heap[r]<this.heap[s])s=r;if(s!==i){this._swap(i,s);this._siftDown(s);}}
insert(val){this.heap.push(val);this._siftUp(this.heap.length-1);}
extractMin(){if(!this.heap.length)return null;const min=this.heap[0];const last=this.heap.pop();if(this.heap.length){this.heap[0]=last;this._siftDown(0);}return min;}
min(){return this.heap[0];}size(){return this.heap.length;}}
function topK(nums,k){const h=new MinHeap();for(const num of nums){if(h.size()<k)h.insert(num);else if(num>h.min()){h.extractMin();h.insert(num);}}const res=[];while(h.size())res.push(h.extractMin());return res;}
const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const h=new MinHeap();[5,3,8,1,9,2,4].forEach(v=>h.insert(v));test('min after inserts',h.min(),1);test('size after inserts',h.size(),7);const sorted=[];while(h.size())sorted.push(h.extractMin());test('heap sort',sorted,[1,2,3,4,5,8,9]);const h2=new MinHeap();h2.insert(10);test('extractMin single',h2.extractMin(),10);test('topK 3',topK([3,1,5,12,2,11,7],3).sort((a,b)=>a-b),[7,11,12]);test('topK 4',topK([9,3,2,6,1,8,4],4).sort((a,b)=>a-b),[4,6,8,9]);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 260,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Build a MinHeap in Python',
        caption: 'Same heap in Python — then from scratch with a topK bar chart visualization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — MinHeap: insert and _sift_up',
              prose: [
                'Python uses integer division `//` instead of `Math.floor`. Everything else is the same.',
                'parent(i) = (i-1)//2, left = 2i+1, right = 2i+2.',
              ],
              instructions: 'Implement _sift_up() and insert(). Build the heap and check min and size.',
              code: `class MinHeap:
    def __init__(self):
        self.heap = []

    def _swap(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]

    def _parent(self, i): return (i - 1) // 2
    def _left(self, i):   return 2 * i + 1
    def _right(self, i):  return 2 * i + 2

    def _sift_up(self, i):
        # TODO: while i > 0 and heap[i] < heap[parent(i)]: swap and move up
        pass

    def insert(self, val):
        # TODO: append val, then _sift_up last index
        pass

    def min_val(self): return self.heap[0]
    def size(self):    return len(self.heap)

h = MinHeap()
for v in [5, 3, 8, 1, 9, 2]:
    h.insert(v)

assert h.min_val() == 1, "min should be 1"
assert h.size()    == 6, "size should be 6"
print("✓ insert and _sift_up")`,
              output: '✓ insert and _sift_up',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — extract_min and _sift_down',
              prose: [
                '_sift_down() finds the smaller child and swaps down. Call it recursively (or iteratively) until the heap property is restored.',
              ],
              instructions: 'Implement _sift_down() and extract_min(). Drain the heap to verify sorted output.',
              code: `class MinHeap:
    def __init__(self):
        self.heap = []
    def _swap(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
    def _parent(self, i): return (i - 1) // 2
    def _left(self, i):   return 2 * i + 1
    def _right(self, i):  return 2 * i + 2
    def _sift_up(self, i):
        while i > 0 and self.heap[i] < self.heap[self._parent(i)]:
            self._swap(i, self._parent(i)); i = self._parent(i)

    def _sift_down(self, i):
        # TODO: smallest = i
        # l, r = _left(i), _right(i)
        # if l < size and heap[l] < heap[smallest]: smallest = l
        # if r < size and heap[r] < heap[smallest]: smallest = r
        # if smallest != i: swap, _sift_down(smallest)
        pass

    def insert(self, val):
        self.heap.append(val); self._sift_up(len(self.heap) - 1)

    def extract_min(self):
        # TODO: if empty return None
        # save heap[0]; pop last
        # if heap not empty: heap[0] = last; _sift_down(0)
        # return min
        pass

    def min_val(self): return self.heap[0]
    def size(self):    return len(self.heap)

h = MinHeap()
for v in [5, 3, 8, 1, 9, 2, 4]:
    h.insert(v)
result = []
while h.size():
    result.append(h.extract_min())
assert result == [1, 2, 3, 4, 5, 8, 9]
print("✓ heap sort:", result)`,
              output: '✓ heap sort: [1, 2, 3, 4, 5, 8, 9]',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'From Scratch — Full MinHeap + topK Visualization',
              prose: [
                'Write the complete MinHeap from memory, then implement top_k(nums, k).',
                'When assertions pass, opencalc draws a bar chart with the selected top-K elements highlighted.',
              ],
              instructions: 'Fill in all methods and top_k(). The figure shows which elements were selected.',
              code: `from opencalc import Figure

class MinHeap:
    def __init__(self):          pass  # your code
    def _swap(self, i, j):      pass  # your code
    def _parent(self, i):       pass  # your code
    def _left(self, i):         pass  # your code
    def _right(self, i):        pass  # your code
    def _sift_up(self, i):      pass  # your code
    def _sift_down(self, i):    pass  # your code
    def insert(self, val):      pass  # your code
    def extract_min(self):      pass  # your code
    def min_val(self):          pass  # your code
    def size(self):             pass  # your code

def top_k(nums, k):
    pass  # your code — use MinHeap

# Assertions
h = MinHeap()
for v in [5, 3, 8, 1, 9, 2, 4]:
    h.insert(v)
assert h.min_val() == 1
assert h.size()    == 7
result = []
while h.size():
    result.append(h.extract_min())
assert result == [1, 2, 3, 4, 5, 8, 9]
top = sorted(top_k([3, 1, 5, 12, 2, 11, 7], 3))
assert top == [7, 11, 12]
print("All assertions passed!")

# Visualize topK
nums = [3, 1, 5, 12, 2, 11, 7]
k = 3
selected = set(top_k(nums, k))
fig = Figure()
fig.set_title(f"Top {k} elements from {nums}")
for i, v in enumerate(nums):
    color = "#f59e0b" if v in selected else "#334155"
    fig.bar(i, v, label=str(v)+(" ★" if v in selected else ""), color=color)
fig.show()`,
              output: 'All assertions passed!',
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },
};
