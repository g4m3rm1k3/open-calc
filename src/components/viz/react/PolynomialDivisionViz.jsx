import { useState } from 'react'

/**
 * PolynomialDivisionViz
 * Interactive synthetic division walkthrough.
 * User enters coefficients and c value.
 * Steps through the bring-down → multiply → add sequence.
 * Shows remainder = f(c) verification.
 * Pure React. Dark mode via CSS variables.
 */
export default function PolynomialDivisionViz({ params = {} }) {
  const [coeffInput, setCoeffInput] = useState('2, -3, -8, 3, 6')
  const [cInput, setCInput] = useState('3')
  const [step, setStep] = useState(0)
  const [computed, setComputed] = useState(null)
  const [error, setError] = useState('')

  const compute = () => {
    try {
      const coeffs = coeffInput.split(',').map(s => parseFloat(s.trim()))
      const c = parseFloat(cInput)
      if (coeffs.some(isNaN) || isNaN(c)) { setError('Enter valid numbers.'); return }
      if (coeffs.length < 2) { setError('Need at least 2 coefficients.'); return }

      // Run full synthetic division
      const rows = [[...coeffs]]  // row 0: original coefficients
      const mult = [null]          // what we multiply each step
      const bottom = [coeffs[0]]  // running quotient row

      for (let i = 1; i < coeffs.length; i++) {
        const m = bottom[i - 1] * c
        mult.push(m)
        bottom.push(coeffs[i] + m)
      }

      setComputed({ coeffs, c, mult, bottom, n: coeffs.length })
      setStep(0)
      setError('')
    } catch {
      setError('Could not parse. Example: "2, -3, 0, 5"')
    }
  }

  const card = { background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '10px 14px', marginBottom: 8, border: '0.5px solid var(--color-border-tertiary)' }
  const cell = (val, highlight, label) => ({
    display: 'inline-block', minWidth: 48, textAlign: 'center', padding: '6px 4px',
    borderRadius: 6, margin: 2,
    background: highlight === 'coeff' ? 'var(--color-background-info)' :
                highlight === 'mult'  ? 'var(--color-background-warning)' :
                highlight === 'result'? 'var(--color-background-success)' :
                highlight === 'rem'   ? 'var(--color-background-danger)' : 'var(--color-background-primary)',
    color: highlight === 'coeff' ? 'var(--color-text-info)' :
           highlight === 'mult'  ? 'var(--color-text-warning)' :
           highlight === 'result'? 'var(--color-text-success)' :
           highlight === 'rem'   ? 'var(--color-text-danger)' : 'var(--color-text-secondary)',
    fontWeight: 600, fontSize: 14, border: '0.5px solid var(--color-border-secondary)',
  })

  const fmtNum = n => n === null ? '' : Number.isInteger(n) ? String(n) : n.toFixed(2)

  const renderTable = () => {
    if (!computed) return null
    const { coeffs, c, mult, bottom, n } = computed

    // How far through the steps are we?
    // step 0: just show coefficients
    // step 1: bring down first coefficient → bottom[0]
    // step k (1-indexed per column): show mult[k] and bottom[k]
    // total steps = 1 (initial) + (n-1) columns = n steps
    const totalSteps = n

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ ...card, padding: '6px 12px', marginBottom: 0 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Dividing by </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-info)' }}>(x − {fmtNum(c)})</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>, c = {fmtNum(c)}</span>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', marginBottom: 10 }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
            <tbody>
              {/* Row 1: c | original coefficients */}
              <tr>
                <td style={{ ...cell(c, 'coeff'), fontSize: 13 }}>{fmtNum(c)}</td>
                <td style={{ width: 4, borderRight: '1.5px solid var(--color-border-primary)' }}></td>
                {coeffs.map((v, i) => (
                  <td key={i}><span style={cell(v, step >= 0 ? 'coeff' : '')}>{fmtNum(v)}</span></td>
                ))}
              </tr>

              {/* Row 2: multiply values */}
              <tr>
                <td></td>
                <td style={{ borderRight: '1.5px solid var(--color-border-primary)', borderBottom: '1.5px solid var(--color-border-primary)' }}></td>
                {mult.map((v, i) => (
                  <td key={i} style={{ borderBottom: '1.5px solid var(--color-border-primary)' }}>
                    <span style={cell(v, i > 0 && step >= i ? 'mult' : '')}>
                      {i === 0 ? '' : (step >= i ? fmtNum(v) : '·')}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 3: quotient + remainder */}
              <tr>
                <td></td>
                <td style={{ borderRight: '1.5px solid var(--color-border-primary)' }}></td>
                {bottom.map((v, i) => (
                  <td key={i}>
                    <span style={cell(v,
                      step < i + 1 ? '' :
                      i === n - 1 ? 'rem' : 'result'
                    )}>
                      {step >= i + 1 ? fmtNum(v) : '·'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Step annotation */}
        <div style={{ ...card, borderLeft: '3px solid var(--color-border-info)', borderRadius: 0, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>Step {step} of {totalSteps}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {step === 0 && 'Write the coefficients. Write c to the left.'}
            {step === 1 && `Bring down the first coefficient: ${fmtNum(bottom[0])}`}
            {step > 1 && step <= n - 1 && `Multiply ${fmtNum(bottom[step-2])} × ${fmtNum(c)} = ${fmtNum(mult[step-1])}. Add to ${fmtNum(coeffs[step-1])}: get ${fmtNum(bottom[step-1])}.`}
            {step === n && `Last column: ${fmtNum(bottom[n-2])} × ${fmtNum(c)} = ${fmtNum(mult[n-1])}. Add to ${fmtNum(coeffs[n-1])}: remainder = ${fmtNum(bottom[n-1])}.`}
          </div>
        </div>

        {/* Result */}
        {step === totalSteps && (
          <div>
            <div style={{ ...card, background: Math.abs(bottom[n-1]) < 0.001 ? 'var(--color-background-success)' : 'var(--color-background-secondary)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                {Math.abs(bottom[n-1]) < 0.001 ? `✓ Remainder = 0 — x = ${fmtNum(c)} is a root, (x − ${fmtNum(c)}) is a factor` : `Remainder = ${fmtNum(bottom[n-1])} = f(${fmtNum(c)}) — not a root`}
              </div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
                Quotient: {bottom.slice(0, n-1).map((v, i) => {
                  const deg = n - 2 - i
                  const s = fmtNum(v)
                  if (deg === 0) return s
                  if (deg === 1) return `${s}x`
                  return `${s}x^${deg}`
                }).join(' + ').replace(/\+ -/g, '− ')}
              </div>
            </div>

            {/* Verify f(c) */}
            <div style={{ ...card }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Remainder Theorem check: f({fmtNum(c)}) = ?</div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
                {(() => {
                  let val = 0
                  coeffs.forEach(coef => { val = val * c + coef })
                  return `f(${fmtNum(c)}) = ${fmtNum(val)} ${Math.abs(val - bottom[n-1]) < 0.001 ? '✓ matches remainder' : '← check your input'}`
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: '6px 16px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
          <button onClick={() => setStep(s => Math.min(totalSteps, s + 1))} disabled={step === totalSteps} style={{ padding: '6px 16px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-info)', background: 'var(--color-background-info)', color: 'var(--color-text-info)', cursor: step === totalSteps ? 'not-allowed' : 'pointer', opacity: step === totalSteps ? 0.4 : 1, fontWeight: 500 }}>Next →</button>
          <button onClick={() => setStep(0)} style={{ padding: '6px 12px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: 12 }}>Reset</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '4px 0' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 2, minWidth: 180 }}>
          <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 4 }}>Coefficients (comma-separated, include 0 for missing terms)</label>
          <input value={coeffInput} onChange={e => setCoeffInput(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 13 }} placeholder="e.g. 2, -3, 0, 5" />
        </div>
        <div style={{ flex: 1, minWidth: 80 }}>
          <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 4 }}>c (divisor x − c)</label>
          <input value={cInput} onChange={e => setCInput(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 13 }} placeholder="e.g. 3" />
        </div>
        <button onClick={compute} style={{ padding: '7px 20px', borderRadius: 'var(--border-radius-md)', border: '0.5px solid var(--color-border-info)', background: 'var(--color-background-info)', color: 'var(--color-text-info)', cursor: 'pointer', fontWeight: 500, fontSize: 13, alignSelf: 'flex-end' }}>Run</button>
      </div>
      {error && <div style={{ color: 'var(--color-text-danger)', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {computed ? renderTable() : (
        <div style={{ ...card, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13, padding: '20px' }}>
          Enter coefficients and c, then click Run to see synthetic division step by step.
          <div style={{ fontSize: 11, marginTop: 6 }}>Default example: 2x⁴ − 3x³ − 8x² + 3x + 6 ÷ (x − 3)</div>
        </div>
      )}
    </div>
  )
}
