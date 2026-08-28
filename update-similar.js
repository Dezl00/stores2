const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product/similar-products-carousel.tsx', 'utf8');

if (!code.includes('import { ScrollReveal }')) {
  code = code.replace(
    'import { ProductCard } from "@/components/storefront/product-card"',
    'import { ProductCard } from "@/components/storefront/product-card"\nimport { ScrollReveal } from "@/components/ui/scroll-reveal"'
  );
}

// Map function signature
code = code.replace(
  /products\.map\(\(product\) => \(/,
  'products.map((product, index) => ('
);

// Wrapper
code = code.replace(
  /<div key=\{product\.id\} className=\{`\$\{getFlexBasis\(\)\} min-w-0 px-2 sm:px-3`\}>/,
  '<ScrollReveal key={product.id} variant="fade-up" delay={index * 0.1} className={`${getFlexBasis()} min-w-0 px-2 sm:px-3`}>'
);

code = code.replace(
  /<ProductCard product=\{product\} disableAnimation=\{true\} \/>\s*<\/div>/,
  '<ProductCard product={product} disableAnimation={true} />\n            </ScrollReveal>'
);

fs.writeFileSync('src/components/storefront/product/similar-products-carousel.tsx', code);
console.log("Updated similar products correctly");
