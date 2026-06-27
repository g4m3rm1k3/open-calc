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
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
const colors = new Set();
const pattern = /(?:text|bg|border|ring|fill|stroke)-(slate|sky|indigo|emerald|rose|amber|violet|gray)-(\d+)/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = pattern.exec(content)) !== null) {
    colors.add(`${match[1]}-${match[2]}`);
  }
});

const sorted = Array.from(colors).sort();
console.log(sorted.join('\n'));
