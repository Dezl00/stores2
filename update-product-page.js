const fs = require('fs');
let code = fs.readFileSync('src/app/(store)/product/[slug]/page.tsx', 'utf8');

code = code.replace(
  /import \{ SimilarProductsCarousel \} from "@\/components\/storefront\/product\/similar-products-carousel"/,
  'import { ProductGrid } from "@/components/storefront/product-grid"'
);

code = code.replace(
  /<SimilarProductsCarousel products=\{relatedProducts\} \/>/,
  '<ProductGrid products={relatedProducts} />'
);

fs.writeFileSync('src/app/(store)/product/[slug]/page.tsx', code);
console.log("Updated product page to use ProductGrid for similar products");
