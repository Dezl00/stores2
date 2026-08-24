const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-card.tsx', 'utf8');

code = code.replace(
  /className="group\/card relative rounded-2xl bg-card p-4 transition-shadow duration-300/g,
  'className="group/card relative rounded-2xl bg-card p-2 sm:p-3 transition-shadow duration-300'
);

// We should also check if absolute badges need adjustment if padding is smaller
code = code.replace(
  /className="absolute top-6 right-6 z-10 flex flex-col gap-2"/g,
  'className="absolute top-4 right-4 z-10 flex flex-col gap-2"'
);

fs.writeFileSync('src/components/storefront/product-card.tsx', code);
console.log("Updated product card inner padding and badges position");
