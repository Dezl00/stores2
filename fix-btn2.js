const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-card.tsx', 'utf8');

code = code.replace(
  "rounded-xl font-bold transition-transform hover:scale-[1.02]",
  "rounded-none font-normal transition-transform hover:scale-[1.02]"
);

fs.writeFileSync('src/components/storefront/product-card.tsx', code);
console.log("Fixed button styles");
