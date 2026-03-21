import fs from 'fs';
let code = fs.readFileSync('./src/content/discrete-math/01-propositions-and-proof-techniques.js', 'utf8');

// Replace standard variables
code = code.replace(/\$p\$/g, 'p');
code = code.replace(/\$q\$/g, 'q');
code = code.replace(/\$r\$/g, 'r');
code = code.replace(/\$S \\\\wedge C\$/g, 'S ∧ C');
code = code.replace(/\$\\neg\$/g, '¬');
code = code.replace(/\$\\sim\$/g, '~');
code = code.replace(/\$\\wedge\$/g, '∧');
code = code.replace(/\$\\vee\$/g, '∨');
code = code.replace(/\$\\rightarrow\$/g, '→');
code = code.replace(/\$\\leftrightarrow\$/g, '↔');
code = code.replace(/\$\\oplus\$/g, '⊕');

// Also handle the double escaped ones in tables
code = code.replace(/\$\\\\\\neg\$/g, '¬');
code = code.replace(/\$\\\\\\sim\$/g, '~');
code = code.replace(/\$\\\\\\wedge\$/g, '∧');
code = code.replace(/\$\\\\\\vee\$/g, '∨');
code = code.replace(/\$\\\\\\rightarrow\$/g, '→');
code = code.replace(/\$\\\\\\leftrightarrow\$/g, '↔');

// Replace equations
code = code.replace(/\$p \\\\rightarrow q\$/g, 'p → q');
code = code.replace(/\$q \\\\rightarrow p\$/g, 'q → p');
code = code.replace(/\$p \\\\vee q\$/g, 'p ∨ q');
code = code.replace(/\$p \\\\wedge q\$/g, 'p ∧ q');

code = code.replace(/\$p \\\\vee \\\\neg p\$/g, 'p ∨ ¬p');
code = code.replace(/\$p \\\\wedge \\\\neg p\$/g, 'p ∧ ¬p');
code = code.replace(/\$\\neg P\$/g, '¬P');
code = code.replace(/\$p \\\\leftrightarrow q\$/g, 'p ↔ q');
code = code.replace(/\$\\neg\(p \\\\wedge q\) \\\\equiv \\\\neg p \\\\vee \\\\neg q\$/g, '¬(p ∧ q) ≡ ¬p ∨ ¬q');
code = code.replace(/\$\\neg\(p \\\\vee q\) \\\\equiv \\\\neg p \\\\wedge \\\\neg q\$/g, '¬(p ∨ q) ≡ ¬p ∧ ¬q');

code = code.replace(/\$p \\\\implies q \\\\implies r\$/g, 'p → q → r');
code = code.replace(/\$n\$/g, 'n');
code = code.replace(/\$n\+1\$/g, 'n+1');
code = code.replace(/\$n=2k\$/g, 'n=2k');
code = code.replace(/\$n=2k\+1\$/g, 'n=2k+1');
code = code.replace(/\$x\^2\$/g, 'x²');
code = code.replace(/\$x\$/g, 'x');
code = code.replace(/\$p \\\\implies q\$/g, 'p → q');
code = code.replace(/\$\\neg q \\\\implies \\\\neg p\$/g, '¬q → ¬p');
code = code.replace(/\$\\sqrt\{2\}\$/g, '√2');
code = code.replace(/\$2k\$/g, '2k');
code = code.replace(/T \$\\rightarrow\$ F/g, 'T → F');
code = code.replace(/F \$\\rightarrow\$ T\/F/g, 'F → T/F');

fs.writeFileSync('./src/content/discrete-math/01-propositions-and-proof-techniques.js', code, 'utf8');
