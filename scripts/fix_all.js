import fs from 'fs';
import path from 'path';

const files = [
  '01-propositions-and-proof-techniques.js',
  '00-logic-puzzles.js'
];

for (const file of files) {
  const p = path.join('./src/content/discrete-math', file);
  let code = fs.readFileSync(p, 'utf8');

  // Strip math boundaries and apply unicode mappings
  code = code.replace(/\$\\\\\\\\neg\$|\$\\neg\$/g, '¬');
  code = code.replace(/\$\\\\\\\\sim\$|\$\\sim\$/g, '~');
  code = code.replace(/\$\\\\\\\\wedge\$|\$\\wedge\$/g, '∧');
  code = code.replace(/\$\\\\\\\\vee\$|\$\\vee\$/g, '∨');
  code = code.replace(/\$\\\\\\\\rightarrow\$|\$\\rightarrow\$/g, '→');
  code = code.replace(/\$\\\\\\\\leftrightarrow\$|\$\\leftrightarrow\$/g, '↔');
  code = code.replace(/\$\\\\\\\\oplus\$|\$\\oplus\$/g, '⊕');

  code = code.replace(/\$p \^ q\$/g, 'p ∧ q');
  code = code.replace(/\$\\neg\(p \\\\wedge q\) \\\\equiv \\\\neg p \\\\vee \\\\neg q\$/g, '¬(p ∧ q) ≡ ¬p ∨ ¬q');
  code = code.replace(/\$\\neg\(p \\\\vee q\) \\\\equiv \\\\neg p \\\\wedge \\\\neg q\$/g, '¬(p ∨ q) ≡ ¬p ∧ ¬q');

  code = code.replace(/T \$\\rightarrow\$ F/g, 'T → F');
  code = code.replace(/F \$\\rightarrow\$ T\/F/g, 'F → T/F');
  code = code.replace(/\$\\neg P\$/g, '¬P');
  code = code.replace(/\$\\sqrt\{2\}\$/g, '√2');

  code = code.replace(/\$k\$/g, 'k');
  code = code.replace(/\$n\$/g, 'n');
  code = code.replace(/\$k > n\$/g, 'k > n');
  code = code.replace(/\$\\\\\\\\lceil k \/ n \\\\\\\\rceil\$/g, '⌈ k / n ⌉');
  code = code.replace(/\$\\\\\\\\lceil \\\\\\\\dots \\\\\\\\rceil\$/g, '⌈ ... ⌉');

  fs.writeFileSync(p, code, 'utf8');
}
