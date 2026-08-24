const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/product-card.tsx', 'utf8');

code = code.replace(
  /\{isAdding \? <Loader2 className="w-4 h-4 animate-spin" \/> : <ShoppingBag className="w-4 h-4" \/>\}\s*<span>\{isAdding \? "[^"]+" : addToCartText\}<\/span>/,
  `{isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{addToCartText}</span>
                  </>
                )}`
);

fs.writeFileSync('src/components/storefront/product-card.tsx', code);
console.log("Updated add to cart button in product card");
