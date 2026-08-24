const fs = require('fs');

// 1. Update ProductGrid
let pgCode = fs.readFileSync('src/components/storefront/product-grid.tsx', 'utf8');
pgCode = pgCode.replace(/gap-4 sm:gap-6/g, 'gap-2 sm:gap-4');
fs.writeFileSync('src/components/storefront/product-grid.tsx', pgCode);

// 2. Update CategoryProductGrid gaps
let cpgCode = fs.readFileSync('src/components/storefront/category-product-grid.tsx', 'utf8');
cpgCode = cpgCode.replace(/gap-4 sm:gap-6/g, 'gap-2 sm:gap-4');
fs.writeFileSync('src/components/storefront/category-product-grid.tsx', cpgCode);

// 3. Update SimilarProductsCarousel gaps (wait, earlier I removed the gap completely from it, let's check)
// I replaced gap with -mx-2. Let's see what it has now.
let spcCode = fs.readFileSync('src/components/storefront/product/similar-products-carousel.tsx', 'utf8');
if (spcCode.includes('gap-4')) {
    spcCode = spcCode.replace(/gap-4 sm:gap-6/g, 'gap-2 sm:gap-4');
    fs.writeFileSync('src/components/storefront/product/similar-products-carousel.tsx', spcCode);
}

// 4. Update product-list-client container padding
let plcCode = fs.readFileSync('src/components/storefront/widgets/product-list-client.tsx', 'utf8');
plcCode = plcCode.replace(/container mx-auto px-4 sm:px-6 lg:px-8/g, 'container mx-auto px-2 sm:px-4 lg:px-6');
fs.writeFileSync('src/components/storefront/widgets/product-list-client.tsx', plcCode);

// 5. Update featured-products-client container padding and gaps
let fpcCode = fs.readFileSync('src/components/storefront/widgets/featured-products-client.tsx', 'utf8');
fpcCode = fpcCode.replace(/container mx-auto px-4 sm:px-6 lg:px-8/g, 'container mx-auto px-2 sm:px-4 lg:px-6');
fpcCode = fpcCode.replace(/gap-4 sm:gap-6/g, 'gap-2 sm:gap-4');
fs.writeFileSync('src/components/storefront/widgets/featured-products-client.tsx', fpcCode);

// 6. Same for PromoBentoGrid and CategoryGridClient if needed, but user just said "في الصفحة الرئيسية في الواجهة". I'll stick to ProductList and FeaturedProducts for now.

console.log("Updated gaps and margins");
