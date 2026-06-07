const fs = require('fs');
const file = 'src/components/viz/cad/CadPro2.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('sketchDrawing:false,sketchPts:[{x:pt.x,y:pt.y}],sketchDrawing:true', 'sketchPts:[{x:pt.x,y:pt.y}],sketchDrawing:true');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax error in CadPro2.jsx');
