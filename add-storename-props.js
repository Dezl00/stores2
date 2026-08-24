const fs = require('fs');
let code = fs.readFileSync('src/app/builder/builder-client.tsx', 'utf8');

if (!code.includes('storeName={themeConfig?.storeName}')) {
  code = code.replace(
    /setHeaderSettings=\{setHeaderSettings\}/,
    'setHeaderSettings={setHeaderSettings}\n              storeName={themeConfig?.storeName}'
  );
  fs.writeFileSync('src/app/builder/builder-client.tsx', code);
  console.log("Updated builder-client.tsx to pass storeName");
}
