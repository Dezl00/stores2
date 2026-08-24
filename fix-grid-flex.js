const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');
code = code.replace(
  /\[&>div\]:min-w-\[75vw\]/,
  '[&>div]:min-w-[75vw] [&>div]:shrink-0'
);
fs.writeFileSync('src/components/storefront/product-grid.tsx', code);
console.log("Fixed grid flex");
