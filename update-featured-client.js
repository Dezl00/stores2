const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/featured-products-client.tsx', 'utf8');

if (!code.includes('ProductGrid')) {
  code = code.replace(
    /import \{ ProductCard \} from "@\/components\/storefront\/product-card"/,
    'import { ProductGrid } from "@/components/storefront/product-grid"'
  );
}

const replaceRegex = /<div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">[\s\S]*?<\/div>/;

code = code.replace(replaceRegex, '<ProductGrid products={products} />');

fs.writeFileSync('src/components/storefront/widgets/featured-products-client.tsx', code);
console.log("Updated FeaturedProductsClient");
