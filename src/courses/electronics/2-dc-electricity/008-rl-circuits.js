export default {
  id: 'elec1-008',
  slug: 'rl-circuits',
  chapter: 'elec1',
  order: 8,
  title: 'RL Circuits and Time Constants',
  subtitle: 'Current through an inductor builds and decays exponentially — τ = L/R, the dual of the RC circuit.',
  tags: ['RL circuit', 'time constant', 'tau L/R', 'current buildup', 'relay pull-in', 'inductive decay', 'back-EMF'],
  aliases: 'RL circuit time constant L/R inductor current buildup relay response motor starting',
  timeToComplete: 25,
  coreConcept: "An RL series circuit has time constant τ = L/R. When energized, current builds from 0 to Vs/R following i(t) = I_final(1 − e^{−t/τ}). When de-energized, current decays from I₀ to 0. The same 63.2%/5τ rules as RC circuits apply — but now it's current (not voltage) that's exponential. This governs relay pull-in time, motor starting current, and all switching behavior of inductive loads.",
  prerequisites: ['elec1-007'],
  nextLesson: 'magnetism',

  hook: {
    question: "A relay specification says 'maximum pull-in time: 15ms, maximum drop-out time: 10ms.' Your PLC program sends a pulse output that's only 5ms wide. The relay never energizes. The coil is 400mH, 400Ω. How do you use τ = L/R to understand what's happening — and fix it?",
    realWorldContext: "Relay timing is fundamental to PLC programming. τ = L/R = 0.4/400 = 1ms. After 5τ = 5ms, current would reach 99.3% of final value (60mA). But the contact closes when current reaches the pull-in threshold — typically 70% of holding current. That happens at about 1.2τ = 1.2ms. So the relay would pull in fine in 1.2ms if the coil were energized long enough. The problem is the PLC output is only 5ms. That's long enough — the relay should close after ~1.2ms. But the drop-out happens when current falls below ~20% of holding, at about 1.6τ = 1.6ms after de-energize. The 5ms pulse minus 1.2ms pull-in leaves 3.8ms held, then 1.6ms to drop out. The relay IS energizing — but the PLC isn't reading the contact soon enough. τ analysis tells you exactly what's happening.",
  },

  mentalModel: [
    "**RL is the current-domain dual of RC.** In RC: voltage across capacitor exponential, current decays. In RL: current through inductor exponential, voltage decays. The math is identical — just swap the roles of V and I. The time constant τ = L/R plays the same role as τ = RC. The 63.2% milestone at 1τ, the 5τ completion rule — all the same. What changes: for RC you watch voltage; for RL you watch current.",
    "**Why τ = L/R.** Inductance L resists change in current (inertia). Resistance R dissipates energy and provides the 'friction' that eventually brings current to steady state. Larger L → more inertia → longer to reach steady state → larger τ. Larger R → more friction/dissipation → faster approach to steady state → smaller τ. τ = L/R balances these two effects.",
    "**The voltage across the inductor tells you the rate of change.** v_L = L × dI/dt. When the circuit is first energized, v_L = Vs (all source voltage across inductor), current starts rising steeply. As current grows, v_R = IR increases, v_L = Vs − IR decreases, and dI/dt decreases. At steady state: v_L = 0, all voltage across R. Watching v_L tells you how fast the current is changing — if v_L is large, current is changing rapidly.",
  ],

  intuition: {
    prose: [
      "**Energizing an RL circuit.** Switch connects Vs to series R and L. KVL: Vs = v_R + v_L = iR + L(di/dt). Initial condition: i(0) = 0 (current through inductor cannot jump). Solution: i(t) = (Vs/R)(1 − e^{−t/τ}) where τ = L/R. Simultaneously: v_L(t) = Vs × e^{−t/τ} and v_R(t) = Vs(1 − e^{−t/τ}). At t=0: v_L = Vs (all voltage across inductor), v_R = 0. At t→∞: v_L = 0, v_R = Vs (steady state current Vs/R flows, inductor is a short).",
      "**De-energizing (with flyback path).** Disconnect Vs but provide a flyback path (resistor R_fly or flyback diode + resistance). The inductor drives current through the total resistance R_total = R + R_fly. i(t) = I₀ × e^{−t/τ'} where τ' = L/R_total. Higher R_fly → faster decay but larger voltage spike (v_L = −I₀ × R_fly at t=0). With a flyback diode (V_f ≈ 0.7V), R_fly ≈ 0.7/I₀ — very low, so current decays slowly through the coil's own resistance. This is why relays have longer drop-out time with flyback diodes than without.",
      "**Relay timing analysis.** A relay pulls in when coil current reaches I_pull (typically 50–80% of I_final). From i(t) = I_final(1 − e^{−t/τ}): t_pull = −τ × ln(1 − I_pull/I_final). A relay drops out when current falls below I_drop (typically 10–30% of I_final). t_drop = −τ' × ln(I_drop/I_final). Both times scale with τ. Knowing L and R, you can calculate pull-in and drop-out times exactly.",
      "**Motor starting current.** An AC induction motor winding is also an RL circuit. At startup (t=0), motor is stalled, back-EMF = 0, current = Vs/Z_winding. Initial inrush can be 6–8× running current. As the motor accelerates, back-EMF builds and limits current. VFDs address this by ramping frequency and voltage gradually — keeping acceleration current within design limits. The L/R time constant of the winding directly affects how quickly current responds to VFD voltage changes.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'RL Time Constant',
        body: "$$\\tau = \\frac{L}{R}$$\n\nUnit: seconds (L in henries ÷ R in ohms).\n\n| τ milestones | Energize (% of I_final) | De-energize (% of I₀) |\n|---|---|---|\n| 1τ | 63.2% | 36.8% |\n| 2τ | 86.5% | 13.5% |\n| 3τ | 95.0% | 5.0% |\n| 4τ | 98.2% | 1.8% |\n| 5τ | 99.3% | 0.7% |\n\nSame milestones as RC — it's the same math.",
      },
      {
        type: 'theorem',
        title: 'RL Energize and De-energize Equations',
        body: "**Energizing** (i(0) = 0, source Vs):\n$$i(t) = \\frac{V_s}{R}\\left(1 - e^{-t/\\tau}\\right) = I_{final}\\left(1 - e^{-t/\\tau}\\right)$$\n$$v_L(t) = V_s \\, e^{-t/\\tau}$$\n\n**De-energizing** (i(0) = I₀, source removed, current decays through R):\n$$i(t) = I_0 \\, e^{-t/\\tau}$$\n$$v_L(t) = -I_0 R \\, e^{-t/\\tau}$$",
      },
      {
        type: 'insight',
        title: 'The Dual RC–RL Symmetry',
        body: "| Property | RC Circuit | RL Circuit |\n|---|---|---|\n| Time constant | τ = RC | τ = L/R |\n| Exponential variable | Voltage v_C | Current i_L |\n| Initial state | v_C(0) | i_L(0) |\n| DC steady state | Open circuit | Short circuit |\n| Energy stored | ½CV² | ½LI² |\n| Series combination | R series, C to ground | R and L in series |\n\nThe two circuits are mathematically identical — swap V↔I and C↔1/L.",
      },
      {
        type: 'procedure',
        title: 'Relay Timing Calculation',
        body: "Given coil L, R, and pull-in current I_pull:\n\n1. I_final = Vs / R\n2. τ = L / R\n3. Pull-in time: t = −τ × ln(1 − I_pull / I_final)\n4. For drop-out with flyback diode: τ' = L / R_coil (only coil resistance in loop)\n5. Drop-out time: t = −τ' × ln(I_drop / I_final)\n\nExample: L=100mH, R=200Ω, Vs=24V, I_pull = 0.7×I_final:\nt = −0.5ms × ln(0.3) = 0.60ms pull-in time",
      },
      {
        type: 'warning',
        title: 'Inductive Load Wiring — Never Use Standard Output Timing',
        body: "Never assume that a relay or solenoid responds at the same speed as the digital signal driving it. The RL time constant introduces delay. For time-critical PLC sequences:\n1. Measure actual pull-in and drop-out times with an oscilloscope\n2. Add extra time margin in PLC programs (typical: 20–50ms for relays)\n3. For safety-critical interlocks, always verify output state with a feedback input\n4. PLC output filtering (typically 3–10ms hardware filter on inputs) must also be accounted for",
      },
    ],
    visualizations: [
      {
        id: 'RLCircuitViz',
        title: 'RL Time Constant — Current Buildup and Decay',
        mathBridge: "Press Restart in Energize mode. Watch current build from 0 to I_final with the characteristic S-curve shape. Adjust R and L: increasing R shrinks I_final AND speeds up the rise (smaller τ). Increasing L slows the rise (larger τ) but I_final stays the same. Switch to De-energize: the same exponential, now decaying to zero. The V_L readout shows the back-EMF during decay — this is what destroys unprotected PLC outputs.",
      },
    ],
  },

  math: {
    prose: [
      "The RL circuit differential equation (KVL): $V_s = iR + L \\frac{di}{dt}$. Rearranging:\n\n$$\\frac{di}{dt} + \\frac{R}{L}i = \\frac{V_s}{L}$$\n\nThis is a first-order linear ODE with solution $i(t) = \\frac{V_s}{R}(1 - e^{-Rt/L}) = I_{final}(1 - e^{-t/\\tau})$. The same form as RC charging with τ = L/R substituted.",
      "**Inductor energy and power.** Power into inductor: p_L = v_L × i = Li(di/dt). Total energy stored when current rises from 0 to I:\n\n$$E = \\int_0^I Li \\, di = \\frac{1}{2}LI^2$$\n\nDuring de-energize, this energy must be dissipated. With flyback diode only: E = ½LI² dissipated in R_coil over time ~5τ. With a Zener clamp at V_Z: power dissipated in Zener is approximately P = V_Z × I_avg during the decay pulse.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Boost Converter: Storing and Releasing Inductor Energy',
        body: "A boost (step-up) converter switches an inductor on and off rapidly. During ON time: current builds in inductor (stores energy). During OFF time: inductor releases energy into a higher-voltage capacitor (back-EMF drives current into capacitor). Switching frequency 100kHz–1MHz gives τ << switching period, so tiny L values (1–100μH) are sufficient. VFD drives, laptop power supplies, and LED drivers all use this principle.",
      },
    ],
  },
};
