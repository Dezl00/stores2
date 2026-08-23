const fs = require('fs');

function updateAll(file) {
  let c = fs.readFileSync(file, 'utf8');
  let original = c;
  
  c = c.split('className="container mx-auto px-4 sm:px-6 lg:px-8"').join('className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"');
  c = c.split('className="container mx-auto px-4 sm:px-6 lg:px-8 py-6"').join('className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"');
  c = c.split('className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"').join('className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"');
  
  if (c !== original) {
    fs.writeFileSync(file, c, 'utf8');
    console.log('Updated ' + file);
  }
}

updateAll('src/components/storefront/widgets/about-us.tsx');
updateAll('src/components/storefront/widgets/featured-product.tsx');
updateAll('src/components/storefront/widgets/text-block.tsx');
updateAll('src/components/storefront/widgets/latest-articles.tsx');
updateAll('src/components/storefront/widgets/hero-slider.tsx');
updateAll('src/components/storefront/widgets/category-grid-client.tsx');
