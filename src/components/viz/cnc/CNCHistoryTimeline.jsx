import { useState, useEffect } from 'react'

function useIsDark() {
  const isDark = () => document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const EVENTS = [
  {
    year: '1944–1947',
    title: 'Parsons Aircraft and the first idea',
    tag: 'Military',
    tagKey: 'mil',
    body: `John T. Parsons, a Michigan machinist making helicopter rotor blades for the US Army Air Force, had a production problem: compound-curve blade surfaces required dozens of manual setups and were still inconsistent. His solution was to compute XY coordinates on an IBM 602A punch-card calculator and feed those cards to a Swiss jig borer to position each cut. He called it "close tolerance milling." The Air Force was interested. NC was conceived not in a university lab, but on a production floor solving a real tolerance problem.`,
  },
  {
    year: '1952',
    title: 'MIT builds the first NC machine',
    tag: 'MIT / Research',
    tagKey: 'mit',
    body: `Under Air Force contract, MIT's Servomechanisms Lab retrofitted a Cincinnati Hydrotel milling machine with a vacuum-tube controller reading punched paper tape. The demonstration: a complex wing rib cut automatically from tape that would have taken days by hand. The controller filled a room. The Air Force classified the results and immediately funded production. This is the machine that defined the architecture every CNC controller still follows.`,
  },
  {
    year: '1956–1958',
    title: 'APT — the first language for machines',
    tag: 'MIT / Research',
    tagKey: 'mit',
    body: `MIT developed APT (Automatically Programmed Tool), letting engineers write English-like geometry commands ("GOTO/PT1") instead of raw coordinate lists. APT established the conceptual architecture G-code inherits: a formal language with rules, not just numbers. The Air Force distributed APT to all major defense contractors. Every modern CAM post-processor is a direct descendant.`,
  },
  {
    year: '1959',
    title: 'EIA RS-274 — G-code is standardized',
    tag: 'Standard',
    tagKey: 'std',
    body: `The Electronic Industries Alliance published RS-274, standardizing G-codes, M-codes, and the coordinate block format. This single document defines the language still running 90% of production CNC machines today. G stands for "preparatory function." M stands for "miscellaneous." These somewhat arbitrary names have persisted for 65 years. RS-274D (1979) and ISO 6983 are revisions of the same foundation.`,
  },
  {
    year: '1970',
    title: 'Fanuc founded — CNC enters the mainstream',
    tag: 'Industry',
    tagKey: 'ind',
    body: `Seiuemon Inaba spun Fanuc out of Fujitsu with a specific mission: make NC control affordable through modular, mass-produced electronics — replacing relay-based logic with miniaturized solid-state components. Within a decade, Fanuc held over 50% of the world CNC market. Today that figure is broadly similar. This is why learning Fanuc dialect means learning the language of the majority of machines on any shop floor in the world.`,
  },
  {
    year: '1976–1980',
    title: 'Microprocessors embed the controller in the machine',
    tag: 'Industry',
    tagKey: 'ind',
    body: `The Intel 8080 and Zilog Z80 reduced controller cost from the price of a house to the price of a car. Before this, the "computer" in CNC was a separate minicomputer, sometimes in a different room. After this, the controller was embedded in the machine cabinet. Closed-loop servo control with real-time following-error correction became standard on production machines for the first time.`,
  },
  {
    year: '1982',
    title: 'Haas Automation — democratizing VMCs',
    tag: 'Industry',
    tagKey: 'ind',
    body: `Gene Haas started in a garage in Oxnard, California, building rotary tables. By 1988 the first Haas VMC shipped at half the price of comparable Japanese machines. The Haas controller uses a Fanuc-compatible dialect with proprietary extensions. Today Haas is the largest CNC machine builder in North America and the most common machine a new US machinist first encounters.`,
  },
  {
    year: '1984–1995',
    title: 'CAD/CAM arrives on PCs',
    tag: 'PC Era',
    tagKey: 'pc',
    body: `Mastercam (1984) was the first PC-based CAM package. SolidWorks (1995) brought parametric CAD to affordable workstations. These broke the programming bottleneck — previously, G-code required expensive mainframe APT systems or hand calculation. They also created the modern disconnect: programmers who never touched a machine, and machinists who couldn't read the code they were running.`,
  },
  {
    year: '2012–Present',
    title: 'Fusion 360 and the collapse of the CAM paywall',
    tag: 'PC Era',
    tagKey: 'pc',
    body: `Autodesk's Fusion 360 made professional CAD/CAM free for hobbyists and small shops. Desktop CNC routers (Shapeoko, X-Carve) brought CNC to makerspaces for under $1,000. The population of people who can write and modify G-code has grown by orders of magnitude. CNC knowledge that once required a union card and years of apprenticeship is now accessible to anyone willing to learn the fundamentals properly.`,
  },
]

const TAG_COLORS = {
  mil: { bg: ['#E6F1FB', '#042C53'], text: ['#185FA5', '#85B7EB'] },
  mit: { bg: ['#EEEDFE', '#26215C'], text: ['#534AB7', '#AFA9EC'] },
  std: { bg: ['#FAEEDA', '#412402'], text: ['#854F0B', '#EF9F27'] },
  ind: { bg: ['#EAF3DE', '#173404'], text: ['#3B6D11', '#97C459'] },
  pc:  { bg: ['#FAECE7', '#4A1B0C'], text: ['#993C1D', '#F0997B'] },
}

export default function CNCHistoryTimeline({ params = {} }) {
  const dark = useIsDark()
  const [openIdx, setOpenIdx] = useState(0)

  const C = {
    bg:      dark ? '#0f172a' : '#ffffff',
    surface: dark ? '#1e293b' : '#f8fafc',
    border:  dark ? '#334155' : '#e2e8f0',
    text:    dark ? '#f1f5f9' : '#0f172a',
    muted:   dark ? '#94a3b8' : '#475569',
    hint:    dark ? '#475569' : '#94a3b8',
    accent:  dark ? '#818cf8' : '#534AB7',
    dotIdle: dark ? '#334155' : '#e2e8f0',
    line:    dark ? '#1e293b' : '#e2e8f0',
  }

  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px', lineHeight: 1.5 }}>
        Click any event to expand. The history of CNC is the history of turning expensive human skill into reliable, repeatable code.
      </p>
      {EVENTS.map((e, i) => {
        const isOpen = openIdx === i
        const tc = TAG_COLORS[e.tagKey]
        const tagBg   = dark ? tc.bg[1]   : tc.bg[0]
        const tagText = dark ? tc.text[1] : tc.text[0]
        return (
          <div key={i} style={{ display: 'flex', gap: 0 }}>
            {/* Spine */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
              <div
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                style={{
                  width: 14, height: 14, borderRadius: '50%', marginTop: 3, flexShrink: 0, cursor: 'pointer',
                  background: isOpen ? C.accent : C.bg,
                  border: `2px solid ${isOpen ? C.accent : C.dotIdle}`,
                  boxShadow: isOpen ? `0 0 0 3px ${dark ? '#26215C' : '#EEEDFE'}` : 'none',
                  transition: 'all .18s',
                }}
              />
              {i < EVENTS.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 12, background: C.line }} />
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 2, letterSpacing: '.04em' }}>
                {e.year}
              </div>
              <div
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                style={{ fontSize: 14, fontWeight: 500, color: C.text, cursor: 'pointer', lineHeight: 1.4 }}
              >
                {e.title}
              </div>
              {isOpen && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 4, background: tagBg, color: tagText, fontWeight: 600, marginBottom: 6 }}>
                    {e.tag}
                  </span>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.65 }}>{e.body}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
