const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product/similar-products-carousel.tsx', 'utf8');

// Remove ScrollReveal import
code = code.replace(/import \{ ScrollReveal \} from "@\/components\/ui\/scroll-reveal"\r?\n/, '');

// Remove ScrollReveal wrapper around ProductCard
code = code.replace(
  /<ScrollReveal key=\{product\.id\} variant="fade-up" delay=\{index \* 0\.1\} className=\{`\$\{getFlexBasis\(\)\} min-w-0 px-2 sm:px-3`\}>\s*<ProductCard product=\{product\} disableAnimation=\{true\} \/>\s*<\/ScrollReveal>/g,
  '<div key={product.id} className={`${getFlexBasis()} min-w-0 px-2 sm:px-3`}>\n              <ProductCard product={product} disableAnimation={true} />\n            </div>'
);

fs.writeFileSync('src/components/storefront/product/similar-products-carousel.tsx', code);
console.log("Removed ScrollReveal from SimilarProductsCarousel");
