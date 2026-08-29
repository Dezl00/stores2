const fs = require('fs');
let code = fs.readFileSync('src/features/products/actions.ts', 'utf8');

code = code.replace(
  /\n    \/\/ Process Options & Variants/,
  '\n      }\n    })\n\n    // Process Options & Variants'
);

fs.writeFileSync('src/features/products/actions.ts', code);
console.log("Fixed missing closing brackets in actions.ts");
