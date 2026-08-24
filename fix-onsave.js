const fs = require('fs');

let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

c = c.replace(/onSave\(buildSaveState\(/g, 'onSave(true, buildSaveState(');

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
console.log("Fixed onSave calls");
