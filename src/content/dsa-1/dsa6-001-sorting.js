export default {
  id: 'dsa6-001', slug: 'sorting-algorithms', chapter: 'dsa6', order: 1,
  title: 'Sorting Algorithms',
  subtitle: 'Bubble, insertion, merge sort, quicksort — understand the tradeoffs before reaching for Array.sort().',
  tags: ['sorting','merge sort','quicksort','bubble sort','insertion sort','partition','divide and conquer'],
  aliases: 'sort bubble insertion merge quick partition divide conquer comparison swap',

  hook: {
    question: 'Arrays.sort() exists in every language. So why do software engineers spend time learning sorting algorithms? Because the same thinking — divide and conquer, partitioning around a pivot — shows up in problems that have nothing to do with sorting.',
    realWorldContext: 'Merge sort is stable (preserves original order of equal elements) and is used inside Python\'s sort, Java\'s Arrays.sort for objects, and Firefox\'s JavaScript engine. Quicksort dominates in-place sorting of primitives — it has better cache behavior than merge sort in practice. Database query planners choose between sort strategies based on data size, existing order, and available memory. Understanding the tradeoffs is how you make that choice consciously.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You can search sorted data in O(log n). But what does it cost to get data sorted in the first place? That\'s what this lesson answers.',
      '**Bubble and insertion sort: O(n²) but simple.** Bubble sort repeatedly swaps adjacent pairs. Insertion sort grows a sorted prefix one element at a time — like sorting cards in your hand. Both are O(n²) in the average case but O(n) on nearly-sorted data. Used by Timsort (Python, Java) for small sub-arrays.',
      '**Merge sort: guaranteed O(n log n).** Divide the array in half, recursively sort each half, merge the two sorted halves. The merge step is the key: two pointers walk each half, always picking the smaller element. Merge sort is stable but needs O(n) extra space for the merge.',
      '**Quicksort: O(n log n) on average, O(n²) worst case.** Pick a pivot, partition the array so everything ≤ pivot is left and everything > pivot is right. The pivot is now in its final position. Recursively sort each side. The pivot choice matters: a bad pivot (always the min or max) gives O(n²). Random pivot or median-of-three avoids this in practice.',
    ],
    callouts: [
      { type: 'sequencing', title: 'Chapter 6, Lesson 1: Sorting', body: '**Previous chapter:** Graphs — BFS, DFS, shortest paths.\n**This lesson:** Sorting — bubble, insertion, merge, quicksort.\n**Next:** Binary search and its generalizations.' },
      { type: 'insight', title: 'Stable vs unstable sort', body: 'A stable sort preserves the relative order of equal elements. Merge sort is stable. Quicksort is not. This matters when you sort by one key then another — an unstable sort can scramble the first sort\'s ordering.' },
      { type: 'strategy', title: 'Which to use?', body: 'Need guaranteed O(n log n) and stability? Merge sort.\nNeed in-place and fastest on average? Quicksort.\nNearly sorted data, small n? Insertion sort.\nIn practice: just use the language\'s built-in sort (Timsort) — it picks the right algorithm for you.' },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Merge Sort and Quicksort in Action',
        mathBridge: 'Merge sort shows the divide-and-merge steps. Quicksort shows how partitioning places the pivot in its final position.',
        caption: 'Two cells: merge sort\'s combine steps, quicksort\'s partition trace.',
        props: {
          lesson: {
            title: 'How Sorting Algorithms Work',
            subtitle: 'Step-by-step merge sort and quicksort',
            sequential: true,
            cells: [
              {
                type: 'js', title: 'Merge Sort: Divide and Combine',
                instruction: 'Each line shows two sorted halves being merged into one. The indentation represents the recursion depth.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const log=[];
function merge(l,r,d){const res=[];let i=0,j=0;while(i<l.length&&j<r.length){if(l[i]<=r[j])res.push(l[i++]);else res.push(r[j++]);}while(i<l.length)res.push(l[i++]);while(j<r.length)res.push(r[j++]);log.push({d,l:[...l],r:[...r],res:[...res]});return res;}
function ms(arr,d=0){if(arr.length<=1)return arr;const mid=Math.floor(arr.length/2);return merge(ms(arr.slice(0,mid),d+1),ms(arr.slice(mid),d+1),d);}
const arr=[38,27,43,3,9,82,10];ms([...arr]);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Merge Sort: ['+arr.join(', ')+']</h3>';
log.forEach(e=>{const ind='&nbsp;'.repeat(e.d*6);html+='<div style="margin-bottom:4px;font-size:13px">'+ind+'<span style="color:#f59e0b">['+e.l.join(',')+']</span><span style="color:#64748b"> + </span><span style="color:#c084fc">['+e.r.join(',')+']</span><span style="color:#64748b"> → </span><span style="color:#4ade80">['+e.res.join(',')+']</span></div>';});
display.innerHTML=html;`,
                outputHeight: 300,
              },
              {
                type: 'js', title: 'Quicksort: Partition Trace',
                instruction: 'Each step shows a range being partitioned. The pivot (last element) lands at its final position. Everything left is ≤ pivot; everything right is > pivot.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
const qlog=[];
function partition(arr,lo,hi){const pivot=arr[hi];let i=lo-1;for(let j=lo;j<hi;j++)if(arr[j]<=pivot){i++;[arr[i],arr[j]]=[arr[j],arr[i]];}[arr[i+1],arr[hi]]=[arr[hi],arr[i+1]];qlog.push({pivot,range:[lo,hi],after:arr.slice(lo,hi+1).join(', '),idx:i+1});return i+1;}
function qs(arr,lo=0,hi=arr.length-1){if(lo>=hi)return;const p=partition(arr,lo,hi);qs(arr,lo,p-1);qs(arr,p+1,hi);}
const arr=[10,80,30,90,40,50,70];qs(arr);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Quicksort: [10,80,30,90,40,50,70]</h3>';
qlog.forEach((e,i)=>{html+='<div style="margin-bottom:5px;padding:6px 10px;background:#1e293b;border-radius:4px;font-size:13px">Step '+(i+1)+': pivot=<b style="color:#f59e0b">'+e.pivot+'</b> range['+e.range+'] → [<span style="color:#4ade80">'+e.after+'</span>] (pivot at idx '+e.idx+')</div>';});
html+='<p style="color:#4ade80;margin-top:8px">Sorted: ['+arr.join(', ')+']</p>';
display.innerHTML=html;`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Sorting Algorithms in JavaScript',
        caption: 'Bubble sort, insertion sort, merge sort, quicksort — then build all four from scratch.',
        props: {
          lesson: {
            title: 'Sorting in JavaScript',
            subtitle: 'Write every algorithm from scratch.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Bubble Sort and Insertion Sort

**Bubble sort:** two nested loops. Inner loop compares arr[j] and arr[j+1] — swap if out of order. Outer loop runs n-1 times. After pass i, the largest i elements are in their final positions.

**Insertion sort:** for each position i starting at 1, save arr[i] as \`key\`. Shift all elements left of i that are larger than key one position right. Place key in the gap.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // TODO: inner loop j from 0 to n-i-2; swap arr[j] and arr[j+1] if out of order
  }
  return arr;
}

function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    // TODO: while j >= 0 and arr[j] > key: arr[j+1] = arr[j]; j--
    // TODO: arr[j+1] = key
  }
  return arr;
}

const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('bubbleSort',  bubbleSort([64,34,25,12,22,11,90]), [11,12,22,25,34,64,90]);
test('insertionSort', insertionSort([12,11,13,5,6]),    [5,6,11,12,13]);`,
                solutionCode: `function bubbleSort(arr){const n=arr.length;for(let i=0;i<n-1;i++)for(let j=0;j<n-i-1;j++)if(arr[j]>arr[j+1])[arr[j],arr[j+1]]=[arr[j+1],arr[j]];return arr;}
function insertionSort(arr){for(let i=1;i<arr.length;i++){const key=arr[i];let j=i-1;while(j>=0&&arr[j]>key){arr[j+1]=arr[j];j--;}arr[j+1]=key;}return arr;}
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('bubbleSort',bubbleSort([64,34,25,12,22,11,90]),[11,12,22,25,34,64,90]);test('insertionSort',insertionSort([12,11,13,5,6]),[5,6,11,12,13]);`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Merge Sort

**\`merge(left, right)\`:** two pointers, one into each array. Always pick the smaller element. Append leftovers from whichever array wasn't exhausted.

**\`mergeSort(arr)\`:** base case when length ≤ 1. Find mid, recursively sort each half, return \`merge(left, right)\`. Returns a new array — not in-place.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  // TODO: while both have elements: pick smaller, advance pointer
  // TODO: append remaining elements from each side
  return result;
}

function mergeSort(arr) {
  // TODO: base case if arr.length <= 1
  // TODO: mid, recursively sort left and right halves
  // TODO: return merge(left, right)
}

const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('merge', merge([1,3,5],[2,4,6]), [1,2,3,4,5,6]);
test('mergeSort', mergeSort([38,27,43,3,9,82,10]), [3,9,10,27,38,43,82]);
test('empty', mergeSort([]), []);
test('single', mergeSort([1]), [1]);`,
                solutionCode: `function merge(l,r){const res=[];let i=0,j=0;while(i<l.length&&j<r.length){if(l[i]<=r[j])res.push(l[i++]);else res.push(r[j++]);}while(i<l.length)res.push(l[i++]);while(j<r.length)res.push(r[j++]);return res;}
function mergeSort(arr){if(arr.length<=1)return arr;const mid=Math.floor(arr.length/2);return merge(mergeSort(arr.slice(0,mid)),mergeSort(arr.slice(mid)));}
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('merge',merge([1,3,5],[2,4,6]),[1,2,3,4,5,6]);test('mergeSort',mergeSort([38,27,43,3,9,82,10]),[3,9,10,27,38,43,82]);test('empty',mergeSort([]),[]);test('single',mergeSort([1]),[1]);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Quicksort

**\`partition(arr, lo, hi)\`:** use arr[hi] as pivot. Walk j from lo to hi-1. If arr[j] ≤ pivot: increment i, swap arr[i] and arr[j]. After the loop: swap arr[i+1] and arr[hi] (place pivot). Return i+1 — the pivot's final index.

**\`quickSort(arr, lo, hi)\`:** if lo >= hi, return. Get pivot index from partition, recurse on each side.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo - 1;
  // TODO: for j from lo to hi-1: if arr[j] <= pivot → i++, swap arr[i] and arr[j]
  // TODO: swap arr[i+1] and arr[hi]; return i+1
}

function quickSort(arr, lo = 0, hi = arr.length - 1) {
  // TODO: if lo >= hi return
  // pivot = partition(arr, lo, hi)
  // recurse left and right sides
}

const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const a=[10,80,30,90,40,50,70]; quickSort(a);
test('quickSort basic', a, [10,30,40,50,70,80,90]);
const b=[5,4,3,2,1]; quickSort(b);
test('quickSort reversed', b, [1,2,3,4,5]);`,
                solutionCode: `function partition(arr,lo,hi){const pivot=arr[hi];let i=lo-1;for(let j=lo;j<hi;j++)if(arr[j]<=pivot){i++;[arr[i],arr[j]]=[arr[j],arr[i]];}[arr[i+1],arr[hi]]=[arr[hi],arr[i+1]];return i+1;}
function quickSort(arr,lo=0,hi=arr.length-1){if(lo>=hi)return;const p=partition(arr,lo,hi);quickSort(arr,lo,p-1);quickSort(arr,p+1,hi);}
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
const a=[10,80,30,90,40,50,70];quickSort(a);test('quickSort basic',a,[10,30,40,50,70,80,90]);const b=[5,4,3,2,1];quickSort(b);test('quickSort reversed',b,[1,2,3,4,5]);`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Challenge — All Four Algorithms From Scratch

Empty shells. Write every function from memory. 10 tests.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function bubbleSort(arr) { }
function insertionSort(arr) { }
function merge(left, right) { }
function mergeSort(arr) { }
function partition(arr, lo, hi) { }
function quickSort(arr, lo = 0, hi = arr.length - 1) { }

const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}\${p?'':' (want '+JSON.stringify(e)+')'}</div>\`;}
try{
  test('bubbleSort',  bubbleSort([5,3,8,1,9,2]), [1,2,3,5,8,9]);
  test('bubbleSort sorted', bubbleSort([1,2,3]), [1,2,3]);
  test('insertionSort', insertionSort([12,11,13,5,6]), [5,6,11,12,13]);
  test('merge', merge([1,3,5],[2,4,6]), [1,2,3,4,5,6]);
  test('mergeSort', mergeSort([38,27,43,3,9,82,10]), [3,9,10,27,38,43,82]);
  test('mergeSort empty', mergeSort([]), []);
  test('mergeSort single', mergeSort([1]), [1]);
  const q1=[10,80,30,90,40,50,70]; quickSort(q1); test('quickSort basic', q1, [10,30,40,50,70,80,90]);
  const q2=[5,4,3,2,1]; quickSort(q2); test('quickSort reversed', q2, [1,2,3,4,5]);
  const q3=[42]; quickSort(q3); test('quickSort single', q3, [42]);
  const all=results.every(Boolean);
  out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;
}catch(e){out.innerHTML+='<div class="fail">Error: '+e.message+'</div>';}`,
                solutionCode: `function bubbleSort(arr){const n=arr.length;for(let i=0;i<n-1;i++)for(let j=0;j<n-i-1;j++)if(arr[j]>arr[j+1])[arr[j],arr[j+1]]=[arr[j+1],arr[j]];return arr;}
function insertionSort(arr){for(let i=1;i<arr.length;i++){const key=arr[i];let j=i-1;while(j>=0&&arr[j]>key){arr[j+1]=arr[j];j--;}arr[j+1]=key;}return arr;}
function merge(l,r){const res=[];let i=0,j=0;while(i<l.length&&j<r.length){if(l[i]<=r[j])res.push(l[i++]);else res.push(r[j++]);}while(i<l.length)res.push(l[i++]);while(j<r.length)res.push(r[j++]);return res;}
function mergeSort(arr){if(arr.length<=1)return arr;const mid=Math.floor(arr.length/2);return merge(mergeSort(arr.slice(0,mid)),mergeSort(arr.slice(mid)));}
function partition(arr,lo,hi){const pivot=arr[hi];let i=lo-1;for(let j=lo;j<hi;j++)if(arr[j]<=pivot){i++;[arr[i],arr[j]]=[arr[j],arr[i]];}[arr[i+1],arr[hi]]=[arr[hi],arr[i+1]];return i+1;}
function quickSort(arr,lo=0,hi=arr.length-1){if(lo>=hi)return;const p=partition(arr,lo,hi);quickSort(arr,lo,p-1);quickSort(arr,p+1,hi);}
const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('bubbleSort',bubbleSort([5,3,8,1,9,2]),[1,2,3,5,8,9]);test('bubbleSort sorted',bubbleSort([1,2,3]),[1,2,3]);test('insertionSort',insertionSort([12,11,13,5,6]),[5,6,11,12,13]);test('merge',merge([1,3,5],[2,4,6]),[1,2,3,4,5,6]);test('mergeSort',mergeSort([38,27,43,3,9,82,10]),[3,9,10,27,38,43,82]);test('mergeSort empty',mergeSort([]),[]);test('mergeSort single',mergeSort([1]),[1]);const q1=[10,80,30,90,40,50,70];quickSort(q1);test('quickSort basic',q1,[10,30,40,50,70,80,90]);const q2=[5,4,3,2,1];quickSort(q2);test('quickSort reversed',q2,[1,2,3,4,5]);const q3=[42];quickSort(q3);test('quickSort single',q3,[42]);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 320,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Build Sorting Algorithms in Python',
        caption: 'All four sorts in Python — then from scratch with a comparison bar chart.',
        props: {
          initialCells: [
            {
              id: 1, cellTitle: 'Step 1 — Bubble Sort and Insertion Sort',
              prose: ['Python swaps are elegant: a, b = b, a. Both algorithms sort in-place.'],
              instructions: 'Fill in bubble_sort() and insertion_sort().',
              code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        # TODO: inner loop; swap adjacent out-of-order pairs
        pass
    return arr

def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]; j = i - 1
        # TODO: while j >= 0 and arr[j] > key: shift right; place key
    return arr

assert bubble_sort([64,34,25,12,22,11,90]) == [11,12,22,25,34,64,90]
assert insertion_sort([12,11,13,5,6]) == [5,6,11,12,13]
print("✓ bubble and insertion sort")`,
              output: '✓ bubble and insertion sort', status: 'idle', figureJson: null,
            },
            {
              id: 2, cellTitle: 'Step 2 — Merge Sort and Quicksort',
              prose: ['merge_sort returns a new list. quick_sort sorts in-place using lo/hi indices.'],
              instructions: 'Fill in merge(), merge_sort(), partition(), and quick_sort().',
              code: `def merge(left, right):
    result = []; i = j = 0
    # TODO: pick smaller, advance pointer; append remainder
    return result

def merge_sort(arr):
    # TODO: base case, split, recurse, merge
    pass

def partition(arr, lo, hi):
    pivot = arr[hi]; i = lo - 1
    # TODO: walk j; swap when arr[j] <= pivot; place pivot; return i+1
    pass

def quick_sort(arr, lo=0, hi=None):
    if hi is None: hi = len(arr) - 1
    # TODO: if lo >= hi return; partition; recurse both sides
    pass

assert merge_sort([38,27,43,3,9,82,10]) == [3,9,10,27,38,43,82]
q = [10,80,30,90,40,50,70]; quick_sort(q)
assert q == [10,30,40,50,70,80,90]
print("✓ merge sort and quicksort")`,
              output: '✓ merge sort and quicksort', status: 'idle', figureJson: null,
            },
            {
              id: 3, cellTitle: 'From Scratch — All Algorithms + Operation Count Chart',
              prose: ['Write all five functions from memory. The figure compares bubble sort vs merge sort operation counts on a reversed 20-element array.'],
              instructions: 'Fill in all functions. The figure shows why O(n²) vs O(n log n) matters.',
              code: `from opencalc import Figure

def bubble_sort(arr):    pass
def merge(left, right):  pass
def merge_sort(arr):     pass
def partition(arr, lo, hi): pass
def quick_sort(arr, lo=0, hi=None): pass

assert bubble_sort([5,3,8,1,9,2]) == [1,2,3,5,8,9]
assert merge([1,3,5],[2,4,6]) == [1,2,3,4,5,6]
assert merge_sort([38,27,43,3,9,82,10]) == [3,9,10,27,38,43,82]
q=[10,80,30,90,40,50,70]; quick_sort(q)
assert q == [10,30,40,50,70,80,90]
print("All assertions passed!")

# Count operations
def count_bubble(arr):
    arr=arr[:]; ops=0; n=len(arr)
    for i in range(n-1):
        for j in range(n-i-1):
            ops+=1
            if arr[j]>arr[j+1]: arr[j],arr[j+1]=arr[j+1],arr[j]
    return ops

def count_merge(arr):
    ops=[0]
    def ms(a):
        if len(a)<=1: return a
        mid=len(a)//2; l,r=ms(a[:mid]),ms(a[mid:])
        res=[]; i=j=0
        while i<len(l) and j<len(r):
            ops[0]+=1
            if l[i]<=r[j]: res.append(l[i]); i+=1
            else: res.append(r[j]); j+=1
        return res+l[i:]+r[j:]
    ms(arr[:]); return ops[0]

data=list(range(20,0,-1))
fig=Figure()
fig.set_title("Operations on 20-element reversed array")
fig.bar(0,count_bubble(data),label=f"Bubble ({count_bubble(data)})",color="#f87171")
fig.bar(1,count_merge(data), label=f"Merge ({count_merge(data)})", color="#4ade80")
fig.show()`,
              output: 'All assertions passed!', status: 'idle', figureJson: null,
            },
          ],
        },
      },
    ],
  },
};
