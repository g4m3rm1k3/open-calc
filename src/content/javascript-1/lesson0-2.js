const LESSON_JS_CORE_0_2 = {
  title: 'The JavaScript Runtime Model',
  subtitle: 'Call stack, heap, single-thread execution, and event-loop preview.',
  sequential: true,

  cells: [
            {
                  type: 'markdown',
                  instruction: `### Runtime Model: How To Study This Lesson\nEach visual is a **mechanism demo**, not the whole lesson.\n\nFor every cell:\n1. Predict the order/state changes.\n2. Run and observe carefully.\n3. Explain with model terms: **stack**, **heap**, **thread**, **event loop**.\n\nGoal: move from memorizing outputs to reasoning from runtime rules.`,
            },
    {
      type: 'js',
                  instruction: 'Slide 1: Runtime map overview.\nYou are about to use this map to explain every ordering bug in JavaScript.',
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
                  instruction: 'Slide 2: Call stack push/pop mechanics.\nWatch frame growth (call) and LIFO shrink (return).',
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
                  instruction: 'Slide 3: Heap and references.\nTwo variables can point to one object; mutation through either alias affects the same heap object.',
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
                  instruction: 'Slide 4: Primitive copy vs object aliasing.\nThis is the key distinction behind many state bugs.',
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
                  instruction: 'Slide 5: Single-thread scheduler intuition.\nOne task runs; others must wait. Watch queue drain one-by-one.',
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
                  instruction: 'Slide 6: Synchronous blocking.\nThe thread cannot do other work until current sync work finishes.',
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
                  instruction: 'Slide 7: Event loop preview.\nCallbacks do not jump in immediately; they wait until stack is clear.',
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
                  instruction: `### Event Loop Rule (Preview)\n**Rule:** the engine executes stack frames first; queued callbacks are only pulled when the stack can accept new work.\n\nThis is why \`setTimeout(fn, 0)\` still runs **after** surrounding synchronous lines.`,
            },
    {
      type: 'js',
                  instruction: 'Slide 8: Execution order trap.\nExplain output using stack-then-queue logic, not “JavaScript is weird.”',
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
      instruction: 'Slide 9: Nesting depth and stack growth.\nDeeper call chains increase active frame depth.',
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
      instruction: 'Slide 10: Unwinding order.\nReturns occur Last-In-First-Out (LIFO).',
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
      instruction: 'Slide 11: Reachability and garbage collection.\nGC is about reachability, not variable names.',
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
      instruction: 'Slide 12: Stack overflow intuition.\nUnbounded recursion keeps pushing frames until capacity is exceeded.',
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
      instruction: 'Slide 13: Event source pipeline.\nUser events enqueue handlers; execution still obeys stack availability.',
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
      instruction: 'Slide 14: Timer readiness vs execution.\nReadiness order and execution order are constrained by the thread.',
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
      instruction: 'Slide 15: Mental model summary.\nYou should now narrate any snippet using stack/heap/thread/event-loop terms.',
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
      instruction: 'Slide 16: Predict-before-run sandbox.\nWrite your expected order first, then validate with execution.',
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
      instruction: 'Slide 17: Runtime simulator.\nObserve the explicit queue -> stack transfer moment.',
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
      instruction: 'Slide 18: Capstone timeline.\nThis is the full runtime story in one trace; read each line as a causal step.',
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
                  instruction: `### Before Challenges\nDo not brute-force answers. Use the model:\n- Which frame is active on stack?\n- Which objects live on heap?\n- What is waiting in queues?\n- When can the event loop dispatch callbacks?\n\nIf you can explain those four, challenge code becomes predictable.`,
            },

    {
      type: 'challenge',
      instruction: 'Challenge 1: Call stack push/pop. Write code that calls three nested functions and logs return order.',
      html: `<div class="challenge"><div id="c1">Need logs showing nested entry/return order.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c1{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// Define a(), b(), c() with nested calls.
// Log entering/exiting to show stack behavior.
`,
      solutionCode: `function c(){ console.log('enter c'); console.log('exit c'); }
function b(){ console.log('enter b'); c(); console.log('exit b'); }
function a(){ console.log('enter a'); b(); console.log('exit a'); }
a();`,
      check: (code) => /function\s+a/.test(code) && /function\s+b/.test(code) && /function\s+c/.test(code) && /a\(\)/.test(code),
      successMessage: 'Nice. You demonstrated stack growth and LIFO unwind.',
      failMessage: 'Define a/b/c with nested calls and execute a().',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 2: Heap reference behavior. Create one object and two references, mutate via one, log from the other.',
      html: `<div class="challenge"><div id="c2">Show shared reference mutation.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c2{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// const obj = ...
// const ref = ...
// mutate through ref
// log through obj
`,
      solutionCode: `const obj={count:1};
const ref=obj;
ref.count=7;
console.log(obj.count);`,
      check: (code) => /const\s+obj/.test(code) && /const\s+ref/.test(code) && /ref\./.test(code) && /console\.log\(obj\./.test(code),
      successMessage: 'Correct. Heap object is shared by both references.',
      failMessage: 'Create object + alias ref, mutate alias, log original.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 3: Primitive copy behavior. Show that changing copied primitive does not change original.',
      html: `<div class="challenge"><div id="c3">Demonstrate copy-by-value.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c3{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// let a = ...
// let b = a
// change b
// console.log(a, b)
`,
      solutionCode: `let a=3;
let b=a;
b=9;
console.log(a,b);`,
      check: (code) => /let\s+a/.test(code) && /let\s+b\s*=\s*a/.test(code) && /console\.log\(a,?\s*b\)/.test(code),
      successMessage: 'Good. Primitive assignment copied the value.',
      failMessage: 'Use a and b primitives, mutate b, log both.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 4: Single thread ordering. Use one long sync loop and one timer; prove sync completes first.',
      html: `<div class="challenge"><div id="c4">Prove sync blocks before timer callback.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c4{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// setTimeout(...,0)
// heavy sync loop
// logs showing order
`,
      solutionCode: `setTimeout(()=>console.log('timer'),0);
for(let i=0;i<4000000;i++){}
console.log('sync done first');`,
      check: (code) => /setTimeout/.test(code) && /for\s*\(/.test(code) && /console\.log/.test(code),
      successMessage: 'Exactly. Timer callback waits for sync work to finish.',
      failMessage: 'Include setTimeout, heavy sync loop, and logs.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 5: Event loop ordering. Produce output order: A sync, B sync, then C timer.',
      html: `<div class="challenge"><div id="c5">Match ordering A -> B -> C.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c5{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// Write logs so C is in timer callback.
`,
      solutionCode: `console.log('A');
setTimeout(()=>console.log('C'),0);
console.log('B');`,
      check: (code) => /console\.log\(['"]A['"]\)/.test(code) && /console\.log\(['"]B['"]\)/.test(code) && /setTimeout\(\s*\(\)\s*=>\s*console\.log\(['"]C['"]\)/.test(code),
      successMessage: 'Great. You captured sync-before-async ordering.',
      failMessage: 'Log A and B synchronously, C inside setTimeout.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 6: Runtime model sentence. Log one sentence using all words: stack, heap, thread, event loop.',
      html: `<div class="challenge"><div id="c6">Synthesize model in one line.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c6{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// console.log('...');
`,
      solutionCode: `console.log('The stack runs active calls, the heap stores objects, one thread executes code, and the event loop schedules callbacks.');`,
      check: (code) => {
        const t=code.toLowerCase();
        return t.includes('console.log') && t.includes('stack') && t.includes('heap') && t.includes('thread') && t.includes('event loop');
      },
      successMessage: 'Strong synthesis. Your runtime model is coherent.',
      failMessage: 'Your sentence must include stack, heap, thread, and event loop.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 7: Diagnose snippet. Create one object alias bug and explain fix by cloning.',
      html: `<div class="challenge"><div id="c7">Demonstrate alias bug, then clone fix.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c7{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// const a = {x:1}
// const b = a
// mutate b
// show a changed
// create clone c and mutate c without changing a
`,
      solutionCode: `const a={x:1};
const b=a;
b.x=5;
console.log('alias changed a:',a.x);
const c={...a};
c.x=9;
console.log('clone leaves a at:',a.x,'while c is',c.x);`,
      check: (code) => /\.\.\./.test(code) && /const\s+b\s*=\s*a/.test(code) && /console\.log/.test(code),
      successMessage: 'Nice debugging pattern: detect aliasing, then clone.',
      failMessage: 'Show alias mutation and a clone-based fix.',
      outputHeight: 220,
    },
    {
      type: 'challenge',
      instruction: 'Challenge 8: Build a mini timeline logger with sync and timer phases that prints at least 4 ordered steps.',
      html: `<div class="challenge"><div id="c8">Create 4+ ordered timeline logs.</div></div>`,
      css: `.challenge{height:100%;background:#0a1220;padding:14px;border-radius:10px;display:grid;place-items:center;color:#cbd5e1;}
#c8{padding:10px;border:1px solid #334155;border-radius:8px;}`,
      startCode: `// Build a timeline with sync logs and one timer callback.
`,
      solutionCode: `console.log('1 sync start');
console.log('2 sync prepare');
setTimeout(()=>{
  console.log('4 timer callback');
},0);
console.log('3 sync end');`,
      check: (code) => /setTimeout/.test(code) && (code.match(/console\.log/g)||[]).length >= 4,
      successMessage: 'Excellent. You can now reason about runtime timelines.',
      failMessage: 'Need setTimeout plus at least 4 console.log steps.',
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
