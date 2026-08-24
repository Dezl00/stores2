const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/widgets/product-list-client.tsx', 'utf8');

if (!code.includes('SimilarProductsCarousel')) {
  code = code.replace(
    /import \{ ChevronLeft \} from "lucide-react"/,
    'import { ChevronLeft } from "lucide-react"\nimport { SimilarProductsCarousel } from "@/components/storefront/product/similar-products-carousel"'
  );
  
  code = code.replace(
    /<ProductGrid products=\{products\} \/>/,
    `{widget.settings?.displayMode === 'carousel' ? (
          <div className="w-full">
            <SimilarProductsCarousel products={products} />
          </div>
        ) : (
          <ProductGrid products={products} />
        )}`
  );

  fs.writeFileSync('src/components/storefront/widgets/product-list-client.tsx', code);
  console.log("Restored carousel setting for product list");
}
