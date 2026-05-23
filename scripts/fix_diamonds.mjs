import fs from 'fs';
import path from 'path';

let fixedCount = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('\uFFFD')) {
        // G predominantly represents a corrupted em-dash in prose.
        content = content.replace(/G\uFFFD\uFFFD/g, '—');
        
        // G often represents en-dash or minus
        content = content.replace(/G\uFFFD/g, '-');

        // - typically represented corrupted single symbols like \omega or \pi.
        content = content.replace(/-\uFFFD/g, '');
        
        // Any leftover diamonds should be removed to prevent UI rendering glitches
        content = content.replace(/\uFFFD/g, '');

        fs.writeFileSync(fullPath, content);
        fixedCount++;
        console.log(`Cleansed diamonds in: ${fullPath}`);
      }
    }
  }
}

walk('./src/content');
walk('./src/components');

console.log(`\nOperation Complete. Fixed diamond corruptions in ${fixedCount} files.`);
