import { useState } from 'react'

/**
 * TrigIntegrationStrategyViz
 * Interactive decision tree: user describes the integrand structure,
 * the viz walks them to the correct strategy with reasoning at each step.
 * Pure React — no D3, no canvas. Dark mode via CSS variables.
 */
export default function TrigIntegrationStrategyViz({ params = {} }) {
  const [path, setPath] = useState([])
  const [done, setDone] = useState(null)

  const tree = {
    id: 'root',
    q: 'What does the integrand look like?',
    choices: [
      {
        label: 'sinⁿx · cosᵐx (powers of sin and cos)',
        next: {
          id: 'sincos',
          q: 'Are both exponents even?',
          choices: [
            {
              label: 'Yes — both even (e.g. sin²x cos²x)',
              result: {
                strategy: 'Power reduction first',
                steps: ['Apply sin²x = (1−cos2x)/2 and cos²x = (1+cos2x)/2', 'Expand the product', 'Integrate term by term — each term is now a single-angle cos or constant'],
                why: 'Even powers have no "spare" factor to absorb as du. Power reduction converts them to integrable single-angle terms.',
                example: '∫sin²x dx = ∫(1−cos2x)/2 dx = x/2 − sin2x/4 + C',
              },
            },
            {
              label: 'No — at least one is odd (e.g. sin³x, sin⁵x cos²x)',
              next: {
                id: 'odd',
                q: 'Which factor has the odd power?',
                choices: [
                  {
                    label: 'sin has odd power',
                    result: {
                      strategy: 'Factor one sinx, convert rest with Pythagorean identity',
                      steps: ['Factor off one sinx to pair with dx', 'Replace sin²x = 1−cos²x for the remaining even power', 'Let u = cosx, du = −sinx dx', 'Integrate the polynomial in u'],
                      why: 'The lone sinx becomes −du after substitution. The remaining sin²x = 1−cos²x makes everything a polynomial in cosx.',
                      example: '∫sin³x dx = ∫(1−cos²x)sinx dx → u=cosx → ∫(1−u²)(−du) = −u + u³/3 + C',
                    },
                  },
                  {
                    label: 'cos has odd power',
                    result: {
                      strategy: 'Factor one cosx, convert rest with Pythagorean identity',
                      steps: ['Factor off one cosx to pair with dx', 'Replace cos²x = 1−sin²x for the remaining even power', 'Let u = sinx, du = cosx dx', 'Integrate the polynomial in u'],
                      why: 'The lone cosx becomes du after substitution. Symmetric argument to the sin case.',
                      example: '∫cos³x dx = ∫(1−sin²x)cosx dx → u=sinx → ∫(1−u²) du = u − u³/3 + C',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        label: 'tanⁿx · secᵐx (powers of tan and sec)',
        next: {
          id: 'tansec',
          q: 'What is the structure?',
          choices: [
            {
              label: 'sec has even power',
              result: {
                strategy: 'Factor sec²x, substitute u = tanx',
                steps: ['Factor off one sec²x to pair with dx', 'Replace remaining sec²x = 1+tan²x', 'Let u = tanx, du = sec²x dx', 'Integrate polynomial in u'],
                why: 'sec²x is the derivative of tanx, so it absorbs cleanly as du.',
                example: '∫sec⁴x dx = ∫(1+tan²x)sec²x dx → u=tanx → ∫(1+u²)du = u + u³/3 + C',
              },
            },
            {
              label: 'tan has odd power',
              result: {
                strategy: 'Factor secx tanx, substitute u = secx',
                steps: ['Factor off one secx tanx to pair with dx', 'Replace tan²x = sec²x−1', 'Let u = secx, du = secx tanx dx', 'Integrate polynomial in u'],
                why: 'secx tanx is the derivative of secx, so it absorbs cleanly as du.',
                example: '∫tan³x sec x dx = ∫(sec²x−1)secx tanx dx → u=secx → ∫(u²−1)du = u³/3 − u + C',
              },
            },
          ],
        },
      },
      {
        label: '√(a²−x²), √(a²+x²), or √(x²−a²) (radical in integrand)',
        next: {
          id: 'trisub',
          q: 'Which radical form?',
          choices: [
            {
              label: '√(a²−x²)',
              result: {
                strategy: 'Trig substitution: x = a sinθ',
                steps: ['Let x = a sinθ, dx = a cosθ dθ', '√(a²−x²) = √(a²−a²sin²θ) = a cosθ  (uses 1−sin²=cos²)', 'Substitute everything — radical disappears', 'Integrate in θ, then back-substitute'],
                why: 'The Pythagorean identity 1−sin²θ = cos²θ exactly cancels the structure under the radical.',
                example: '∫√(1−x²)dx → x=sinθ → ∫cos²θ dθ → power reduce → (θ + sin2θ/2)/2 + C',
              },
            },
            {
              label: '√(a²+x²)',
              result: {
                strategy: 'Trig substitution: x = a tanθ',
                steps: ['Let x = a tanθ, dx = a sec²θ dθ', '√(a²+x²) = a secθ  (uses 1+tan²=sec²)', 'Substitute — radical disappears', 'Integrate in θ, then back-substitute'],
                why: 'The identity 1+tan²θ = sec²θ cancels the radical structure.',
                example: '∫dx/√(x²+4) → x=2tanθ → ∫secθ dθ = ln|secθ+tanθ| + C',
              },
            },
            {
              label: '√(x²−a²)',
              result: {
                strategy: 'Trig substitution: x = a secθ',
                steps: ['Let x = a secθ, dx = a secθ tanθ dθ', '√(x²−a²) = a tanθ  (uses sec²−1=tan²)', 'Substitute — radical disappears', 'Integrate in θ, then back-substitute'],
                why: 'The identity sec²θ−1 = tan²θ cancels the radical structure.',
                example: '∫dx/(x²√(x²−1)) → x=secθ → simplified trig integral',
              },
            },
          ],
        },
      },
      {
        label: 'Products like sin(mx)cos(nx) or sin(mx)sin(nx)',
        result: {
          strategy: 'Product-to-sum identities',
          steps: [
            'sinA cosB = ½[sin(A+B) + sin(A−B)]',
            'sinA sinB = ½[cos(A−B) − cos(A+B)]',
            'cosA cosB = ½[cos(A−B) + cos(A+B)]',
            'After applying: integrate each resulting single-angle term directly',
          ],
          why: 'Products of trig functions with different arguments have no u-sub available. Product-to-sum formulas convert them to a sum of single-argument terms that integrate directly.',
          example: '∫sin3x cos2x dx = ½∫[sin5x + sinx] dx = −cos5x/10 − cosx/2 + C',
        },
      },
    ],
  }

  const navigate = (choice) => {
    if (choice.result) {
      setDone(choice.result)
      setPath(p => [...p, choice.label])
    } else if (choice.next) {
      setPath(p => [...p, choice.label])
      setCurrentNode(choice.next)
    }
  }

  const [currentNode, setCurrentNode] = useState(tree)

  const reset = () => { setPath([]); setDone(null); setCurrentNode(tree) }

  const card = { background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '10px 14px', marginBottom: 8, border: '0.5px solid var(--color-border-tertiary)' }
  const btn = { width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: 13, lineHeight: 1.5, marginBottom: 6 }
  const btnHover = { ...btn, background: 'var(--color-background-info)', borderColor: 'var(--color-border-info)', color: 'var(--color-text-info)' }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0' }}>
      {/* Breadcrumb */}
      {path.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {path.map((p, i) => (
            <span key={i} style={{ fontSize: 11, background: 'var(--color-background-info)', color: 'var(--color-text-info)', padding: '2px 8px', borderRadius: 10 }}>
              {p.length > 40 ? p.slice(0, 40) + '…' : p}
            </span>
          ))}
        </div>
      )}

      {!done ? (
        <>
          <div style={{ ...card, borderLeft: '3px solid var(--color-border-info)', borderRadius: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Step {path.length + 1}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{currentNode.q}</div>
          </div>
          <div style={{ marginTop: 10 }}>
            {currentNode.choices.map((c, i) => (
              <HoverButton key={i} style={btn} onClick={() => navigate(c)}>
                {c.label}
              </HoverButton>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div style={{ ...card, borderLeft: '3px solid #34d399', borderRadius: 0, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Strategy identified</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>{done.strategy}</div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Steps</div>
          {done.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'flex-start' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-background-info)', color: 'var(--color-text-info)', fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5, fontFamily: 'var(--font-serif)' }}>{s}</div>
            </div>
          ))}

          <div style={{ ...card, marginTop: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Why this works</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{done.why}</div>
          </div>

          <div style={{ ...card, background: 'var(--color-background-success)', borderColor: 'var(--color-border-success)' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Example</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', lineHeight: 1.7 }}>{done.example}</div>
          </div>

          <button onClick={reset} style={{ marginTop: 12, padding: '7px 16px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 13 }}>
            ← Start over
          </button>
        </div>
      )}
    </div>
  )
}

function HoverButton({ children, onClick, style }) {
  const [hover, setHover] = useState(false)
  const hoverStyle = { ...style, background: 'var(--color-background-secondary)' }
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={hover ? hoverStyle : style}>
      {children}
    </button>
  )
}
