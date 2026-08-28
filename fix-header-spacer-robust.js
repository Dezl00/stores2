const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

// Find the last occurrence of '</>'
const lastIndex = code.lastIndexOf('</>');
if (lastIndex !== -1) {
  code = code.substring(0, lastIndex) + '  {!isHomepage && <div className="h-16 md:h-20 shrink-0 w-full" />}\n    </>' + code.substring(lastIndex + 3);
  fs.writeFileSync('src/components/storefront/header.tsx', code);
  console.log("Spacer successfully added");
} else {
  console.log("Could not find fragment end");
}
