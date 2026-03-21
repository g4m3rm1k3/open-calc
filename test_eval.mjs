function evaluateExpression(expr, rowObj) {
  if (!expr || !expr.trim()) return '';
  let js = expr.toUpperCase()
    .replace(/NOT/g, ' ! ')
    .replace(/~/g, ' ! ')
    .replace(/AND/g, ' && ')
    .replace(/&/g, ' && ')
    .replace(/OR/g, ' || ')
    .replace(/\|/g, ' || ')
    .replace(/IFF/g, ' === ')
    .replace(/<->/g, ' === ')
    .replace(/IMPLIES/g, ' <= ')
    .replace(/->/g, ' <= ');

  const keys = [...Object.keys(rowObj), 'T', 'F', 'TRUE', 'FALSE'];
  const vals = [...Object.values(rowObj), true, false, true, false];

  try {
    const fn = new Function(...keys, `return !!(${js});`);
    const result = fn(...vals);
    return result ? 'T' : 'F';
  } catch (e) {
    return 'Err (' + js + '): ' + e.message;
  }
}

const row = { P: true, Q: true };
console.log(evaluateExpression('P and Q', row));
console.log(evaluateExpression('~P', row));
console.log(evaluateExpression('(P and Q) -> ~P', row));
