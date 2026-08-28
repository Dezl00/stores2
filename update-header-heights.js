const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

// Header heights
code = code.replace(
  /className="hidden md:flex h-20 items-center justify-between gap-6"/,
  'className="hidden md:flex h-28 items-center justify-between gap-6"'
);
code = code.replace(
  /className="flex md:hidden h-16 items-center justify-between w-full relative"/,
  'className="flex md:hidden h-20 items-center justify-between w-full relative"'
);
code = code.replace(
  /\{!isHomepage && <div className="h-16 md:h-20 shrink-0 w-full" \/>\}/,
  '{!isHomepage && <div className="h-20 md:h-28 shrink-0 w-full" />}'
);

// Logo sizes
code = code.replace(
  /className=\{`h-16 md:h-20 w-auto object-contain transition-all duration-300 hover:scale-105 \$\{isTop \? "brightness-0 invert" : ""\}`\}/,
  'className={`h-20 md:h-24 max-w-[280px] w-auto object-contain transition-all duration-300 hover:scale-105 ${isTop ? "brightness-0 invert" : ""}`}'
);
code = code.replace(
  /className=\{`h-12 sm:h-14 w-auto object-contain transition-all duration-300 \$\{isTop \? "brightness-0 invert" : ""\}`\}/,
  'className={`h-14 sm:h-16 max-w-[200px] w-auto object-contain transition-all duration-300 ${isTop ? "brightness-0 invert" : ""}`}'
);

fs.writeFileSync('src/components/storefront/header.tsx', code);
console.log("Updated header layout heights and logo sizes");
