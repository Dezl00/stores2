const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

// Desktop logo
code = code.replace(
  /className=\{`h-16 md:h-20 w-auto object-contain transition-all duration-300 hover:scale-105 \$\{isTop \? "brightness-0 invert" : ""\}`\}/,
  'className={`h-16 md:h-20 w-auto object-contain transition-all duration-300 scale-125 lg:scale-150 origin-left hover:scale-[1.3] lg:hover:scale-[1.6] ${isTop ? "brightness-0 invert" : ""}`}'
);

// Mobile logo
code = code.replace(
  /className=\{`h-12 sm:h-14 w-auto object-contain transition-all duration-300 \$\{isTop \? "brightness-0 invert" : ""\}`\}/,
  'className={`h-12 sm:h-14 w-auto object-contain transition-all duration-300 scale-125 sm:scale-150 origin-center ${isTop ? "brightness-0 invert" : ""}`}'
);

fs.writeFileSync('src/components/storefront/header.tsx', code);
console.log("Updated header logo scale");
