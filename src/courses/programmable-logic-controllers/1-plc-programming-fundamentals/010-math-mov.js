export default {
  id: 'plc0-010',
  slug: 'math-mov',
  chapter: 'plc0',
  order: 10,
  title: 'Math Instructions and MOV',
  subtitle: 'ADD, SUB, MUL, DIV, and MOV — scaling sensor values, calculating totals, and moving data between tags.',
  tags: ['MOV', 'ADD', 'SUB', 'MUL', 'DIV', 'math instruction', 'scaling', 'engineering units', 'analog scaling', 'data move', 'integer math'],
  aliases: 'MOV ADD SUB MUL DIV math instruction scaling engineering units analog move',
  timeToComplete: 22,
  coreConcept: "Math instructions (ADD, SUB, MUL, DIV) and MOV perform arithmetic and data transfer when their rung is true. They take Source A, Source B (for math), and write to a Destination tag. These are the tools for converting raw analog counts to engineering units, calculating totals and rates, implementing setpoint arithmetic, and building simple control calculations.",
  prerequisites: ['plc0-009'],
  nextLesson: null,

  hook: {
    question: "A 4–20mA pressure transmitter covers 0–200 PSI. The PLC analog input module outputs raw counts 0–32767. The HMI must display pressure in PSI, a high alarm must trigger above 150 PSI, and the system must log total PSI-hours for wear calculation. None of these can be done in raw counts. How does the PLC convert raw counts to useful values, do arithmetic on them, and store results?",
    realWorldContext: "Math instructions transform a PLC from a relay replacement into an intelligent process controller. Without them, you'd be comparing raw ADC counts (like 24575) instead of engineering values (like 150 PSI) — making programs unreadable and unsafe to modify. Every analog-connected PLC uses math instructions for scaling. Every machine that calculates cycle times, part rates, or material totals uses ADD and MUL. Every recipe-driven system uses MOV to load setpoints into timer PRE and counter preset tags. Math instructions are used in literally every non-trivial PLC program.",
  },

  mentalModel: [
    "**Math instructions are coil-type, conditioned by rung power.** ADD(A, B, DEST) only executes when the rung is true. If the rung is false, DEST keeps its previous value. This is intentional: you can conditionally apply math (only calculate when in auto mode, for example). It also means: if you want continuous calculation (every scan), put the math instruction with always-true conditions — or just a direct connection with no contacts blocking it.",
    "**Integer math truncates, not rounds.** DIV(7, 2, RESULT) gives RESULT=3, not 3.5. The PLC discards the fractional part. This means scaling formulas need to be ordered carefully — multiply before you divide to preserve precision. DIV(MUL(7,10),2) = DIV(70,2) = 35 (representing 3.5 × 10), whereas DIV(7,2) = 3, then MUL(3,10) = 30 — wrong. When precision matters, scale up by a factor of 10 or 100 to simulate fixed-point arithmetic.",
    "**MOV is assignment.** MOV(SOURCE, DEST) copies a value to a destination tag. Used for: loading constants into tags (MOV(500, TIMER1.PRE)), copying one tag's value to another (MOV(RECIPE_SETPOINT, ACTIVE_SETPOINT)), initializing tags at startup (FIRST_SCAN rung with MOV instructions), and clearing tags (MOV(0, FAULT_COUNT)).",
  ],

  intuition: {
    prose: [
      "**ADD instruction.** ADD(SOURCE_A, SOURCE_B, DEST) computes DEST = SOURCE_A + SOURCE_B. Either source can be a tag or a numeric constant. Common uses: incrementing a counter manually (ADD(MY_COUNT, 1, MY_COUNT) — but CTU is preferred), accumulating totals (ADD(DAILY_TOTAL, BATCH_SIZE, DAILY_TOTAL)), calculating positions (ADD(HOME_POSITION, OFFSET, TARGET_POSITION)).",
      "**SUB instruction.** SUB(SOURCE_A, SOURCE_B, DEST) computes DEST = SOURCE_A − SOURCE_B. Common uses: calculating remaining time (SUB(TOTAL_TIME, ELAPSED, REMAINING)), calculating error (SUB(SETPOINT, ACTUAL, ERROR)), range checks (SUB(ACTUAL, SETPOINT, DEVIATION), then compare DEVIATION to allowed range).",
      "**MUL instruction.** MUL(SOURCE_A, SOURCE_B, DEST) computes DEST = SOURCE_A × SOURCE_B. Integer overflow is possible — if A=30000 and B=3, result is 90000 which overflows INT (max 32767). Use DINT for MUL results when overflow is possible. Common uses: scaling (MUL(RAW_COUNT, EU_SPAN, SCALED) before dividing), calculating area or volume, converting units (MUL(FEET, 12, INCHES)).",
      "**DIV instruction.** DIV(SOURCE_A, SOURCE_B, DEST) computes DEST = SOURCE_A ÷ SOURCE_B (integer, truncated toward zero). Division by zero faults the CPU — always check the divisor is nonzero before dividing (use NEQ(DIVISOR, 0) or GRT(DIVISOR, 0) as a condition on the DIV rung). Common uses: scaling (DIV(RAW_SCALED, MAX_RAW, EU_VALUE)), rate calculation (DIV(PARTS_COUNT, ELAPSED_SECONDS, PARTS_PER_SECOND)).",
      "**The 4–20mA scaling formula.** Raw = 0–32767, representing 4–20mA. Engineering range = EU_MIN to EU_MAX. Scaling formula: EU_VALUE = EU_MIN + (RAW × (EU_MAX − EU_MIN)) ÷ 32767. In PLC integer math (multiply before divide): Step 1: SUB(EU_MAX, EU_MIN, EU_SPAN). Step 2: MUL(RAW, EU_SPAN, SCALED). Step 3: DIV(SCALED, 32767, EU_VALUE). Step 4: ADD(EU_VALUE, EU_MIN, EU_VALUE). This keeps precision by multiplying first. For 0–200 PSI with raw 0–32767: EU_SPAN = 200; SCALED = RAW × 200; EU_VALUE = SCALED ÷ 32767 = RAW × 200 ÷ 32767.",
      "**MOV for dynamic setpoints.** Timer preset (.PRE) and counter preset (.PRE) can be changed at runtime by writing to them with MOV. MOV(RECIPE_FILL_TIME, FILL_TIMER.PRE) loads a recipe's fill time into the timer preset — the timer now runs for the recipe's duration. When the recipe changes, the next MOV updates the preset for the next cycle. This is the basis for recipe management systems: one program, dozens of recipes, setpoints loaded dynamically.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Math Instruction Format',
        body: 'All math instructions follow the same format:\n\nINSTRUCTION(\n  Source A: tag or constant,\n  Source B: tag or constant (not for MOV),\n  Destination: tag (writable)\n)\n\nExamples:\n  ADD(TANK_A_LEVEL, TANK_B_LEVEL, TOTAL_LEVEL)\n  SUB(SETPOINT, ACTUAL_SPEED, SPEED_ERROR)\n  MUL(FLOW_RATE, ELAPSED_SEC, TOTAL_VOLUME)\n  DIV(TOTAL_VOLUME, 1000, TOTAL_LITERS)\n  MOV(250, BATCH_TIMER.PRE)\n\nAll execute when rung power = true.\nDestination can be the same as Source A (in-place modification): ADD(COUNT, 1, COUNT).',
      },
      {
        type: 'procedure',
        title: 'Scaling a 4–20mA Input to Engineering Units',
        body: 'For a 0–100 PSI transmitter on a module giving 0–32767 counts:\n\nRung 1 — Scale to PSI (integer ×10 for 0.1 PSI resolution):\n[always true] → MUL(PRESS_RAW, 1000, PRESS_SCALED)\n  PRESS_SCALED = RAW × 1000\n\nRung 2:\n[always true] → DIV(PRESS_SCALED, 32767, PRESS_PSI_X10)\n  PRESS_PSI_X10 = (RAW × 1000) ÷ 32767 → range 0–1000 (representing 0.0–100.0 PSI)\n\nRung 3 — Display value (÷10 for HMI):\n[always true] → DIV(PRESS_PSI_X10, 10, PRESS_PSI)\n  PRESS_PSI = 0–100 PSI integer for HMI display\n\nResult: PRESS_PSI_X10 has 0.1 PSI resolution for internal comparisons. PRESS_PSI has 1 PSI resolution for display. Use PRESS_PSI_X10 in threshold comparisons: GEQ(PRESS_PSI_X10, 900) = above 90.0 PSI.',
      },
      {
        type: 'insight',
        title: 'Integer Math Gotcha: Overflow and Truncation',
        body: 'Two common bugs:\n\n**Overflow:** MUL(30000, 3, RESULT) on an INT tag. 30000 × 3 = 90000, which overflows INT (max 32767). Result wraps to 90000 − 65536 = 24464. Wrong answer, no error flag. Fix: use DINT destination tags for any multiplication result that might exceed 32767.\n\n**Truncation order:** To calculate (RAW × 100) ÷ 32767:\n- WRONG: DIV(RAW, 32767, TEMP) → MUL(TEMP, 100, RESULT). At RAW=5000: DIV=0, MUL=0. Lost precision.\n- RIGHT: MUL(RAW, 100, TEMP) → DIV(TEMP, 32767, RESULT). At RAW=5000: MUL=500000, DIV=15. Correct.\n\nRule: always multiply before dividing. The intermediate result may be large (use DINT), but you preserve resolution.',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'Analog Scaling with Math Instructions',
        mathBridge: 'Change SENSOR_RAW in the Tags tab. Rung 1 multiplies by 100 (EU span). Rung 2 divides by 32767 to get PRESS_PSI (0–100 range). Rung 3 shows ADD. Rung 4 is a MOV loading a setpoint. Watch how changing SENSOR_RAW flows through the math chain to update PRESS_PSI each scan.',
        initialProps: {
          program: [
            [
              { type: 'MOV', src: 'SENSOR_RAW', dst: 'SCALED_STEP1', label: 'Copy raw' },
            ],
            [
              { type: 'MUL', tagA: 'SENSOR_RAW', tagB: 100, dst: 'PRESS_X100', label: 'Multiply ×100' },
            ],
            [
              { type: 'DIV', tagA: 'PRESS_X100', tagB: 32767, dst: 'PRESS_PSI', label: 'Divide ÷32767' },
            ],
            [
              { type: 'ADD', tagA: 'PRESS_PSI', tagB: 'PRESS_OFFSET', dst: 'PRESS_CORRECTED', label: 'Add offset' },
            ],
            [
              { type: 'GEQ', tagA: 'PRESS_CORRECTED', tagB: 80 },
              { type: 'OTE', tag: 'HIGH_PRESS_ALARM', label: 'High Press >80 PSI' },
            ],
          ],
          tags: {
            SENSOR_RAW: { type: 'INT', value: 16000 },
            SCALED_STEP1: { type: 'INT', value: 0 },
            PRESS_X100: { type: 'INT', value: 0 },
            PRESS_PSI: { type: 'INT', value: 0 },
            PRESS_OFFSET: { type: 'INT', value: 2 },
            PRESS_CORRECTED: { type: 'INT', value: 0 },
            HIGH_PRESS_ALARM: { type: 'BOOL', value: false },
          },
          inputs: [],
          outputs: [
            { tag: 'HIGH_PRESS_ALARM', label: 'High Press Alarm' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Fixed-point arithmetic.** PLCs work with integers, not floating point (some modern CPUs support REAL/FLOAT, but older PLCs and many simpler CPUs use INT only). Fixed-point arithmetic uses integers where the programmer tracks an implicit decimal point. Storing temperature as tenths of a degree: 185 represents 18.5°C. Operations: add works naturally (185 + 15 = 200 = 20.0°C). Multiply two fixed-point numbers: multiply the numbers then divide by the scaling factor. (185 × 10 = 1850 tenths, divide by 10 = 185 — wait, to multiply 18.5°C × 2.0 gain: 185 × 20 = 3700 (tenths × tenths = hundredths), divide by 10 = 370 tenths = 37.0°C). Fixed-point requires careful tracking of units at each step.",
      "**Batch calculation example.** Recipe: add 50 kg of ingredient A, 30 kg of B, 20 kg of C. Total batch = 100 kg. Ingredient A percentage: (50 ÷ 100) × 100 = 50%. PLC calculation: ADD(A_WEIGHT, B_WEIGHT, TEMP). ADD(TEMP, C_WEIGHT, TOTAL_WEIGHT). MUL(A_WEIGHT, 100, A_PCT_SCALED). DIV(A_PCT_SCALED, TOTAL_WEIGHT, A_PCT). This gives integer percent 0–100. For 0.1% resolution: MUL by 1000, divide by TOTAL_WEIGHT, gives 0–1000 (representing 0.0–100.0%).",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A flow meter outputs 0–32767 counts for 0–500 L/min. Write the MOV and math rungs to scale RAW_FLOW to FLOW_LPM (liters per minute, 0–500 integer).',
      hint: 'EU_SPAN = 500. Formula: FLOW_LPM = RAW × 500 ÷ 32767. Multiply before dividing.',
      walkthrough: [
        'EU span = 500 L/min. Min = 0 (so no offset addition needed).',
        'Scale formula: FLOW_LPM = RAW_FLOW × 500 ÷ 32767.',
        'Step 1: Multiply (to preserve precision before dividing):',
        'Rung 1: [MUL(RAW_FLOW, 500, FLOW_SCALED)]',
        '  FLOW_SCALED could be up to 32767 × 500 = 16,383,500 — use DINT!',
        'Step 2: Divide to get engineering units:',
        'Rung 2: [DIV(FLOW_SCALED, 32767, FLOW_LPM)]',
        '  FLOW_LPM = 0–500 integer.',
        'Verification at RAW=16384 (≈50% of full scale):',
        '16384 × 500 = 8,192,000; ÷32767 = 250 L/min. Correct (50% of 500).',
        'Note: FLOW_SCALED must be DINT. If it were INT, 16384 × 500 = 8,192,000 would overflow.',
      ],
      answer: 'Rung 1: MUL(RAW_FLOW, 500, FLOW_SCALED). Rung 2: DIV(FLOW_SCALED, 32767, FLOW_LPM). Use DINT for FLOW_SCALED to prevent overflow.',
      difficulty: 'easy',
    },
    {
      problem: 'A recipe system has 4 recipes. Each recipe has a different mix time (seconds): Recipe 1=120s, Recipe 2=180s, Recipe 3=90s, Recipe 4=240s. RECIPE_SELECT (1–4) is set by the operator. Write MOV logic to load the correct time (in ms) into MIX_TIMER.PRE. Use comparison instructions to select the correct value.',
      hint: 'Four EQU conditions, each with a MOV loading a specific ms value. 120s = 120000ms.',
      walkthrough: [
        'Recipe time in milliseconds:',
        'Recipe 1: 120s = 120000ms',
        'Recipe 2: 180s = 180000ms',
        'Recipe 3: 90s = 90000ms',
        'Recipe 4: 240s = 240000ms',
        'Rung 1: [EQU(RECIPE_SELECT, 1)] → MOV(120000, MIX_TIMER.PRE)',
        'Rung 2: [EQU(RECIPE_SELECT, 2)] → MOV(180000, MIX_TIMER.PRE)',
        'Rung 3: [EQU(RECIPE_SELECT, 3)] → MOV(90000, MIX_TIMER.PRE)',
        'Rung 4: [EQU(RECIPE_SELECT, 4)] → MOV(240000, MIX_TIMER.PRE)',
        'Each scan: the matching EQU fires and MOV loads the correct preset into the timer.',
        'Only one EQU can be true at a time (RECIPE_SELECT has exactly one value).',
        'Important: these rungs run every scan, so MIX_TIMER.PRE is continuously refreshed to the recipe value. If a recipe changes mid-cycle, the timer PRE changes immediately — may or may not be desired. For recipe-locked operation, add XIO(MIX_TIMER.EN) to prevent updating while timer is running.',
      ],
      answer: 'Four rungs: EQU(RECIPE_SELECT, N) → MOV(time_ms, MIX_TIMER.PRE) for N=1–4. Add XIO(MIX_TIMER.EN) to prevent mid-cycle changes.',
      difficulty: 'medium',
    },
    {
      problem: 'A liquid filling machine fills 473ml containers. The fill nozzle flow rate is approximately 200ml/second. You need to: (1) calculate how many milliseconds to run the fill valve (FILL_TIME_MS = 473 ÷ 200 × 1000), (2) handle that integer math gives 2000ms not 2365ms, and (3) design a calibration system where ACTUAL_FILL_VOL (measured by a scale after filling) adjusts FILL_TIME_MS. Write the math rungs.',
      hint: 'For step 2: use MUL(473, 1000, TEMP) then DIV(TEMP, 200, FILL_TIME_MS) = 2365ms. For step 3: calculate actual flow rate from the measured volume and adjust.',
      walkthrough: [
        'Step 1: Calculate fill time (multiply first to avoid truncation):',
        'Rung 1: MUL(TARGET_VOL_ML, 1000, FILL_CALC_TEMP)',
        '  FILL_CALC_TEMP = 473 × 1000 = 473000 (DINT).',
        'Rung 2: DIV(FILL_CALC_TEMP, FLOW_RATE_ML_SEC, FILL_TIME_MS)',
        '  FILL_TIME_MS = 473000 ÷ 200 = 2365ms. Correct!',
        '(Wrong approach: DIV(473, 200, TEMP) = 2, then MUL(2, 1000) = 2000ms. Off by 365ms = 15% error!)',
        'Step 3: Calibration — adjust for actual flow rate:',
        'After a fill cycle: ACTUAL_FILL_VOL is measured by scale.',
        'Calculate actual flow rate:',
        'Rung 3: MUL(ACTUAL_FILL_VOL, 1000, FLOW_CALC_TEMP)',
        'Rung 4: DIV(FLOW_CALC_TEMP, FILL_TIME_MS, ACTUAL_FLOW_RATE)',
        '  ACTUAL_FLOW_RATE = measured ml/sec.',
        'Update fill time for next cycle:',
        'Rung 5: MUL(TARGET_VOL_ML, 1000, FILL_CALC_TEMP)',
        'Rung 6: DIV(FILL_CALC_TEMP, ACTUAL_FLOW_RATE, FILL_TIME_MS)',
        '  FILL_TIME_MS now based on actual (calibrated) flow rate.',
        'This self-calibrating system adapts to flow rate changes (pressure drop, viscosity, temperature).',
      ],
      answer: 'Correct: MUL(473,1000,TEMP) then DIV(TEMP,200,FILL_TIME_MS) = 2365ms. Wrong: DIV(473,200) = 2, MUL(2,1000) = 2000ms. Always multiply before dividing. Calibration: recalculate FLOW_RATE from actual volume, update FILL_TIME_MS each cycle.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Parts-per-minute rate display',
      problem: 'A conveyor counts parts with a sensor (PART_CTR.ACC). A 60-second timer (RATE_TMR) times the counting window. When the timer completes, calculate parts per minute and reset for the next window.',
      solution: 'Rung 1 — Rate timer:\n[always true] → TON(RATE_TMR, PRE=60000)\n\nRung 2 — Calculate rate when timer completes:\n[XIC(RATE_TMR.DN)] → MOV(PART_CTR.ACC, PARTS_PER_MIN)\n  Copy the accumulated count — this IS the parts-per-minute (counted in 60s = 1 minute).\n  No division needed! Count in 60 seconds = count per minute.\n\nRung 3 — Reset counter and timer:\n[XIC(RATE_TMR.DN)] → RES(PART_CTR)\n[XIC(RATE_TMR.DN)] → RES(RATE_TMR)\n  Reset both at end of window to start fresh.\n\nFor finer time windows (e.g., 10 seconds), divide by the window fraction:\nPARTS_PER_MIN = COUNT_IN_10S × 6.\nRung: MUL(PART_CTR.ACC, 6, PARTS_PER_MIN) (when RATE_TMR.DN with 10000ms PRE).\n\nResult: PARTS_PER_MIN is updated every minute with the exact parts counted. Display on HMI directly. Log to a DINT accumulator for shift total: ADD(SHIFT_TOTAL, PARTS_PER_MIN, SHIFT_TOTAL) triggered each minute.',
    },
    {
      title: 'Recipe setpoint loading',
      problem: 'A blending system has 5 ingredients with different fill times per recipe. ACTIVE_RECIPE (1–3) selects the recipe. Each recipe has different fill times for ingredients A–E. Use MOV to load the correct fill times.',
      solution: 'Design approach: store setpoints in arrays (or individual tags per recipe).\n\nTag structure:\n  FILL_TIME_A[1..3] — array of fill times for ingredient A\n  ... etc. for B, C, D, E\n\nOR flat tags:\n  R1_FILL_A = 3000, R1_FILL_B = 5000, ...\n  R2_FILL_A = 2500, R2_FILL_B = 7000, ...\n\nLoading rungs (one set per recipe):\nRung: [EQU(ACTIVE_RECIPE, 1)] →\n  MOV(R1_FILL_A, FILL_TMR_A.PRE)\n  MOV(R1_FILL_B, FILL_TMR_B.PRE)\n  ... (5 MOV instructions, or inline with multiple output elements)\n\nRung: [EQU(ACTIVE_RECIPE, 2)] → MOV chain for recipe 2.\nRung: [EQU(ACTIVE_RECIPE, 3)] → MOV chain for recipe 3.\n\nIn modern PLCs (ControlLogix), arrays and CPS (Copy File) instructions make this cleaner: one CPS copies an entire recipe array to the active setpoint array in one instruction. But the EQU + MOV pattern works on any PLC and is the foundation of all recipe management.',
    },
  ],
};
