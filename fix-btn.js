const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-card.tsx', 'utf8');
code = code.replace(
  /className=\{\`w-full flex items-center justify-center gap-2 py-2\.5 rounded-xl font-bold transition-transform hover:scale-\[1\.02\] active:scale-\[0\.98\] \$\{addToCartStyle === 'outline' \? 'border-2' : ''\}\`\}/,
  'className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-none font-normal transition-transform hover:scale-[1.02] active:scale-[0.98] ${addToCartStyle === \\'outline\\' ? \\'border-2\\' : \\'\\'}`}'
);
fs.writeFileSync('src/components/storefront/product-card.tsx', code);
console.log("Fixed button styles");
