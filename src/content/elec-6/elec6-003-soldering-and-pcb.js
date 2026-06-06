export default {
  id: 'elec6-003',
  slug: 'soldering-and-pcb',
  chapter: 'elec6',
  order: 3,
  title: 'Soldering & PCB Basics',
  subtitle: 'Through-Hole, SMD & PCB Layer Structure',
  tags: ['soldering', 'PCB', 'SMD', 'through-hole', 'reflow', 'DFM'],
  aliases: ['printed circuit board', 'surface mount', 'PCB assembly', 'hand soldering'],
  timeToComplete: 22,
  coreConcept: 'Good solder joints are shiny, concave fillets that wet both pad and component lead. PCB copper trace width sets current capacity; ground planes reduce impedance and EMI simultaneously.',
  prerequisites: ['elec6-002'],
  nextLesson: 'elec6-004',
  hook: {
    question: 'A freshly assembled board works on the bench but fails in the field after one week. Post-mortem shows no obvious damage. What killed it?',
    realWorldContext: 'Cold solder joints are the hidden epidemic of electronics manufacturing — visually acceptable but electrically intermittent. Understanding proper soldering technique and PCB design rules eliminates the most common cause of field failure.',
  },
  mentalModel: [
    'Heat the joint, not the solder — iron tip touches pad and lead simultaneously; solder flows to heat, not to iron',
    'Flux is the secret ingredient: it dissolves oxides, promotes wetting, and prevents re-oxidation during soldering',
    'SMD package size codes (0805 = 0.08" × 0.05") determine rework difficulty; 0402 and smaller require magnification and fine-tip irons',
    'PCB layer stack-up determines signal integrity: keep high-speed signals referenced to a continuous ground plane directly below them',
    'Reflow soldering follows a precise thermal profile — deviating from it causes solder balling, tombstoning, or incomplete reflow',
  ],
  intuition: {
    prose: [
      'A solder joint is not a blob of metal glue — it is an intermetallic bond between the solder alloy and the base metal of the pad and lead. This bond only forms when both surfaces are clean, hot enough, and wetted with flux. Apply the iron to heat both the pad and the component lead simultaneously; when both are at temperature, touch solder to the joint (not the iron tip) and let it flow by capillary action. A good joint looks like a small volcano: shiny, smooth, concave sides.',
      'Lead-free solder (SAC305: 96.5% tin, 3% silver, 0.5% copper) has a higher melting point (~217°C) than traditional Sn63Pb37 (~183°C) and is less forgiving. Iron temperature needs to be 350–370°C for lead-free versus 300–330°C for leaded. The lead-free joint also looks slightly duller and grainier — do not mistake a normal SAC305 fillet for a cold joint based on appearance alone.',
      'PCB trace width is not a stylistic choice — it is a current-carrying specification. The IPC-2221 standard defines allowable temperature rise in copper traces based on width and thickness. A 1mm wide, 1oz copper trace (35µm thick) can carry roughly 1A with a 10°C rise. Exceeding this degrades the PCB over time, darkening the soldermask and eventually delaminating the copper. Ground planes are the best current carriers: a full-copper pour on a layer carries hundreds of amps with negligible resistance and also shields nearby signal layers from radiated interference.',
    ],
    callouts: [
      { type: 'warning', body: 'Never use acid flux (plumbing flux) on electronics. It is corrosive and will eat copper traces within months. Use only rosin-based or no-clean electronics flux.' },
      { type: 'insight', body: 'Tombstoning — where one end of an SMD component lifts off the pad during reflow — is caused by unequal thermal mass on the two pads. Fix it by balancing pad geometry or staggering the reflow profile.' },
    ],
    visualizations: [{ type: 'OhmViz', props: {} }],
  },
  math: {
    prose: [
      'Trace current capacity (IPC-2221 approximation): I = k × ΔT^0.44 × A^0.725, where A is cross-sectional area in mils², ΔT is allowable temp rise in °C, k = 0.048 for external layers',
      'Trace resistance: R = ρL / A, copper ρ = 1.72×10⁻⁸ Ω·m; 10cm of 0.25mm trace on 1oz copper ≈ 0.069Ω, measurable at high currents',
      'Reflow profile: preheat ramp ≤3°C/s to 150°C soak, hold 60–120s for flux activation, ramp to 250°C peak for SAC305, cooldown ≤6°C/s',
      'Via current capacity: via carries roughly same current as a trace of equal cross-section; 0.3mm via with 1oz plating ≈ 0.5A capability',
    ],
    callouts: [
      { type: 'formula', body: 'IPC-2221 trace width rule of thumb: width (mm) ≈ I(A) for 1oz copper with 10°C rise on external layer. Double width for internal layers (less cooling).' },
    ],
  },
};
