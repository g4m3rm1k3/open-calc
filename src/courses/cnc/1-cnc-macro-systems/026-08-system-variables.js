export default {
  id: 'cnc-system-variables',
  slug: 'system-variables',
  chapter: 'cnc-1',
  order: 24,
  title: 'System Variables',
  subtitle: 'The Sensor and State Interface (#5000+)',
  tags: ['System Variables', '#5000', 'Telemetry', 'Probing', 'Machine State'],

  semantics: {
    core: [
      { symbol: '#5021–#5026', meaning: 'Current Machine Position: Real-time X, Y, Z coordinates in G53.' },
      { symbol: '#5041–#5046', meaning: 'Current Program Position: Target X, Y, Z in the active WCS (G54).' },
      { symbol: '#1000–#1132', meaning: 'Interface Signals: Status of external binary switches (Probes, Door Locks).' },
      { symbol: '#3000', meaning: 'Alarm Generation: Forces the machine to stop and display an error message (#3000=1 (WRONG TOOL)).' },
      { symbol: '#2000–#2999', meaning: 'Offset Registers: Programmatic access to the Tool Offset and Work Offset tables.' },
    ],
    rulesOfThumb: [
      'System variables are "Read-Only" for things like positions, but "Read-Write" for things like offsets.',
      'Use #5021 to find out where the machine *really* is after a PROBE hit (G31).',
      'The #3000 alarm allows you to prevent a crash if a variable is set incorrectly.',
    ]
  },

  hook: {
    question: 'How does a program see what the machine is currently doing?',
    realWorldContext:
      'Standard variables are for YOUR math. **System Variables** are for the MACHINE’S telemetry. ' +
      'If you need to know which tool is currently in the spindle, or if the door is open, you look at a specific "System Box". ' +
      'This is how advanced "Self-Correcting" macros work. The machine can measure a part with a probe, read the result in #5061, and automatically update its own offset to fix a 0.001 error. ' +
      'This is the heart of autonomous manufacturing.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(PROBE SIMULATION) \n#100 = #5021 (READ CURRENT MACHINE X) \nG01 X5.0 F50 \n#101 = #5021 (READ AGAIN AT X5.0) \n \nIF [#101 NE 5.0] GOTO 999 (ALARM IF POSITION MISMATCH) \nM30 \n \nN999 \n#3000 = 1 (POSITIONING ERROR)'
        },
        title: 'System Telemetry Lab',
        caption: 'Look at the MACROS tab. #100 and #101 will grab values directly from the machine\'s internal encoders (#5021). If the machine doesn\'t reach X5.0, the "Smart Macro" triggers alarm #3000.',
      },
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'sv-1',
              label: '1 — Reading current machine position: #5021-#5026',
              code:
                '; System variables #5021-#5026 hold the current MACHINE position\n' +
                '; (not program position — machine coordinates, G53 space).\n' +
                '; Read them AFTER a move to capture where the tool actually is.\n' +
                '; Use G04 P0 to flush the lookahead buffer before reading.\n' +
                'G21 G90 G54\n' +
                'G0 X50 Y30 Z5\n' +
                'G04 P0                    ; flush lookahead: ensure motors have stopped\n' +
                '#100 = #5021             ; capture actual X position (machine coords)\n' +
                '#101 = #5022             ; capture actual Y position\n' +
                '#102 = #5023             ; capture actual Z position\n' +
                '(MSG, Position captured: X=#100  Y=#101  Z=#102)\n' +
                'M30\n',
            },
            {
              id: 'sv-2',
              label: '2 — #3000 macro alarm: validate before cutting',
              code:
                '; #3000 = message triggers a MACHINE ALARM and halts the program.\n' +
                '; Use it to validate inputs before executing dangerous moves.\n' +
                '; The alarm number is your custom code; the string is the display message.\n' +
                '#100 = 15.0               ; depth argument (set this from G65 in real use)\n' +
                '#101 = 50.0               ; max allowed depth (safety limit)\n' +
                '; Check: if requested depth exceeds safety limit, alarm out\n' +
                'IF [#100 GT #101] THEN #3000 = 1 (DEPTH EXCEEDS LIMIT - CHECK PROGRAM)\n' +
                '; Check: if depth is zero or negative, alarm out\n' +
                'IF [#100 LE 0] THEN #3000 = 2 (DEPTH MUST BE POSITIVE)\n' +
                '; Safe to proceed\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z[-#100] F150\n' +
                'G0 Z50\n' +
                'M30\n',
            },
            {
              id: 'sv-3',
              label: '3 — Writing work offsets: auto-correct G54 from probe measurement',
              code:
                '; #5221 = G54 X offset, #5222 = G54 Y offset (read-write)\n' +
                '; A probe measures part position and updates G54 automatically.\n' +
                '; This is how self-correcting probing macros work.\n' +
                'G21 G90\n' +
                '; Simulate: probe measured part at X=0.15 (should be X=0)\n' +
                '; Correction: shift G54 X by -0.15 to re-zero the part\n' +
                '#110 = #5221              ; read current G54 X offset\n' +
                '#111 = 0.15              ; measured offset error from probe\n' +
                '#5221 = [#110 - #111]    ; write corrected offset back to G54\n' +
                '(MSG, G54 X corrected by -0.15mm)\n' +
                '; Now the machine uses the updated G54 for all subsequent moves\n' +
                'G54\n' +
                'G0 X0 Y0 Z5\n' +
                'M30\n',
            },
          ],
        },
        title: 'System Variables — Machine Telemetry',
        caption: 'Cell 1: read actual machine position with G04 P0 buffer flush before sampling. Cell 2: #3000 macro alarm — validate inputs and halt before dangerous moves. Cell 3: write to #5221 to auto-correct G54 from a probe measurement.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 24 of 31 — System Variables',
        body: 'User variables (#1–#999) hold your data. System variables (#1000+) expose the machine\'s own internal state. Reading them turns your macro into a sensor; writing to the offset registers turns it into a self-correcting system.',
      },
      {
        type: 'definition',
        title: '#5021–#5026 — Current machine position (read-only)',
        body: '#5021=X, #5022=Y, #5023=Z (machine coordinates, G53 space). These update in real-time as the tool moves. Always precede a position read with G04 P0 to flush the lookahead buffer — without it, you may read a position the machine has not reached yet.',
      },
      {
        type: 'definition',
        title: '#3000 — Macro alarm (write-only)',
        body: 'Writing #3000 = N (message text) immediately halts the machine and displays the message on the operator screen. Use it for input validation in parametric macros: check that depth is positive, diameter is in range, and tool number is valid before executing any motion.',
      },
      {
        type: 'definition',
        title: '#5221–#5225 — G54 work offset registers (read-write)',
        body: '#5221=G54 X, #5222=G54 Y, #5223=G54 Z, #5224=G54 A, #5225=G54 B. Writing to these immediately updates the Work Offset table — the same table you see on the controller screen. Probing macros use this to auto-zero the part after measurement.',
      },
      {
        type: 'warning',
        title: 'Lookahead: use G04 P0 before reading positions',
        body: 'The controller reads ahead 50–100 blocks to plan acceleration. A #100 = #5021 read may execute while the tool is still several moves away. G04 P0 (zero-time dwell) forces the lookahead buffer to flush — all queued moves complete before the position read executes.',
      },
    ],
    prose: [
      'Think of **System Variables (#5000)** as the "Diagnostic Port" on your car. You can use it to see your Speed, RPM, and Fuel level. You can also use it to change the car\'s internal settings (like the radio preset or seat position).',

      '**Read-Only Sensors**: You cannot "Set" your position by writing to #5021. If you try, the machine will ignore you or crash. You only *read* these as "Sensors". You are checking: "Where am I right now?".',

      '**The Offset Table Interface**: This is the most dangerous and powerful part of macros. By writing to #2000 (Tool Lengths) or #5221 (G54 X offset), you can make the machine re-calibrate ITSELF. If a camera sees a part is shifted 0.5 inches, your macro reads the camera data and overwrites #5221 to compensate.',
    ],
  },

  math: {
    prose: [
      'System variables usually correspond to raw 32-bit or 64-bit memory addresses in the PLC/CNC back-end.',
      
      'Standard Fanuc Mapping: \n Work Offset G54 X = #5221 \n Work Offset G54 Y = #5222 \n Work Offset G55 X = #5241 \n ... and so on.',

      'Tool Length Offsets: \n Tool 1 Geometry = #2001 \n Tool 1 Wear = #2101 \n Tool 2 Geometry = #2002',
      
      'When you write `#5221 = 10.0`, the machine immediately updates the Work Offset screen for G54 X to 10.0.',
    ],
  },

  rigor: {
    prose: [
      '**Real-time vs. Lookahead**: This is the most famous bug in advanced CNC programming. Because the machine "Reads Ahead" 100 lines, it might read `#100 = #5021` (Where am I?) while the tool is still 5 inches away! To prevent this, you must use a **Buffer Flush** or "Check Block" (like `G53` or `G04 P0`) to force the machine to stop reading and wait for the motors to catch up.',
      
      '**Alarm Codes**: `#3000` is more than a variable. When the controller sees a value assigned to it, it halts the program, stops the spindle, and displays exactly the text you wrote after it on the screen: `#3000 = 1 (MISSING RADIUS).` This is essential for safety in any custom macro.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-sys-alarm',
      title: 'Validating Input with Alarms',
      problem: 'Write a macro that stops if the radius #1 is zero.',
      code: 'IF [#1 EQ 0] GOTO 1000 \nG02 X1 Y1 R#1 \nM30 \n \nN1000 \n#3000 = 10 (RADIUS CANNOT BE ZERO)',
      steps: [
        { expression: 'IF [#1 EQ 0]', annotation: 'Safety check.' },
        { expression: '#3000 = 10', annotation: 'Trigger machine emergency stop.' },
      ],
      conclusion: 'The machine is now "Protected" against bad user input.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-sys-1',
        type: 'choice',
        text: 'Which range typically stores Machine Axis Positions (G53)?',
        options: ['#1–#33', '#100–#199', '#5000–#5026', '#3000'],
        answer: '#5000–#5026',
      },
      {
        id: 'cnc-sys-2',
        type: 'input',
        text: 'What happens when you set #3000 to a value? ',
        answer: 'The machine stops with an Alarm',
      },
    ]
  },

  mentalModel: [
    '#5000+ = Sensors & Telemetry',
    '#2000+ = Offset Tables',
    '#3000 = Emergency Brake / Message',
  ],
}
