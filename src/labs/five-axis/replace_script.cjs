const fs = require('fs');
const file = 'c:/Users/g4m3r/Documents/testing tutorials/open-calc/src/labs/five-axis/FiveAxisKinematics.jsx';
const replFile = 'c:/Users/g4m3r/Documents/testing tutorials/open-calc/src/labs/five-axis/replacement.jsx';
let content = fs.readFileSync(file, 'utf8');
const replacement = fs.readFileSync(replFile, 'utf8');

const startStr = "function MatDisplay({M,label,color='#4af'}) {";
const startIndex = content.indexOf(startStr);

if (startIndex === -1) {
  console.log('Could not find start index');
  process.exit(1);
}

const newContent = content.substring(0, startIndex) + replacement;
fs.writeFileSync(file, newContent, 'utf8');
console.log('Successfully updated FiveAxisKinematics.jsx');
