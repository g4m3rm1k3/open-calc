// Calculations.tsx
// Interactive step-through chemistry calculators: periodic trends, stoichiometry,
// solution chemistry (molarity/dilution/pH), and gas laws (PV=nRT).

import { useState, useEffect, Fragment, type ReactNode } from 'react'
import { ELEMENTS, MOLECULES, REACTIONS, type Element } from './chemistry_data'
import Term from './Term.tsx'
import { useThemeColors } from '../../hooks/useThemeColors.js'

type ThemeColors = ReturnType<typeof useThemeColors>
type CalcMode = 'menu' | 'trends' | 'stoich' | 'solution' | 'gas'

// ── Shared bits ────────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, C }: { title: string; sub: ReactNode; C: ThemeColors }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.6 }}>{sub}</div>
    </div>
  )
}

function NumberField({ label, value, onChange, C, step = 'any' }: {
  label: string; value: number; onChange: (v: number) => void; C: ThemeColors; step?: string
}) {
  return (
    <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11.5, color:C.muted }}>
      {label}
      <input type="number" step={step} value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }} />
    </label>
  )
}

interface StepListProps { steps: { title: string; body: string }[]; C: ThemeColors }

function StepList({ steps, C }: StepListProps) {
  const [i, setI] = useState(0)
  useEffect(() => { setI(0) }, [steps.length, steps[0]?.body])
  return (
    <div style={{ marginTop:16 }}>
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
        {steps.map((s, idx) => (
          <button key={idx} onClick={() => setI(idx)} style={{
            padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:11.5,
            border:`1px solid ${idx===i ? C.blue : C.border}`,
            background: idx===i ? C.blueBg : 'transparent',
            color: idx===i ? C.blue : C.muted, fontWeight: idx===i ? 600 : 400,
          }}>{idx+1}. {s.title}</button>
        ))}
      </div>
      <div style={{ padding:'14px 16px', borderRadius:10, background:C.surface2, border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:12.5, color:C.text, lineHeight:1.7, fontFamily:'monospace', whiteSpace:'pre-wrap' }}>{steps[i].body}</div>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        <button onClick={() => setI(Math.max(0, i-1))} disabled={i===0} style={{
          padding:'6px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:'transparent',
          color: i===0 ? C.hint : C.muted, fontSize:12, cursor: i===0 ? 'default' : 'pointer',
        }}>← Back</button>
        <button onClick={() => setI(Math.min(steps.length-1, i+1))} disabled={i===steps.length-1} style={{
          padding:'6px 14px', borderRadius:8, border:'none', background: i===steps.length-1 ? C.border : C.blue,
          color: i===steps.length-1 ? C.muted : '#fff', fontSize:12, cursor: i===steps.length-1 ? 'default' : 'pointer', fontWeight:600,
        }}>Next step →</button>
      </div>
    </div>
  )
}

// ── 1. Periodic Trends comparator ───────────────────────────────────────────────
function TrendsCalc({ C }: { C: ThemeColors }) {
  const [aN, setAN] = useState(11) // Na
  const [bN, setBN] = useState(17) // Cl
  const elA = ELEMENTS.find(e => e.n === aN) as Element
  const elB = ELEMENTS.find(e => e.n === bN) as Element

  const rows: [string, string, number | null, number | null][] = [
    ['electronegativity', 'Electronegativity', elA.eneg, elB.eneg],
    ['ionization energy', 'Ionization energy (kJ/mol)', elA.ionizationEnergy, elB.ionizationEnergy],
    ['electron affinity', 'Electron affinity (kJ/mol)', elA.electronAffinity, elB.electronAffinity],
    ['atomic radius', 'Atomic radius (pm)', elA.radius, elB.radius],
  ]

  const explain = () => {
    if (elA.n === elB.n) return 'Pick two different elements to compare.'
    if (elA.period === elB.period) {
      const [lo, hi] = (elA.group ?? 0) < (elB.group ?? 0) ? [elA, elB] : [elB, elA]
      return `Moving across period ${elA.period}, from group ${lo.group} (${lo.name}) to group ${hi.group} (${hi.name}), nuclear charge increases while the number of shells stays the same — so electronegativity and ionization energy tend to rise, and atomic radius tends to shrink.`
    }
    if (elA.group != null && elA.group === elB.group) {
      const [top, bottom] = elA.period < elB.period ? [elA, elB] : [elB, elA]
      return `Moving down group ${elA.group}, from period ${top.period} (${top.name}) to period ${bottom.period} (${bottom.name}), each added electron shell increases shielding and distance from the nucleus — so atomic radius grows while ionization energy and electronegativity tend to fall.`
    }
    return `${elA.name} and ${elB.name} differ in both period and group, so several trends are at play at once — compare the numbers above to see which one wins out for each property.`
  }

  return (
    <div style={{ padding:'20px 24px', maxWidth:720 }}>
      <SectionHeader C={C} title="Periodic Trends"
        sub="Pick two elements and compare how electronegativity, ionization energy, electron affinity, and atomic radius change across the periodic table." />

      <div style={{ display:'flex', gap:12, marginBottom:16 }}>
        <select value={aN} onChange={e => setAN(+e.target.value)} style={{ flex:1, padding:'8px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}>
          {ELEMENTS.map(el => <option key={el.n} value={el.n}>{el.n}. {el.name} ({el.symbol})</option>)}
        </select>
        <select value={bN} onChange={e => setBN(+e.target.value)} style={{ flex:1, padding:'8px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}>
          {ELEMENTS.map(el => <option key={el.n} value={el.n}>{el.n}. {el.name} ({el.symbol})</option>)}
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr', gap:'2px', border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'8px 10px', background:C.surface2, fontSize:10, color:C.hint, textTransform:'uppercase' }}>Property</div>
        <div style={{ padding:'8px 10px', background:C.surface2, fontSize:12, color:C.text, fontWeight:600, textAlign:'center' }}>{elA.symbol}</div>
        <div style={{ padding:'8px 10px', background:C.surface2, fontSize:12, color:C.text, fontWeight:600, textAlign:'center' }}>{elB.symbol}</div>
        {rows.map(([key, label, va, vb]) => (
          <Fragment key={key}>
            <div style={{ padding:'8px 10px', fontSize:11.5, color:C.muted, borderTop:`0.5px solid ${C.border}` }}>
              <Term word={key} C={C}>{label}</Term>
            </div>
            <div style={{ padding:'8px 10px', fontSize:12, color:C.text, fontFamily:'monospace', textAlign:'center', borderTop:`0.5px solid ${C.border}` }}>{va ?? '—'}</div>
            <div style={{ padding:'8px 10px', fontSize:12, color:C.text, fontFamily:'monospace', textAlign:'center', borderTop:`0.5px solid ${C.border}` }}>{vb ?? '—'}</div>
          </Fragment>
        ))}
      </div>

      <div style={{ marginTop:16, padding:'12px 16px', borderRadius:10, background:C.blueBg, border:`1px solid ${C.blue}` }}>
        <div style={{ fontSize:11, color:C.blue, fontWeight:600, marginBottom:4 }}>Why?</div>
        <div style={{ fontSize:12.5, color:C.text, lineHeight:1.7 }}>{explain()}</div>
      </div>
    </div>
  )
}

// ── 2. Stoichiometry step-through ───────────────────────────────────────────────
function coeffCounts(ids: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  ids.forEach(id => { out[id] = (out[id] ?? 0) + 1 })
  return out
}

function substanceInfo(id: string): { formula: string; name: string; molarMass: number } | null {
  const mol = MOLECULES.find(m => m.id === id)
  if (mol) return { formula: mol.formula, name: mol.name, molarMass: mol.molarMass }
  const el = ELEMENTS.find(e => e.symbol === id)
  if (el) return { formula: el.symbol, name: el.name, molarMass: el.mass }
  return null
}

function StoichCalc({ C }: { C: ThemeColors }) {
  const [rxnId, setRxnId] = useState(REACTIONS[0].id)
  const rxn = REACTIONS.find(r => r.id === rxnId)!
  const reactantCoeffs = coeffCounts(rxn.reactants)
  const productCoeffs  = coeffCounts(rxn.products)
  const reactantIds = Object.keys(reactantCoeffs)
  const productIds  = Object.keys(productCoeffs)

  const [startId, setStartId]   = useState(reactantIds[0])
  const [targetId, setTargetId] = useState(productIds[0])
  const [mass, setMass] = useState(10)

  useEffect(() => {
    setStartId(reactantIds[0])
    setTargetId(productIds[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rxnId])

  const startInfo  = substanceInfo(startId)
  const targetInfo = substanceInfo(targetId)

  if (!startInfo || !targetInfo) return null

  const startCoeff  = reactantCoeffs[startId] ?? 1
  const targetCoeff = productCoeffs[targetId] ?? 1
  const moles = mass / startInfo.molarMass
  const molesTarget = moles * (targetCoeff / startCoeff)
  const massTarget = molesTarget * targetInfo.molarMass

  const steps = [
    { title:'Start', body:
`We start with ${mass} g of ${startInfo.name} (${startInfo.formula}).

Balanced equation:
${rxn.equation}` },
    { title:'Mass → moles', body:
`moles = mass ÷ molar mass

moles of ${startInfo.formula} = ${mass} g ÷ ${startInfo.molarMass} g/mol
                    = ${moles.toFixed(4)} mol` },
    { title:'Mole ratio', body:
`From the balanced equation, the coefficients give the mole ratio:

${startCoeff} mol ${startInfo.formula}  :  ${targetCoeff} mol ${targetInfo.formula}` },
    { title:'Moles of target', body:
`moles of ${targetInfo.formula} = moles of ${startInfo.formula} × (coefficient of ${targetInfo.formula} ÷ coefficient of ${startInfo.formula})

                    = ${moles.toFixed(4)} mol × (${targetCoeff} ÷ ${startCoeff})
                    = ${molesTarget.toFixed(4)} mol` },
    { title:'Moles → mass', body:
`mass = moles × molar mass

mass of ${targetInfo.formula} = ${molesTarget.toFixed(4)} mol × ${targetInfo.molarMass} g/mol
                    = ${massTarget.toFixed(3)} g` },
  ]

  return (
    <div style={{ padding:'20px 24px', maxWidth:720 }}>
      <SectionHeader C={C} title="Stoichiometry"
        sub={<>Given a mass of one reactant, walk through <Term word="stoichiometry" C={C}>mass → moles → mole ratio → moles of product → mass of product</Term> using the reaction's balanced coefficients.</>} />

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11.5, color:C.muted }}>
          Reaction
          <select value={rxnId} onChange={e => setRxnId(e.target.value)} style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}>
            {REACTIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>

        <div style={{ fontSize:14, fontFamily:'monospace', color:C.text, padding:'8px 0' }}>{rxn.equation}</div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11.5, color:C.muted, flex:'1 1 160px' }}>
            Starting material
            <select value={startId} onChange={e => setStartId(e.target.value)} style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}>
              {reactantIds.map(id => <option key={id} value={id}>{substanceInfo(id)?.name ?? id}</option>)}
            </select>
          </label>
          <NumberField C={C} label="Mass (g)" value={mass} onChange={setMass} />
          <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11.5, color:C.muted, flex:'1 1 160px' }}>
            Solve for
            <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}>
              {productIds.map(id => <option key={id} value={id}>{substanceInfo(id)?.name ?? id}</option>)}
            </select>
          </label>
        </div>
      </div>

      <StepList C={C} steps={steps} />
    </div>
  )
}

// ── 3. Solution Chemistry — molarity, dilution, pH ─────────────────────────────
function MolarityCalc({ C }: { C: ThemeColors }) {
  const [moles, setMoles] = useState(0.5)
  const [volume, setVolume] = useState(2)
  const molarity = volume !== 0 ? moles / volume : 0

  const steps = [
    { title:'Formula', body:`Molarity (M) = moles of solute ÷ liters of solution` },
    { title:'Substitute', body:`M = ${moles} mol ÷ ${volume} L` },
    { title:'Answer', body:`M = ${molarity.toFixed(4)} mol/L` },
  ]

  return (
    <div>
      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}><Term word="molarity" C={C}>Molarity</Term> — M = mol ÷ L</div>
      <div style={{ display:'flex', gap:12 }}>
        <NumberField C={C} label="Moles of solute (mol)" value={moles} onChange={setMoles} />
        <NumberField C={C} label="Volume of solution (L)" value={volume} onChange={setVolume} />
      </div>
      <StepList C={C} steps={steps} />
    </div>
  )
}

function DilutionCalc({ C }: { C: ThemeColors }) {
  type Unknown = 'M1' | 'V1' | 'M2' | 'V2'
  const [unknown, setUnknown] = useState<Unknown>('M2')
  const [M1, setM1] = useState(2)
  const [V1, setV1] = useState(0.5)
  const [M2, setM2] = useState(0.5)
  const [V2, setV2] = useState(2)

  const compute = (): number => {
    if (unknown === 'M1') return V1 !== 0 ? (M2*V2)/V1 : 0
    if (unknown === 'V1') return M1 !== 0 ? (M2*V2)/M1 : 0
    if (unknown === 'M2') return V2 !== 0 ? (M1*V1)/V2 : 0
    return M2 !== 0 ? (M1*V1)/M2 : 0
  }
  const result = compute()

  const known = { M1, V1, M2, V2 }
  const labels: Record<Unknown, string> = { M1:'M₁ (initial molarity)', V1:'V₁ (initial volume)', M2:'M₂ (final molarity)', V2:'V₂ (final volume)' }

  const steps = [
    { title:'Formula', body:`M₁V₁ = M₂V₂  (moles of solute don't change when you dilute)` },
    { title:'Rearrange', body: `Solving for ${labels[unknown]}:\n\n${
        unknown==='M1' ? 'M₁ = (M₂ × V₂) ÷ V₁' :
        unknown==='V1' ? 'V₁ = (M₂ × V₂) ÷ M₁' :
        unknown==='M2' ? 'M₂ = (M₁ × V₁) ÷ V₂' :
        'V₂ = (M₁ × V₁) ÷ M₂'
      }` },
    { title:'Substitute', body: `${labels[unknown]} = ${
        unknown==='M1' ? `(${M2} × ${V2}) ÷ ${V1}` :
        unknown==='V1' ? `(${M2} × ${V2}) ÷ ${M1}` :
        unknown==='M2' ? `(${M1} × ${V1}) ÷ ${V2}` :
        `(${M1} × ${V1}) ÷ ${M2}`
      }` },
    { title:'Answer', body:`${labels[unknown]} = ${result.toFixed(4)}` },
  ]

  return (
    <div>
      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}>Dilution — M₁V₁ = M₂V₂</div>
      <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11.5, color:C.muted, marginBottom:10, maxWidth:220 }}>
        Solve for
        <select value={unknown} onChange={e => setUnknown(e.target.value as Unknown)} style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}>
          {(['M1','V1','M2','V2'] as Unknown[]).map(u => <option key={u} value={u}>{labels[u]}</option>)}
        </select>
      </label>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        {(['M1','V1','M2','V2'] as Unknown[]).filter(u => u !== unknown).map(u => (
          <NumberField key={u} C={C} label={labels[u]}
            value={known[u]}
            onChange={v => { if (u==='M1') setM1(v); if (u==='V1') setV1(v); if (u==='M2') setM2(v); if (u==='V2') setV2(v) }} />
        ))}
      </div>
      <StepList C={C} steps={steps} />
    </div>
  )
}

function PhCalc({ C }: { C: ThemeColors }) {
  const [concStr, setConcStr] = useState('1e-3')
  const conc = parseFloat(concStr)
  const valid = isFinite(conc) && conc > 0
  const ph = valid ? -Math.log10(conc) : null
  const classification = ph == null ? '—' : ph < 6.9 ? 'Acidic' : ph > 7.1 ? 'Basic' : 'Neutral'

  const steps = [
    { title:'Formula', body:`pH = −log₁₀[H⁺]` },
    { title:'Substitute', body:`[H⁺] = ${concStr} mol/L\n\npH = −log₁₀(${concStr})` },
    { title:'Answer', body: ph != null ? `pH = ${ph.toFixed(2)}\n\nThis solution is ${classification.toLowerCase()} (pH ${ph<7?'<':ph>7?'>':'='} 7).` : 'Enter a positive concentration to compute pH.' },
  ]

  return (
    <div>
      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}><Term word="ph" C={C}>pH</Term> — pH = −log[H⁺]</div>
      <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11.5, color:C.muted, maxWidth:220 }}>
        [H⁺] concentration (mol/L)
        <input value={concStr} onChange={e => setConcStr(e.target.value)} placeholder="e.g. 1e-3"
          style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13, fontFamily:'monospace' }} />
      </label>
      <StepList C={C} steps={steps} />
    </div>
  )
}

function SolutionCalc({ C }: { C: ThemeColors }) {
  const [sub, setSub] = useState<'molarity' | 'dilution' | 'ph'>('molarity')
  const TABS: { key: typeof sub; label: string }[] = [
    { key:'molarity', label:'Molarity' },
    { key:'dilution', label:'Dilution' },
    { key:'ph',       label:'pH' },
  ]
  return (
    <div style={{ padding:'20px 24px', maxWidth:720 }}>
      <SectionHeader C={C} title="Solution Chemistry"
        sub="Concentration calculations for solutions — molarity, dilution, and pH." />
      <div style={{ display:'flex', gap:6, marginBottom:18 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setSub(t.key)} style={{
            padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:12.5,
            border:`1px solid ${sub===t.key ? C.blue : C.border}`,
            background: sub===t.key ? C.blueBg : 'transparent',
            color: sub===t.key ? C.blue : C.muted, fontWeight: sub===t.key ? 600 : 400,
          }}>{t.label}</button>
        ))}
      </div>
      {sub === 'molarity' && <MolarityCalc C={C} />}
      {sub === 'dilution' && <DilutionCalc C={C} />}
      {sub === 'ph'       && <PhCalc C={C} />}
    </div>
  )
}

// ── 4. Gas Laws — PV = nRT ───────────────────────────────────────────────────────
function GasLawsCalc({ C }: { C: ThemeColors }) {
  type Unknown = 'P' | 'V' | 'n' | 'T'
  const [unknown, setUnknown] = useState<Unknown>('P')
  const [P, setP] = useState(1)
  const [V, setV] = useState(22.4)
  const [n, setN] = useState(1)
  const [T, setT] = useState(273.15)
  const R = 0.0821 // L·atm / (mol·K)

  const compute = (): number => {
    if (unknown === 'P') return V !== 0 ? (n*R*T)/V : 0
    if (unknown === 'V') return P !== 0 ? (n*R*T)/P : 0
    if (unknown === 'n') return (R*T) !== 0 ? (P*V)/(R*T) : 0
    return (n*R) !== 0 ? (P*V)/(n*R) : 0
  }
  const result = compute()
  const labels: Record<Unknown, string> = { P:'P (pressure, atm)', V:'V (volume, L)', n:'n (moles, mol)', T:'T (temperature, K)' }
  const known = { P, V, n, T }

  const rearranged: Record<Unknown, string> = {
    P: 'P = nRT ÷ V', V: 'V = nRT ÷ P', n: 'n = PV ÷ RT', T: 'T = PV ÷ nR',
  }
  const substituted: Record<Unknown, string> = {
    P: `P = (${n} × ${R} × ${T}) ÷ ${V}`,
    V: `V = (${n} × ${R} × ${T}) ÷ ${P}`,
    n: `n = (${P} × ${V}) ÷ (${R} × ${T})`,
    T: `T = (${P} × ${V}) ÷ (${n} × ${R})`,
  }

  const steps = [
    { title:'Formula', body:`PV = nRT\n\nR = ${R} L·atm/(mol·K)` },
    { title:'Rearrange', body:`Solving for ${labels[unknown]}:\n\n${rearranged[unknown]}` },
    { title:'Substitute', body: substituted[unknown] },
    { title:'Answer', body:`${labels[unknown]} = ${result.toFixed(4)}` },
  ]

  return (
    <div style={{ padding:'20px 24px', maxWidth:720 }}>
      <SectionHeader C={C} title="Gas Laws"
        sub="The ideal gas law relates pressure, volume, moles, and temperature. Pick the unknown, fill in the rest, and solve step by step." />
      <label style={{ display:'flex', flexDirection:'column', gap:4, fontSize:11.5, color:C.muted, marginBottom:10, maxWidth:220 }}>
        Solve for
        <select value={unknown} onChange={e => setUnknown(e.target.value as Unknown)} style={{ padding:'7px 10px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.text, fontSize:13 }}>
          {(['P','V','n','T'] as Unknown[]).map(u => <option key={u} value={u}>{labels[u]}</option>)}
        </select>
      </label>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        {(['P','V','n','T'] as Unknown[]).filter(u => u !== unknown).map(u => (
          <NumberField key={u} C={C} label={labels[u]}
            value={known[u]}
            onChange={v => { if (u==='P') setP(v); if (u==='V') setV(v); if (u==='n') setN(v); if (u==='T') setT(v) }} />
        ))}
      </div>
      <StepList C={C} steps={steps} />
    </div>
  )
}

// ── Landing menu ─────────────────────────────────────────────────────────────
function MenuCard({ icon, title, body, onClick, C }: { icon: string; title: string; body: string; onClick: () => void; C: ThemeColors }) {
  return (
    <div onClick={onClick} style={{
      flex:'1 1 260px', padding:'18px 20px', borderRadius:14, cursor:'pointer',
      border:`1px solid ${C.border}`, background:C.surface2, transition:'all .15s',
    }}>
      <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.6 }}>{body}</div>
    </div>
  )
}

function Menu({ onSelect, C }: { onSelect: (m: CalcMode) => void; C: ThemeColors }) {
  return (
    <div style={{ padding:'24px' }}>
      <SectionHeader C={C} title="Calculations"
        sub="Step-by-step chemistry calculators — see the real math behind each answer, not just the result." />
      <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
        <MenuCard C={C} icon="📈" title="Periodic Trends" onClick={() => onSelect('trends')}
          body="Compare electron affinity, ionization energy, electronegativity, and atomic radius between any two elements." />
        <MenuCard C={C} icon="⚖️" title="Stoichiometry" onClick={() => onSelect('stoich')}
          body="Given a mass of reactant, work through moles, mole ratios, and mass of product step by step." />
        <MenuCard C={C} icon="🧪" title="Solution Chemistry" onClick={() => onSelect('solution')}
          body="Molarity, dilution (M₁V₁=M₂V₂), and pH calculations with full working shown." />
        <MenuCard C={C} icon="🌡️" title="Gas Laws" onClick={() => onSelect('gas')}
          body="Solve the ideal gas law PV=nRT for any unknown, with the algebra shown at each step." />
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function Calculations() {
  const C = useThemeColors()
  const [mode, setMode] = useState<CalcMode>('menu')

  return (
    <div style={{ width:'100%', height:'100%', overflow:'hidden', display:'flex', flexDirection:'column', background:C.bg, fontFamily:'sans-serif' }}>
      {mode !== 'menu' && (
        <div style={{ padding:'10px 20px', borderBottom:`0.5px solid ${C.border}`, flexShrink:0 }}>
          <button onClick={() => setMode('menu')} style={{
            border:'none', background:'none', cursor:'pointer', fontSize:12.5, color:C.blue, padding:0,
          }}>← All calculators</button>
        </div>
      )}
      <div style={{ flex:1, overflowY:'auto', minHeight:0 }}>
        {mode === 'menu'     && <Menu onSelect={setMode} C={C} />}
        {mode === 'trends'   && <TrendsCalc C={C} />}
        {mode === 'stoich'   && <StoichCalc C={C} />}
        {mode === 'solution' && <SolutionCalc C={C} />}
        {mode === 'gas'      && <GasLawsCalc C={C} />}
      </div>
    </div>
  )
}
