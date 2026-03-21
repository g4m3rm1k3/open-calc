import fs from 'fs';
import path from 'path';

const dirs = [
  'C:/Users/g4m3r/Documents/testing tutorials/open-calc/src/components/viz/d3',
  'C:/Users/g4m3r/Documents/testing tutorials/open-calc/src/components/viz/react'
];

let changedCount = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const regex = /viewBox=\{\`0 0 \$\{(\w+)\} \$\{(\w+)\}\`\}/g;
      
      if (regex.test(content)) {
        content = content.replace(regex, 'viewBox={"0 0 " + $1 + " " + $2}');
        fs.writeFileSync(fullPath, content);
        changedCount++;
        console.log("Fixed:", file);
      }
    }
  }
}

dirs.forEach(walk);
console.log("Total changed files:", changedCount);
