export default {
  id: 'cnc-dwell',
  slug: 'dwell',
  chapter: 'cnc-1',
  order: 15,
  title: 'Dwell',
  subtitle: 'G04 — Making the Machine Wait on Purpose',
  tags: ['G04', 'dwell', 'P', 'X', 'tapping', 'bore', 'spindle', 'timing'],

  semantics: {
    core: [
      { symbol: 'G04 P_', meaning: 'Dwell for P milliseconds (Fanuc default). The machine halts all axis motion and waits. Example: G04 P500 = 500ms pause.' },
      { symbol: 'G04 X_', meaning: 'Dwell for X seconds on some controllers (Fanuc allows G04 X1.5 = 1.5 seconds). Check your controller manual — some use P for seconds, some for milliseconds.' },
      { symbol: 'P (in G04)', meaning: 'The dwell duration. Units vary by controller: Fanuc uses milliseconds (G04 P1000 = 1 second). Always verify units before use.' },
    ],
    rulesOfThumb: [
      'G04 P1000 = 1 second on Fanuc (P is in milliseconds). Confirm your controller\'s unit convention — some use P in seconds.',
      'Use a dwell after a boring bar reaches depth to allow the bar to finish its last revolution cleanly before retracting.',
      'G04 is non-modal — it executes once, then the machine returns to normal operation. You do not need to cancel it.',
    ]
  },

  hook: {
    question: 'You bore a precision hole and measure it slightly undersized, even though the boring bar is set correctly. What is actually happening at the bottom of the bore — and how do you fix it?',
    realWorldContext:
      'When a boring bar reaches the programmed depth, the machine immediately begins retracting — but the bar is still rotating. ' +
      'At the moment of reversal, the tool leaves a tiny spiral witness mark as it spirals upward. ' +
      'In a precision bore, this creates a slight taper or surface finish flaw that makes the hole measure slightly undersized on a plug gauge. ' +
      'The solution is **G04 dwell**: a programmed pause at full depth that allows the bar to complete one or more full revolutions before retract. ' +
      'The bore finishes clean and round. The same principle applies to countersinks, spotfaces, and any operation where surface finish at depth matters.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(DWELL DEMO - BORING CYCLE WITH G04)\n' +
            '\n' +
            'G21 G90 G17 G40 G49 G80\n' +
            'T3 M06\n' +
            'G43 H3\n' +
            'S800 M03\n' +
            'M08\n' +
            'G54\n' +
            'G00 X0 Y0\n' +
            '\n' +
            '(BORING PASS - APPROACH)\n' +
            'G00 Z5.\n' +
            'G01 Z-25. F40    (PLUNGE TO DEPTH)\n' +
            '\n' +
            '(DWELL AT DEPTH: 1 REVOLUTION @ 800 RPM = 75ms)\n' +
            '(800 RPM = 13.3 rev/sec, 1 rev = 75ms)\n' +
            'G04 P500           (0.5 second dwell - safe margin)\n' +
            '\n' +
            '(RETRACT CLEANLY)\n' +
            'G00 Z50.\n' +
            'M09 M05\n' +
            'M30'
        },
        title: 'Dwell at Bore Depth',
        caption: 'G04 P500 pauses all axis motion for 500ms. The spindle continues rotating, completing several clean revolutions at the bottom of the bore before retract. This eliminates the spiral witness mark.',
      },
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'dwell-1',
              label: '1 — G04 P_: pause all axes, spindle keeps spinning',
              code:
                '; G04 = dwell. All axis motion stops for the duration.\n' +
                '; The spindle keeps rotating — G04 does not touch M03/M04.\n' +
                '; G04 P_ = milliseconds (Fanuc standard)\n' +
                '; G04 P1000 = 1 second. G04 P500 = 0.5 second.\n' +
                'G21 G90\n' +
                'S800 M03\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-25 F40               ; plunge boring bar to depth\n' +
                'G04 P500                  ; dwell 500ms = ~6 full revolutions at 800 RPM\n' +
                '; Revolutions during dwell = (RPM / 60000) * P_ms\n' +
                '; = (800 / 60000) * 500 = 6.67 revolutions\n' +
                'G0 Z50                    ; retract cleanly after full revolutions\n' +
                'M05\n' +
                'M30\n',
            },
            {
              id: 'dwell-2',
              label: '2 — G04 after M03 spindle start (ramp-up wait)',
              code:
                '; Some machines take 200–500ms to reach full spindle speed after M03.\n' +
                '; If you move immediately, the tool enters material while\n' +
                '; the spindle is still accelerating — poor surface finish or tool breakage.\n' +
                '; A brief G04 after M03 lets the spindle reach full RPM first.\n' +
                'G21 G90\n' +
                'T1 M06\n' +
                'G43 H1\n' +
                'S2500 M03\n' +
                'G04 P300                  ; wait 300ms for spindle ramp-up\n' +
                'G0 X0 Y0 Z5\n' +
                'M08\n' +
                'G1 Z-3 F200               ; now cutting at full speed\n' +
                'G1 X50 F300\n' +
                'G0 Z50\n' +
                'M05 M09\n' +
                'M30\n',
            },
            {
              id: 'dwell-3',
              label: '3 — G04 is non-modal: fires once, no cancel needed',
              code:
                '; G04 executes once and then the machine returns to\n' +
                '; whatever modal state it was in before the dwell.\n' +
                '; There is no "G04 off" or cancel code needed.\n' +
                'G21 G90\n' +
                'S1000 M03\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-10 F80               ; first bore\n' +
                'G04 P400                  ; dwell at depth 1\n' +
                'G0 Z5\n' +
                'G0 X30                    ; move to second hole (G01 modal still active)\n' +
                'G1 Z-10 F80               ; second bore\n' +
                'G04 P400                  ; dwell at depth 2 (same P, separate G04 block)\n' +
                'G0 Z50\n' +
                'M05\n' +
                'M30\n',
            },
          ],
        },
        title: 'G04 Dwell — Pause, Ramp, Non-Modal',
        caption: 'Cell 1: G04 P in milliseconds — spindle stays running while axes pause. Cell 2: using dwell after M03 to let the spindle reach full speed before cutting. Cell 3: G04 is non-modal — it fires once, no cancel needed.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 15 of 31 — Dwell',
        body: 'G04 is one of the simplest codes in CNC, but it solves a real precision problem. Every machinist who bores holes needs to know this.',
      },
      {
        type: 'definition',
        title: 'G04 P_ — Timed Axis Pause',
        body: 'G04 halts all axis motion for the programmed duration. Spindle state is unchanged — if M03 was active, the spindle keeps spinning. On Fanuc: P is in milliseconds (G04 P1000 = 1 second). Some controllers use P in seconds — verify with your machine manual.',
      },
      {
        type: 'definition',
        title: 'Why bore quality depends on dwell',
        body: 'At the moment a boring bar reverses, it is still rotating. Without a pause, the tool spirals upward through the bore surface, leaving a microscopic helix mark. G04 at depth lets the bar complete full clean revolutions before retract — the bore is round and has a consistent surface finish.',
      },
      {
        type: 'insight',
        title: 'Calculate dwell from RPM: 1 rev = 60000 / RPM ms',
        body: 'At 800 RPM: one revolution = 60000 / 800 = 75ms. For 3 clean revolutions use G04 P225. For a comfortable safe margin, use P500 (6+ revolutions at 800 RPM). Higher RPM = shorter per-revolution time.',
      },
      {
        type: 'insight',
        title: 'G04 is non-modal',
        body: 'Unlike G01 or G00, G04 does not stay active. It fires once and the machine returns to its previous modal motion state. There is nothing to cancel. Multiple dwells require multiple G04 blocks.',
      },
    ],
    prose: [
      '**What G04 Does**: G04 is a timed pause. All axis motion stops. The spindle keeps spinning (if it was on — G04 does not affect spindle state). After the programmed duration, the program continues with the next block. It is that simple.',

      '**When to Use It**:\n' +
      '- **Boring**: Pause at depth for one clean revolution before retract.\n' +
      '- **Countersinking / spotfacing**: Dwell ensures a flat, complete seat.\n' +
      '- **Tapping with a rigid tap holder**: Some setups need a brief pause at full depth for spindle reversal to fully complete before retract begins.\n' +
      '- **After spindle start (M03)**: On some machines, a short dwell (G04 P500) after M03 ensures the spindle has ramped to full speed before the first cut.\n' +
      '- **Between operations**: When using coolant, a brief dwell can allow the fluid to clear chips from the bore before a measurement or probe cycle.',

      '**Calculating Dwell Duration for Boring**: The rule of thumb is to dwell for at least one full spindle revolution. At spindle speed S (RPM):\n' +
      '$T_{\\text{ms}} = \\frac{60000}{S}$\n' +
      'At 800 RPM: one revolution = 60000 / 800 = 75 ms. Use G04 P200 for a comfortable 2–3 revolution dwell. At higher RPMs, even G04 P100 covers many revolutions.',

      '**G04 is Non-Modal**: Unlike G01 or G00, G04 does not stay active. It fires once and the machine returns to its previous modal state. There is nothing to cancel after a dwell.',

      '**Fanuc Units — P vs X**: On Fanuc controls, `G04 P_` uses milliseconds and `G04 X_` uses seconds (on most models). `G04 P1000` = 1 second = `G04 X1.`. When writing portable programs, prefer `G04 P_` with milliseconds and a comment showing the equivalent seconds. Always verify on the specific controller — some Fanuc variants use P in seconds.',
    ],
  },

  math: {
    prose: [
      'Minimum dwell time for one spindle revolution:',
      '$T_{\\text{dwell}} \\geq \\frac{60\\,000 \\text{ ms}}{S \\text{ [RPM]}}$',
      'At common spindle speeds:',
      '| Speed | 1 rev | Practical G04 |',
      '|-------|-------|---------------|',
      '| 500 RPM | 120 ms | G04 P300 |',
      '| 1000 RPM | 60 ms | G04 P200 |',
      '| 2000 RPM | 30 ms | G04 P200 |',
      '| 4000 RPM | 15 ms | G04 P100 |',
      'For safety margin, always dwell 3–5× the minimum. The extra time is negligible on a per-part basis and eliminates the risk of a retract beginning mid-revolution.',
    ],
  },

  rigor: {
    prose: [
      '**Controller variation on P units**: Some older or non-Fanuc controls interpret G04 P as seconds (P1.5 = 1.5 seconds). Some use only integers. Always read the builder\'s manual. When in doubt, test with G04 P100 on a short dwell and time it — you will know immediately whether P = ms or seconds.',

      '**G04 in canned cycles**: Inside canned drilling cycles (G82 has a built-in dwell parameter `P`), the dwell is part of the cycle definition, not a separate G04. G82 P500 dwells 500 ms at hole bottom automatically. G04 is only needed when building a manual boring or special cycle outside of canned cycles.',

      '**G04 does not pause the spindle**: If M05 is needed to stop the spindle during a dwell (for example, an M00 operator stop), use M05 before G04. G04 alone never stops the spindle.',
    ],
  },

  examples: [
    {
      id: 'ex-dwell-bore',
      title: 'Calculating Dwell for an 800 RPM Boring Operation',
      problem: 'A boring bar runs at 800 RPM. Calculate the time per revolution and choose a safe G04 P value for a 3-revolution dwell.',
      steps: [
        { expression: 'T = 60,000 ms / 800 RPM', annotation: 'Time for one revolution.' },
        { expression: 'T = 75 ms / revolution', annotation: 'At 800 RPM, one full revolution takes 75 milliseconds.' },
        { expression: '3 revolutions × 75 ms = 225 ms', annotation: 'Three revolutions ensures the bore finishes cleanly.' },
        { expression: 'G04 P250', annotation: 'Round up to 250 ms for a comfortable margin. Adds 0.25 seconds per bore — negligible cycle time cost.' },
      ],
      conclusion: 'G04 P250 at 800 RPM provides 3.3 complete spindle revolutions at bore depth before retract.',
    },
    {
      id: 'ex-dwell-spindle-ramp',
      title: 'Spindle Ramp-Up Dwell After M03',
      problem: 'A 10 HP spindle motor may take 0.5–1.0 seconds to reach commanded RPM from rest. Add an appropriate dwell after M03.',
      steps: [
        { expression: 'S3000 M03', annotation: 'Command spindle on at 3000 RPM.' },
        { expression: 'G04 P1000', annotation: '1 second dwell — allows spindle to fully accelerate before the first cut.' },
        { expression: 'G00 X0 Y0', annotation: 'Rapid to start position — spindle is now at full speed.' },
      ],
      conclusion: 'For high-speed spindles or heavy cuts where a "half speed" entry could cause chatter, the ramp-up dwell ensures full RPM before engagement.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-dwell-1',
        type: 'choice',
        text: 'On a Fanuc control, G04 P500 dwells for:',
        options: ['500 seconds', '500 milliseconds (0.5 seconds)', '5 seconds', '500 spindle revolutions'],
        answer: '500 milliseconds (0.5 seconds)',
      },
      {
        id: 'cnc-dwell-2',
        type: 'choice',
        text: 'Does G04 stop the spindle?',
        options: [
          'Yes — G04 pauses everything including the spindle',
          'No — the spindle continues rotating during G04',
          'Only if M05 is programmed on the same block',
          'Only in G17 plane',
        ],
        answer: 'No — the spindle continues rotating during G04',
      },
      {
        id: 'cnc-dwell-3',
        type: 'input',
        text: 'At 1500 RPM, how long (in ms) does one spindle revolution take? (Round to nearest ms)',
        answer: '40',
      },
      {
        id: 'cnc-dwell-4',
        type: 'choice',
        text: 'G04 is which type of G-code?',
        options: ['Modal — stays active until cancelled', 'Non-modal — fires once and does not persist', 'A canned cycle that requires G80 to cancel', 'A preparatory function that requires a confirmation block'],
        answer: 'Non-modal — fires once and does not persist',
      },
      {
        id: 'cnc-dwell-5',
        type: 'choice',
        text: 'Why is a dwell used at the bottom of a boring cycle?',
        options: [
          'To allow the coolant to flood the bore before retract',
          'To complete one or more clean spindle revolutions before retract, eliminating the spiral witness mark',
          'To allow the G43 offset to update',
          'To confirm the tool has reached the programmed Z depth',
        ],
        answer: 'To complete one or more clean spindle revolutions before retract, eliminating the spiral witness mark',
      },
    ]
  },

  mentalModel: [
    'G04 P_ = timed pause in milliseconds (Fanuc). Axes stop, spindle keeps spinning.',
    'Boring: dwell at depth = clean bore surface. One revolution minimum.',
    'Rule: T[ms] = 60000 / RPM. Multiply by 3–5 for safety.',
    'G04 is non-modal — no cancel needed.',
    'G82 (canned cycle) has a built-in dwell P parameter — no separate G04 needed there.',
    'Confirm P units (ms vs seconds) on any unfamiliar controller before running.',
  ],
}
