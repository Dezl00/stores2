const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-sidebar.tsx', 'utf8');

code = code.replace(
  /<option key=\{font\.id\} value=\{font\.id\}>\{font\.name\}<\/option>/,
  '<option key={font.id} value={font.id} className={FONT_MAP[font.id]?.className}>{font.name} - {storeName || "اسم المتجر"}</option>'
);

fs.writeFileSync('src/app/builder/builder-sidebar.tsx', code);
console.log("Updated builder-sidebar.tsx to show store name in dropdown");
