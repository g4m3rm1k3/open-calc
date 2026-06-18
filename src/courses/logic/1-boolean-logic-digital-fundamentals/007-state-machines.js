export default {
  id: 'logic0-007',
  slug: 'state-machines',
  chapter: 'logic0',
  order: 7,
  title: 'Finite State Machines',
  subtitle: 'How machines move through defined states — and why every PLC sequence is a state machine whether you design it that way or not.',
  tags: ['finite state machine', 'FSM', 'state diagram', 'state transition', 'Moore machine', 'Mealy machine', 'PLC sequence', 'step sequencer'],
  aliases: 'finite state machine FSM state diagram Moore Mealy state transition PLC sequence step sequencer',
  timeToComplete: 24,
  coreConcept: "A finite state machine is a system with a fixed set of states, transitions between them triggered by events, and outputs that depend on the current state (Moore) or state plus input (Mealy). Every PLC sequence program is an FSM — and recognizing this makes programs easier to design, debug, and modify.",
  prerequisites: ['logic0-006'],
  nextLesson: 'number-systems',

  hook: {
    question: "A pick-and-place robot arm follows this sequence: wait for part → extend to pick position → clamp → retract → extend to place position → unclamp → retract → repeat. Currently this is 300 lines of rungs with timer delays, position flags, and cross-references you can't follow. It misses parts, double-clamps, and gets confused when power cycles mid-sequence. What is the right way to structure this?",
    realWorldContext: "Every machine with a sequence — and most industrial machines do have sequences — is or should be an FSM. The chaos in the 300-line program happens because it wasn't designed as one: state is scattered across dozens of bits, transitions are buried in timer contacts, and there's no single place that says 'the machine is currently in step 3.' Explicit FSM design fixes all of this: one variable (the current state), one place to look for the current state, transitions that are provably correct, and restart/recovery that works because the machine always knows where it is. The SFC (Sequential Function Chart) language in IEC 61131-3 is a formal FSM language built directly into every modern PLC. Understanding FSMs is understanding SFC.",
  },

  mentalModel: [
    "**The machine is always in exactly one state.** This is the most important constraint. At any moment, the machine is in State A, or State B, or State C — never in two states simultaneously, never in no state. The current state variable holds this single value. All outputs are determined by this variable. All transitions change this variable when their conditions are met.",
    "**Transitions are guarded.** A transition from State A to State B only fires when the guard condition is true AND the machine is currently in State A. The condition alone is not enough — the machine must be in the right state first. This prevents one transition from triggering another state's exit. This is why you always check 'what state am I in' before evaluating transition conditions.",
    "**Outputs are properties of states, not transitions.** In a Moore machine (the standard for PLCs), outputs are assigned to states — 'while I'm in State 3, the clamp is energized.' When the machine transitions to State 4, the clamp turns off automatically because State 4 doesn't include the clamp in its outputs. You don't write 'turn off clamp when leaving State 3' — you write 'clamp is on in State 3' and it's automatically off everywhere else.",
  ],

  intuition: {
    prose: [
      "**State diagrams.** A state diagram (or state transition diagram) is the primary design tool. Each state is a circle with the state name (and outputs, for Moore machines) written inside. Arrows between states are transitions, labeled with the guard condition. The starting state has an arrow coming from nowhere (the initial pseudo-state). If there's a final state, it's drawn as a double circle. To use it: trace through the expected sequences and abnormal cases until you're convinced every transition is correct.",
      "**Moore vs. Mealy machines.** In a **Moore machine**, outputs depend only on the current state. In a **Mealy machine**, outputs depend on both the current state and current input. Moore machines are easier to understand and debug — you always know what's happening from the state alone. Mealy machines can sometimes produce the same behavior with fewer states. For PLC programming, Moore is almost always preferred: it maps directly to SFC steps with actions, and the behavior at each step is explicit.",
      "**Encoding the state in a PLC.** One integer tag holds the current state number (called the 'step counter' or 'sequence step'). Step 0 = idle, Step 1 = extending, Step 2 = clamped, etc. Each scan, the PLC evaluates transition conditions for the current step. If a condition is met, the step counter is updated. Outputs are set based on the current step value (using comparison instructions or MCR zones). This is the manual FSM pattern in ladder logic.",
      "**SFC — Sequential Function Chart.** IEC 61131-3 includes SFC as a first-class language specifically for FSMs. Steps are boxes (states). Transitions are horizontal bars between steps, with the condition written beside them. Actions (outputs) are attached to steps. The SFC runtime advances the active step when the transition condition below it becomes true. The PLC runtime handles the state variable automatically — the programmer just draws the diagram. SFC programs are impossible to get structurally wrong (the language enforces the FSM discipline).",
      "**Entry, during, and exit actions.** A step can have three kinds of actions: (N) non-stored — active only while the step is active; (S) stored — set when step is entered, remains after step exits; (R) reset — clears a stored action; (P) pulse — fires once on entry. In ladder logic: 'while in this step' = compare step counter with this value, then energize output. 'On entry to step' = use a one-shot instruction (OSR) on the step counter change. 'On exit from step' = use OSF (one-shot falling) on the step-active condition.",
      "**Error states and recovery.** Robust FSM design includes an ERROR state that the machine transitions to on any out-of-sequence event (sensor mismatch, timeout, unexpected input). From ERROR, the only valid transition is to a RESET state where the machine moves to a known safe position. Never allow the FSM to silently skip an error state and continue the sequence — this masks faults. One ERROR state that catches everything is better than a dozen ad-hoc fault bits.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'FSM Design Procedure for PLC Sequences',
        body: '1. **List all states.** Enumerate every stable condition the machine can be in: IDLE, EXTENDING, GRIPPING, RETRACTING, PLACING, RELEASING, HOME, ERROR.\n\n2. **Draw the state diagram.** Connect states with arrows. Label each arrow with the transition condition (sensor input, timer done, button press).\n\n3. **Identify outputs per state.** For each state, list which outputs are energized. Assign outputs only to the states where they should be active.\n\n4. **Define initial state and reset.** Which state does the machine power up in? What state does it go to after E-stop? After reset?\n\n5. **Add error transitions.** For each state, what happens on timeout? On unexpected sensor? These transitions go to ERROR.\n\n6. **Implement.** In SFC: draw directly. In ladder: use step counter with comparison instructions for outputs, XIC(step=N) for transition guards, and MOV instructions to update the step counter.',
      },
      {
        type: 'definition',
        title: 'FSM Formal Definition',
        body: 'A finite state machine is a 5-tuple (Q, Σ, δ, q₀, F):\n\n- **Q:** Finite set of states {IDLE, EXTEND, GRIP, ...}\n- **Σ:** Input alphabet — the events and conditions that trigger transitions\n- **δ:** Transition function δ(current_state, input) → next_state\n- **q₀:** Initial state (machine starts here at power-on)\n- **F:** Set of accepting (final) states (optional — production machines often have no terminal state, they cycle)\n\nMoore output function: λ(current_state) → outputs\nMealy output function: λ(current_state, input) → outputs',
      },
      {
        type: 'insight',
        title: 'Why Non-FSM PLC Programs Break',
        body: 'Programs written without an explicit state machine suffer from:\n\n**Phantom states:** The machine can be in no defined condition — for example, between rung evaluations where output A has turned off but output B hasn\'t turned on yet. If power cycles at this moment, behavior on restart is undefined.\n\n**Multiple active "states":** Two sequence-tracking bits can both be true simultaneously if OTL/OTU logic has an ordering dependency. The FSM constraint (exactly one active state) is violated.\n\n**Transition order sensitivity:** If Transition A fires before Transition B can be blocked, the machine incorrectly advances. In a proper FSM, the step counter advancing atomically prevents this.\n\n**FSM fixes all of these** by construction: one step counter, one value, one transition fires at a time, outputs follow from the current step.',
      },
      {
        type: 'insight',
        title: 'Hierarchical and Parallel State Machines',
        body: 'Real machines often have concurrent sequences: the main sequence runs while a monitoring state machine watches for faults in parallel.\n\n**Parallel states (AND-decomposition):** Multiple regions are active simultaneously. Used in SFC with parallel branches (═══ double bar). Both branches advance independently and re-synchronize before the next shared step.\n\n**Hierarchical states:** A state contains sub-states. Any event that exits the parent state also exits whatever sub-state was active. Used for "in RUNNING mode, the sub-machine can be FAST, SLOW, or PAUSE."\n\nSFC handles both natively. In ladder, parallel sequences use separate step counters, one per concurrent process.',
      },
    ],
    visualizations: [
      {
        id: 'StateMachineViz',
        title: 'State Machine Simulator',
        mathBridge: 'Select the Traffic Light preset. Click a transition button to fire it — the machine advances to the next state. Notice: only one state is active at a time. Only the transitions FROM the current state are available. This is the FSM constraint: one state, one set of active outputs.',
      },
    ],
  },

  math: {
    prose: [
      "**State minimization.** Two states are equivalent if they produce the same outputs for all input sequences from that point forward. Equivalent states can be merged, reducing the total state count. The algorithm (Myhill-Nerode / table-filling method) finds all equivalent state pairs and merges them iteratively. In practice: if two PLC steps have identical output assignments AND identical transition conditions, they're equivalent and can be merged into one.",
      "**Reachability analysis.** Starting from the initial state, following all possible transition paths, which states are reachable? Unreachable states are dead code — they can never be entered from the initial state under any input sequence. Remove them. Similarly, a state with no outgoing transitions (other than to itself) is a dead state — the machine will be stuck there forever once entered. Dead states indicate a design flaw, not an intentional terminal condition.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A traffic light FSM has states GREEN(0), YELLOW(1), RED(2). The machine is in GREEN and the timer fires. What is the next state?',
      hint: 'Follow the transition from GREEN when Timer Done = 1.',
      walkthrough: [
        'Current state: GREEN (state 0).',
        'Input: Timer Done = 1.',
        'Look up the transition table for state GREEN with Timer Done = 1.',
        'GREEN → YELLOW when timer fires.',
        'Next state: YELLOW (state 1).',
        'Outputs in YELLOW: Yellow light on. The machine now waits for the YELLOW timer to expire before transitioning to RED.',
      ],
      answer: 'Next state: YELLOW (state 1)',
      difficulty: 'easy',
    },
    {
      problem: 'Design a 2-state FSM for a pushbutton toggle: pressing the button alternates between ON and OFF states. Draw the state table (current state, input, next state, output).',
      hint: 'There are 2 states (ON, OFF) and 1 input (button press). Each press transitions to the opposite state.',
      walkthrough: [
        'Define the states: OFF (state 0), ON (state 1).',
        'Define the input: BUTTON (0 = not pressed, 1 = pressed).',
        'Define the output: LOAD (0 = off, 1 = on) — this is a Moore machine (output depends on state).',
        'State transition table:',
        'Current=OFF, Input=0 (button not pressed) → Next=OFF, Output=0',
        'Current=OFF, Input=1 (button pressed) → Next=ON, Output=0 (output updates next scan)',
        'Current=ON, Input=0 (button not pressed) → Next=ON, Output=1',
        'Current=ON, Input=1 (button pressed) → Next=OFF, Output=1 (output updates next scan)',
        'Outputs: State=OFF → LOAD=0. State=ON → LOAD=1.',
        'Note: to prevent toggling on every scan while the button is held, use an OSR (one-shot rising) on the button input.',
      ],
      answer: 'Two states: OFF (output=0) and ON (output=1). BUTTON press transitions OFF→ON and ON→OFF.',
      difficulty: 'medium',
    },
    {
      problem: 'The pick-and-place FSM from the lesson is in EXTEND state (step 1). The extend timer expires (Timer_1.DN = 1). The watchdog timer also fires (Timeout = 1) at the same moment. Which transition should take priority and why? How is this implemented in PLC ladder?',
      hint: 'Think about safety: the normal path (timer done) leads forward; the watchdog path leads to ERROR. Which is safer to prioritize?',
      walkthrough: [
        'The two competing transitions from EXTEND state:',
        'Transition A: Timer_1.DN = 1 → go to CLAMP (step 2) — normal progression.',
        'Transition B: Timeout = 1 → go to ERROR (step 99) — fault detection.',
        'Safety principle: if a watchdog fires simultaneously with a normal timer, the watchdog should take priority. The watchdog indicates something unexpected happened — proceeding to the next step when a timeout has occurred could cause unsafe motion or damage.',
        'Implementation in PLC ladder: place the Timeout/ERROR transition rung BEFORE the normal Timer_1.DN transition rung in the program. In Allen-Bradley: the first rung that writes to the Step tag in a given scan wins (or use MCR to skip the normal transition if the timeout is active).',
        'Alternative: use an interlock — add [NOT Timeout] in series with the Timer_1.DN transition rung. This means the normal transition can only fire when the watchdog has NOT fired.',
        'Ladder rung order: Rung A: [Step=1][Timeout] → MOV 99, Step (go to ERROR). Rung B: [Step=1][Timer_1.DN][NOT Timeout] → MOV 2, Step (normal). Rung A fires first if both conditions are true.',
      ],
      answer: 'Watchdog (ERROR) transition takes priority. Implement by placing the ERROR transition rung before the normal transition, or by adding [NOT Timeout] interlock to the normal transition rung.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Pick-and-place sequence as an FSM',
      problem: 'Design the FSM for: IDLE → EXTEND (timer 1s) → CLAMP (wait part sensor) → RETRACT (timer 1s) → PLACE_EXTEND (timer 1s) → UNCLAMP (timer 0.5s) → PLACE_RETRACT (timer 1s) → back to IDLE. Add an ERROR state for any timer timeout.',
      solution: 'States: IDLE(0), EXTEND(1), CLAMP(2), RETRACT(3), PLACE_EXT(4), UNCLAMP(5), PLACE_RET(6), ERROR(99)\n\nTransitions:\n0→1: Start button\n1→2: Timer_1 done (1s extend complete)\n1→99: Timeout watchdog (3s — extend should never take 3s)\n2→3: Part_Sensor = 1 (part detected and gripped)\n2→99: Timeout watchdog (2s — no part detected)\n3→4: Timer_2 done (1s retract complete)\n4→5: Timer_3 done (1s place extend complete)\n5→6: Timer_4 done (0.5s unclamp complete)\n6→0: Timer_5 done (1s place retract, back to idle)\n\nOutputs per state:\n1: Extend_Actuator = 1, Timer_1 = running\n2: Clamp_Sol = 1 (clamp energized)\n3: Clamp_Sol = 1, Retract_Actuator = 1, Timer_2 = running\n4: Clamp_Sol = 1, Extend_Actuator = 1, Timer_3 = running\n5: Timer_4 = running (unclamp by de-energizing Clamp_Sol)\n6: Retract_Actuator = 1, Timer_5 = running\n99: Alarm = 1, all motion outputs = 0\n\nPLC implementation: one INT tag "Step". Comparison rungs read Step, set outputs. Transition rungs check Step + condition, write new Step value.',
    },
    {
      title: 'Traffic light controller FSM',
      problem: 'Design a simple 3-state FSM for a single-direction traffic light (NS direction only): GREEN (20s) → YELLOW (3s) → RED (30s) → GREEN. Draw the state table.',
      solution: 'States: GREEN(0), YELLOW(1), RED(2)\nInputs: Timer done\n\nState transition table:\nCurrent State | Timer Done | Next State | Outputs (R,Y,G)\n     GREEN    |     0      |   GREEN    |   0, 0, 1\n     GREEN    |     1      |   YELLOW   |   0, 0, 1 → transitions\n    YELLOW    |     0      |   YELLOW   |   0, 1, 0\n    YELLOW    |     1      |    RED     |   0, 1, 0 → transitions\n      RED     |     0      |    RED     |   1, 0, 0\n      RED     |     1      |   GREEN    |   1, 0, 0 → transitions\n\nPLC implementation:\n- Step = 0: GREEN on, timer preset 20s, running\n- Step = 0 AND Timer.DN: Step := 1, reset timer with 3s preset\n- Step = 1: YELLOW on, timer running\n- Step = 1 AND Timer.DN: Step := 2, reset timer with 30s preset\n- Step = 2: RED on, timer running\n- Step = 2 AND Timer.DN: Step := 0, reset timer with 20s preset\n\n3 rungs for outputs, 3 rungs for transitions = 6 rungs total. Clean, readable, no latched bits, no cross-references.',
    },
  ],
};
