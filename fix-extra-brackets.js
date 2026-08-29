const fs = require('fs');
let code = fs.readFileSync('src/features/products/actions.ts', 'utf8');

code = code.replace(
  /\n      \}\n    \}\)\n\n    revalidatePath\("\/admin\/products"\)/,
  '\n    revalidatePath("/admin/products")'
);

fs.writeFileSync('src/features/products/actions.ts', code);
console.log("Fixed extra brackets");
