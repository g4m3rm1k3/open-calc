const fs = require('fs');
const path = require('path');

function scanDir(dir, files) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath, files);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
}

const files = [];
scanDir(path.join(__dirname, 'src', 'components', 'viz'), files);

const issues = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find forced dark classes (not preceded by dark:)
  const forcedDarkClasses = ['bg-slate-900', 'bg-slate-950', 'bg-slate-800', 'text-slate-300', 'text-slate-400'];
  let fileHasForcedDark = false;

  for (const cls of forcedDarkClasses) {
    const regex = new RegExp(`(?<!dark:)\\b${cls}(?![\\/\\-]| dark:bg| dark:text)`, 'g');
    if (regex.test(content)) {
      fileHasForcedDark = true;
      break;
    }
  }
  
  if (fileHasForcedDark && !file.includes('GitLab') && !file.includes('GitWorkspace')) {
    issues.push(file.replace(__dirname, ''));
  }
}

console.log(`Found ${issues.length} files with forced dark mode:`);
console.log(issues.join('\n'));
