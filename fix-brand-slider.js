const fs = require('fs');

const computeHrefInjection = `
  const computeHref = (item: any) => {
    if (item.redirectType === 'Product' || item.redirectType === 'product') return \`/product/\${item.redirectId}\`;
    if (item.redirectType === 'Category' || item.redirectType === 'category') return \`/category/\${item.redirectId}\`;
    if (item.redirectType === 'Page' || item.redirectType === 'page') return \`/pages/\${item.redirectId}\`;
    return item.buttonUrl || '#';
  };
`;

let brand = fs.readFileSync('src/components/storefront/widgets/brand-slider.tsx', 'utf8');
if (!brand.includes('computeHref')) {
  brand = brand.replace('export function BrandSlider({ widget }: { widget: any }) {', 'export function BrandSlider({ widget }: { widget: any }) {\n' + computeHrefInjection);
  brand = brand.replace(/getValidLink\(item\.buttonUrl\)/g, 'getValidLink(computeHref(item))');
  brand = brand.replace(/item\.buttonUrl \?/g, '(item.buttonUrl || item.redirectType) ?');
  fs.writeFileSync('src/components/storefront/widgets/brand-slider.tsx', brand, 'utf8');
}

console.log("Updated BrandSlider");
