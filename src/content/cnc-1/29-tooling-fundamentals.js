/**
 * LESSON: TOOLING FUNDAMENTALS
 * Cutting tools, insert grades, coatings, geometries, and selection logic.
 * The masterclass chapter that bridges G-code programming to physical machining.
 */

export default {
  id: 'cnc-tooling',
  slug: 'tooling-fundamentals',
  chapter: 'cnc-1',
  order: 29,
  title: 'Tooling Fundamentals',
  subtitle: 'Solid Carbide, Inserts, Coatings, and the Science of the Cutting Edge',
  tags: ['end mill', 'insert', 'carbide', 'HSS', 'coating', 'TiAlN', 'AlTiN', 'TiN', 'flutes', 'helix', 'chip load', 'tool geometry', 'rake angle', 'relief angle', 'CNMG', 'WNMG'],

  semantics: {
    core: [
      {
        symbol: 'HSS (High-Speed Steel)',
        meaning:
          'The original CNC cutting tool material. Tough, cheap, regrindable. ' +
          'Cutting speeds 3–5× slower than carbide. Used for tapping, broaching, ' +
          'operations with heavy interrupted cuts, and budget setups. ' +
          'Maximum temperature tolerance ≈ 600 °C before the tool loses hardness.',
      },
      {
        symbol: 'Carbide (WC-Co)',
        meaning:
          'Tungsten carbide particles bonded in a cobalt matrix. 3× harder than HSS, ' +
          '4× the elastic modulus. Allows cutting speeds 3–5× higher than HSS. ' +
          'Brittle — cannot be used on interrupted cuts without proper geometry. ' +
          'Standard material for all production CNC end mills, drills, and inserts.',
      },
      {
        symbol: 'Solid Carbide End Mill',
        meaning:
          'A one-piece tool ground from a carbide rod. Precise, vibration-resistant, ' +
          'excellent for finishing and tight tolerances. Higher cost — when worn, ' +
          'the whole tool is replaced (or reground). Best for: aluminum, plastic, ' +
          'stainless finishing, tight-tolerance steel work.',
      },
      {
        symbol: 'Indexable Insert',
        meaning:
          'A small, replaceable cutting tip that clamps into a toolholder body. ' +
          'When one cutting edge dulls, rotate the insert to expose a fresh edge. ' +
          'Lower cost per edge for large material removal. Inserts come in standard ' +
          'ISO shapes: CNMG (rhombic), WNMG (trigon), DNMG (diamond 55°), SNMG (square), TNMG (triangle). ' +
          'Best for: roughing, large depths of cut, lathe turning.',
      },
      {
        symbol: 'Rake Angle',
        meaning:
          'The angle between the tool face and a perpendicular to the cut direction. ' +
          'Positive rake (+): sharp, lower cutting force, better finish — but weaker edge. ' +
          'Negative rake (−): stronger, more robust edge — but higher cutting force and heat. ' +
          'Aluminum: high positive rake (10–20°). Hardened steel: zero or negative rake.',
      },
      {
        symbol: 'Relief (Clearance) Angle',
        meaning:
          'The angle behind the cutting edge that prevents the tool body from rubbing on ' +
          'the workpiece. Too little relief: rubbing, heat, poor finish. ' +
          'Too much relief: weak edge, prone to chipping. Typical: 7–15° for milling end mills.',
      },
      {
        symbol: 'Helix Angle',
        meaning:
          'The twist angle of an end mill\'s flutes. Low helix (≈30°): strong edge, good for ' +
          'steel and hard materials. High helix (45–60°): excellent chip evacuation, lower axial ' +
          'force, ideal for aluminum and thin-wall parts. Higher helix also produces a better ' +
          'surface finish on side walls.',
      },
      {
        symbol: 'Flute Count',
        meaning:
          '2-flute: maximum chip space — required for aluminum (no chip packing), plastic, soft materials. ' +
          '3-flute: compromise — used in aluminum for smoother finish with moderate chip clearance. ' +
          '4-flute: standard for steel — less chip room but more cutting edges = better finish and rigidity. ' +
          '5+ flutes: finishing end mills for hard materials and high-feed milling.',
      },
      {
        symbol: 'TiN Coating',
        meaning:
          'Titanium Nitride. Gold-colored, general-purpose coating. Increases hardness to HRC 80, ' +
          'max temperature 600 °C. Good for HSS tools. Superseded by TiAlN for carbide production work.',
      },
      {
        symbol: 'TiAlN / AlTiN Coating',
        meaning:
          'Titanium-Aluminum Nitride. The workhorse production coating for steel, stainless, and cast iron. ' +
          'Dark gray/black. Max temp 800–900 °C. Exceptional oxidation resistance at high cutting temperatures. ' +
          'AlTiN (aluminum-rich): even harder, for dry machining and hard materials (HRC 45+).',
      },
      {
        symbol: 'DLC / Diamond Coating',
        meaning:
          'Diamond-Like Carbon or CVD diamond. Used exclusively for non-ferrous materials: ' +
          'aluminum, composites (CFRP), copper. Diamond reacts with ferrous metals (diffusion wear) — ' +
          'never use on steel. Provides near-zero friction and extremely long tool life in aluminum.',
      },
      {
        symbol: 'ISO Insert Grade Code',
        meaning:
          'The standard letter-number system for insert geometry: shape, clearance, tolerance, chipbreaker. ' +
          'Example: CNMG 120408 — C=rhombic 80°, N=0° clearance, M=tolerance class, G=fixturing hole+chipbreaker, ' +
          '12=inscribed circle 12mm, 04=thickness 4mm (×10), 08=corner radius 0.8mm. ' +
          'Knowing the code lets you substitute inserts across brands.',
      },
    ],
    rulesOfThumb: [
      'Use 2 flutes in aluminum. Use 4 flutes in steel. 3 flutes are a compromise for both.',
      'Higher helix = better for aluminum (evacuates chips fast); lower helix = better for steel (stronger edge).',
      'Coating choice: TiAlN for steel/stainless (dry or minimal coolant). DLC/uncoated for aluminum. HSS taps always coated or uncoated — never TiAlN.',
      'Insert selection first: geometry (roughing vs. finishing), then grade (substrate hardness), then coating. Shape and chipbreaker are defined by the operation.',
      'Corner radius on inserts and end mills: larger radius = stronger edge, better finish, higher SFM capability; smaller radius = sharper entry into corners, more flex.',
      'Solid carbide for tolerance, inserts for stock removal. If you need ±0.01 mm, use a solid carbide end mill. If you\'re removing 5 mm per pass, use indexable.',
      'Never use a TiAlN-coated tool on aluminum. The aluminum welds to the coating (built-up edge). Use uncoated or DLC.',
    ],
  },

  hook: {
    question: 'Two machinists, identical machine, identical speeds and feeds — one gets 200 parts per tool, the other gets 20. What\'s different?',
    realWorldContext:
      'The tool. 90% of machining problems trace back to incorrect tool selection: wrong coating for the material, ' +
      'too many flutes for the chip load, wrong helix for the cut depth, wrong insert grade for the hardness. ' +
      'A TiAlN end mill in aluminum will build a BUE (built-up edge) and ruin the finish in 3 parts. ' +
      'The same tool in 4140 steel will last 300 parts. ' +
      'Understanding what happens at the cutting edge — the 0.05 mm zone where metal transforms from solid to chip — ' +
      'separates machinists who fight their tools from machinists who understand them. ' +
      'This lesson covers the physical science of cutting tools so you can select the right tool the first time, every time.',
  },

  intuition: {
    visualizations: [
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'tool-1',
              label: '1 — Aluminum: 2-flute, high helix, DLC/uncoated, high RPM',
              code:
                '; Aluminum 6061: very soft, sticky, produces long stringy chips.\n' +
                '; Tool requirements:\n' +
                ';   - 2 flutes: maximum chip space (prevents packing/welding)\n' +
                ';   - High helix 45-60°: pulls chips up and out aggressively\n' +
                ';   - DLC or uncoated: TiAlN causes built-up edge in aluminum\n' +
                ';   - High Vc: 200-300 m/min for carbide\n' +
                '; 12mm 2-flute carbide end mill in aluminum:\n' +
                '; RPM = (250 * 1000) / (3.14159 * 12) = 6631\n' +
                '; Feed = RPM * chip_load * flutes = 6631 * 0.04 * 2 = 530 mm/min\n' +
                'G21 G90 G97\n' +
                'S6600 M03 M08\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-8 F150                ; plunge at 25%: 530*0.25=132 → use 150\n' +
                'G1 X60 F530                ; full cutting feedrate\n' +
                'G0 Z50\n' +
                'M05 M09\n' +
                'M30\n',
            },
            {
              id: 'tool-2',
              label: '2 — Steel: 4-flute, TiAlN coated, lower RPM and feed',
              code:
                '; 4140 steel HRC 30: tough, abrasive, produces segmented chips.\n' +
                '; Tool requirements:\n' +
                ';   - 4 flutes: more edges for finish, adequate chip room at lower feed\n' +
                ';   - Low-to-medium helix 30-35°: stronger edge for harder material\n' +
                ';   - TiAlN coating: survives 800°C, excellent oxidation resistance\n' +
                ';   - Lower Vc: 100-150 m/min for carbide in steel\n' +
                '; 12mm 4-flute TiAlN carbide in 4140 steel:\n' +
                '; RPM = (120 * 1000) / (3.14159 * 12) = 3183\n' +
                '; Feed = 3183 * 0.025 * 4 = 318 mm/min\n' +
                'G21 G90 G97\n' +
                'S3200 M03 M08\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-4 F80                 ; plunge at 25%: 318*0.25=79 → use 80\n' +
                'G1 X60 F320                ; cutting feedrate\n' +
                'G0 Z50\n' +
                'M05 M09\n' +
                'M30\n',
            },
            {
              id: 'tool-3',
              label: '3 — Insert roughing: high MRR, replaceable edges',
              code:
                '; Indexable insert face mill: APKT or SEHT style.\n' +
                '; Best for: large stock removal, facing, roughing passes.\n' +
                '; Inserts replaced (not reground) when worn — lower cost per edge.\n' +
                '; Face mill Ø80mm with 5 inserts (APKT 1604), steel:\n' +
                '; Vc = 180 m/min → RPM = (180*1000)/(3.14159*80) = 716\n' +
                '; Chip load per tooth = 0.2mm, Feed = 716*0.2*5 = 716 mm/min\n' +
                '; Axial depth: 2mm (roughing pass)\n' +
                'G21 G90 G97\n' +
                'S720 M03 M08\n' +
                'G0 X-10 Y0 Z5\n' +
                'G1 Z-2 F200                ; rapid-feed plunge: face mill enters radially\n' +
                'G1 X100 F720               ; face mill pass at full feedrate\n' +
                'G0 Z50\n' +
                'M05 M09\n' +
                'M30\n',
            },
          ],
        },
        title: 'Tool Selection in G-Code',
        caption: 'Cell 1: aluminum strategy — 2-flute, DLC, high RPM, high feed. Cell 2: steel strategy — 4-flute, TiAlN, lower RPM, lower feed. Cell 3: insert roughing — high chip load, replaceable edges for maximum material removal rate.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 29 of 31 — Tooling Fundamentals',
        body: 'You have programmed feeds and speeds (lesson 17). This lesson explains WHY those numbers work for specific tools in specific materials. Tool selection is the multiplier: the same speeds and feeds that give you 200 parts from the right tool give you 20 from the wrong one.',
      },
      {
        type: 'definition',
        title: 'Flute count rule: 2 for aluminum, 4 for steel',
        body: '2 flutes: maximum chip gullet space — prevents aluminum chips from packing and welding into the flutes. 4 flutes: more cutting edges, better finish, adequate chip room at the lower chip loads required for steel. 3 flutes: compromise for light aluminum finishing or smooth steel contouring.',
      },
      {
        type: 'definition',
        title: 'Coating selection: TiAlN for steel, uncoated/DLC for aluminum',
        body: 'TiAlN (dark gray): max temp 800°C, ideal for steel, stainless, cast iron. DLC/uncoated: aluminum, copper, composites. NEVER use TiAlN in aluminum — the aluminum atom bonds to the coating and welds to the flute face (built-up edge), destroying surface finish in 2–3 parts.',
      },
      {
        type: 'definition',
        title: 'Solid carbide vs indexable insert',
        body: 'Solid carbide: one-piece tool ground from carbide rod. Use for toleranced features, finishing, small diameters (< 25mm). Indexable insert: replaceable cutting tips in a tool body. Use for roughing, large depths of cut, lathe turning. Lower cost per edge, easier field replacement.',
      },
      {
        type: 'insight',
        title: 'Helix angle: high for aluminum, low for steel',
        body: 'High helix (45–60°): aggressive chip evacuation, lower axial cutting force, ideal for aluminum and thin-wall parts. Low helix (30°): stronger cutting edge, better for interrupted cuts and hard materials. High helix in steel causes chatter; low helix in aluminum causes chip packing.',
      },
      {
        type: 'warning',
        title: 'Corner radius on inserts and end mills: always the largest that fits',
        body: 'A larger corner radius distributes the cutting force over more edge length — longer tool life, better finish, higher SFM. Use the largest corner radius the part geometry allows. Small radii (0.1–0.2mm) are for tight corner requirements only — they are weak and chatter-prone.',
      },
    ],
    prose: [
      '**The Four Pillars of Tool Selection**: Every tool selection decision reduces to four properties: ' +
      '(1) **Substrate** — what the tool is made of (HSS, carbide, cermet, CBN, PCD). ' +
      '(2) **Geometry** — rake angle, relief angle, helix, flute count, edge prep. ' +
      '(3) **Coating** — TiN, TiAlN, AlTiN, DLC, uncoated. ' +
      '(4) **Form factor** — solid, indexable insert, brazed. ' +
      'Each of these is optimized for a specific combination of workpiece material, operation, and machine rigidity.',

      '**Why Carbide Dominates Production**: Tungsten carbide (WC) is roughly 3× harder than tool steel (HRC 90 vs 62). ' +
      'It maintains its hardness up to 900 °C. This allows cutting speeds 3–5× higher — ' +
      'and since cycle time scales directly with cutting speed, carbide tools often pay for themselves in the first hour. ' +
      'The downside: carbide is brittle. It chips rather than deforming under shock loading. ' +
      'This is why you never drop a carbide end mill on a concrete floor.',

      '**Insert Geometry — The ISO Alphabet**: The ISO insert designation looks intimidating but follows strict rules. ' +
      'Take CNMG 120408: C=rhombic 80° shape, N=0° clearance (strong edge, negative rake tool), ' +
      'M=medium tolerance, G=has central fixturing hole and chipbreaker geometry, ' +
      '12=12mm inscribed circle, 04=4mm thick (multiply by 0.1), 08=0.8mm nose radius. ' +
      'The nose radius alone has enormous impact: a 0.4mm radius gives sharp-looking corners but chips easily; ' +
      'a 1.2mm radius gives a strong edge and better finish but requires more cutting force.',

      '**Coatings — The Heat Shield**: At the cutting edge, temperatures exceed 600–900 °C in a zone smaller ' +
      'than a human hair. Coatings are 2–8 µm PVD or CVD layers that insulate the substrate from this heat. ' +
      'TiAlN works because at high temperature, Al₂O₃ forms on the surface — a hard, self-lubricating oxide ' +
      'that protects the substrate. In aluminum, this mechanism fails: Al₂O₃ can\'t form, ' +
      'and the workpiece aluminum welds directly to the TiAlN coating (built-up edge). ' +
      'Rule: match the coating chemistry to the workpiece material, not the machine.',

      '**Helix Angle and Chip Evacuation**: Aluminum produces long, stringy chips that pack into flutes and ' +
      're-cut (smearing them into the finish). A 45° helix angle creates a steep "screw conveyor" that ' +
      'pulls chips out of the cut faster than gravity alone. In steel, the chips are shorter and less ' +
      'problematic; a 30° helix provides a stronger edge at the expense of some chip evacuation efficiency. ' +
      'For hardened steel (HRC 50+), even lower helix is used to maximize edge strength.',

      '**Flute Count and the Chip Thickness Problem**: As you increase flutes from 2 to 4, the chip ' +
      'space per flute decreases by half. In aluminum, halving chip space means chips pack and re-cut — ' +
      'catastrophic finish, BUE, broken tool. In steel, shorter chips fill less space, ' +
      'so more flutes = more cutting edges per revolution = better finish and lower per-tooth load. ' +
      'This is the fundamental reason for the "2-flute aluminum, 4-flute steel" rule.',
    ],
  },

  math: {
    prose: [
      '**Cutting Force and Chip Thickness**: The tangential cutting force $F_c$ scales with chip cross-section:',
      '$F_c = k_c \\cdot a_p \\cdot h$',
      'where $k_c$ = specific cutting force (MPa, material property), $a_p$ = axial depth of cut (mm), ' +
      '$h$ = chip thickness ≈ chip load (mm/tooth).',

      '**Specific Cutting Force by Material** (approximate $k_c$ in N/mm²):',
      '| Material | $k_c$ (N/mm²) |\n|---|---|\n| Aluminum 6061 | 700 |\n| Steel 1018 | 1800 |\n| 4140 Alloy Steel | 2400 |\n| 316 Stainless | 2800 |\n| Inconel 718 | 3500 |',

      '**Tool Life (Taylor\'s Equation)**: Tool life $T$ (minutes of cutting) relates to cutting speed $V_c$ by:',
      '$V_c \\cdot T^n = C$',
      'where $n$ = Taylor exponent (≈ 0.1 for HSS, 0.3–0.5 for carbide) and $C$ = material-tool constant. ' +
      'Doubling the cutting speed more than halves tool life for HSS, but has a smaller effect on carbide. ' +
      'This is why using recommended speeds is critical: exceeding by 20% may cut tool life by 50%.',

      '**Corner Radius and Surface Finish**: The theoretical surface roughness $R_a$ from a feed-per-tooth $f_z$ ' +
      'and nose radius $r_\\varepsilon$ (for turning or milling over a flat surface) is:',
      '$R_a \\approx \\frac{f_z^2}{8 \\, r_\\varepsilon}$',
      'Doubling the nose radius halves the theoretical roughness. Halving the feedrate cuts roughness by 4×. ' +
      'Both together cut roughness by 8×. This formula guides the finishing-pass parameter choice.',
    ],
  },

  rigor: {
    prose: [
      '**PVD vs CVD Coatings**: Physical Vapor Deposition (PVD) coatings are applied at low temperature ' +
      '(200–500 °C), preserving substrate toughness. TiAlN, AlTiN, TiCN are typically PVD. ' +
      'Chemical Vapor Deposition (CVD) coatings are applied at higher temperature (1000 °C) and are ' +
      'thicker (8–20 µm vs 2–5 µm for PVD). CVD aluminum oxide (Al₂O₃) is the gold standard for ' +
      'turning steel and cast iron at high speed because the oxide layer is extremely thermally stable. ' +
      'CVD-coated inserts are run dry at high speed — coolant causes thermal shock cracking.',

      '**Cermet and CBN — When Carbide Isn\'t Enough**: Cermet (ceramic-metal composite) inserts run at ' +
      '2–3× carbide cutting speed in steel, producing mirror finishes. Used for final finishing passes ' +
      'at high speed, low feed, light depth. CBN (Cubic Boron Nitride) is second only to diamond in hardness. ' +
      'CBN can cut hardened steel (HRC 50–68) where carbide fails — the standard material for ' +
      'hard turning (grinding replacement). PCD (Poly-Crystalline Diamond) is used for non-ferrous machining ' +
      'at extremely high speed — the go-to for automotive aluminum cylinder bores and silicon.',

      '**Edge Preparation — The Hone That Makes or Breaks Carbide**: Raw-ground carbide has a ' +
      'microscopic sharp edge that chips immediately on contact with hard materials. A controlled ' +
      'edge hone (10–30 µm radius) strengthens the edge by removing stress risers. ' +
      'For finishing aluminum: minimal or no hone (sharp edge). For milling hardened steel: ' +
      'aggressive hone (T-land + radius). The edge prep code is part of the insert designation ' +
      '(the last letter: E = sharp, K = honed, T = T-land). Most off-the-shelf end mills for steel have ' +
      'a factory hone; aluminum end mills are ground sharp.',

      '**Vibration and Chatter — The Tool-Holder Connection**: 80% of chatter problems originate not ' +
      'in the tool itself but in the toolholder-spindle interface. ER collet holders are the ' +
      'most common but have the highest runout (5–15 µm). Hydraulic chucks (2–3 µm runout) and ' +
      'shrink-fit holders (1–2 µm runout) dramatically improve finish and tool life on long-reach ' +
      'operations. The rule: for any end mill over 3× diameter in depth, use the highest-accuracy ' +
      'holder available. Every 5 µm of runout effectively doubles the chip load on the worst-case flute.',
    ],
  },

  examples: [
    {
      id: 'ex-tool-selection-aluminum',
      title: 'Tool Selection: Milling a Pocket in 6061 Aluminum',
      problem:
        'You need to rough and finish a 50 × 30 × 10 mm deep pocket in 6061-T6 aluminum. ' +
        'Choose the appropriate end mill(s), coating, and explain why.',
      steps: [
        {
          expression: 'Roughing pass',
          annotation:
            'Select a 2-flute, 45° helix, uncoated or ZrN-coated solid carbide end mill. ' +
            '2 flutes = maximum chip space for aluminum (long, stringy chips). ' +
            '45° helix = aggressively ejects chips before they pack. ' +
            'Uncoated: lower friction, aluminum doesn\'t bond to bare carbide easily at normal feeds. ' +
            'Alternative: ZrN (Zirconium Nitride) coating — slippery, aluminum-safe. ' +
            'Never: TiAlN, TiN — aluminum welds to these coatings (BUE).',
        },
        {
          expression: 'Finishing pass',
          annotation:
            'Switch to a 3-flute, high-helix, DLC-coated end mill or a sharp 2-flute. ' +
            'DLC coating has near-zero aluminum affinity — nearly eliminates built-up edge. ' +
            'Corner radius of 0.1 mm for sharp corners; 0.5 mm if finish is more important than corner sharpness. ' +
            'Reduce chip load 30–50% vs roughing. Climb mill (same direction as spindle rotation) ' +
            'for better finish on aluminum.',
        },
        {
          expression: 'Decision summary',
          annotation:
            'If budget allows: 3-flute DLC-coated end mill for both rough and finish (adjust chip load). ' +
            'If cost-driven: uncoated 2-flute for rough + uncoated 3-flute finishing end mill. ' +
            'Both scenarios: NO TiAlN, NO 4-flute. Check helix ≥ 40°.',
        },
      ],
    },
    {
      id: 'ex-insert-selection-steel',
      title: 'Insert Selection: Turning 4140 Alloy Steel',
      problem:
        'You are turning a 4140 alloy steel shaft (HRC 30, as-annealed) on a CNC lathe. ' +
        'Select an insert shape, grade, and coating for roughing. Justify the nose radius choice.',
      steps: [
        {
          expression: 'Insert shape',
          annotation:
            'CNMG (80° rhombic). Provides two usable cutting edges per insert. ' +
            '80° included angle = strong corner, good for interrupted cuts and scale. ' +
            'Alternative: WNMG (80° trigon, 3 edges) — more economical for stable cuts.',
        },
        {
          expression: 'Substrate + grade',
          annotation:
            'Medium carbide grade: ISO P25–P35 classification. P25 = balanced toughness/hardness for steel. ' +
            'For interrupted cuts (keyways, scale): P35 (tougher). For light roughing on clean bar: P15.',
        },
        {
          expression: 'Coating',
          annotation:
            'CVD multilayer: TiCN + Al₂O₃ + TiN. The Al₂O₃ middle layer provides thermal insulation ' +
            'at high cutting temperature. Run dry at high speed (200–300 m/min SFM ≈ 650–1000). ' +
            'If using flood coolant, switch to PVD TiAlN: CVD inserts can thermal-shock crack ' +
            'with intermittent coolant application.',
        },
        {
          expression: 'Nose radius',
          annotation:
            '0.8 mm nose radius for roughing (strong edge, good chip control). ' +
            'Switch to 0.4 mm for finishing (lower cutting force, better surface finish). ' +
            'Using $R_a \\approx f_z^2 / (8 r_\\varepsilon)$: ' +
            'at $f_z = 0.25$ mm/rev and $r_\\varepsilon = 0.8$ mm → $R_a = 0.0098$ mm = 9.8 µm. ' +
            'For a 1.6 µm Ra finish: need $f_z = 0.113$ mm/rev at the same nose radius.',
        },
      ],
    },
  ],

  mastery: {
    checkpoints: [
      'Name the correct flute count for aluminum vs. steel milling and explain why.',
      'Explain why TiAlN coating should never be used on aluminum.',
      'What does each character in "CNMG 120408" describe?',
      'A machinist reports poor surface finish on a steel turning operation. They are using a 0.4 mm nose radius insert at 0.30 mm/rev feed. What is the calculated $R_a$? What is the fastest fix: change nose radius to 0.8 mm or halve the feedrate?',
      'What is the advantage of a shrink-fit toolholder over an ER collet for a 3:1 length-to-diameter end mill?',
      'Explain the difference between PVD and CVD coatings and when to use each.',
    ],
  },
}
