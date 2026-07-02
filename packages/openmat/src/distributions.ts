import { isCollection, mapDeep } from './math-utils.js'

// ── Statistical distribution math helpers ─────────────────────────────────────
// Internal — prefixed with _ to signal low-level use.

export function _erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x)
  return x >= 0 ? y : -y
}

export function _gammaln(x: number): number {
  if (x <= 0) return Infinity
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]
  let y = x, tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) { y += 1; ser += c[j] / y }
  return -tmp + Math.log(2.5066282746310005 * ser / x)
}

export function _gammainc(a: number, x: number): number {
  if (x <= 0) return 0
  if (x < a + 1) {
    let term = 1 / a, sum = term
    for (let n = 1; n < 300; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < 1e-14 * Math.abs(sum)) break }
    return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - _gammaln(a)))
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d
  for (let i = 1; i <= 300; i++) {
    const an = -i * (i - a); b += 2
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d; h *= d * c
    if (Math.abs(d * c - 1) < 1e-14) break
  }
  return 1 - Math.min(1, h * Math.exp(-x + a * Math.log(x) - _gammaln(a)))
}

export function _betacf(x: number, a: number, b: number): number {
  const qab = a + b, qap = a + 1, qam = a - 1
  let c = 1, d = 1 - qab * x / qap
  if (Math.abs(d) < 1e-300) d = 1e-300
  d = 1 / d; let h = d
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d; h *= d * c
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d; const del = d * c; h *= del
    if (Math.abs(del - 1) < 3e-7) break
  }
  return h
}

export function _betainc(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const lbeta = _gammaln(a) + _gammaln(b) - _gammaln(a + b)
  const bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta)
  return x < (a + 1) / (a + b + 2) ? bt * _betacf(x, a, b) / a : 1 - bt * _betacf(1 - x, b, a) / b
}

export function _norminvScalar(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  const a = [-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00]
  const b = [-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01]
  const c = [-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00]
  const d = [7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00]
  const plo = 0.02425, phi = 1 - plo
  let q: number, r: number
  if (p < plo) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1) }
  if (p <= phi) { q = p - 0.5; r = q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1) }
  q = Math.sqrt(-2 * Math.log(1 - p))
  return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
}

export function _tcdfScalar(t: number, df: number): number {
  const x = df / (df + t * t)
  const ib = _betainc(x, df / 2, 0.5)
  return t >= 0 ? 1 - ib / 2 : ib / 2
}

export function _tpdfScalar(t: number, df: number): number {
  return Math.exp(_gammaln((df+1)/2) - _gammaln(df/2) - 0.5*Math.log(df*Math.PI) - (df+1)/2*Math.log(1+t*t/df))
}

export function _tinvScalar(p: number, df: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  let t = _norminvScalar(p)
  for (let i = 0; i < 80; i++) {
    const ft = _tcdfScalar(t, df) - p
    if (Math.abs(ft) < 1e-12) break
    const fpdf = _tpdfScalar(t, df)
    if (fpdf < 1e-300) break
    t -= ft / fpdf
  }
  return t
}

export function _chi2cdfScalar(x: number, df: number): number { return x <= 0 ? 0 : _gammainc(df / 2, x / 2) }

export function _chi2pdfScalar(x: number, df: number): number {
  if (x <= 0) return 0
  return Math.exp((df/2-1)*Math.log(x) - x/2 - _gammaln(df/2) - df/2*Math.log(2))
}

export function _chi2invScalar(p: number, df: number): number {
  if (p <= 0) return 0
  if (p >= 1) return Infinity
  const h = 2/(9*df), z = _norminvScalar(p)
  let x = Math.max(1e-6, df * Math.pow(Math.max(0, 1 - h + z * Math.sqrt(h)), 3))
  for (let i = 0; i < 80; i++) {
    const fx = _chi2cdfScalar(x, df) - p
    if (Math.abs(fx) < 1e-12) break
    const fpdf = _chi2pdfScalar(x, df)
    if (fpdf < 1e-300) break
    x = Math.max(1e-10, x - fx / fpdf)
  }
  return x
}

/** Wraps a scalar distribution fn so it can accept vectors/matrices element-wise. */
export function _ewDistrib(fn: (x: number, ...params: number[]) => number) {
  return (v: unknown, ...params: unknown[]): unknown =>
    isCollection(v)
      ? mapDeep(v, (x) => fn(Number(x), ...params.map(Number)))
      : fn(Number(v), ...params.map(Number))
}
