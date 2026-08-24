const fs = require('fs');

let c = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

c = c.replace('if (currentY < 80) {', 'if (currentY <= 0) {');
c = c.replace('className={`fixed top-0 left-0 right-0 z-[100] w-full border-b transition-all duration-300 ease-out ${headerBg} ${headerTransform}`}', 
              'className={`${isTop ? \'absolute\' : \'fixed top-0\'} left-0 right-0 z-[100] w-full border-b transition-all duration-300 ease-out ${headerBg} ${headerTransform}`}');

fs.writeFileSync('src/components/storefront/header.tsx', c, 'utf8');
console.log("Updated header.tsx");
