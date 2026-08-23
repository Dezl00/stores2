const fs = require('fs');

function computeLinkReplacer(content) {
  // Replace references to just buttonUrl with a computed URL logic where needed
  return content;
}

// 1. Fix Marquee Alerts
let marquee = fs.readFileSync('src/components/storefront/widgets/marquee-alerts.tsx', 'utf8');
marquee = marquee.replace(/if \(item\.redirectType === 'Product'\) href = `\/product\/\$\{item\.redirectId\}`;\s*else if \(item\.redirectType === 'Category'\) href = `\/category\/\$\{item\.redirectId\}`;/g,
  `if (item.redirectType === 'Product' || item.redirectType === 'product') href = \`/product/\${item.redirectId}\`;
   else if (item.redirectType === 'Category' || item.redirectType === 'category') href = \`/category/\${item.redirectId}\`;
   else if (item.redirectType === 'Page' || item.redirectType === 'page') href = \`/pages/\${item.redirectId}\`;`
);
fs.writeFileSync('src/components/storefront/widgets/marquee-alerts.tsx', marquee, 'utf8');

// 2. Fix Promo Bento Grid
let bento = fs.readFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', 'utf8');
bento = bento.replace(/if \(redirectType === 'Product'\) href = `\/product\/\$\{redirectId\}`;\s*else if \(redirectType === 'Category'\) href = `\/category\/\$\{redirectId\}`;\s*else if \(redirectType === 'Page'\) href = `\/pages\/\$\{redirectId\}`;/g,
  `if (redirectType === 'Product' || redirectType === 'product') href = \`/product/\${redirectId}\`;
   else if (redirectType === 'Category' || redirectType === 'category') href = \`/category/\${redirectId}\`;
   else if (redirectType === 'Page' || redirectType === 'page') href = \`/pages/\${redirectId}\`;`
);
fs.writeFileSync('src/components/storefront/widgets/promo-bento-grid.tsx', bento, 'utf8');

// 3. Fix Hero Slider
let hero = fs.readFileSync('src/components/storefront/widgets/hero-slider.tsx', 'utf8');
// We need to inject the computed link.
// Search for: getValidLink(slide.buttonUrl)
// Replace with getValidLink(computeHref(slide))
const computeHrefInjection = `
  const computeHref = (slide: any) => {
    if (slide.redirectType === 'Product' || slide.redirectType === 'product') return \`/product/\${slide.redirectId}\`;
    if (slide.redirectType === 'Category' || slide.redirectType === 'category') return \`/category/\${slide.redirectId}\`;
    if (slide.redirectType === 'Page' || slide.redirectType === 'page') return \`/pages/\${slide.redirectId}\`;
    return slide.buttonUrl || '#';
  };
`;
if (!hero.includes('computeHref')) {
  hero = hero.replace('export function HeroSlider({ widget }: { widget: any }) {', 'export function HeroSlider({ widget }: { widget: any }) {\n' + computeHrefInjection);
  hero = hero.replace(/getValidLink\(slide\.buttonUrl\)/g, 'getValidLink(computeHref(slide))');
  // Also we need to render the button if there is ANY link, not just buttonUrl
  hero = hero.replace(/\{slide\.buttonUrl && \(/g, '{(slide.buttonUrl || slide.redirectType) && (');
  fs.writeFileSync('src/components/storefront/widgets/hero-slider.tsx', hero, 'utf8');
}

console.log("Updated storefront widgets for routing.");
