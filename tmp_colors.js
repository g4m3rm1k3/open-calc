const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('c:/Users/g4m3r/Documents/testing tutorials/open-calc/src/components/viz');
const colors = {};
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Match fill="color", stroke="color", fill: 'color', stroke: 'color'
  const matches = content.match(/(?:fill|stroke)(?:=|:\s*)['"]([^'"]+)['"]/g);
  if (matches) {
    matches.forEach(m => {
      const col = m.split(/['"]/)[1];
      colors[col] = (colors[col] || 0) + 1;
    });
  }
});
const sorted = Object.entries(colors).sort((a,b) => b[1] - a[1]);
console.log(sorted.slice(0, 30));
