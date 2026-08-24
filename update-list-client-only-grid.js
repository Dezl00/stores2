const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/product-list-client.tsx', 'utf8');

code = code.replace(
  /import \{ SimilarProductsCarousel \} from "@\/components\/storefront\/product\/similar-products-carousel"\n/,
  ''
);

const replaceRegex = /\{widget\.settings\?\.displayMode !== "grid" \? \([\s\S]*?\)\}/;
code = code.replace(replaceRegex, '<ProductGrid products={products} />');

fs.writeFileSync('src/components/storefront/widgets/product-list-client.tsx', code);
console.log("Updated product-list-client to only use ProductGrid");
