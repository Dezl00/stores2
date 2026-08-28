const fs = require('fs');
let code = fs.readFileSync('src/components/storefront/header.tsx', 'utf8');

code = code.replace(
  '      )}' + '\n' + '    </>' + '\n' + '  )' + '\n' + '}',
  '      )}' + '\n' + '      {!isHomepage && <div className="h-16 md:h-20 shrink-0 w-full" />}' + '\n' + '    </>' + '\n' + '  )' + '\n' + '}'
);

fs.writeFileSync('src/components/storefront/header.tsx', code);
console.log("Added spacer to header for non-homepage");
