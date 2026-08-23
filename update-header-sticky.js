const fs = require('fs');
let content = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

// Replace fixed with sticky
content = content.replace(
  /<header className="fixed top-0 left-0 right-0 z-\[100\]/g,
  '<header className="sticky top-0 left-0 right-0 z-[100]'
);

fs.writeFileSync('src/components/storefront/header.tsx', content, 'utf8');
console.log("Updated header to use sticky instead of fixed.");
