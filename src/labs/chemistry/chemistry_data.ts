// chemistry_data.ts
// Complete element data + molecule library + reaction library
// All data is self-contained — no network requests needed
//
// This is the single canonical copy — previously duplicated byte-for-byte at
// src/courses/chemistry/viz/chemistry_data.jsx, which silently risked drifting
// from this one. Both the lab (PeriodicTable/MoleculeBuilder) and the lesson
// viz (InsideTheAtom) import from here now.

export type ElementCategory =
  | 'alkali-metal' | 'alkaline-earth' | 'transition-metal' | 'post-transition'
  | 'metalloid' | 'nonmetal' | 'halogen' | 'noble-gas' | 'lanthanide' | 'actinide' | 'unknown'

export interface CategoryColor { bg: string; border: string; text: string }

export type ElementBlock = 's' | 'p' | 'd' | 'f'

export interface Element {
  symbol: string
  name: string
  n: number
  mass: number
  cat: ElementCategory
  period: number
  group: number | null
  config: string
  eneg: number | null
  radius: number | null
  melt: number | null
  boil: number | null
  density: number | null
  shells: number[]
  discovered: string
  year: number | null
  uses: string
  fact: string
  /** First ionization energy, kJ/mol. Null where unmeasured/unpredicted. */
  ionizationEnergy: number | null
  /** Electron affinity, kJ/mol (energy released on gaining an electron). Null where the gas-phase anion is unstable or unmeasured. */
  electronAffinity: number | null
  /** Common oxidation states, most common first. */
  oxidationStates: number[]
  /** Periodic table block, derived from category/group rather than authored per-element. */
  block: ElementBlock
}

type RawElement = Omit<Element, 'ionizationEnergy' | 'electronAffinity' | 'oxidationStates' | 'block'>

export type BondKind =
  | 'single' | 'double' | 'triple' | 'ionic' | 'aromatic'
  | 'hydrogen' | 'van-der-waals' | 'metallic'

export interface AtomPosition { symbol: string; x: number; y: number; z: number }
export type Bond = [from: number, to: number, kind: BondKind]

export interface Molecule {
  id: string
  name: string
  formula: string
  elements: string[]
  geometry: string
  polarity: 'polar' | 'nonpolar' | 'ionic'
  molarMass: number
  state: 'solid' | 'liquid' | 'gas'
  description: string
  bondType: string
  bondAngle: number | null
  hybridization: string | null
  atoms: AtomPosition[]
  bonds: Bond[]
  funFact: string
}

export interface Reaction {
  id: string
  name: string
  type: string
  equation: string
  reactants: string[]
  products: string[]
  deltaH: number
  description: string
  bondBreaking: string[]
  bondForming: string[]
  energyNote: string
}

export interface BondTypeInfo { label: string; color: string; width: number; description: string }

// ── ELEMENT CATEGORIES ────────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<ElementCategory, CategoryColor> = {
  'alkali-metal':        { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5' },
  'alkaline-earth':      { bg: '#7c2d12', border: '#f97316', text: '#fdba74' },
  'transition-metal':    { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  'post-transition':     { bg: '#14532d', border: '#22c55e', text: '#86efac' },
  'metalloid':           { bg: '#365314', border: '#84cc16', text: '#bef264' },
  'nonmetal':            { bg: '#1e1b4b', border: '#8b5cf6', text: '#c4b5fd' },
  'halogen':             { bg: '#4c1d95', border: '#a78bfa', text: '#ddd6fe' },
  'noble-gas':           { bg: '#0c4a6e', border: '#38bdf8', text: '#7dd3fc' },
  'lanthanide':          { bg: '#1a1a2e', border: '#6366f1', text: '#a5b4fc' },
  'actinide':            { bg: '#2d1b00', border: '#d97706', text: '#fde68a' },
  'unknown':             { bg: '#1f2937', border: '#6b7280', text: '#d1d5db' },
};

// ── FULL ELEMENT DATA (118 elements) ─────────────────────────────────────────
// Fields: symbol, name, atomicNumber, atomicMass, category, period, group,
//         electronConfig, electronegativity, atomicRadius(pm), meltingPoint(K),
//         boilingPoint(K), density(g/cm³), discoveredBy, discoveryYear,
//         shells (electrons per shell), uses, funFact
const RAW_ELEMENTS: RawElement[] = [
  { symbol:'H',  name:'Hydrogen',      n:1,   mass:1.008,    cat:'nonmetal',       period:1, group:1,
    config:'1s¹', eneg:2.20, radius:53,  melt:14,    boil:20,    density:0.0000899,
    shells:[1], discovered:'Cavendish', year:1766,
    uses:'Fuel cells, rocket fuel, fertilizer production, petroleum refining',
    fact:'Most abundant element in the universe — 75% of all matter by mass' },
  { symbol:'He', name:'Helium',        n:2,   mass:4.003,    cat:'noble-gas',      period:1, group:18,
    config:'1s²', eneg:null, radius:31,  melt:null,  boil:4,     density:0.0001785,
    shells:[2], discovered:'Janssen & Lockyer', year:1868,
    uses:'Balloons, MRI magnets, deep-sea diving gas mixtures, arc welding',
    fact:'Second most abundant element in the universe; cannot be solidified at normal pressure' },
  { symbol:'Li', name:'Lithium',       n:3,   mass:6.941,    cat:'alkali-metal',   period:2, group:1,
    config:'[He]2s¹', eneg:0.98, radius:167, melt:454, boil:1615, density:0.535,
    shells:[2,1], discovered:'Arfwedson', year:1817,
    uses:'Lithium-ion batteries, psychiatric medication, ceramics',
    fact:'Lightest metal — it can float on water (and reacts violently with it)' },
  { symbol:'Be', name:'Beryllium',     n:4,   mass:9.012,    cat:'alkaline-earth', period:2, group:2,
    config:'[He]2s²', eneg:1.57, radius:112, melt:1560, boil:2742, density:1.848,
    shells:[2,2], discovered:'Vauquelin', year:1798,
    uses:'Aerospace alloys, X-ray windows, nuclear reactors, electronics',
    fact:'Transparent to X-rays; a 1mm beryllium window blocks only 0.5% of X-rays' },
  { symbol:'B',  name:'Boron',         n:5,   mass:10.811,   cat:'metalloid',      period:2, group:13,
    config:'[He]2s²2p¹', eneg:2.04, radius:87, melt:2349, boil:4200, density:2.34,
    shells:[2,3], discovered:'Gay-Lussac & Davy', year:1808,
    uses:'Borosilicate glass, semiconductors, neutron absorbers in nuclear reactors',
    fact:'Pure boron is nearly as hard as diamond in its α-rhombohedral form' },
  { symbol:'C',  name:'Carbon',        n:6,   mass:12.011,   cat:'nonmetal',       period:2, group:14,
    config:'[He]2s²2p²', eneg:2.55, radius:67, melt:3823, boil:4098, density:2.267,
    shells:[2,4], discovered:'Ancient', year:null,
    uses:'Steel production, pencils (graphite), diamonds, plastics, all organic chemistry',
    fact:'Forms more compounds than any other element — over 10 million known carbon compounds' },
  { symbol:'N',  name:'Nitrogen',      n:7,   mass:14.007,   cat:'nonmetal',       period:2, group:15,
    config:'[He]2s²2p³', eneg:3.04, radius:56, melt:63, boil:77, density:0.001251,
    shells:[2,5], discovered:'Rutherford', year:1772,
    uses:'Fertilizers (as ammonia), liquid nitrogen cooling, food preservation, explosives',
    fact:'Makes up 78% of Earth\'s atmosphere; the triple bond in N₂ is one of the strongest in chemistry' },
  { symbol:'O',  name:'Oxygen',        n:8,   mass:15.999,   cat:'nonmetal',       period:2, group:16,
    config:'[He]2s²2p⁴', eneg:3.44, radius:48, melt:54, boil:90, density:0.001429,
    shells:[2,6], discovered:'Scheele & Priestley', year:1774,
    uses:'Respiration, steel production, water treatment, rocket propellant',
    fact:'Third most abundant element in the universe; liquid oxygen is pale blue' },
  { symbol:'F',  name:'Fluorine',      n:9,   mass:18.998,   cat:'halogen',        period:2, group:17,
    config:'[He]2s²2p⁵', eneg:3.98, radius:42, melt:53, boil:85, density:0.001696,
    shells:[2,7], discovered:'Moissan', year:1886,
    uses:'Toothpaste, Teflon coatings, refrigerants, uranium processing',
    fact:'Most electronegative element on the periodic table; reacts with nearly everything' },
  { symbol:'Ne', name:'Neon',          n:10,  mass:20.180,   cat:'noble-gas',      period:2, group:18,
    config:'[He]2s²2p⁶', eneg:null, radius:38, melt:25, boil:27, density:0.0009,
    shells:[2,8], discovered:'Ramsay & Travers', year:1898,
    uses:'Neon signs, lasers, cryogenic refrigerants, high-voltage indicators',
    fact:'Produces the most intense red-orange glow of any element in a discharge tube' },
  { symbol:'Na', name:'Sodium',        n:11,  mass:22.990,   cat:'alkali-metal',   period:3, group:1,
    config:'[Ne]3s¹', eneg:0.93, radius:186, melt:371, boil:1156, density:0.968,
    shells:[2,8,1], discovered:'Davy', year:1807,
    uses:'Table salt, soap making, street lights, heat transfer in nuclear reactors',
    fact:'Explodes violently when dropped in water; stored under oil to prevent reaction with air' },
  { symbol:'Mg', name:'Magnesium',     n:12,  mass:24.305,   cat:'alkaline-earth', period:3, group:2,
    config:'[Ne]3s²', eneg:1.31, radius:160, melt:923, boil:1363, density:1.738,
    shells:[2,8,2], discovered:'Black', year:1755,
    uses:'Lightweight alloys (aircraft, cars), fireworks, flares, supplements',
    fact:'Burns with an intensely bright white flame that cannot be extinguished with water or CO₂' },
  { symbol:'Al', name:'Aluminium',     n:13,  mass:26.982,   cat:'post-transition', period:3, group:13,
    config:'[Ne]3s²3p¹', eneg:1.61, radius:143, melt:933, boil:2792, density:2.698,
    shells:[2,8,3], discovered:'Ørsted', year:1825,
    uses:'Aircraft, beverage cans, foil, electrical wires, building construction',
    fact:'Once more valuable than gold — the Washington Monument cap is pure aluminium' },
  { symbol:'Si', name:'Silicon',       n:14,  mass:28.086,   cat:'metalloid',      period:3, group:14,
    config:'[Ne]3s²3p²', eneg:1.90, radius:117, melt:1687, boil:3538, density:2.329,
    shells:[2,8,4], discovered:'Berzelius', year:1824,
    uses:'Semiconductors, solar cells, glass, ceramics, silicone rubber',
    fact:'Second most abundant element in Earth\'s crust; the basis of the entire electronics industry' },
  { symbol:'P',  name:'Phosphorus',    n:15,  mass:30.974,   cat:'nonmetal',       period:3, group:15,
    config:'[Ne]3s²3p³', eneg:2.19, radius:98, melt:317, boil:550, density:1.82,
    shells:[2,8,5], discovered:'Brand', year:1669,
    uses:'Fertilizers, matches, detergents, DNA backbone, ATP (cellular energy)',
    fact:'Glows in the dark due to slow oxidation — its name means "light-bearer" in Greek' },
  { symbol:'S',  name:'Sulfur',        n:16,  mass:32.065,   cat:'nonmetal',       period:3, group:16,
    config:'[Ne]3s²3p⁴', eneg:2.58, radius:88, melt:386, boil:718, density:2.067,
    shells:[2,8,6], discovered:'Ancient', year:null,
    uses:'Sulfuric acid production, vulcanizing rubber, fungicides, gunpowder',
    fact:'Burns with a distinctive blue flame and produces sulfur dioxide — the smell of struck matches' },
  { symbol:'Cl', name:'Chlorine',      n:17,  mass:35.453,   cat:'halogen',        period:3, group:17,
    config:'[Ne]3s²3p⁵', eneg:3.16, radius:79, melt:172, boil:239, density:0.003214,
    shells:[2,8,7], discovered:'Scheele', year:1774,
    uses:'Water purification, bleach, PVC plastic, pharmaceuticals',
    fact:'Used as a chemical weapon in WWI; now essential for safe drinking water worldwide' },
  { symbol:'Ar', name:'Argon',         n:18,  mass:39.948,   cat:'noble-gas',      period:3, group:18,
    config:'[Ne]3s²3p⁶', eneg:null, radius:71, melt:84, boil:87, density:0.001784,
    shells:[2,8,8], discovered:'Ramsay & Strutt', year:1894,
    uses:'Welding shield gas, incandescent bulbs, wine preservation, double-pane windows',
    fact:'Most abundant noble gas in Earth\'s atmosphere — 1% of the air you breathe is argon' },
  { symbol:'K',  name:'Potassium',     n:19,  mass:39.098,   cat:'alkali-metal',   period:4, group:1,
    config:'[Ar]4s¹', eneg:0.82, radius:227, melt:337, boil:1032, density:0.856,
    shells:[2,8,8,1], discovered:'Davy', year:1807,
    uses:'Fertilizers, potassium chloride salt substitute, soap making, medicine',
    fact:'An essential electrolyte for heart function — the K in "hyperkalemia"' },
  { symbol:'Ca', name:'Calcium',       n:20,  mass:40.078,   cat:'alkaline-earth', period:4, group:2,
    config:'[Ar]4s²', eneg:1.00, radius:197, melt:1115, boil:1757, density:1.55,
    shells:[2,8,8,2], discovered:'Davy', year:1808,
    uses:'Cement, concrete, bone/teeth composition, steel purification',
    fact:'Most abundant metal in the human body — the average adult contains about 1 kg of calcium' },
  // Transition metals (21-30)
  { symbol:'Sc', name:'Scandium',      n:21,  mass:44.956,   cat:'transition-metal', period:4, group:3,
    config:'[Ar]3d¹4s²', eneg:1.36, radius:162, melt:1814, boil:3109, density:2.985,
    shells:[2,8,9,2], discovered:'Nilson', year:1879,
    uses:'Aerospace alloys, high-intensity lamps, sports equipment',
    fact:'Named after Scandinavia; used in the lights of Major League Baseball stadiums' },
  { symbol:'Ti', name:'Titanium',      n:22,  mass:47.867,   cat:'transition-metal', period:4, group:4,
    config:'[Ar]3d²4s²', eneg:1.54, radius:147, melt:1941, boil:3560, density:4.507,
    shells:[2,8,10,2], discovered:'Gregor', year:1791,
    uses:'Aircraft, medical implants, sports equipment, white paint (TiO₂)',
    fact:'As strong as steel but 45% lighter; completely biocompatible with human tissue' },
  { symbol:'V',  name:'Vanadium',      n:23,  mass:50.942,   cat:'transition-metal', period:4, group:5,
    config:'[Ar]3d³4s²', eneg:1.63, radius:134, melt:2183, boil:3680, density:6.11,
    shells:[2,8,11,2], discovered:'del Río', year:1801,
    uses:'Steel alloys (very tough), vanadium flow batteries, catalysts in sulfuric acid production',
    fact:'Named for Vanadis, a Norse goddess; its compounds display nearly every color of the rainbow' },
  { symbol:'Cr', name:'Chromium',      n:24,  mass:51.996,   cat:'transition-metal', period:4, group:6,
    config:'[Ar]3d⁵4s¹', eneg:1.66, radius:128, melt:2180, boil:2944, density:7.19,
    shells:[2,8,13,1], discovered:'Vauquelin', year:1798,
    uses:'Stainless steel, chrome plating, pigments, leather tanning',
    fact:'Name comes from Greek "chroma" (color) — its compounds are brilliant green, red, yellow, and orange' },
  { symbol:'Mn', name:'Manganese',     n:25,  mass:54.938,   cat:'transition-metal', period:4, group:7,
    config:'[Ar]3d⁵4s²', eneg:1.55, radius:127, melt:1519, boil:2334, density:7.21,
    shells:[2,8,13,2], discovered:'Gahn', year:1774,
    uses:'Steel production, batteries (MnO₂), water treatment, fertilizers',
    fact:'Deep-sea manganese nodules cover vast areas of the ocean floor' },
  { symbol:'Fe', name:'Iron',          n:26,  mass:55.845,   cat:'transition-metal', period:4, group:8,
    config:'[Ar]3d⁶4s²', eneg:1.83, radius:126, melt:1811, boil:3134, density:7.874,
    shells:[2,8,14,2], discovered:'Ancient', year:null,
    uses:'Steel, construction, vehicles, machinery, hemoglobin in blood',
    fact:'Earth\'s core is mostly iron and nickel; the planet\'s magnetic field comes from liquid iron in the outer core' },
  { symbol:'Co', name:'Cobalt',        n:27,  mass:58.933,   cat:'transition-metal', period:4, group:9,
    config:'[Ar]3d⁷4s²', eneg:1.88, radius:125, melt:1768, boil:3143, density:8.9,
    shells:[2,8,15,2], discovered:'Brandt', year:1735,
    uses:'Lithium-ion batteries, superalloys for jet engines, blue glass/ceramic pigments, magnets',
    fact:'Vitamin B₁₂ is a cobalt-containing compound — essential for nerve function' },
  { symbol:'Ni', name:'Nickel',        n:28,  mass:58.693,   cat:'transition-metal', period:4, group:10,
    config:'[Ar]3d⁸4s²', eneg:1.91, radius:124, melt:1728, boil:3186, density:8.908,
    shells:[2,8,16,2], discovered:'Cronstedt', year:1751,
    uses:'Stainless steel, coins, rechargeable batteries, catalysts, electroplating',
    fact:'Meteoric iron often contains 5-25% nickel — ancient peoples used it for tools and weapons' },
  { symbol:'Cu', name:'Copper',        n:29,  mass:63.546,   cat:'transition-metal', period:4, group:11,
    config:'[Ar]3d¹⁰4s¹', eneg:1.90, radius:128, melt:1358, boil:2835, density:8.96,
    shells:[2,8,18,1], discovered:'Ancient', year:null,
    uses:'Electrical wiring, plumbing, coins, alloys (brass, bronze), antimicrobial surfaces',
    fact:'The Statue of Liberty is made of copper — it weighed 80 tons when new and was originally shiny brown' },
  { symbol:'Zn', name:'Zinc',          n:30,  mass:65.38,    cat:'transition-metal', period:4, group:12,
    config:'[Ar]3d¹⁰4s²', eneg:1.65, radius:122, melt:693, boil:1180, density:7.133,
    shells:[2,8,18,2], discovered:'Ancient', year:null,
    uses:'Galvanizing steel, brass alloys, sunscreen (ZnO), dietary supplement',
    fact:'Humans need ~10mg of zinc daily; deficiency impairs immune function and wound healing' },
  // Continue with remaining elements (simplified for brevity — production version has all 118)
  { symbol:'Ga', name:'Gallium',       n:31,  mass:69.723,   cat:'post-transition', period:4, group:13,
    config:'[Ar]3d¹⁰4s²4p¹', eneg:1.81, radius:122, melt:303, boil:2477, density:5.91,
    shells:[2,8,18,3], discovered:'Lecoq de Boisbaudran', year:1875,
    uses:'LEDs, semiconductors, solar cells, thermometers',
    fact:'Melts in your hand — its melting point is 29.76°C, just above room temperature' },
  { symbol:'Ge', name:'Germanium',     n:32,  mass:72.630,   cat:'metalloid',      period:4, group:14,
    config:'[Ar]3d¹⁰4s²4p²', eneg:2.01, radius:120, melt:1211, boil:3106, density:5.323,
    shells:[2,8,18,4], discovered:'Winkler', year:1886,
    uses:'Fiber optic cables, infrared optics, solar cells, semiconductors',
    fact:'Predicted by Mendeleev 15 years before its discovery — he called it "eka-silicon"' },
  { symbol:'As', name:'Arsenic',       n:33,  mass:74.922,   cat:'metalloid',      period:4, group:15,
    config:'[Ar]3d¹⁰4s²4p³', eneg:2.18, radius:119, melt:1090, boil:887, density:5.727,
    shells:[2,8,18,5], discovered:'Albertus Magnus', year:1250,
    uses:'Wood preservatives, semiconductors, lead alloys, pesticides (historical)',
    fact:'Used as a poison throughout history; Napoleon may have died from arsenic in his wallpaper' },
  { symbol:'Se', name:'Selenium',      n:34,  mass:78.971,   cat:'nonmetal',       period:4, group:16,
    config:'[Ar]3d¹⁰4s²4p⁴', eneg:2.55, radius:120, melt:494, boil:958, density:4.809,
    shells:[2,8,18,6], discovered:'Berzelius', year:1817,
    uses:'Solar cells, photocopiers, glass manufacturing, dietary supplement',
    fact:'Selenium is essential for humans but toxic in large doses — just 400μg/day causes selenosis' },
  { symbol:'Br', name:'Bromine',       n:35,  mass:79.904,   cat:'halogen',        period:4, group:17,
    config:'[Ar]3d¹⁰4s²4p⁵', eneg:2.96, radius:114, melt:266, boil:332, density:3.122,
    shells:[2,8,18,7], discovered:'Balard & Löwig', year:1826,
    uses:'Flame retardants, photography (historical), sedatives, fumigants',
    fact:'One of only two elements that is liquid at room temperature (mercury is the other)' },
  { symbol:'Kr', name:'Krypton',       n:36,  mass:83.798,   cat:'noble-gas',      period:4, group:18,
    config:'[Ar]3d¹⁰4s²4p⁶', eneg:null, radius:88, melt:116, boil:120, density:0.00374,
    shells:[2,8,18,8], discovered:'Ramsay & Travers', year:1898,
    uses:'Photography flash lamps, lasers, energy-efficient windows, airport lighting',
    fact:'Named after the Greek word for "hidden"; the metre was once defined by a krypton-86 emission line' },
  // Period 5 (simplified — key elements)
  { symbol:'Rb', name:'Rubidium',      n:37,  mass:85.468,   cat:'alkali-metal',   period:5, group:1,
    config:'[Kr]5s¹', eneg:0.82, radius:248, melt:312, boil:961, density:1.532,
    shells:[2,8,18,8,1], discovered:'Bunsen & Kirchhoff', year:1861,
    uses:'Atomic clocks, photomultiplier tubes, specialty glasses, medical imaging',
    fact:'So reactive it spontaneously ignites in air and explodes in water' },
  { symbol:'Sr', name:'Strontium',     n:38,  mass:87.620,   cat:'alkaline-earth', period:5, group:2,
    config:'[Kr]5s²', eneg:0.95, radius:215, melt:1050, boil:1655, density:2.64,
    shells:[2,8,18,8,2], discovered:'Crawford', year:1790,
    uses:'Red fireworks and flares, CRT televisions (historical), bone density studies',
    fact:'Strontium-90 from nuclear fallout accumulates in bones, replacing calcium — it was the Cold War\'s great health fear' },
  { symbol:'Ag', name:'Silver',        n:47,  mass:107.868,  cat:'transition-metal', period:5, group:11,
    config:'[Kr]4d¹⁰5s¹', eneg:1.93, radius:144, melt:1235, boil:2435, density:10.501,
    shells:[2,8,18,18,1], discovered:'Ancient', year:null,
    uses:'Jewelry, photography (historical), electrical contacts, mirrors, antimicrobial',
    fact:'Best electrical conductor of all elements — used in high-spec electronics where cost is no object' },
  { symbol:'Sn', name:'Tin',           n:50,  mass:118.710,  cat:'post-transition', period:5, group:14,
    config:'[Kr]4d¹⁰5s²5p²', eneg:1.96, radius:141, melt:505, boil:2875, density:7.31,
    shells:[2,8,18,18,4], discovered:'Ancient', year:null,
    uses:'Soldering, tin cans (tin-coated steel), bronze (with copper), anti-corrosion coating',
    fact:'"Tin cry" — pure tin makes an audible crackling sound when bent due to crystal twinning' },
  { symbol:'I',  name:'Iodine',        n:53,  mass:126.904,  cat:'halogen',        period:5, group:17,
    config:'[Kr]4d¹⁰5s²5p⁵', eneg:2.66, radius:133, melt:387, boil:457, density:4.933,
    shells:[2,8,18,18,7], discovered:'Courtois', year:1811,
    uses:'Antiseptics (iodine solution), thyroid supplements, X-ray contrast agents, photography',
    fact:'Sublimes directly from solid to purple gas at room temperature — iodine crystals in a warm hand produce purple vapor' },
  { symbol:'Xe', name:'Xenon',         n:54,  mass:131.293,  cat:'noble-gas',      period:5, group:18,
    config:'[Kr]4d¹⁰5s²5p⁶', eneg:2.60, radius:108, melt:161, boil:165, density:0.005887,
    shells:[2,8,18,18,8], discovered:'Ramsay & Travers', year:1898,
    uses:'Flash lamps, ion propulsion (spacecraft), medical anesthesia, semiconductor manufacturing',
    fact:'First noble gas to form a stable compound (XePtF₆) — disproved the "inert gas" assumption in 1962' },
  // Period 6 key elements
  { symbol:'Cs', name:'Caesium',       n:55,  mass:132.905,  cat:'alkali-metal',   period:6, group:1,
    config:'[Xe]6s¹', eneg:0.79, radius:265, melt:302, boil:944, density:1.873,
    shells:[2,8,18,18,8,1], discovered:'Bunsen & Kirchhoff', year:1860,
    uses:'Atomic clocks (the SI second is defined by caesium-133), photoelectric cells',
    fact:'The most accurate clocks in existence use caesium — accurate to 1 second in 300 million years' },
  { symbol:'Ba', name:'Barium',        n:56,  mass:137.327,  cat:'alkaline-earth', period:6, group:2,
    config:'[Xe]6s²', eneg:0.89, radius:222, melt:1000, boil:2170, density:3.51,
    shells:[2,8,18,18,8,2], discovered:'Davy', year:1808,
    uses:'Barium meal for X-ray imaging, drilling muds, fireworks (green), glass manufacturing',
    fact:'Completely opaque to X-rays — barium sulfate is safe to drink and used to X-ray the digestive system' },
  { symbol:'Au', name:'Gold',          n:79,  mass:196.967,  cat:'transition-metal', period:6, group:11,
    config:'[Xe]4f¹⁴5d¹⁰6s¹', eneg:2.54, radius:144, melt:1337, boil:3243, density:19.300,
    shells:[2,8,18,32,18,1], discovered:'Ancient', year:null,
    uses:'Jewelry, electronics (connectors), dentistry, monetary standard, aerospace',
    fact:'All the gold ever mined in human history would fit in a cube about 22 meters on each side' },
  { symbol:'Hg', name:'Mercury',       n:80,  mass:200.592,  cat:'transition-metal', period:6, group:12,
    config:'[Xe]4f¹⁴5d¹⁰6s²', eneg:2.00, radius:150, melt:234, boil:630, density:13.534,
    shells:[2,8,18,32,18,2], discovered:'Ancient', year:null,
    uses:'Thermometers (historical), fluorescent lights, dental amalgam, scientific instruments',
    fact:'The only metal that is liquid at room temperature; its density is so high that lead floats in it' },
  { symbol:'Pb', name:'Lead',          n:82,  mass:207.200,  cat:'post-transition', period:6, group:14,
    config:'[Xe]4f¹⁴5d¹⁰6s²6p²', eneg:2.33, radius:175, melt:601, boil:2022, density:11.342,
    shells:[2,8,18,32,18,4], discovered:'Ancient', year:null,
    uses:'Batteries (car batteries), radiation shielding, solder (historical), fishing weights',
    fact:'Romans used lead pipes for plumbing and lead vessels for wine — this may have contributed to the fall of Rome' },
  { symbol:'U',  name:'Uranium',       n:92,  mass:238.029,  cat:'actinide',       period:7, group:null,
    config:'[Rn]5f³6d¹7s²', eneg:1.38, radius:196, melt:1405, boil:4404, density:19.050,
    shells:[2,8,18,32,21,9,2], discovered:'Klaproth', year:1789,
    uses:'Nuclear fuel, nuclear weapons, counterweights in aircraft, colored glass (uranium glass)',
    fact:'A 1-gram pellet of uranium-235 releases the same energy as 3 tons of coal' },
  // Placeholder entries for grid completeness (21 more common ones)
  { symbol:'Y',  name:'Yttrium',       n:39,  mass:88.906,   cat:'transition-metal', period:5, group:3,  config:'[Kr]4d¹5s²', eneg:1.22, radius:180, melt:1795, boil:3618, density:4.472, shells:[2,8,18,9,2], discovered:'Gadolin', year:1794, uses:'Superconductors, LEDs, lasers, camera lenses', fact:'The town of Ytterby, Sweden has four elements named after it' },
  { symbol:'Zr', name:'Zirconium',     n:40,  mass:91.224,   cat:'transition-metal', period:5, group:4,  config:'[Kr]4d²5s²', eneg:1.33, radius:160, melt:2128, boil:4682, density:6.52, shells:[2,8,18,10,2], discovered:'Klaproth', year:1789, uses:'Nuclear reactor cladding, ceramics, cubic zirconia jewelry', fact:'Nearly transparent to thermal neutrons — ideal for nuclear fuel rod cladding' },
  { symbol:'Nb', name:'Niobium',       n:41,  mass:92.906,   cat:'transition-metal', period:5, group:5,  config:'[Kr]4d⁴5s¹', eneg:1.60, radius:146, melt:2750, boil:5017, density:8.57, shells:[2,8,18,12,1], discovered:'Hatchett', year:1801, uses:'High-strength steel alloys, superconducting magnets, jewelry', fact:'Used in the Large Hadron Collider superconducting magnets' },
  { symbol:'Mo', name:'Molybdenum',    n:42,  mass:95.950,   cat:'transition-metal', period:5, group:6,  config:'[Kr]4d⁵5s¹', eneg:2.16, radius:139, melt:2896, boil:4912, density:10.22, shells:[2,8,18,13,1], discovered:'Hjelm', year:1781, uses:'High-strength alloys, catalysts in oil refining, lubricants (MoS₂)', fact:'Essential trace element in all known organisms — nitrogenase enzyme requires it to fix nitrogen' },
  { symbol:'Tc', name:'Technetium',    n:43,  mass:98,       cat:'transition-metal', period:5, group:7,  config:'[Kr]4d⁵5s²', eneg:1.90, radius:136, melt:2430, boil:4538, density:11.50, shells:[2,8,18,13,2], discovered:'Perrier & Segrè', year:1937, uses:'Medical imaging (bone scans), radioactive tracer', fact:'First artificially created element; has no stable isotopes' },
  { symbol:'Ru', name:'Ruthenium',     n:44,  mass:101.072,  cat:'transition-metal', period:5, group:8,  config:'[Kr]4d⁷5s¹', eneg:2.20, radius:134, melt:2607, boil:4423, density:12.37, shells:[2,8,18,15,1], discovered:'Klaus', year:1844, uses:'Electrical contacts, hard drive platters, catalysts, jewelry alloys', fact:'Named after Ruthenia, the Latin name for Russia' },
  { symbol:'Rh', name:'Rhodium',       n:45,  mass:102.906,  cat:'transition-metal', period:5, group:9,  config:'[Kr]4d⁸5s¹', eneg:2.28, radius:134, melt:2237, boil:3968, density:12.41, shells:[2,8,18,16,1], discovered:'Wollaston', year:1803, uses:'Catalytic converters, jewelry (white gold plating), chemical catalysts', fact:'The rarest stable element — only about 30 tons are mined per year worldwide' },
  { symbol:'Pd', name:'Palladium',     n:46,  mass:106.420,  cat:'transition-metal', period:5, group:10, config:'[Kr]4d¹⁰', eneg:2.20, radius:137, melt:1828, boil:3236, density:12.023, shells:[2,8,18,18,0], discovered:'Wollaston', year:1803, uses:'Catalytic converters, electronics, dentistry, hydrogen purification', fact:'Can absorb 900 times its own volume of hydrogen gas' },
  { symbol:'Cd', name:'Cadmium',       n:48,  mass:112.414,  cat:'transition-metal', period:5, group:12, config:'[Kr]4d¹⁰5s²', eneg:1.69, radius:151, melt:594, boil:1040, density:8.65, shells:[2,8,18,18,2], discovered:'Stromeyer', year:1817, uses:'Rechargeable NiCd batteries, solar cells, pigments, electroplating', fact:'Itai-itai disease in Japan was caused by cadmium-contaminated rice water' },
  { symbol:'In', name:'Indium',        n:49,  mass:114.818,  cat:'post-transition', period:5, group:13, config:'[Kr]4d¹⁰5s²5p¹', eneg:1.78, radius:166, melt:430, boil:2345, density:7.31, shells:[2,8,18,18,3], discovered:'Reich & Richter', year:1863, uses:'LCD screens (ITO coating), soldering, semiconductors, bearings', fact:'Makes a high-pitched "tin cry" when bent — critical for touchscreen displays worldwide' },
  { symbol:'Sb', name:'Antimony',      n:51,  mass:121.760,  cat:'metalloid',      period:5, group:15, config:'[Kr]4d¹⁰5s²5p³', eneg:2.05, radius:140, melt:904, boil:1860, density:6.697, shells:[2,8,18,18,5], discovered:'Ancient', year:null, uses:'Flame retardants, lead-acid batteries, semiconductors', fact:'Used as eye makeup (kohl) in ancient Egypt — referenced in the Bible' },
  { symbol:'Te', name:'Tellurium',     n:52,  mass:127.600,  cat:'metalloid',      period:5, group:16, config:'[Kr]4d¹⁰5s²5p⁴', eneg:2.10, radius:123, melt:723, boil:1261, density:6.24, shells:[2,8,18,18,6], discovered:'Müller von Reichenstein', year:1783, uses:'Phase-change memory chips, thermoelectrics, solar cells', fact:'Gives garlic breath even in parts-per-billion concentrations; exposure is detectable for weeks' },
  { symbol:'La', name:'Lanthanum',     n:57,  mass:138.905,  cat:'lanthanide',     period:6, group:null, config:'[Xe]5d¹6s²', eneg:1.10, radius:187, melt:1193, boil:3737, density:6.145, shells:[2,8,18,18,9,2], discovered:'Mosander', year:1839, uses:'Camera lenses, hydrogen storage alloys, hybrid car batteries', fact:'First of the lanthanides; its name means "hidden" in Greek' },
  { symbol:'Ce', name:'Cerium',        n:58,  mass:140.116,  cat:'lanthanide',     period:6, group:null, config:'[Xe]4f¹5d¹6s²', eneg:1.12, radius:182, melt:1068, boil:3716, density:6.77, shells:[2,8,18,19,9,2], discovered:'Hisinger, Berzelius & Klaproth', year:1803, uses:'Catalytic converters, glass polishing, lighter flints, UV-blocking glass', fact:'Most abundant rare-earth element; its oxide is the polishing agent for almost all optical glass' },
  { symbol:'Nd', name:'Neodymium',     n:60,  mass:144.242,  cat:'lanthanide',     period:6, group:null, config:'[Xe]4f⁴6s²', eneg:1.14, radius:181, melt:1297, boil:3347, density:7.01, shells:[2,8,18,22,8,2], discovered:'von Welsbach', year:1885, uses:'Strongest permanent magnets (NdFeB), lasers, headphones, hard drives', fact:'Neodymium magnets are the most powerful permanent magnets; a 25g magnet can lift 9kg' },
  { symbol:'Eu', name:'Europium',      n:63,  mass:151.964,  cat:'lanthanide',     period:6, group:null, config:'[Xe]4f⁷6s²', eneg:null, radius:199, melt:1099, boil:1802, density:5.244, shells:[2,8,18,25,8,2], discovered:'Demarçay', year:1901, uses:'Red phosphor in TV screens, euro banknote anti-counterfeiting fluorescence', fact:'Euro banknotes glow red under UV light due to europium-doped phosphors' },
  { symbol:'Pt', name:'Platinum',      n:78,  mass:195.084,  cat:'transition-metal', period:6, group:10, config:'[Xe]4f¹⁴5d⁹6s¹', eneg:2.28, radius:139, melt:2041, boil:4098, density:21.45, shells:[2,8,18,32,17,1], discovered:'Ulloa', year:1735, uses:'Catalytic converters, jewelry, chemotherapy drugs (cisplatin), fuel cells', fact:'90% of all platinum ever mined has been refined since 1950' },
  { symbol:'Ra', name:'Radium',        n:88,  mass:226,      cat:'alkaline-earth', period:7, group:2,  config:'[Rn]7s²', eneg:0.90, radius:215, melt:973, boil:2010, density:5.50, shells:[2,8,18,32,18,8,2], discovered:'Marie & Pierre Curie', year:1898, uses:'Historical: luminescent watch dials; modern: medical radiation therapy (historical)', fact:'Discovered by Marie Curie — the radioactive samples she handled still contaminate her notebooks and are kept in lead boxes' },
  { symbol:'Rn', name:'Radon',         n:86,  mass:222,      cat:'noble-gas',      period:6, group:18, config:'[Xe]4f¹⁴5d¹⁰6s²6p⁶', eneg:2.20, radius:120, melt:202, boil:211, density:0.00973, shells:[2,8,18,32,18,8], discovered:'Dorn', year:1900, uses:'Cancer radiation therapy, earthquake prediction research, smoking risk indicator', fact:'Second leading cause of lung cancer after smoking — seeps into basements from uranium in soil' },

  // ── Previously missing elements (59, 61-62, 64-77, 81, 83-85, 87, 89-91, 93-118) ──
  // The original data only covered 67 of 118 elements, leaving visible gaps in the
  // periodic table grid (e.g. gold, mercury, most lanthanides, everything past
  // uranium). Filled in below so all 118 elements actually render.
  { symbol:'Pr', name:'Praseodymium', n:59, mass:140.908, cat:'lanthanide', period:6, group:null, config:'[Xe]4f³6s²', eneg:1.13, radius:182, melt:1208, boil:3403, density:6.77, shells:[2,8,18,21,8,2], discovered:'von Welsbach', year:1885, uses:'Rare-earth magnets, didymium welding-goggle glass, aircraft engine alloys', fact:'Alloyed with magnesium for aircraft engines; its name means "green twin" in Greek' },
  { symbol:'Pm', name:'Promethium', n:61, mass:145, cat:'lanthanide', period:6, group:null, config:'[Xe]4f⁵6s²', eneg:1.13, radius:183, melt:1315, boil:3273, density:7.26, shells:[2,8,18,23,8,2], discovered:'Marinsky, Glendenin & Coryell', year:1945, uses:'Nuclear batteries for spacecraft, historical luminous paint', fact:'The only lanthanide with no stable isotopes at all — every form of it is radioactive' },
  { symbol:'Sm', name:'Samarium', n:62, mass:150.36, cat:'lanthanide', period:6, group:null, config:'[Xe]4f⁶6s²', eneg:1.17, radius:180, melt:1345, boil:2067, density:7.52, shells:[2,8,18,24,8,2], discovered:'Lecoq de Boisbaudran', year:1879, uses:'Samarium-cobalt magnets (heat-resistant), cancer treatment, reactor control rods', fact:'Samarium-cobalt magnets keep their magnetism at far higher temperatures than neodymium magnets' },
  { symbol:'Gd', name:'Gadolinium', n:64, mass:157.25, cat:'lanthanide', period:6, group:null, config:'[Xe]4f⁷5d¹6s²', eneg:1.20, radius:180, melt:1585, boil:3546, density:7.90, shells:[2,8,18,25,9,2], discovered:'de Marignac', year:1880, uses:'MRI contrast agent, neutron radiography, data storage', fact:'One of the most paramagnetic elements known — used as the contrast agent in MRI scans' },
  { symbol:'Tb', name:'Terbium', n:65, mass:158.925, cat:'lanthanide', period:6, group:null, config:'[Xe]4f⁹6s²', eneg:1.20, radius:177, melt:1629, boil:3396, density:8.23, shells:[2,8,18,27,8,2], discovered:'Mosander', year:1843, uses:'Green phosphors in TVs and lamps, magnetostrictive alloys (Terfenol-D)', fact:'Named after Ytterby, Sweden — the same village that gave three other elements their names' },
  { symbol:'Dy', name:'Dysprosium', n:66, mass:162.500, cat:'lanthanide', period:6, group:null, config:'[Xe]4f¹⁰6s²', eneg:1.22, radius:178, melt:1680, boil:2840, density:8.54, shells:[2,8,18,28,8,2], discovered:'Lecoq de Boisbaudran', year:1886, uses:'Additive in neodymium magnets for heat resistance, nuclear control rods', fact:'Its name means "hard to get" in Greek, reflecting how difficult it was to separate from other rare earths' },
  { symbol:'Ho', name:'Holmium', n:67, mass:164.930, cat:'lanthanide', period:6, group:null, config:'[Xe]4f¹¹6s²', eneg:1.23, radius:176, melt:1734, boil:2993, density:8.79, shells:[2,8,18,29,8,2], discovered:'Cleve, Soret & Delafontaine', year:1878, uses:'Pole pieces for the strongest artificial magnetic fields, medical lasers', fact:'Has the highest magnetic strength of any element' },
  { symbol:'Er', name:'Erbium', n:68, mass:167.259, cat:'lanthanide', period:6, group:null, config:'[Xe]4f¹²6s²', eneg:1.24, radius:176, melt:1802, boil:3141, density:9.07, shells:[2,8,18,30,8,2], discovered:'Mosander', year:1843, uses:'Erbium-doped fiber amplifiers, pink glass and glaze coloring', fact:'Erbium-doped fiber amplifiers are what make long-distance fiber-optic internet cables work' },
  { symbol:'Tm', name:'Thulium', n:69, mass:168.934, cat:'lanthanide', period:6, group:null, config:'[Xe]4f¹³6s²', eneg:1.25, radius:176, melt:1818, boil:2223, density:9.32, shells:[2,8,18,31,8,2], discovered:'Cleve', year:1879, uses:'Portable X-ray devices, euro banknote security features', fact:'One of the rarest and most expensive of the rare-earth elements' },
  { symbol:'Yb', name:'Ytterbium', n:70, mass:173.045, cat:'lanthanide', period:6, group:null, config:'[Xe]4f¹⁴6s²', eneg:1.10, radius:176, melt:1097, boil:1469, density:6.90, shells:[2,8,18,32,8,2], discovered:'Marignac', year:1878, uses:'Atomic clocks, stainless steel strengthening, portable X-ray sources', fact:'Ytterbium atomic clocks are among the most precise timekeeping devices ever built' },
  { symbol:'Lu', name:'Lutetium', n:71, mass:174.967, cat:'lanthanide', period:6, group:null, config:'[Xe]4f¹⁴5d¹6s²', eneg:1.27, radius:174, melt:1925, boil:3675, density:9.84, shells:[2,8,18,32,9,2], discovered:'Urbain & James', year:1907, uses:'PET scan detector crystals, petroleum-cracking catalyst', fact:'The last and densest of the lanthanides, named after Lutetia, the Latin name for Paris' },
  { symbol:'Hf', name:'Hafnium', n:72, mass:178.49, cat:'transition-metal', period:6, group:4, config:'[Xe]4f¹⁴5d²6s²', eneg:1.30, radius:159, melt:2506, boil:4876, density:13.31, shells:[2,8,18,32,10,2], discovered:'Coster & Hevesy', year:1923, uses:'Nuclear reactor control rods, high-temperature ceramics, computer-chip transistors', fact:'Nuclear submarine reactors use hafnium control rods because it absorbs neutrons extremely well' },
  { symbol:'Ta', name:'Tantalum', n:73, mass:180.948, cat:'transition-metal', period:6, group:5, config:'[Xe]4f¹⁴5d³6s²', eneg:1.50, radius:146, melt:3290, boil:5731, density:16.69, shells:[2,8,18,32,11,2], discovered:'Ekeberg', year:1802, uses:'Capacitors in smartphones and laptops, surgical implants, jet engine parts', fact:'Nearly every smartphone contains tiny tantalum capacitors, prized for reliability at small size' },
  { symbol:'W',  name:'Tungsten', n:74, mass:183.84, cat:'transition-metal', period:6, group:6, config:'[Xe]4f¹⁴5d⁴6s²', eneg:2.36, radius:139, melt:3695, boil:5828, density:19.25, shells:[2,8,18,32,12,2], discovered:'Elhuyar brothers', year:1783, uses:'Incandescent light bulb filaments, drill bits, radiation shielding', fact:'Has the highest melting point of any metal — 3422°C' },
  { symbol:'Re', name:'Rhenium', n:75, mass:186.207, cat:'transition-metal', period:6, group:7, config:'[Xe]4f¹⁴5d⁵6s²', eneg:1.90, radius:137, melt:3459, boil:5869, density:21.02, shells:[2,8,18,32,13,2], discovered:'Noddack, Tacke & Berg', year:1925, uses:'Jet engine superalloys, catalysts for lead-free gasoline, thermocouples', fact:'One of the last stable elements discovered — its rarity makes it pricier than gold by weight' },
  { symbol:'Os', name:'Osmium', n:76, mass:190.23, cat:'transition-metal', period:6, group:8, config:'[Xe]4f¹⁴5d⁶6s²', eneg:2.20, radius:135, melt:3306, boil:5285, density:22.59, shells:[2,8,18,32,14,2], discovered:'Tennant', year:1803, uses:'Fountain pen tips, electrical contacts, fingerprint detection', fact:'The densest naturally occurring element on Earth' },
  { symbol:'Ir', name:'Iridium', n:77, mass:192.217, cat:'transition-metal', period:6, group:9, config:'[Xe]4f¹⁴5d⁷6s²', eneg:2.20, radius:136, melt:2719, boil:4403, density:22.56, shells:[2,8,18,32,15,2], discovered:'Tennant', year:1803, uses:'Spark plugs, crucibles for crystal growth, historical length/mass standards', fact:'A thin worldwide layer of iridium in rock strata is key evidence for the asteroid impact that killed the dinosaurs' },
  { symbol:'Tl', name:'Thallium', n:81, mass:204.38, cat:'post-transition', period:6, group:13, config:'[Xe]4f¹⁴5d¹⁰6s²6p¹', eneg:1.62, radius:156, melt:577, boil:1746, density:11.85, shells:[2,8,18,32,18,3], discovered:'Crookes', year:1861, uses:'Historically rat poison (now banned), infrared detectors, low-temperature thermometers', fact:'Once a popular odorless, tasteless poison nicknamed "inheritance powder" — now heavily restricted' },
  { symbol:'Bi', name:'Bismuth', n:83, mass:208.980, cat:'post-transition', period:6, group:15, config:'[Xe]4f¹⁴5d¹⁰6s²6p³', eneg:2.02, radius:156, melt:544, boil:1837, density:9.78, shells:[2,8,18,32,18,5], discovered:'Ancient/Agricola', year:null, uses:'Stomach medicine (Pepto-Bismol), cosmetics and pigments, low-melting solder alloys', fact:'Grows strikingly colorful, geometric "hopper" crystals due to its unusual growth pattern' },
  { symbol:'Po', name:'Polonium', n:84, mass:209, cat:'metalloid', period:6, group:16, config:'[Xe]4f¹⁴5d¹⁰6s²6p⁴', eneg:2.00, radius:168, melt:527, boil:1235, density:9.20, shells:[2,8,18,32,18,6], discovered:'Marie & Pierre Curie', year:1898, uses:'Eliminating static in machinery, historical space-probe heat source', fact:'Intensely radioactive — infamously used to poison former Russian spy Alexander Litvinenko in 2006' },
  { symbol:'At', name:'Astatine', n:85, mass:210, cat:'halogen', period:6, group:17, config:'[Xe]4f¹⁴5d¹⁰6s²6p⁵', eneg:2.20, radius:150, melt:575, boil:610, density:null, shells:[2,8,18,32,18,7], discovered:'Corson, MacKenzie & Segrè', year:1940, uses:'Experimental targeted alpha-particle cancer therapy', fact:'The rarest naturally occurring element on Earth — less than a gram exists in the crust at any moment' },
  { symbol:'Fr', name:'Francium', n:87, mass:223, cat:'alkali-metal', period:7, group:1, config:'[Rn]7s¹', eneg:0.70, radius:260, melt:300, boil:950, density:null, shells:[2,8,18,32,18,8,1], discovered:'Perey', year:1939, uses:'No practical uses — purely research, too rare and radioactive', fact:'So radioactive and short-lived that less than 30 grams exist naturally on Earth at any given time' },
  { symbol:'Ac', name:'Actinium', n:89, mass:227, cat:'actinide', period:7, group:null, config:'[Rn]6d¹7s²', eneg:1.10, radius:195, melt:1500, boil:3200, density:10.07, shells:[2,8,18,32,18,9,2], discovered:'Debierne', year:1899, uses:'Neutron source for research, targeted alpha cancer therapy (Ac-225)', fact:'Glows faintly blue in the dark — its intense radioactivity ionizes the surrounding air' },
  { symbol:'Th', name:'Thorium', n:90, mass:232.038, cat:'actinide', period:7, group:null, config:'[Rn]6d²7s²', eneg:1.30, radius:179, melt:2115, boil:5061, density:11.72, shells:[2,8,18,32,18,10,2], discovered:'Berzelius', year:1829, uses:'Proposed thorium-reactor nuclear fuel, historical gas-mantle lighting, welding electrodes', fact:'Three to four times more abundant than uranium in the Earth\'s crust, and a candidate fuel for safer reactors' },
  { symbol:'Pa', name:'Protactinium', n:91, mass:231.036, cat:'actinide', period:7, group:null, config:'[Rn]5f²6d¹7s²', eneg:1.50, radius:163, melt:1841, boil:4300, density:15.37, shells:[2,8,18,32,20,9,2], discovered:'Fajans & Göhring; Soddy & Cranston', year:1913, uses:'No significant practical uses — extremely rare and radioactive, research only', fact:'One of the rarest and most expensive naturally occurring elements on Earth' },
  { symbol:'Np', name:'Neptunium', n:93, mass:237, cat:'actinide', period:7, group:null, config:'[Rn]5f⁴6d¹7s²', eneg:1.36, radius:155, melt:917, boil:4273, density:20.45, shells:[2,8,18,32,22,9,2], discovered:'McMillan & Abelson', year:1940, uses:'Neutron detection instruments', fact:'The first synthetic transuranium element ever made, named after Neptune (following Uranus → Uranium)' },
  { symbol:'Pu', name:'Plutonium', n:94, mass:244, cat:'actinide', period:7, group:null, config:'[Rn]5f⁶7s²', eneg:1.28, radius:159, melt:913, boil:3501, density:19.86, shells:[2,8,18,32,24,8,2], discovered:'Seaborg et al.', year:1940, uses:'Nuclear weapons, reactor fuel (MOX fuel), radioisotope thermoelectric generators', fact:'Its steady radioactive heat output powers NASA deep-space probes like Voyager and the Mars rovers' },
  { symbol:'Am', name:'Americium', n:95, mass:243, cat:'actinide', period:7, group:null, config:'[Rn]5f⁷7s²', eneg:1.30, radius:173, melt:1449, boil:2880, density:12.0, shells:[2,8,18,32,25,8,2], discovered:'Seaborg et al.', year:1944, uses:'Ionization-chamber smoke detectors, industrial thickness gauges', fact:'Nearly every household smoke detector contains a tiny amount of americium-241' },
  { symbol:'Cm', name:'Curium', n:96, mass:247, cat:'actinide', period:7, group:null, config:'[Rn]5f⁷6d¹7s²', eneg:1.30, radius:174, melt:1613, boil:3383, density:13.51, shells:[2,8,18,32,25,9,2], discovered:'Seaborg et al.', year:1944, uses:'Power source for space probes, X-ray spectrometer calibration on Mars rovers', fact:'Named after Marie and Pierre Curie; a curium X-ray spectrometer flew on the Mars Curiosity rover' },
  { symbol:'Bk', name:'Berkelium', n:97, mass:247, cat:'actinide', period:7, group:null, config:'[Rn]5f⁹7s²', eneg:1.30, radius:null, melt:1259, boil:2900, density:14.79, shells:[2,8,18,32,27,8,2], discovered:'Seaborg, Thompson & Ghiorso', year:1949, uses:'Research precursor for synthesizing even heavier elements', fact:'Named after Berkeley, California, where it was first synthesized' },
  { symbol:'Cf', name:'Californium', n:98, mass:251, cat:'actinide', period:7, group:null, config:'[Rn]5f¹⁰7s²', eneg:1.30, radius:null, melt:1173, boil:1743, density:15.1, shells:[2,8,18,32,28,8,2], discovered:'Seaborg, Thompson, Street & Ghiorso', year:1950, uses:'Portable neutron source for metal detectors and oil-well logging, cancer radiation therapy', fact:'One gram is worth roughly $27 million, making it among the most expensive materials on Earth' },
  { symbol:'Es', name:'Einsteinium', n:99, mass:252, cat:'actinide', period:7, group:null, config:'[Rn]5f¹¹7s²', eneg:1.30, radius:null, melt:1133, boil:null, density:8.84, shells:[2,8,18,32,29,8,2], discovered:'Ghiorso et al.', year:1952, uses:'Purely research', fact:'First discovered in the radioactive fallout debris of the 1952 "Ivy Mike" hydrogen bomb test' },
  { symbol:'Fm', name:'Fermium', n:100, mass:257, cat:'actinide', period:7, group:null, config:'[Rn]5f¹²7s²', eneg:1.30, radius:null, melt:1800, boil:null, density:null, shells:[2,8,18,32,30,8,2], discovered:'Ghiorso et al.', year:1952, uses:'Purely research', fact:'Named after physicist Enrico Fermi; the heaviest element formed by neutron bombardment of lighter ones' },
  { symbol:'Md', name:'Mendelevium', n:101, mass:258, cat:'actinide', period:7, group:null, config:'[Rn]5f¹³7s²', eneg:1.30, radius:null, melt:1100, boil:null, density:null, shells:[2,8,18,32,31,8,2], discovered:'Seaborg, Ghiorso et al.', year:1955, uses:'Purely research', fact:'Named after Dmitri Mendeleev, creator of the periodic table — fittingly made one atom at a time' },
  { symbol:'No', name:'Nobelium', n:102, mass:259, cat:'actinide', period:7, group:null, config:'[Rn]5f¹⁴7s²', eneg:1.30, radius:null, melt:1100, boil:null, density:null, shells:[2,8,18,32,32,8,2], discovered:'Joint Institute for Nuclear Research / Berkeley (disputed)', year:1958, uses:'Purely research', fact:'Named after the Nobel Institute in Stockholm where it was first reported' },
  { symbol:'Lr', name:'Lawrencium', n:103, mass:266, cat:'actinide', period:7, group:null, config:'[Rn]5f¹⁴7s²7p¹', eneg:null, radius:null, melt:1900, boil:null, density:null, shells:[2,8,18,32,32,8,3], discovered:'Ghiorso et al.', year:1961, uses:'Purely research', fact:'Named after Ernest Lawrence, inventor of the cyclotron used to create many superheavy elements — the last actinide' },
  { symbol:'Rf', name:'Rutherfordium', n:104, mass:267, cat:'transition-metal', period:7, group:4, config:'[Rn]5f¹⁴6d²7s²', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,10,2], discovered:'Dubna / Berkeley (disputed)', year:1964, uses:'Purely research', fact:'Named after physicist Ernest Rutherford; so unstable it can only be studied one atom at a time' },
  { symbol:'Db', name:'Dubnium', n:105, mass:268, cat:'transition-metal', period:7, group:5, config:'[Rn]5f¹⁴6d³7s²', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,11,2], discovered:'Dubna / Berkeley (disputed)', year:1967, uses:'Purely research', fact:'Named after Dubna, Russia, home of the Joint Institute for Nuclear Research' },
  { symbol:'Sg', name:'Seaborgium', n:106, mass:269, cat:'transition-metal', period:7, group:6, config:'[Rn]5f¹⁴6d⁴7s²', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,12,2], discovered:'Berkeley', year:1974, uses:'Purely research', fact:'The only element ever named after a person who was still alive at the time — chemist Glenn Seaborg' },
  { symbol:'Bh', name:'Bohrium', n:107, mass:270, cat:'transition-metal', period:7, group:7, config:'[Rn]5f¹⁴6d⁵7s²', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,13,2], discovered:'GSI Darmstadt', year:1981, uses:'Purely research', fact:'Named after physicist Niels Bohr; fewer than a handful of atoms have ever been made' },
  { symbol:'Hs', name:'Hassium', n:108, mass:269, cat:'transition-metal', period:7, group:8, config:'[Rn]5f¹⁴6d⁶7s²', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,14,2], discovered:'GSI Darmstadt', year:1984, uses:'Purely research', fact:'Named after Hesse, the German state where it was discovered' },
  { symbol:'Mt', name:'Meitnerium', n:109, mass:278, cat:'transition-metal', period:7, group:9, config:'[Rn]5f¹⁴6d⁷7s²', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,15,2], discovered:'GSI Darmstadt', year:1982, uses:'Purely research', fact:'Named after physicist Lise Meitner, who helped explain nuclear fission but was overlooked for the Nobel Prize' },
  { symbol:'Ds', name:'Darmstadtium', n:110, mass:281, cat:'transition-metal', period:7, group:10, config:'[Rn]5f¹⁴6d⁸7s² (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,16,2], discovered:'GSI Darmstadt', year:1994, uses:'Purely research', fact:'Named after Darmstadt, Germany, home to the lab where it and several other superheavy elements were made' },
  { symbol:'Rg', name:'Roentgenium', n:111, mass:282, cat:'transition-metal', period:7, group:11, config:'[Rn]5f¹⁴6d⁹7s² (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,17,2], discovered:'GSI Darmstadt', year:1994, uses:'Purely research', fact:'Named after Wilhelm Röntgen, discoverer of X-rays' },
  { symbol:'Cn', name:'Copernicium', n:112, mass:285, cat:'post-transition', period:7, group:12, config:'[Rn]5f¹⁴6d¹⁰7s² (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,18,2], discovered:'GSI Darmstadt', year:1996, uses:'Purely research', fact:'Predicted to behave almost like a volatile, gas-like metal — unlike any other element in its column; named after Copernicus' },
  { symbol:'Nh', name:'Nihonium', n:113, mass:286, cat:'post-transition', period:7, group:13, config:'[Rn]5f¹⁴6d¹⁰7s²7p¹ (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,18,3], discovered:'RIKEN, Japan', year:2004, uses:'Purely research', fact:'The first element discovered and named in Asia — "Nihon" is Japanese for Japan' },
  { symbol:'Fl', name:'Flerovium', n:114, mass:289, cat:'post-transition', period:7, group:14, config:'[Rn]5f¹⁴6d¹⁰7s²7p² (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,18,4], discovered:'Dubna', year:1998, uses:'Purely research', fact:'Predicted to be unusually volatile for a "metal," possibly behaving almost like a noble gas due to relativistic effects' },
  { symbol:'Mc', name:'Moscovium', n:115, mass:290, cat:'post-transition', period:7, group:15, config:'[Rn]5f¹⁴6d¹⁰7s²7p³ (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,18,5], discovered:'Dubna', year:2003, uses:'Purely research', fact:'Named after Moscow Oblast, home of the Joint Institute for Nuclear Research' },
  { symbol:'Lv', name:'Livermorium', n:116, mass:293, cat:'post-transition', period:7, group:16, config:'[Rn]5f¹⁴6d¹⁰7s²7p⁴ (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,18,6], discovered:'Dubna / Lawrence Livermore', year:2000, uses:'Purely research', fact:'Named after Lawrence Livermore National Laboratory in California' },
  { symbol:'Ts', name:'Tennessine', n:117, mass:294, cat:'halogen', period:7, group:17, config:'[Rn]5f¹⁴6d¹⁰7s²7p⁵ (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,18,7], discovered:'Dubna / Oak Ridge', year:2010, uses:'Purely research', fact:'Named after Tennessee, home of Oak Ridge National Laboratory, a key collaborator in its discovery' },
  { symbol:'Og', name:'Oganesson', n:118, mass:294, cat:'noble-gas', period:7, group:18, config:'[Rn]5f¹⁴6d¹⁰7s²7p⁶ (predicted)', eneg:null, radius:null, melt:null, boil:null, density:null, shells:[2,8,18,32,32,18,8], discovered:'Dubna', year:2002, uses:'Purely research', fact:'The heaviest element ever made; unlike every other noble gas, it is predicted to be a solid at room temperature' },
];

// ── FIRST IONIZATION ENERGY (kJ/mol), keyed by atomic number ──────────────────
// Standard reference values for Z 1-102; for the synthetic/superheavy elements
// (104+) these are theoretical/relativistic predictions, not lab measurements —
// real experimental data barely exists for most of them.
const IONIZATION_ENERGY: Record<number, number | null> = {
  1:1312.0, 2:2372.3, 3:520.2, 4:899.5, 5:800.6, 6:1086.5, 7:1402.3, 8:1313.9, 9:1681.0, 10:2080.7,
  11:495.8, 12:737.7, 13:577.5, 14:786.5, 15:1011.8, 16:999.6, 17:1251.2, 18:1520.6,
  19:418.8, 20:589.8, 21:633.1, 22:658.8, 23:650.9, 24:652.9, 25:717.3, 26:762.5, 27:760.4, 28:737.1,
  29:745.5, 30:906.4, 31:578.8, 32:762.0, 33:947.0, 34:941.0, 35:1139.9, 36:1350.8,
  37:403.0, 38:549.5, 39:600.0, 40:640.1, 41:652.1, 42:684.3, 43:702.0, 44:710.2, 45:719.7, 46:804.4,
  47:731.0, 48:867.8, 49:558.3, 50:708.6, 51:834.0, 52:869.3, 53:1008.4, 54:1170.4,
  55:375.7, 56:502.9, 57:538.1, 58:534.4, 59:527.0, 60:533.1, 61:540.0, 62:544.5, 63:547.1, 64:593.4,
  65:565.8, 66:573.0, 67:581.0, 68:589.3, 69:596.7, 70:603.4, 71:523.5,
  72:658.5, 73:761.0, 74:770.0, 75:760.0, 76:840.0, 77:880.0, 78:870.0, 79:890.1, 80:1007.1,
  81:589.4, 82:715.6, 83:703.0, 84:812.1, 85:899.0, 86:1037.0,
  87:380.0, 88:509.3, 89:499.0, 90:587.0, 91:568.0, 92:597.6, 93:604.5, 94:584.7, 95:578.0, 96:581.0,
  97:601.0, 98:608.0, 99:619.0, 100:627.0, 101:635.0, 102:642.0, 103:478.6,
  104:580.0, 105:665.0, 106:757.0, 107:740.0, 108:730.0, 109:800.0, 110:960.0, 111:1020.0, 112:1155.0,
  113:707.0, 114:832.0, 115:538.0, 116:663.0, 117:736.0, 118:860.0,
}

// ── ELECTRON AFFINITY (kJ/mol, energy released gaining an electron) ──────────
// Null where the gas-phase anion is unstable/unbound or genuinely unmeasured —
// true for the noble gases, several alkaline earths/transition metals, and
// essentially all of the synthetic superheavy elements.
const ELECTRON_AFFINITY: Record<number, number | null> = {
  1:72.8, 2:null, 3:59.6, 4:null, 5:26.7, 6:121.8, 7:null, 8:141.0, 9:328.0, 10:null,
  11:52.8, 12:null, 13:41.8, 14:134.1, 15:72.0, 16:200.4, 17:349.0, 18:null,
  19:48.4, 20:null, 21:18.1, 22:7.6, 23:50.6, 24:64.3, 25:null, 26:15.7, 27:63.7, 28:112.0,
  29:118.4, 30:null, 31:28.9, 32:119.0, 33:78.0, 34:195.0, 35:324.6, 36:null,
  37:46.9, 38:null, 39:29.6, 40:41.1, 41:86.1, 42:71.9, 43:53.0, 44:101.3, 45:109.7, 46:53.7,
  47:125.6, 48:null, 49:28.9, 50:107.3, 51:101.1, 52:190.2, 53:295.2, 54:null,
  55:45.5, 56:null, 57:48.0, 58:50.0, 59:null, 60:null, 61:null, 62:null, 63:null, 64:null,
  65:null, 66:null, 67:null, 68:null, 69:99.0, 70:null, 71:33.0,
  72:null, 73:31.0, 74:78.6, 75:14.5, 76:106.1, 77:151.0, 78:205.3, 79:222.8, 80:null,
  81:19.2, 82:35.1, 83:91.2, 84:183.3, 85:270.1, 86:null,
  87:null, 88:null, 89:null, 90:null, 91:null, 92:null, 93:null, 94:null, 95:null, 96:null,
  97:null, 98:null, 99:null, 100:null, 101:null, 102:null, 103:null,
  104:null, 105:null, 106:null, 107:null, 108:null, 109:null, 110:null, 111:null, 112:null,
  113:null, 114:null, 115:null, 116:null, 117:165.0, 118:null,
}

// ── COMMON OXIDATION STATES, most common first ────────────────────────────────
const OXIDATION_STATES: Record<number, number[]> = {
  1:[1,-1], 2:[], 3:[1], 4:[2], 5:[3], 6:[4,2,-4], 7:[5,4,3,2,-3], 8:[-2,-1], 9:[-1], 10:[],
  11:[1], 12:[2], 13:[3], 14:[4,-4], 15:[5,3,-3], 16:[6,4,2,-2], 17:[7,5,3,1,-1], 18:[],
  19:[1], 20:[2], 21:[3], 22:[4,3,2], 23:[5,4,3,2], 24:[6,3,2], 25:[7,6,4,3,2], 26:[3,2], 27:[3,2], 28:[2,3],
  29:[2,1], 30:[2], 31:[3], 32:[4,2], 33:[5,3,-3], 34:[6,4,-2], 35:[7,5,3,1,-1], 36:[],
  37:[1], 38:[2], 39:[3], 40:[4], 41:[5,3], 42:[6,4,3], 43:[7,4], 44:[8,4,3,2], 45:[3,1], 46:[2,4],
  47:[1], 48:[2], 49:[3], 50:[4,2], 51:[5,3,-3], 52:[6,4,-2], 53:[7,5,1,-1], 54:[2,4,6,8],
  55:[1], 56:[2], 57:[3], 58:[4,3], 59:[3,4], 60:[3], 61:[3], 62:[3,2], 63:[3,2], 64:[3],
  65:[3,4], 66:[3], 67:[3], 68:[3], 69:[3,2], 70:[3,2], 71:[3],
  72:[4], 73:[5], 74:[6,4], 75:[7,4], 76:[8,4,3], 77:[4,3], 78:[4,2], 79:[3,1], 80:[2,1],
  81:[3,1], 82:[4,2], 83:[3,5], 84:[4,2], 85:[-1,1,5], 86:[2],
  87:[1], 88:[2], 89:[3], 90:[4], 91:[5,4], 92:[6,5,4,3], 93:[6,5,4,3], 94:[6,5,4,3], 95:[3,4,5,6], 96:[3],
  97:[3,4], 98:[3], 99:[3], 100:[3], 101:[3,2], 102:[2,3], 103:[3],
  104:[4], 105:[5], 106:[6], 107:[7], 108:[8], 109:[], 110:[], 111:[], 112:[2],
  113:[1,3], 114:[2,4], 115:[1,3], 116:[2,4], 117:[-1,1,3,5], 118:[2,4,6],
}

// Block is derived from category/group rather than authored per-element — it's
// a structural fact about where an element sits, not independent data that can
// drift or need separate sourcing.
function getBlock(el: RawElement): ElementBlock {
  if (el.cat === 'lanthanide' || el.cat === 'actinide') return 'f'
  if (el.group === 1 || el.group === 2 || el.symbol === 'He') return 's'
  if (el.group != null && el.group >= 13) return 'p'
  return 'd'
}

export const ELEMENTS: Element[] = RAW_ELEMENTS.map(el => ({
  ...el,
  ionizationEnergy: IONIZATION_ENERGY[el.n] ?? null,
  electronAffinity: ELECTRON_AFFINITY[el.n] ?? null,
  oxidationStates: OXIDATION_STATES[el.n] ?? [],
  block: getBlock(el),
}))

// ── MOLECULE LIBRARY ──────────────────────────────────────────────────────────
// Each molecule has: id, name, formula, elements, bonds, geometry, polarity,
// molar mass, state (at room temp), description, atoms (3D positions), bondType
// Atom positions are in Angstroms relative to center of mass
export const MOLECULES: Molecule[] = [
  {
    id: 'H2O', name: 'Water', formula: 'H₂O',
    elements: ['O','H','H'],
    geometry: 'bent', polarity: 'polar', molarMass: 18.015, state: 'liquid',
    description: 'The molecule of life. Bent geometry due to two lone pairs on oxygen pushing the H-O-H bond angle to 104.5°.',
    bondType: 'covalent-polar',
    bondAngle: 104.5,
    hybridization: 'sp³',
    atoms: [
      { symbol:'O', x:0,    y:0,     z:0    },
      { symbol:'H', x:0.96, y:0.93,  z:0    },
      { symbol:'H', x:-0.96,y:0.93,  z:0    },
    ],
    bonds: [[0,1,'single'],[0,2,'single']],
    funFact: 'Water expands when it freezes — the only common substance denser as a liquid than as a solid',
  },
  {
    id: 'CO2', name: 'Carbon Dioxide', formula: 'CO₂',
    elements: ['C','O','O'],
    geometry: 'linear', polarity: 'nonpolar', molarMass: 44.010, state: 'gas',
    description: 'Linear molecule with two double bonds. Individual C=O bonds are polar but cancel out due to symmetry, making CO₂ nonpolar overall.',
    bondType: 'covalent-polar',
    bondAngle: 180,
    hybridization: 'sp',
    atoms: [
      { symbol:'O', x:-1.16, y:0, z:0 },
      { symbol:'C', x:0,     y:0, z:0 },
      { symbol:'O', x:1.16,  y:0, z:0 },
    ],
    bonds: [[0,1,'double'],[1,2,'double']],
    funFact: 'At -78.5°C CO₂ becomes dry ice — it sublimes directly from solid to gas',
  },
  {
    id: 'CH4', name: 'Methane', formula: 'CH₄',
    elements: ['C','H','H','H','H'],
    geometry: 'tetrahedral', polarity: 'nonpolar', molarMass: 16.043, state: 'gas',
    description: 'Perfect tetrahedral geometry. All four C-H bonds are identical and arranged symmetrically. Bond angle exactly 109.5°.',
    bondType: 'covalent',
    bondAngle: 109.5,
    hybridization: 'sp³',
    atoms: [
      { symbol:'C', x:0,     y:0,     z:0     },
      { symbol:'H', x:0.63,  y:0.63,  z:0.63  },
      { symbol:'H', x:-0.63, y:-0.63, z:0.63  },
      { symbol:'H', x:-0.63, y:0.63,  z:-0.63 },
      { symbol:'H', x:0.63,  y:-0.63, z:-0.63 },
    ],
    bonds: [[0,1,'single'],[0,2,'single'],[0,3,'single'],[0,4,'single']],
    funFact: 'The primary component of natural gas; cow flatulence is a significant source of atmospheric methane',
  },
  {
    id: 'NH3', name: 'Ammonia', formula: 'NH₃',
    elements: ['N','H','H','H'],
    geometry: 'trigonal-pyramidal', polarity: 'polar', molarMass: 17.031, state: 'gas',
    description: 'Trigonal pyramidal due to one lone pair on nitrogen. The lone pair compresses the H-N-H bond angle to 107°. The molecule is polar and can form hydrogen bonds.',
    bondType: 'covalent-polar',
    bondAngle: 107,
    hybridization: 'sp³',
    atoms: [
      { symbol:'N', x:0,     y:0.08,  z:0    },
      { symbol:'H', x:0,     y:-0.35, z:0.94 },
      { symbol:'H', x:0.82,  y:-0.35, z:-0.47},
      { symbol:'H', x:-0.82, y:-0.35, z:-0.47},
    ],
    bonds: [[0,1,'single'],[0,2,'single'],[0,3,'single']],
    funFact: '80% of all ammonia produced is used as fertilizer; without it, Earth could support only half its current population',
  },
  {
    id: 'NaCl', name: 'Sodium Chloride (Salt)', formula: 'NaCl',
    elements: ['Na','Cl'],
    geometry: 'ionic', polarity: 'ionic', molarMass: 58.443, state: 'solid',
    description: 'Ionic compound — sodium donates an electron to chlorine, forming Na⁺ and Cl⁻ ions held together by electrostatic attraction. Not a discrete molecule — extends as a crystal lattice.',
    bondType: 'ionic',
    bondAngle: null,
    hybridization: null,
    atoms: [
      { symbol:'Na', x:-1.19, y:0, z:0 },
      { symbol:'Cl', x:1.19,  y:0, z:0 },
    ],
    bonds: [[0,1,'ionic']],
    funFact: 'The first material humans ever traded; Roman soldiers were sometimes paid in salt — the word "salary" comes from Latin "salarium"',
  },
  {
    id: 'O2', name: 'Oxygen Gas', formula: 'O₂',
    elements: ['O','O'],
    geometry: 'linear', polarity: 'nonpolar', molarMass: 31.998, state: 'gas',
    description: 'Diatomic molecule with a double bond. Paramagnetic — attracted to magnetic fields due to two unpaired electrons (an exception to simple Lewis structure predictions).',
    bondType: 'covalent',
    bondAngle: 180,
    hybridization: 'sp²',
    atoms: [
      { symbol:'O', x:-0.60, y:0, z:0 },
      { symbol:'O', x:0.60,  y:0, z:0 },
    ],
    bonds: [[0,1,'double']],
    funFact: 'Liquid oxygen is pale blue and strongly magnetic — it will cling to a magnet',
  },
  {
    id: 'N2', name: 'Nitrogen Gas', formula: 'N₂',
    elements: ['N','N'],
    geometry: 'linear', polarity: 'nonpolar', molarMass: 28.014, state: 'gas',
    description: 'Triple bond — one of the strongest bonds in chemistry (945 kJ/mol). This is why nitrogen is so unreactive despite making up 78% of the atmosphere.',
    bondType: 'covalent',
    bondAngle: 180,
    hybridization: 'sp',
    atoms: [
      { symbol:'N', x:-0.55, y:0, z:0 },
      { symbol:'N', x:0.55,  y:0, z:0 },
    ],
    bonds: [[0,1,'triple']],
    funFact: 'Breaking the N≡N triple bond requires over 900 kJ/mol — this is why nitrogen fixation requires either lightning, the Haber process, or specialized bacteria',
  },
  {
    id: 'H2', name: 'Hydrogen Gas', formula: 'H₂',
    elements: ['H','H'],
    geometry: 'linear', polarity: 'nonpolar', molarMass: 2.016, state: 'gas',
    description: 'Simplest molecule — a single covalent bond between two hydrogen atoms. Most abundant molecule in the universe.',
    bondType: 'covalent',
    bondAngle: 180,
    hybridization: 's',
    atoms: [
      { symbol:'H', x:-0.37, y:0, z:0 },
      { symbol:'H', x:0.37,  y:0, z:0 },
    ],
    bonds: [[0,1,'single']],
    funFact: 'The most abundant molecule in the universe; the Sun fuses about 620 million tons of hydrogen per second',
  },
  {
    id: 'HCl', name: 'Hydrogen Chloride', formula: 'HCl',
    elements: ['H','Cl'],
    geometry: 'linear', polarity: 'polar', molarMass: 36.461, state: 'gas',
    description: 'Polar covalent bond. The large electronegativity difference (Cl=3.16, H=2.20) creates a significant dipole moment. Dissolves in water to form hydrochloric acid.',
    bondType: 'covalent-polar',
    bondAngle: 180,
    hybridization: 'sp³',
    atoms: [
      { symbol:'H',  x:-0.64, y:0, z:0 },
      { symbol:'Cl', x:0.64,  y:0, z:0 },
    ],
    bonds: [[0,1,'single']],
    funFact: 'Produced naturally in your stomach as hydrochloric acid (pH ~1.5) to digest food and kill bacteria',
  },
  {
    id: 'C6H6', name: 'Benzene', formula: 'C₆H₆',
    elements: ['C','C','C','C','C','C','H','H','H','H','H','H'],
    geometry: 'planar', polarity: 'nonpolar', molarMass: 78.114, state: 'liquid',
    description: 'Aromatic ring with delocalized electrons. All C-C bonds are identical (length between single and double bond) due to electron delocalization. Flat, hexagonal structure.',
    bondType: 'aromatic',
    bondAngle: 120,
    hybridization: 'sp²',
    atoms: [
      { symbol:'C', x:1.40,  y:0,     z:0    },
      { symbol:'C', x:0.70,  y:1.21,  z:0    },
      { symbol:'C', x:-0.70, y:1.21,  z:0    },
      { symbol:'C', x:-1.40, y:0,     z:0    },
      { symbol:'C', x:-0.70, y:-1.21, z:0    },
      { symbol:'C', x:0.70,  y:-1.21, z:0    },
      { symbol:'H', x:2.48,  y:0,     z:0    },
      { symbol:'H', x:1.24,  y:2.15,  z:0    },
      { symbol:'H', x:-1.24, y:2.15,  z:0    },
      { symbol:'H', x:-2.48, y:0,     z:0    },
      { symbol:'H', x:-1.24, y:-2.15, z:0    },
      { symbol:'H', x:1.24,  y:-2.15, z:0    },
    ],
    bonds: [[0,1,'aromatic'],[1,2,'aromatic'],[2,3,'aromatic'],[3,4,'aromatic'],[4,5,'aromatic'],[5,0,'aromatic'],
            [0,6,'single'],[1,7,'single'],[2,8,'single'],[3,9,'single'],[4,10,'single'],[5,11,'single']],
    funFact: 'Kekulé reportedly dreamed of a snake biting its own tail and awoke with the ring structure insight',
  },
  {
    id: 'SO2', name: 'Sulfur Dioxide', formula: 'SO₂',
    elements: ['S','O','O'],
    geometry: 'bent', polarity: 'polar', molarMass: 64.066, state: 'gas',
    description: 'Bent like water, due to one lone pair on sulfur. The S=O bonds are polar and the bent geometry means the dipoles do not cancel — SO₂ is polar overall.',
    bondType: 'covalent-polar',
    bondAngle: 119,
    hybridization: 'sp²',
    atoms: [
      { symbol:'S', x:0,     y:0.06,  z:0 },
      { symbol:'O', x:1.24,  y:-0.53, z:0 },
      { symbol:'O', x:-1.24, y:-0.53, z:0 },
    ],
    bonds: [[0,1,'double'],[0,2,'double']],
    funFact: 'The main cause of acid rain — SO₂ from coal power plants reacts with water to form sulfuric acid',
  },
  {
    id: 'HF', name: 'Hydrogen Fluoride', formula: 'HF',
    elements: ['H','F'],
    geometry: 'linear', polarity: 'polar', molarMass: 20.006, state: 'gas',
    description: 'Most polar diatomic molecule — F has the highest electronegativity (3.98). Strong hydrogen bonding raises boiling point far above expected. Extremely corrosive.',
    bondType: 'covalent-polar',
    bondAngle: 180,
    hybridization: 'sp³',
    atoms: [
      { symbol:'H', x:-0.46, y:0, z:0 },
      { symbol:'F', x:0.46,  y:0, z:0 },
    ],
    bonds: [[0,1,'single']],
    funFact: 'Can dissolve glass — the only common substance that etches silicon dioxide; stored in plastic containers',
  },
  {
    id: 'O3', name: 'Ozone', formula: 'O₃',
    elements: ['O','O','O'],
    geometry: 'bent', polarity: 'polar', molarMass: 47.997, state: 'gas',
    description: 'Bent, resonance-stabilized molecule — the true structure is an average of two Lewis structures, each with one O=O double bond and one O-O single bond. The stratospheric ozone layer absorbs most of the Sun\'s UV-B radiation.',
    bondType: 'covalent-polar',
    bondAngle: 117,
    hybridization: 'sp²',
    atoms: [
      { symbol:'O', x:0,     y:0.1,  z:0 },
      { symbol:'O', x:1.14,  y:-0.55,z:0 },
      { symbol:'O', x:-1.14, y:-0.55,z:0 },
    ],
    bonds: [[0,1,'double'],[0,2,'double']],
    funFact: 'A single ozone molecule can absorb thousands of UV photons before breaking down — this is the entire reason life could move onto land',
  },
  {
    id: 'H2O2', name: 'Hydrogen Peroxide', formula: 'H₂O₂',
    elements: ['H','O','O','H'],
    geometry: 'open-book', polarity: 'polar', molarMass: 34.015, state: 'liquid',
    description: 'A non-planar "open book" shape — the two O-H bonds sit at roughly a 90° dihedral angle to each other around the central O-O bond, which is unusually weak and makes H₂O₂ a strong oxidizer.',
    bondType: 'covalent-polar',
    bondAngle: 94.8,
    hybridization: 'sp³',
    atoms: [
      { symbol:'O', x:-0.73, y:0.05,  z:0    },
      { symbol:'O', x:0.73,  y:0.05,  z:0    },
      { symbol:'H', x:-0.88, y:-0.36, z:0.82 },
      { symbol:'H', x:0.88,  y:-0.36, z:-0.82},
    ],
    bonds: [[0,1,'single'],[0,2,'single'],[1,3,'single']],
    funFact: 'Used as a rocket propellant oxidizer and hair bleach; its weak O-O bond is exactly why it decomposes so readily into water and oxygen',
  },
  {
    id: 'C2H6O', name: 'Ethanol', formula: 'C₂H₅OH',
    elements: ['C','C','O','H','H','H','H','H','H'],
    geometry: 'tetrahedral', polarity: 'polar', molarMass: 46.068, state: 'liquid',
    description: 'A two-carbon chain ending in a hydroxyl (-OH) group. The polar -OH lets ethanol hydrogen-bond with water (fully miscible) while the nonpolar carbon chain also dissolves nonpolar substances — this dual nature is why it is such a versatile solvent.',
    bondType: 'covalent-polar',
    bondAngle: 109.5,
    hybridization: 'sp³',
    atoms: [
      { symbol:'C', x:-1.2, y:0.3,  z:0    },
      { symbol:'C', x:0.0,  y:-0.3, z:0    },
      { symbol:'O', x:1.2,  y:0.3,  z:0    },
      { symbol:'H', x:1.9,  y:-0.2, z:0    },
      { symbol:'H', x:-1.2, y:1.0,  z:0.8  },
      { symbol:'H', x:-1.2, y:1.0,  z:-0.8 },
      { symbol:'H', x:-2.1, y:-0.3, z:0    },
      { symbol:'H', x:0.0,  y:-1.0, z:0.8  },
      { symbol:'H', x:0.0,  y:-1.0, z:-0.8 },
    ],
    bonds: [[0,1,'single'],[1,2,'single'],[2,3,'single'],[0,4,'single'],[0,5,'single'],[0,6,'single'],[1,7,'single'],[1,8,'single']],
    funFact: 'The alcohol in beer, wine, and spirits — produced by yeast fermenting sugar, and one of the first chemicals humans learned to deliberately synthesize',
  },
  {
    id: 'C2H4O2', name: 'Acetic Acid', formula: 'CH₃COOH',
    elements: ['C','C','O','O','H','H','H','H'],
    geometry: 'trigonal-planar', polarity: 'polar', molarMass: 60.052, state: 'liquid',
    description: 'A carboxylic acid — a methyl group attached to a carbon that carries both a C=O (carbonyl) and a C-O-H (hydroxyl) group. The O-H hydrogen is acidic because the resulting negative charge is stabilized across both oxygens.',
    bondType: 'covalent-polar',
    bondAngle: 120,
    hybridization: 'sp²',
    atoms: [
      { symbol:'C', x:-1.5, y:0.3,  z:0   },
      { symbol:'C', x:0.0,  y:-0.2, z:0   },
      { symbol:'O', x:0.3,  y:-1.5, z:0.3 },
      { symbol:'O', x:1.1,  y:0.7,  z:0   },
      { symbol:'H', x:2.0,  y:0.3,  z:0   },
      { symbol:'H', x:-1.6, y:1.0,  z:0.9 },
      { symbol:'H', x:-1.6, y:1.0,  z:-0.9},
      { symbol:'H', x:-2.4, y:-0.3, z:0   },
    ],
    bonds: [[0,1,'single'],[1,2,'double'],[1,3,'single'],[3,4,'single'],[0,5,'single'],[0,6,'single'],[0,7,'single']],
    funFact: 'Gives vinegar its sour taste and sharp smell — table vinegar is roughly 4-8% acetic acid dissolved in water',
  },
  {
    id: 'CH4O', name: 'Methanol', formula: 'CH₃OH',
    elements: ['C','O','H','H','H','H'],
    geometry: 'tetrahedral', polarity: 'polar', molarMass: 32.042, state: 'liquid',
    description: 'The simplest alcohol — a single carbon bonded to a hydroxyl group. Structurally almost identical to ethanol, but the shorter carbon chain and the way the body metabolizes it into toxic formaldehyde and formic acid make it dangerous to ingest.',
    bondType: 'covalent-polar',
    bondAngle: 109.5,
    hybridization: 'sp³',
    atoms: [
      { symbol:'C', x:-0.7, y:0,    z:0   },
      { symbol:'O', x:0.7,  y:0,    z:0   },
      { symbol:'H', x:1.3,  y:0.8,  z:0   },
      { symbol:'H', x:-1.1, y:0.9,  z:0.5 },
      { symbol:'H', x:-1.1, y:0.9,  z:-0.5},
      { symbol:'H', x:-1.1, y:-1.0, z:0   },
    ],
    bonds: [[0,1,'single'],[1,2,'single'],[0,3,'single'],[0,4,'single'],[0,5,'single']],
    funFact: 'Sometimes called "wood alcohol"; unlike ethanol it is metabolized into formaldehyde and formic acid, which is why drinking it can cause blindness or death',
  },
  {
    id: 'NaOH', name: 'Sodium Hydroxide', formula: 'NaOH',
    elements: ['Na','O','H'],
    geometry: 'linear', polarity: 'ionic', molarMass: 39.997, state: 'solid',
    description: 'An ionic solid in the crystal (Na⁺ and OH⁻ ions), but the hydroxide ion itself is held together by a covalent O-H bond. Extremely soluble in water and highly caustic — it reacts with fats to make soap (saponification).',
    bondType: 'ionic',
    bondAngle: null,
    hybridization: null,
    atoms: [
      { symbol:'Na', x:-1.3, y:0,   z:0 },
      { symbol:'O',  x:0,    y:0,   z:0 },
      { symbol:'H',  x:0.6,  y:0.8, z:0 },
    ],
    bonds: [[0,1,'ionic'],[1,2,'single']],
    funFact: 'Known as lye or caustic soda — its industrial name reflects how aggressively it reacts with skin and fats',
  },
  {
    id: 'CO', name: 'Carbon Monoxide', formula: 'CO',
    elements: ['C','O'],
    geometry: 'linear', polarity: 'polar', molarMass: 28.010, state: 'gas',
    description: 'A triple bond between carbon and oxygen, including one dative (coordinate) bond where oxygen donates both electrons. Colorless, odorless, and dangerous — it binds to hemoglobin far more strongly than oxygen does.',
    bondType: 'covalent-polar',
    bondAngle: 180,
    hybridization: 'sp',
    atoms: [
      { symbol:'C', x:-0.56, y:0, z:0 },
      { symbol:'O', x:0.56,  y:0, z:0 },
    ],
    bonds: [[0,1,'triple']],
    funFact: 'Binds to hemoglobin about 200 times more strongly than oxygen — which is why it is so dangerous despite having no smell or warning signs',
  },
  {
    id: 'C6H12O6', name: 'Glucose', formula: 'C₆H₁₂O₆',
    elements: ['C','C','C','C','C','C','O','O','O','O','O','O','H','H','H','H','H','H','H','H','H','H','H','H'],
    geometry: 'chain', polarity: 'polar', molarMass: 180.156, state: 'solid',
    description: 'Shown here in its open-chain (aldehyde) form — a six-carbon backbone with a C=O aldehyde at one end and a hydroxyl (-OH) group on every other carbon. In solution it mostly exists as a six-membered ring, but the open-chain form is easiest to see the atom-by-atom structure in.',
    bondType: 'covalent-polar',
    bondAngle: null,
    hybridization: 'sp³',
    atoms: [
      { symbol:'C', x:-3.75, y:0.3,  z:0   },
      { symbol:'C', x:-2.5,  y:-0.3, z:0   },
      { symbol:'C', x:-1.25, y:0.3,  z:0   },
      { symbol:'C', x:0,     y:-0.3, z:0   },
      { symbol:'C', x:1.25,  y:0.3,  z:0   },
      { symbol:'C', x:2.5,   y:-0.3, z:0   },
      { symbol:'O', x:-3.75, y:1.5,  z:0   },
      { symbol:'H', x:-4.7,  y:-0.2, z:0   },
      { symbol:'O', x:-2.5,  y:0.9,  z:1.0 },
      { symbol:'H', x:-2.5,  y:1.8,  z:1.0 },
      { symbol:'H', x:-2.5,  y:-1.1, z:-0.8},
      { symbol:'O', x:-1.25, y:-0.9, z:1.0 },
      { symbol:'H', x:-1.25, y:-1.8, z:1.0 },
      { symbol:'H', x:-1.25, y:1.1,  z:-0.8},
      { symbol:'O', x:0,     y:0.9,  z:1.0 },
      { symbol:'H', x:0,     y:1.8,  z:1.0 },
      { symbol:'H', x:0,     y:-1.1, z:-0.8},
      { symbol:'O', x:1.25,  y:-0.9, z:1.0 },
      { symbol:'H', x:1.25,  y:-1.8, z:1.0 },
      { symbol:'H', x:1.25,  y:1.1,  z:-0.8},
      { symbol:'O', x:3.75,  y:0.3,  z:0   },
      { symbol:'H', x:4.5,   y:1.0,  z:0   },
      { symbol:'H', x:2.5,   y:-1.1, z:0.8 },
      { symbol:'H', x:2.5,   y:-1.1, z:-0.8},
    ],
    bonds: [
      [0,1,'single'],[1,2,'single'],[2,3,'single'],[3,4,'single'],[4,5,'single'],
      [0,6,'double'],[0,7,'single'],
      [1,8,'single'],[8,9,'single'],[1,10,'single'],
      [2,11,'single'],[11,12,'single'],[2,13,'single'],
      [3,14,'single'],[14,15,'single'],[3,16,'single'],
      [4,17,'single'],[17,18,'single'],[4,19,'single'],
      [5,20,'single'],[20,21,'single'],[5,22,'single'],[5,23,'single'],
    ],
    funFact: 'Your brain burns roughly 120g of glucose a day — about 20% of your body\'s total energy use, despite being only 2% of your body weight',
  },
];

// ── REACTION LIBRARY ─────────────────────────────────────────────────────────
export const REACTIONS: Reaction[] = [
  {
    id: 'combustion-methane',
    name: 'Combustion of Methane',
    type: 'combustion',
    equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    reactants: ['CH4','O2','O2'],
    products:  ['CO2','H2O','H2O'],
    deltaH: -890.3,  // kJ/mol (exothermic = negative)
    description: 'The reaction that powers gas stoves and home heating. One molecule of methane reacts with two molecules of oxygen, releasing carbon dioxide, water, and 890 kJ of energy as heat.',
    bondBreaking: ['4 C-H bonds (413 kJ each)', '2 O=O double bonds (498 kJ each)'],
    bondForming: ['2 C=O double bonds in CO₂ (799 kJ each)', '4 O-H bonds in 2H₂O (463 kJ each)'],
    energyNote: 'Exothermic — energy released exceeds energy absorbed',
  },
  {
    id: 'water-formation',
    name: 'Formation of Water',
    type: 'synthesis',
    equation: '2H₂ + O₂ → 2H₂O',
    reactants: ['H2','H2','O2'],
    products:  ['H2O','H2O'],
    deltaH: -483.6,
    description: 'The reaction inside hydrogen fuel cells. Hydrogen and oxygen combine to form water, releasing energy — the reverse of electrolysis. Used in rocket engines and fuel cells.',
    bondBreaking: ['2 H-H single bonds (436 kJ each)', '1 O=O double bond (498 kJ)'],
    bondForming: ['4 O-H bonds in 2H₂O (463 kJ each)'],
    energyNote: 'Exothermic — the basis of hydrogen as a clean fuel',
  },
  {
    id: 'haber-process',
    name: 'Haber Process (Ammonia Synthesis)',
    type: 'synthesis',
    equation: 'N₂ + 3H₂ → 2NH₃',
    reactants: ['N2','H2','H2','H2'],
    products:  ['NH3','NH3'],
    deltaH: -92.4,
    description: 'One of the most important industrial reactions in history — 50% of all nitrogen in the human body came from the Haber process. Requires an iron catalyst at 400-500°C and 150-300 atm.',
    bondBreaking: ['1 N≡N triple bond (945 kJ) — the hardest part', '3 H-H single bonds (436 kJ each)'],
    bondForming: ['6 N-H bonds in 2NH₃ (391 kJ each)'],
    energyNote: 'Mildly exothermic; high pressure and catalyst required to achieve practical reaction rate',
  },
  {
    id: 'acid-base',
    name: 'Neutralization (HCl + NaOH)',
    type: 'acid-base',
    equation: 'HCl + NaOH → NaCl + H₂O',
    reactants: ['HCl','NaOH'],
    products:  ['NaCl','H2O'],
    deltaH: -57.3,
    description: 'Classic acid-base neutralization. The H⁺ from the acid combines with OH⁻ from the base to form water. The net ionic equation is simply H⁺ + OH⁻ → H₂O.',
    bondBreaking: ['H-Cl polar covalent bond', 'Na-OH ionic bond'],
    bondForming: ['Na-Cl ionic bond', 'O-H bond in water'],
    energyNote: 'Exothermic — you can feel the flask warm up when mixing acid and base',
  },
  {
    id: 'photosynthesis',
    name: 'Photosynthesis',
    type: 'biochemical',
    equation: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂',
    reactants: ['CO2','CO2','CO2','CO2','CO2','CO2','H2O','H2O','H2O','H2O','H2O','H2O'],
    products:  ['C6H12O6','O2','O2','O2','O2','O2','O2'],
    deltaH: +2803,
    description: 'The reaction that powers almost all life on Earth. Plants use light energy to convert CO₂ and water into glucose and oxygen. The reverse of cellular respiration.',
    bondBreaking: ['6 C=O bonds in CO₂', '12 O-H bonds in H₂O'],
    bondForming: ['C-C, C-H, C-O bonds in glucose', '6 O=O bonds in O₂'],
    energyNote: 'Endothermic — requires light energy input (2803 kJ absorbed per mole of glucose)',
  },
  {
    id: 'peroxide-decomposition',
    name: 'Decomposition of Hydrogen Peroxide',
    type: 'decomposition',
    equation: '2H₂O₂ → 2H₂O + O₂',
    reactants: ['H2O2','H2O2'],
    products:  ['H2O','H2O','O2'],
    deltaH: -196.4,
    description: 'The classic "elephant toothpaste" reaction. Hydrogen peroxide is thermodynamically unstable and slowly decomposes into water and oxygen on its own — catalysts like catalase (in your blood) or manganese dioxide dramatically speed this up.',
    bondBreaking: ['2 O-O single bonds in H₂O₂ (only ~146 kJ/mol each — unusually weak)'],
    bondForming: ['1 O=O double bond in O₂', 'O-H bonds reorganized into 2H₂O'],
    energyNote: 'Exothermic — the weak O-O bond is why H₂O₂ decomposes so readily, especially with a catalyst',
  },
  {
    id: 'sodium-water',
    name: 'Sodium + Water',
    type: 'single-displacement',
    equation: '2Na + 2H₂O → 2NaOH + H₂',
    reactants: ['Na','H2O','H2O'],
    products:  ['NaOH','NaOH','H2'],
    deltaH: -368.4,
    description: 'A textbook redox demonstration — and a genuinely dangerous one. Sodium metal gives up its outer electron to water, is oxidized (0 → +1), while hydrogen in water is reduced (+1 → 0) to form H₂ gas. The reaction is violently exothermic and can ignite the hydrogen produced.',
    bondBreaking: ['Metallic bonding in solid Na', 'O-H bonds in H₂O (reorganized)'],
    bondForming: ['Na-O ionic bonds in NaOH', 'H-H bond in H₂'],
    energyNote: 'Strongly exothermic — reactive alkali metals like sodium react with water fast enough to be a genuine hazard',
  },
  {
    id: 'esterification',
    name: 'Esterification (Ethanol + Acetic Acid)',
    type: 'esterification',
    equation: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O',
    reactants: ['C2H4O2','C2H6O'],
    products:  ['C4H8O2-ethyl-acetate','H2O'],
    deltaH: +8.4,
    description: 'A condensation reaction between a carboxylic acid and an alcohol, catalyzed by acid, that forms an ester and water. This is an equilibrium reaction — it can be pushed toward products by removing water as it forms. Esters are responsible for the characteristic smell of many fruits.',
    bondBreaking: ['O-H bond in the carboxylic acid', 'C-O bond in the alcohol'],
    bondForming: ['C-O ester linkage', 'O-H bond in water'],
    energyNote: 'Roughly thermoneutral — this reaction is an equilibrium, not a one-way reaction like the others here',
  },
];

// ── BOND TYPE METADATA ────────────────────────────────────────────────────────
export const BOND_TYPES: Record<BondKind, BondTypeInfo> = {
  'single':        { label: 'Single covalent',   color: '#94a3b8', width: 0.08, description: 'Shared electron pair. Rotatable. Bond energy ~350 kJ/mol for C-C.' },
  'double':        { label: 'Double covalent',   color: '#38bdf8', width: 0.14, description: 'Two shared pairs (σ + π bond). Restricted rotation. Shorter and stronger than single.' },
  'triple':        { label: 'Triple covalent',   color: '#a78bfa', width: 0.18, description: 'Three shared pairs (σ + 2π). No rotation. Very short, very strong (C≡C: 835 kJ/mol).' },
  'ionic':         { label: 'Ionic',             color: '#fb923c', width: 0.10, description: 'Electron transfer creates ions held by electrostatic attraction. No sharing.' },
  'aromatic':      { label: 'Aromatic (delocalized)', color: '#4ade80', width: 0.11, description: 'Delocalized π electrons shared across ring. All bonds identical, intermediate length.' },
  'hydrogen':      { label: 'Hydrogen bond',     color: '#fde68a', width: 0.05, description: 'Weak attraction between δ+ hydrogen and electronegative atom. Critical for DNA and protein structure.' },
  'van-der-waals': { label: 'Van der Waals',     color: '#6b7280', width: 0.04, description: 'Weak induced dipole-dipole attraction. The only intermolecular force in nonpolar molecules.' },
  'metallic':      { label: 'Metallic',          color: '#fbbf24', width: 0.12, description: '"Sea of electrons" shared by all metal atoms. Explains conductivity, malleability, and lustre.' },
};

// ── ELEMENT GRID POSITIONS ────────────────────────────────────────────────────
// Maps atomic number to [row, col] in the standard 18-column periodic table
export const GRID_POSITIONS: Record<number, [number, number]> = {
  1:  [1,1],  2:  [1,18],
  3:  [2,1],  4:  [2,2],  5:  [2,13], 6:  [2,14], 7:  [2,15], 8:  [2,16], 9:  [2,17], 10: [2,18],
  11: [3,1],  12: [3,2],  13: [3,13], 14: [3,14], 15: [3,15], 16: [3,16], 17: [3,17], 18: [3,18],
  19: [4,1],  20: [4,2],  21: [4,3],  22: [4,4],  23: [4,5],  24: [4,6],  25: [4,7],  26: [4,8],
  27: [4,9],  28: [4,10], 29: [4,11], 30: [4,12], 31: [4,13], 32: [4,14], 33: [4,15], 34: [4,16],
  35: [4,17], 36: [4,18],
  37: [5,1],  38: [5,2],  39: [5,3],  40: [5,4],  41: [5,5],  42: [5,6],  43: [5,7],  44: [5,8],
  45: [5,9],  46: [5,10], 47: [5,11], 48: [5,12], 49: [5,13], 50: [5,14], 51: [5,15], 52: [5,16],
  53: [5,17], 54: [5,18],
  55: [6,1],  56: [6,2],  72: [6,4],  73: [6,5],  74: [6,6],  75: [6,7],  76: [6,8],
  77: [6,9],  78: [6,10], 79: [6,11], 80: [6,12], 81: [6,13], 82: [6,14], 83: [6,15], 84: [6,16],
  85: [6,17], 86: [6,18],
  87: [7,1],  88: [7,2],
  104:[7,4],  105:[7,5],  106:[7,6],  107:[7,7],  108:[7,8],  109:[7,9],  110:[7,10],
  111:[7,11], 112:[7,12], 113:[7,13], 114:[7,14], 115:[7,15], 116:[7,16], 117:[7,17], 118:[7,18],
  // Lanthanides row 8
  57: [8,3],  58: [8,4],  59: [8,5],  60: [8,6],  61: [8,7],  62: [8,8],  63: [8,9],  64: [8,10],
  65: [8,11], 66: [8,12], 67: [8,13], 68: [8,14], 69: [8,15], 70: [8,16], 71: [8,17],
  // Actinides row 9
  89: [9,3],  90: [9,4],  91: [9,5],  92: [9,6],  93: [9,7],  94: [9,8],  95: [9,9],  96: [9,10],
  97: [9,11], 98: [9,12], 99: [9,13], 100:[9,14], 101:[9,15], 102:[9,16], 103:[9,17],
};

// ── ATOM COLORS (CPK coloring scheme) ─────────────────────────────────────────
export const ATOM_COLORS: Record<string, number> = {
  H:  0xffffff, He: 0xd9ffff, Li: 0xcc80ff, Be: 0xc2ff00, B:  0xffb5b5,
  C:  0x909090, N:  0x3050f8, O:  0xff0d0d, F:  0x90e050, Ne: 0xb3e3f5,
  Na: 0xab5cf2, Mg: 0x8aff00, Al: 0xbfa6a6, Si: 0xf0c8a0, P:  0xff8000,
  S:  0xffff30, Cl: 0x1ff01f, Ar: 0x80d1e3, K:  0x8f40d4, Ca: 0x3dff00,
  Fe: 0xe06633, Cu: 0xc88033, Zn: 0x7d80b0, Ag: 0xc0c0c0, Au: 0xffd123,
  Hg: 0xb8b8d0, Pb: 0x575961, default: 0xff69b4,
};

// ── VAN DER WAALS RADII (pm) for 3D rendering ─────────────────────────────────
export const VDW_RADII: Record<string, number> = {
  H:70, He:140, Li:182, Be:153, B:192, C:170, N:155, O:152, F:147, Ne:154,
  Na:227, Mg:173, Al:184, Si:210, P:180, S:180, Cl:175, Ar:188, K:275, Ca:231,
  default: 200,
};

// ── GLOSSARY ───────────────────────────────────────────────────────────────────
// Short definitions for the core vocabulary used throughout the lab — powers
// both the inline hover <Term> component and the browsable glossary list.
export const GLOSSARY: Record<string, string> = {
  'electronegativity': 'How strongly an atom pulls shared electrons toward itself in a bond. Higher = pulls harder. Fluorine is the most electronegative element.',
  'ionization energy': 'The energy needed to remove one electron from a gaseous atom. Higher means the electrons are held more tightly — generally rises across a period and falls down a group.',
  'electron affinity': 'The energy released when a neutral atom gains one electron to form a negative ion. Higher (more energy released) usually means the atom "wants" the electron more.',
  'oxidation state': 'A number representing how many electrons an atom has effectively gained or lost in a compound — a bookkeeping tool for tracking electron transfer, especially in reactions.',
  'valence electrons': 'The electrons in an atom\'s outermost shell — these are the ones involved in bonding, and they determine most of an element\'s chemistry.',
  'atomic radius': 'A measure of the size of an atom, typically the distance from the nucleus to the outer edge of its electron cloud. Generally shrinks across a period, grows down a group.',
  'polarity (bond)': 'Whether electrons in a bond are shared evenly (nonpolar) or unevenly (polar), based on the electronegativity difference between the bonded atoms.',
  'ionic bond': 'A bond formed when one atom transfers an electron to another, creating oppositely charged ions that attract each other electrostatically — typically between a metal and a nonmetal.',
  'covalent bond': 'A bond formed when two atoms share one or more pairs of electrons — typically between two nonmetals.',
  'hybridization': 'A model describing how an atom mixes its atomic orbitals to form new, equivalent orbitals for bonding — explains molecular shapes like tetrahedral (sp³) or linear (sp).',
  'block (periodic table)': 'Which type of orbital (s, p, d, or f) an element\'s highest-energy electron occupies — determines its column region on the periodic table.',
  'isotope': 'Atoms of the same element (same number of protons) with different numbers of neutrons, and therefore different atomic masses.',
  'mole': 'A counting unit for atoms/molecules, equal to Avogadro\'s number (6.022×10²³) of particles — chemistry\'s way of counting things too small to count individually.',
  'molarity': 'A measure of solution concentration: moles of solute dissolved per liter of solution (mol/L, written M).',
  'molar mass': 'The mass of one mole of a substance, in grams per mole (g/mol) — numerically equal to the atomic/molecular mass in atomic mass units.',
  'pH': 'A logarithmic scale measuring how acidic or basic a solution is, based on hydrogen ion concentration: pH = −log[H⁺]. Below 7 is acidic, above 7 is basic.',
  'stoichiometry': 'The quantitative relationships between reactants and products in a chemical reaction, based on the balanced equation\'s coefficients.',
  'exothermic': 'A reaction that releases energy (usually as heat) to its surroundings — the products have less energy than the reactants.',
  'endothermic': 'A reaction that absorbs energy from its surroundings — the products have more energy than the reactants.',
}
