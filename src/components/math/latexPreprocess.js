/**
 * Pure text preprocessing shared between MarkdownProse (renders lesson prose
 * in the app) and scripts/check_latex.mjs (validates lesson LaTeX in CI / the
 * lesson builder). Kept dependency-free and JSX-free so it can be imported
 * from a plain Node script, not just from React.
 *
 * Converts the lesson-content notation to remark-math notation:
 *   \[…\]  →  $$…$$   (display / block math)
 *   \(…\)  →  $…$     (inline math)
 *   {{algebra:id|text}}  →  **text**  (bold label; preserves readability)
 *   bare \command  →  $\command…$  (wraps math the author forgot to delimit)
 */

/**
 * Scan forward from `start` (where src[start] === '\\') and collect a bare
 * LaTeX expression. Stops when all braces are closed and the next character is
 * NOT a math-continuation character (_ ^ { \).  Returns the end index.
 */
export function scanBareMath(src, start) {
  // \begin{env}...\end{env} is a multi-token LaTeX environment (cases,
  // aligned, array, matrix, ...) — the general bare-command scan below only
  // ever consumes one \command{...} unit, so without this it would wrap just
  // "\begin{cases}" alone and leave the rest of the environment as broken
  // unrendered text. Jump straight to the matching \end{env} instead.
  const envMatch = /^\\begin\{([a-zA-Z*]+)\}/.exec(src.slice(start))
  if (envMatch) {
    const endToken = `\\end{${envMatch[1]}}`
    const endIndex = src.indexOf(endToken, start)
    if (endIndex !== -1) return endIndex + endToken.length
  }

  // \left(...\right) must stay balanced across the whole expression — and
  // can nest, e.g. \left(\left[...\right]\right) — so jump straight to the
  // matching \right instead of stopping at the first space/punctuation
  // inside the parens, which would split it into two broken fragments.
  if (src.startsWith('\\left', start)) {
    let leftDepth = 0
    let j = start
    while (j < src.length) {
      if (src.startsWith('\\left', j)) { leftDepth++; j += 5; continue }
      if (src.startsWith('\\right', j)) {
        leftDepth--
        j += 6
        if (leftDepth === 0) {
          return src[j] === '\\' ? j + 2 : j + 1 // consume the delimiter after \right, e.g. ) ] | \}
        }
        continue
      }
      j++
    }
    // unbalanced in the source — fall through to the general scan below
  }

  let i = start
  let depth = 0
  let hadBraces = false

  while (i < src.length) {
    const c = src[i]
    // LaTeX spacing escapes (\, \; \: \! and an escaped literal space) are
    // two-character tokens whose second character (a comma, semicolon, etc)
    // would otherwise look like prose punctuation and wrongly end the scan
    // right after the bare backslash — e.g. "\forall\,y" stopping at "\forall\"
    // and leaving a dangling backslash for KaTeX to choke on.
    if (c === '\\' && / |,|;|:|!/.test(src[i + 1] ?? '')) {
      i += 2
      continue
    }
    if (c === '{') {
      depth++
      hadBraces = true
      i++
      continue
    }
    if (c === '}') {
      if (depth > 0) depth--
      i++
      if (depth === 0 && hadBraces) {
        const peek = i < src.length ? src[i] : ''
        if (peek === '_' || peek === '^' || peek === '{' || peek === '\\')
          continue
        break // all braces closed, not continuing — stop here
      }
      continue
    }
    if (depth === 0) {
      if (c === '\n') break
      // Bare command with no braces: stop at space or prose punctuation
      if (
        !hadBraces &&
        (c === ' ' ||
          c === ',' ||
          c === '.' ||
          c === ';' ||
          c === '!' ||
          c === '?')
      )
        break
    }
    i++
  }
  return i
}

/**
 * Wrap bare \command expressions that are NOT already inside $, $$, \(, or \[
 * delimiters in $…$.  This fixes prose like "write \frac{a}{b} and cancel"
 * where the author forgot to add dollar signs.
 */
export function wrapBareLatex(src) {
  let out = ''
  let i = 0
  while (i < src.length) {
    // Skip past inline code spans untouched — prose describing code often
    // contains literal backslash sequences (e.g. `\r\n`, `\b`) that aren't
    // LaTeX at all and shouldn't be wrapped just because they start with a
    // backslash-letter.
    if (src[i] === '`') {
      const close = src.indexOf('`', i + 1)
      if (close !== -1) {
        out += src.slice(i, close + 1)
        i = close + 1
        continue
      }
    }
    // Skip past already-delimited math so we don't double-wrap
    if (src.startsWith('$$', i)) {
      const close = src.indexOf('$$', i + 2)
      if (close !== -1) {
        out += src.slice(i, close + 2)
        i = close + 2
        continue
      }
    }
    if (src[i] === '$' && src[i - 1] !== '\\') {
      const close = src.indexOf('$', i + 1)
      if (close !== -1 && close - i < 300) {
        out += src.slice(i, close + 1)
        i = close + 1
        continue
      }
    }
    // src[i - 1] !== '\\' excludes LaTeX's "\\(" / "\\[6pt]" row-spacing
    // idiom (a literal \\ line-break followed by an optional [..] arg) —
    // see the matching note in preprocess() below for why this matters.
    if (src.startsWith('\\(', i) && src[i - 1] !== '\\') {
      const close = src.indexOf('\\)', i + 2)
      if (close !== -1) {
        out += src.slice(i, close + 2)
        i = close + 2
        continue
      }
    }
    if (src.startsWith('\\[', i) && src[i - 1] !== '\\') {
      const close = src.indexOf('\\]', i + 2)
      if (close !== -1) {
        out += src.slice(i, close + 2)
        i = close + 2
        continue
      }
    }
    // Bare \command — wrap in $...$
    if (src[i] === '\\' && i + 1 < src.length && /[a-zA-Z]/.test(src[i + 1])) {
      const end = scanBareMath(src, i)
      if (end > i + 1) {
        out += '$' + src.slice(i, end) + '$'
        i = end
        continue
      }
    }
    out += src[i]
    i++
  }
  return out
}

export function preprocess(text) {
  if (!text) return ''
  // Normalize escaped newlines from lesson data strings before any other processing.
  // We use (?![a-z]) (lowercase only) to avoid matching \n inside LaTeX commands
  // like \neq or \nabla, while still converting "...}\n\nThe next sentence" —
  // a paragraph-break marker glued directly to a capitalized word with no space,
  // which is overwhelmingly more common in this content than a genuine \n+uppercase
  // command (e.g. \nVdash). A prior (?![a-zA-Z]) version matched both cases and left
  // markers like "\nThe"/"\nSubstitute" as literal text, which wrapBareLatex() then
  // mistook for bare LaTeX commands and broke (see scripts/check_latex.mjs findings).
  //
  // Code fences (```...```) are split out and reassembled so this replace never
  // touches \n escape sequences inside Python/JS string literals in code blocks.
  const CODE_FENCE = /^```[\s\S]*?^```/gm
  const codeParts = []
  const stripped = text.replace(CODE_FENCE, (match) => {
    codeParts.push(match)
    return `\x00CODE${codeParts.length - 1}\x00`
  })
  const normalized = stripped
    .replace(/\\n(?![a-z])/g, '\n\n')
    .replace(/\x00CODE(\d+)\x00/g, (_, i) => codeParts[Number(i)])
  return (
    wrapBareLatex(normalized)
      // \[…\] → $$…$$ (block / display math). Matched as ONE pair (not two
      // independent replaces) so whatever whitespace/newlines already
      // surround \[ and \] are preserved as-is on both sides. This matters
      // inside list items: \[ / \] indented to match the item's 2-space
      // continuation (e.g. "  \[\n  A x = \\lambda x\n  \]") must produce
      // an equally-indented closing "$$", or remark/micromark sees the
      // unindented "$$" as falling outside the list item's container and
      // starting a brand-new (now unclosed) math block — which then
      // swallows everything up to the next "$$" it finds, however far away
      // (confirmed: this is what broke Diagonalisation.md's eigenspace
      // section — a 2-space-indented \[...\] inside a list item).
      //
      // (?<!\\) excludes LaTeX's own "\\[6pt]"/"\\[10pt]" row-spacing idiom
      // (a literal \\ line-break followed by an optional-arg [..]) — without
      // it, the second backslash + "[" reads as a display-math opener with
      // no matching closer, which permanently shifts the open/close parity
      // for every \[...\] in the rest of the document.
      .replace(/(?<!\\)\\\[([\s\S]*?)(?<!\\)\\\]/g, (_, inner) => `$$${inner}$$`)
      // \(…\) → $…$ (inline math)
      .replace(/(?<!\\)\\\(/g, '$')
      .replace(/(?<!\\)\\\)/g, '$')
      // {{algebra:topicId|linkText}} → **linkText**  (preserves visible text)
      .replace(/\{\{algebra:[^|]+\|([^}]+)\}\}/g, '**$1**')
      // "Step N:" mid-sentence → new paragraph with bold label.
      .replace(/\.\s+(Step\s+\d+:)/g, '.\n\n**$1**')
      // "(1) ... (2) ..." inline numbered steps → new paragraphs.
      // Matches a period/em-dash followed by a space then "(N)" at start of a new step.
      .replace(/[.—]\s+(\(\d+\))\s+/g, '.\n\n$1 ')
      // Sentence break after inline math: "$math$. Next sentence" → hard line break.
      // Only match horizontal whitespace (space/tab) — \s+ would also eat blank lines,
      // collapsing paragraph→"---" into a setext h2 underline for the whole paragraph.
      .replace(/(\$[^$\n]+\$)\.[ \t]+(?=\S)/g, '$1.  \n')
      // A whole line that's just "$$<equation>$$" (e.g. from a \[...\] that
      // was crammed inline with other text rather than on its own line)
      // parses as INLINE math, not display/block — remark-math only treats
      // $$ as block math when the delimiters sit alone on their own line.
      // Promote it to a proper 3-line block so it still gets display
      // rendering. A function replacer is used throughout — see the note
      // above about "$$" being special inside a replacement *string*.
      .replace(/^(\s*)\$\$(.+)\$\$(\s*)$/gm, (_, lead, inner, trail) =>
        inner.trim() ? `${lead}$$\n${inner.trim()}\n$$${trail}` : `${lead}$$${inner}$$${trail}`)
  )
}

/** Extract every $$...$$ and $...$ delimited math segment from already-preprocessed text. */
export function extractMathSegments(processedText) {
  const segments = []
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g
  let match
  while ((match = pattern.exec(processedText)) !== null) {
    segments.push(match[1] ?? match[2])
  }
  return segments
}
