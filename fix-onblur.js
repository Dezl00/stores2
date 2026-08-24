const fs = require('fs');

let c = fs.readFileSync('src/app/builder/settings-panel.tsx', 'utf8');

c = c.replace(/onBlur=\{\(\) \=\> onSave\(buildSaveState\(\)\)\}/g, 'onBlur={() => onSave(true, buildSaveState())}');
c = c.replace(/onSave\(true, true, buildSaveState\(/g, 'onSave(true, buildSaveState(');

fs.writeFileSync('src/app/builder/settings-panel.tsx', c, 'utf8');
console.log("Fixed onBlur calls");
