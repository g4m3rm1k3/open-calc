export default {
  id: 'elec6-001',
  slug: 'troubleshooting-methodology',
  chapter: 'elec6',
  order: 1,
  title: 'Troubleshooting Methodology',
  subtitle: 'Systematic Fault Diagnosis in Electronic Systems',
  tags: ['troubleshooting', 'fault diagnosis', 'half-split', 'symptom analysis'],
  aliases: ['fault finding', 'circuit diagnosis', 'systematic debugging'],
  timeToComplete: 20,
  coreConcept: 'Systematic troubleshooting follows: observe symptoms → isolate section → test → verify fix. Half-split method halves the search space each step.',
  prerequisites: ['elec5-010'],
  nextLesson: 'elec6-002',
  hook: {
    question: 'A motor drive faults on startup every morning but runs fine after warm-up. Where do you start?',
    realWorldContext: 'Industrial maintenance technicians use systematic fault-finding to minimize downtime. Unstructured guessing costs hours; a methodical approach finds the root cause in minutes.',
  },
  mentalModel: [
    'Symptoms are clues, not the cause — always ask "what changed?" before opening the enclosure',
    'Half-split: isolate the midpoint of the signal path, test, then work toward the fault',
    'Substitution: replace suspected component with known-good to confirm without repairing first',
    'Signal injection/tracing: inject test signal at input, probe through stages until signal disappears',
    'Document before touching: note all settings, note what changed, photograph connections',
  ],
  intuition: {
    prose: [
      'Think of an electronics system as a chain of dominoes. The output domino is down. Your job is not to fix the last domino — it is to find which domino first fell. Start in the middle: is the signal present at the midpoint of the chain? If yes, the fault is downstream; if not, upstream.',
      'The best technicians always ask "what changed?" before reaching for a meter. A system that worked yesterday and fails today has one new factor: a component aged to failure, a connection oxidised, a software update, a power blip. Narrowing that window saves enormous time.',
      'Temperature-dependent faults (works cold, fails hot, or vice versa) point to components with thermal coefficients: electrolytic capacitors dry out with heat, solder joints crack with thermal cycling, MOSFETs change threshold voltage. Use freeze spray and a heat gun systematically, not randomly.',
    ],
    callouts: [
      { type: 'insight', body: 'Never replace a component until you know WHY it failed. Replacing a blown fuse without finding the short just blows the next one.' },
      { type: 'warning', body: 'Always measure voltage with respect to a reference (usually ground). A "5V signal" floating with no ground reference is meaningless.' },
    ],
    visualizations: [{ type: 'OhmViz', props: {} }],
  },
  math: {
    prose: [
      'Half-split: after k tests, fault is located within N/2^k candidate stages',
      'Voltage divider fault signature: V = Vs × R2/(R1+R2) — an open R2 → V=0, shorted R2 → V=Vs',
      'Thévenin equivalent: measure open-circuit voltage Vth and short-circuit current Isc → Rth = Vth/Isc',
      'Power dissipation in suspect component: P = V × I (measure both to confirm rating not exceeded)',
    ],
    callouts: [
      { type: 'formula', body: 'Half-split efficiency: k tests → fault within N/2^k stages. For 16 stages, 4 tests suffice.' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A motor drive faults every morning during startup but runs fine after 30 minutes of warm-up. Before opening the enclosure, what is the single most useful question to ask?',
      options: [
        'Which component is most likely to fail in this type of drive?',
        'What changed recently? — a system that worked yesterday and fails today has one new variable: an aged component, a changed setting, a new ambient temperature pattern, or a recent modification',
        'Is the supply voltage within specification?',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A signal chain has 16 stages. Using the half-split method, how many test points do you need to measure before you can pinpoint the faulty stage?',
      options: [
        '8 measurements — you must check half the stages individually',
        '4 measurements — each test halves the search space: 16→8→4→2→1, so 4 tests locate the fault within one stage',
        '16 measurements — each stage must be verified in sequence from input to output',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A PCB works on the bench at room temperature but fails intermittently after 20 minutes of operation. What troubleshooting technique best isolates the faulty component?',
      options: [
        'Replace all electrolytic capacitors since they are the most common thermal failure',
        'Apply freeze spray and a heat gun systematically to individual components while monitoring the output — the component whose cooling or heating triggers the fault is the culprit',
        'Reduce the supply voltage to 90% to lower power dissipation and extend the time before failure',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You replace a blown fuse in a power supply and it immediately blows again. What is the correct next step?',
      options: [
        'Install a higher-rated fuse so it can handle the fault current without blowing',
        'Find the root cause — a fuse blowing a second time confirms a fault is still present; replacing it again wastes the fuse and risks damaging other components that depend on the fuse for protection',
        'Add a larger filter capacitor on the DC output to absorb the current spike that is blowing the fuse',
      ],
      correct: 1,
    },
  ],
};
