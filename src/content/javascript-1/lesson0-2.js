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
      instruction: `The JavaScript runtime has four components that work together on every piece of code you run.\n\nThe call stack tracks active function execution — when a function is called, a frame is pushed; when it returns, the frame is popped. The heap is where all objects are stored — a large region of memory that holds the data your program creates. The single thread means only one stack frame can be executing at any moment — there is no true parallelism. The event loop watches the stack and a callback queue; when the stack is empty, it moves queued callbacks onto the stack to run.\n\nThese four components together explain all JavaScript execution behavior. Run the map below to lock in all four terms before diving deeper.`,
      html: `<div class="grid">
  <div class="tile" id="stack">Call Stack</div>
  <div class="tile" id="heap">Heap</div>
  <div class="tile" id="thread">Single Thread</div>
  <div class="tile" id="loop">Event Loop</div>
</div>`,
      css: `.grid{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0a1220;padding:14px;border-radius:10px;}
.tile{border:1px solid #334155;border-radius:10px;background:#111827;color:#cbd5e1;display:grid;place-items:center;font-weight:800;opacity:.5;transform:translateY(8px);transition:all .25s ease;}`,
      startCode: `['stack','heap','thread','loop'].forEach((id,i)=>{
  setTimeout(()=>{
    const el=document.getElementById(id);
    el.style.opacity='1';
    el.style.transform='translateY(0)';
    el.style.borderColor='#22d3ee';
    el.style.background='#082f49';
      },i*420);
});
console.log('Runtime model = stack + heap + single thread + event loop');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `The call stack is a last-in-first-out (LIFO) structure that tracks active function calls.\n\nWhen your program starts, a "global" frame is pushed onto the stack. Every time a function is called, a new frame is pushed on top. When that function returns (either explicitly or by reaching its end), its frame is popped off and execution resumes wherever it was before the call.\n\nLIFO means the last function called is always the first to return. If a() calls b() which calls c(), then c() returns before b() returns before a() returns.\n\nWatch frames push and pop in the animation below. The most-recently-called function is always at the top.`,
      html: `<div class="stackWrap"><div id="stackBox" class="stackBox"></div></div>`,
      css: `.stackWrap{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:flex;align-items:flex-end;justify-content:center;}
.stackBox{width:70%;height:100%;border:1px dashed #334155;border-radius:10px;padding:8px;display:flex;flex-direction:column-reverse;gap:6px;}
.frame{padding:8px;border:1px solid #334155;border-radius:8px;background:#111827;color:#e2e8f0;font-family:monospace;font-size:12px;}`,
      startCode: `const box=document.getElementById('stackBox');
function push(name){
  const d=document.createElement('div');
  d.className='frame';
  d.textContent=name;
  box.prepend(d);
  return d;
}
const f1=push('global()');
setTimeout(()=>push('main()'),550);
setTimeout(()=>push('compute()'),1100);
setTimeout(()=>{ box.firstChild?.remove(); console.log('return compute()'); },1750);
setTimeout(()=>{ box.firstChild?.remove(); console.log('return main()'); },2400);
setTimeout(()=>console.log('stack back to global frame'),3000);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `The heap is a large region of memory where JavaScript stores all objects.\n\nWhen you create an object (like { name: 'Ada', score: 10 }), the engine allocates a chunk of heap memory and stores the object there. Variables do not hold the object directly — they hold a reference (essentially an address) pointing to where the object lives in the heap.\n\nThis is why two variables can point to the same object. In the example below, both "user" and "alias" hold a reference to the same heap location. Mutating through one alias changes the object that the other alias also points to.\n\nRun the demo to see shared-reference mutation in action.`,
      html: `<div class="heapView">
  <div id="refs" class="panel"></div>
  <div id="objs" class="panel"></div>
</div>`,
      css: `.heapView{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0a1220;padding:14px;border-radius:10px;}
.panel{border:1px solid #334155;border-radius:10px;padding:8px;color:#cbd5e1;font-family:monospace;font-size:12px;background:#111827;line-height:1.6;}`,
      startCode: `const user={name:'Ada',score:10};
const alias=user;
alias.score=42;

document.getElementById('refs').innerHTML='Stack refs:<br>user -> #A<br>alias -> #A';
document.getElementById('objs').innerHTML='Heap object #A:<br>{ name: "'+user.name+'", score: '+user.score+' }';
console.log('Shared reference mutation:', user.score);`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `Primitives and objects behave differently when you assign one variable to another. This difference is the source of many bugs.\n\nFor primitives (numbers, strings, booleans), assignment copies the value itself. Changing one variable has no effect on the other — they each hold an independent copy.\n\nFor objects (arrays, objects, functions), assignment copies the reference — the address pointing into the heap. Both variables now point to the same heap object. Changing a property through one variable changes it for both.\n\nThis is not a quirk — it is how memory works. Primitives are small enough to copy directly; objects are not, so you share a pointer to them.\n\nRun and compare primitive copy versus object aliasing side by side.`,
      html: `<div class="cmp"><div id="p"></div><div id="o"></div></div>`,
      css: `.cmp{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
#p,#o{border:1px solid #334155;border-radius:10px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;}`,
      startCode: `let a=5; let b=a; b=9;
const obj1={x:1}; const obj2=obj1; obj2.x=9;

document.getElementById('p').textContent='Primitives: a='+a+', b='+b+' (copied value)';
document.getElementById('o').textContent='Objects: obj1.x='+obj1.x+', obj2.x='+obj2.x+' (shared ref)';
console.log('Primitive copy vs object reference.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `JavaScript is single-threaded: only one task can execute at a time on the call stack.\n\nThis is not a limitation to work around — it is a design decision that eliminates a whole class of concurrency bugs. You never have to worry about two pieces of code racing to modify the same variable at the same moment. The thread runs one thing, finishes it, and only then moves to the next.\n\nThis means if you have a long synchronous operation (a large loop, heavy computation), nothing else can run during that time. The thread is occupied. Other tasks — including user events and timers — must wait in a queue until the thread becomes available.\n\nWatch the queue drain one task at a time.`,
      html: `<div class="lane">
  <div id="thread" class="thread">Thread: idle</div>
  <div id="queue" class="queue"></div>
</div>`,
      css: `.lane{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;gap:10px;}
.thread{border:1px solid #334155;border-radius:8px;padding:10px;background:#111827;color:#93c5fd;font-weight:700;}
.queue{border:1px dashed #334155;border-radius:8px;padding:10px;min-height:90px;color:#cbd5e1;font-family:monospace;font-size:12px;}`,
      startCode: `const q=['taskA','taskB','taskC'];
const thread=document.getElementById('thread');
const queue=document.getElementById('queue');
function paint(){ queue.textContent='Queue: '+q.join(' -> '); }
paint();
let i=0;
function runOne(){
  if(i>=q.length){ thread.textContent='Thread: idle'; return; }
  thread.textContent='Thread: running '+q[i];
  q.shift(); paint();
  i++;
      setTimeout(runOne,700);
}
runOne();
console.log('Only one task executes at a time on this thread.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `Synchronous code runs in a straight line — no waiting, no skipping. The engine executes each statement in order before moving to the next.\n\nWhen you have a large synchronous operation (like a loop that counts to 4 million), the thread is fully occupied for the entire duration. No user interactions, no timer callbacks, no other work can interrupt it. Everything waits.\n\nThis is what "blocking" means: the thread is blocked from doing anything else until the current synchronous work finishes. Heavy synchronous operations in the browser cause the UI to freeze — the page stops responding because the thread cannot process user events while it is occupied.\n\nRun the demo to see synchronous execution block progress step by step.`,
      html: `<div class="blk"><div id="log"></div></div>`,
      css: `.blk{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#log{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;line-height:1.6;height:100%;}`,
      startCode: `const out=[];
out.push('1) start');
for(let i=0;i<4000000;i++){}
out.push('2) finished heavy sync loop');
out.push('3) now next line can run');
document.getElementById('log').innerHTML=out.join('<br>');
console.log('Sync loop blocked progress until done.');`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `The event loop is the mechanism that allows JavaScript to handle callbacks without being multi-threaded.\n\nWhen you schedule a callback (with setTimeout, for example), the callback is not placed directly on the call stack. Instead, when the timer fires (or the event occurs), the callback is placed into a callback queue. The event loop watches the call stack. When the stack is completely empty — meaning all synchronous work has finished — the event loop moves the next callback from the queue onto the stack and it runs.\n\nThis is why setTimeout(fn, 0) still runs after surrounding synchronous code. "0 milliseconds" means "as soon as the stack is clear" — not "immediately interrupting whatever is currently running."\n\nWatch the callback wait in the queue, then get picked up by the event loop when the stack clears.`,
      html: `<div class="loop"><div id="s"></div><div id="q"></div></div>`,
      css: `.loop{height:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0a1220;padding:14px;border-radius:10px;}
#s,#q{border:1px solid #334155;border-radius:10px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;}`,
      startCode: `const s=document.getElementById('s');
const q=document.getElementById('q');
s.innerHTML='Stack:<br>global()';
q.innerHTML='Queue:<br>(empty)';

setTimeout(()=>{
  q.innerHTML='Queue:<br>timerCallback()';
      setTimeout(()=>{
    s.innerHTML='Stack:<br>global()<br>timerCallback()';
    q.innerHTML='Queue:<br>(empty)';
    console.log('Callback moved from queue to stack after stack was clear.');
      },700);
},700);`,
      outputHeight: 220,
    },
    {
      type: 'markdown',
      instruction: `### The Event Loop Rule\n\nThe rule is precise and absolute:\n\n**The engine executes all synchronous stack frames first. Queued callbacks are only moved to the stack when the stack is completely empty.**\n\nThis means:\n- \`setTimeout(fn, 0)\` does not run immediately — it runs *after* all synchronous code in the current execution finishes.\n- User click handlers, fetch callbacks, and timer callbacks all follow the same rule.\n- A callback can only interrupt synchronous code if synchronous code voluntarily yields (which it does not).\n\nMemorise this rule. It explains every "why does this log in this order?" question you will ever have about JavaScript.`,
    },
    {
      type: 'js',
      instruction: `Now apply the event loop rule to a real execution order question.\n\nThe code runs three things:\n  1. A synchronous console.log('1) sync start')\n  2. A setTimeout callback — scheduled for "0ms" delay\n  3. Another synchronous console.log('2) sync end')\n\nBefore you run: predict the output order. The timer says 0ms, but that does not mean it runs immediately.\n\nRule: synchronous code runs to completion first. The timer callback is in a queue and can only run after the stack is clear.\n\nRun and verify. The output order should confirm the rule, not contradict it.`,
      html: `<div class="ord"><div id="ordLog"></div></div>`,
      css: `.ord{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#ordLog{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;line-height:1.6;height:100%;}`,
      startCode: `const lines=[];
setTimeout(()=>{ lines.push('3) timer callback'); document.getElementById('ordLog').innerHTML=lines.join('<br>'); console.log('timer callback'); },0);
lines.push('1) sync start');
lines.push('2) sync end');
document.getElementById('ordLog').innerHTML=lines.join('<br>');
console.log('sync done');`,
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
      instruction: `User interaction events do not run immediately when triggered. They follow the same event loop rule as timers.\n\nWhen you click a button, the browser detects the click and places the event handler callback into the queue. The event loop can only move it to the stack when the stack is empty. If synchronous code is running at the moment you click, the handler waits.\n\nThis is why a frozen UI (caused by a blocking sync loop) does not respond to clicks during the freeze — the click handler is in the queue but the thread is occupied and the event loop cannot dispatch it.\n\nClick the button below to trigger an event and observe the two-step process: queue → stack → run.`,
      html: `<div class="evt"><button id="btn">Click Event</button><div id="out"></div></div>`,
      css: `.evt{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;gap:10px;align-content:center;}
button{padding:10px;border-radius:8px;border:1px solid #334155;background:#111827;color:#e2e8f0;cursor:pointer;font-weight:700;}
#out{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;min-height:64px;font-size:12px;}`,
      startCode: `const out=document.getElementById('out');
out.textContent='Waiting for click...';
document.getElementById('btn').onclick=()=>{
  out.innerHTML='1) click event queued<br>2) stack clear -> handler runs';
  console.log('Event callback executed via event loop.');
};`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `A timer's delay value is a minimum wait, not an exact execution time.\n\nsetTimeout(fn, 120) means "enqueue fn no sooner than 120ms from now." It does not mean fn will run exactly at 120ms. If the thread is occupied when the timer fires, the callback waits in the queue. Execution only happens when the stack is clear.\n\nThis also means two timers with different delays might complete in delay order, but they still must wait for the stack. The event loop processes them in readiness order once the thread is available.\n\nWatch 'timer 120ms' and 'timer 300ms' in the demo — notice they run after sync end, in delay order.`,
      html: `<div class="tm"><div id="tmout"></div></div>`,
      css: `.tm{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#tmout{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;line-height:1.6;height:100%;}`,
      startCode: `const out=[];
function paint(){ document.getElementById('tmout').innerHTML=out.join('<br>'); }
out.push('sync start'); paint();
setTimeout(()=>{ out.push('timer 300ms ready -> run'); paint(); },300);
setTimeout(()=>{ out.push('timer 120ms ready -> run'); paint(); },120);
out.push('sync end'); paint();`,
      outputHeight: 220,
    },
    {
      type: 'js',
      instruction: `Now apply the full model. Before reading further, you should be able to explain any JavaScript execution order question using exactly four terms: stack, heap, thread, event loop.\n\nStack — tracks active function frames; LIFO unwind on return.\nHeap — stores all objects; references in variables point into it.\nSingle thread — one frame executes at a time; sync work blocks all other work.\nEvent loop — moves queued callbacks to the stack when the stack is empty.\n\nIf you cannot explain why a snippet logs in a particular order using only these four terms, rerun the relevant cell and trace through it slowly.\n\nRun the map below to lock in the summary before moving to challenges.`,
      html: `<div class="map">
  <div class="node" id="a">Stack = active calls</div>
  <div class="node" id="b">Heap = objects</div>
  <div class="node" id="c">Single thread = one active frame path</div>
  <div class="node" id="d">Event loop = schedules callbacks</div>
</div>`,
      css: `.map{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;gap:8px;}
.node{padding:8px;border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-size:12px;transition:all .2s ease;}`,
      startCode: `['a','b','c','d'].forEach((id,i)=>setTimeout(()=>{
  const el=document.getElementById(id);
  el.style.borderColor='#22d3ee';
  el.style.background='#082f49';
  el.style.color='#e0f2fe';
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
      instruction: `This is the complete runtime timeline — all four model components working together in one trace.\n\nRead each step as a causal chain: one thing causes the next. Nothing in this sequence is random. Every line follows directly from the rules you have learned.\n\n1. Objects are created and stored in the heap.\n2. A function is called — its frame is pushed onto the stack.\n3. A setTimeout call schedules a callback — it goes to the queue when the timer fires.\n4. The function returns — its frame is popped off the stack.\n5. The stack is now empty — the event loop checks the queue.\n6. The event loop moves the callback to the stack — the callback runs.\n\nEvery asynchronous program you write follows some version of this sequence.`,
      html: `<div class="cap"><div id="capOut"></div></div>`,
      css: `.cap{height:100%;background:#0a1220;padding:14px;border-radius:10px;}
#capOut{border:1px solid #334155;border-radius:8px;background:#111827;color:#cbd5e1;font-family:monospace;padding:10px;font-size:12px;line-height:1.6;height:100%;}`,
      startCode: `const lines=[];
lines.push('1) create objects in heap');
lines.push('2) push function on call stack');
lines.push('3) schedule callback in queue');
lines.push('4) stack clears');
lines.push('5) event loop moves callback to stack');
lines.push('6) callback runs');
document.getElementById('capOut').innerHTML=lines.join('<br>');
console.log('Runtime timeline complete.');`,
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
