const fs = require('fs');
let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

c = c.replace('</div>>', '</div>');
fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
console.log("Fixed extra >");
