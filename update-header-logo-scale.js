const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

// Header heights
code = code.replace(
  /className="hidden md:flex h-20 items-center justify-between gap-6"/,
  'className="hidden md:flex h-16 items-center justify-between gap-6"'
);
code = code.replace(
  /className="flex md:hidden h-16 items-center justify-between w-full relative"/,
  'className="flex md:hidden h-14 items-center justify-between w-full relative"'
);
code = code.replace(
  /\{!isHomepage && <div className="h-16 md:h-20 shrink-0 w-full" \/>\}/,
  '{!isHomepage && <div className="h-14 md:h-16 shrink-0 w-full" />}'
);

// Logo size (scaling it up massively without breaking the container layout)
code = code.replace(
  /className=\{`h-16 md:h-20 w-auto object-contain transition-all duration-300 scale-125 lg:scale-150 origin-left hover:scale-\[1\.3\] lg:hover:scale-\[1\.6\] \$\{isTop \? "brightness-0 invert" : ""\}`\}/,
  'className={`h-16 w-auto object-contain transition-all duration-300 scale-[1.7] origin-left hover:scale-[1.8] ${isTop ? "brightness-0 invert" : ""}`}'
);

code = code.replace(
  /className=\{`h-12 sm:h-14 w-auto object-contain transition-all duration-300 scale-125 sm:scale-150 origin-center \$\{isTop \? "brightness-0 invert" : ""\}`\}/,
  'className={`h-12 w-auto object-contain transition-all duration-300 scale-[1.5] origin-center ${isTop ? "brightness-0 invert" : ""}`}'
);

fs.writeFileSync('src/components/storefront/header.tsx', code);
console.log("Updated header size and logo scale");
