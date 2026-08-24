const fs = require('fs');
let code = fs.readFileSync('src/app/(store)/search/search-client.tsx', 'utf8');

if (!code.includes('ProductGrid')) {
  code = code.replace(
    /import \{ ProductCard \} from "@\/components\/storefront\/product-card"/,
    'import { ProductGrid } from "@/components/storefront/product-grid"'
  );
} else {
  code = code.replace(
    /import \{ ProductCard \} from "@\/components\/storefront\/product-card"/,
    ''
  );
}

const replaceRegex = /<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">[\s\S]*?<\/div>/;

code = code.replace(replaceRegex, '<ProductGrid products={results} />');

fs.writeFileSync('src/app/(store)/search/search-client.tsx', code);
console.log("Updated search client");
