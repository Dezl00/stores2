const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

// Replace desktop logo
code = code.replace(
  /<img src=\{themeConfig\.logoUrl\} alt="Store Logo" className="h-14 w-auto object-contain transition-transform hover:scale-105" \/>/,
  '<img src={themeConfig.logoUrl} alt="Store Logo" className={`h-16 md:h-20 w-auto object-contain transition-all duration-300 hover:scale-105 ${isTop ? "brightness-0 invert" : ""}`} fetchPriority="high" loading="eager" />'
);

// Replace mobile logo
code = code.replace(
  /<img src=\{themeConfig\.logoUrl\} alt="Store Logo" className="h-10 w-auto object-contain" \/>/,
  '<img src={themeConfig.logoUrl} alt="Store Logo" className={`h-12 sm:h-14 w-auto object-contain transition-all duration-300 ${isTop ? "brightness-0 invert" : ""}`} fetchPriority="high" loading="eager" />'
);

fs.writeFileSync('src/components/storefront/header.tsx', code);
console.log("Updated header logo");
