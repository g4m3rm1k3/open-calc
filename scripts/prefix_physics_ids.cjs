const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = 'src/content/physics-1';

walk(targetDir, (filePath) => {
  if (filePath.endsWith('.js') && !filePath.endsWith('index.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Prefix id: 'chX-XXX' with 'p1-'
    const newContent = content.replace(/id:\s*'ch(\d+)-(\d+)'/g, "id: 'p1-ch$1-$2'");
    if (newContent !== content) {
      console.log(`Updated ${filePath}`);
      fs.writeFileSync(filePath, newContent);
    }
  }
});
