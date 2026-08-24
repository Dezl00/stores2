const fs = require('fs');

const filesToUpdate = [
  'src/app/(store)/category/[slug]/page.tsx',
  'src/app/(store)/brand/[slug]/page.tsx',
  'src/app/(store)/products/page.tsx',
  'src/app/(store)/search/search-client.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace import
    code = code.replace(
      /import \{ ProductGrid \} from "@\/components\/storefront\/product-grid"/,
      'import { CategoryProductGrid } from "@/components/storefront/category-product-grid"'
    );
    
    // Replace component usage
    code = code.replace(/<ProductGrid /g, '<CategoryProductGrid ');
    
    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  }
});
