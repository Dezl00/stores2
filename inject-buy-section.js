const fs = require('fs');
let code = fs.readFileSync('src/app/(store)/product/[slug]/page.tsx', 'utf8');

// Import ProductBuySection
code = code.replace(
  /import \{ AddToCartForm \} from "@\/components\/storefront\/add-to-cart-form"/,
  'import { ProductBuySection } from "@/components/storefront/product/product-buy-section"'
);

// Replace the static price display and AddToCartForm with ProductBuySection
// The original price block and AddToCartForm are around line:
/*
            <div className="flex flex-col gap-1 mt-4">
              <div className="flex items-center gap-3">
                 ... (price) ...
              </div>
            </div>
            
            <AddToCartForm product={product as any} />
*/
const regexReplace = /<div className="flex flex-col gap-1 mt-4">[\s\S]*?<AddToCartForm product=\{product as any\} \/>/;

const replacement = `<ProductBuySection product={product} options={product.options || []} variants={product.variants || []} />`;

code = code.replace(regexReplace, replacement);

fs.writeFileSync('src/app/(store)/product/[slug]/page.tsx', code);
console.log("Updated product page to use ProductBuySection");
