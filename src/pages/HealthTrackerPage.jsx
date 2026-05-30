import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Heart, Download, Upload, User, ClipboardList, History,
  X, Plus, Trash2, Shield, Moon, Droplets, Scale, Activity,
  Pill, Brain, Send, AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  Search, Loader2, Newspaper, BookOpen, ExternalLink, Key,
  Apple,
} from 'lucide-react'
import { useHippocratesAI } from '../hooks/useHippocratesAI.js'
import MarkdownProse from '../components/math/MarkdownProse.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORE_KEY   = 'oc-health-v1'
const PRIVACY_KEY = 'oc-health-privacy-seen'
const FDC_KEY_KEY = 'oc-health-fdckey'

const NUTRIENTS = {
  1008: { key: 'kcal',      label: 'Calories',    unit: 'kcal', group: 'macro'   },
  1003: { key: 'protein',   label: 'Protein',     unit: 'g',    group: 'macro'   },
  1004: { key: 'fat',       label: 'Fat',         unit: 'g',    group: 'macro'   },
  1005: { key: 'carbs',     label: 'Carbs',       unit: 'g',    group: 'macro'   },
  1079: { key: 'fiber',     label: 'Fiber',       unit: 'g',    group: 'macro'   },
  2000: { key: 'sugar',     label: 'Sugar',       unit: 'g',    group: 'macro'   },
  1258: { key: 'satFat',    label: 'Sat. Fat',    unit: 'g',    group: 'macro'   },
  1253: { key: 'chol',      label: 'Cholesterol', unit: 'mg',   group: 'macro'   },
  1093: { key: 'sodium',    label: 'Sodium',      unit: 'mg',   group: 'mineral' },
  1092: { key: 'potassium', label: 'Potassium',   unit: 'mg',   group: 'mineral' },
  1087: { key: 'calcium',   label: 'Calcium',     unit: 'mg',   group: 'mineral' },
  1089: { key: 'iron',      label: 'Iron',        unit: 'mg',   group: 'mineral' },
  1090: { key: 'magnesium', label: 'Magnesium',   unit: 'mg',   group: 'mineral' },
  1095: { key: 'zinc',      label: 'Zinc',        unit: 'mg',   group: 'mineral' },
  1106: { key: 'vitA',      label: 'Vitamin A',   unit: 'mcg',  group: 'vitamin' },
  1162: { key: 'vitC',      label: 'Vitamin C',   unit: 'mg',   group: 'vitamin' },
  1110: { key: 'vitD',      label: 'Vitamin D',   unit: 'mcg',  group: 'vitamin' },
  1109: { key: 'vitE',      label: 'Vitamin E',   unit: 'mg',   group: 'vitamin' },
  1185: { key: 'vitK',      label: 'Vitamin K',   unit: 'mcg',  group: 'vitamin' },
  1175: { key: 'vitB6',     label: 'Vitamin B6',  unit: 'mg',   group: 'vitamin' },
  1178: { key: 'vitB12',    label: 'Vitamin B12', unit: 'mcg',  group: 'vitamin' },
  1177: { key: 'folate',    label: 'Folate',      unit: 'mcg',  group: 'vitamin' },
  1165: { key: 'thiamin',   label: 'Thiamin B1',  unit: 'mg',   group: 'vitamin' },
  1167: { key: 'niacin',    label: 'Niacin B3',   unit: 'mg',   group: 'vitamin' },
}

// Keyword presets for PubMed search
const SEARCH_PRESETS = [
  { label: 'Blue Zones',             query: 'blue zones centenarians longevity diet lifestyle' },
  { label: 'Fasting',                query: 'intermittent fasting metabolic health humans randomized' },
  { label: 'Mediterranean Diet',     query: 'mediterranean diet cardiovascular outcomes meta-analysis' },
  { label: 'Sleep & Health',         query: 'sleep quality health outcomes mortality adults' },
  { label: 'Gut Microbiome',         query: 'gut microbiome diet human health intervention' },
  { label: 'Exercise & Longevity',   query: 'physical activity longevity all-cause mortality cohort' },
  { label: 'Vitamin D',              query: 'vitamin D deficiency supplementation clinical outcomes' },
  { label: 'Omega-3',                query: 'omega-3 fatty acids cardiovascular cognitive trial' },
  { label: 'Time-Restricted Eating', query: 'time restricted eating cardiometabolic health trial' },
  { label: 'Autophagy',              query: 'autophagy fasting caloric restriction longevity' },
  { label: 'Inflammation',           query: 'dietary patterns systemic inflammation CRP biomarkers' },
  { label: 'Cognitive Health',       query: 'nutrition cognitive function dementia prevention' },
]

// One fact per hour of the day — rotates automatically
const HOURLY_FACTS = [
  { time: '12am', fact: 'Your body performs most cellular autophagy between midnight and 4am. Deep sleep is when growth hormone peaks and cellular repair is most active.' },
  { time: '1am',  fact: 'Cortisol is at its lowest around 1–3am. Poor sleep at this window disrupts the HPA axis and elevates next-day baseline cortisol.' },
  { time: '2am',  fact: 'Liver glycogen depletion begins around hour 12–14 of fasting, triggering a metabolic shift toward fat oxidation and ketone production.' },
  { time: '3am',  fact: 'Core body temperature reaches its daily minimum around 3–5am. Cooling the sleep environment to 65–68°F (18–20°C) measurably improves slow-wave sleep.' },
  { time: '4am',  fact: 'Melatonin peaks ~2–3am and begins declining by 4am. Light exposure at this hour can permanently shift your circadian rhythm by days.' },
  { time: '5am',  fact: 'The Cortisol Awakening Response (CAR) begins ~5am, peaking 20–30 min after waking. It mobilizes glucose and primes the immune system for the day.' },
  { time: '6am',  fact: 'Morning sunlight within 30 minutes of waking anchors your circadian clock, suppressing residual melatonin and improving the following night\'s sleep quality.' },
  { time: '7am',  fact: 'Protein synthesis in skeletal muscle responds best post-exercise and in the morning. 30–40g of protein at breakfast is especially important for preserving muscle after age 40.' },
  { time: '8am',  fact: 'Insulin sensitivity is highest in the morning. Front-loading calories earlier in the day improves glycemic control and is associated with lower body weight versus evening-heavy eating.' },
  { time: '9am',  fact: 'Adenosine — the sleepiness molecule — has been cleared after a full night\'s sleep. Peak cognitive alertness typically occurs 2–4 hours after waking.' },
  { time: '10am', fact: 'VO₂ max and strength peak in the late afternoon, but fasted morning cardio oxidizes ~20% more fat than the same workout performed after a meal.' },
  { time: '11am', fact: 'A fair-skinned person generates ~10,000–25,000 IU of Vitamin D in 15–20 minutes of full-body midday sun exposure — when UV index reaches 3 or higher.' },
  { time: '12pm', fact: 'The gut microbiome follows a circadian rhythm. Irregular meal timing disrupts microbiome diversity, a factor linked to metabolic syndrome and mood disorders.' },
  { time: '1pm',  fact: 'The post-lunch dip (~1–3pm) is circadian, not just food-related. A 10–20 minute nap at this time recovers alertness without disrupting nighttime sleep.' },
  { time: '2pm',  fact: 'Reaction time, coordination, and cardiovascular efficiency peak around 3–5pm — making this the optimal window for strength training and competitive performance.' },
  { time: '3pm',  fact: 'Magnesium is a cofactor in 300+ enzymatic reactions. Deficiency impairs ATP production, glucose metabolism, and is strongly linked to anxiety and poor sleep quality.' },
  { time: '4pm',  fact: 'A large meal within 3 hours of bed raises core body temperature and suppresses melatonin. Early time-restricted eating (done by 6–7pm) lowers HbA1c and blood pressure in clinical trials.' },
  { time: '5pm',  fact: 'Olive oil\'s oleocanthal inhibits COX-1/COX-2 enzymes similarly to ibuprofen at typical dietary doses — one mechanism behind the Mediterranean diet\'s anti-inflammatory effects.' },
  { time: '6pm',  fact: 'Alcohol in the evening suppresses REM sleep and reduces sleep efficiency even if total sleep time is unchanged. Two drinks reduce REM by ~24% in sleep lab studies.' },
  { time: '7pm',  fact: 'Strength training 4–6 hours before bed promotes slow-wave sleep in most people. Only very vigorous exercise within 60 minutes of sleep onset may delay sleep initiation.' },
  { time: '8pm',  fact: 'Blue light from screens suppresses melatonin by ~50% and delays sleep onset by up to 90 minutes. Blue-light blocking glasses reduce but do not eliminate this effect.' },
  { time: '9pm',  fact: 'Tryptophan — found in turkey, eggs, seeds, and tofu — is the precursor to serotonin and melatonin. A small carbohydrate snack in the evening improves its blood-brain barrier transport.' },
  { time: '10pm', fact: 'Insulin sensitivity declines significantly after ~8–9pm. The same carbohydrate meal eaten at night causes a 2× higher glycemic spike compared to noon — even in healthy adults.' },
  { time: '11pm', fact: 'The glymphatic system — the brain\'s waste-clearance network — is most active during slow-wave sleep. Lateral (side) sleeping posture maximizes glymphatic drainage efficiency.' },
]

// ─── Storage helpers ──────────────────────────────────────────────────────────
function loadStore() {
  try { const r = localStorage.getItem(STORE_KEY); if (r) return JSON.parse(r) } catch {}
  return { profile: emptyProfile(), entries: [] }
}
function persist(data) { localStorage.setItem(STORE_KEY, JSON.stringify(data)) }
function emptyProfile() {
  return { name: '', age: '', sex: '', heightCm: '', weightKg: '', activity: 'moderate',
           dietPattern: 'omnivore', goals: '', medications: '' }
}
function todayISO() { return new Date().toISOString().split('T')[0] }
function emptyEntry(date) {
  return { date, sleep: '', mood: '5', energy: '5', water: '', steps: '',
           heartRateResting: '', weight: '', food: [], supplements: [], notes: '' }
}
function extractNutrients(fdcFood) {
  const nMap = {}
  for (const n of (fdcFood.foodNutrients ?? [])) nMap[n.nutrientId] = n.value
  const out = { fdcId: fdcFood.fdcId, name: fdcFood.description, servingNote: 'per 100 g', id: Date.now() }
  for (const [id, meta] of Object.entries(NUTRIENTS)) out[meta.key] = +(nMap[+id] ?? 0).toFixed(2)
  return out
}

// ─── useHealthStore ───────────────────────────────────────────────────────────
function useHealthStore() {
  const [store, setStore] = useState(loadStore)
  const patch = useCallback((fn) => setStore(prev => { const next = fn(prev); persist(next); return next }), [])
  const setProfile  = useCallback((p)     => patch(s => ({ ...s, profile: p })), [patch])
  const upsertEntry = useCallback((entry) => patch(s => ({
    ...s,
    entries: [...s.entries.filter(e => e.date !== entry.date), entry]
      .sort((a, b) => b.date.localeCompare(a.date)),
  })), [patch])
  const deleteEntry = useCallback((date)  => patch(s => ({ ...s, entries: s.entries.filter(e => e.date !== date) })), [patch])
  const importStore = useCallback((imp)   => { persist(imp); setStore(imp) }, [])
  return { store, setProfile, upsertEntry, deleteEntry, importStore }
}

// ─── useFoodSearch ────────────────────────────────────────────────────────────
function useFoodSearch() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); setError(null); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true); setError(null)
      try {
        const key = localStorage.getItem(FDC_KEY_KEY) || 'DEMO_KEY'
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=8&dataType=SR%20Legacy,Foundation&api_key=${key}`
        const res = await fetch(url)
        if (res.status === 429) throw new Error('Rate limit hit. Add your free API key in Profile → Settings.')
        if (!res.ok)            throw new Error(`Search error (${res.status})`)
        const data = await res.json()
        setResults(data.foods?.slice(0, 8) ?? [])
      } catch (e) { setError(e.message); setResults([]) }
      finally    { setLoading(false) }
    }, 450)
    return () => clearTimeout(timer.current)
  }, [query])

  return { query, setQuery, results, setResults, loading, error }
}

// ─── usePubMed ────────────────────────────────────────────────────────────────
async function _pubmedFetch(query) {
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
  const searchRes  = await fetch(
    `${base}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=12&sort=relevance&retmode=json`
  )
  const searchData = await searchRes.json()
  const ids = searchData.esearchresult?.idlist ?? []
  if (!ids.length) return []
  const summaryRes  = await fetch(
    `${base}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
  )
  const summaryData = await summaryRes.json()
  return (summaryData.result?.uids ?? []).map(uid => summaryData.result[uid]).filter(Boolean)
}

function usePubMed() {
  const [articles,  setArticles]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [lastQuery, setLastQuery] = useState('')

  const search = useCallback(async (query) => {
    if (!query.trim()) return
    setLoading(true); setError(null); setLastQuery(query)
    try {
      const results = await _pubmedFetch(query)
      setArticles(results)
    } catch (e) {
      setError('PubMed request failed — check your connection.')
      setArticles([])
    } finally { setLoading(false) }
  }, [])

  return { articles, loading, error, lastQuery, search }
}

// ─── PrivacyNotice ────────────────────────────────────────────────────────────
function PrivacyNotice() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(PRIVACY_KEY))
  if (!visible) return null
  const dismiss = () => { localStorage.setItem(PRIVACY_KEY, '1'); setVisible(false) }
  return (
    <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-5">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0 text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Your data never leaves your device</p>
          <p>• Everything is stored in your browser's local storage — no account, no server, no backend.</p>
          <p>• The Hippocrates AI runs entirely on-device via WebLLM. Your health context is never sent anywhere.</p>
          <p>• Use <strong>Export</strong> to back up your data. Use <strong>Import</strong> to restore on the same or a different device.</p>
          <p>• Food search queries go directly to the USDA FoodData Central public API — only the search term is sent, nothing about your profile.</p>
          <p>• This tool is free, open source, and not monetized.</p>
        </div>
        <button onClick={dismiss} className="shrink-0 p-1 rounded-lg text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <button onClick={dismiss} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200">
        <CheckCircle2 className="w-4 h-4" /> Got it
      </button>
    </div>
  )
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────
function ProfileTab({ profile, setProfile }) {
  const [local,  setLocal]  = useState(profile)
  const [fdcKey, setFdcKey] = useState(() => localStorage.getItem(FDC_KEY_KEY) || '')
  const [saved,  setSaved]  = useState(false)

  const handleSave = () => {
    setProfile(local)
    if (fdcKey.trim()) localStorage.setItem(FDC_KEY_KEY, fdcKey.trim())
    else               localStorage.removeItem(FDC_KEY_KEY)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const F = ({ label, field, type = 'text', options, placeholder }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{label}</label>
      {options
        ? <select value={local[field] ?? ''} onChange={e => setLocal(p => ({ ...p, [field]: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        : <input type={type} placeholder={placeholder} value={local[field] ?? ''}
            onChange={e => setLocal(p => ({ ...p, [field]: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      }
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Name (optional)" field="name" />
        <F label="Age" field="age" type="number" />
        <F label="Biological Sex" field="sex" options={[
          {v:'',l:'Prefer not to say'},{v:'male',l:'Male'},{v:'female',l:'Female'},{v:'other',l:'Other'}]} />
        <F label="Height (cm)" field="heightCm" type="number" />
        <F label="Weight (kg)" field="weightKg" type="number" />
        <F label="Activity Level" field="activity" options={[
          {v:'sedentary',l:'Sedentary'},{v:'light',l:'Lightly active (1–3×/wk)'},
          {v:'moderate',l:'Moderately active (3–5×/wk)'},{v:'active',l:'Very active (6–7×/wk)'},
          {v:'athlete',l:'Athlete / physical labor'}]} />
        <F label="Diet Pattern" field="dietPattern" options={[
          {v:'omnivore',l:'Omnivore'},{v:'vegetarian',l:'Vegetarian'},{v:'vegan',l:'Vegan'},
          {v:'pescatarian',l:'Pescatarian'},{v:'keto',l:'Ketogenic'},{v:'paleo',l:'Paleo'},
          {v:'mediterranean',l:'Mediterranean'},{v:'other',l:'Other'}]} />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Health Goals</label>
        <textarea rows={2} value={local.goals} placeholder="e.g. improve sleep, build muscle, reduce stress…"
          onChange={e => setLocal(p => ({ ...p, goals: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Current Medications / Supplements</label>
        <textarea rows={2} value={local.medications} placeholder="e.g. metformin, vitamin D, omega-3…"
          onChange={e => setLocal(p => ({ ...p, medications: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
      </div>

      {/* USDA API Key */}
      <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
          <Key className="w-4 h-4" />
          <span className="text-sm font-semibold">USDA FoodData Central API Key</span>
        </div>
        <p className="text-xs text-sky-600 dark:text-sky-500">
          Food search uses the free USDA FoodData API. Leave blank to use the shared DEMO_KEY (30 req/hour).{' '}
          <a href="https://fdc.nal.usda.gov/api-key-signup.html" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-sky-800 dark:hover:text-sky-300">Get your own free key →</a>
        </p>
        <input type="text" value={fdcKey} placeholder="Paste your API key here (or leave blank for DEMO_KEY)"
          onChange={e => setFdcKey(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-sm text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-sky-400" />
      </div>

      <button onClick={handleSave}
        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
        {saved ? '✓ Saved' : 'Save Profile'}
      </button>
    </div>
  )
}

// ─── MacroBar ─────────────────────────────────────────────────────────────────
function MacroBar({ foods }) {
  const totals = foods.reduce((acc, f) => {
    acc.kcal    += +(f.kcal    ?? 0)
    acc.protein += +(f.protein ?? 0)
    acc.carbs   += +(f.carbs   ?? 0)
    acc.fat     += +(f.fat     ?? 0)
    acc.fiber   += +(f.fiber   ?? 0)
    return acc
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

  if (totals.kcal === 0) return null

  const items = [
    { label: 'kcal',    value: Math.round(totals.kcal),       color: 'bg-amber-400'   },
    { label: 'protein', value: totals.protein.toFixed(1)+'g', color: 'bg-sky-400'     },
    { label: 'carbs',   value: totals.carbs.toFixed(1)+'g',   color: 'bg-emerald-400' },
    { label: 'fat',     value: totals.fat.toFixed(1)+'g',     color: 'bg-rose-400'    },
    { label: 'fiber',   value: totals.fiber.toFixed(1)+'g',   color: 'bg-violet-400'  },
  ]

  return (
    <div className="flex flex-wrap gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-center">Today's totals:</span>
      {items.map(i => (
        <span key={i.label} className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-200">
          <span className={`w-2.5 h-2.5 rounded-full ${i.color}`} />
          <span className="font-mono font-semibold">{i.value}</span>
          <span className="text-slate-400">{i.label}</span>
        </span>
      ))}
    </div>
  )
}

// ─── FoodSearch ───────────────────────────────────────────────────────────────
function FoodSearch({ onAdd }) {
  const { query, setQuery, results, setResults, loading, error } = useFoodSearch()
  const [expanded, setExpanded] = useState(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const h = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setResults([]); setExpanded(null)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [setResults])

  const handleAdd = (food) => {
    onAdd(extractNutrients(food))
    setQuery(''); setResults([]); setExpanded(null)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-400">
        {loading
          ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
          : <Search className="w-4 h-4 text-slate-400 shrink-0" />}
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search USDA food database (e.g. chicken breast, apple, quinoa)…"
          className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-1 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          {results.map(food => {
            const isOpen = expanded === food.fdcId
            const n = {}
            for (const nf of (food.foodNutrients ?? [])) n[nf.nutrientId] = nf.value
            return (
              <div key={food.fdcId} className="border-b border-slate-100 dark:border-slate-700 last:border-none">
                <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{food.description}</p>
                    <p className="text-xs text-slate-400">{food.dataType}{n[1008] ? ` · ${Math.round(n[1008])} kcal/100g` : ''}</p>
                  </div>
                  <button onClick={() => setExpanded(isOpen ? null : food.fdcId)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors px-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleAdd(food)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shrink-0">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {isOpen && (
                  <div className="px-4 pb-3 grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-xs">
                    {[1008,1003,1004,1005,1079,1093,1092,1087,1089,1106,1162,1110].map(id => {
                      const meta = NUTRIENTS[id]; if (!meta || !n[id]) return null
                      return (
                        <div key={id} className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center">
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{(+n[id]).toFixed(1)}</div>
                          <div className="text-slate-400 truncate">{meta.label}</div>
                          <div className="text-slate-300 dark:text-slate-500">{meta.unit}/100g</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── TodayTab ─────────────────────────────────────────────────────────────────
function TodayTab({ store, upsertEntry }) {
  const today = todayISO()
  const [entry,    setEntry]    = useState(() => store.entries.find(e => e.date === today) ?? emptyEntry(today))
  const [saved,    setSaved]    = useState(false)
  const [suppForm, setSuppForm] = useState({ name: '', dose: '', timing: '' })

  const set = (f, v) => setEntry(e => ({ ...e, [f]: v }))
  const save = () => { upsertEntry(entry); setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const addFood    = (food) => setEntry(e => ({ ...e, food: [...e.food, food] }))
  const removeFood = (id)   => setEntry(e => ({ ...e, food: e.food.filter(f => f.id !== id) }))

  const addSupp    = () => {
    if (!suppForm.name.trim()) return
    setEntry(e => ({ ...e, supplements: [...e.supplements, { ...suppForm, id: Date.now() }] }))
    setSuppForm({ name: '', dose: '', timing: '' })
  }
  const removeSupp = (id) => setEntry(e => ({ ...e, supplements: e.supplements.filter(s => s.id !== id) }))

  const Metric = ({ icon: Icon, label, field, unit, color }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950/20 border border-${color}-100 dark:border-${color}-900/30`}>
      <Icon className={`w-5 h-5 text-${color}-500 shrink-0`} />
      <div className="flex-1 min-w-0">
        <label className={`block text-xs font-semibold text-${color}-600 dark:text-${color}-400 mb-0.5`}>{label}</label>
        <div className="flex items-center gap-1">
          <input type="number" value={entry[field]} onChange={e => set(field, e.target.value)}
            className="w-24 bg-transparent text-slate-800 dark:text-slate-200 text-sm font-mono focus:outline-none border-b border-slate-300 dark:border-slate-600" />
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{today}</span>
        <span>— today's log</span>
      </div>

      {/* Vitals */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vitals & Lifestyle</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Metric icon={Moon}     label="Sleep"              field="sleep"             unit="hrs" color="indigo" />
          <Metric icon={Droplets} label="Water"              field="water"             unit="glasses" color="sky" />
          <Metric icon={Activity} label="Steps"              field="steps"             unit="steps" color="emerald" />
          <Metric icon={Scale}    label="Weight"             field="weight"            unit="kg" color="violet" />
          <Metric icon={Heart}    label="Resting Heart Rate" field="heartRateResting"  unit="bpm" color="rose" />
        </div>
      </div>

      {/* Mood / energy */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Subjective</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[['mood','😊 Mood','emerald'],['energy','⚡ Energy','amber']].map(([f,l,c]) => (
            <div key={f}>
              <label className={`block text-xs font-semibold text-${c}-600 dark:text-${c}-400 mb-2`}>
                {l}<span className="ml-auto float-right font-mono text-slate-700 dark:text-slate-200">{entry[f]}/10</span>
              </label>
              <input type="range" min="1" max="10" value={entry[f] || 5}
                onChange={e => set(f, e.target.value)}
                className={`w-full accent-${c}-500`} />
            </div>
          ))}
        </div>
      </div>

      {/* Food log */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Food Log — USDA Search</h3>
        <MacroBar foods={entry.food} />
        <div className="mt-3 mb-3 space-y-1.5">
          {entry.food.map(f => (
            <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm group">
              <Apple className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="flex-1 text-slate-700 dark:text-slate-200 truncate">{f.name}</span>
              {f.kcal    > 0 && <span className="text-slate-400 text-xs font-mono shrink-0">{Math.round(f.kcal)} kcal</span>}
              {f.protein > 0 && <span className="hidden sm:inline text-slate-400 text-xs shrink-0">P:{f.protein}g</span>}
              {f.carbs   > 0 && <span className="hidden sm:inline text-slate-400 text-xs shrink-0">C:{f.carbs}g</span>}
              {f.fat     > 0 && <span className="hidden sm:inline text-slate-400 text-xs shrink-0">F:{f.fat}g</span>}
              <span className="text-xs text-slate-300 dark:text-slate-500 shrink-0">{f.servingNote}</span>
              <button onClick={() => removeFood(f.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <FoodSearch onAdd={addFood} />
      </div>

      {/* Supplements */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Supplement Log</h3>
        <div className="space-y-1.5 mb-3">
          {entry.supplements.map(s => (
            <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm group">
              <Pill className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="flex-1 text-slate-700 dark:text-slate-200">{s.name}</span>
              {s.dose   && <span className="text-slate-400 text-xs">{s.dose}</span>}
              {s.timing && <span className="text-slate-400 text-xs font-mono">{s.timing}</span>}
              <button onClick={() => removeSupp(s.id)} className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['name','Supplement…','flex-1 min-w-[140px]'],['dose','Dose','w-24'],['timing','Timing','w-28']].map(([f,p,cls]) => (
            <input key={f} type="text" placeholder={p} value={suppForm[f]}
              onChange={e => setSuppForm(s => ({ ...s, [f]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addSupp()}
              className={`${cls} px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400`} />
          ))}
          <button onClick={addSupp} className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Notes</label>
        <textarea rows={3} value={entry.notes} placeholder="Anything else about today…"
          onChange={e => set('notes', e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
      </div>

      <button onClick={save}
        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
        {saved ? '✓ Entry Saved' : "Save Today's Entry"}
      </button>
    </div>
  )
}

// ─── HistoryTab ───────────────────────────────────────────────────────────────
function HistoryTab({ store, deleteEntry }) {
  const [open, setOpen] = useState(null)
  if (store.entries.length === 0) return (
    <div className="text-center py-16 text-slate-400">
      <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">No entries yet. Log your first day in the <strong>Today</strong> tab.</p>
    </div>
  )
  return (
    <div className="space-y-3">
      {store.entries.map(entry => {
        const isOpen = open === entry.date
        const macros = entry.food.reduce((a, f) => {
          a.kcal    += +(f.kcal    ?? 0)
          a.protein += +(f.protein ?? 0)
          return a
        }, { kcal: 0, protein: 0 })
        return (
          <div key={entry.date} className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : entry.date)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
              <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200 shrink-0">{entry.date}</span>
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 text-xs">
                {[
                  ['😴', entry.sleep,     'h'],
                  ['💧', entry.water,     'gl'],
                  ['👣', entry.steps,     ''],
                  ['😊', entry.mood,      '/10'],
                  ['⚡', entry.energy,    '/10'],
                  macros.kcal    > 0 ? ['🔥', Math.round(macros.kcal),             'kcal'] : null,
                  macros.protein > 0 ? ['💪', macros.protein.toFixed(0)+'g',       'P'   ] : null,
                ].filter(Boolean).map(([e,v,u]) => v ? (
                  <span key={e} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {e}<span className="font-mono font-semibold">{v}</span>{u && <span className="text-slate-400">{u}</span>}
                  </span>
                ) : null)}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-4 space-y-3">
                {entry.food.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Food</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.food.map(f => (
                        <span key={f.id} className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-300">
                          {f.name}{f.kcal > 0 ? ` · ${Math.round(f.kcal)} kcal` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.supplements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Supplements</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.supplements.map(s => (
                        <span key={s.id} className="px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/30 text-xs text-violet-700 dark:text-violet-300">
                          {s.name}{s.dose ? ` · ${s.dose}` : ''}{s.timing ? ` · ${s.timing}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.notes && <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{entry.notes}"</p>}
                <button onClick={() => deleteEntry(entry.date)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete entry
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── LearnTab ─────────────────────────────────────────────────────────────────
const LEARN_SECTIONS = [
  {
    id: 'bluezones', title: 'Blue Zones', icon: '🌍',
    content: [
      { heading: 'What are Blue Zones?', body: 'The term was coined by researcher Dan Buettner and National Geographic to describe five regions where people consistently live past 100 at unusually high rates: Okinawa (Japan), Sardinia (Italy), Loma Linda (California), Ikaria (Greece), and the Nicoya Peninsula (Costa Rica).' },
      { heading: 'Okinawa, Japan', body: 'Diet centers on sweet potatoes, tofu, bitter melon, and seaweed. Very low caloric density. Strong moai (social support circles) and ikigai (sense of purpose). Historically very low meat consumption.' },
      { heading: 'Sardinia, Italy', body: 'Cannonau wine (high polyphenols), pecorino cheese, whole grains, and legumes. Multigenerational households. Men are unusually long-lived compared to other Blue Zones.' },
      { heading: 'Loma Linda, California', body: 'Seventh-day Adventist community. Predominantly whole-food plant-based. Regular nut consumption. Active faith community and scheduled rest (Sabbath). Nonsmoking, non-alcohol.' },
      { heading: 'Ikaria, Greece', body: 'Mediterranean diet rich in olive oil, vegetables, and legumes. Herbal teas (wild rosemary, sage, marjoram). Regular midday naps. Low rates of dementia and depression.' },
      { heading: 'Nicoya Peninsula, Costa Rica', body: '"Plan de vida" (life purpose) is central. Diet based on beans, corn, squash, and tropical fruits. Strong family bonds and community. Hard physical labor well into old age.' },
      { heading: 'The Power 9', body: '1. Move naturally. 2. Purpose (ikigai / plan de vida). 3. Downshift (stress reduction). 4. 80% rule — hara hachi bu (stop at 80% full). 5. Plant slant (legumes as cornerstone protein). 6. Wine at 5 (moderate, with food and friends). 7. Belong (faith community). 8. Loved ones first. 9. Right tribe (social circles that reinforce healthy behaviors).' },
    ],
  },
  {
    id: 'fasting', title: 'Intermittent Fasting', icon: '⏱️',
    content: [
      { heading: 'What is Intermittent Fasting?', body: 'Intermittent fasting (IF) is a pattern of eating that alternates between defined periods of fasting and eating. It does not specify which foods to eat, only when.' },
      { heading: '16:8 (Leangains)', body: 'Fast for 16 hours, eat within an 8-hour window. Most practiced protocol. Common example: eat noon–8 PM, fast 8 PM–noon. Black coffee, plain tea, and water allowed during the fast.' },
      { heading: '5:2 Protocol', body: 'Eat normally for 5 days. On 2 non-consecutive days, restrict intake to ~500–600 kcal. Popularized by Dr. Michael Mosley. Evidence shows benefits similar to continuous caloric restriction.' },
      { heading: 'OMAD (One Meal a Day)', body: 'A 23:1 fasting window. Considered advanced. Difficult to meet protein and micronutrient needs in a single meal. Not recommended without prior IF experience or medical supervision.' },
      { heading: 'Mechanisms', body: 'After 12–16 hours of fasting, glycogen stores deplete and the body shifts to fat oxidation. Ketone bodies rise (metabolic switching). Autophagy — cellular self-cleaning — is upregulated. Insulin falls significantly, improving insulin sensitivity. mTOR is downregulated, a pathway associated with longevity.' },
      { heading: 'Evidence Summary', body: 'Strong: weight management, insulin sensitivity, triglyceride reduction. Moderate: cardiovascular markers, blood pressure. Emerging: cognitive function, cancer risk reduction, longevity. Caution: not recommended for pregnancy, eating disorder history, or type 1 diabetes without medical supervision.' },
    ],
  },
  {
    id: 'mediterranean', title: 'Mediterranean Diet', icon: '🫒',
    content: [
      { heading: 'Overview', body: 'Consistently ranked as one of the most evidence-backed dietary patterns. Inspired by traditional eating habits around the Mediterranean Sea in the 1960s, when chronic disease rates were notably lower.' },
      { heading: 'What to eat', body: 'Foundation: vegetables, fruits, legumes, whole grains, nuts, seeds, and extra-virgin olive oil as the primary fat. Moderate: fish (2+×/week), poultry, eggs, dairy. Limited: red meat and sweets.' },
      { heading: 'The PREDIMED Trial', body: 'Landmark randomized trial (n=7,447) showed ~30% reduction in major cardiovascular events with a Mediterranean diet supplemented with extra-virgin olive oil or mixed nuts versus a low-fat control.' },
      { heading: 'Evidence', body: 'Cardiovascular protection, reduced LDL oxidation, anti-inflammatory effects, improved insulin sensitivity, reduced type 2 diabetes risk, cognitive function preservation, and reduction in all-cause mortality across multiple large cohort studies.' },
      { heading: 'Practical tips', body: 'Replace butter with olive oil. Eat a handful of nuts daily. Fish twice a week. Make vegetables the star of the plate. Cook with garlic, herbs, and spices. Eat with others when possible.' },
    ],
  },
  {
    id: 'dash', title: 'DASH Diet', icon: '🫀',
    content: [
      { heading: 'What is DASH?', body: 'Dietary Approaches to Stop Hypertension. Developed in the 1990s by NIH-funded researchers specifically to reduce blood pressure without medication.' },
      { heading: 'Key nutritional targets', body: 'High: potassium (4,700 mg/day), calcium (1,250 mg/day), magnesium (500 mg/day), fiber (30 g/day). Low: sodium (<2,300 mg/day, ideally <1,500 mg for hypertension). Moderate: protein, unsaturated fats.' },
      { heading: 'Food pattern', body: 'Emphasis on vegetables, fruits, whole grains, lean protein, and low-fat dairy. Limits saturated fat, sodium, sweets, and sugary beverages. Red meat limited to a few times per week.' },
      { heading: 'Evidence', body: 'Proven to reduce systolic blood pressure by 8–14 mmHg in clinical trials. Reduces cardiovascular disease risk. Often recommended by cardiologists as a first-line dietary intervention before medication.' },
      { heading: 'MIND Diet', body: 'A hybrid of DASH and Mediterranean, targeted at brain health. Emphasizes leafy greens, berries, nuts, olive oil, fish, and whole grains. Strict MIND adherence associated with ~53% lower rate of Alzheimer\'s disease in observational studies.' },
    ],
  },
  {
    id: 'nutrients', title: 'Quick RDA Reference', icon: '📊',
    content: [
      { heading: 'Key Daily Reference Values (adults 19–50)', body: 'Protein: 0.8 g/kg body weight minimum (1.6–2.2 g/kg for muscle building). Fiber: 25 g (women), 38 g (men). Vitamin D: 600–800 IU / 15–20 mcg. Vitamin B12: 2.4 mcg. Folate: 400 mcg (600 mcg pregnancy). Iron: 8 mg (men), 18 mg (premenopausal women). Calcium: 1,000 mg. Magnesium: 310–420 mg. Omega-3: 1.1–1.6 g ALA minimum; EPA+DHA from fatty fish 2×/week recommended.' },
      { heading: 'Common insufficiencies', body: 'Vitamin D: ~40% of US adults deficient. Magnesium: ~50% below RDA from diet alone. Vitamin B12: risk rises after age 50 and in vegans/vegetarians. Iron: most common nutritional deficiency worldwide, especially premenopausal women. Omega-3s: most people fall short of EPA+DHA recommendations.' },
      { heading: 'Fat-soluble vitamins (A, D, E, K)', body: 'Absorbed with dietary fat. Stored in the liver and fatty tissue. Upper limits matter for A and D. Take with a fat-containing meal. Vitamin K2 (MK-7, from fermented foods) is distinct from K1 (leafy greens) and plays a role in calcium metabolism and arterial health.' },
      { heading: 'Supplement timing notes', body: 'Vitamin D: with a fat-containing meal. Magnesium: evening may support sleep (glycinate or threonate preferred). Iron: on empty stomach with vitamin C; separate from calcium. B12: sublingual or methylcobalamin forms preferred after age 50. Zinc: with small amount of food to prevent nausea; separate from iron.' },
    ],
  },
]

function LearnSection({ section }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
        <span className="text-2xl">{section.icon}</span>
        <span className="flex-1 font-semibold text-slate-800 dark:text-slate-200">{section.title}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-5 space-y-4">
          {section.content.map((item, i) => (
            <div key={i}>
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{item.heading}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LearnTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Evidence-based summaries on dietary and lifestyle patterns with the strongest research backing. Click any section to expand.
      </p>
      {LEARN_SECTIONS.map(s => <LearnSection key={s.id} section={s} />)}
    </div>
  )
}

// ─── NewsTab ──────────────────────────────────────────────────────────────────
function HourlyFact() {
  const hour = new Date().getHours()
  const fact = HOURLY_FACTS[hour % HOURLY_FACTS.length]
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 p-4 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🕐</span>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Science Spotlight · {fact.time}
        </span>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{fact.fact}</p>
      <p className="text-xs text-slate-400 mt-2">Updates each hour · based on circadian biology and nutrition research</p>
    </div>
  )
}

function PubMedCard({ article }) {
  const uid     = article.uid
  const title   = (article.title ?? 'Untitled').replace(/\.$/, '')
  const authors = (article.authors ?? []).slice(0, 3).map(a => a.name).join(', ')
  const more    = (article.authors?.length ?? 0) > 3 ? ` +${article.authors.length - 3}` : ''
  const journal = article.source ?? ''
  const year    = (article.pubdate ?? '').slice(0, 4)
  return (
    <a href={`https://pubmed.ncbi.nlm.nih.gov/${uid}/`} target="_blank" rel="noopener noreferrer"
      className="block px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-1.5">{title}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
            {authors && <span>{authors}{more}</span>}
            {journal && <span className="text-emerald-600 dark:text-emerald-500 font-medium">{journal}</span>}
            {year    && <span className="font-mono">{year}</span>}
            <span className="text-slate-300 dark:text-slate-600 font-mono">PMID {uid}</span>
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-400 shrink-0 mt-0.5 transition-colors" />
      </div>
    </a>
  )
}

function NewsTab() {
  const { articles, loading, error, lastQuery, search } = usePubMed()
  const [customQuery, setCustomQuery] = useState('')
  const initDone = useRef(false)

  // Auto-load a topic keyed to the current hour on mount
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true
    const preset = SEARCH_PRESETS[new Date().getHours() % SEARCH_PRESETS.length]
    search(preset.query)
  }, [search])

  const handleCustom = (e) => {
    e.preventDefault()
    if (customQuery.trim()) search(customQuery.trim())
  }

  return (
    <div>
      <HourlyFact />

      {/* Custom search */}
      <form onSubmit={handleCustom} className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-400">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text" value={customQuery} onChange={e => setCustomQuery(e.target.value)}
            placeholder='Search PubMed (e.g. "creatine cognitive function")…'
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
          {customQuery && (
            <button type="button" onClick={() => setCustomQuery('')}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <button type="submit" disabled={!customQuery.trim() || loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-40">
          Search
        </button>
      </form>

      {/* Keyword preset chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {SEARCH_PRESETS.map(p => (
          <button key={p.label} onClick={() => { setCustomQuery(''); search(p.query) }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
              lastQuery === p.query
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Searching PubMed…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-400 py-2">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}
      {!loading && articles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 mb-3">
            {articles.length} results for{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">{lastQuery}</span>
            {' '}— sorted by relevance
          </p>
          {articles.map(a => <PubMedCard key={a.uid} article={a} />)}
        </div>
      )}
      {!loading && !error && articles.length === 0 && lastQuery && (
        <p className="text-sm text-slate-400 py-8 text-center">No results found for "{lastQuery}"</p>
      )}

      <p className="mt-5 text-xs text-slate-400 text-center">
        Powered by{' '}
        <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-500">
          NCBI PubMed
        </a>
        {' '}· Free public API · No key required · Articles open in PubMed
      </p>
    </div>
  )
}

// ─── HippocratesTab ───────────────────────────────────────────────────────────
function HippocratesTab({ profile }) {
  const { ask, isThinking, isDownloading, downloadProgress } = useHippocratesAI()
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: "Hello — I'm Hippocrates, your health education assistant. Ask me anything about nutrition, supplements, sleep, biomarkers, or lifestyle patterns. I provide educational context, not medical advice. Always consult your healthcare provider for personal medical decisions.",
  }])
  const [input,  setInput]  = useState('')
  const [useCtx, setUseCtx] = useState(true)
  const bottomRef           = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isThinking])

  const ctx = () => {
    if (!useCtx) return null
    const c = {}
    if (profile.age)         c.age         = profile.age
    if (profile.sex)         c.sex         = profile.sex
    if (profile.activity)    c.activity    = profile.activity
    if (profile.dietPattern) c.dietPattern = profile.dietPattern
    if (profile.goals)       c.goals       = profile.goals
    if (profile.medications) c.medications = profile.medications
    return Object.keys(c).length ? c : null
  }

  const send = async () => {
    const q = input.trim()
    if (!q || isThinking || isDownloading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    const ans = await ask(q, ctx())
    setMessages(m => [...m, { role: 'assistant', text: ans }])
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-3 text-xs text-amber-700 dark:text-amber-400">
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Educational information only — not a substitute for professional medical advice, diagnosis, or treatment.</span>
      </div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <button onClick={() => setUseCtx(u => !u)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${useCtx
            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
          }`}>
          <User className="w-3.5 h-3.5" />
          {useCtx ? 'Using profile context' : 'No profile context'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-emerald-600 text-white rounded-br-md'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-md'
            }`}>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                  <Heart className="w-3 h-3" /> Hippocrates
                </div>
              )}
              {m.role === 'assistant'
                ? <MarkdownProse text={m.text} />
                : m.text
              }
            </div>
          </div>
        ))}
        {(isThinking || isDownloading) && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                <Heart className="w-3 h-3" /> Hippocrates
              </div>
              {isDownloading
                ? <span className="text-xs font-mono text-slate-400">{downloadProgress || 'Downloading model (first load only)…'}</span>
                : <span className="flex gap-1 items-center">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
              }
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about nutrition, supplements, sleep, biomarkers…"
          disabled={isThinking || isDownloading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50" />
        <button onClick={send} disabled={!input.trim() || isThinking || isDownloading}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'today',       label: 'Today',         Icon: ClipboardList },
  { id: 'history',     label: 'History',        Icon: History       },
  { id: 'learn',       label: 'Learn',          Icon: BookOpen      },
  { id: 'news',        label: 'News',           Icon: Newspaper     },
  { id: 'hippocrates', label: 'Hippocrates AI', Icon: Brain         },
  { id: 'profile',     label: 'Profile',        Icon: User          },
]

export default function HealthTrackerPage() {
  const { store, setProfile, upsertEntry, deleteEntry, importStore } = useHealthStore()
  const [tab, setTab] = useState('today')
  const importRef     = useRef(null)

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `health-data-${todayISO()}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target.result)
        if (p.profile !== undefined && Array.isArray(p.entries)) importStore(p)
        else alert('Invalid health data file. Expected { profile, entries }.')
      } catch { alert('Could not parse file. Use a valid health data export.') }
    }
    reader.readAsText(file); e.target.value = ''
  }

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-10 min-h-[calc(100vh-3.5rem)]">
      {/* Health-themed background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 dark:from-emerald-950/20 dark:via-slate-950 dark:to-teal-950/10" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-teal-100/40 dark:bg-teal-900/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-emerald-50/60 dark:bg-emerald-900/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Health Tracker</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {store.entries.length} {store.entries.length === 1 ? 'entry' : 'entries'} · 100% local · no account needed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 backdrop-blur-sm"
              title="Export your health data as JSON">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={() => importRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 backdrop-blur-sm"
              title="Import a previously exported health data file">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </div>

        <PrivacyNotice />

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm p-1 rounded-2xl border border-white/50 dark:border-slate-700/50 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                tab === id
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-sm">
          {tab === 'today'       && <TodayTab      store={store} upsertEntry={upsertEntry} />}
          {tab === 'history'     && <HistoryTab    store={store} deleteEntry={deleteEntry} />}
          {tab === 'learn'       && <LearnTab />}
          {tab === 'news'        && <NewsTab />}
          {tab === 'hippocrates' && <HippocratesTab profile={store.profile} />}
          {tab === 'profile'     && <ProfileTab    profile={store.profile} setProfile={setProfile} />}
        </div>
      </div>
    </div>
  )
}
