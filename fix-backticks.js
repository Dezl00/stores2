const fs = require('fs');
let code = fs.readFileSync('src/features/products/options-actions.ts', 'utf8');

code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/features/products/options-actions.ts', code);
console.log("Fixed backticks in options-actions.ts");
