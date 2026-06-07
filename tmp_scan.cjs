const fs = require('fs');
const path = require('path');

function scanDir(dir, results) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath, results);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const issues = [];
      
      // Check for bg-white without dark:bg-something
      const classRegex = /className=["'`]((?:(?!\bdark:\b).)*?)["'`]/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        const classStr = match[1];
        if (classStr.includes('bg-white') && !classStr.includes('dark:bg-')) {
          issues.push(`bg-white without dark:bg- in class: ${classStr}`);
        }
        if (classStr.includes('text-black') && !classStr.includes('dark:text-')) {
          issues.push(`text-black without dark:text- in class: ${classStr}`);
        }
        if (classStr.match(/\bbg-gray-[0-9]+\b/) && !classStr.includes('dark:bg-')) {
          issues.push(`bg-gray without dark:bg- in class: ${classStr}`);
        }
        if (classStr.match(/\btext-gray-[0-9]+\b/) && !classStr.includes('dark:text-')) {
          issues.push(`text-gray without dark:text- in class: ${classStr}`);
        }
      }
      
      // Check for hardcoded SVG colors
      if (content.includes('stroke="black"') || content.includes("stroke='black'")) {
        issues.push('stroke="black"');
      }
      if (content.includes('fill="black"') || content.includes("fill='black'")) {
        issues.push('fill="black"');
      }

      if (issues.length > 0) {
        results.push({ file: fullPath, issues });
      }
    }
  }
}

const results = [];
scanDir(path.join(__dirname, 'src', 'components', 'viz'), results);

console.log(`Found issues in ${results.length} files:`);
for (const res of results) {
  console.log(`\nFile: ${res.file}`);
  res.issues.forEach(issue => console.log(`  - ${issue}`));
}
