/**
 * LESSON: SETUP AND PROBING
 * Finding edges, setting work coordinates, tool length offsets, and the
 * practical procedure that turns a G-code program into a real part.
 */

export default {
  id: 'cnc-setup-probing',
  slug: 'setup-and-probing',
  chapter: 'cnc-1',
  order: 31,
  title: 'Setup & Probing',
  subtitle: 'Edge Finding, WCS Establishment, Tool Length Offsets, and First-Article Protocol',
  tags: ['edge finder', 'probing', 'WCS', 'G54', 'tool length offset', 'G43', 'H offset', 'Renishaw', 'first article', 'work offset', 'datum'],

  semantics: {
    core: [
      {
        symbol: 'Work Coordinate System (WCS)',
        meaning:
          'The programmable offset that shifts the machine coordinate origin to a convenient reference on the part. ' +
          'G54–G59 are the six standard WCS registers (some machines provide G54.1 P1–P300 for more). ' +
          'When G54 is active, G0 X0 Y0 moves the tool to the WCS origin, not machine home. ' +
          'The WCS offset is stored in the controller and survives power cycles. ' +
          'Changing the WCS values without updating the program is the most common setup error.',
      },
      {
        symbol: 'Mechanical Edge Finder',
        meaning:
          'A spring-loaded cylindrical probe, typically 10 mm diameter, held in the spindle. ' +
          'Spun at 500–1000 RPM. Touched slowly against a part edge until the tip "kicks out" — ' +
          'a visible wobble indicating the spindle centerline is exactly one tool radius from the edge. ' +
          'Record the machine position, add or subtract the radius (5 mm) to get the part edge position. ' +
          'Accuracy: ±0.01–0.02 mm. The workhorse of manual setups.',
      },
      {
        symbol: 'Electronic Edge Finder / Spindle Probe',
        meaning:
          'A strain-gauge or optical probe that triggers a signal when the stylus contacts a surface. ' +
          'Used at slow speed or at zero RPM. Accuracy: ±0.005 mm or better. ' +
          'Renishaw OMP40, OTS (tool setter): the industry standard for automatic probing. ' +
          'On-machine probing macros can fully automate WCS setting, tool measurement, and in-process gauging ' +
          'without the operator touching the machine.',
      },
      {
        symbol: 'G54 (Work Coordinate System 1)',
        meaning:
          'The most common WCS register. Stores X, Y, Z offsets from machine home to the part datum. ' +
          'When programmed, G54 activates these offsets: all subsequent coordinate words are relative to this origin. ' +
          'G54–G59 are the six built-in registers. They are set either manually (operator inputs values) ' +
          'or automatically via probing macros.',
      },
      {
        symbol: 'Tool Length Offset (TLO)',
        meaning:
          'The difference between a reference tool length and the actual tool length. ' +
          'Stored in the H-offset register. G43 H1 activates TLO for tool 1. ' +
          'G49 cancels. When the spindle descends to Z0 with G43 H1 active, the tool tip touches ' +
          'the work surface at Z=0 regardless of the tool\'s physical length. ' +
          'Without TLO, every tool change would require re-zeroing Z.',
      },
      {
        symbol: 'G43 (Tool Length Compensation +)',
        meaning:
          'Activates Tool Length Compensation in the positive direction. ' +
          'Syntax: G43 H[tool number]. Most programs include G43 on the same block as the first Z rapid move. ' +
          'The controller adds the H-register value to all Z-axis positions while G43 is active. ' +
          'G44 is negative compensation (rarely used). G49 cancels both.',
      },
      {
        symbol: 'Tool Length Setter (TLS)',
        meaning:
          'A precision contact block or laser on the machine table that measures tool length automatically. ' +
          'The machine probes the tool, records the Z position at contact, and computes the TLO. ' +
          'Reduces tool-change setup from 2–3 minutes (manual measurement) to 5–10 seconds per tool. ' +
          'Also catches broken tools — if the measured length changed, the tool broke.',
      },
      {
        symbol: 'First Article Inspection',
        meaning:
          'The measurement of the first part off a new program or setup against all drawing dimensions. ' +
          'Not optional for production. A first article catches programming errors, datum errors, ' +
          'and tool-offset errors before they affect an entire batch. ' +
          'Procedure: run the program, measure every critical dimension before starting the batch.',
      },
    ],
    rulesOfThumb: [
      'Never trust a setup you didn\'t verify. Always cut air first (Z raised 50 mm) or use single-block mode on new programs.',
      'Set the WCS from the most repeatable feature on the part — usually a machined face, bore, or precision pin. Never set from a raw (unmachined) surface.',
      'Write the WCS and tool offsets in the traveler (job documentation). If the machine loses power, setup should take minutes to re-enter, not an hour to re-derive.',
      'Always confirm G43 is active before the first Z move into material. A missing G43 means the tool plunges by the wrong amount — usually too deep.',
      'Check the work offset after every tool change on first article. Spindle probing can verify without a separate measurement step.',
      'Set tool length offsets with the same fixturing and workholding as the job. A TLO set on an empty table may differ if the table deflects when the part is loaded.',
    ],
  },

  hook: {
    question: 'A program that ran perfectly on the last job is loaded again — same machine, same material, same tooling. The first move plunges 12 mm too deep and breaks the tool. What happened?',
    realWorldContext:
      'The Tool Length Offset for Tool 1 was accidentally cleared when a different job used that H-register. ' +
      'G43 H1 was active; H1 was 0.000. The tool plunged the full depth without the offset compensation. ' +
      'This is one of the most common and destructive setup errors in CNC machining. ' +
      'It costs a tool, sometimes a vise, sometimes a spindle. ' +
      'This lesson covers the setup procedure that every CNC machinist should be able to execute ' +
      'from memory — and the verification steps that catch errors before they cause crashes.',
  },

  intuition: {
    visualizations: [],
    prose: [
      '**Setup as a Translation Problem**: The G-code programmer writes coordinates relative to a convenient ' +
      'origin on the drawing (usually a corner or center of the part). The machine has its own origin — ' +
      'machine home. The Work Coordinate System (WCS) is the "translation" between these two coordinate systems. ' +
      'Setting up the machine means: (1) physically locating the part with repeatable fixtures, ' +
      '(2) finding the part datum (probing or edge finding), ' +
      '(3) entering the translation offset into G54, and ' +
      '(4) telling the machine how long each tool is (TLO). ' +
      'Everything else is execution of the program in that translated coordinate space.',

      '**Edge Finder Procedure — Step by Step**: ' +
      '1. Install edge finder in spindle (no collet slop). Spin at 600 RPM. ' +
      '2. Lower to part surface height (Z safe above part). ' +
      '3. Jog toward X edge slowly until the tip visibly kicks sideways. ' +
      '4. Record machine X position (e.g., −156.430). ' +
      '5. The part edge is at: −156.430 + 5.000 mm (half the edge finder diameter) = −151.430. ' +
      '6. Enter −151.430 into G54 X (or whatever the programmer offset is). ' +
      '7. Repeat for Y. ' +
      '8. Set Z by touching off with a tool and known Z reference (gage block, paper, or tool setter).',

      '**Tool Length Offset — Two Methods**: ' +
      'Method A (Touch-off to reference surface): jog each tool to Z0 at the work surface, record each Z position. ' +
      'Enter as H-offset. The controller compensates for the difference. ' +
      'Method B (Tool setter block): a precision height-gauge block on the table. ' +
      'Jog the reference tool to contact it, zero the machine Z. ' +
      'Then measure each subsequent tool against the same block. ' +
      'The TLO is the difference. Method B is faster and more consistent for jobs with many tools.',

      '**First Article — The 3-Touch Rule**: Before running quantity, measure: ' +
      '(1) the first surface cut — confirm Z is correct; ' +
      '(2) the first profile cut — confirm X/Y is correct; ' +
      '(3) the first hole — confirm both position and depth. ' +
      'If all three check out, run the job. If one fails, stop, diagnose, and correct the offset. ' +
      'Never run a 50-piece batch before verifying all critical dimensions on piece 1.',

      '**Probing Macros — Automation of Setup**: A Renishaw or Blum probe mounted in the spindle ' +
      'runs a G-code macro that touches the part in 3–6 locations and automatically calculates ' +
      'and sets G54. A typical macro looks like: ' +
      'G65 P9810 Z5.0 (safe positioning macro), then G65 P9811 X0 D10.0 (measure X edge, 10 mm offset) — ' +
      'the result writes directly to G54. The operator no longer needs to do any math. ' +
      'This reduces human error to near-zero for setups and is standard practice in any lights-out environment.',
    ],
  },

  math: {
    prose: [
      '**WCS Offset Calculation**: If the machine home position is at $(X_m, Y_m, Z_m)$ when the ' +
      'spindle center is at the part corner, then the G54 work offset is:',
      '$G54_X = X_m - r_{\\text{edge finder}}, \\quad G54_Y = Y_m - r_{\\text{edge finder}}$',
      'where $r_{\\text{edge finder}}$ is the probe radius (typically 5.000 mm for a 10 mm edge finder). ' +
      'The sign depends on whether you are touching from the positive or negative direction.',

      '**Tool Length Offset Calculation**: For Method A (touch-off to work surface), ' +
      'if the reference tool touches at machine Z position $Z_{ref}$ and a second tool ' +
      'touches at $Z_{tool2}$, then the TLO for tool 2 is:',
      '$H_2 = Z_{ref} - Z_{tool2}$',
      'A positive $H_2$ means tool 2 is shorter than the reference; ' +
      'the controller raises Z to compensate. A negative $H_2$ means tool 2 is longer.',

      '**Datum Shift from Fixture Tilt**: If the workholding tilts the part by angle $\\theta$ about the Y-axis, ' +
      'a feature at distance $L$ from the pivot point shifts by:',
      '$\\Delta X = L \\sin\\theta \\approx L \\theta \\quad \\text{(radians, small angle)}$',
      'For $L = 100\\,\\text{mm}$ and a 0.01 mm shimming error on a 50 mm vise jaw ($\\theta \\approx 0.01/50 = 0.0002\\,\\text{rad}$):',
      '$\\Delta X = 100 \\times 0.0002 = 0.02\\,\\text{mm}$',
      'This explains how a small fixture contamination error propagates to a measurable positional error at the far end of the part.',
    ],
  },

  rigor: {
    prose: [
      '**Machine Warm-Up and Thermal Growth**: Most CNC machine tools change dimensions by 0.01–0.03 mm ' +
      'between a cold start and thermal equilibrium (typically 30–60 min of operation). ' +
      'The spindle bearings and ball screws warm up and expand. ' +
      'Best practice: run a warm-up cycle (spindle at 50% RPM for 15–20 min) before any precision setup. ' +
      'High-end machines have active thermal compensation systems that measure temperature at key points ' +
      'and correct the WCS continuously. Without compensation, morning pieces can differ from afternoon pieces ' +
      'by the width of a human hair — which is enough to fail a ±0.025 mm tolerance.',

      '**Probing Macro Structure — G65 Parametric Calls**: Renishaw macro calls use the G65 format: ' +
      'G65 P[macro O-number] [address letters = variable assignments]. ' +
      'Inside the macro, the address letters map to #1–#26 (A→#1, B→#2, ... Z→#26). ' +
      'The macro reads the current spindle position (#5041, #5042, #5043 for work X/Y/Z) ' +
      'and writes to common variables (#100+) or directly to work offset register via G10: ' +
      'G10 L2 P1 X[#100] sets G54 X to the value in #100. ' +
      'Understanding this allows custom probing macros to be written for any geometry.',

      '**G10 — Programmatic Offset Setting**: Rather than entering work offsets manually, ' +
      'programs can use G10 to set them in the program itself. ' +
      'G10 L2 P1 X10.0 Y20.0 Z-150.0 sets G54 (P1 = G54) to X=10, Y=20, Z=−150. ' +
      'This is used in probing macros and also in pallet-change automation where each pallet ' +
      'has a known offset that the program sets via G10 before each pallet cycle. ' +
      'Knowing G10 separates programmers who hard-code WCS from programmers who automate it.',
    ],
  },

  examples: [
    {
      id: 'ex-setup-wcs-procedure',
      title: 'Full Setup Procedure: Milling a Steel Plate (First Time Setup)',
      problem:
        'A new part program G0001 is to be run. Material: 100 × 80 × 25 mm 1018 steel plate. ' +
        'WCS G54 origin is at the top-left corner of the part, Z0 at the top face. ' +
        'Three tools: T1 face mill, T2 10mm end mill, T3 8.0mm drill. ' +
        'Describe the complete setup procedure.',
      steps: [
        {
          expression: 'Step 1: Mount and align part',
          annotation:
            'Clean vise jaws and parallels. Mount part on parallels, ensure no rocking. ' +
            'Tap down with dead-blow mallet while tightening to prevent jaw lift. ' +
            'Confirm both parallels are solid (non-moving when pressed) before calling setup done.',
        },
        {
          expression: 'Step 2: Find X/Y zero (edge finding)',
          annotation:
            'Install edge finder (10 mm) at 600 RPM. Find left edge: move to part and slowly advance until kick-out. ' +
            'Record machine X (e.g., X = −245.320). G54 X = −245.320 + 5.000 = −240.320. Enter into G54 X. ' +
            'Find front edge: same procedure in Y. G54 Y = machine Y − 5.000 at front edge. Enter into G54 Y.',
        },
        {
          expression: 'Step 3: Set Z zero (touch-off)',
          annotation:
            'Install T1 (face mill). Lower Z until a 0.050 mm feeler gauge slides snugly under the tool. ' +
            'Or: use a 50.000 mm gage block; lower until tool touches block top. ' +
            'Record machine Z position. G54 Z = machine Z + block height (or − feeler thickness). ' +
            'Set G54 Z. Note: this is the Z for T1 only at this point.',
        },
        {
          expression: 'Step 4: Measure and enter Tool Length Offsets',
          annotation:
            'With T1 as reference (TLO = 0.000 or measured absolute), measure T2 and T3 against the tool setter. ' +
            'Example: T1 touches setter at Z=−285.000. T2 touches at Z=−287.500. H2 = −285.000 − (−287.500) = +2.500. ' +
            'T2 is 2.5 mm shorter than T1. Enter H2=2.500 in tool offset register 2. ' +
            'Repeat for T3. Verify all H-registers before first run.',
        },
        {
          expression: 'Step 5: Run first article (single-block, Z+50 offset)',
          annotation:
            'Add a temporary Z+50.0 to G54 Z. Select SINGLE BLOCK. Press CYCLE START. ' +
            'Verify each rapid move stays clear. Verify tool changes happen correctly. ' +
            'Remove the Z offset. Run piece 1 at 50% feed override. Stop after first cut, measure. ' +
            'Confirm Z depth, X position, and Y position before running full speed.',
        },
      ],
    },
  ],

  mastery: {
    checkpoints: [
      'What does G43 H2 do? What happens if you forget G43 on the first Z move?',
      'You touch-off with a 10 mm edge finder and the machine X reads −152.750. What do you enter into G54 X if the programmer set X0 at the left edge of the part?',
      'Two machinists set up the same job. Machinist A sets TLOs with the machine cold. Machinist B waits 20 minutes for warm-up. After 2 hours, whose parts are more likely to drift? Why?',
      'What is G10 L2 P1 X0 Y0 Z-180.0 doing? In what context would this appear in a program?',
      'A part probing macro measures the center of a 20 mm bore at X=14.832, Y=−3.105 (machine coordinates). The programmer wants WCS G54 origin at this bore center. What do you enter into G54?',
      'Why should you never set G54 Z from a raw unmachined part surface?',
    ],
  },
}
