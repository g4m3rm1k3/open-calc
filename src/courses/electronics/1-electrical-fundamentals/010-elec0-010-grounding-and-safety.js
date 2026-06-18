export default {
  id: 'elec0-010',
  slug: 'grounding-and-safety',
  chapter: 'elec0',
  order: 10,
  title: 'Grounding, Safety, and Lockout/Tagout',
  subtitle: "Why electrical safety isn't just compliance — and how grounding, LOTO, and safe work practices protect you from physics you can't see.",
  tags: ['grounding', 'earthing', 'LOTO', 'lockout tagout', 'electrical safety', 'arc flash', 'PPE', 'OSHA', 'ground fault'],
  aliases: 'grounding earthing safety lockout tagout LOTO arc flash PPE ground fault protection',
  timeToComplete: 20,
  coreConcept: "Grounding provides a low-resistance return path for fault current, causing fuses and breakers to trip before the fault harms people or equipment. Lockout/Tagout (LOTO) eliminates hazardous energy before working on equipment. These are not optional safety bureaucracy — they're applied physics that save lives.",
  prerequisites: ['elec0-003'],
  nextLesson: null,

  hook: {
    question: "A technician replaces a sensor inside a running machine, reaches through a small access panel, and receives a fatal shock from 120VAC. The machine was 'just running normally.' How does this happen, and what single procedure would have prevented it?",
    realWorldContext: "Electrical fatalities in industrial settings are almost always preventable. The mechanism is invariably the same: energized equipment, inadequate isolation, and human contact with a conductor. Lockout/Tagout, if properly applied, makes this scenario physically impossible. Grounding, if properly designed, ensures that a fault produces current flow (which trips protective devices) rather than lethal voltage buildup on exposed metal. Understanding why these systems work — not just that they're required — makes you apply them correctly even under time pressure.",
  },

  mentalModel: [
    "**Grounding creates a short-circuit path for faults.** If a live wire contacts a metal enclosure and the enclosure is grounded, current surges from the fault point through the low-resistance ground path, back to the source, creating a dead short that trips the breaker instantly. Without grounding, the enclosure floats at line voltage — you become the fault path when you touch it. Grounding's goal is to make faults obvious and immediately cleared, not to harmlessly absorb them.",
    "**LOTO eliminates hazardous energy — not just electrical.** Lockout/Tagout addresses all stored energy: electrical (capacitors, power), pneumatic (compressed air actuators), hydraulic (pressurized cylinders), gravitational (elevated machine parts), mechanical (springs). Turning off power is not LOTO. LOTO is: isolate all energy sources, dissipate stored energy, apply personal lock so no one can re-energize while you're working.",
    "**Arc flash is not shock — it's plasma.** An arc flash happens when a fault creates sustained arcing current through air. Temperature at the arc can reach 35,000°F (4× the sun's surface temperature). The flash produces an explosion of vaporized copper, ultraviolet/infrared radiation, and a pressure wave. PPE for arc flash is rated in cal/cm² — the amount of thermal energy that can reach your skin without causing a second-degree burn. You cannot safely work inside an arc flash hazard without proper PPE regardless of experience.",
  ],

  intuition: {
    prose: [
      "**Why equipment is grounded.** Every metal enclosure, panel, machine frame, and equipment chassis should be bonded to the electrical system ground (protective earth, PE). Here's the physics: if a live conductor inside a machine contacts the ungrounded metal frame, the frame is now at line voltage. Anyone touching the frame while standing on a grounded surface becomes the circuit — current flows through their body, following Ohm's Law. With grounding: the fault current flows through the low-resistance ground wire, the current is enormous (essentially a short circuit), and the upstream breaker or fuse trips in milliseconds, clearing the fault before harm occurs.",
      "**Ground vs. neutral — not the same.** In a 120V/240V residential service: the neutral conductor carries normal current back to the source. The ground conductor is the fault protection path — it should carry zero current under normal operation. In industrial facilities: the equipment grounding conductor (green wire or bare copper) connects all metal equipment to the grounding system. The neutral is the return for single-phase loads. Connecting ground and neutral together at any point other than the service entrance creates 'ground loops' — current flowing through the ground system, causing noise, nuisance trips, and corrosion.",
      "**Ground fault circuit interrupters (GFCIs) and ground fault protection.** A standard breaker trips on overcurrent. A GFCI/GFP trips when it detects current imbalance between line and neutral — indicating current is returning through a ground path (through a person or via a fault). GFCIs detect as little as 5mA imbalance and trip in 1/40th of a second. Required by code in wet locations: kitchens, bathrooms, outdoors. In industrial settings, ground fault relays protect large systems — a 500kVA transformer with a 50A ground fault relay will trip on a fault that a breaker might miss.",
      "**Lockout/Tagout — the procedure.** OSHA 1910.147 requires LOTO for servicing or maintaining equipment when unexpected energization could cause injury. The steps: (1) Notify affected employees. (2) Identify all energy sources (electrical, pneumatic, hydraulic, gravity, thermal). (3) Shut down equipment using normal stopping procedures. (4) Isolate all energy sources — open every disconnect, close every valve, depressurize every accumulator. (5) Apply personal padlock on each isolation point — YOUR lock, YOUR key. (6) Release or restrain stored energy — bleed air, block elevated parts, discharge capacitors. (7) Verify — attempt to start (push the button), measure voltage. Zero energy confirmed. Now work safely.",
      "**The critical rule: your lock, your key.** The entire safety engineering of LOTO depends on each worker applying their own lock. If you put your lock on a disconnect, only you can remove it — your supervisor cannot, the plant manager cannot, the second shift cannot. The lock is a physical veto. If multiple workers are in the machine simultaneously, each applies their own lock. When all workers complete their tasks and remove their locks, only then can the equipment be re-energized. This physical redundancy is what makes LOTO reliable even when humans are under pressure to rush.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'LOTO Sequence (OSHA 1910.147)',
        body: '1. **Notify** all affected personnel that equipment will be de-energized.\n2. **Identify** all energy sources: electrical disconnects, pneumatic isolation valves, hydraulic valves, stored mechanical energy (springs, elevated loads).\n3. **Shut down** using normal procedure.\n4. **Isolate** — open main disconnect(s), close all pneumatic/hydraulic supply valves.\n5. **Lock** — apply personal padlock to each isolation device. Tag it with your name.\n6. **Release stored energy** — bleed air lines, cycle actuators to extend/retract, block elevated parts, wait for VFD capacitor discharge (5–15 min).\n7. **Verify zero energy** — attempt to start machine (push cycle start), measure all voltages with a calibrated meter. Confirm zero.\n8. **Work safely.**\n9. To restore: remove all blocks/restraints, remove your lock, notify personnel, re-energize.',
      },
      {
        type: 'definition',
        title: 'Arc Flash Hazard Categories (NFPA 70E)',
        body: 'Arc flash PPE categories by incident energy:\n\n- **Cat 1:** 1.2–4 cal/cm² — Arc-rated shirt, pants, face shield, hard hat\n- **Cat 2:** 4–8 cal/cm² — Arc-rated coverall (8 cal), face shield, balaclava\n- **Cat 3:** 8–25 cal/cm² — Arc flash suit (25 cal), face shield, gloves\n- **Cat 4:** 25–40 cal/cm² — Heavy arc flash suit, face shield, gloves\n\n**Above 40 cal/cm²:** Evacuate area — do not attempt to work.\n\nArc flash studies are required for industrial systems. The category at each panel depends on available fault current, clearing time, and working distance.',
      },
      {
        type: 'insight',
        title: 'Residual Voltage in VFDs and Servo Drives',
        body: "Turning off the main disconnect on a machine with VFDs does not immediately make it safe to touch the drive's internal components. The DC bus capacitors in a 480V drive charge to ~680VDC and take 5–15 minutes to discharge through internal bleed resistors. Wait the manufacturer-specified discharge time, then verify with a meter (set to DC voltage) that the DC bus is below 50VDC before opening the drive cabinet. The drive's CHARGE indicator light is not reliable — the light may fail before the capacitor discharges.",
      },
      {
        type: 'warning',
        title: "The Myth of 'Low Voltage is Safe'",
        body: "24VDC can't cause electrocution under normal conditions — the voltage is too low to push dangerous current through dry skin resistance (~100kΩ). But: 24VDC can cause severe arc burns if shorted with a ring, watch, or tool across a fused point (short circuit current from a 24V supply with a low-impedance source can be hundreds of amps). 120VAC is lethal. 480VAC is immediately lethal. Never work on any energized circuit without confirming the hazard level and having appropriate PPE and authorization.",
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Ground fault current and clearing time.** For a fault to clear safely, fault current must be large enough to operate the protective device. Ground path resistance determines fault current: $I_{\\text{fault}} = V_{\\text{line}} / R_{\\text{ground path}}$. If ground wire resistance is 0.1Ω on a 120V circuit: $I = 120/0.1 = 1200A$. A 20A breaker clears this in milliseconds. If the ground wire is corroded or missing (R → ∞): $I \\rightarrow 0$, the breaker never trips, and the chassis holds line voltage indefinitely.",
      "**Body resistance and current.** The IEC threshold curves for physiological effects of AC current: 1mA = barely perceptible, 10mA = involuntary muscle contraction (can't release grip), 30mA = respiratory arrest possible, 100mA = ventricular fibrillation (lethal). With 10kΩ body resistance (dry skin): $V = IR = 0.03 \\times 10000 = 300V$ would drive 30mA. With 1kΩ (wet/sweaty): only 30V drives 30mA. This is why working conditions (wet environment, sweating) dramatically change electrical risk.",
    ],
    callouts: [],
  },

  examples: [
    {
      title: 'Why grounding prevents electrocution',
      problem: 'A 120VAC live conductor inside a metal panel contacts the panel frame. Panel A has the frame grounded with a 0.5Ω path to earth. Panel B has no ground connection. What happens to a person touching each panel?',
      solution: 'Panel A (grounded): Fault current = 120V / 0.5Ω = 240A. The 20A breaker trips in < 0.01 seconds. The person touches the panel, gets a brief tingle at most — fault cleared before dangerous current develops.\n\nPanel B (no ground): Fault current through the fault path = 0 (no complete circuit). Panel sits at 120V. Person touches it while standing on a concrete floor (resistance ~10kΩ shoes + 1kΩ body = ~11kΩ). Current through person: 120V / 11kΩ = 10.9mA. At this level: muscle contraction prevents releasing grip, likely falls, sustained current for minutes. Potentially fatal. Breaker NEVER trips — no overcurrent in the supply circuit.',
    },
  ],

  challenges: [
    {
      problem: 'A 120VAC circuit has a fault where the hot wire contacts the metal enclosure. The equipment grounding conductor (ground wire) has a resistance of 0.2Ω back to the source neutral/ground bond. What fault current flows, and will a standard 20A breaker trip?',
      hint: 'Use I = V / R. Then compare the fault current to what a 20A breaker will clear.',
      walkthrough: [
        'Identify knowns: V = 120VAC, ground path resistance R = 0.2Ω',
        'Fault current: I_fault = V / R = 120V / 0.2Ω = 600A',
        '600A is 30× the breaker\'s 20A rating.',
        'An inverse-time 20A breaker will trip almost instantaneously at 30× rated current — clearing time is typically under 0.01 seconds (one half-cycle or less).',
        'Yes, the 20A breaker will trip immediately. The low-resistance ground path ensures the fault current is enormous, which clears the breaker before anyone can be harmed.',
        'This demonstrates the design intent of grounding: not to "absorb" fault current safely, but to make the fault current so large that the protective device clears instantly.',
      ],
      answer: 'Fault current = 600A. Yes, the 20A breaker trips essentially instantaneously (well under 0.1 seconds).',
      difficulty: 'easy',
    },
    {
      problem: 'A VFD on a 480V system has just been powered down. The manufacturer specifies a 10-minute capacitor discharge time for the DC bus. A tech measures 350VDC on the DC bus terminals 5 minutes after shutdown. Is it safe to work on the drive internals? What conditions must be met before safe access?',
      hint: 'Consider the voltage level, the discharge time, and how to verify safe conditions — not just elapsed time.',
      walkthrough: [
        '480V line input rectifies to approximately 480 × √2 ≈ 679VDC on the DC bus at full charge.',
        'At 5 minutes (halfway through the specified 10-minute discharge time), the bus still reads 350VDC.',
        '350VDC is immediately lethal — far above the 50VDC threshold generally considered the boundary for hazardous DC voltage.',
        'It is NOT safe to work on drive internals at this point, regardless of elapsed time.',
        'The CHARGE indicator light cannot be trusted — the indicator bulb can fail while capacitors remain charged.',
        'Conditions required before safe access: (1) Wait the full manufacturer-specified discharge time (10 minutes minimum). (2) After waiting, use a calibrated DMM set to DC voltage and measure the DC bus terminals directly. (3) Confirm voltage is below 50VDC (or the manufacturer\'s specified safe level, whichever is lower). (4) Only then open the drive cabinet.',
        'Best practice is also to apply LOTO to the main disconnect before this process begins.',
      ],
      answer: 'Not safe — 350VDC is lethal. The tech must wait the full 10-minute discharge period, then verify with a calibrated meter that DC bus voltage is below 50VDC before accessing drive internals.',
      difficulty: 'medium',
    },
    {
      problem: 'Write out the complete LOTO procedure (following OSHA 1910.147 principles) for a machine with: one 480V three-phase main disconnect, two 24VDC control power supplies (each with its own fused disconnect), one pneumatic cylinder supplied by a 100 PSI air line with an isolation valve, and one spring-loaded clamping mechanism. Identify every energy source and the specific action taken for each.',
      hint: 'OSHA 1910.147 requires identifying ALL energy sources — electrical, pneumatic, hydraulic, gravitational, and mechanical (springs). Work through each category systematically.',
      walkthrough: [
        'Step 1 — Notify: Inform all affected personnel (operators, other technicians) that the machine will be de-energized for maintenance.',
        'Step 2 — Identify all energy sources: (A) 480V three-phase electrical — main disconnect. (B) 24VDC Control Supply 1 — fused disconnect. (C) 24VDC Control Supply 2 — fused disconnect. (D) Pneumatic — 100 PSI air supply isolation valve and stored air in the cylinder/lines. (E) Mechanical/spring — stored mechanical energy in the spring-loaded clamp.',
        'Step 3 — Normal shutdown: Use normal stopping procedure (press cycle stop / machine off) to bring the machine to a safe stopped state.',
        'Step 4 — Isolate all energy sources: Open the 480V main disconnect to OFF position. Open both 24VDC fused disconnects to OFF. Close the pneumatic isolation valve to shut off air supply.',
        'Step 5 — Apply personal locks: Apply your personal padlock AND tag to each isolation device: the main 480V disconnect handle, the two 24VDC disconnect handles, and the pneumatic isolation valve handle. Total: 4 locks. Each lock is yours — your key.',
        'Step 6 — Release/restrain stored energy: (D) Bleed the pneumatic line downstream of the isolation valve — open a manual bleed valve or actuate the cylinder to exhaust trapped air to atmosphere. Verify pressure gauge reads 0 PSI. (E) Block the spring-loaded clamp in a safe position using a mechanical block, pin, or prop so it cannot release and move even with spring energy present.',
        'Step 7 — Verify zero energy: Attempt to cycle the machine (press cycle start) — nothing should happen. Measure 480V bus with a calibrated CAT III voltmeter — confirm 0VAC phase-to-phase and phase-to-ground. Measure 24VDC outputs — confirm 0VDC. Confirm pneumatic pressure gauge reads 0 PSI. Confirm clamp block is secured.',
        'Step 8 — Work safely: All hazardous energy has been isolated, dissipated, and verified. Perform the maintenance task.',
        'Step 9 — Restore: Remove all mechanical blocks/restraints. Each worker removes only their own lock from each isolation device. Notify all personnel that the machine will be re-energized. Close all disconnects and valve in reverse order. Re-energize and verify normal operation.',
      ],
      answer: 'Four energy sources: 480V main disconnect (open + lock), two 24VDC disconnects (open + lock each), pneumatic isolation valve (close + lock + bleed downstream air to 0 PSI), spring clamp (mechanically block in safe position). Nine total steps following OSHA 1910.147: Notify → Identify → Shutdown → Isolate → Lock → Release stored energy → Verify zero energy → Work → Restore.',
      difficulty: 'hard',
    },
  ],
};
