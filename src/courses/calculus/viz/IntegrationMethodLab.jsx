import { useMemo, useState } from 'react'

const PRESETS = [
  {
    id: 'p1',
    label: '2x cos(x^2)',
    display: '\\int 2x cos(x^2) dx',
    traits: {
      innerDerivativePresent: true,
      mixedProduct: false,
      rationalFactorable: false,
      radicalA2pmX2: false,
      trigPowerPattern: false,
    },
    suggested: 'u-substitution',
    firstStep: 'Let u = x^2, so du = 2x dx.',
  },
  {
    id: 'p2',
    label: 'x e^x',
    display: '\\int x e^x dx',
    traits: {
      innerDerivativePresent: false,
      mixedProduct: true,
      rationalFactorable: false,
      radicalA2pmX2: false,
      trigPowerPattern: false,
    },
    suggested: 'integration by parts',
    firstStep: 'Choose u = x and dv = e^x dx.',
  },
  {
    id: 'p3',
    label: 'sin^3(x) cos^2(x)',
    display: '\\int sin^3(x) cos^2(x) dx',
    traits: {
      innerDerivativePresent: false,
      mixedProduct: false,
      rationalFactorable: false,
      radicalA2pmX2: false,
      trigPowerPattern: true,
    },
    suggested: 'trig identities + substitution',
    firstStep: 'Save one sin(x), convert sin^2(x) = 1 - cos^2(x), then set u = cos(x).',
  },
  {
    id: 'p4',
    label: 'sqrt(9 - x^2)',
    display: '\\int sqrt(9 - x^2) dx',
    traits: {
      innerDerivativePresent: false,
      mixedProduct: false,
      rationalFactorable: false,
      radicalA2pmX2: true,
      trigPowerPattern: false,
    },
    suggested: 'trig substitution',
    firstStep: 'Use x = 3 sin(theta), then dx = 3 cos(theta) dtheta.',
  },
  {
    id: 'p5',
    label: '(2x+1)/((x-1)(x+2))',
    display: '\\int (2x+1)/((x-1)(x+2)) dx',
    traits: {
      innerDerivativePresent: false,
      mixedProduct: false,
      rationalFactorable: true,
      radicalA2pmX2: false,
      trigPowerPattern: false,
    },
    suggested: 'partial fractions',
    firstStep: 'Decompose into A/(x-1) + B/(x+2).',
  },
]

const METHODS = [
  {
    id: 'u-substitution',
    hint: 'Best when an inner function and its derivative are both present.',
    weights: {
      innerDerivativePresent: 4,
      mixedProduct: -1,
      rationalFactorable: -1,
      radicalA2pmX2: -1,
      trigPowerPattern: 0,
    },
  },
  {
    id: 'integration by parts',
    hint: 'Best for products like polynomial*exp, polynomial*trig, or ln(x).',
    weights: {
      innerDerivativePresent: -1,
      mixedProduct: 4,
      rationalFactorable: -1,
      radicalA2pmX2: -1,
      trigPowerPattern: 0,
    },
  },
  {
    id: 'trig identities + substitution',
    hint: 'Use parity rules and identities for sin/cos/tan/sec powers.',
    weights: {
      innerDerivativePresent: 0,
      mixedProduct: 0,
      rationalFactorable: -1,
      radicalA2pmX2: -1,
      trigPowerPattern: 4,
    },
  },
  {
    id: 'trig substitution',
    hint: 'Use when radicals look like a^2 - x^2, a^2 + x^2, or x^2 - a^2.',
    weights: {
      innerDerivativePresent: -1,
      mixedProduct: -1,
      rationalFactorable: -1,
      radicalA2pmX2: 4,
      trigPowerPattern: 0,
    },
  },
  {
    id: 'partial fractions',
    hint: 'Use for rational functions after long division and factorization.',
    weights: {
      innerDerivativePresent: -1,
      mixedProduct: -1,
      rationalFactorable: 4,
      radicalA2pmX2: -1,
      trigPowerPattern: -1,
    },
  },
]

function scoreMethod(method, traits) {
  return Object.entries(method.weights).reduce((sum, [key, weight]) => {
    return sum + (traits[key] ? weight : 0)
  }, 0)
}

export default function IntegrationMethodLab() {
  const [selectedId, setSelectedId] = useState(PRESETS[0].id)
  const selectedPreset = PRESETS.find((p) => p.id === selectedId) ?? PRESETS[0]
  const [traits, setTraits] = useState(selectedPreset.traits)

  const ranking = useMemo(() => {
    return METHODS
      .map((method) => ({
        ...method,
        score: scoreMethod(method, traits),
      }))
      .sort((a, b) => b.score - a.score)
  }, [traits])

  const topMethod = ranking[0]

  function loadPreset(preset) {
    setSelectedId(preset.id)
    setTraits(preset.traits)
  }

  function toggleTrait(key) {
    setTraits((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-3 px-2 pb-2">
      <div className="rounded-lg border border-slate-300 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
        <div className="text-sm font-semibold mb-2">Pick an integrand family</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                preset.id === selectedId
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Current form: <span className="font-medium">{selectedPreset.display}</span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-300 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
        <div className="text-sm font-semibold mb-2">Detection checklist</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={traits.innerDerivativePresent} onChange={() => toggleTrait('innerDerivativePresent')} />
            Inner derivative appears
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={traits.mixedProduct} onChange={() => toggleTrait('mixedProduct')} />
            Mixed product (poly*exp/trig/log)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={traits.trigPowerPattern} onChange={() => toggleTrait('trigPowerPattern')} />
            Trig power pattern
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={traits.radicalA2pmX2} onChange={() => toggleTrait('radicalA2pmX2')} />
            Radical a^2 +/- x^2 pattern
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={traits.rationalFactorable} onChange={() => toggleTrait('rationalFactorable')} />
            Rational function with factorable denominator
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-300 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
        <div className="text-sm font-semibold mb-2">Method ranking</div>
        <div className="space-y-2">
          {ranking.map((method, idx) => (
            <div key={method.id} className="rounded border border-slate-200 dark:border-slate-700 px-2 py-2">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">{idx + 1}. {method.id}</div>
                <div className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">score {method.score}</div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{method.hint}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-emerald-300 dark:border-emerald-700 p-3 bg-emerald-50/80 dark:bg-emerald-900/20">
        <div className="text-sm font-semibold">Suggested first move</div>
        <div className="text-sm mt-1">
          Recommended: <span className="font-semibold">{topMethod.id}</span>
        </div>
        <div className="text-xs mt-1 text-slate-700 dark:text-slate-300">
          Preset expert move: {selectedPreset.suggested} - {selectedPreset.firstStep}
        </div>
      </div>
    </div>
  )
}
