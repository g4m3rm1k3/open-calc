import type { PracticeChallenge } from './loader'

export const title = 'Cross-Site Scripting (XSS)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `escapeHtml(str)` converting `&`, `<`, `>`, and `"` into their HTML entity equivalents (`&amp;`, `&lt;`, `&gt;`, `&quot;`), so a browser renders the result as inert TEXT instead of parsing it as markup.',
        starter: '',
        tests: `
assert escapeHtml('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;'
assert escapeHtml('a & b') === 'a &amp; b'
`,
        solution: `function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `renderComment(userComment, escapeFn)`: it must pass `userComment` through `escapeFn` BEFORE embedding it in the HTML string — rendering raw, unescaped user input directly into a page is exactly what causes XSS.',
        starter: 'function escapeHtml(str) {\n  return str\n    .replace(/&/g, \'&amp;\')\n    .replace(/</g, \'&lt;\')\n    .replace(/>/g, \'&gt;\')\n    .replace(/"/g, \'&quot;\')\n}\nfunction renderComment(userComment, escapeFn) {\n  // TODO: the comment must be passed through escapeFn before being embedded —\n  // rendering raw user input directly into HTML is exactly what causes XSS\n  return \'<div class="comment">\' + userComment + \'</div>\'\n}',
        tests: `
const html = renderComment('<b>hi</b>', escapeHtml)
assert html === '<div class="comment">&lt;b&gt;hi&lt;/b&gt;</div>'
`,
        solution: `function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function renderComment(userComment, escapeFn) {
  return '<div class="comment">' + escapeFn(userComment) + '</div>'
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `escapeAttribute(str)`: same as `escapeHtml`, but ALSO escape single quotes (`\'` → `&#39;`) — a common escaping gap, since an attribute value quoted with `\'` instead of `"` can still be broken out of if single quotes aren\'t escaped too.',
        starter: '',
        tests: `
assert escapeAttribute("' onmouseover='alert(1)") === '&#39; onmouseover=&#39;alert(1)'
`,
        solution: `function escapeAttribute(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}`,
      },
    ],
  },
]

export default challenges
