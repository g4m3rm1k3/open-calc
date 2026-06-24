// Walks a lesson object and validates every bit of LaTeX it contains, the
// same way scripts/check_latex.mjs does in CI. Kept free of Node-only APIs
// (no fs/path) so it can also run in the browser — the Lesson Builder uses
// this to warn a contributor about broken LaTeX before they submit, instead
// of only finding out from a failed CI check after opening a PR.
import katex from 'katex'
import { preprocess, extractMathSegments } from './latexPreprocess.js'

// 'math' is used in walkthrough steps and similar fields — always raw LaTeX,
// never prose with embedded delimiters. Must bypass preprocess/wrapBareLatex
// (which mangles subscripted operators like A_{\max} into A_{$\max}$}).
const RAW_TEX_KEYS = new Set(['tex', 'expression', 'math'])
const KATEX_OPTIONS = { throwOnError: true, strict: false, trust: false }

function checkRawTex(tex, path, errors) {
  try {
    katex.renderToString(tex, KATEX_OPTIONS)
  } catch (error) {
    errors.push({ path, message: error.message })
  }
}

function checkProse(text, path, errors) {
  const processed = preprocess(text)
  for (const segment of extractMathSegments(processed)) {
    try {
      katex.renderToString(segment, KATEX_OPTIONS)
    } catch (error) {
      errors.push({ path, message: `${error.message} (in "${segment.slice(0, 60)}")` })
    }
  }
}

// Deliberately doesn't hand-enumerate fields by name, since lesson schemas
// vary across course tracks. Any string under a "tex"/"expression" key is
// raw LaTeX; every other string is prose that may contain delimited math —
// except "props", which is opaque pass-through data handed directly to a
// visualization component (code-editor file contents, numeric config, etc,
// per builderUtils.js's childrenToVizs/vizsToChildren) and was never meant
// to go through MarkdownProse/KaTeX at all.
const SKIP_KEYS = new Set(['props'])

function walk(value, path, parentKey, errors) {
  if (value == null) return
  if (SKIP_KEYS.has(parentKey)) return
  if (typeof value === 'string') {
    if (RAW_TEX_KEYS.has(parentKey)) checkRawTex(value, path, errors)
    else checkProse(value, path, errors)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${path}[${i}]`, parentKey, errors))
    return
  }
  if (typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      walk(v, `${path}.${key}`, key, errors)
    }
  }
}

/** Returns [{ path, message }] for every piece of broken LaTeX found in `lesson`. */
export function checkLessonLatex(lesson, label = 'lesson') {
  const errors = []
  walk(lesson, label, null, errors)
  return errors
}
