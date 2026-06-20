export default {
  id: 'elec1-001',
  slug: 'kirchhoffs-voltage-law',
  chapter: 'elec1',
  order: 1,
  title: "Kirchhoff's Voltage Law",
  subtitle: 'Why the voltages in any loop must always sum to zero — the conservation law that powers all circuit analysis.',
  tags: ['KVL', 'voltage law', 'circuit analysis', 'loop', 'energy conservation', 'series circuits'],
  aliases: 'kirchhoff voltage law KVL loop voltage sum series voltage drops',
  timeToComplete: 25,
  coreConcept: "KVL states that the algebraic sum of all voltages around any closed loop in a circuit equals zero. This is conservation of energy: whatever voltage (energy per charge) a source adds, the resistors must drop exactly that amount — not more, not less.",
  prerequisites: ['elec0-001', 'elec0-002', 'elec0-003'],
  nextLesson: 'kirchhoffs-current-law',

  hook: {
    question: "A PLC output drives a 24VDC solenoid through 15 meters of 20 AWG wire. The solenoid is sluggish and won't fully actuate. Your meter reads 22.1V at the solenoid terminals. Where did the other 1.9V go — and why does it matter?",
    realWorldContext: "Long cable runs in a factory are invisible voltage dividers. The wire has resistance. At 200mA, even 9.5Ω of cable resistance (15m × 2 × 0.317Ω/m for 20 AWG) drops 1.9V — leaving only 22.1V at the solenoid instead of 24V. That 8% loss is enough to keep a solenoid from latching. Kirchhoff's Voltage Law is the tool that tells you this: every volt the supply puts in must be accounted for across every element in the loop. If you can find where 24V was and trace where it went, you can diagnose any voltage problem on any circuit.",
  },

  mentalModel: [
    "**The altitude analogy.** Imagine a hiker going on a loop trail. They start at 1000m elevation. As they climb, they gain altitude (voltage source adds energy). As they descend back to the start, they lose exactly as much altitude as they gained — net change is zero. A charge moving around an electrical loop works exactly the same way. The source is the climb; the resistors are the descents. KVL says the total altitude change around the loop is always zero.",
    "**Voltage is relative.** Voltage is not an absolute quantity — it's always a *difference* between two points. When we say 'the voltage across R₁ is 4V,' we mean point A is 4V higher than point B. KVL formalizes this: as you traverse a loop, you're tracking how the potential rises and falls. Sources raise potential; resistors (and other passive elements) lower it. The loop closes at zero because you end up at the same potential where you started.",
    "**Sign convention — pick one and stick to it.** The most common approach: assign a current direction (clockwise positive). Voltage rises when you traverse a source from − to + terminal (add it). Voltage drops when you traverse a resistor in the current direction (subtract it). As long as you're consistent, the equation balances. If you get a negative result for current, it just means it flows counterclockwise — not an error.",
  ],

  intuition: {
    prose: [
      "**What KVL actually says.** Kirchhoff's Voltage Law (KVL), formulated by Gustav Kirchhoff in 1845, is a consequence of the conservation of energy. It states: *the algebraic sum of all voltage rises and drops around any closed loop in a circuit equals zero*. Written mathematically: ΣV = 0. In practice, for a simple series circuit with a voltage source Vs and resistors R₁, R₂, R₃: the source voltage equals the sum of all the voltage drops. Vs = V_R1 + V_R2 + V_R3. Rearranged to the canonical form: Vs − V_R1 − V_R2 − V_R3 = 0.",
      "**Applying KVL step by step.** To apply KVL to a loop: (1) Choose a starting point and a traversal direction (clockwise or counterclockwise — doesn't matter as long as you're consistent). (2) Traverse the loop. When you pass through a voltage source from − to +, add its voltage (rise). When you pass through from + to −, subtract it (drop). When you pass through a resistor in the assumed current direction, subtract V = IR (drop). (3) Set the sum equal to zero and solve. If you assumed a current direction and get a negative answer, the current simply flows opposite to your assumption.",
      "**Multiple loops.** Real circuits often have multiple loops. KVL applies independently to every loop. A circuit with 3 nodes and 5 branches may have several distinct loops you can write KVL equations for. The number of *independent* loop equations equals the number of mesh currents — this is the foundation of the mesh current method you'll see in a later lesson. KVL is not just a single equation; it's a constraint you can apply repeatedly across every loop in any network.",
      "**Industrial application — voltage drop budgeting.** In industrial automation, 24VDC devices typically have a tolerance of ±15% (20.4V to 27.6V). Before running cables, engineers calculate the expected voltage drop using KVL plus Ohm's Law: V_drop = I × R_wire = I × (2L × ρ), where L is one-way cable length and ρ is wire resistance per meter. If the drop puts terminal voltage below 20.4V, you must either use thicker wire, reduce cable length, add a local power supply, or move to a 48VDC system. KVL makes this a calculation rather than a guess.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Kirchhoff's Voltage Law (KVL)",
        body: "The algebraic sum of all voltages around any closed loop equals zero:\n\n**ΣV_loop = 0**\n\nEquivalently: the sum of voltage rises = sum of voltage drops.\n\nFor a series circuit: Vs = V₁ + V₂ + V₃ + ⋯ + Vₙ\n\nKVL holds for any loop, at any instant, regardless of the complexity of the circuit.",
      },
      {
        type: 'definition',
        title: 'Voltage Rise vs. Voltage Drop',
        body: '**Voltage rise**: potential increases as you traverse the element (e.g., passing through a battery from − to +, or through a current source). Assigned a positive sign in KVL.\n\n**Voltage drop**: potential decreases as you traverse the element (e.g., resistor traversed in the current direction). Assigned a negative sign in KVL.\n\nThe polarity marks (+/−) on circuit elements tell you which terminal is at higher potential.',
      },
      {
        type: 'procedure',
        title: 'KVL Analysis Procedure',
        body: '1. **Label** the current direction in each branch (can be assumed — wrong assumption gives negative result, which is fine).\n2. **Choose a loop** and a traversal direction (clockwise is conventional).\n3. **Traverse the loop**: add voltage for rises (+), subtract for drops (−).\n4. **Set sum = 0** and solve for unknowns.\n5. **Check**: if solved current is negative, actual current flows opposite to your assumed direction.',
      },
      {
        type: 'insight',
        title: 'KVL and Superposition',
        body: "KVL applies simultaneously at every instant — even in circuits with multiple sources. When multiple sources exist, you can either write KVL equations directly (accounting for all source voltages in the loop) or use superposition: analyze each source independently, then sum the results. Superposition works because KVL is linear — the voltage contributions from different sources add algebraically.",
      },
      {
        type: 'warning',
        title: 'Don\'t Double-Count Loop Voltages',
        body: "Each voltage element belongs to the loop only once, even if it's shared between two loops. When two loops share a branch (a common branch), that branch's voltage appears in both loop equations — but with attention to direction. In the mesh current method, a shared branch has both mesh currents flowing through it, and its voltage contribution is (I₁ − I₂) × R. Forgetting the sign on shared branches is the most common KVL error.",
      },
      {
        type: 'insight',
        title: 'KVL in Series String Lighting',
        body: "Old-style Christmas lights were wired in series — one loop. With 50 lights from a 120V outlet, each bulb gets 120/50 = 2.4V. KVL at work: Vs = V₁ + V₂ + ... + V₅₀. Now you know why one burned-out bulb kills the entire string (breaks the loop) and why modern lights use parallel wiring instead.",
      },
    ],
    visualizations: [
      {
        id: 'KirchhoffViz',
        title: 'KVL — Series Loop Voltage Distribution',
        mathBridge: "Use KVL mode. Adjust Vs, R₁, R₂, R₃ with the sliders. Watch the voltage drops update. The bottom equation shows Vs = V₁ + V₂ + V₃ at all times — KVL always balances. Notice: the resistor with the highest resistance claims the largest share of the source voltage.",
      },
    ],
  },

  math: {
    prose: [
      "For a single-loop series circuit with source Vs and resistors R₁, R₂, R₃:\n\n$$V_s - I R_1 - I R_2 - I R_3 = 0$$\n\nSolving for current: $I = \\dfrac{V_s}{R_1 + R_2 + R_3}$. This is exactly Ohm's Law applied to the total series resistance — which confirms that KVL and Ohm's Law are consistent.",
      "**Voltage divider rule.** In a series circuit, the voltage across any one resistor is a fraction of the total:\n\n$$V_k = V_s \\cdot \\frac{R_k}{R_1 + R_2 + \\cdots + R_n}$$\n\nThis is the voltage divider formula — derived directly from KVL + Ohm's Law. It's used everywhere: pull-up/pull-down resistors, analog signal conditioning, biasing transistors.",
      "**Multi-loop circuits.** For a circuit with mesh currents I₁ and I₂ sharing a common branch R₃:\n\n$$\\text{Loop 1: } V_{s1} - I_1 R_1 - (I_1 - I_2) R_3 = 0$$\n$$\\text{Loop 2: } -I_2 R_2 - (I_2 - I_1) R_3 = 0$$\n\nThe term $(I_1 - I_2)R_3$ represents the voltage across the shared branch, accounting for both mesh currents.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Voltage Divider Rule',
        body: "$$V_k = V_s \\cdot \\frac{R_k}{R_{total}}$$\n\nValid only for resistors in series (same current through all). The largest resistor gets the largest voltage fraction.",
      },
      {
        type: 'procedure',
        title: 'Wire Voltage Drop Calculation',
        body: "For a cable of length L meters, round-trip resistance = 2Lρ (ρ = Ω/meter):\n\n$$V_{drop} = I \\times 2L\\rho$$\n$$V_{load} = V_s - V_{drop}$$\n\nExample: 10A through 5m of 12 AWG (ρ = 0.005Ω/m):\nV_drop = 10 × 2 × 5 × 0.005 = 0.5V — acceptable.\n\nAt 30A: V_drop = 1.5V — check device minimum voltage.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Why must the sum of all voltages around a closed loop equal zero?',
      options: [
        'It is an empirical observation that happens to hold for most circuits',
        'It is conservation of energy — a charge completing a loop returns to its starting potential, so net energy gained equals net energy lost',
        'KVL is only valid for series circuits; parallel circuits use a different rule',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A 24V supply drives a series circuit with R1 = 100Ω and R2 = 200Ω. How much voltage drops across R2?',
      options: [
        '12V — two resistors in series split the voltage equally',
        '16V — the voltage divider gives V2 = 24 × (200/300)',
        '8V — the smaller resistor gets the larger share of voltage',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You measure only 22.1V at a solenoid connected to a 24V supply through a long cable run. What does KVL tell you about the missing 1.9V?',
      options: [
        'The supply voltage has sagged — the power supply is undersized',
        'The 1.9V is being dropped somewhere in the series path between the supply and the solenoid, most likely across wire resistance',
        'The solenoid is drawing more current than rated, reducing the voltage across itself',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You apply KVL and solve for current, getting a negative value. What does this mean?',
      options: [
        'You made a sign error — redo the KVL equation with the opposite traversal direction',
        'The actual current flows opposite to your assumed direction — the negative sign is the answer, not an error',
        'The circuit has a short circuit somewhere that reversed the current flow',
      ],
      correct: 1,
    },
  ],
};
