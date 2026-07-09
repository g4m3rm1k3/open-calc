const fs = require('fs'); 
const file = 'src/utils/monacoThemes.js'; 
let content = fs.readFileSync(file, 'utf8'); 
content = content.replace(/"editor\.background":\s*"#[0-9a-fA-F]{6,8}"/g, '"editor.background": "#00000000"'); 
fs.writeFileSync(file, content);
