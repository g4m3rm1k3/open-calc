export default {
  id: 'dsa0-001',
  slug: 'execution-and-memory-model',
  chapter: 'dsa0',
  order: 1,
  title: 'Execution & Memory Model',
  subtitle: 'How programs actually run: the call stack, the heap, and value vs reference semantics.',
  tags: ['memory', 'stack', 'heap', 'value', 'reference', 'execution model', 'variables', 'mutation'],
  aliases: 'call stack heap memory model variables value reference semantics primitives objects',

  hook: {
    question: 'When you write `b = a` and then change `b`, does `a` change too? The answer depends entirely on what `a` is — and understanding why is the first step toward understanding every data structure.',
    realWorldContext: 'Every bug caused by "unexpected mutation," every "shallow copy" vs "deep copy" debate, every race condition in concurrent code — all of these trace back to one question: who owns this memory? When a web server handles thousands of simultaneous requests, it must manage memory precisely or it leaks resources and crashes. When a database engine inserts a record, it must know exactly where in memory the record lives. When JavaScript passes an object to a function, it does not pass a copy — it passes the address. Misunderstanding this is the source of an entire class of bugs. Data structures are just careful, intentional arrangements of memory. To design them, you must first understand what memory is.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Before any data structure — before linked lists, trees, or graphs — you need a precise mental model of what happens when code runs. Without this, data structures feel like magic. With it, they feel inevitable.',
      'Every running program has two memory regions that matter: the **stack** and the **heap**. They serve completely different purposes, and confusing them is a fundamental error.',
      '**The stack** is where *function calls* live. Every time you call a function, the program pushes a new "frame" onto the stack. That frame holds the function\'s local variables, its return address (where execution should resume after the function returns), and its parameters. When the function returns, its frame is *popped* off — instantly freed, no cleanup needed. This is why local variables disappear after a function ends. The stack is fast (just move a pointer), small (usually a few MB), and fully automatic.',
      '**The heap** is where *long-lived data* lives. When you create an object, a list, an array — anything that outlives the function that created it — it goes on the heap. The heap is large (limited by RAM), but managing it is slower and more complex. In languages like C, you call `malloc()` and `free()` yourself. In Python and JavaScript, a garbage collector watches for data that nothing references anymore and reclaims it automatically.',
      '**Value semantics vs reference semantics.** Primitive types (numbers, booleans, characters) are typically stored *by value*: copying them creates a truly independent copy. Objects, arrays, and other complex types are stored *by reference*: a variable holds not the data itself, but an *address* — a pointer to where the data lives on the heap. This is the source of the deepest beginner confusion in programming.',
      'Consider `a = [1, 2, 3]` in Python. The variable `a` does not hold the list — it holds a *reference* (an address) to where the list lives in heap memory. If you then write `b = a`, you copy the *reference*, not the list. Both `a` and `b` now point to the same list. Mutating `b.append(4)` also changes what `a` sees, because they both look at the same heap location. This is not a bug — it is the designed behavior. Understanding it means never being surprised by it again.',
      '**The call stack is a data structure.** This is not accidental — the call stack is literally a stack (LIFO: last in, first out). Every recursive algorithm you will ever write is implicitly using the call stack. Understanding the stack as a data structure gives you the intuition for recursion depth, stack overflow errors, and why tail recursion optimization matters.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of this course — The Foundation',
        body: '**This lesson:** What memory is, how the call stack works, and what value vs reference means.\n**Next:** Big-O notation — how to measure the cost of an algorithm before running it.',
      },
      {
        type: 'insight',
        title: 'Variables are not boxes — they are labels',
        body: 'In Python and JavaScript, a variable is a *name* that points to a value in memory. It is not a box that contains the value. You can point multiple names at the same value. You can point a name at a new value without affecting other names pointing at the old value. This distinction matters the moment you start working with mutable objects.',
      },
      {
        type: 'warning',
        title: 'Stack overflow is not a website — it\'s a real crash',
        body: 'Every recursive call adds a frame to the call stack. If recursion goes too deep (or is infinite), the stack runs out of space and the program crashes with a "stack overflow" error. This is why you will always see a base case in recursive algorithms — it is not just a convention, it is what stops the stack from exploding.',
      },
      {
        type: 'insight',
        title: 'Python and JavaScript both use reference semantics for objects',
        body: 'Both languages are consistent: primitive/scalar values (numbers, booleans, strings in JS, strings + numbers + None in Python) behave like values. Everything else (lists, dicts, objects, arrays) behaves by reference. The rules are the same across both languages.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Stack, Heap & Reference Semantics — Interactive',
        mathBridge: 'Work through each cell in order. The Canvas animations show memory as it actually behaves — each frame on the stack, each object on the heap, each reference as an arrow. The Python cells let you probe the memory model directly using built-in tools.',
        caption: 'Click ▶ Run on each cell. In the challenge cells, pick your answer before running.',
        props: {
          lesson: {
            title: 'Memory, Stack & References',
            subtitle: 'Visualize how programs use memory — then verify with code.',
            sequential: true,
            cells: [
              // ── Cell 1: The Call Stack ────────────────────────────────────────
              {
                type: 'js',
                title: 'The Call Stack',
                instruction: 'Every function call adds a **frame** to the stack. Each frame holds local variables. When the function returns, its frame vanishes — instantly.\n\nPress **Run** to animate three nested calls. Watch the stack grow as functions are called, then shrink as they return.',
                html: `<canvas id="c" width="680" height="340" style="display:block;width:100%;border-radius:8px"></canvas>
<div id="info" style="text-align:center;margin-top:8px;font-family:monospace;font-size:13px;color:#94a3b8;min-height:20px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const info = document.getElementById('info');
const ctx = canvas.getContext('2d');
const W = canvas.offsetWidth * devicePixelRatio;
const H = canvas.offsetHeight * devicePixelRatio;
canvas.width = W; canvas.height = H;
ctx.scale(devicePixelRatio, devicePixelRatio);
const cw = canvas.offsetWidth, ch = canvas.offsetHeight;

const T = {
  bg:'#0f172a', surface:'#1e293b', border:'#334155',
  text:'#e2e8f0', muted:'#64748b', accent:'#38bdf8',
  purple:'#a78bfa', green:'#4ade80', amber:'#fbbf24', red:'#f87171',
};

// The call stack state we animate through
const frames = [
  { name:'main()', locals:['result = ?'], color: T.accent },
  { name:'add(a=3, b=4)', locals:['a = 3', 'b = 4', 'sum = ?'], color: T.purple },
  { name:'square(n=7)', locals:['n = 7'], color: T.amber },
];

const FRAME_H = 72, GAP = 8, FRAME_W = 260;
const stackX = cw / 2 - FRAME_W / 2;
const baseY = ch - 24;

function drawFrame(frame, y, alpha) {
  ctx.globalAlpha = alpha;
  // card
  ctx.fillStyle = T.surface;
  ctx.strokeStyle = frame.color;
  ctx.lineWidth = 2;
  const r = 8;
  ctx.beginPath();
  ctx.roundRect(stackX, y, FRAME_W, FRAME_H - 4, r);
  ctx.fill(); ctx.stroke();
  // name
  ctx.fillStyle = frame.color;
  ctx.font = 'bold 13px monospace';
  ctx.fillText(frame.name, stackX + 12, y + 20);
  // locals
  ctx.fillStyle = T.muted;
  ctx.font = '11px monospace';
  frame.locals.forEach((l, i) => ctx.fillText(l, stackX + 16, y + 36 + i * 14));
  ctx.globalAlpha = 1;
}

function drawScene(nFrames, progress, phase) {
  ctx.clearRect(0, 0, cw, ch);

  // Label
  ctx.fillStyle = T.muted;
  ctx.font = '11px monospace';
  ctx.fillText('CALL STACK  (top → newest frame)', stackX, 18);
  ctx.fillText('grows ↑', stackX + FRAME_W + 8, 18);

  // Stack base line
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(stackX - 4, baseY); ctx.lineTo(stackX + FRAME_W + 4, baseY); ctx.stroke();
  ctx.fillStyle = T.muted; ctx.font = '10px monospace';
  ctx.fillText('stack bottom', stackX, baseY + 12);

  for (let i = 0; i < nFrames; i++) {
    const y = baseY - (i + 1) * (FRAME_H + GAP);
    const alpha = (i === nFrames - 1 && phase === 'entering') ? progress : 1;
    drawFrame(frames[i], y + (i === nFrames - 1 && phase === 'entering' ? (1 - progress) * 30 : 0), alpha);
  }

  // Phase label
  const msgs = {
    'entering': \`→ calling \${frames[nFrames-1].name}\`,
    'holding':  \`inside \${frames[nFrames-1].name}\`,
    'returning':\`← \${frames[nFrames-1].name} returns\`,
  };
  info.textContent = msgs[phase] || '';
}

// Animate through: push frame 0, push 1, push 2, pop 2, pop 1, pop 0
const steps = [
  { n:1, phase:'entering' },
  { n:1, phase:'holding' },
  { n:2, phase:'entering' },
  { n:2, phase:'holding' },
  { n:3, phase:'entering' },
  { n:3, phase:'holding' },
  { n:3, phase:'returning' },
  { n:2, phase:'holding' },
  { n:2, phase:'returning' },
  { n:1, phase:'holding' },
  { n:1, phase:'returning' },
  { n:0, phase:'holding' },
];

let stepIdx = 0, t = 0;
const STEP_DUR = 60; // frames per step

function tick() {
  t++;
  if (t >= STEP_DUR) { t = 0; stepIdx = (stepIdx + 1) % steps.length; }
  const s = steps[stepIdx];
  drawScene(s.n, t / STEP_DUR, s.phase);
  requestAnimationFrame(tick);
}
tick();
`,
                outputHeight: 390,
              },

              // ── Cell 2: Stack vs Heap diagram ─────────────────────────────────
              {
                type: 'js',
                title: 'Stack vs Heap — Two Memory Regions',
                instruction: 'The stack holds **local variables** and **function frames** — it\'s fast and automatic.\nThe heap holds **objects and arrays** that can outlive the function that created them.\n\nVariables on the stack often hold **references** (arrows) pointing into the heap.',
                html: `<canvas id="c" width="680" height="280" style="display:block;width:100%;border-radius:8px"></canvas>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth * devicePixelRatio;
canvas.height = canvas.offsetHeight * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const T = {
  bg:'#0f172a', surface:'#1e293b', border:'#334155',
  text:'#e2e8f0', muted:'#64748b', accent:'#38bdf8',
  purple:'#a78bfa', green:'#4ade80', amber:'#fbbf24',
};

function rect(x,y,w,h,fill,stroke,r=6){
  ctx.fillStyle=fill; ctx.strokeStyle=stroke; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); ctx.stroke();
}
function text(s,x,y,color='#e2e8f0',size=12,weight='normal',align='left'){
  ctx.fillStyle=color; ctx.font=\`\${weight} \${size}px monospace\`; ctx.textAlign=align;
  ctx.fillText(s,x,y);
}
function arrow(x1,y1,x2,y2,color){
  ctx.strokeStyle=color; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  const ux=dx/len,uy=dy/len,hl=8,px=-uy*4,py=ux*4;
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-ux*hl+px,y2-uy*hl+py);
  ctx.lineTo(x2-ux*hl-px,y2-uy*hl-py);
  ctx.closePath(); ctx.fill();
}

ctx.clearRect(0,0,W,H);

// Stack region (left)
const sx=20, sy=30, sw=240, sh=H-50;
rect(sx,sy,sw,sh,'#0f172a',T.accent,8);
text('STACK',sx+sw/2,sy+16,T.accent,11,'bold','center');
text('fast · automatic · small',sx+sw/2,sy+28,T.muted,9,'normal','center');

// Stack frames
const frames=[
  {name:'main()',vars:['nums → 0x2A4']},
  {name:'square(n=5)',vars:['n = 5','result = 25']},
];
let fy=sy+44;
frames.forEach(f=>{
  rect(sx+10,fy,sw-20,52,T.surface,T.border,6);
  text(f.name,sx+18,fy+14,T.purple,11,'bold');
  f.vars.forEach((v,i)=>text(v,sx+18,fy+28+i*13,T.muted,10));
  fy+=60;
});

// Heap region (right)
const hx=W-260,hy=30,hw=240,hh=H-50;
rect(hx,hy,hw,hh,'#0f172a',T.purple,8);
text('HEAP',hx+hw/2,hy+16,T.purple,11,'bold','center');
text('flexible · managed · large',hx+hw/2,hy+28,T.muted,9,'normal','center');

// Heap objects
rect(hx+16,hy+44,hw-32,60,T.surface,T.border,6);
text('0x2A4  nums = [1,2,3,4,5]',hx+24,hy+58,T.amber,10);
text('[0]=1  [1]=2  [2]=3',hx+24,hy+72,T.muted,9);
text('[3]=4  [4]=5',hx+24,hy+85,T.muted,9);

rect(hx+16,hy+116,hw-32,46,T.surface,T.border,6);
text('0x3FF  obj = {name:"Ada"}',hx+24,hy+130,T.green,10);
text('name → string at 0x4CC',hx+24,hy+143,T.muted,9);

// Reference arrows (stack → heap)
const refX=sx+sw-10, refY=sy+68;
const destX=hx+16, destY=hy+72;
arrow(refX,refY,destX,destY,T.amber);
text('reference',refX-8,refY-6,T.amber,9,'normal','right');

// Middle divider label
text('stack → heap via reference',W/2,H-10,T.muted,10,'normal','center');
`,
                outputHeight: 310,
              },

              // ── Cell 3: Value vs Reference ─────────────────────────────────────
              {
                type: 'js',
                title: 'Value vs Reference Semantics',
                instruction: 'Click **Copy Number** and **Copy Array** to see what happens when you "copy" each type.\n\nNumbers are copied by value — truly independent. Arrays are copied by reference — both names point to the same heap object.',
                html: `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:4px">
  <div>
    <div style="font-size:11px;color:#64748b;font-family:monospace;margin-bottom:8px">VALUE TYPE (number)</div>
    <div id="num-box" style="background:#1e293b;border:1.5px solid #334155;border-radius:8px;padding:12px;font-family:monospace;font-size:13px;min-height:100px"></div>
    <button id="btn-num" style="margin-top:8px;width:100%;padding:8px;border-radius:6px;border:none;background:#38bdf8;color:#0f172a;font-weight:700;font-size:12px;cursor:pointer">Copy Number</button>
  </div>
  <div>
    <div style="font-size:11px;color:#64748b;font-family:monospace;margin-bottom:8px">REFERENCE TYPE (array)</div>
    <div id="arr-box" style="background:#1e293b;border:1.5px solid #334155;border-radius:8px;padding:12px;font-family:monospace;font-size:13px;min-height:100px"></div>
    <button id="btn-arr" style="margin-top:8px;width:100%;padding:8px;border-radius:6px;border:none;background:#a78bfa;color:#0f172a;font-weight:700;font-size:12px;cursor:pointer">Copy Array</button>
  </div>
</div>
<div id="verdict" style="margin-top:10px;padding:10px;border-radius:8px;background:#1e293b;border:1px solid #334155;font-family:monospace;font-size:12px;color:#94a3b8;min-height:36px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}`,
                startCode: `
const numBox = document.getElementById('num-box');
const arrBox = document.getElementById('arr-box');
const verdict = document.getElementById('verdict');

function hl(s, color) { return \`<span style="color:\${color}">\${s}</span>\`; }
function row(label, val, c) { return \`<div>\${hl(label,'#64748b')} = \${hl(val,c)}</div>\`; }

let numState = null, arrState = null;

function renderNum() {
  if (!numState) { numBox.innerHTML = row('a','42','#38bdf8') + '<div style="color:#475569;font-size:11px;margin-top:6px">(click to see copy)</div>'; return; }
  const { a, b, changed } = numState;
  numBox.innerHTML = row('a', a, '#38bdf8') + row('b', b, '#4ade80') +
    (changed ? \`<div style="color:#4ade80;font-size:11px;margin-top:6px">b changed to \${b} — a stays \${a}</div>\` : \`<div style="color:#64748b;font-size:11px;margin-top:6px">b is a copy of a</div>\`);
}

function renderArr() {
  if (!arrState) { arrBox.innerHTML = row('a','[1,2,3]','#a78bfa') + '<div style="color:#475569;font-size:11px;margin-top:6px">(click to see copy)</div>'; return; }
  const { a, b, changed } = arrState;
  arrBox.innerHTML = row('a', JSON.stringify(a), '#a78bfa') + row('b', JSON.stringify(b), '#f87171') +
    (changed ? \`<div style="color:#f87171;font-size:11px;margin-top:6px">b.push(99) — a also changed!</div>\` : \`<div style="color:#64748b;font-size:11px;margin-top:6px">b = a shares the same array</div>\`);
}

renderNum(); renderArr();

document.getElementById('btn-num').addEventListener('click', () => {
  if (!numState) {
    numState = { a: 42, b: 42, changed: false };
    verdict.textContent = 'b = a creates a new independent number. They share no memory.';
  } else {
    numState.b = 99; numState.changed = true;
    verdict.textContent = '✓ b changed to 99 — a is still 42. Value semantics: truly independent.';
    verdict.style.color = '#4ade80';
  }
  renderNum();
});

document.getElementById('btn-arr').addEventListener('click', () => {
  if (!arrState) {
    const arr = [1, 2, 3];
    arrState = { a: arr, b: arr, changed: false };
    verdict.textContent = 'b = a copies the reference (the address). Both point to the same array in memory.';
  } else {
    arrState.a.push(99); arrState.changed = true;
    verdict.textContent = '⚠ b.push(99) also changed a! Reference semantics: same heap object.';
    verdict.style.color = '#f87171';
  }
  renderArr();
});
`,
                outputHeight: 280,
              },

              // ── Cell 4: Challenge ──────────────────────────────────────────────
              {
                type: 'challenge',
                title: 'Reference Semantics Check',
                instruction: 'In JavaScript, what does this code print?\n\n```\nconst a = { x: 1 };\nconst b = a;\nb.x = 99;\nconsole.log(a.x);\n```',
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: '1 — a was not changed, only b was.' },
                  { label: 'B', text: '99 — a and b reference the same object.' },
                  { label: 'C', text: 'undefined — b.x overwrites the property.' },
                  { label: 'D', text: 'Error — you cannot assign to a const.' },
                ],
                check: (label) => label === 'B',
                successMessage: '✓ Correct. b = a copies the reference, not the object. Both names point to the same heap location, so mutating through b is visible via a.',
                failMessage: '✗ Remember: objects are reference types. b = a does not copy the object — it copies the address. Changing b.x changes the underlying object that a also points to.',
              },

              // ── Cell 5: Challenge ──────────────────────────────────────────────
              {
                type: 'challenge',
                title: 'Stack vs Heap',
                instruction: 'Which of these statements about the call stack is **false**?',
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: 'When a function returns, its stack frame is automatically freed.' },
                  { label: 'B', text: 'Objects created inside a function are stored on the stack.' },
                  { label: 'C', text: 'Each function call pushes a new frame onto the stack.' },
                  { label: 'D', text: 'Unbounded recursion causes a stack overflow error.' },
                ],
                check: (label) => label === 'B',
                successMessage: '✓ Correct. Objects are NOT stored on the stack — they live on the heap. The stack holds the *reference* (address) to the object, not the object itself.',
                failMessage: '✗ The false statement is B. Objects live on the HEAP, not the stack. Only primitive values and references (pointers) live in stack frames.',
              },
            ],
          },
        },
      },
    ],
  },

  math: {
    prose: [
      'Memory addresses are just numbers — typically 64-bit integers on modern hardware. When we say a variable "holds a reference," we mean its storage location contains a number that is interpreted as the address of another memory location.',
      'A pointer arithmetic perspective: if an array `a` starts at address `0x2A00` and each integer takes 4 bytes, then `a[0]` is at `0x2A00`, `a[1]` is at `0x2A04`, `a[2]` is at `0x2A08`, and so on. Random access to `a[i]` is O(1) precisely because the address is computable: `base + i × element_size`.',
      'The stack grows "downward" (toward lower addresses) on most architectures. A new frame is allocated by subtracting from the stack pointer register. When a function returns, you add back to the stack pointer — the memory is not zeroed, it is just declared available. This is why reading an uninitialized stack variable gives garbage.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Stack pointer',
        body: 'A hardware register that tracks the top of the call stack. Function call: SP -= frame_size. Return: SP += frame_size. No memory allocation — just arithmetic on a pointer.',
      },
      {
        type: 'definition',
        title: 'Heap fragmentation',
        body: 'As objects are allocated and freed in arbitrary order, the heap develops "holes" — free regions that are too small to satisfy new allocation requests. Garbage collectors and memory allocators spend significant effort managing this.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'In Python, *everything* is an object, including integers. The variable `x = 5` creates an int object on the heap and stores a reference to it in `x`. Python caches small integers (-5 to 256) as singletons for performance, which is why `a = 5; b = 5; a is b` returns `True` — both reference the same cached object. This is an implementation detail, not the language semantics.',
      'In JavaScript, the specification defines a distinction between *primitive values* (number, string, boolean, null, undefined, symbol, bigint) and *objects*. Primitives are always copied by value in assignments. There is no primitive integer object — `typeof 42` is `"number"`, not `"object"`. Strings in JavaScript are immutable, so even though they behave like values, the engine may optimize by sharing memory for equal string literals.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Python `is` vs `==`',
        body: '`a == b` tests value equality (same content). `a is b` tests identity (same object in memory, same heap address). For objects, you almost always want `==`. For checking against singletons like `None`, use `is`: `if x is None:`.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      title: 'Python: Probe the Memory Model',
      description: 'Use `id()`, `is`, and `copy.copy()` to see references directly.',
      language: 'python',
      code: `# id() returns the memory address of an object (in CPython)
a = [1, 2, 3]
b = a           # same reference
c = a.copy()    # new list object (shallow copy)

print(f"id(a) = {id(a)}")
print(f"id(b) = {id(b)}  ← same as a")
print(f"id(c) = {id(c)}  ← different from a")
print()
print(f"a is b: {a is b}")   # True — same object
print(f"a is c: {a is c}")   # False — different object
print(f"a == c: {a == c}")   # True — same content

b.append(99)
print()
print(f"After b.append(99):")
print(f"  a = {a}  ← also changed!")
print(f"  b = {b}")
print(f"  c = {c}  ← unchanged (different object)")`,
    },
    {
      title: 'JavaScript: Value vs Reference in Functions',
      description: 'Functions receive references to objects — mutations persist after the call.',
      language: 'javascript',
      code: `// Primitive — function gets a copy
function addTen(n) {
  n += 10;
  console.log('inside:', n);
}
let x = 5;
addTen(x);
console.log('outside:', x); // still 5

console.log('---');

// Object — function gets a reference
function push99(arr) {
  arr.push(99);
}
let nums = [1, 2, 3];
push99(nums);
console.log(nums); // [1, 2, 3, 99] — mutated!`,
    },
  ],

  challenges: [
    {
      id: 'dsa0-001-c1',
      title: 'Deep Copy vs Shallow Copy',
      difficulty: 'medium',
      description: 'Write a Python function `deep_copy_matrix(matrix)` that returns a fully independent copy of a 2D list (list of lists). A simple `matrix.copy()` is NOT sufficient — explain why and fix it.',
      starterCode: `def deep_copy_matrix(matrix):
    # TODO: return a deep copy of matrix
    # Hint: matrix.copy() only copies the outer list.
    # The inner lists are still shared!
    pass

# Test it:
original = [[1, 2, 3], [4, 5, 6]]
copy = deep_copy_matrix(original)
original[0][0] = 999
print(copy[0][0])  # should print 1, not 999`,
      solution: `import copy

def deep_copy_matrix(matrix):
    return copy.deepcopy(matrix)
    # OR manually: return [row[:] for row in matrix]`,
      hint: 'A shallow copy of a 2D list copies the outer list but shares references to the inner lists. Use list comprehension with row[:] or Python\'s copy.deepcopy().',
    },
  ],
};
