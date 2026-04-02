const LESSON_JS_CORE_0_2 = {
  title: 'The JavaScript Runtime Model',
  subtitle: 'Call stack, heap, single-thread execution, and event-loop preview.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `### How To Study This Lesson\n\nThis lesson explains how JavaScript actually executes — not just what the code says, but what the engine does when it runs it. These four mechanisms explain almost every ordering bug you will ever encounter:\n\n- **Call stack** — tracks which function is currently executing\n- **Heap** — where objects live in memory\n- **Single thread** — one thing runs at a time\n- **Event loop** — how callbacks eventually get to run\n\nFor every visual cell:\n1. Predict the state changes before running.\n2. Run and observe carefully.\n3. Explain what happened using model terms — not "JavaScript is weird."\n\nYou are not writing JavaScript yet. You are building the mental model that makes async bugs predictable.`,
    },
    {
      type: 'js',
      instruction: `### The Core Components\n\nThe JavaScript runtime has four main components that work together on every piece of code you run:\n\n- **Call stack**: Tracks active function execution (Last-In-First-Out).\n- **Heap**: A large memory region where objects and arrays live.\n- **Single thread**: Only one stack frame executes at a time (no parallelism).\n- **Event loop**: Coordinates callbacks between the queue and the stack.\n\nThese components explain all JavaScript execution behavior. Run the map below to lock in these terms.`,
      html: `<div class="grid">
  <div class="tile" id="stack">Call Stack</div>
  <div class="tile" id="heap">Heap</div>
  <div class="tile" id="thread">Single Thread</div>
  <div class="tile" id="loop">Event Loop</div>
</div>`,
      css: `.grid{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0a1220;padding:14px;border-radius:10px;}
.tile{border:1px solid #334155;border-radius:10px;background:#111827;color:#cbd5e1;display:grid;place-items:center;font-size:13px;font-weight:800;opacity:.5;transform:translateY(8px);transition:all .25s ease;}`,
      startCode: `['stack','heap','thread','loop'].forEach((id,i)=>{
  setTimeout(()=>{
    const el=document.getElementById(id);
    el.style.opacity='1';
    el.style.transform='translateY(0)';
    el.style.borderColor='#22d3ee';
    el.style.background='#082f49';
    el.style.color='#fff';
      },i*420);
});
console.log('Runtime model = stack + heap + single thread + event loop');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### The Call Stack: Tracking Execution\n\nThe **call stack** is a "Last-In, First-Out" (LIFO) structure that tracks active function calls.\n\n- **Push**: When a function is called, a new "frame" is added to the top.\n- **Pop**: When a function returns, its frame is removed, and execution resumes in the frame below.\n\nLIFO means the last function called is always the first to finish. If \`a()\` calls \`b()\`, then \`b()\` must finish before \`a()\` can continue.\n\nWatch frames push and pop. The function at the top is the one currently running.`,
      html: `<div class="stackWrap"><div id="stackBox" class="stackBox"></div></div>`,
      css: `.stackWrap{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;align-items:flex-end;justify-content:center;}
.stackBox{width:70%;height:100%;border:1px dashed #334155;border-radius:10px;padding:8px;display:flex;flex-direction:column-reverse;gap:6px;}
.frame{padding:8px;border:1px solid #334155;border-radius:8px;background:#111827;color:#e2e8f0;font-family:monospace;font-size:12px;box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);}`,
      startCode: `const box=document.getElementById('stackBox');
function push(name){
  const d=document.createElement('div');
  d.className='frame';
  d.textContent=name;
  box.prepend(d);
  return d;
}
push('global()');
setTimeout(()=>push('main()'),550);
setTimeout(()=>push('compute()'),1100);
setTimeout(()=>{ box.firstChild?.remove(); console.log('return compute()'); },1900);
setTimeout(()=>{ box.firstChild?.remove(); console.log('return main()'); },2600);
setTimeout(()=>console.log('Stack back to global frame'),3200);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### The Heap: Object Memory\n\nThe **heap** is where JavaScript stores objects, arrays, and functions. \n\nVariables don't hold objects directly — they hold **references** (pointers) to a location in the heap. In the example below, both \`user\` and \`alias\` point to the exact same heap object (#A).\n\n> **The "Aha!" Moment**: Because they share a reference, changing the property via \`alias\` is immediately visible via \`user\`. They aren't copies; they are two names for the same thing.\n\nRun to see shared-reference mutation in action.`,
      html: `<div class="heapView">
  <div id="refs" class="panel"></div>
  <div id="objs" class="panel"></div>
</div>`,
      css: `.heapView{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0a1220;padding:14px;border-radius:10px;}
.panel{border:1px solid #334155;border-radius:10px;padding:12px;color:#cbd5e1;font-family:monospace;font-size:12px;background:#111827;line-height:1.6;}
.panel::before{content:attr(data-title); display:block; color:#94a3b8; font-size:10px; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;}`,
      startCode: `const user={name:'Ada',score:10};
const alias=user;
alias.score=42;

const r = document.getElementById('refs');
const o = document.getElementById('objs');
r.setAttribute('data-title', 'Stack References');
o.setAttribute('data-title', 'Heap Objects');

r.innerHTML='user -> #A <br>alias -> #A';
o.innerHTML='#A: { name: "Ada", score: 42 }';
console.log('Shared reference mutation: user.score is now', user.score);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Value vs. Reference\n\nPrimitives and objects behave differently when you assign one variable to another:\n\n- **Primitives** (Number, String, Boolean): Assignment **copies the value**. They are independent.\n- **Objects** (Array, Object): Assignment **copies the reference**. They share the same underlying data.\n\nThis is not a quirk — it's about efficiency. Large objects are expensive to copy, so JavaScript shares a pointer instead.\n\nCompare primitive copy vs. object aliasing side-by-side.`,
      html: `<div class="cmp"><div id="p" class="box"></div><div id="o" class="box"></div></div>`,
      css: `.cmp{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.box{border:1px solid #334155;border-radius:10px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:11px;line-height:1.5;}
.box::before{content:attr(data-type); display:block; color:#38bdf8; font-size:10px; margin-bottom:8px; font-weight:800;}`,
      startCode: `let a=5; let b=a; b=9;
const obj1={x:1}; const obj2=obj1; obj2.x=9;

const p = document.getElementById('p');
const o = document.getElementById('o');
p.setAttribute('data-type', 'PRIMITIVES (Copy)');
o.setAttribute('data-type', 'OBJECTS (Ref)');

p.innerHTML='let a=5;<br>let b=a;<br>b=9;<br><br>Result:<br>a: 5, b: 9';
o.innerHTML='obj1={x:1};<br>obj2=obj1;<br>obj2.x=9;<br><br>Result:<br>obj1.x: 9, obj2.x: 9';
console.log('Primitive copy vs object reference comparison complete.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Single Thread: One Task at a Time\n\nJavaScript is **single-threaded**, meaning it can only execute one line of code at a time on the stack.\n\n- **Benefit**: No race conditions. You don't have to worry about two things changing a variable at once.\n- **Cost**: Long-running synchronous code (like a massive loop) will **block** the thread, making the UI freeze until it finishes.\n\nWatch the queue drain. Tasks must wait for the thread to become idle before they can start.`,
      html: `<div class="lane">
  <div id="thread" class="thread">Thread: idle</div>
  <div id="queue" class="queue"></div>
</div>`,
      css: `.lane{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;gap:10px;}
.thread{border:1px solid #334155;border-radius:8px;padding:12px;background:#111827;color:#93c5fd;font-weight:800;text-align:center;}
.queue{border:1px dashed #334155;border-radius:8px;padding:12px;min-height:90px;color:#cbd5e1;font-family:monospace;font-size:12px;display:flex;align-items:center;justify-content:center;}`,
      startCode: `const q=['taskA','taskB','taskC'];
const thread=document.getElementById('thread');
const queue=document.getElementById('queue');
function paint(){ queue.textContent= q.length ? 'Queue: ' + q.join(' ← ') : 'Queue: empty'; }
paint();
let i=0;
function runOne(){
  if(q.length === 0){ thread.textContent='Thread: idle'; thread.style.borderColor='#334155'; return; }
  const current = q.shift();
  thread.textContent='Thread: running '+ current;
  thread.style.borderColor='#10b981';
  paint();
  setTimeout(runOne,800);
}
runOne();
console.log('Synchronous execution ensures order, but risks blocking.');`,
      outputHeight: 220,
    },

    {
      type: 'js',
      instruction: `### Blocking the Thread\n\nSynchronous code runs in a straight line — no waiting, no skipping. The engine executes each statement in order before moving to the next.\n\nWhen you run a massive synchronous task (like a loop that counts to 4 million), the **thread is fully occupied**. No user interaction, no scrolling, and no timers can interrupt it. \n\n> **Definition**: "Blocking" occurs when the thread is stuck on a task, preventing it from doing anything else. In the browser, this causes the page to freeze.\n\nRun the demo to see synchronous execution "block" progress until the final line.`,
      html: `<div class="blk"><div id="log"></div></div>`,
      css: `.blk{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#log{border:1px solid #334155;border-radius:12px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.7;height:100%; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06);}`,
      startCode: `const out=[];
out.push('<span style="color:#94a3b8">1) Sync start...</span>');
for(let i=0;i<4000000;i++){}
out.push('<span style="color:#10b981">2) Finished heavy loop!</span>');
out.push('<span style="color:#38bdf8">3) Next line runs now.</span>');
document.getElementById('log').innerHTML=out.join('<br>');
console.log('Synchronous loop blocked progress until done.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### The Event Loop: Callback Traffic Control\n\nThe **Event Loop** is why JavaScript can handle things like "waiting for a click" without needing multiple threads.\n\n1. When you schedule a callback (e.g., \`setTimeout\`), it goes to the **Callback Queue**.\n2. The Event Loop watches the **Call Stack**.\n3. **The Rule**: When the stack is empty, the loop moves the next callback from the queue to the stack.\n\nWatch the callback wait in the queue, then get picked up only after the "stack" clears.`,
      html: `<div class="loop">
  <div id="s" class="box" data-title="Call Stack"></div>
  <div id="q" class="box" data-title="Callback Queue"></div>
</div>`,
      css: `.loop{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#0a1220;padding:14px;border-radius:10px;}
.box{border:1px solid #334155;border-radius:10px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:11px;min-height:100px;}
.box::before{content:attr(data-title); display:block; color:#94a3b8; font-size:10px; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px; font-weight:800;}`,
      startCode: `const s=document.getElementById('s');
const q=document.getElementById('q');
s.innerHTML='global() <br><span style="color:#64748b">// Running sync code...</span>';
q.innerHTML='(empty)';

setTimeout(()=>{
  q.innerHTML='<span style="color:#fbbf24">timerCallback()</span>';
  setTimeout(()=>{
    s.innerHTML='global()<br><span style="color:#10b981">timerCallback()</span>';
    q.innerHTML='(empty)';
    console.log('Callback moved from queue to stack.');
  },1000);
},800);`,
      outputHeight: 220,
    },
    {
      type: 'markdown',
      instruction: `### The Golden Rule\n\nThe rule of the event loop is absolute:\n\n> **All synchronous stack frames execute first. Queued callbacks only move to the stack when the stack is completely empty.**\n\nThis means:\n- \`setTimeout(fn, 0)\` doesn't mean "now". It means "as soon as the stack is clear."\n- User clicks and network responses also wait for the stack.\n- JavaScript doesn't interrupt currently running code; it waits for it to finish.`,
    },
    {
      type: 'js',
      instruction: `### Predicting Execution Order\n\nPredict the output before you run this code. It uses a \`0ms\` timer, but remember the **Golden Rule**.\n\n1. A synchronous log (\`1) sync start\`)\n2. A \`setTimeout\` callback (scheduled for 0ms delay)\n3. A second synchronous log (\`2) sync end\`)\n\nEven though the timer is 0ms, it is a callback. It must wait for the stack to clear.`,
      html: `<div class="ord"><div id="ordLog"></div></div>`,
      css: `.ord{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#ordLog{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;font-size:12px;line-height:1.7;height:100%;}`,
      startCode: `const lines=[];
const el = document.getElementById('ordLog');
setTimeout(()=>{ 
  lines.push('<span style="color:#10b981">3) Timer callback run</span>'); 
  el.innerHTML=lines.join('<br>'); 
},0);
lines.push('1) Sync start');
lines.push('2) Sync end');
el.innerHTML=lines.join('<br>');
console.log('Synchronous sequence finished.');`,
      outputHeight: 220,
    },

    {
      type: 'js',
      instruction: `Every function call adds a frame to the stack. Deeply nested calls create a tall stack.\n\nIf a() calls b() which calls c(), the stack contains three frames: global at the bottom, then a(), then b(), then c() at the top. The top frame is the one currently executing. All frames below it are paused, waiting for the function above them to return.\n\nThis nesting is bounded by the call stack size. Most engines allow a few thousand nested frames before throwing a RangeError: Maximum call stack size exceeded — commonly called a stack overflow.\n\nWatch the stack grow as nested calls are added.`,
      html: `<div class="stackWrap"><div id="depthBox" class="stackBox"></div></div>`,
      css: `.stackWrap{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;align-items:flex-end;justify-content:center;}
.stackBox{width:72%;height:100%;border:1px dashed #334155;border-radius:10px;padding:8px;display:flex;flex-direction:column-reverse;gap:6px;}
.frame{padding:8px;border:1px solid #334155;border-radius:8px;background:#111827;color:#e2e8f0;font-family:monospace;font-size:12px;}`,
      startCode: `const b=document.getElementById('depthBox');
function add(name){ const d=document.createElement('div'); d.className='frame'; d.textContent=name; b.prepend(d); return d; }
add('global()');
setTimeout(()=>add('a()'),450);
setTimeout(()=>add('b()'),900);
setTimeout(()=>add('c()'),1350);
setTimeout(()=>console.log('Deeper nesting = deeper stack'),1800);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `Functions unwind in LIFO order: the last function called returns first.\n\nIf the call chain is a() → b() → c(), then the unwind order is c() returns, then b() returns, then a() returns. This is not arbitrary — the stack physically cannot pop b() until c() has returned and its frame has been removed.\n\nThis LIFO property is why you read stack traces from top to bottom in error messages: the top of the trace is where the error occurred (most recently called); the bottom is where execution started (earliest in the call chain).\n\nWatch the frames pop in reverse order.`,
      html: `<div class="stackWrap"><div id="unwind" class="stackBox"></div></div>`,
      css: `.stackWrap{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;align-items:flex-end;justify-content:center;}
.stackBox{width:72%;height:100%;border:1px dashed #334155;border-radius:10px;padding:8px;display:flex;flex-direction:column-reverse;gap:6px;}
.frame{padding:8px;border:1px solid #334155;border-radius:8px;background:#111827;color:#e2e8f0;font-family:monospace;font-size:12px;}`,
      startCode: `const b=document.getElementById('unwind');
['global()','a()','b()','c()'].forEach((n)=>{const d=document.createElement('div');d.className='frame';d.textContent=n;b.prepend(d);});
function popFrame(label, t){ setTimeout(()=>{ b.firstChild?.remove(); console.log('return '+label); }, t); }
popFrame('c()',500); popFrame('b()',1050); popFrame('a()',1600);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `Garbage collection reclaims heap memory when objects are no longer reachable.\n\nJavaScript uses automatic memory management. You do not explicitly free objects. Instead, the engine tracks which objects are still reachable from live variables. When no variable (directly or indirectly) holds a reference to an object, that object becomes unreachable and the garbage collector can reclaim the memory.\n\nSetting a variable to null removes that variable's reference to the object. If no other variable holds a reference to that same heap location, the object is now a candidate for collection.\n\nThis is not about variable names — it is purely about reachability from the root (the global scope and active stack frames).\n\nRun and watch object #A become unreachable when 'a' is set to null.`,
      html: `<div class="heapGC"><div id="objs"></div><div id="state"></div></div>`,
      css: `.heapGC{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
#objs,#state{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;}`,
      startCode: `let a={id:'A'}; let b={id:'B'};
document.getElementById('objs').innerHTML='Heap:<br>#A {id:"A"}<br>#B {id:"B"}';
document.getElementById('state').innerHTML='Refs:<br>a -> #A<br>b -> #B';
a=null;
setTimeout(()=>{
  document.getElementById('state').innerHTML='Refs:<br>a -> null<br>b -> #B<br>#A unreachable (GC candidate)';
  console.log('Unreachable objects can be garbage-collected.');
},900);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `Unbounded recursion causes a stack overflow.\n\nEvery function call pushes a frame. If a function calls itself without a base case to stop the recursion, frames keep piling up until the stack runs out of capacity. The engine throws a RangeError: Maximum call stack size exceeded.\n\nThis is not a limit you can raise — it is a hard constraint from the available call stack memory. Infinite or very deep recursion will always hit it. Properly bounded recursion (with a clear stopping condition) is safe.\n\nThe meter below simulates the stack fill rate as depth increases. Watch what happens when the limit approaches.`,
      html: `<div class="ov"><div id="meter"></div><div id="warn">Safe</div></div>`,
      css: `.ov{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;gap:10px;align-content:center;}
#meter{height:18px;border:1px solid #334155;border-radius:999px;background:linear-gradient(90deg,#10b981 0%,#10b981 0%,transparent 0%);}
#warn{padding:8px;border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;text-align:center;}`,
      startCode: `const meter=document.getElementById('meter');
const warn=document.getElementById('warn');
let pct=0;
const id=setInterval(()=>{
  pct+=12;
  meter.style.background='linear-gradient(90deg,#10b981 0%,#10b981 '+Math.min(pct,100)+'%,transparent '+Math.min(pct,100)+'%)';
  if(pct>=84){ warn.textContent='Danger: too many frames'; warn.style.borderColor='#ef4444'; warn.style.color='#fecaca'; }
  if(pct>=100){ clearInterval(id); console.log('Unbounded recursion risks stack overflow.'); }
},260);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Event Order: Real World\n\nUser interactions like clicks follow the same rule. If the stack is busy, the click handler waits in the queue.\n\nThis is why a "blocking" loop makes a page unresponsive. The browser records your click, but the **Event Loop** can't move the handler to the stack until the loop finishes.\n\n1. Run the cell.\n2. Click the button immediately.\n3. Observe the delay between the "Click" and the "Handler" message.`,
      html: `<div class="evt"><button id="btn">Click This Button</button><div id="out"></div></div>`,
      css: `.evt{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;gap:12px;align-content:center;}
button{padding:12px;border-radius:12px;border:1px solid #334155;background:#111827;color:#e2e8f0;cursor:pointer;font-weight:700; transition: all 0.2s ease;}
button:hover{border-color: #38bdf8; background: #1e293b;}
#out{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:12px;min-height:64px;font-size:11px;line-height:1.5;}`,
      startCode: `const out=document.getElementById('out');
out.textContent='Waiting for click...';
document.getElementById('btn').onclick=()=>{
  out.innerHTML='<span style="color:#fbbf24">1) Click Queued</span><br><span style="color:#10b981">2) Stack Clear -> Handler Run</span>';
  console.log('Event callback executed.');
};`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Minimum Delay, Not Exact\n\nWhen you call \`setTimeout(fn, 120)\`, it means: "Enqueue this function in **at least** 120ms."\n\nIf the thread is busy at exactly 120ms, the callback waits. It will never run *before* the time, but it might run much *after* if the stack is blocked.\n\nWatch 'Timer 120ms' and 'Timer 300ms' below. Even though they have different delays, they both wait for the synchronous code to finish ("Sync End") before they can even start.`,
      html: `<div class="tm"><div id="tmout"></div></div>`,
      css: `.tm{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#tmout{border:1px solid #334155;border-radius:12px;background:#111827;color:#cbd5e1;font-family:monospace;padding:14px;font-size:12px;line-height:1.7;height:100%;}`,
      startCode: `const out=[];
const el = document.getElementById('tmout');
function paint(){ el.innerHTML=out.join('<br>'); }
out.push('<span style="color:#94a3b8">Sync Start</span>'); paint();
setTimeout(()=>{ out.push('<span style="color:#fbbf24">Timer 300ms: Run</span>'); paint(); },300);
setTimeout(()=>{ out.push('<span style="color:#fbbf24">Timer 120ms: Run</span>'); paint(); },120);
out.push('<span style="color:#94a3b8">Sync End</span>'); paint();
console.log('Synchronous sequence finished.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### Master the Model\n\nTo debug effectively, replace phrases like "JavaScript is weird" with these four terms:\n\n- **Stack**: Active call frames (unwinds top-down).\n- **Heap**: Object memory (referenced by variables).\n- **Single Thread**: Only one frame path runs at a time.\n- **Event Loop**: Moves callbacks from queue to stack when clear.\n\nIf you can't explain why a piece of code works using these terms, you don't yet understand it. Every behavior in this course can be traced back to this model.`,
      html: `<div class="map">
  <div class="node" id="a">STACK (Current Task)</div>
  <div class="node" id="b">HEAP (Memory)</div>
  <div class="node" id="c">THREAD (One Path)</div>
  <div class="node" id="d">EVENT LOOP (Orchestrator)</div>
</div>`,
      css: `.map{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;grid-template-columns: 1fr 1fr; gap:12px;}
.node{padding:14px;border:1px solid #334155;border-radius:12px;background:#111827;color:#94a3b8;font-size:11px; font-weight: 700; text-align: center; transition:all 0.3s ease;}`,
      startCode: `['a','b','c','d'].forEach((id,i)=>setTimeout(()=>{
  const el=document.getElementById(id);
  el.style.borderColor='#38bdf8';
  el.style.background='#082f49';
  el.style.color='#fff';
  el.style.transform='scale(1.05)';
},i*380));
console.log('Runtime model summary complete.');`,
      outputHeight: 220,
    },

    {
      type: 'js',
      instruction: `One more visual before challenges: the predict-before-run pattern.\n\nThis is the study method you should use for every code snippet in this course. Read the code, write your predicted output order, then run to compare.\n\nThe code below logs A synchronously, schedules a timer for C, then logs B synchronously. Apply the event loop rule and predict the order before pressing Run.\n\nExpected order: A → B → C. A and B are synchronous and run in sequence. C is in a timer callback that only runs after the synchronous code finishes and the stack clears.\n\nRun and confirm.`,
      html: `<div class="pred"><div id="predOut">Run to inspect order...</div></div>`,
      css: `.pred{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#predOut{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;line-height:1.6;height:100%;}`,
      startCode: `const out=[];
out.push('A: sync');
setTimeout(()=>{ out.push('C: timer'); document.getElementById('predOut').innerHTML=out.join('<br>'); },0);
out.push('B: sync');
document.getElementById('predOut').innerHTML=out.join('<br>');
console.log('Order currently:', out.join(' -> '));`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `The event loop moves a callback from queue to stack in two distinct steps.\n\nStep 1: A timer fires or an event occurs. The callback is placed into the queue. It is not on the stack — it is waiting.\nStep 2: The event loop checks the call stack. When the stack is empty, it takes the first callback from the queue and pushes it onto the stack. The callback now runs normally.\n\nThese two steps are always separate. The callback never teleports directly onto the stack — it always passes through the queue first.\n\nWatch the explicit queue-to-stack transfer below. Track which side holds the callback at each moment.`,
      html: `<div class="sim"><div id="simStack"></div><div id="simQueue"></div></div>`,
      css: `.sim{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0a1220;padding:14px;border-radius:10px;}
#simStack,#simQueue{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;}`,
      startCode: `const s=document.getElementById('simStack');
const q=document.getElementById('simQueue');
s.innerHTML='Stack:<br>global()';
q.innerHTML='Queue:<br>timer()';
setTimeout(()=>{ s.innerHTML='Stack:<br>global()<br>timer()'; q.innerHTML='Queue:<br>(empty)'; },700);
setTimeout(()=>{ s.innerHTML='Stack:<br>global()'; console.log('Simulator step complete.'); },1400);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `### The Complete Runtime Timeline\n\nThis is the complete runtime timeline — all four model components working together in one trace. \n\nRead each step as a **causal chain**: one thing causes the next. Nothing in this sequence is random. Every line follows directly from the rules you have learned:\n\n1. **Heap**: Objects are created and stored in the heap.\n2. **Stack (Push)**: A function is called — its frame is pushed onto the stack.\n3. **Queue**: A \`setTimeout\` call schedules a callback — it goes to the queue when the timer fires.\n4. **Stack (Pop)**: The function returns — its frame is popped off the stack.\n5. **Empty Stack**: The stack is now empty — the event loop checks the queue.\n6. **Execution**: The event loop moves the callback to the stack — the callback runs.\n\nEvery asynchronous program you write follows some version of this sequence.`,
      html: `<div class="cap"><div id="capOut" class="timeline-box"></div></div>`,
      css: `.cap{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
.timeline-box{border:1px solid #334155;border-radius:12px;background:#111827;color:#cbd5e1;font-family:monospace;padding:16px;font-size:11px;line-height:1.8;height:100%; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06);}`,
      startCode: `const lines=[];
const el = document.getElementById('capOut');
const sequence = [
  '<span style="color:#94a3b8">1) Heap:</span> Create objects',
  '<span style="color:#38bdf8">2) Stack:</span> Push main()',
  '<span style="color:#fbbf24">3) Queue:</span> Timer scheduled',
  '<span style="color:#38bdf8">4) Stack:</span> main() popped',
  '<span style="color:#10b981">5) Loop:</span> Transferring callback...',
  '<span style="color:#10b981">6) Run:</span> Callback executing'
];

sequence.forEach((text, i) => {
  setTimeout(() => {
    lines.push(text);
    el.innerHTML = lines.join('<br>');
    console.log('Timeline step:', i + 1);
  }, i * 600);
});`,
      outputHeight: 220,
    },

    {
      type: 'markdown',
      instruction: `### Before Challenges\n\nThese challenges test your **understanding of the runtime model**, not your ability to write JavaScript. You are not expected to write functions, loops, or objects from scratch — that starts in Phase 1.\n\nEach challenge gives you code that is mostly pre-written. Your job is to predict what happens, classify items correctly, or explain a rule.\n\nUse the model to reason:\n- Which frame is active on the stack?\n- Which objects live on the heap?\n- Is this synchronous or a queued callback?\n- When can the event loop dispatch?\n\nIf you cannot answer without guessing, go back and rerun the relevant visual cell.`,
    },

    {
      type: 'challenge',
      instruction: 'Challenge 1: Event loop order prediction. Three things happen in the code below. Before running, predict what logs first, second, and third. Change firstLog, secondLog, thirdLog to the correct word from: "alpha", "beta", "gamma".',
      html: `<div class="challenge"><div id="c1">Change firstLog, secondLog, thirdLog to predict the order.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c1{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Three events:
//   console.log('alpha')   <- synchronous
//   setTimeout(fn, 0)      <- callback scheduled for queue
//   console.log('beta')    <- synchronous
//
// The timer callback logs 'gamma'.
// Apply the event loop rule and predict the output order.

const firstLog = '?';    // change to 'alpha', 'beta', or 'gamma'
const secondLog = '?';   // change to 'alpha', 'beta', or 'gamma'
const thirdLog = '?';    // change to 'alpha', 'beta', or 'gamma'

const correct = firstLog === 'alpha' && secondLog === 'beta' && thirdLog === 'gamma';
console.log('Predicted order:', firstLog, secondLog, thirdLog);
console.log('Correct?', correct);
document.getElementById('c1').textContent = correct ? 'Correct!' : 'Apply the rule: sync runs first, timer callback runs last.';
document.getElementById('c1').style.borderColor = correct ? '#10b981' : '#ef4444';

// Check yourself — run this and see the actual order:
console.log('alpha');
setTimeout(() => console.log('gamma'), 0);
console.log('beta');
`,
      solutionCode: `const firstLog = 'alpha';
const secondLog = 'beta';
const thirdLog = 'gamma';
const correct = firstLog === 'alpha' && secondLog === 'beta' && thirdLog === 'gamma';
console.log('Predicted order:', firstLog, secondLog, thirdLog);
console.log('Correct?', correct);
document.getElementById('c1').textContent = 'Correct!';
document.getElementById('c1').style.borderColor = '#10b981';
console.log('alpha');
setTimeout(() => console.log('gamma'), 0);
console.log('beta');
`,
      check: (code) => /firstLog\s*=\s*['"]alpha['"]/.test(code) && /secondLog\s*=\s*['"]beta['"]/.test(code) && /thirdLog\s*=\s*['"]gamma['"]/.test(code),
      successMessage: 'Correct. Sync runs to completion; timer callback runs only after the stack clears.',
      failMessage: 'Alpha and beta are synchronous — they run in order. Gamma is in a timer callback — it waits until the stack is empty.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 2: Stack vs heap classification. Change each variable to "stack" or "heap" to show where each item is stored in the runtime model.',
      html: `<div class="challenge"><div id="c2">Classify each item as stack or heap.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c2{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Change each value to 'stack' or 'heap'.
const whereAreActiveCallFrames = '?';   // where function call records live
const whereAreObjects = '?';             // where { name: 'Ada' } is stored
const whereArePrimitiveBindings = '?';  // where the binding let x = 5 lives

const correct =
  whereAreActiveCallFrames === 'stack' &&
  whereAreObjects === 'heap' &&
  whereArePrimitiveBindings === 'stack';

console.log('Call frames:', whereAreActiveCallFrames);
console.log('Objects:', whereAreObjects);
console.log('Primitive bindings:', whereArePrimitiveBindings);
console.log('Correct?', correct);
document.getElementById('c2').textContent = correct ? 'Correct!' : 'Review Slides 2 and 3.';
document.getElementById('c2').style.borderColor = correct ? '#10b981' : '#ef4444';
`,
      solutionCode: `const whereAreActiveCallFrames = 'stack';
const whereAreObjects = 'heap';
const whereArePrimitiveBindings = 'stack';
const correct = whereAreActiveCallFrames === 'stack' && whereAreObjects === 'heap' && whereArePrimitiveBindings === 'stack';
console.log('Call frames:', whereAreActiveCallFrames);
console.log('Objects:', whereAreObjects);
console.log('Primitive bindings:', whereArePrimitiveBindings);
console.log('Correct?', correct);
document.getElementById('c2').textContent = 'Correct!';
document.getElementById('c2').style.borderColor = '#10b981';
`,
      check: (code) => /whereAreActiveCallFrames\s*=\s*['"]stack['"]/.test(code) && /whereAreObjects\s*=\s*['"]heap['"]/.test(code) && /whereArePrimitiveBindings\s*=\s*['"]stack['"]/.test(code),
      successMessage: 'Correct. Call frames and local bindings live on the stack; objects live in the heap.',
      failMessage: 'Stack tracks execution frames. Heap stores objects. Review Slides 2 and 3.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 3: Shared reference prediction. Two variables point to the same object. Mutating through one changes both. Predict what user.score will be after the mutation below.',
      html: `<div class="challenge"><div id="c3">Change myPrediction to the expected value of user.score.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c3{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// The code below creates one object and two references to it.
// alias and user both point to the same heap object.
// Mutating alias.score also changes user.score.
//
// After alias.score = 42, what is user.score?
// Change myPrediction to your answer.

const myPrediction = 0; // change this number

const user = { score: 10 };
const alias = user;
alias.score = 42;

const correct = myPrediction === user.score;
console.log('My prediction:', myPrediction);
console.log('user.score is:', user.score);
console.log('Correct?', correct);
document.getElementById('c3').textContent = correct ? 'Correct!' : 'Both variables point to the same heap object.';
document.getElementById('c3').style.borderColor = correct ? '#10b981' : '#ef4444';
`,
      solutionCode: `const myPrediction = 42;
const user = { score: 10 };
const alias = user;
alias.score = 42;
const correct = myPrediction === user.score;
console.log('My prediction:', myPrediction);
console.log('user.score is:', user.score);
console.log('Correct?', correct);
document.getElementById('c3').textContent = 'Correct!';
document.getElementById('c3').style.borderColor = '#10b981';
`,
      check: (code) => /myPrediction\s*=\s*42/.test(code),
      successMessage: 'Correct. Both variables reference the same heap object — the mutation is visible through either name.',
      failMessage: 'alias and user both point to the same object in the heap. Changing alias.score changes the shared object.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 4: Single-thread ordering. A heavy sync loop and a setTimeout both run. Which message logs first: "sync done" or "timer fired"? Change syncFinishesFirst to true or false.',
      html: `<div class="challenge"><div id="c4">Does sync finish before the timer callback?</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c4{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// The single thread runs synchronous code to completion
// before any queued timer callbacks can run.
//
// Does 'sync done' log before 'timer fired'?
// Change syncFinishesFirst to true or false.

const syncFinishesFirst = false; // change this

const correct = syncFinishesFirst === true;
console.log('My answer:', syncFinishesFirst);
console.log('Correct?', correct);
document.getElementById('c4').textContent = correct ? 'Correct!' : 'The thread is occupied with sync work.';
document.getElementById('c4').style.borderColor = correct ? '#10b981' : '#ef4444';

// Verify by running the actual code:
setTimeout(() => console.log('timer fired'), 0);
for (let i = 0; i < 1000000; i++) {}
console.log('sync done');
`,
      solutionCode: `const syncFinishesFirst = true;
const correct = syncFinishesFirst === true;
console.log('My answer:', syncFinishesFirst);
console.log('Correct?', correct);
document.getElementById('c4').textContent = 'Correct!';
document.getElementById('c4').style.borderColor = '#10b981';
setTimeout(() => console.log('timer fired'), 0);
for (let i = 0; i < 1000000; i++) {}
console.log('sync done');
`,
      check: (code) => /syncFinishesFirst\s*=\s*true/.test(code),
      successMessage: 'Correct. The timer callback is queued but must wait for the sync loop to finish and the stack to clear.',
      failMessage: 'Even with 0ms delay, a timer callback cannot interrupt synchronous execution.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 5: LIFO unwind order. If a() calls b() which calls c(), in what order do they return? Change returnFirst, returnSecond, returnThird to "a", "b", or "c".',
      html: `<div class="challenge"><div id="c5">What is the LIFO return order?</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c5{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Call chain: a() calls b(), b() calls c()
// Stack at deepest point: [global, a, b, c]  (c is on top)
//
// Functions return in LIFO order: last in, first out.
// Which returns first? Which last?

const returnFirst = '?';   // 'a', 'b', or 'c'
const returnSecond = '?';  // 'a', 'b', or 'c'
const returnThird = '?';   // 'a', 'b', or 'c'

const correct = returnFirst === 'c' && returnSecond === 'b' && returnThird === 'a';
console.log('Return order:', returnFirst, returnSecond, returnThird);
console.log('Correct?', correct);
document.getElementById('c5').textContent = correct ? 'Correct!' : 'Think: which frame is on top of the stack?';
document.getElementById('c5').style.borderColor = correct ? '#10b981' : '#ef4444';
`,
      solutionCode: `const returnFirst = 'c';
const returnSecond = 'b';
const returnThird = 'a';
const correct = returnFirst === 'c' && returnSecond === 'b' && returnThird === 'a';
console.log('Return order:', returnFirst, returnSecond, returnThird);
console.log('Correct?', correct);
document.getElementById('c5').textContent = 'Correct!';
document.getElementById('c5').style.borderColor = '#10b981';
`,
      check: (code) => /returnFirst\s*=\s*['"]c['"]/.test(code) && /returnSecond\s*=\s*['"]b['"]/.test(code) && /returnThird\s*=\s*['"]a['"]/.test(code),
      successMessage: 'Correct. c() is on top of the stack so it returns first. a() is at the bottom so it returns last.',
      failMessage: 'The top frame returns first. c() was called last so it is on top and returns first.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 6: Garbage collection eligibility. After obj = null, can the garbage collector reclaim the heap object that obj was pointing to? Change canBeCollected to true or false.',
      html: `<div class="challenge"><div id="c6">Is the object eligible for garbage collection?</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c6{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// An object is eligible for GC when nothing references it.
//
// let obj = { data: 'important' };  // obj -> heap object #A
// obj = null;                        // obj no longer references #A
//
// After obj = null, is heap object #A eligible for garbage collection?
// (Assume no other variable references it.)

const canBeCollected = false; // change to true or false

const correct = canBeCollected === true;
console.log('Can be collected:', canBeCollected);
console.log('Correct?', correct);
document.getElementById('c6').textContent = correct ? 'Correct!' : 'Is there any path to reach heap object #A?';
document.getElementById('c6').style.borderColor = correct ? '#10b981' : '#ef4444';
`,
      solutionCode: `const canBeCollected = true;
const correct = canBeCollected === true;
console.log('Can be collected:', canBeCollected);
console.log('Correct?', correct);
document.getElementById('c6').textContent = 'Correct!';
document.getElementById('c6').style.borderColor = '#10b981';
`,
      check: (code) => /canBeCollected\s*=\s*true/.test(code),
      successMessage: 'Correct. Once obj = null, no reference reaches the heap object — it is unreachable and eligible for GC.',
      failMessage: 'After obj = null, nothing holds a reference to the heap object. It is unreachable.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 7: Primitive copy prediction. When you copy a primitive (number) to a new variable and then change the copy, does the original change? Change originalChanges to true or false.',
      html: `<div class="challenge"><div id="c7">Does changing the copy affect the original primitive?</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c7{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Primitives are copied by value, not by reference.
//
// let original = 5;
// let copy = original;   // copy gets its own independent value: 5
// copy = 99;             // only copy changes
//
// After copy = 99, does original change from 5?

const originalChanges = false; // change to true or false

let original = 5;
let copy = original;
copy = 99;

const correct = originalChanges === false;
console.log('original:', original, '  copy:', copy);
console.log('originalChanges was:', originalChanges, '  Correct?', correct);
document.getElementById('c7').textContent = correct ? 'Correct! original stays ' + original : 'Think: primitives are copied by value.';
document.getElementById('c7').style.borderColor = correct ? '#10b981' : '#ef4444';
`,
      solutionCode: `const originalChanges = false;
let original = 5;
let copy = original;
copy = 99;
const correct = originalChanges === false;
console.log('original:', original, '  copy:', copy);
console.log('Correct?', correct);
document.getElementById('c7').textContent = 'Correct! original stays ' + original;
document.getElementById('c7').style.borderColor = '#10b981';
`,
      check: (code) => /originalChanges\s*=\s*false/.test(code),
      successMessage: 'Correct. Primitive assignment copies the value. original and copy are independent.',
      failMessage: 'Primitives are copied by value. Changing copy does not affect original.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 8: Runtime model synthesis. Write one sentence inside console.log that uses all four runtime model terms: stack, heap, thread, event loop.',
      html: `<div class="challenge"><div id="c8">Write a synthesis sentence using all four terms.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c8{padding:10px;border:1px solid #334155;border-radius:8px;text-align:center;}`,
      startCode: `// Write one sentence that uses all four terms:
// stack, heap, thread, event loop
//
// Replace the ??? with your sentence.
console.log('???');
`,
      solutionCode: `console.log('The stack runs active calls, the heap stores objects, one thread executes at a time, and the event loop dispatches queued callbacks when the stack is clear.');
document.getElementById('c8').textContent = 'Synthesis complete.';
document.getElementById('c8').style.borderColor = '#10b981';
`,
      check: (code) => {
        const t = code.toLowerCase();
        return t.includes('console.log') && t.includes('stack') && t.includes('heap') && t.includes('thread') && t.includes('event loop');
      },
      successMessage: 'Strong synthesis. Your runtime model is coherent and complete.',
      failMessage: 'Your sentence must include all four terms: stack, heap, thread, and event loop.',
      outputHeight: 220,
    },
  ],
};

export default {
  id: 'js-core-0-2-runtime-model',
  slug: 'javascript-runtime-model',
  chapter: 'js0.1',
  order: 1,
  title: 'The JavaScript Runtime Model',
  subtitle: 'Call stack, heap, single-thread execution, and event-loop preview',
  tags: ['javascript', 'runtime', 'call-stack', 'heap', 'event-loop', 'single-thread'],

  hook: {
    question: 'If JavaScript is single-threaded, how does asynchronous behavior appear?',
    realWorldContext:
      'Reliable debugging requires a runtime model. This lesson turns stack/heap/event-loop behavior into visible cause-and-effect.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'The call stack tracks active execution contexts, while the heap stores objects and reference-linked state.',
      'Single-threaded execution is reconciled with asynchronous callbacks through queueing and event-loop scheduling.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Runtime Before Frameworks',
        body: 'If you can predict stack/queue transitions, async bugs become explainable instead of random.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'JavaScript Runtime Interactive Lab',
        props: {
          lesson: LESSON_JS_CORE_0_2,
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],

  mentalModel: [
    'Stack: active function frames, LIFO return order.',
    'Heap: reference-based object memory.',
    'Single-thread: one active stack execution path at a time.',
    'Event loop: dispatches ready callbacks when stack permits.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}
