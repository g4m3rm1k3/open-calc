export default {
  id: 'logic0-008',
  slug: 'number-systems',
  chapter: 'logic0',
  order: 8,
  title: 'Number Systems and Data Types',
  subtitle: 'Binary, hexadecimal, BCD, and the data types you\'ll see in every PLC — why they exist and how to convert between them.',
  tags: ['binary', 'hexadecimal', 'BCD', 'two\'s complement', 'data types', 'INT', 'DINT', 'REAL', 'bitwise operations', 'number conversion'],
  aliases: 'binary hex hexadecimal BCD two complement data types INT DINT REAL bit byte word conversion PLC',
  timeToComplete: 20,
  coreConcept: "Computers store everything as binary. Hexadecimal is binary written compactly — 1 hex digit = 4 bits. Two's complement represents negative integers without a special sign bit. PLC data types (BOOL, INT, DINT, REAL) are direct mappings to these binary representations. Understanding this lets you read and manipulate PLC registers, fault codes, and I/O status words directly.",
  prerequisites: ['logic0-007'],
  nextLesson: null,

  hook: {
    question: "A Fanuc CNC alarm code reads '1000' in the register, but the alarm description says 'Axis overtravel.' In the fault log you see 0x0400. A different machine shows fault 0b0100_0000_0000 on the diagnostic screen. Are these three different faults, or the same fault expressed three ways?",
    realWorldContext: "PLC and CNC diagnostic registers pack multiple bits of status into a single integer. Alarm 0x0400 means bit 10 is set (0x0400 = 0b0100_0000_0000 = 1024 decimal). All three representations are the same value — but you need to be fluent in all three to read them. More importantly, PLC programs use bitwise AND to extract individual status bits from status words, bitwise OR to set bits, and shift operations to pack/unpack values. Fanuc PMC uses byte-addressed memory (G/F/Y/X registers) with individual bit addressing. Allen-Bradley uses data type INT with bit overlays. Siemens S7 uses WORD with bit extraction instructions. None of these make sense until you understand binary.",
  },

  mentalModel: [
    "**Hexadecimal is just grouped binary.** Four bits make one hex digit. Read binary in groups of 4 from the right and convert each group independently. 1010_0011 → A3. You don't need to convert through decimal — hex is a compact notation for binary, not a different number. When a register shows 0x1A, you instantly know bits 4, 3, and 1 are set.",
    "**Two's complement is how negative numbers work in hardware.** To negate: flip all bits, add 1. This makes subtraction identical to addition in hardware (no separate subtractor circuit needed). The most significant bit is the sign bit: 0 = positive, 1 = negative. An 8-bit INT can represent -128 to +127. A 16-bit INT: -32768 to +32767. Overflow wraps around — 127 + 1 = -128 in signed 8-bit arithmetic.",
    "**Data types are contracts about interpretation.** The same 16 bits can be interpreted as an unsigned INT (0–65535), a signed INT (-32768–+32767), or two separate bytes with different meanings. The PLC's data type declaration is the contract that says how to interpret those bits. Mismatching the data type to the actual content is one of the most common PLC programming errors.",
  ],

  intuition: {
    prose: [
      "**Binary — base 2 positional notation.** Each bit position represents a power of 2. From right to left: 2⁰=1, 2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32, 2⁶=64, 2⁷=128. To convert binary to decimal: add the values of all positions that have a 1 bit. 1011_0100 = 128+32+16+4 = 180. To convert decimal to binary: repeatedly divide by 2, collect the remainders from bottom to top.",
      "**Hexadecimal — base 16 with letters.** Digits: 0–9 then A(10), B(11), C(12), D(13), E(14), F(15). The prefix 0x (or sometimes #) marks a hex number. To convert hex to binary: replace each hex digit with its 4-bit binary equivalent. 0x3F: 3→0011, F→1111 → 0011_1111. To convert binary to hex: group 4 bits from the right, convert each group. 0110_1100: 0110→6, 1100→C → 0x6C. Hex is used in PLC and CNC documentation because it makes bit patterns readable: 0xFF immediately tells you all 8 bits are set; 0x0F tells you only the lower nibble is set.",
      "**BCD — Binary Coded Decimal.** Each decimal digit is encoded separately in 4 bits (0000=0 through 1001=9, the combinations 1010–1111 are unused). The decimal number 47 in BCD: 0100_0111. BCD is not the same as binary: 47 in binary is 0010_1111 (47 = 32+8+4+2+1). Older PLCs (and some Fanuc NC parameters) store values in BCD because it's easier to drive BCD-to-7-segment display decoder chips directly. If you read a 'number' from a BCD register and interpret it as binary, you get the wrong answer.",
      "**Two's complement negative numbers.** Signed integers use the top bit as a sign bit. To convert -N to its binary representation: take the binary of +N, flip all bits (ones' complement), add 1. Example: -5 in 8-bit: +5 = 0000_0101, flip = 1111_1010, add 1 = 1111_1011. To verify: the value 1111_1011 interpreted as two's complement = -(flip+1) = -(0000_0100+1) = -(0000_0101) = -5. Key property: 0 + (-0) should equal 0. 0000_0000 + 1111_1111 + carry = 0000_0000 with carry discarded. ✓",
      "**PLC data types.** BOOL: 1 bit (0 or 1). BYTE: 8 bits unsigned (0–255). INT: 16 bits signed two's complement (-32768 to +32767). DINT: 32 bits signed (-2,147,483,648 to +2,147,483,647). REAL: 32-bit IEEE 754 floating point (±3.4×10³⁸, 7 decimal digits precision). LINT: 64 bits signed. Fanuc NC parameters use INT and DINT. Allen-Bradley L5x uses these exact IEC names. Siemens S7: INT (16-bit), DINT (32-bit), REAL. The names are standardized by IEC 61131-3.",
      "**Bitwise operations on PLC words.** AND a register with a mask to extract specific bits: Status AND 0x00FF gives the lower 8 bits. OR a register with a mask to set specific bits: Flags OR 0x0010 sets bit 4. XOR with a mask to toggle bits. SHIFT LEFT multiplies by powers of 2; SHIFT RIGHT divides (with sign extension for signed values). These operations are used constantly to pack/unpack multiple Boolean values into a single register, read Fanuc macro variables, and process communication protocol bytes.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Quick Conversion Reference',
        body: 'Binary → Hex: group 4 bits from right, convert each group\nHex → Binary: expand each hex digit to 4 bits\n\nPowers of 2 (memorize these):\n2⁰=1, 2¹=2, 2²=4, 2³=8, 2⁴=16, 2⁵=32, 2⁶=64, 2⁷=128\n2⁸=256, 2⁹=512, 2¹⁰=1024, 2¹¹=2048, 2¹²=4096\n2¹⁶=65536, 2³²≈4.3 billion\n\nHex digits:\n0→0000  4→0100  8→1000  C→1100\n1→0001  5→0101  9→1001  D→1101\n2→0010  6→0110  A→1010  E→1110\n3→0011  7→0111  B→1011  F→1111',
      },
      {
        type: 'definition',
        title: 'PLC Data Type Ranges',
        body: '**BOOL:** 0 or 1\n**BYTE:** 0 to 255 (8-bit unsigned)\n**SINT:** -128 to +127 (8-bit signed)\n**INT:** -32,768 to +32,767 (16-bit signed)\n**UINT:** 0 to 65,535 (16-bit unsigned)\n**DINT:** -2,147,483,648 to +2,147,483,647 (32-bit signed)\n**UDINT:** 0 to 4,294,967,295 (32-bit unsigned)\n**REAL:** ±3.4×10³⁸ (32-bit IEEE 754, ~7 sig figs)\n**LREAL:** ±1.8×10³⁰⁸ (64-bit IEEE 754, ~15 sig figs)\n\nUnderflow/overflow wraps silently in most PLCs — always check that calculated values fit in the destination type.',
      },
      {
        type: 'insight',
        title: 'Status Word Bit Extraction in PLC Logic',
        body: 'Fanuc PMC G/F registers are 8-bit bytes, each bit addressable: G.1.5 = G register byte 1, bit 5.\n\nAllen-Bradley: INT tag "Status" has bit-level access via Status.4 (bit 4 of Status).\n\nBitwise AND to test a bit in a math context:\n`Status AND 16#0010` = nonzero if bit 4 is set\n(16#0010 = 0x0010 = bit 4 mask)\n\nCommon Fanuc NC status registers (read by PMC):\n- F1: running status (bit 3 = servo ready)\n- F2: mode status (bit 0 = MDI mode)\n- G8: axis override (percent, BCD or binary depending on parameter)\n\nKnowing binary lets you decode these from NC diagnostic screens directly.',
      },
      {
        type: 'warning',
        title: 'Integer Overflow and PLC Arithmetic',
        body: 'Most PLCs do NOT throw exceptions on integer overflow — they silently wrap. An INT (16-bit signed) counting up from 32,767: the next increment gives -32,768. This is mathematically correct (two\'s complement wrapping) but almost always a bug in PLC logic.\n\nCommon overflow scenarios:\n- Counter without reset reaches max INT and wraps to minimum\n- Intermediate calculation in a math rung overflows before being stored\n- Timer accumulated value overflows on a very long run\n\nFix: use DINT for accumulators that might be large. Add range-check rungs before math operations if inputs are unbounded. For counters, use DINT CTU tags.',
      },
    ],
    visualizations: [
      {
        id: 'NumberConverter',
        title: 'Number System Converter',
        mathBridge: 'Enter a decimal number and watch it convert live to binary, hex, and BCD. Switch to 8-bit mode and see all bit positions. Enter 255 — all bits become 1 (0xFF = 1111 1111). Enter 170 (0xAA) — alternating bits. This is how PLCs store and address register values.',
      },
    ],
  },

  math: {
    prose: [
      "**IEEE 754 floating point format (32-bit REAL).** A REAL is stored as:\n\n$$\\text{Value} = (-1)^s \\times 1.\\text{mantissa} \\times 2^{\\text{exponent} - 127}$$\n\nBit 31: sign (s). Bits 30–23: exponent (biased by 127). Bits 22–0: mantissa (fractional part). The leading 1 of the mantissa is implicit (not stored).\n\n1.0: sign=0, exponent=127 (0111_1111), mantissa=0 → 0x3F800000\n\nThis explains why REAL arithmetic has precision limits: 0.1 cannot be represented exactly in binary floating point (like 1/3 in decimal). For PLC position counters, use scaled DINT (e.g., 0.001mm units stored as DINT micrometers) rather than REAL to avoid accumulated rounding error.",
      "**Sign extension.** When converting a smaller signed type to a larger one, the sign bit is replicated to fill the additional bits. Signed 8-bit -5 = 1111_1011. Extended to 16-bit: 1111_1111_1111_1011 (still -5). This preserves the value. Zero extension (for unsigned) fills with zeros instead. Getting the wrong extension type is a source of subtle bugs when moving data between different-width registers.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'Convert 0b10110101 (8-bit binary) to hexadecimal. Show the nibble grouping.',
      hint: 'Split the 8 bits into two groups of 4 (nibbles), starting from the right. Convert each nibble independently.',
      walkthrough: [
        'Write the 8-bit binary: 1011 0101',
        'Split into two nibbles: 1011 | 0101',
        'Convert left nibble (1011): 8+0+2+1 = 11 = B in hex.',
        'Convert right nibble (0101): 0+4+0+1 = 5 in hex.',
        'Combine: 0xB5',
        'Verify: 0xB5 = 11×16 + 5 = 176+5 = 181 decimal. Check binary: 128+32+16+4+1 = 181. ✓',
      ],
      answer: '0xB5 (nibbles: 1011 = B, 0101 = 5)',
      difficulty: 'easy',
    },
    {
      problem: 'A Fanuc PMC alarm register reads 0x0840. Which bits are set? List each set bit number (counting from bit 0 at the right).',
      hint: 'Convert 0x0840 to binary by expanding each hex digit to 4 bits. Then identify which bit positions have a 1.',
      walkthrough: [
        'Expand each hex digit to 4 bits:',
        '0 → 0000',
        '8 → 1000',
        '4 → 0100',
        '0 → 0000',
        'Full binary (16 bits): 0000 1000 0100 0000',
        'Number the bits from 0 (rightmost) to 15 (leftmost).',
        'Scanning from right: bits 6, 11 are set.',
        'Bit 6: position value = 2⁶ = 64 = 0x0040. ✓',
        'Bit 11: position value = 2¹¹ = 2048 = 0x0800. ✓',
        '0x0040 + 0x0800 = 0x0840. ✓',
      ],
      answer: 'Bits 6 and 11 are set.',
      difficulty: 'medium',
    },
    {
      problem: 'An INT (16-bit signed) counter reaches its maximum value of 32,767 and the program increments it by 1. What value does it hold next? Convert this to hex and binary. Explain what happened and how to prevent it.',
      hint: 'Remember: 16-bit signed INT maximum is 32,767 (0x7FFF). What happens when you add 1 to a two\'s complement value at its maximum?',
      walkthrough: [
        '32,767 in binary (16-bit): 0111 1111 1111 1111 (sign bit=0, all other bits=1).',
        '32,767 in hex: 0x7FFF.',
        'Adding 1 to 0x7FFF in binary: 0111 1111 1111 1111 + 1 = 1000 0000 0000 0000.',
        'The carry propagates through all the 1-bits, setting bit 15 (the sign bit) to 1 and all other bits to 0.',
        '1000 0000 0000 0000 in two\'s complement = -32,768.',
        'The counter holds -32,768 (= 0x8000 = 0b1000000000000000).',
        'This is integer overflow — the value wraps from the maximum positive to the minimum negative. Most PLCs do this silently without any error.',
        'Prevention: (1) Use DINT (32-bit) for counters that might count high. (2) Add a range-check rung: if Counter >= 32767 then set an overflow fault bit and stop incrementing. (3) Use CTU instruction with a DINT accumulator tag instead of an INT.',
      ],
      answer: '-32,768 (0x8000 = 1000 0000 0000 0000). Integer overflow — the counter wrapped from max positive to min negative. Prevent with DINT type or range-check rungs.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Decoding the alarm register',
      problem: 'A Fanuc PMC alarm register reads 0x0400 (decimal 1024). Which bit is set? What does this represent in a 12-bit alarm word?',
      solution: '0x0400 in binary: 0→0000, 4→0100, 0→0000\nExpanded: 0000_0100_0000_0000\nNumbering from 0 (rightmost): bit 10 is set.\n\n0x0400 = 2¹⁰ = 1024. ✓\n\nIn a 12-bit alarm word with bit assignments:\nBit 10 = servo axis overtravel (per Fanuc PMC manual)\n\nThe three representations from the hook question:\n- Decimal 1024\n- Hex 0x0400\n- Binary 0b0100_0000_0000 (showing 12 bits)\nAll represent the same value: bit 10 set. Same fault, three notations.',
    },
    {
      title: 'Packing axis status bits into a WORD',
      problem: 'A PLC monitors 4 axes (X, Y, Z, A). Each axis has 3 status bits: in_position, moving, fault. Pack all 12 status bits into one INT tag "AxisStatus" for efficient transmission to an HMI.',
      solution: 'Bit assignment (12 bits, can fit in INT):\n\nBits 0–2: X axis  (0=X_in_pos, 1=X_moving, 2=X_fault)\nBits 3–5: Y axis  (3=Y_in_pos, 4=Y_moving, 5=Y_fault)\nBits 6–8: Z axis  (6=Z_in_pos, 7=Z_moving, 8=Z_fault)\nBits 9–11: A axis (9=A_in_pos, 10=A_moving, 11=A_fault)\n\nPLC ladder to pack:\n  AxisStatus := 0\n  IF X_in_pos: AxisStatus := AxisStatus OR 1       (bit 0)\n  IF X_moving: AxisStatus := AxisStatus OR 2       (bit 1)\n  IF X_fault:  AxisStatus := AxisStatus OR 4       (bit 2)\n  (repeat for Y using shifts 3, 4, 5, etc.)\n\nHMI to unpack X axis fault:\n  X_fault_display := (AxisStatus AND 4) <> 0    (mask bit 2)\n\nThis sends one INT register per scan instead of 12 separate BOOL registers, reducing communication overhead by 12×.',
    },
  ],
};
