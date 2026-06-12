export const lesson = {
  id: 'sicp-3-3b',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '3.3.4  Digital Circuit Simulation',
  checkpoints: [
    { id: 'cp-wires',      label: 'Wires & Signals' },
    { id: 'cp-gates',      label: 'Logic Gates' },
    { id: 'cp-simulation', label: 'Running the Simulation' },
  ],
  segments: [

    // ── Introduction ─────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'intro',
      text: 'Section 3.3.4 applies everything from this chapter — mutable data, queues, and tables — to build a working digital circuit simulator. It is a beautiful demonstration that Chapter 3\'s tools are not just abstract machinery but the exact right tools for modeling real systems. A circuit has wires that carry signals, gates that transform signals with a propagation delay, and an event queue (the agenda) that orders signal changes by time. The simulator is a small but complete discrete-event simulation engine.',
      code: null,
    },

    // ── Wires ─────────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'wire-vocab',
      text: 'A wire carries a binary signal — 0 or 1. It also carries a list of action procedures: callbacks that run whenever the signal changes. This is the observer pattern: components register their action procedures on the wires they read; when a wire\'s signal changes, all registered actions are notified and called. The wire\'s signal value is mutable state. The action list is also mutable — components add themselves at setup time.',
      code: null,
    },
    {
      type: 'narration',
      id: 'make-wire-code',
      text: 'Here is make_wire. get_signal and set_signal manage the signal value. add_action registers a new callback. call_each runs all callbacks — called whenever the signal changes.',
      code: 'function make_wire() {\n  let signal = 0;\n  let action_procedures = [];\n\n  function call_each(procs) {\n    procs.forEach(p => p());\n  }\n\n  function set_signal(new_value) {\n    if (signal !== new_value) {\n      signal = new_value;\n      call_each(action_procedures);\n    }\n  }\n\n  return {\n    get_signal: () => signal,\n    set_signal,\n    add_action: proc => { action_procedures.push(proc); }\n  };\n}\n\n// Test: wire starts at 0, action fires on change\nconst w = make_wire();\nw.add_action(() => console.log(`signal changed to: ${w.get_signal()}`));\nw.set_signal(1); // prints: signal changed to: 1\nw.set_signal(1); // no print — value didn\'t change\nw.set_signal(0); // prints: signal changed to: 0',
    },
    {
      type: 'checkpoint',
      id: 'cp-wires',
    },

    // ── The agenda ────────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'agenda-vocab',
      text: 'Gates do not change their output instantly — they have a propagation delay. An inverter takes 2 time units, an AND gate takes 3, an OR gate takes 5. The agenda is a time-ordered queue of (time, action) pairs. When a gate detects a signal change, it schedules its output change after its delay. The propagate function runs events in time order. This correctly models the fact that all gates operate in parallel, with later events happening after earlier ones.',
      code: null,
    },
    {
      type: 'narration',
      id: 'agenda-code',
      text: 'Here is a simple agenda using a sorted array. add_to_agenda inserts at the right time position. propagate runs all events in time order.',
      code: 'function make_agenda() {\n  let events = []; // sorted array of {time, action}\n  let current_time = 0;\n\n  function add_to_agenda(delay, action) {\n    const t = current_time + delay;\n    let i = 0;\n    while (i < events.length && events[i].time <= t) i++;\n    events.splice(i, 0, { time: t, action });\n  }\n\n  function propagate() {\n    while (events.length > 0) {\n      const { time, action } = events.shift();\n      current_time = time;\n      action();\n    }\n  }\n\n  function the_time() { return current_time; }\n\n  return { add_to_agenda, propagate, the_time };\n}\n\nconst agenda = make_agenda();\nagenda.add_to_agenda(5, () => console.log(`event at t=${agenda.the_time()}: B`));\nagenda.add_to_agenda(2, () => console.log(`event at t=${agenda.the_time()}: A`));\nagenda.add_to_agenda(8, () => console.log(`event at t=${agenda.the_time()}: C`));\nagenda.propagate(); // A at t=2, B at t=5, C at t=8',
    },

    // ── Logic gates ───────────────────────────────────────────────────────────────
    {
      type: 'narration',
      id: 'gate-vocab',
      text: 'A logic gate reads its input wires and schedules its output wire to change after its delay. The inverter reads one wire and schedules the logical NOT. The AND gate reads two wires and schedules the logical AND. Each gate registers action procedures on its input wires so it automatically responds when inputs change.',
      code: null,
    },
    {
      type: 'narration',
      id: 'gates-code',
      text: 'Here are the three primitive gates. Each registers an action on its input wires. When an input changes, the action reads the current input signals, computes the new output, and schedules the change via the agenda.',
      code: 'function make_agenda(){let ev=[],t=0;return{add:(d,a)=>{const time=t+d;let i=0;while(i<ev.length&&ev[i].time<=time)i++;ev.splice(i,0,{time,action:a});},run:()=>{while(ev.length>0){const{time,action}=ev.shift();t=time;action();}},time:()=>t};}\nfunction make_wire(){let s=0,ac=[];const set=v=>{if(s!==v){s=v;ac.forEach(f=>f());}};return{get:()=>s,set,add:p=>{ac.push(p);}};}\n\nconst agenda = make_agenda();\nconst INVERTER_DELAY = 2;\nconst AND_DELAY = 3;\nconst OR_DELAY = 5;\n\nfunction inverter(input, output) {\n  function invert() {\n    const new_val = input.get() === 0 ? 1 : 0;\n    agenda.add(INVERTER_DELAY, () => output.set(new_val));\n  }\n  input.add(invert);\n}\n\nfunction and_gate(a, b, output) {\n  function compute() {\n    const new_val = a.get() === 1 && b.get() === 1 ? 1 : 0;\n    agenda.add(AND_DELAY, () => output.set(new_val));\n  }\n  a.add(compute); b.add(compute);\n}\n\nfunction or_gate(a, b, output) {\n  function compute() {\n    const new_val = a.get() === 1 || b.get() === 1 ? 1 : 0;\n    agenda.add(OR_DELAY, () => output.set(new_val));\n  }\n  a.add(compute); b.add(compute);\n}\n\nconsole.log(\'Gates defined\');',
    },
    {
      type: 'checkpoint',
      id: 'cp-gates',
    },

    // ── Building and running circuits ─────────────────────────────────────────────
    {
      type: 'narration',
      id: 'half-adder-vocab',
      text: 'A half-adder adds two 1-bit numbers and produces a sum bit and a carry bit. It is built from one OR gate, two AND gates, and one inverter. The sum bit is the XOR of the inputs (OR minus the carry). The carry bit is the AND of the inputs. When we set the input signals, the agenda collects all the delayed gate responses and propagate runs them in time order.',
      code: null,
    },
    {
      type: 'narration',
      id: 'half-adder-code',
      text: 'Here is the half-adder assembled from gates, then tested by setting inputs and propagating.',
      code: 'function make_agenda(){let ev=[],t=0;return{add:(d,a)=>{const time=t+d;let i=0;while(i<ev.length&&ev[i].time<=time)i++;ev.splice(i,0,{time,action:a});},run:()=>{while(ev.length>0){const{time,action}=ev.shift();t=time;action();}},time:()=>t};}\nfunction make_wire(){let s=0,ac=[];const set=v=>{if(s!==v){s=v;ac.forEach(f=>f());}};return{get:()=>s,set,add:p=>{ac.push(p);}};}\nconst agenda=make_agenda();\nconst INVERTER_DELAY=2,AND_DELAY=3,OR_DELAY=5;\nfunction inverter(i,o){i.add(()=>{const n=i.get()===0?1:0;agenda.add(INVERTER_DELAY,()=>o.set(n));});}\nfunction and_gate(a,b,o){const c=()=>{const n=a.get()===1&&b.get()===1?1:0;agenda.add(AND_DELAY,()=>o.set(n));};a.add(c);b.add(c);}\nfunction or_gate(a,b,o){const c=()=>{const n=a.get()===1||b.get()===1?1:0;agenda.add(OR_DELAY,()=>o.set(n));};a.add(c);b.add(c);}\n\nfunction half_adder(a, b, s, c) {\n  const d = make_wire(), e = make_wire();\n  or_gate(a, b, d);          // d = a OR b\n  and_gate(a, b, c);         // c = a AND b\n  inverter(c, e);            // e = NOT c\n  and_gate(d, e, s);         // s = (a OR b) AND (NOT c)\n}\n\nconst a=make_wire(), b=make_wire(), s=make_wire(), carry=make_wire();\nhalf_adder(a, b, s, carry);\n\nfunction probe(name, wire) {\n  wire.add(() => console.log(`${name}: ${wire.get()} at t=${agenda.time()}`));\n}\nprobe(\'sum\', s); probe(\'carry\', carry);\n\na.set(1); b.set(1); // 1+1 = sum=0, carry=1\nagenda.run();\nconsole.log(`Final: sum=${s.get()}, carry=${carry.get()}`); // sum=0, carry=1',
    },
    {
      type: 'codelens',
      id: 'codelens-half-adder',
      text: 'Open CodeLens on the propagate call. Step through it and watch the agenda execute events in time order. The OR gate fires first (delay 5), then AND (delay 3) — but AND fires after OR because OR starts first. Watch how signal changes cascade: when sum wire changes, its probe fires. The simulation correctly models asynchronous parallel hardware.',
      code: 'function make_agenda(){let ev=[],t=0;return{add:(d,a)=>{const time=t+d;let i=0;while(i<ev.length&&ev[i].time<=time)i++;ev.splice(i,0,{time,action:a});},run:()=>{while(ev.length>0){const{time,action}=ev.shift();t=time;action();}},time:()=>t};}\nfunction make_wire(){let s=0,ac=[];const set=v=>{if(s!==v){s=v;ac.forEach(f=>f());}};return{get:()=>s,set,add:p=>{ac.push(p);}};}\nconst agenda=make_agenda();\nfunction inverter(i,o){i.add(()=>{const n=i.get()===0?1:0;agenda.add(2,()=>o.set(n));});}\nfunction and_gate(a,b,o){const c=()=>{const n=a.get()&&b.get()?1:0;agenda.add(3,()=>o.set(n));};a.add(c);b.add(c);}\nconst a=make_wire(),b=make_wire(),out=make_wire();\nand_gate(a,b,out);\nout.add(()=>console.log(`and output: ${out.get()} at t=${agenda.time()}`));\na.set(1);b.set(1);\nagenda.run();',
    },
    {
      type: 'challenge',
      id: 'challenge-full-adder',
      text: 'A full adder adds two bits plus a carry-in, producing sum and carry-out. It is built from two half-adders and one OR gate. half_adder(a, b, s1, c1); half_adder(s1, c_in, sum, c2); or_gate(c1, c2, carry_out). Build and test it: a=1, b=1, c_in=1 should give sum=1, carry_out=1.',
      expectedOutput: 'sum=1 carry=1',
      startCode: 'function make_agenda(){let ev=[],t=0;return{add:(d,a)=>{const time=t+d;let i=0;while(i<ev.length&&ev[i].time<=time)i++;ev.splice(i,0,{time,action:a});},run:()=>{while(ev.length>0){const{time,action}=ev.shift();t=time;action();}},time:()=>t};}\nfunction make_wire(){let s=0,ac=[];const set=v=>{if(s!==v){s=v;ac.forEach(f=>f());}};return{get:()=>s,set,add:p=>{ac.push(p);}};}\nconst agenda=make_agenda();\nfunction inverter(i,o){i.add(()=>{const n=i.get()===0?1:0;agenda.add(2,()=>o.set(n));});}\nfunction and_gate(a,b,o){const c=()=>{const n=a.get()&&b.get()?1:0;agenda.add(3,()=>o.set(n));};a.add(c);b.add(c);}\nfunction or_gate(a,b,o){const c=()=>{const n=a.get()||b.get()?1:0;agenda.add(5,()=>o.set(n));};a.add(c);b.add(c);}\nfunction half_adder(a,b,s,c){const d=make_wire(),e=make_wire();or_gate(a,b,d);and_gate(a,b,c);inverter(c,e);and_gate(d,e,s);}\n\nfunction full_adder(a, b, c_in, sum, carry_out) {\n  // your code here: two half_adders + one or_gate\n}\n\nconst a=make_wire(),b=make_wire(),c_in=make_wire(),sum=make_wire(),cout=make_wire();\nfull_adder(a, b, c_in, sum, cout);\na.set(1); b.set(1); c_in.set(1);\nagenda.run();\nconsole.log(`sum=${sum.get()} carry=${cout.get()}`);\n',
      hint: 'function full_adder(a, b, c_in, sum, carry_out) {\n  const s1 = make_wire(), c1 = make_wire(), c2 = make_wire();\n  half_adder(a, b, s1, c1);\n  half_adder(s1, c_in, sum, c2);\n  or_gate(c1, c2, carry_out);\n}',
      tests: [],
      validate: ({ logs }) => logs.some(l => l.includes('sum=1') && l.includes('carry=1')),
    },
    {
      type: 'checkpoint',
      id: 'cp-simulation',
    },
  ],
}
