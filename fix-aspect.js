const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-card.tsx', 'utf8');

code = code.replace(
  /\? "aspect-\[4\/3\]" : "\$\{aspectClass\}"/,
  '? "aspect-[4/3]" : "aspect-square"'
);

fs.writeFileSync('src/components/storefront/product-card.tsx', code);
console.log("Fixed aspect-square bug");
