const fs = require('fs');

function update(file, from, to) {
  try {
    let c = fs.readFileSync(file, 'utf8');
    if (c.includes(from)) {
      c = c.replace(from, to);
      fs.writeFileSync(file, c, 'utf8');
      console.log('Updated ' + file);
    }
  } catch (e) {
    console.error(e.message);
  }
}

update('src/components/storefront/widgets/about-us.tsx', 'className="container mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"', 'className="container mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden py-12"');
update('src/components/storefront/widgets/featured-product.tsx', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-6"', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"');
update('src/components/storefront/widgets/text-block.tsx', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-6"', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"');
update('src/components/storefront/widgets/latest-articles.tsx', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-6"', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"');
update('src/components/storefront/widgets/hero-slider.tsx', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-6"', 'className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"');
