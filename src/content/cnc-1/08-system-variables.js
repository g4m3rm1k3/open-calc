export default {
  id: 'cnc-system-variables',
  slug: 'system-variables',
  chapter: 'cnc-1',
  order: 7,
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
        caption: 'Look at the MACROS tab. #100 and #101 will grab values directly from the machine’s internal encoders (#5021). If the machine doesn’t reach X5.0, the "Smart Macro" triggers alarm #3000.'
      }
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
